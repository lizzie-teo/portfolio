#!/usr/bin/env node
/**
 * Re-encode a raw-shipped asset and prove it is undamaged before writing it.
 *
 *   node scripts/shrink-asset.mjs public/assets/**\/*.mp4          # dry run
 *   node scripts/shrink-asset.mjs --blend public/assets/x.mp4      # + blend gate
 *   node scripts/shrink-asset.mjs --blend --write public/assets/x.mp4
 *
 * Read `.docs/asset-weight.md` first. The short version:
 *
 *   - Only raw-shipped assets are worth this (`<video>`, `poster=`,
 *     `unoptimized`, plain `<img>`). Anything through `next/image` is already
 *     resized per request — shrinking the source moves nothing for visitors.
 *   - The lever is BITRATE, not dimensions. Never downscale, never regenerate.
 *   - Never point this at a master. It overwrites in place under --write.
 *
 * Three gates, all of which must pass or nothing is written:
 *
 *   content   SSIM >= 0.99 against the original.
 *   frames    the encode has exactly as many frames as the source. SSIM cannot
 *             catch this on its own — ffmpeg's ssim filter pairs frames by
 *             timestamp, so a re-encode that silently resamples a VFR capture
 *             down still scores ~0.999 on whatever survived.
 *   blend     (--blend, for the mix-blend-mode:lighten recipe in
 *             .docs/video-blend.md) no "open-field" pixel lifted more than
 *             3/255 above the backdrop token.
 *
 * On the 3/255 threshold: it is NOT slack. Near-lossless CRF 18 produces the
 * same 2/255 residue as CRF 23 — it is the yuv420p round-trip floor (chroma
 * subsampling + 8-bit quantisation), not compression damage. A zero-tolerance
 * gate fails a near-lossless encode, which means the gate is wrong. Gate on
 * amplitude, never on count. See .docs/asset-weight.md §3.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const CRF_DEFAULT = 23;
const MAX_LIFT = 3;      // /255 above backdrop, open field. See header.
const MIN_SSIM_DEFAULT = 0.99;
const FIELD_RADIUS = 10; // px from real glow before a lifted pixel counts as "open field"

const argv = process.argv.slice(2);
const BLEND = argv.includes("--blend");
const WRITE = argv.includes("--write");
const FILES = argv.filter((a) => !a.startsWith("--"));

/* --min-ssim=<n> LOWERS THE CONTENT BAR, and it is only ever correct when a
   CONTROL says the bar itself is wrong for this footage (.docs/asset-weight.md
   §3). Some sources carry high-frequency texture the encoder cannot preserve at
   any useful bitrate — /world's engraved legs print paper grain into every
   frame, and a NEAR-LOSSLESS CRF 18 control scores 0.9899 there while coming out
   LARGER than the source. A gate that fails near-lossless is measuring the
   content, not the damage.

   So the rule is unchanged: run the control first, and set this to the floor the
   control establishes — never to whatever number happens to make the encode
   pass. It rides on the command line rather than living in this file so the
   override is visible in the shell history that produced the asset. */
const ssimArg = argv.find((a) => a.startsWith("--min-ssim="));
const MIN_SSIM = ssimArg ? Number(ssimArg.split("=")[1]) : MIN_SSIM_DEFAULT;

/* --gop=<n> SETS THE KEYFRAME INTERVAL, and it exists for SCRUBBED video —
   clips whose currentTime is driven by scroll rather than played (/world). x264
   defaults to a ~250-frame GOP, which is right for playback and wrong for
   scrubbing: with one keyframe in a 121-frame clip, every other frame is a
   delta frame and a seek to an arbitrary time cannot be served without decoding
   the whole run up to it. The browser snaps to what it can decode cheaply
   instead, and the scrub reads as jagged — frames stepping rather than the
   camera moving. scrub-engine.js's own header says `-g 8` for the master and
   `-g 4` for the mobile tier, but that is the VENDORED engine's requirement,
   not this project's: /world decodes its legs through WebCodecs and
   `world/film/mp4-intra.ts` returns null for anything with a delta frame, so
   a /world leg needs `--gop=1` (all-intra). A `-g 8` re-encode of a leg would
   not error — the page silently drops to its jagged path.

   It is not free, but it is cheap on this material: on /world's line art, -g 8
   costs ~5% in bytes and -g 1 (every frame a keyframe, the smoothest possible
   seek) about 28%. Do NOT set this on ordinary playback video — there it buys
   nothing and costs weight on every visitor; the `-hero.mp4` playback
   derivatives exist precisely so the all-intra masters never have to be
   played. */
/* --crf=<n> TRADES THE OTHER WAY. The default 23 is a weight setting and it is
   right for most of the site. It is wrong wherever the footage IS the work and
   is looked at closely — /world's flight is a full-bleed engraving the reader
   scrubs by hand, and at 23 the fine hatching mushes in motion in a way still
   crops do not reveal. Lower is better quality and more bytes: on that footage
   23 scores SSIM 0.984 against the master and 18 scores 0.998, for about 40%
   more weight. Set it low enough that the DEFAULT 0.99 gate passes without
   `--min-ssim` — if you find yourself reaching for both flags at once, you are
   lowering the bar to fit a number you chose, which is backwards. */
const crfArg = argv.find((a) => a.startsWith("--crf="));
const CRF = crfArg ? Number(crfArg.split("=")[1]) : CRF_DEFAULT;
if (crfArg && (!Number.isInteger(CRF) || CRF < 0 || CRF > 51)) {
  console.error("--crf must be an integer 0-51");
  process.exit(1);
}

const gopArg = argv.find((a) => a.startsWith("--gop="));
const GOP = gopArg ? Number(gopArg.split("=")[1]) : null;
if (gopArg && (!Number.isInteger(GOP) || GOP < 1)) {
  console.error("--gop must be a positive integer");
  process.exit(1);
}

if (!FILES.length || !Number.isFinite(MIN_SSIM)) {
  console.error("usage: node scripts/shrink-asset.mjs [--blend] [--write] [--min-ssim=<n>] <files…>");
  process.exit(1);
}
if (ssimArg) console.warn(`  note: content bar lowered to SSIM ${MIN_SSIM} — you ran the CRF 18 control, right?`);

const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const kb = (p) => Math.round(statSync(p).size / 1024);

/* --grout, the backdrop the lighten recipe clamps against. It is the WORST case
   for headroom: --secondary appears only mid-crossfade and, being lighter,
   clamps more of the field. Keep in sync with theme.css. */
function oklchToSrgb(L, C, Hdeg) {
  const H = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  });
}
const GROUT = oklchToSrgb(0.205, 0.0065, 67.5);

/* Frames are selected BY INDEX, not by `-ss` timestamp: re-encoding moves
   keyframes, so seeking by time can silently compare two different frames. */
const grab = (src, n, out) =>
  sh("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", `select=eq(n\\,${n})`,
    "-vsync", "0", "-frames:v", "1", out]);

const frameCount = (p) =>
  parseInt(sh("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames",
    "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", p]).trim(), 10);

/**
 * The only measurement that matters for a blended clip.
 *
 * `lighten` keeps the brighter of footage and backdrop per channel, so every
 * footage pixel darker than the backdrop clamps to exactly the surface colour
 * and the rectangle vanishes. Compression can only break that by lifting a dark
 * pixel ABOVE the backdrop. But a lift right beside a glowing line is invisible
 * (it sits against content already blazing) — only lifts out in the open field,
 * far from any glow, would read as mud. So: distance-transform from the content
 * mask, and judge only what is >FIELD_RADIUS away.
 */
async function openFieldLift(origPng, encPng) {
  const O = await sharp(origPng).raw().toBuffer({ resolveWithObject: true });
  const E = await sharp(encPng).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = O.info;
  const vis = (b, i) => b[i * ch] > GROUT[0] || b[i * ch + 1] > GROUT[1] || b[i * ch + 2] > GROUT[2];

  const content = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) content[i] = vis(O.data, i) ? 1 : 0;

  // two-pass chamfer distance transform from the glow
  const d = new Float64Array(W * H).fill(1e6);
  for (let i = 0; i < W * H; i++) if (content[i]) d[i] = 0;
  const rx = (i, j, w) => { if (d[j] + w < d[i]) d[i] = d[j] + w; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (y > 0) rx(i, i - W, 1);
    if (x > 0) rx(i, i - 1, 1);
    if (y > 0 && x > 0) rx(i, i - W - 1, 1.414);
    if (y > 0 && x < W - 1) rx(i, i - W + 1, 1.414);
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x;
    if (y < H - 1) rx(i, i + W, 1);
    if (x < W - 1) rx(i, i + 1, 1);
    if (y < H - 1 && x < W - 1) rx(i, i + W + 1, 1.414);
    if (y < H - 1 && x > 0) rx(i, i + W - 1, 1.414);
  }

  let count = 0, worst = 0;
  for (let i = 0; i < W * H; i++) {
    if (content[i] || d[i] <= FIELD_RADIUS) continue;
    if (!vis(E.data, i)) continue;
    let lift = 0;
    for (let c = 0; c < 3; c++) lift = Math.max(lift, E.data[i * ch + c] - GROUT[c]);
    count++; worst = Math.max(worst, lift);
  }
  return { count, worst };
}

function ssim(orig, enc) {
  const out = execFileSync("ffmpeg", ["-v", "error", "-i", enc, "-i", orig,
    "-lavfi", "ssim=-", "-f", "null", "-"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const m = out.match(/All:([\d.]+)/);
  return m ? parseFloat(m[1]) : NaN;
}

const tmp = mkdtempSync(join(tmpdir(), "shrink-"));
let totalBefore = 0, totalAfter = 0, anyFail = false;

for (const file of FILES) {
  if (!existsSync(file)) { console.error(`  missing: ${file}`); anyFail = true; continue; }
  const ext = extname(file).toLowerCase();
  const isVideo = ext === ".mp4";
  const out = join(tmp, basename(file, ext) + (isVideo ? ".mp4" : ".webp"));

  if (isVideo) {
    const audio = sh("ffprobe", ["-v", "error", "-select_streams", "a",
      "-show_entries", "stream=codec_name", "-of", "csv=p=0", file]).trim();
    if (audio) console.warn(`  note: ${basename(file)} HAS audio — -an will strip it`);
    /* -fps_mode passthrough keeps the SOURCE timestamps. Without it ffmpeg
       encodes at the input's AVERAGE frame rate, which is the wrong number for
       a screen recording: long still stretches drag the average far below the
       rate the motion was actually captured at, so the moving passages get
       resampled DOWN. A 60fps prototype capture with enough idle time averages
       ~35fps and silently lost 1292 of its 3700 frames this way — and the SSIM
       gate could not see it, because ffmpeg's ssim filter pairs frames by
       timestamp, so it compared the frames that survived and reported 0.9985.
       Passthrough is not a quality/size trade: on that clip it was smaller
       (6388KB vs 6553KB) AND scored better (0.9989), because the dropped frames
       were near-duplicates that cost almost nothing to keep, while resampling
       forces motion to be re-rendered at timestamps it was never sampled at.
       On a genuinely constant-rate source this flag is a no-op. */
    /* -sc_threshold 0 alongside -g/-keyint_min, or x264 keeps its own scene-cut
       keyframes and places the rest wherever it likes — which on a slow camera
       move through flat line art means almost nowhere, and the interval you
       asked for is not the interval you get. */
    const gopArgs = GOP
      ? ["-g", String(GOP), "-keyint_min", String(GOP), "-sc_threshold", "0"]
      : [];
    sh("ffmpeg", ["-v", "error", "-y", "-i", file, "-c:v", "libx264", "-crf", String(CRF),
      "-preset", "slow", "-pix_fmt", "yuv420p", "-an", "-fps_mode", "passthrough",
      ...gopArgs, "-movflags", "+faststart", out]);
  } else {
    await sharp(file).webp({ quality: 80 }).toFile(out);
  }

  const before = kb(file), after = kb(out);
  totalBefore += before; totalAfter += after;

  const gates = [];
  if (isVideo) {
    const s = ssim(file, out);
    gates.push({ name: "ssim", ok: s >= MIN_SSIM, detail: s.toFixed(4) });
    /* Frame count, which SSIM cannot stand in for: ffmpeg's ssim filter pairs
       frames by timestamp, so a re-encode that DROPS frames still scores well
       on the ones it kept. Checklist item 6 in .docs/asset-weight.md asks for
       this by hand; a gate the tool runs is what makes it true every time. */
    const fIn = frameCount(file), fOut = frameCount(out);
    gates.push({ name: "frames", ok: fOut === fIn, detail: `${fOut}/${fIn}` });
  }
  if (BLEND) {
    let count = 0, worst = 0;
    if (isVideo) {
      const total = frameCount(file);
      for (const p of [0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
        const n = Math.min(total - 1, Math.floor(p * total));
        const o = join(tmp, "o.png"), e = join(tmp, "e.png");
        grab(file, n, o); grab(out, n, e);
        const r = await openFieldLift(o, e);
        count += r.count; worst = Math.max(worst, r.worst);
      }
    } else {
      const r = await openFieldLift(file, out);
      count = r.count; worst = r.worst;
    }
    gates.push({ name: "blend", ok: worst <= MAX_LIFT, detail: `${count}px, worst lift ${worst}/255` });
  }

  const pass = gates.every((g) => g.ok);
  if (!pass) anyFail = true;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${basename(file).padEnd(28)} ${String(before).padStart(5)}KB -> ${String(after).padStart(5)}KB` +
    `  (-${(((before - after) / before) * 100).toFixed(0)}%)   ${gates.map((g) => `${g.name} ${g.detail}${g.ok ? "" : " <-- FAILED"}`).join("   ")}`
  );

  if (pass && WRITE) {
    // NOTE: overwrites in place. Never point --write at a master; see §4.
    const dest = isVideo ? file : file.replace(/\.(jpe?g|png)$/i, ".webp");
    copyFileSync(out, dest);
    console.log(`      wrote ${dest}`);
  }
}

rmSync(tmp, { recursive: true, force: true });

console.log(`\ntotal ${totalBefore}KB -> ${totalAfter}KB  (saved ${totalBefore - totalAfter}KB, ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);
if (!WRITE) console.log("dry run — nothing written. Re-run with --write to install.");
if (anyFail) {
  console.log("\nSomething failed its gate. Before believing it, get a CONTROL:");
  console.log("  re-encode at --crf 18 (near-lossless). If the same 'damage' appears there,");
  console.log("  the gate is wrong, not the asset. See .docs/asset-weight.md §3.");
  process.exit(1);
}
