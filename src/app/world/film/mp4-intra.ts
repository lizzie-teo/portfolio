/* ────────────────────────────────────────────────────────────────────────────
   mp4-intra — a sample table reader for the /world legs, and nothing more.

   WHY THIS EXISTS AT ALL. WebCodecs' VideoDecoder takes encoded samples, not
   containers, so something has to open the mp4 and hand back "sample n starts
   at byte X and is Y bytes long". The usual answer is mp4box.js (~200KB), which
   is a full ISO-BMFF implementation because the general case is genuinely hard:
   fragmented files, edit lists, B-frame reordering, multiple tracks, codecs
   that carry their parameter sets out of band.

   NONE OF THAT IS TRUE HERE, and the encode is what makes it untrue. The legs
   come out of scripts/shrink-asset.mjs with `--gop=1`, so every sample is an
   IDR keyframe with no inter-frame dependency at all; there are no B-frames, so
   decode order is presentation order and there is no `ctts`; the file is
   progressive with one video track and a single-entry, identity `elst`. What is
   left is: read `stsd` for the decoder config, and read `stsz`/`stsc`/`stco`/
   `stts` to turn sample indexes into byte ranges. That is this file.

   So the parser is deliberately narrow and it VALIDATES rather than tolerates.
   Every assumption above is asserted, and any file that breaks one returns null
   instead of being coerced — the caller then simply leaves the existing
   `<video>` scrub path running (see world-film.ts, THE HANDOVER). A silent
   mis-parse would put the wrong frame on screen, which is far worse than a
   renderer that politely declines.

   Read `.docs/asset-weight.md` before re-encoding any leg: an encode that loses
   `--gop=1` produces a file this reader will reject, and the page will quietly
   fall back to the jagged path it was built to replace.
   ────────────────────────────────────────────────────────────────────────── */

export type IntraFrame = {
  /** byte offset of the sample within the file */
  offset: number;
  /** sample length in bytes */
  size: number;
  /** decode/presentation time in track timescale units */
  time: number;
};

export type IntraTrack = {
  /** RFC 6381 codec string, e.g. avc1.641020 */
  codec: string;
  /** avcC payload — VideoDecoder's `description` for avc1 */
  description: Uint8Array;
  width: number;
  height: number;
  timescale: number;
  /** seconds */
  duration: number;
  frames: IntraFrame[];
};

type Box = { type: string; start: number; end: number; body: number };

function boxes(view: DataView, start: number, end: number): Box[] {
  const out: Box[] = [];
  let off = start;
  while (off + 8 <= end) {
    let size = view.getUint32(off);
    const type = String.fromCharCode(
      view.getUint8(off + 4),
      view.getUint8(off + 5),
      view.getUint8(off + 6),
      view.getUint8(off + 7),
    );
    let header = 8;
    if (size === 1) {
      // 64-bit size. Number() is safe: no leg is anywhere near 2^53 bytes.
      size = Number(view.getBigUint64(off + 8));
      header = 16;
    } else if (size === 0) {
      size = end - off;
    }
    if (size < header || off + size > end) break;
    out.push({ type, start: off, end: off + size, body: off + header });
    off += size;
  }
  return out;
}

const pick = (list: Box[], type: string) => list.find((b) => b.type === type);

function descend(view: DataView, from: Box, path: string[]): Box | undefined {
  let cur: Box | undefined = from;
  for (const type of path) {
    if (!cur) return undefined;
    cur = pick(boxes(view, cur.body, cur.end), type);
  }
  return cur;
}

/** The one exported entry point. Returns null for anything it does not fully understand. */
export function demuxIntraTrack(buffer: ArrayBuffer): IntraTrack | null {
  try {
    return parse(buffer);
  } catch {
    return null;
  }
}

function parse(buffer: ArrayBuffer): IntraTrack | null {
  const view = new DataView(buffer);
  const top = boxes(view, 0, buffer.byteLength);
  const moov = pick(top, "moov");
  if (!moov) return null;

  // The video trak. There is only ever one in these files, but check the
  // handler rather than assuming the first trak is it.
  let stbl: Box | undefined;
  let mdhd: Box | undefined;
  for (const trak of boxes(view, moov.body, moov.end).filter((b) => b.type === "trak")) {
    const mdia = descend(view, trak, ["mdia"]);
    if (!mdia) continue;
    const hdlr = pick(boxes(view, mdia.body, mdia.end), "hdlr");
    if (!hdlr) continue;
    const handler = String.fromCharCode(
      view.getUint8(hdlr.body + 8),
      view.getUint8(hdlr.body + 9),
      view.getUint8(hdlr.body + 10),
      view.getUint8(hdlr.body + 11),
    );
    if (handler !== "vide") continue;
    mdhd = pick(boxes(view, mdia.body, mdia.end), "mdhd");
    stbl = descend(view, mdia, ["minf", "stbl"]);
    // An edit list that shifts or trims the media would make sample time and
    // `video.currentTime` disagree, and this reader indexes by the latter.
    // Only the identity list (media_time 0) is accepted.
    const elst = descend(view, trak, ["edts", "elst"]);
    if (elst) {
      const version = view.getUint8(elst.body);
      const count = view.getUint32(elst.body + 4);
      if (count !== 1) return null;
      const mediaTime = version === 1 ? Number(view.getBigInt64(elst.body + 8 + 8)) : view.getInt32(elst.body + 8 + 4);
      if (mediaTime !== 0) return null;
    }
    break;
  }
  if (!stbl || !mdhd) return null;

  const mdhdVersion = view.getUint8(mdhd.body);
  const timescale = mdhdVersion === 1 ? view.getUint32(mdhd.body + 20) : view.getUint32(mdhd.body + 12);
  if (!timescale) return null;

  const tables = boxes(view, stbl.body, stbl.end);
  const stsd = pick(tables, "stsd");
  const stts = pick(tables, "stts");
  const stsc = pick(tables, "stsc");
  const stsz = pick(tables, "stsz");
  const stco = pick(tables, "stco") ?? pick(tables, "co64");
  if (!stsd || !stts || !stsc || !stsz || !stco) return null;

  // B-frames would mean decode order ≠ presentation order, which this reader
  // does not model. `ctts` is how a file says it has them.
  if (pick(tables, "ctts")) return null;

  // ── decoder config ──────────────────────────────────────────────────────
  const entry = boxes(view, stsd.body + 8, stsd.end)[0];
  if (!entry || (entry.type !== "avc1" && entry.type !== "avc3")) return null;
  const width = view.getUint16(entry.body + 24);
  const height = view.getUint16(entry.body + 26);
  // VisualSampleEntry is 78 bytes of fixed fields before its child boxes.
  const avcC = pick(boxes(view, entry.body + 78, entry.end), "avcC");
  if (!avcC) return null;
  const description = new Uint8Array(buffer, avcC.body, avcC.end - avcC.body);
  const codec =
    "avc1." +
    [description[1], description[2], description[3]].map((n) => n.toString(16).padStart(2, "0")).join("");

  // ── sample sizes ────────────────────────────────────────────────────────
  const uniformSize = view.getUint32(stsz.body + 4);
  const sampleCount = view.getUint32(stsz.body + 8);
  if (!sampleCount) return null;
  const sizeAt = (i: number) => (uniformSize ? uniformSize : view.getUint32(stsz.body + 12 + i * 4));

  // ── every sample must be a sync sample ──────────────────────────────────
  // No `stss` means "all samples are sync", which is what --gop=1 produces.
  // An `stss` that does not list every sample means the file has delta frames
  // and random access would decode garbage, so it is rejected outright.
  const stss = pick(tables, "stss");
  if (stss && view.getUint32(stss.body + 4) !== sampleCount) return null;

  // ── chunk offsets + sample-to-chunk → per-sample byte offsets ───────────
  const is64 = stco.type === "co64";
  const chunkCount = view.getUint32(stco.body + 4);
  const chunkOffset = (i: number) =>
    is64 ? Number(view.getBigUint64(stco.body + 8 + i * 8)) : view.getUint32(stco.body + 8 + i * 4);

  const stscCount = view.getUint32(stsc.body + 4);
  const runs: { firstChunk: number; samplesPerChunk: number }[] = [];
  for (let i = 0; i < stscCount; i++) {
    runs.push({
      firstChunk: view.getUint32(stsc.body + 8 + i * 12),
      samplesPerChunk: view.getUint32(stsc.body + 8 + i * 12 + 4),
    });
  }

  const offsets = new Array<number>(sampleCount);
  let sample = 0;
  for (let r = 0; r < runs.length && sample < sampleCount; r++) {
    const lastChunk = r + 1 < runs.length ? runs[r + 1].firstChunk - 1 : chunkCount;
    for (let c = runs[r].firstChunk; c <= lastChunk && sample < sampleCount; c++) {
      let cursor = chunkOffset(c - 1);
      for (let k = 0; k < runs[r].samplesPerChunk && sample < sampleCount; k++) {
        offsets[sample] = cursor;
        cursor += sizeAt(sample);
        sample++;
      }
    }
  }
  if (sample !== sampleCount) return null;

  // ── sample times (run-length encoded deltas) ────────────────────────────
  const sttsCount = view.getUint32(stts.body + 4);
  const times = new Array<number>(sampleCount);
  let t = 0;
  let idx = 0;
  for (let i = 0; i < sttsCount && idx < sampleCount; i++) {
    const count = view.getUint32(stts.body + 8 + i * 8);
    const delta = view.getUint32(stts.body + 8 + i * 8 + 4);
    for (let k = 0; k < count && idx < sampleCount; k++) {
      times[idx++] = t;
      t += delta;
    }
  }
  if (idx !== sampleCount) return null;

  const frames: IntraFrame[] = new Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    frames[i] = { offset: offsets[i], size: sizeAt(i), time: times[i] };
    if (frames[i].offset + frames[i].size > buffer.byteLength) return null;
  }

  return { codec, description, width, height, timescale, duration: t / timescale, frames };
}

/**
 * Where the playhead sits in FRAMES, fractionally: 47.4 means "between frame 47
 * and 48, 40% of the way". The fraction is what makes sub-frame interpolation
 * possible, and interpolation is the whole reason the renderer exists — see
 * world-film.ts, THE STEPPING.
 */
export function framePositionAt(track: IntraTrack, seconds: number): number {
  const index = frameIndexAt(track, seconds);
  const frames = track.frames;
  const start = frames[index].time;
  const next = index + 1 < frames.length ? frames[index + 1].time : start + (start - (frames[index - 1]?.time ?? 0));
  const span = next - start;
  if (span <= 0) return index;
  const fraction = (seconds * track.timescale - start) / span;
  return index + Math.min(1, Math.max(0, fraction));
}

/** Frame index covering `seconds`. Binary search, so a variable frame rate would still land right. */
export function frameIndexAt(track: IntraTrack, seconds: number): number {
  const target = seconds * track.timescale;
  const f = track.frames;
  let lo = 0;
  let hi = f.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (f[mid].time <= target) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
