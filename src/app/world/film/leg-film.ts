import { demuxIntraTrack, frameIndexAt, framePositionAt, type IntraTrack } from "./mp4-intra";

/* ────────────────────────────────────────────────────────────────────────────
   LegFilm — one leg's frames, decoded on demand and held in a small window.

   WHAT IT IS FOR. Scrubbing `video.currentTime` is a SEEK: a media-pipeline
   round trip, one in flight at a time, and it can only ever land on a frame that
   exists in the file. Every sample in these legs is an IDR keyframe (--gop=1),
   so any frame can be decoded on its own, in any order, with no seek at all.
   This holds one `VideoDecoder` per warm leg and pushes samples straight into
   it. Several can be in flight at once, so the decoder pipelines while the
   render loop keeps painting — and, the reason the whole thing exists, the
   renderer can hold TWO adjacent frames and composite between them.

   Decode cost, measured on this footage: 1.8ms for one 1470×630 intra frame fed
   on its own (4.1ms worst), which is a ceiling of several hundred frames a
   second. The window below is sized for memory, not for throughput.

   WHY NOT DECODE THE WHOLE LEG UP FRONT. Because it does not fit. 1470×630 RGBA
   is 3.7MB a frame, so one 121-frame leg is 448MB decoded and the nine are 4GB.
   Even as NV12 `VideoFrame`s it is 168MB a leg. Held frames therefore have to be
   a WINDOW, and the window is small: the encoded bytes stay compressed (6.8MB a
   leg, already downloaded) and only the frames around the playhead are live.

   WHY A WINDOW IS ENOUGH. A miss is not a stall. The canvas keeps whatever was
   drawn last, so the worst case is the same frame held for one more tick — and
   the window is filled by predicting forward along the scroll direction, so
   misses happen at direction changes, where a repeated frame is invisible.
   ────────────────────────────────────────────────────────────────────────── */

export type FilmLimits = {
  /** decoded frames held around the playhead */
  cache: number;
  /** samples allowed in flight before we stop enqueueing */
  queue: number;
  /** how many frames ahead of the playhead to predict */
  lookahead: number;
  /** legs allowed to hold a decoder at once — a HARD cap, not a target */
  warm: number;
  /** how long a leg keeps its decoder after leaving the screen */
  coolAfterMs: number;
};

/* Per warm leg the resident cost is: the encoded bytes (~6.5MB, already
   downloaded), the decoded window (cache × ~1.4MB of NV12) and one canvas
   backing store (3.7MB). Three warm legs is ~60MB on a desktop. */
export const DESKTOP_LIMITS: FilmLimits = { cache: 10, queue: 6, lookahead: 4, warm: 3, coolAfterMs: 3000 };
/* PHONES ARE ON THE SAME 1470×630 MASTERS — no mobile tier is wired — so this is
   where their memory ceiling gets respected, and both numbers below are load
   bearing. A five-frame window is ~7MB of NV12 per leg against the desktop's
   ~14MB; and the WARM CAP is what stops a fast flick through the flight from
   leaving four or five legs holding decoders at once, which measured at ~85MB
   resident before the cap existed. Two warm legs is the current scene and the
   one it is about to dissolve into, which is the minimum that keeps a seam from
   cold-starting. */
export const PHONE_LIMITS: FilmLimits = { cache: 5, queue: 3, lookahead: 2, warm: 2, coolAfterMs: 1200 };

/** A decode that never came back is a decoder that has stopped talking to us. */
const PENDING_TIMEOUT_MS = 1500;

export class LegFilm {
  readonly track: IntraTrack;

  private bytes: Uint8Array | null = null;
  private decoder: VideoDecoder | null = null;
  private readonly cache = new Map<number, VideoFrame>();
  private readonly pending = new Map<number, number>();
  private readonly limits: FilmLimits;

  /** Set when the decoder reports an error; the caller hands the leg back to `<video>`. */
  broken = false;

  private constructor(track: IntraTrack, limits: FilmLimits) {
    this.track = track;
    this.limits = limits;
  }

  /** Parse a leg. Returns null if the file is anything this pipeline does not model. */
  static open(buffer: ArrayBuffer, limits: FilmLimits): LegFilm | null {
    const track = demuxIntraTrack(buffer);
    if (!track || track.frames.length < 2) return null;
    return new LegFilm(track, limits);
  }

  get frameCount() {
    return this.track.frames.length;
  }

  get warm() {
    return this.decoder !== null;
  }

  indexAt(seconds: number) {
    return frameIndexAt(this.track, seconds);
  }

  /** Fractional frame position — the input to sub-frame interpolation. */
  positionAt(seconds: number) {
    return framePositionAt(this.track, seconds);
  }

  frame(index: number): VideoFrame | undefined {
    return this.cache.get(index);
  }

  /** Bring the leg up: hold its bytes, configure a decoder. Idempotent. */
  async heat(buffer: ArrayBuffer): Promise<boolean> {
    if (this.broken) return false;
    if (this.decoder) return true;
    this.bytes = new Uint8Array(buffer);
    const config: VideoDecoderConfig = {
      codec: this.track.codec,
      description: this.track.description,
      codedWidth: this.track.width,
      codedHeight: this.track.height,
      // All-intra with no reordering, so the decoder may emit each frame the
      // moment it has it rather than holding a reorder buffer. This is the
      // single flag that turns decode latency from tens of ms into single ms.
      optimizeForLatency: true,
    };
    try {
      const support = await VideoDecoder.isConfigSupported(config);
      if (!support.supported) return false;
      const decoder = new VideoDecoder({
        output: (frame) => this.receive(frame),
        error: () => {
          this.broken = true;
          this.cool();
        },
      });
      decoder.configure(config);
      this.decoder = decoder;
      return true;
    } catch {
      this.broken = true;
      return false;
    }
  }

  /** Release everything but the sample table. Safe to call repeatedly. */
  cool() {
    for (const frame of this.cache.values()) frame.close();
    this.cache.clear();
    this.pending.clear();
    this.bytes = null;
    const decoder = this.decoder;
    this.decoder = null;
    if (decoder && decoder.state !== "closed") {
      try {
        decoder.close();
      } catch {
        /* already gone */
      }
    }
  }

  private receive(frame: VideoFrame) {
    const index = Math.round(frame.timestamp / 1000);
    this.pending.delete(index);
    if (!this.decoder || this.cache.has(index)) {
      frame.close();
      return;
    }
    this.cache.set(index, frame);
  }

  /** Queue a decode for `index` unless it is already available, in flight, or the queue is full. */
  request(index: number) {
    const decoder = this.decoder;
    if (!decoder || !this.bytes || decoder.state !== "configured") return;
    if (index < 0 || index >= this.track.frames.length) return;
    if (this.cache.has(index)) return;

    const queuedAt = this.pending.get(index);
    if (queuedAt !== undefined) {
      if (performance.now() - queuedAt < PENDING_TIMEOUT_MS) return;
      this.pending.delete(index);
    }
    if (decoder.decodeQueueSize >= this.limits.queue) return;

    const sample = this.track.frames[index];
    try {
      decoder.decode(
        new EncodedVideoChunk({
          type: "key",
          // The timestamp is a TAG, not a time: it is how `receive` knows which
          // frame came back. Microseconds-as-index keeps the values distinct and
          // well inside the integer range every implementation accepts.
          timestamp: index * 1000,
          data: this.bytes.subarray(sample.offset, sample.offset + sample.size),
        }),
      );
      this.pending.set(index, performance.now());
    } catch {
      this.broken = true;
    }
  }

  /**
   * The best frame available to stand in for `index`: the exact one if it is
   * decoded, otherwise the nearest decoded neighbour. Returns null only before
   * the very first frame lands.
   */
  best(index: number): { frame: VideoFrame; index: number } | null {
    const exact = this.cache.get(index);
    if (exact) return { frame: exact, index };
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (const key of this.cache.keys()) {
      const distance = Math.abs(key - index);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = key;
      }
    }
    if (bestIndex < 0) return null;
    return { frame: this.cache.get(bestIndex)!, index: bestIndex };
  }

  /**
   * Fill the window: the playhead frame first, then a prediction along the
   * scroll direction, spaced by however fast the playhead is actually moving.
   * Then evict whatever is furthest from the playhead.
   */
  pump(index: number, velocity: number) {
    this.request(index);
    // The frame AFTER the playhead is not lookahead, it is the other half of the
    // interpolated pair — needed in both scroll directions, before anything else.
    this.request(index + 1);
    const direction = velocity < 0 ? -1 : 1;
    const step = Math.min(12, Math.max(1, Math.round(Math.abs(velocity))));
    for (let n = 1; n <= this.limits.lookahead; n++) {
      this.request(index + direction * step * n);
    }
    this.evict(index);
  }

  private evict(index: number) {
    while (this.cache.size > this.limits.cache) {
      let worstKey = -1;
      let worstDistance = -1;
      for (const key of this.cache.keys()) {
        const distance = Math.abs(key - index);
        if (distance > worstDistance) {
          worstDistance = distance;
          worstKey = key;
        }
      }
      if (worstKey < 0) return;
      this.cache.get(worstKey)!.close();
      this.cache.delete(worstKey);
    }
  }
}
