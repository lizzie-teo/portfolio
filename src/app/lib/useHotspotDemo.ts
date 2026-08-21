"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { motionDuration, motionEase } from "./motion";

/**
 * The auto-demo sequencer for the mobile phone-frame prototype (FeatureChips →
 * PersistentPhoneFrame).
 *
 * WHY THIS EXISTS. The prototype hotspots are invisible at rest — nothing is
 * drawn over the clean product capture, which is the right call for the
 * screenshot and the wrong one for discovery. On the tallest captures (the
 * outcome page is 1080×12910, ~3400px tall inside a ~640px screen) every trigger
 * sits several hundred pixels below the fold of the phone screen, so a reader
 * who never scrolls the inner capture never learns the frame is interactive at
 * all. The demo answers that by doing the thing once, on a loop: scroll the
 * trigger into view, reach in, press it, hold the result, dismiss it, move on.
 *
 * IT IS NOT INFORMATION. Everything it demonstrates stays reachable by touching
 * the hotspots, paging the carousel, or tabbing. Under reduced motion the hook
 * is inert and the band is exactly what it is today.
 *
 * THE READER ALWAYS WINS. First pointerdown, keydown, or focus inside the
 * gallery ends the demo for that gallery for the rest of the session — the ring
 * fades, nothing further automates, and anything the demo left open is left for
 * the reader to dismiss the normal way. It also never runs offscreen, never
 * moves focus, and never announces itself.
 */

/** The shape the sequencer needs from a hotspot. See FeatureChips' `Hotspot`. */
export type DemoHotspot = {
  onImage: number;
  /** Percentages of the capture box, same coordinate model as the hotspot. */
  x: number;
  y: number;
  w: number;
  h: number;
  popupImage?: number;
  goToImage?: number;
};

/**
 * Every beat in one place, so the loop's pacing is tuned here and nowhere else.
 *
 * The MOVEMENT beats are the shared motion tokens — a travelling ring and an
 * eased capture scroll are both `slow`, the explanatory-sequence duration, and
 * the ring's own transitions in TouchRing use the same value so the sequencer
 * and the visual never drift. `pageSwap` is not a choice at all: it is how long
 * the carousel's own AnimatePresence mode="wait" takes (a `base` exit then a
 * `base` enter), plus a frame of slack.
 *
 * The DWELL beats — lead, holds, gap, loop — are reading time, not motion, so
 * they are honest milliseconds rather than motion tokens stretched out of shape.
 * They are the only numbers here worth arguing about: a popup hold has to clear
 * the first line of the explainer, and a Service Finder page has more to look at
 * than a modal, so it gets longer.
 */
const DEMO = {
  /** Beat after the band settles in view before the first reach. */
  lead: 900,
  /** Eased scroll parking the trigger 45% down the screen. */
  reveal: motionDuration.slow * 1000,
  /** Beat after the capture settles, before the hand appears. */
  settle: motionDuration.fast * 1000,
  /** Ring fades in and travels to the trigger. Matches TouchRing's x/y. */
  approach: motionDuration.slow * 1000,
  /** Contraction and ripple. */
  press: motionDuration.base * 1000,
  /** Contact held before the action fires, so cause reads before effect. */
  contact: motionDuration.fast * 1000,
  /** Popup on screen. Long enough to read the heading and the first line. */
  holdPopup: 2200,
  /** A paged Service Finder screen. More to look at than a modal. */
  holdSlide: 2600,
  /** Ring travels from the trigger down to the popup's own "Ok" pill. */
  exitTravel: motionDuration.slow * 1000,
  /** Carousel slide swap: AnimatePresence mode="wait" exit then enter. */
  pageSwap: motionDuration.base * 2 * 1000 + 120,
  /** Beat between steps. */
  gap: 400,
  /**
   * Read-through beats. The hand moves between scan points at the same `slow`
   * travel as everywhere else, then rests. `scanDwell` is the one that decides
   * whether the scan reads as reading or as drifting: too short and it skims
   * past a heading nobody has finished, too long and the loop stalls before it
   * has done anything. `scanSettle` is the shorter rest on the outcome heading,
   * which is three words rather than an option to weigh up.
   */
  scanDwell: 1100,
  scanSettle: 700,
  /** Pause after the last option is read, before the hand commits to a press. */
  scanCommit: 500,
  /** Pause at the top of the capture before the loop starts again. */
  loop: 1400,
} as const;

/** Where the trigger is parked vertically in the screen during Reveal. */
const REVEAL_ANCHOR = 0.45;

/**
 * A region the hand reads over before any of it is pressed — the outcome
 * heading, then each recommended care option in turn. Same coordinate model as
 * a hotspot (percentages of the capture, top-left plus size), because the scan
 * and the press share all their positioning maths; the difference is only that
 * a scan point is never touched.
 *
 * The scan exists because the press sequence answers "what happens if I tap
 * this" before the reader has been told there is a list to tap in. On a capture
 * this tall the three care options do not share a screenful, so drilling
 * straight into one of them shows a modal with no visible sense of what it was
 * chosen FROM — and the recommendation order is the whole design decision the
 * chapter is about. Reading the set first, unhurried and without pressing
 * anything, puts the choice on screen before the demonstration of it.
 */
export type DemoScanPoint = {
  onImage: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** What is being read. Authoring aid; nothing renders it. */
  label: string;
};

/**
 * The popup's "Ok" pill, as a fraction of the screen. Mirrors OK_HOTSPOT in
 * FeatureChips — every "Learn more" capture is 9:20, exactly the screen's own
 * ratio, so it fills edge to edge with no scroll and the hotspot's percentages
 * of the image are also percentages of the screen. Centre of those bounds.
 *
 * The demo dismisses on Ok rather than the X deliberately. Ok is the modal's
 * primary action — a wide, labelled pill at the foot of the screen, which is
 * where a thumb already is and what a reader would actually press. The X is the
 * escape hatch, small and in the far corner; a hand reaching up to it reads as
 * cancelling out of the explainer rather than finishing with it. Both controls
 * still work by hand — only the demonstrated one changed.
 */
const OK_TARGET = { x: 0.03 + 0.94 / 2, y: 0.915 + 0.075 / 2 };

/** Identifies a demo press target, matched against by the pressed element. */
export type DemoPressTarget = string;

/** The press-target id for a hotspot — the same shape as its React key. */
export function demoPressId(hotspot: DemoHotspot): DemoPressTarget {
  return `${hotspot.onImage}-${hotspot.popupImage ?? hotspot.goToImage}`;
}

/** The press-target id for a demo-opened popup's own dismiss control. */
export const DEMO_DISMISS_ID: DemoPressTarget = "popup-dismiss";

/** Stable empty default, so an unscanned feature never re-runs the effect. */
const EMPTY_SCAN: DemoScanPoint[] = [];

type RingState = {
  x: number;
  y: number;
  from: { x: number; y: number };
  pressed: boolean;
  pressKey: number;
};

export type HotspotDemoOptions<T extends DemoHotspot> = {
  /**
   * The feature's demo sequence, already sorted by `demoStep`. Empty disables
   * the demo entirely, which is every feature that has not opted in.
   */
  steps: T[];
  /**
   * Optional read-through that runs once at the top of each loop, before the
   * first press. Empty skips it.
   */
  scan?: DemoScanPoint[];
  /** The images index currently on screen, so the loop knows where it is. */
  imageIndex: number;
  /** The gallery root — the in-view gate and the reader-handover listeners. */
  galleryRef: { current: HTMLElement | null };
  /** Opens a popup WITHOUT moving focus. */
  openPopup: (hotspot: T) => void;
  /** Closes a demo-opened popup WITHOUT restoring focus to a trigger. */
  closePopup: () => void;
  /** Pages the carousel to an images index. */
  navigate: (imageIndex: number) => void;
  shouldReduce: boolean | null;
};

export type HotspotDemoState = {
  /** Ring props, or null when nothing is on the glass. */
  ring: RingState | null;
  /** Which element is currently under the demo's finger. */
  pressTarget: DemoPressTarget | null;
  /** True while the demo is driving — the cue to silence aria-live. */
  active: boolean;
  /**
   * Callback ref for the current slide's scroll container. A callback, not an
   * object ref, because that div is inside the carousel's AnimatePresence and
   * remounts on every slide swap.
   */
  setScrollEl: (el: HTMLElement | null) => void;
};

export function useHotspotDemo<T extends DemoHotspot>({
  steps,
  scan = EMPTY_SCAN,
  imageIndex,
  galleryRef,
  openPopup,
  closePopup,
  navigate,
  shouldReduce,
}: HotspotDemoOptions<T>): HotspotDemoState {
  const [ring, setRing] = useState<RingState | null>(null);
  const [pressTarget, setPressTarget] = useState<DemoPressTarget | null>(null);
  const [active, setActive] = useState(false);

  const scrollElRef = useRef<HTMLElement | null>(null);
  const setScrollEl = useCallback((el: HTMLElement | null) => {
    scrollElRef.current = el;
  }, []);

  // Everything the running loop reads goes through a ref, so a re-render (the
  // carousel index changing, the ring moving) never restarts the sequence and
  // the gating effect can depend only on the things that genuinely gate it.
  const latest = useRef({
    steps,
    scan,
    imageIndex,
    openPopup,
    closePopup,
    navigate,
  });
  latest.current = {
    steps,
    scan,
    imageIndex,
    openPopup,
    closePopup,
    navigate,
  };

  // A generation counter. Bumping it is how every pending timer, scroll
  // animation, and awaited beat learns it is stale: each await returns whether
  // its own generation is still current, and the loop returns the moment it
  // isn't. No queued step ever lands after a cancel.
  const runIdRef = useRef(0);
  const timersRef = useRef(new Set<number>());
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null);
  const runningRef = useRef(false);
  const inViewRef = useRef(false);
  // Reader handover is permanent for the session — a one-way latch, never reset.
  const stoppedRef = useRef(false);
  // Whether the demo is the one holding a popup open, so a pause can clean it up
  // but a handover can leave it exactly where the reader found it.
  const popupOpenRef = useRef(false);

  useEffect(() => {
    // Reduced motion opts out of the whole mechanism, not a shortened version of
    // it: no ring, no scripted scrolling, no automatic paging. A demo that
    // scrolls a capture and pages a carousel by itself is precisely the
    // vestibular-trigger class the preference exists for.
    if (shouldReduce || steps.length === 0) return;
    const gallery = galleryRef.current;
    if (!gallery) return;

    const clearTimers = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current.clear();
    };

    /** Resolves true if this generation is still the current one. */
    const wait = (ms: number, id: number) =>
      new Promise<boolean>((resolve) => {
        const timer = window.setTimeout(() => {
          timersRef.current.delete(timer);
          resolve(runIdRef.current === id);
        }, ms);
        timersRef.current.add(timer);
      });

    /**
     * Eased programmatic scroll of the capture. Motion's imperative `animate`
     * rather than `behavior: "smooth"` for two reasons: it resolves when it
     * actually finishes, so the next beat can sequence off it, and it takes the
     * shared `inOut` ease so a scripted reposition matches every other
     * reposition on the site instead of the browser's own curve.
     */
    const scrollTo = (el: HTMLElement, top: number, ms: number, id: number) =>
      new Promise<boolean>((resolve) => {
        const from = el.scrollTop;
        if (Math.abs(top - from) < 1) {
          resolve(true);
          return;
        }
        const controls = animate(from, top, {
          duration: ms / 1000,
          ease: motionEase.inOut,
          onUpdate: (value) => {
            el.scrollTop = value;
          },
          onComplete: () => {
            scrollAnimRef.current = null;
            resolve(runIdRef.current === id);
          },
        });
        scrollAnimRef.current = {
          stop: () => {
            controls.stop();
            resolve(false);
          },
        };
      });

    /** Contact: contract the ring, light the target, hold, then act. */
    const pressAnd = async (target: DemoPressTarget, id: number) => {
      setRing((r) => (r ? { ...r, pressed: true, pressKey: r.pressKey + 1 } : r));
      setPressTarget(target);
      if (!(await wait(DEMO.press + DEMO.contact, id))) return false;
      setPressTarget(null);
      setRing((r) => (r ? { ...r, pressed: false } : r));
      return true;
    };

    /**
     * Reveal a region and move the hand onto it, without pressing. Shared by the
     * scan and by every press step's approach, so a read and a tap position the
     * hand by identical maths and the two never disagree about where a thing is.
     * Resolves false if this generation went stale mid-move.
     */
    const reachTo = async (
      region: { x: number; y: number; w: number; h: number },
      id: number
    ) => {
      const el = scrollElRef.current;
      if (!el) return false;
      const contentHeight = el.scrollHeight;
      const screenW = el.clientWidth;
      const screenH = el.clientHeight;
      const centreY = ((region.y + region.h / 2) / 100) * contentHeight;
      const centreX = ((region.x + region.w / 2) / 100) * screenW;
      const maxScroll = Math.max(0, contentHeight - screenH);
      const targetTop = Math.min(
        Math.max(centreY - screenH * REVEAL_ANCHOR, 0),
        maxScroll
      );
      if (!(await scrollTo(el, targetTop, DEMO.reveal, id))) return false;
      if (!(await wait(DEMO.settle, id))) return false;

      // The hand reaches in from below the screen's foot on first mount — where
      // a thumb comes from — and simply travels between targets after that.
      const ringY = centreY - el.scrollTop;
      setRing((r) =>
        r
          ? { ...r, x: centreX, y: ringY }
          : {
              x: centreX,
              y: ringY,
              from: { x: centreX, y: screenH + 44 },
              pressed: false,
              pressKey: 0,
            }
      );
      return await wait(DEMO.approach, id);
    };

    /**
     * The read-through. Runs once per loop, before anything is pressed: the hand
     * travels down the outcome heading and each recommended option in turn,
     * resting on each, touching none of them. Deliberately unhurried — this beat
     * is the reader being shown there is a set to choose from, and rushing it
     * would make it read as the demo failing to click rather than declining to.
     */
    const runScan = async (id: number) => {
      const points = latest.current.scan;
      if (points.length === 0) return true;
      for (const [i, point] of points.entries()) {
        if (latest.current.imageIndex !== point.onImage) {
          latest.current.navigate(point.onImage);
          if (!(await wait(DEMO.pageSwap, id))) return false;
        }
        if (!(await reachTo(point, id))) return false;
        // The first point is the outcome heading; the rest are options to weigh.
        if (!(await wait(i === 0 ? DEMO.scanSettle : DEMO.scanDwell, id)))
          return false;
      }
      return await wait(DEMO.scanCommit, id);
    };

    const runLoop = async (id: number) => {
      if (!(await wait(DEMO.lead, id))) return;

      while (runIdRef.current === id) {
        if (!(await runScan(id))) return;

        for (const step of latest.current.steps) {
          // The loop can only drive a trigger that is on screen. After a paged
          // step this is what brings the carousel back to the source screen.
          if (latest.current.imageIndex !== step.onImage) {
            latest.current.navigate(step.onImage);
            if (!(await wait(DEMO.pageSwap, id))) return;
          }
          const el = scrollElRef.current;
          if (!el) {
            if (!(await wait(DEMO.gap, id))) return;
            continue;
          }

          // 1 + 2. REVEAL and APPROACH — scroll the trigger to a known fraction
          // of the screen, then move the hand onto it. Shared with the scan, so
          // a read and a press position the hand identically.
          if (!(await reachTo(step, id))) return;

          // 3. PRESS.
          if (!(await pressAnd(demoPressId(step), id))) return;

          if (step.popupImage !== undefined) {
            // 4a. ACT — open the explainer, focus untouched.
            latest.current.openPopup(step);
            popupOpenRef.current = true;
            // 5. HOLD.
            if (!(await wait(DEMO.holdPopup, id))) return;
            // 6. EXIT — travel down to the capture's own "Ok" pill and press it,
            // so the popup is dismissed by a visible, labelled control rather
            // than vanishing. Down-and-out also settles the hand where a thumb
            // rests, which is where the next reach begins.
            setRing((r) =>
              r
                ? {
                    ...r,
                    x: el.clientWidth * OK_TARGET.x,
                    y: el.clientHeight * OK_TARGET.y,
                  }
                : r
            );
            if (!(await wait(DEMO.exitTravel, id))) return;
            if (!(await pressAnd(DEMO_DISMISS_ID, id))) return;
            latest.current.closePopup();
            popupOpenRef.current = false;
            if (!(await wait(DEMO.gap, id))) return;
          } else if (step.goToImage !== undefined) {
            // 4b. ACT — page to the linked screen. The hand lifts off with the
            // tap, the way it would in the product; it reaches back in from
            // below on the next step.
            latest.current.navigate(step.goToImage);
            setRing(null);
            // 5. HOLD.
            if (!(await wait(DEMO.pageSwap + DEMO.holdSlide, id))) return;
            // 6. EXIT — back to the source screen. Handled by the next step's
            // own reconciliation, so a trailing paged step still returns.
            latest.current.navigate(step.onImage);
            if (!(await wait(DEMO.pageSwap + DEMO.gap, id))) return;
          }
        }

        // Loop boundary: lift the hand, wind the capture back to the top, and
        // rest there, so the restart reads as starting over rather than jumping.
        setRing(null);
        setPressTarget(null);
        if (!(await wait(DEMO.gap, id))) return;
        const el = scrollElRef.current;
        if (el && !(await scrollTo(el, 0, DEMO.reveal, id))) return;
        if (!(await wait(DEMO.loop, id))) return;
      }
    };

    const cancel = () => {
      runIdRef.current += 1;
      clearTimers();
      scrollAnimRef.current?.stop();
      scrollAnimRef.current = null;
      runningRef.current = false;
    };

    const sync = () => {
      const shouldRun =
        inViewRef.current && !document.hidden && !stoppedRef.current;
      if (shouldRun === runningRef.current) return;
      if (shouldRun) {
        runningRef.current = true;
        setActive(true);
        const id = (runIdRef.current += 1);
        void runLoop(id);
      } else {
        cancel();
        setActive(false);
        setRing(null);
        setPressTarget(null);
        // A pause is a reset, so the restart begins clean: close a popup the
        // demo itself opened. Handover deliberately does NOT do this.
        if (popupOpenRef.current) {
          popupOpenRef.current = false;
          latest.current.closePopup();
        }
      }
    };

    // Reader handover. Capture phase, so it lands before the carousel's own
    // handlers and before anything can be mistaken for the demo's doing. One
    // way: the latch is never released for the life of the page.
    const handover = () => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      cancel();
      setActive(false);
      setRing(null);
      setPressTarget(null);
      // Whatever the demo left open stays open — the reader dismisses it with
      // the same X the demo was about to press. Never yank the screen out from
      // under a thumb that has just arrived.
      popupOpenRef.current = false;
    };
    gallery.addEventListener("pointerdown", handover, true);
    gallery.addEventListener("keydown", handover, true);
    gallery.addEventListener("focusin", handover, true);

    // In view only. A demonstration nobody can see is a battery drain and a
    // surprise: the reader scrolls back to a band mid-sequence with a popup open
    // and no idea why.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.5 }
    );
    observer.observe(gallery);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      gallery.removeEventListener("pointerdown", handover, true);
      gallery.removeEventListener("keydown", handover, true);
      gallery.removeEventListener("focusin", handover, true);
      cancel();
      inViewRef.current = false;
    };
  }, [shouldReduce, steps.length, galleryRef]);

  return { ring, pressTarget, active, setScrollEl };
}
