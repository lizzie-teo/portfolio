import { LegFilm, DESKTOP_LIMITS, PHONE_LIMITS, type FilmLimits } from "./leg-film";

/* ════════════════════════════════════════════════════════════════════════════
   world-film — the decoder comes out of the scroll loop.

   WHAT IT IS FOR. scrub-engine.js drives the flight by lerping toward a
   scroll-derived target and assigning `video.currentTime`. A `<video>` can only
   ever show frames that exist in the file, one at a time, on the decoder's
   schedule — which caps the picture at the source's 24fps however fast the
   display runs, and puts the frame the visitor sees at the far end of a seek.

   This module replaces that with a canvas the page draws itself. Every sample in
   these legs is an IDR keyframe (--gop=1), so any frame can be decoded on its
   own: each warm leg gets a WebCodecs `VideoDecoder`, a small predicted window
   of decoded frames around the playhead, and a blit on every rAF. That removes
   the seek round trip, and — the part that actually matters, see THE STEPPING
   below — it makes SUB-FRAME positions drawable, which no `<video>` can do.

   MEASURED, so the reasoning is not guesswork. Real Chrome, 1440×900, scrolling
   a fixed range at a fixed speed:

                       400px/s      900px/s     2000px/s
     <video> seek     33 new f/s   71 new f/s  118 new f/s   `seeking` 0% of ticks
     canvas exact     40 new f/s   80 new f/s  120 new f/s   0.0 frames of lag

   Two things fall out of that table. Frame SUPPLY was not the problem — the
   all-intra re-encode had already fixed the seek stall the fault was blamed on.
   And at reading speed both paths sit far under the display's 121 ticks a
   second, because the film only has 24 frames a second to give.

   ── IT DOES NOT EDIT THE ENGINE, AND IT DOES NOT REIMPLEMENT IT ────────────
   scrub-engine.js is the portable upstream file and is read-only. Every number
   that decides WHAT to show — segment layout, per-leg scroll weights, linger
   remap, seam overlap, the 0.18 lerp — stays where it is. This module reads the
   engine's answer rather than recomputing it, by shadowing three properties on
   each scene's own `<video>`:

     currentTime  the engine writes it every frame; here it is captured instead
                  of being sent to a decoder. This IS the engine's scroll math,
                  arriving once per rAF, already lerped and linger-remapped.
     seeking      forced false, so the engine's own `if (seeking) continue`
                  guard — the line that drops frames today — never fires.
     duration     preserved after the element's src is released, so the engine's
                  `cur * duration` still lands in seconds.

   Nothing else about the engine is touched, and a config change in
   ScrollWorld.tsx needs no change here.

   ── THE HANDOVER IS PROGRESSIVE, IN BOTH DIRECTIONS ────────────────────────
   The `<video>` path keeps running untouched until a leg is demuxed, its
   decoder is configured AND its first frame has actually been decoded. Only
   then does the canvas go in and the video element get released. So every
   failure — no WebCodecs, an unexpected container, an unsupported config, a
   decoder that errors mid-flight — leaves or returns the visitor to exactly
   today's behaviour rather than to a blank scene.

   ── THE STEPPING, WHICH IS THE ACTUAL COMPLAINT ────────────────────────────
   Measured on this machine, the `<video>` path is NOT seek-starved: `seeking` is
   true on 0% of ticks once the legs are all-intra, and it delivers 33 / 71 / 118
   new frames a second at 400 / 900 / 2000 px/s of scroll. Frame supply was never
   what was left wrong.

   What is left wrong is that the source is 24fps and the display is not. At
   reading speed the picture is FROZEN on 73% of display frames, and the holds
   are uneven — three refreshes, then four, then three — because scroll speed
   never divides cleanly into 24. That uneven hold is judder, and judder is
   exactly what "still a bit jagged, doesn't feel like a smooth animation"
   describes. It is also why the 48fps interpolated probe on leg 5 did not
   obviously win: twice as many steps is still steps.

   So the renderer draws the FRACTIONAL position, not the nearest frame: frame
   n, then frame n+1 over it at the fractional part's alpha. The picture then
   changes on every display frame by a small amount, which is what continuous
   motion is. This is frame blending, the same thing an NLE does when it retimes
   footage, and on a forward dolly it reads as motion blur.

   IT FADES OUT AT REST, and that condition is not optional. A blend held at a
   standstill is not motion blur, it is a permanent double exposure of engraved
   line work. The blend weight is driven by how fast the playhead is moving, so
   it is full while scrolling and gone within about a tenth of a second of
   stopping, leaving one clean frame — the state posters, stills mode and
   reduced motion all share.

   ── STILLS MODE IS PRESERVED BY CONSTRUCTION ───────────────────────────────
   Not by a parallel check that could drift: this module only ever attaches to a
   `<video>` the engine created, and in stills mode (prefers-reduced-motion,
   data-saver, iOS Low Power Mode) the engine creates none. Reduced-motion
   visitors therefore decode nothing, which is the point. The explicit guard in
   `mountWorldFilm` is belt and braces on top of that. If the engine drops into
   stills mode at runtime it removes the video elements, and the observer here
   tears the matching canvas down with them.
   ════════════════════════════════════════════════════════════════════════════ */

type Film = {
  order: number;
  scene: HTMLElement;
  video: HTMLVideoElement;
  blobUrl: string;
  leg: LegFilm;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  /** the engine's own scrubbed time, captured from the shadowed currentTime */
  time: number;
  duration: number;
  /** base frame currently composited, and the alpha of its successor over it */
  drawnIndex: number;
  drawnAlpha: number;
  lastPosition: number;
  /** playhead speed in frames per tick, smoothed — drives lookahead AND blend */
  velocity: number;
  live: boolean;
  heating: boolean;
  lastWarmAt: number;
  restore: (() => void) | null;
};

export type WorldFilmHandle = {
  /** Dev-only tap used by the cadence instrument: fired on every distinct frame blitted. */
  onDraw: ((legIndex: number, frameIndex: number) => void) | null;
  films: Film[];
  /** Live blend dials — see THE SHARPNESS/SMOOTHNESS TRADE. Read every frame. */
  tune: { blendVelocity: number; blendGamma: number };
};

/* THE BLEND RAMP. Below this playhead speed (frames per tick) the film is
   treated as stopped and snaps to one clean frame; at or above it, the blend is
   full and the picture moves continuously. 0.05 frames/tick is about three
   source frames a second at 60Hz — slower than any real scroll, faster than the
   tail of the engine's lerp settling, so the fade to a single frame happens
   while the scene is already still. */
const BLEND_VELOCITY = 0.05;
/* Below this the second frame is not worth compositing at all. */
const BLEND_FLOOR = 0.012;

/* THE SHARPNESS/SMOOTHNESS TRADE, MADE ADJUSTABLE.

   `BLEND_VELOCITY` above is a THRESHOLD, and at 0.05 frames/tick it is crossed
   by every real scroll: reading pace runs the playhead at roughly 0.7
   frames/tick, fourteen times the threshold, so `motion` pins to 1 and the
   cross-dissolve is at FULL strength the whole way down the page. That is what
   removed the judder, and it is also why the picture reads slightly soft while
   it moves — at fraction 0.5 the visitor is looking at a 50/50 average of two
   source frames, which on hairline engraver's linework is a visible loss.

   Raising the threshold trades straight back: sharper, but the stepping the
   canvas renderer was built to kill starts returning. There is not much useful
   travel in that dial, because reading pace sits in the middle of it.

   `blendGamma` is the better lever and it is a different shape. It does not
   reduce the blend, it redistributes WHERE the blend sits: a symmetric ease on
   the fraction, so the playhead spends most of its traverse near a clean single
   frame and only passes briefly through the soft 50/50 crossover. Motion stays
   continuous — alpha is still monotonic in position, so nothing steps — but
   average sharpness goes up. At 1 the curve is the identity and this is exactly
   the behaviour that shipped; nothing changes until someone raises it.

   Both are live in dev via `window.__worldFilm.tune`, because neither can be
   judged from a still frame — only from a real scroll on a real panel. */
const TUNE_DEFAULTS = { blendVelocity: BLEND_VELOCITY, blendGamma: 1 };

/* f^g / (f^g + (1-f)^g) — maps [0,1] onto itself, monotonic, symmetric about
   0.5, and the identity at g = 1. Endpoints stay exact, so a frame boundary is
   still a frame boundary and the leg still hands over cleanly. */
function easeFraction(fraction: number, gamma: number) {
  if (gamma === 1) return fraction;
  const a = Math.pow(fraction, gamma);
  const b = Math.pow(1 - fraction, gamma);
  const sum = a + b;
  return sum === 0 ? fraction : a / sum;
}

const isPhone = () => Math.min(screen.width, screen.height) <= 600;

export function mountWorldFilm(container: HTMLElement): () => void {
  if (typeof window === "undefined") return () => {};
  // No decoding for anyone who asked for less motion. The engine has already
  // decided the same thing (it builds no videos at all in stills mode); this is
  // the second lock on the same door.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (typeof VideoDecoder === "undefined" || typeof EncodedVideoChunk === "undefined") return () => {};

  const found = container.querySelector<HTMLElement>(".sw-stage");
  if (!found) return () => {};
  const stage = found;

  const limits: FilmLimits = isPhone() ? PHONE_LIMITS : DESKTOP_LIMITS;
  const films = new Map<HTMLVideoElement, Film>();
  const handle: WorldFilmHandle = { onDraw: null, films: [], tune: { ...TUNE_DEFAULTS } };
  let raf = 0;
  let stopped = false;

  /* ── attach ──────────────────────────────────────────────────────────────
     Runs on a leg the moment the engine has a decodable video for it. Reads the
     bytes back out of the engine's OWN blob URL rather than re-fetching the mp4:
     a blob: URL resolves from memory, so this costs no network at all and the
     53MB the page already downloads stays downloaded once. */
  async function attach(video: HTMLVideoElement) {
    if (films.has(video) || stopped) return;
    const scene = video.closest<HTMLElement>(".sw-scene");
    if (!scene) return;
    const blobUrl = video.currentSrc || video.src;
    if (!blobUrl.startsWith("blob:")) return;

    // Placeholder claim, so a second mutation record cannot start a duplicate.
    films.set(video, null as unknown as Film);

    try {
      if (video.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          video.addEventListener("loadedmetadata", () => resolve(), { once: true });
          video.addEventListener("error", () => reject(new Error("clip")), { once: true });
        });
      }
      const buffer = await (await fetch(blobUrl)).arrayBuffer();
      const leg = LegFilm.open(buffer, limits);
      if (!leg || stopped) throw new Error("container");
      if (!(await leg.heat(buffer))) throw new Error("decoder");

      const order = Array.prototype.indexOf.call(stage.children, scene);
      const film: Film = {
        order,
        scene,
        video,
        blobUrl,
        leg,
        canvas: null,
        context: null,
        time: video.currentTime || 0,
        duration: video.duration || leg.track.duration,
        drawnIndex: -1,
        drawnAlpha: 0,
        lastPosition: -1,
        velocity: 1,
        live: false,
        heating: false,
        lastWarmAt: performance.now(),
        restore: null,
      };
      films.set(video, film);
      handle.films = [...films.values()].filter(Boolean).sort((a, b) => a.order - b.order);
      // Ask for the frame the engine is already sitting on. `takeOver` completes
      // in the render loop, once that frame has actually been decoded.
      leg.request(leg.indexAt(film.time));
    } catch {
      films.delete(video);
    }
  }

  /* ── the handover ────────────────────────────────────────────────────────
     Only ever called with a decoded frame in hand, so the canvas is never blank
     for a single compositor frame: draw, insert, THEN release the video. */
  function takeOver(film: Film) {
    const canvas = document.createElement("canvas");
    // It wears the engine's own video class, so object-fit: cover, the
    // object-position that keeps the camera's vanishing point in frame, and the
    // z-index all come from the engine's stylesheet unchanged. Canvas is a
    // replaced element, so object-fit applies to it exactly as it does to video.
    canvas.className = "sw-scene__video sw-scene__film";
    canvas.width = film.leg.track.width;
    canvas.height = film.leg.track.height;
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const first = film.leg.best(film.leg.indexAt(film.time));
    if (!first) return;
    context.drawImage(first.frame, 0, 0, canvas.width, canvas.height);
    film.drawnIndex = first.index;
    film.canvas = canvas;
    film.context = context;
    film.scene.appendChild(canvas);
    // Same contract the engine's own `seeked` listener has: reveal the film only
    // once a real frame has painted, so the poster covers the cold start.
    film.scene.classList.add("has-clip");

    const video = film.video;
    const duration = film.duration;
    Object.defineProperty(video, "currentTime", {
      configurable: true,
      get: () => film.time,
      set: (value: number) => {
        film.time = value;
      },
    });
    Object.defineProperty(video, "seeking", { configurable: true, get: () => false });
    Object.defineProperty(video, "duration", { configurable: true, get: () => duration });

    // Release the element's own decoder and buffers. The blob URL is NOT
    // revoked: it stays the cheap, already-resident source this leg re-reads
    // from every time it comes back into view.
    try {
      video.pause();
    } catch {
      /* never played */
    }
    video.removeAttribute("src");
    video.load();
    video.style.display = "none";
    film.live = true;

    film.restore = () => {
      delete (video as unknown as Record<string, unknown>).currentTime;
      delete (video as unknown as Record<string, unknown>).seeking;
      delete (video as unknown as Record<string, unknown>).duration;
      video.style.display = "";
      video.src = film.blobUrl;
      video.load();
      try {
        video.currentTime = film.time;
      } catch {
        /* not seekable yet; the engine's next frame will set it */
      }
      canvas.remove();
      film.canvas = null;
      film.context = null;
      film.live = false;
      film.restore = null;
    };
  }

  /** Give a leg back to the `<video>` path — used when its decoder errors. */
  function surrender(film: Film) {
    film.leg.cool();
    film.restore?.();
    films.delete(film.video);
    handle.films = [...films.values()].filter(Boolean).sort((a, b) => a.order - b.order);
  }

  /** Drop a leg's decoder, frames and bytes; the poster covers it until it returns. */
  function cool(film: Film) {
    film.leg.cool();
    film.canvas?.remove();
    film.canvas = null;
    film.context = null;
    film.drawnIndex = -1;
    film.drawnAlpha = 0;
    film.scene.classList.remove("has-clip");
    film.live = false;
  }

  /** Bring a cooled leg back. Bytes come from the blob URL, which was never revoked. */
  function reheat(film: Film) {
    if (film.heating || film.leg.warm || film.leg.broken) return;
    film.heating = true;
    fetch(film.blobUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => (stopped ? false : film.leg.heat(buffer)))
      .then((ok) => {
        film.heating = false;
        if (ok) film.leg.request(film.leg.indexAt(film.time));
      })
      .catch(() => {
        film.heating = false;
      });
  }

  /* ── the render loop ─────────────────────────────────────────────────────
     One rAF for the whole page. The engine guarantees at most two scenes are
     ever painted, and each costs two blits while it is interpolating, so the
     ceiling is four 1470×630 blits a frame and only at a seam. The rAF rate was
     unchanged by the blend across every measured scroll speed. */
  function tick() {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const list = handle.films;
    if (!list.length) return;

    // Which legs deserve a decoder: whatever is on screen, plus the one behind
    // it in the chain, so a leg is already warm by the time its seam starts.
    const wanted = new Set<number>();
    let focus = 0;
    let focusOpacity = 0;
    for (const film of list) {
      const opacity = Number.parseFloat(film.scene.style.opacity || "0");
      if (opacity > 0.002) {
        wanted.add(film.order);
        wanted.add(film.order + 1);
      }
      if (opacity > focusOpacity) {
        focusOpacity = opacity;
        focus = film.order;
      }
    }

    /* THE WARM CAP, and it is a hard one rather than a target. The timed cooling
       below is a hysteresis band, not a ceiling: scrolled through quickly, every
       leg passed inside the cooling window keeps its decoder, its frame window
       and its canvas, and a phone flicking through the flight was measured
       holding five at once. So anything already out of the wanted set is dropped
       immediately, furthest from the scene being looked at first. */
    const warmNow = list.filter((film) => film.leg.warm);
    if (warmNow.length > limits.warm) {
      const droppable = warmNow
        .filter((film) => !wanted.has(film.order))
        .sort((a, b) => Math.abs(b.order - focus) - Math.abs(a.order - focus));
      for (let n = 0; n < warmNow.length - limits.warm && n < droppable.length; n++) {
        const film = droppable[n];
        if (film.live) cool(film);
        else film.leg.cool();
      }
    }

    for (const film of list) {
      if (film.leg.broken) {
        surrender(film);
        continue;
      }
      const warmWanted = wanted.has(film.order);
      if (warmWanted) film.lastWarmAt = now;

      if (!film.leg.warm) {
        if (warmWanted) reheat(film);
        continue;
      }
      if (!warmWanted && now - film.lastWarmAt > limits.coolAfterMs) {
        if (film.live) cool(film);
        else film.leg.cool();
        continue;
      }

      const position = film.leg.positionAt(film.time);
      const index = Math.floor(position);
      if (film.lastPosition < 0) film.lastPosition = position;
      // Speed in frames per tick, smoothed. It does two jobs: it spaces the
      // predicted frames (creeping wants the next one, a flick wants every
      // sixth, and asking for frames that will be skipped anyway just burns the
      // queue the frame we DO need is waiting in), and it sets how much of the
      // blend is applied.
      film.velocity = film.velocity * 0.7 + (position - film.lastPosition) * 0.3;
      film.lastPosition = position;

      if (!film.live) {
        takeOver(film);
        if (!film.live) {
          film.leg.pump(index, film.velocity);
          continue;
        }
      }
      draw(film, position);
      film.leg.pump(index, film.velocity);
    }
  }

  /* ── the draw ────────────────────────────────────────────────────────────
     Composites the FRACTIONAL playhead position: base frame, then its successor
     over it at the fraction's alpha, so the picture moves on every display frame
     instead of stepping 24 times a second. The blend is scaled by playhead speed
     and disappears at rest — see THE STEPPING at the top of this file. */
  function draw(film: Film, position: number) {
    const context = film.context;
    const canvas = film.canvas;
    if (!context || !canvas) return;

    const index = Math.floor(position);
    const fraction = position - index;
    const motion = Math.min(1, Math.abs(film.velocity) / handle.tune.blendVelocity);
    // Continuous in `motion`: at full speed the alpha IS the eased fraction, at
    // rest it collapses to a hard round to the nearer frame. Nothing jumps as it
    // fades. The ease only redistributes the crossover — see TUNE_DEFAULTS.
    const eased = easeFraction(fraction, handle.tune.blendGamma);
    let alpha = eased * motion + (fraction >= 0.5 ? 1 : 0) * (1 - motion);

    const base = film.leg.frame(index);
    const next = alpha > BLEND_FLOOR ? film.leg.frame(index + 1) : undefined;
    if (!next) alpha = 0;

    if (!base) {
      // The exact frame is not decoded yet. Hold what is up unless a nearer one
      // has arrived — stepping backwards is the one thing worse than repeating.
      const stand = film.leg.best(index);
      if (!stand || stand.index === film.drawnIndex) return;
      if (Math.abs(stand.index - index) > Math.abs(film.drawnIndex - index)) return;
      context.drawImage(stand.frame, 0, 0, canvas.width, canvas.height);
      film.drawnIndex = stand.index;
      film.drawnAlpha = 0;
      handle.onDraw?.(film.order, stand.index);
      return;
    }

    // Nothing visible changed: skip the two blits. This is what keeps a settled
    // scene at zero cost per frame.
    if (index === film.drawnIndex && Math.abs(alpha - film.drawnAlpha) < BLEND_FLOOR) return;

    context.drawImage(base, 0, 0, canvas.width, canvas.height);
    if (next && alpha > BLEND_FLOOR) {
      context.globalAlpha = alpha;
      context.drawImage(next, 0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
    }
    film.drawnIndex = index;
    film.drawnAlpha = alpha;
    handle.onDraw?.(film.order, index);
  }

  /* ── watch the engine's stage ────────────────────────────────────────────
     The engine appends a `<video>` per leg as the scroll approaches it, and
     removes them all if it drops into stills mode at runtime. */
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) void attach(node);
      });
      record.removedNodes.forEach((node) => {
        if (!(node instanceof HTMLVideoElement)) return;
        const film = films.get(node);
        if (film) {
          film.leg.cool();
          film.canvas?.remove();
          films.delete(node);
          handle.films = [...films.values()].filter(Boolean).sort((a, b) => a.order - b.order);
        }
      });
    }
  });
  observer.observe(stage, { childList: true, subtree: true });
  stage.querySelectorAll("video").forEach((video) => void attach(video));

  raf = requestAnimationFrame(tick);

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__worldFilm = handle;
  }

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    for (const film of films.values()) {
      if (!film) continue;
      film.leg.cool();
      film.canvas?.remove();
    }
    films.clear();
    handle.films = [];
  };
}
