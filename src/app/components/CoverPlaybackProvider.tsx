"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useInView } from "motion/react";

/* Rotating-spotlight cover playback. The home grid's animated covers used to
   loop continuously while in view — several films at once, a page that never
   quiets. Instead this coordinator grants playback to exactly one cover at a
   time, in document order: an in-view card plays a single pass of its film,
   freezes on its frame, and after a short breather (HANDOFF_MS) the next
   eligible in-view card takes its turn. Once every in-view card has played the
   current cycle the grid rests (CYCLE_REST_MS), the per-cycle `played` set
   clears, and the rotation restarts from the top-most in-view card — the
   spotlight keeps circling for as long as anything is on screen. A single card
   alone in view simply replays every cycle; nothing in view idles with no
   looping timers. Hover is untouched and lives outside the queue (see the play
   condition in each cover).

   Built once with `useMemo`; all mutable state lives in closures, so a grant, a
   hand-off, or a timer tick never re-renders the provider. */

export const HANDOFF_MS = 1500; // breather between passes within a cycle
export const CYCLE_REST_MS = 4000; // rest once every in-view card has played
const KICK_MS = 50; // settle the initial IntersectionObserver batch before the first grant

type FilmCoordinator = {
  /** Announce a cover with its grant notifier; returns an unregister cleanup. */
  register(el: HTMLElement, notify: (granted: boolean) => void): () => void;
  /** Report whether the card is meaningfully on screen (drives eligibility). */
  setInView(el: HTMLElement, inView: boolean): void;
  /** Pass done / left mid-pass / play() rejected: release the grant and advance. */
  complete(el: HTMLElement): void;
};

const CoverPlaybackContext = createContext<FilmCoordinator | null>(null);

/* All mutable coordinator state lives on one object so the closures below
   mutate its fields rather than reassigning render-scoped variables (kept in a
   ref, the sanctioned escape hatch, so nothing here re-renders the provider). */
type TimerKind = "handoff" | "rest";
type CoordinatorState = {
  /* Every registered cover mapped to its live grant notifier. */
  notifiers: Map<HTMLElement, (granted: boolean) => void>;
  /* Cards meaningfully on screen right now. */
  inView: Set<HTMLElement>;
  /* Cards that have taken their turn in the current cycle. */
  played: Set<HTMLElement>;
  /* The single current holder of the playback grant. */
  current: HTMLElement | null;
  /* The one pending hand-off / rest timer, if any. */
  timerId: number | null;
  timerKind: TimerKind | null;
};

export function CoverPlaybackProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<CoordinatorState>(null);
  if (stateRef.current === null) {
    stateRef.current = {
      notifiers: new Map(),
      inView: new Set(),
      played: new Set(),
      current: null,
      timerId: null,
      timerKind: null,
    };
  }

  const coordinator = useMemo<FilmCoordinator>(() => {
    const s = stateRef.current as CoordinatorState;

    const clearTimer = () => {
      if (s.timerId !== null) {
        window.clearTimeout(s.timerId);
        s.timerId = null;
      }
      s.timerKind = null;
    };

    /* In-view, not yet played this cycle, earliest in document order first. */
    const eligible = () =>
      [...s.inView]
        .filter((el) => !s.played.has(el))
        .sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
        );

    const grant = (el: HTMLElement) => {
      s.current = el;
      s.notifiers.get(el)?.(true);
    };

    /* Fired by every timer: reset the timer fields, and on a rest tick reset the
       cycle before advancing so the rotation restarts from the top-most card. */
    const grantNext = () => {
      if (s.current) return;
      const next = eligible()[0];
      if (next) {
        grant(next);
      } else if (s.inView.size > 0) {
        /* Nothing eligible but cards remain on screen: rest, then reset+restart. */
        schedule(CYCLE_REST_MS, "rest");
      }
      /* Else: empty viewport — idle with no timer. */
    };

    const schedule = (delay: number, kind: TimerKind) => {
      clearTimer();
      s.timerKind = kind;
      s.timerId = window.setTimeout(() => {
        s.timerId = null;
        const wasRest = s.timerKind === "rest";
        s.timerKind = null;
        if (wasRest) s.played.clear();
        grantNext();
      }, delay);
    };

    const complete = (el: HTMLElement) => {
      /* Idempotency guard: a straggler `timeupdate` can fire `endFilm` after a
         scroll-out already completed this holder. The late call must not clear a
         fresh holder — and must not mark it played on this early-return path. */
      if (s.current !== el) return;
      s.played.add(el);
      s.current = null;
      s.notifiers.get(el)?.(false);
      /* Pick the next delay here (rather than routing through grantNext) so the
         single-card case rests once, not HANDOFF_MS stacked onto CYCLE_REST_MS. */
      if (eligible().length > 0) {
        schedule(HANDOFF_MS, "handoff");
      } else if (s.inView.size > 0) {
        schedule(CYCLE_REST_MS, "rest");
      } else {
        clearTimer();
      }
    };

    const setInView = (el: HTMLElement, inView: boolean) => {
      if (inView) {
        s.inView.add(el);
        if (s.current) return; // something is already playing
        /* A pending hand-off must never be pushed back — cards streaming in
           during a scroll must not starve the grant. */
        if (s.timerKind === "handoff") return;
        if (s.timerKind === "rest") {
          /* A fresh card preempts the rest to the short breather; an already-
             played re-entrant waits out the rest for the next cycle. */
          if (!s.played.has(el)) schedule(HANDOFF_MS, "handoff");
          return;
        }
        /* Idle: uniform short kick lets the initial IntersectionObserver batch
           settle so the true top-most card wins the first grant. */
        schedule(KICK_MS, "handoff");
      } else {
        s.inView.delete(el);
        /* If the holder left mid-pass, complete it: counts for this cycle and
           advances. A now-pointless pending timer just fires once into
           grantNext, finds nothing, and idles. */
        if (s.current === el) complete(el);
      }
    };

    const register = (
      el: HTMLElement,
      notify: (granted: boolean) => void,
    ) => {
      s.notifiers.set(el, notify);
      return () => {
        /* Scrub every collection — a dead element lingering in `inView` would
           keep an empty grid looping rest timers forever. */
        s.notifiers.delete(el);
        s.inView.delete(el);
        s.played.delete(el);
        if (s.current === el) {
          /* Unregistering the current holder (e.g. a strict-mode double-mount
             race): release without marking it played, then advance. */
          s.current = null;
          schedule(HANDOFF_MS, "handoff");
        }
      };
    };

    return { register, setInView, complete };
  }, []);

  /* Clear any pending timer on unmount so a hot reload leaves nothing dangling. */
  useEffect(() => {
    const s = stateRef.current as CoordinatorState;
    return () => {
      if (s.timerId !== null) {
        window.clearTimeout(s.timerId);
        s.timerId = null;
        s.timerKind = null;
      }
    };
  }, []);

  return (
    <CoverPlaybackContext.Provider value={coordinator}>
      {children}
    </CoverPlaybackContext.Provider>
  );
}

/**
 * Card-side hook: registers the card with the coordinator, reports its
 * viewport presence, and surfaces the current grant back as `filmActive`.
 *
 * - `enabled` should be `hasCover && !shouldReduce`. Disabled cards (no cover,
 *   or reduced motion) never register, so they can neither hold nor block the
 *   rotating spotlight.
 * - `filmActive` is the only React state: true while this card holds the grant.
 *   The coordinator owns it — `notify(true/false)` sets it on grant and release.
 * - `endFilm` releases the grant so the spotlight advances. Call it when the
 *   film's pass ends (it is also called by the cover's `useCoverFilm` when
 *   `play()` is rejected, so the rotation never stalls).
 *
 * Context may be null (used outside the provider) — the hook then no-ops.
 */
export function useCoverFilmGrant(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): { filmActive: boolean; endFilm: () => void } {
  const coordinator = useContext(CoverPlaybackContext);
  /* Grant on meaningful visibility, not a first sliver: a card takes its turn
     when it is actually on screen to watch. (The cover's own useInView still
     gates play at any intersection.) */
  const inView = useInView(ref, { amount: 0.4 });
  const [granted, setGranted] = useState(false);

  /* Register once mounted (and enabled). The coordinator drives `granted`
     through the notifier, so there is no local grant mirror to keep in sync. */
  useEffect(() => {
    const el = ref.current;
    if (!coordinator || !el || !enabled) return;
    const unregister = coordinator.register(el, setGranted);
    return () => {
      unregister();
      setGranted(false);
    };
  }, [coordinator, enabled, ref]);

  /* Report visibility. No cleanup: a cleanup calling `setInView(false)` would
     spuriously complete (and mark played) the holder on a strict-mode remount —
     unregister already scrubs `inView` when the card truly leaves. */
  useEffect(() => {
    const el = ref.current;
    if (!coordinator || !enabled || !el) return;
    coordinator.setInView(el, inView);
  }, [inView, coordinator, enabled, ref]);

  const endFilm = useCallback(() => {
    const el = ref.current;
    if (!coordinator || !el) return;
    coordinator.complete(el);
  }, [coordinator, ref]);

  return { filmActive: granted, endFilm };
}
