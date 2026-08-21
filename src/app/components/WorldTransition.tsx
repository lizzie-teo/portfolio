"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionEase } from "../lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   UNMOUNTED, 20 Aug 2026 — NOTHING IMPORTS THIS FILE, AND ITS TRIGGER IS GONE.

   This intercepted a click on `a[href="/world"]` from the home page and played
   the push-in (hello world → entrance garden) before navigating. Both ends of
   that scenario have been dissolved by the owner's FigJam flow: `/` opens ON
   the walk rather than on a hero that links to it, `/world` is a redirect to
   `/` (next.config.ts), and there is no navigation left between a static
   Macintosh and a garden gate to cover.

   Left on disk rather than deleted because that call is Lizzie's, and because
   the guard set below — modifiers, reduced motion, save-data, off-screen
   origin, slow-fetch patience, Escape and click to skip, all falling through to
   plain navigation — is the reusable part and is not written down anywhere
   else.

   It is the last reference to `leg-0-hero.mp4`. `leg-0.mp4`, the all-intra
   master that derivative was cut from, is now referenced by nothing; keep it,
   it is what a re-cut would come from.
────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   THE PUSH-IN — clicking "What I do" flies through the hero's screen

   The walk's opening leg (leg 0) is the hello world Macintosh turning into the
   garden: the lettering fades, the CRT fills with the gate, and the camera
   pushes through the screen until the gate fills frame. That clip only means
   something to a reader who is LOOKING at the machine — which is why it is not
   a section of /world's chain (ScrollWorld.tsx, THE CHAIN OPENS AT THE GATE):
   a direct visitor has never seen the Mac and gets the original floppy→garden
   opening instead. This component is the from-`/` entry: it catches the
   masthead's "What I do" click while the hero machine is on screen, plays the
   push-in in place, and lands on /world at the gate — the exact plate the
   clip was generated to end on (`--end-image scene-1-gate.webp`), which is
   also the plate /world's first section opens on. Both ends of the click are
   the same frame.

   ── INTERCEPTION IS DELEGATED, NOT WIRED THROUGH THE HEADER ───────────────
   A capture-phase document listener watches for clicks on `a[href="/world"]`.
   SiteHeader stays a dumb shared masthead with no knowledge of this route's
   theatrics, and the transition is owned entirely by the page that has the
   antecedent frame. `preventDefault` in the capture phase is what stops the
   Next Link from navigating — its own handler checks `defaultPrevented`.

   ── EVERY GUARD FALLS THROUGH TO PLAIN NAVIGATION ─────────────────────────
   Modifier or non-primary clicks (new tab is the reader's call), reduced
   motion, save-data, and a hero that is not meaningfully on screen (a reader
   deep in the work grid has no machine in view, so there is no frame to push
   through) all decline the interception and let the link be a link. The same
   applies mid-flight: if the clip cannot reach its first frame within a beat
   (PLAY_PATIENCE below), the transition gives up and navigates rather than
   holding the reader on a stalled overlay. A transition may fail; the
   navigation may not.

   ── THE GEOMETRY IS THE SHOT ──────────────────────────────────────────────
   The video mounts at the hero picture's own bounding rect and expands to the
   full viewport over the clip's opening — the camera is pushing INTO the
   screen, so the frame growing to swallow the page is the same gesture, not a
   transition laid over it. The overlay's ground is SCENE_PAPER, the clip's
   own field colour (HomeHero samples it from the footage), so the video's
   hard edges land on identical paper and no rectangle is ever visible. Frame
   0 of the clip is a REDRAW of the hero's held frame — same composition,
   different linework — so the video fades in over ~0.3s instead of cutting,
   which is the crossfade the owner chose over regenerating the clip.

   ── THE CLIP IS A DERIVATIVE ──────────────────────────────────────────────
   `leg-0-hero.mp4` (2.3MB, SSIM 0.9945 against the master) exists for the
   same reason `leg-9-hero.mp4` does: the master `leg-0.mp4` is a 12.4MB
   all-intra scrub encode, wrong for a clip that is PLAYED. It is fetched only
   on click — never speculatively — and `router.prefetch` warms the /world
   route while the reader is still deciding.

   THE READER CAN LEAVE. Escape, or any click on the overlay, skips straight
   to /world. Five seconds is a cinematic when chosen and a hostage situation
   when it is not.
────────────────────────────────────────────────────────────────────────── */

const CLIP = "/assets/world/leg-0-hero.mp4";
/* HomeHero's SCENE_PAPER — the clip's open field, sampled from the footage. */
const PAPER = "#E7D2C0";
/* How long the clip gets to reach 'playing' before the transition is
   abandoned for plain navigation. One beat: long enough for a warm cache or a
   fast line, short enough that a cold 3G fetch never reads as a hang. */
const PLAY_PATIENCE_MS = 900;
/* The clip is 121 frames at 24fps (5.04s). If 'ended' never fires — a decoder
   stall, a background tab — this is the backstop that still delivers the
   reader to the page they asked for. */
const SAFETY_MS = 7000;
/* The expansion runs over the clip's opening beat, while the camera is still
   settling toward the screen; by the time the push accelerates the frame is
   already the whole viewport. */
const EXPAND_S = 1.2;

type PlayState = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function WorldTransition() {
  const router = useRouter();
  const [play, setPlay] = useState<PlayState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftRef = useRef(false);

  /* One-way door: every exit path funnels here, and the first caller wins so
     a race between 'ended', the safety timer and a reader's Escape cannot
     navigate twice. */
  const leave = () => {
    if (leftRef.current) return;
    leftRef.current = true;
    router.push("/world");
  };

  useEffect(() => {
    router.prefetch("/world");

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href="/world"]');
      if (!link) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      const connection = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection;
      if (connection?.saveData) return;

      const hero = document.querySelector("[data-hero-film]");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      /* "Meaningfully on screen": at least 120px of the picture inside the
         viewport. Below that the reader is not looking at the machine and the
         identical-frame idea has nothing to be identical to. */
      const visible =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visible < 120) return;

      event.preventDefault();
      setPlay({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!play) return;

    /* The page behind the overlay must hold still — a wheel event mid-take
       would scroll a document the reader can no longer see. Restored in
       cleanup, which also covers the unmount that navigation causes. */
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const video = videoRef.current;
    let patience = 0;
    const safety = window.setTimeout(leave, SAFETY_MS);

    if (video) {
      patience = window.setTimeout(leave, PLAY_PATIENCE_MS);
      const onPlaying = () => window.clearTimeout(patience);
      video.addEventListener("playing", onPlaying, { once: true });
      video.play().catch(leave);
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(safety);
      window.clearTimeout(patience);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
    /* `leave` is stable by construction (ref-guarded); `play` is the trigger. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  if (!play) return null;

  return (
    /* aria-hidden: this is scenery between two pages, not content. The link
       the reader activated keeps focus until /world takes over. */
    <div aria-hidden className="fixed inset-0 z-[80]" onClick={leave}>
      {/* The ground arrives first and is the clip's own paper, so the film's
          edges are never edges. */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: PAPER }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: motionEase.out }}
      />
      <motion.div
        className="absolute overflow-hidden"
        initial={{
          top: play.top,
          left: play.left,
          width: play.width,
          height: play.height,
          opacity: 0,
        }}
        animate={{
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          opacity: 1,
        }}
        transition={{
          top: { duration: EXPAND_S, ease: motionEase.inOut },
          left: { duration: EXPAND_S, ease: motionEase.inOut },
          width: { duration: EXPAND_S, ease: motionEase.inOut },
          height: { duration: EXPAND_S, ease: motionEase.inOut },
          opacity: { duration: 0.3, ease: motionEase.out },
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          src={CLIP}
          onEnded={leave}
          className="h-full w-full object-cover"
        />
      </motion.div>
    </div>
  );
}
