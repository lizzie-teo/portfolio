# Asset weight — what to do whenever you add or replace a video or image

Generated clips and exported stills arrive far heavier than they need to be,
and the obvious fixes are mostly the wrong ones. This is the recipe for taking
the weight out without damaging the work. Extracted from the 2026-07-17 sweep
that cut raw-shipped bytes 23.1MB → 10.2MB with no dimension changed.

The whole doc reduces to four ideas: **only raw-shipped assets matter**, **the
lever is bitrate, not dimensions**, **never measure without a control**, and
**never touch a master**.

## 1. First ask: does this asset ship raw?

This decides whether there is any work to do at all.

- **Goes through `next/image`** — the optimizer generates resized variants per
  request. The source file's weight never reaches a visitor. Shrinking it buys
  repo size and build time, nothing else.
- **Ships raw, byte for byte, to every visitor**:
  - `<video src>` — always
  - `<video poster>` — the poster attribute bypasses the optimizer entirely
  - `next/image` with `unoptimized` (e.g. `Chapter.tsx`'s `LeafPlate`)
  - any plain `<img>` tag

Only the second list is worth optimizing. In the July sweep the entire
raw-shipped image set was ~1MB against 51 optimizer-served webps — so "let's
compress the images" would have looked productive and moved nothing. Check
which list an asset is on before spending any effort on it.

## 2. Video: the lever is bitrate, not dimensions

Generator exports (Figma Weave, Seedance) carry absurd bitrates. The July set
was 0.8–8.8 Mbps for clips of *identical* dimensions and duration — one 7s
960×960 clip was 7.5MB while another was 720KB. That spread is export settings,
not content.

So:

- **Do not downscale to save bytes.** 960×960 is correct for a square cover on
  a retina display. Dimensions are almost never the problem.
- **Do not regenerate the clip smaller.** Generation is non-deterministic — you
  will get *different footage*, losing whatever you art-directed, and the new
  clip is still compressed. It trades your work for nothing.
- **Re-encode.** Same frames, same dimensions, a fraction of the bytes.

```sh
ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow \
  -pix_fmt yuv420p -an -movflags +faststart out.mp4
```

`-an` because every clip on this site is `muted` — check first, but they have
never had audio streams. `+faststart` puts the moov atom up front so playback
can begin before the file finishes downloading. CRF 23 landed 41–62% cuts at
SSIM 0.993–0.998 (0.99 is the visually-transparent bar).

For posters, prefer **WebP q80** over JPEG: it is smaller *and* cleaner, because
WebP is 4:4:4 and skips the chroma subsampling that gives yuv420p video its
noise floor. Update the `poster=` path when you switch format.

## 3. Verify — and never verify without a control

Every gate below produced a **false alarm** the first time it ran, because it
had no baseline. This is the single most important section of this doc.

Three real examples from the July sweep:

1. A whole-frame diff reported deltas of 40–69/255 and looked alarming. All of
   it was in the *bright glowing content*, where compression noise is invisible
   on moving footage. **Control:** count only pixels lifted above the backdrop
   more than 10px from any glow. Result: zero.
2. A `mud === 0` gate failed all six blend clips at lifts of 1–3/255.
   **Control:** encode at near-lossless CRF 18 — it produces the *same* 2/255.
   The residue is the yuv420p round-trip floor, not compression damage. A gate
   that fails a near-lossless encode is broken. Gate on **amplitude** (≤3/255),
   never on count.
3. A downscaled alpha plate showed border alpha 164, read as the knockout
   breaking. **Control:** the *source* border is already 249 — the drawing
   touches the edge. Corners (0 in both) are the real invariant.

Before believing any measurement says an asset is damaged, run the same
measurement against something known-good — the source, or a near-lossless
encode. If the "damage" appears there too, the gate is wrong, not the asset.

### The two gates

- **Content quality (all footage):** SSIM ≥ 0.99 against the original.
  ```sh
  ffmpeg -i out.mp4 -i in.mp4 -lavfi ssim=- -f null -
  ```
- **Open-field mud (blend-composited clips only):** for footage placed with the
  `mix-blend-mode: lighten` recipe (see `video-blend.md`), the invariant is that
  every "empty" pixel stays *below* the backdrop token so `lighten` clamps it to
  exactly the surface colour. Compression can only break this by lifting a dark
  pixel above the backdrop out in the open field, away from real glow. Gate:
  **no open-field pixel lifted more than 3/255 above the backdrop.**

  Test against `--grout` (`oklch(0.205 0.0065 67.5)` = `rgb(25,23,20)`) — it is
  the worst case for headroom. `bg-secondary` appears only mid-crossfade and,
  being lighter, clamps *more*.

  Settled: **re-encoding does not break the lighten recipe.** `video-blend.md`'s
  "no re-encoding the footage" describes the recipe needing no preprocessing
  step; it is not a prohibition on compression.

`node scripts/shrink-asset.mjs --blend --write <files…>` runs both gates and
refuses to write anything that fails. Both flags are load-bearing: without
`--blend` only the SSIM gate runs, and without `--write` the whole invocation
is a dry run that reports and writes nothing. Use it rather than hand-rolling
ffmpeg — the gates are easy to get subtly wrong, as above.

### When 0.99 is the wrong bar: `--min-ssim=<n>`

Some footage cannot clear 0.99 at any useful bitrate, because the thing SSIM is
measuring is the *content*. `/world`'s engraved legs print paper grain into
every frame: at CRF 23 they score 0.976–0.989, and the control says the bar is
wrong rather than the encode — **a near-lossless CRF 18 pass scores 0.9899 and
comes out LARGER than the source** (8196KB vs 7841KB on leg 7). Matched 1:1
crops at CRF 23 are indistinguishable from source. A gate that fails
near-lossless is not measuring damage.

So the tool takes `--min-ssim=<n>`, and the rule around it is the same rule as
everywhere else in this section: **run the CRF 18 control first and set the bar
to the floor the control establishes** — never to whatever number makes the
encode pass. It lives on the command line, not in the script, so the override
shows up in the shell history that produced the asset:

```sh
node scripts/shrink-asset.mjs --blend --write --min-ssim=0.975 public/assets/world/leg-*.mp4
```

Do not reach for this because an encode failed. Reach for it after a control
has told you the failure is the gate's.

### `--gop=<n>` is a keyframe interval, and on `/world` it is load-bearing

x264 defaults to a ~250-frame GOP. That is right for playback and wrong for
video that is SCRUBBED, where the browser has to land on an arbitrary frame:
with one keyframe in a 121-frame clip, a seek cannot be served without decoding
everything up to it, so the picture steps instead of moving. `scrub-engine.js`
states the requirement in its own header — `-g 8` for the master, `-g 4` for the
mobile tier. On `/world`'s line art `-g 8` costs about 5% in bytes.

**`/world`'s legs must stay `--gop=1` (all-intra), and this is now a structural
dependency, not an optimisation.** The page no longer scrubs `<video>` at all:
`src/app/world/film/` decodes each leg through WebCodecs and draws frames to a
canvas, which is what took it from 33 to 120 new frames a second at reading
speed. That decoder requires every sample to be independently decodable.
`mp4-intra.ts` validates it and returns `null` if it is not — so a well-meaning
re-encode that drops the flag does not error, it silently drops the page back to
the jagged path. Re-encode the legs with:

```sh
node scripts/shrink-asset.mjs --blend --write --min-ssim=0.975 --gop=1 public/assets/world/leg-*.mp4
```

Do not set `--gop` on ordinary playback video. There it buys nothing and costs
weight for every visitor.

### Leg weight is paired to the prefetch window — change one, check the other

`scrub-engine.js`'s `lookahead` decides how far ahead of the reader a leg starts
downloading, and the right value depends on how heavy a leg is. It is really a
bytes-in-flight budget wearing a scroll distance as a costume.

It was `1.6` viewports while the legs averaged ~9.5MB. The 2026-08-22 CRF 23 pass
took them to ~5.5MB, which bought nearly a whole extra leg of lead for the same
bytes, so it is now `2.4` (a leg spans 1.05–1.30vh, so 2.4vh is ~2 legs ahead).

**Re-encode the legs HEAVIER and this has to come back down**, or a reader on a
middling connection starts meeting poster stills mid-walk. Lighter, and there is
free lead time going unclaimed. The `slowNet` branch (`0.4`) is not part of this
trade — it protects the readers a wider window hurts, and file size does not
change what a 2G connection wants.

## 4. Never re-encode or downscale a master

"Unreferenced" and "safe to touch" are different sets, and degrading a master is
as destructive as deleting it — worse, because it is silent.

- `chapter-illustrations/approach.png` reads as unreferenced. It is the master
  art behind `approach-alpha.webp`.
- `problem-alpha.webp` is *both* the shipped asset and the only full-resolution
  copy of that drawing — there is no `problem.png`. It was left at 705×767
  despite rendering at 88×96, because saving 84KB is not worth destroying the
  original.
- The `funding-finder` Seedance export is a raw master. Untouched.

**Before re-encoding anything, ask whether a higher-resolution copy exists
elsewhere.** If this file is the only copy, leave it alone or produce a
derivative alongside it — never overwrite in place. Orphans get *reported* to
Lizzie for a decision, never deleted or degraded.

## What not to reach for

- **Regenerating clips smaller** — see §2. Loses art-directed footage, fixes
  nothing.
- **Downscaling video dimensions** — the bitrate is the problem; 960×960 is
  right for retina.
- **Batch-optimizing every image in `public/`** — most go through `next/image`
  and never reach a visitor at source weight. Looks productive, isn't.
- **Lossy re-encoding an alpha knockout** — lifts the transparent field to
  alpha ~17 and prints a faint rectangle. This is exactly why `LeafPlate` sets
  `unoptimized`. If you must resize one, use `webp({lossless: true})` and verify
  the corners are still 0.
- **A zero-tolerance gate** — see §3.2. Gate on amplitude against a control.

## Checklist for a new asset

1. Is it raw-shipped (`<video>`, `poster=`, `unoptimized`, plain `<img>`)? If
   not, stop — `next/image` already handles it.
2. Is this file the only copy, or does a master exist? If it is the only copy,
   do not overwrite it.
3. Video: re-encode at CRF 23 (§2). Poster: WebP q80, and regenerate it
   whenever the clip changes (`video-blend.md`).
4. Run the gates via `node scripts/shrink-asset.mjs --blend --write`. Drop
   `--write` first if you want the dry run. If a gate fails, get a control
   before believing it (§3).
5. Is the clip blend-composited? Then the open-field gate is mandatory, not
   optional, and it only runs when you pass `--blend`.
6. Confirm dimensions and frame count are unchanged, and every `src`/`poster`
   path still resolves.
7. Look at it — the maths proves the blend invariant holds, not that the work
   still looks good. Screenshot via `node scripts/screenshot.mjs`, or run the
   `visual-qa` agent.
