"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { motionDuration, motionEase } from "./motion";

/**
 * The auto-demo sequencer for a LIVE prototype — the running React prototype in
 * the funding finder hero (FundingHero → MobilePrototype).
 *
 * WHY THIS EXISTS ALONGSIDE `useHotspotDemo`. That hook demonstrates a
 * SCREENSHOT: it knows where things are because the author measured them off
 * the capture as percentages, and "acting" means opening a modal image or
 * paging a carousel. This one demonstrates a WORKING APP. There is nothing to
 * measure — the elements are really there, so the hand finds them by a
 * `data-demo` attribute and presses them with real pointer events, and the
 * product's own state machine does the rest. Nothing here knows what a bank row
 * or a Continue button IS; it knows there is an element with that id and that
 * pressing it is what a thumb would do.
 *
 * Which is also why the two are not merged. A shared hook would have to carry
 * both coordinate models and both notions of "act", and the interesting half of
 * each one is exactly the half the other does not need. What they DO share is
 * the rulebook (.docs/auto-demo.md) and the pointer (TouchRing), and every
 * non-negotiable below is the same rule implemented against a different target:
 *
 * - IN VIEW, OR NOT RUNNING. IntersectionObserver on the handset plus
 *   `visibilitychange`.
 * - REDUCED MOTION NEVER STARTS ANYTHING. No ring, no scripted scrolling, no
 *   automatic screen changes; the prototype sits on its first screen and is
 *   worked by hand. What the preference governs is what the page does
 *   UNASKED — `start()` exists so a reader can ask, and nothing runs until
 *   they do.
 * - THE READER ALWAYS WINS, PERMANENTLY. The first trusted pointerdown,
 *   keydown, or focusin inside the stage latches the demo off for the life of
 *   the page, and leaves the prototype on whatever screen it had reached — the
 *   reader carries on from there rather than being yanked back to the start.
 * - NEVER STEAL FOCUS. The demo presses with pointer events, never `.focus()`;
 *   `driving` is published so the prototype can suppress its own autofocus
 *   while the hand is the one working it.
 * - CLEAN UP EVERYTHING. Generation counter, timer set, scroll animation
 *   handle — cancelled on pause, on handover, and on unmount.
 */

/** One beat of the walkthrough. */
export type FlowStep = {
  /** `data-demo` id of the element the hand travels to. */
  target: string;
  /**
   * False makes this a READ rather than a press: the hand travels to the
   * element, rests on it, and moves on. Same purpose as `demoScan` in the
   * screenshot demo — a press sequence that never pauses to look at anything
   * answers "what happens if I tap this" before the reader has been shown
   * there was anything to tap.
   */
  press?: boolean;
  /**
   * Extra dwell after the beat, ms. This is reading time, so it is honest
   * milliseconds rather than a motion token stretched out of shape — a screen
   * with a list to take in gets more than a button that just advanced.
   */
  hold?: number;
  /** What the beat is. Authoring aid; nothing renders it. */
  label?: string;
};

/**
 * Every beat in one place, so the loop's pacing is tuned here and nowhere else.
 * Movement beats are the shared motion tokens (the ring's own transitions in
 * TouchRing use the same values, so the sequencer and the visual cannot drift);
 * dwell beats are milliseconds.
 */
const DEMO = {
  /** Beat after the handset settles in view, before the first reach. */
  lead: 900,
  /** Eased scroll bringing a target into the screen. */
  reveal: motionDuration.slow * 1000,
  /** Beat after the screen settles, before the hand moves. */
  settle: motionDuration.fast * 1000,
  /** Ring fades in and travels. Matches TouchRing's x/y transition. */
  approach: motionDuration.slow * 1000,
  /** Contraction and ripple. */
  press: motionDuration.base * 1000,
  /** Contact held BEFORE the action fires, so cause reads before effect. */
  contact: motionDuration.fast * 1000,
  /** Beat between steps. */
  gap: 420,
  /** How long to keep looking for a target that has not mounted yet. */
  targetTimeout: 9000,
  /** Poll interval while waiting for one. */
  targetPoll: 60,
  /** Hand off the glass, then rest, before the prototype is wound back. */
  loopOut: 700,
  /** Pause on the first screen before the walkthrough starts again. */
  loop: 1600,
} as const;

/** Where a target is parked vertically in the screen when it has to be scrolled to. */
const REVEAL_ANCHOR = 0.45;

/**
 * The board is authored at the prototype's own pixel size and scaled by a
 * single transform, so all the geometry below is in PROTOTYPE pixels and the
 * ring — which lives inside the same scaled box — needs no conversion.
 */
type RingState = {
  x: number;
  y: number;
  from: { x: number; y: number };
  pressed: boolean;
  pressKey: number;
};

export type FlowDemoOptions = {
  /** The walkthrough. Empty disables the demo entirely. */
  steps: FlowStep[];
  /** The stage: the handover surface. */
  stageRef: { current: HTMLElement | null };
  /** The prototype board: the coordinate space, and where targets are found. */
  boardRef: { current: HTMLElement | null };
  /**
   * What the in-view gate observes. MUST be an element that outlives the
   * prototype — never the board, which is remounted by `reset()` at every loop
   * boundary and on every pause.
   *
   * This is not a nicety. An IntersectionObserver is attached once and holds
   * the node it was given: point it at the board and the first wind-back tears
   * that node out of the DOM, the observer fires a final `isIntersecting:
   * false` for the detached element, the loop is cancelled as "scrolled away",
   * and nothing ever observes the replacement. The demo then plays exactly once
   * and is dead for the life of the page — including for a reader who scrolls
   * back to it. Pass the slot that holds the handset's box: same geometry, no
   * remount.
   */
  viewRef: { current: HTMLElement | null };
  /** Winds the prototype back to its first screen at the loop boundary. */
  reset: () => void;
  shouldReduce: boolean | null;
};

/**
 * Where the walkthrough is, from the reader's point of view. This is what a
 * play control renders off, and the four states are deliberately not
 * interchangeable:
 *
 * - `idle` — never run, or stopped, or paused out of view. A run may start.
 * - `playing` — the hand is on the glass.
 * - `done` — an opt-in run finished by itself. A replay is honest here.
 * - `handedOver` — a trusted touch landed on the stage. AUTOPLAY IS RETIRED for
 *   the life of the page: nothing the reader did not ask for will ever run
 *   again, which is the whole of "never fight a thumb". It is not, however, the
 *   end of the walkthrough — `start()` is accepted from here, because a
 *   deliberate press of a labelled control is the reader ASKING, and the rule
 *   the latch enforces is about what the page does UNASKED. Without that, the
 *   only way back to the demonstration after touching the prototype is a page
 *   reload (.docs/auto-demo.md §3).
 */
export type FlowDemoPhase = "idle" | "playing" | "done" | "handedOver";

export type FlowDemoState = {
  /** Ring props in prototype pixels, or null when nothing is on the glass. */
  ring: RingState | null;
  /**
   * True while the demo is driving. The prototype reads this to suppress its
   * own autofocus, and the stage reads it to silence aria-live.
   */
  driving: boolean;
  phase: FlowDemoPhase;
  /**
   * True when the demo will NOT start on its own — reduced motion, today the
   * only case. This is the whole justification for a play control: where the
   * loop autoplays, a button offering to start it is chrome for a thing that
   * already happened, and where it does not, a button is the only way in.
   * Publish the reason rather than making the component re-derive it, so
   * "should there be a control" has one answer.
   */
  manual: boolean;
  /**
   * True once a trusted touch has retired autoplay. The other half of "should
   * there be a control": from here the walkthrough will never run unasked
   * again, in either motion mode, so the offer has to be standing rather than
   * inferred from `phase` — which moves to `playing` and `done` while the
   * reason for offering it has not changed.
   */
  latched: boolean;
  /**
   * Run the walkthrough ONCE, by explicit request. Refuses only while a run is
   * already in flight — a second hand on the glass. Always winds the prototype
   * back first, so it is a fresh run and never a resume, and that wind-back is
   * exactly why it may only ever be reached through a labelled control: the
   * reader is being told what it will do before it throws their session away.
   */
  start: () => void;
  /**
   * Abandon a run in progress. Lifts the hand and leaves the prototype on
   * whatever screen it reached — a reader who stops the walkthrough is taking
   * it over, and being wound back to the first screen would be the demo having
   * the last word. The offer comes straight back (a deliberate press of a
   * labelled control is not a thumb to be protected from); whether that reads
   * as `idle` or `handedOver` depends only on whether autoplay was already
   * retired.
   */
  stop: () => void;
};

export function useFlowDemo({
  steps,
  stageRef,
  boardRef,
  viewRef,
  reset,
  shouldReduce,
}: FlowDemoOptions): FlowDemoState {
  const [ring, setRing] = useState<RingState | null>(null);
  const [phase, setPhase] = useState<FlowDemoPhase>("idle");

  // Everything the running loop reads goes through a ref, so a re-render (the
  // ring moving, the prototype changing screen) never restarts the sequence.
  const latest = useRef({ steps, reset });
  useEffect(() => {
    latest.current = { steps, reset };
  });

  // A generation counter. Bumping it is how every pending timer, scroll
  // animation, and awaited beat learns it is stale: each await resolves with
  // whether its own generation is still current, and the loop returns the
  // moment it is not.
  const runIdRef = useRef(0);
  const timersRef = useRef(new Set<number>());
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null);
  const runningRef = useRef(false);
  const inViewRef = useRef(false);
  // Reader handover is permanent for the session — a one-way latch, never reset.
  const stoppedRef = useRef(false);
  // An outstanding request from `start()`. The autoplay gate and this one are
  // separate on purpose: autoplay is a property of the page, a request is a
  // property of one reader pressing one button, and it is cleared the moment
  // the run it authorised ends or is paused. Nothing here ever re-raises it.
  const requestedRef = useRef(false);
  // `sync` closes over the running loop, so it is published for `start`/`stop`
  // rather than hoisted out of the effect with it.
  const syncRef = useRef<() => void>(() => {});

  /**
   * The demo runs itself. Reduced motion is the one thing that turns it off:
   * a prototype that scrolls itself and changes its own screens is precisely
   * the vestibular-trigger class the preference exists for, so nothing
   * autostarts and the prototype sits on its first screen to be worked by hand
   * (.docs/auto-demo.md §3).
   *
   * What the preference does NOT do is forbid the reader from asking for the
   * walkthrough. An explicit press is consent, and withholding the only
   * complete account of the flow from the readers who asked for calm is a
   * worse answer than letting them opt in — the same argument SymptomsHero's
   * replay chip makes for its recording. So the effect below installs for both
   * modes, and this flag decides only whether a run needs asking for.
   */
  const autoplay = !shouldReduce && steps.length > 0;

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current.clear();
  }, []);

  /**
   * Tear down whatever is in flight. Bumping the generation is what tells every
   * pending timer, awaited beat, and scroll animation that it is stale.
   */
  const cancel = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    scrollAnimRef.current?.stop();
    scrollAnimRef.current = null;
    runningRef.current = false;
  }, [clearTimers]);

  // The ref is what the sequencer reads mid-run; the state is what the hero
  // renders the offer from. Both, because a ref cannot re-render and state
  // cannot be read synchronously by a loop already in flight.
  const [latched, setLatched] = useState(false);
  const latch = useCallback(() => {
    stoppedRef.current = true;
    setLatched(true);
  }, []);

  const start = useCallback(() => {
    // A second run on top of a running one would leave two hands on the glass.
    // Handover, deliberately, is NOT a refusal: the latch retires autoplay, not
    // the reader's ability to ask for the walkthrough back.
    if (runningRef.current) return;
    requestedRef.current = true;
    // The reader pressed a control attached to the handset, so the handset is
    // in view by construction — say so rather than let a 0.5 threshold that has
    // not fired since the last scroll turn the button into a dead one. The
    // observer's next callback is authoritative from here on.
    inViewRef.current = true;
    // A run always begins at the first screen. `reset()` is a remount, which is
    // the only wind-back that cannot leave a screen's own state behind, and it
    // is what makes the label honest: this is a fresh run, never a resume.
    latest.current.reset();
    syncRef.current();
  }, []);

  const stop = useCallback(() => {
    requestedRef.current = false;
    if (!runningRef.current) return;
    cancel();
    setRing(null);
    // Deliberately NOT `reset()`: the prototype stays on the screen the
    // walkthrough reached, exactly as it would after a handover.
    setPhase(stoppedRef.current ? "handedOver" : "idle");
  }, [cancel]);

  useEffect(() => {
    if (steps.length === 0) return;
    const stage = stageRef.current;
    if (!stage) return;

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
     * Eased programmatic scroll of a screen's own scroll container. Motion's
     * imperative `animate` rather than `behavior: "smooth"`, for the same two
     * reasons as the screenshot demo: it resolves when it actually finishes, so
     * the next beat can sequence off it, and it takes the shared `inOut` ease so
     * a scripted reposition matches every other reposition on the site.
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

    /**
     * The step's element, once it exists. A press changes the screen, so the
     * next step's target is routinely mid-mount (or, on the matching screen,
     * five seconds of progress bar away) when the loop asks for it. Polling
     * beats a fixed wait: the loop moves on as soon as the product is ready.
     */
    const awaitTarget = async (
      target: string,
      id: number
    ): Promise<HTMLElement | null> => {
      const deadline = DEMO.targetTimeout / DEMO.targetPoll;
      for (let i = 0; i < deadline; i += 1) {
        const board = boardRef.current;
        const el = board?.querySelector<HTMLElement>(
          `[data-demo="${target}"]:not([disabled])`
        );
        if (el) return el;
        if (!(await wait(DEMO.targetPoll, id))) return null;
      }
      return null;
    };

    /** The screen's own scrolling column, if the target sits inside one. */
    const scrollParent = (el: HTMLElement) => {
      const board = boardRef.current;
      let node: HTMLElement | null = el.parentElement;
      while (node && node !== board) {
        const overflow = getComputedStyle(node).overflowY;
        if (
          (overflow === "auto" || overflow === "scroll") &&
          node.scrollHeight - node.clientHeight > 4
        ) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    };

    /**
     * Bring the target into the screen and move the hand onto it, without
     * pressing. Shared by a read and by every press step's approach, so the two
     * position the hand by identical maths and can never disagree about where a
     * thing is.
     *
     * The scroll only runs when the target is genuinely awkward — most of these
     * screens fit their handset, and easing a column that is already showing
     * the button reads as the demo fidgeting.
     */
    const reachTo = async (el: HTMLElement, id: number) => {
      const board = boardRef.current;
      if (!board) return false;

      const column = scrollParent(el);
      if (column) {
        const colBox = column.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        const comfortable =
          box.top >= colBox.top + colBox.height * 0.12 &&
          box.bottom <= colBox.bottom - colBox.height * 0.12;
        if (!comfortable) {
          const centre =
            column.scrollTop + (box.top - colBox.top) + box.height / 2;
          const target = Math.min(
            Math.max(centre - colBox.height * REVEAL_ANCHOR, 0),
            Math.max(0, column.scrollHeight - column.clientHeight)
          );
          if (!(await scrollTo(column, target, DEMO.reveal, id))) return false;
          if (!(await wait(DEMO.settle, id))) return false;
        }
      }

      // Measured after any scroll, and divided back out of the board's own
      // scale so the ring — a child of the unscaled 390x800 board — lands on the
      // element at any rendered size.
      const boardBox = board.getBoundingClientRect();
      const scale = boardBox.width / board.offsetWidth || 1;
      const box = el.getBoundingClientRect();
      const x = (box.left + box.width / 2 - boardBox.left) / scale;
      const y = (box.top + box.height / 2 - boardBox.top) / scale;

      // The hand reaches in from below the handset's foot on first mount —
      // where a thumb comes from — and simply travels between targets after.
      setRing((r) =>
        r
          ? { ...r, x, y }
          : {
              x,
              y,
              from: { x, y: board.offsetHeight + 48 },
              pressed: false,
              pressKey: 0,
            }
      );
      return await wait(DEMO.approach, id);
    };

    /**
     * Contact, then the press itself.
     *
     * The events are the product's own: a `pointerdown`/`pointerup` pair (which
     * is what the prototype's buttons animate off) followed by a `click` (which
     * is what its rows and cards listen for). No private demo pathway, no
     * bypassing the component's handler — the demo works the prototype exactly
     * as a thumb does, which is the whole claim it is making.
     *
     * They are untrusted events by construction, which is what keeps the
     * handover listener from mistaking the demo's own press for the reader
     * arriving.
     */
    const pressAnd = async (el: HTMLElement, id: number) => {
      setRing((r) => (r ? { ...r, pressed: true, pressKey: r.pressKey + 1 } : r));
      const options = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
      };
      el.dispatchEvent(new PointerEvent("pointerdown", options));
      // Contact is held before the action fires, so the tap reads as CAUSING
      // the next screen rather than coinciding with it.
      if (!(await wait(DEMO.press + DEMO.contact, id))) {
        el.dispatchEvent(new PointerEvent("pointerup", options));
        return false;
      }
      el.dispatchEvent(new PointerEvent("pointerup", options));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      setRing((r) => (r ? { ...r, pressed: false } : r));
      return true;
    };

    /**
     * `once` is the difference between a demonstration the page is giving and
     * one the reader asked for. An autoplaying loop is ambient and is stopped
     * by scrolling away; a requested run answers the request and then gets out
     * of the way, resting on the screen it finished on rather than winding
     * itself back to go round again.
     */
    const runLoop = async (id: number, once: boolean) => {
      if (!(await wait(DEMO.lead, id))) return;

      while (runIdRef.current === id) {
        for (const step of latest.current.steps) {
          const el = await awaitTarget(step.target, id);
          if (runIdRef.current !== id) return;
          // A target that never arrived means the prototype is somewhere the
          // script did not expect. Bail to the loop boundary and start clean
          // rather than pressing whatever happens to be under the hand.
          if (!el) break;

          if (!(await reachTo(el, id))) return;
          if (step.press !== false && !(await pressAnd(el, id))) return;
          if (!(await wait(step.hold ?? DEMO.gap, id))) return;
        }

        // Loop boundary: lift the hand, then wind the prototype back. Lifting
        // first matters — resetting under a resting ring reads as the hand
        // having pressed something it did not.
        setRing(null);
        if (!(await wait(DEMO.loopOut, id))) return;
        if (once) {
          // The run the reader asked for is over. The request is spent — it is
          // never re-raised by scrolling back, only by another press.
          requestedRef.current = false;
          runningRef.current = false;
          setPhase("done");
          return;
        }
        latest.current.reset();
        if (!(await wait(DEMO.loop, id))) return;
      }
    };

    const sync = () => {
      // Two independent grounds to be running, and the latch only ever kills
      // the first: the page's own ambient loop, which a touch retires for good,
      // and a run the reader asked for, which survives the latch because it IS
      // the reader.
      const requested = requestedRef.current;
      const shouldRun =
        inViewRef.current &&
        !document.hidden &&
        ((autoplay && !stoppedRef.current) || requested);
      if (shouldRun === runningRef.current) return;
      if (shouldRun) {
        runningRef.current = true;
        setPhase("playing");
        const id = (runIdRef.current += 1);
        // A requested run answers the request and stops; only the ambient loop
        // goes round again.
        void runLoop(id, requested);
      } else {
        cancel();
        setRing(null);
        // A PAUSE is a reset, so the restart begins clean. A HANDOVER is not —
        // see below. A requested run that scrolls out of view is a pause AND
        // spends its request: it winds back and offers itself again rather than
        // resuming mid-flow under a reader who has come back to it.
        requestedRef.current = false;
        latest.current.reset();
        setPhase(stoppedRef.current ? "handedOver" : "idle");
      }
    };
    syncRef.current = sync;

    // Reader handover. Capture phase, so it lands before the prototype's own
    // handlers and before anything can be mistaken for the demo's doing.
    // `isTrusted` is what separates a thumb from the sequencer's own synthetic
    // press. One way: the latch is never released for the life of the page, and
    // the prototype is left on whatever screen it had reached — never yank the
    // screen out from under someone who has just touched it.
    //
    // What it retires is AUTOPLAY, not the walkthrough. `phase` goes to
    // `handedOver` so the hero can offer the walkthrough back as a labelled
    // Replay — which is the only route to it from here, and the reason that
    // route has to be a control the reader presses rather than anything the
    // page decides on its own. A wind-back throws away whatever application
    // they had started; pressing a button that says Replay is asking for that,
    // and a loop resuming behind their back is not.
    //
    // It latches under reduced motion too, where nothing was running, so the
    // control's label tracks the same states in both modes.
    const handover = (event: Event) => {
      if (!event.isTrusted) return;
      // Already latched with nothing in flight: the reader is simply using the
      // prototype, and there is nothing to take away from them. Bail before
      // touching state, so ordinary use does not re-render the hero on every
      // tap.
      if (stoppedRef.current && !runningRef.current && !requestedRef.current) {
        return;
      }
      latch();
      requestedRef.current = false;
      cancel();
      setRing(null);
      setPhase("handedOver");
    };
    stage.addEventListener("pointerdown", handover, true);
    stage.addEventListener("keydown", handover, true);
    stage.addEventListener("focusin", handover, true);

    // In view only. A demonstration nobody can see is a battery drain, and a
    // reader scrolling back to find the prototype four screens deep with no
    // explanation is a bug. The HANDSET is what is observed, not the stage
    // around it: the stage is tall enough that a sliver of its top edge would
    // otherwise start the walkthrough well before the phone is on screen. The
    // slot standing in for the handset rather than the board itself is load
    // bearing — see `viewRef`.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.5 }
    );
    const viewTarget = viewRef.current;
    if (viewTarget) observer.observe(viewTarget);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stage.removeEventListener("pointerdown", handover, true);
      stage.removeEventListener("keydown", handover, true);
      stage.removeEventListener("focusin", handover, true);
      cancel();
      inViewRef.current = false;
    };
  }, [autoplay, cancel, steps.length, stageRef, boardRef, viewRef, latch]);

  return {
    ring,
    driving: phase === "playing",
    phase,
    manual: !autoplay && steps.length > 0,
    latched,
    start,
    stop,
  };
}
