"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { motionDuration, motionEase } from "../lib/motion";

/* The same trigger line as MotionReveal (fires 12% into view), so a masked
   heading and the fade-up blocks around it still start at the same scroll
   position.

   `once: false` is the one deliberate difference: a heading re-sets itself every
   time it comes back into view, rather than playing once per page load like
   every other reveal on the site. A case study is scrolled up and down, and a
   gesture that only ever fires on first pass is invisible to a reader who
   scrolls back to re-read a section. It is affordable here precisely because
   the slip is cheap and short — a transform on a handful of spans. Do not
   extend this to the heavier reveals: fade-up blocks re-firing on every pass
   would make the whole page restless. */
const REVEAL_VIEWPORT = { once: false, margin: "0px 0px -12% 0px" } as const;

/* useLayoutEffect warns when a client component is server-rendered. Effects do
   not run on the server, so the swap is safe and silences the warning. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* How far past the line box the clip is allowed to bleed, in em.
 *
 * Bottom carries the descenders: a mask cutting exactly at the content box
 * shaves the tail of a "p" or "y" on tight display leading, which is obvious at
 * heading size and unmissable at the 52px leaf. The cost of the bleed is that
 * an incoming word or line is visible for its last fraction of travel, so this
 * is the smallest value that clears the tails rather than a comfortable one.
 * Top carries ascenders and diacritics and needs less; bleeding it is free
 * because nothing travels through the top edge. Sides keep tight tracking and
 * side bearings from being shaved. Tuned on screen — revisit it if this is ever
 * applied to a face or leading it was not measured against. */
const DESCENDER_BLEED = { top: 0.06, bottom: 0.12, side: 0.08 } as const;

const CLIP = `inset(${-DESCENDER_BLEED.top}em ${-DESCENDER_BLEED.side}em ${-DESCENDER_BLEED.bottom}em ${-DESCENDER_BLEED.side}em)`;

/* Cascade ceilings from the Stagger budgets table, by role: a section heading is
   a repeated in-flow element (500ms), a chapter leaf is display text (1s). The
   interval only tightens off 0.05s when an unusually long heading would
   otherwise overrun — see `intervalFor`. */
const CASCADE_BUDGET = { fast: 0.5, slow: 1 } as const;

type SlipDuration = keyof typeof CASCADE_BUDGET;

/**
 * The stagger interval for `count` items: the standard 0.05s, tightened only if
 * that would push the cascade past its budget. Mirrors how MotionRevealGroup
 * handles long lists. In practice this is a backstop rather than a live
 * behaviour — a six-line leaf still runs at the full 0.05s — but a lede is
 * editable copy, and a heading that grows by two lines should slow down its
 * interval rather than quietly overrun the display budget.
 */
function intervalFor(count: number, duration: SlipDuration) {
  const headroom = CASCADE_BUDGET[duration] - motionDuration[duration];
  return Math.max(0.02, Math.min(0.05, headroom / Math.max(1, count - 1)));
}

type MaskRevealCommon = {
  /** The outer element. It is the real node and carries `className`/`id`. */
  as: ElementType;
  /** Per-item duration: `fast` in flow, `slow` for display type. */
  duration: SlipDuration;
  className?: string;
  /** Kept on the outer element so anchor and ArrivalCue contracts still hold. */
  id?: string;
  /** Delay before the first item, e.g. to trail a preceding reveal. */
  delay?: number;
};

type MaskRevealProps = MaskRevealCommon &
  (
    | {
        /**
         * `word` for a short heading: two to six words, no measuring, wraps
         * naturally at every width because the words stay inline-block.
         *
         * `line` for a display sentence — a chapter leaf lede or a hero
         * tagline — where word by word would read as a teleprompter and
         * overrun its budget. Costs a measure pass and a resize observer,
         * because a mask per rendered line only works if the lines are known,
         * and they change with every rewrap.
         */
        mode: "word" | "line";
        /** Plain text, split per `mode`. */
        text: string;
      }
    | {
        /**
         * `block` for a unit that is not plain text — a chip, a paragraph with
         * inline markup, a small labelled group. One mask on the whole thing.
         *
         * Size is the constraint: the content travels its own height, so this
         * belongs on modest blocks. Masking a tall column as one unit sends it
         * up hundreds of pixels and reads as a panel being pushed on screen
         * rather than as type being set — and a slab that size moving at once
         * is the sort of thing reduced motion exists for. Break a column into
         * its paragraphs and slip each one instead.
         */
        mode: "block";
        children: ReactNode;
      }
  );

/**
 * The heading reveal: the heading sets itself, each word or line slipping up
 * into place from behind a clip edge, the way a line of type is set rather than
 * dropped on. Reserved for headings — it is what marks a heading as a heading,
 * so applying it further down (subsection h3s, ledes, captions) spends the
 * distinction and everything starts slipping. Everything else on the page keeps
 * `MotionReveal`'s fade-up.
 *
 * Two roles, one gesture at two granularities and two speeds, so the page reads
 * as one motion language rather than two effects:
 *
 *   Section heading — `word`, `fast`. The longest on the site is six words,
 *   resolving in 0.45s, inside the 500ms ceiling for repeated in-flow elements.
 *
 *   Chapter leaf — `line`, `slow`. An arrival moment, so the frequency gate
 *   allows the fuller treatment. Six lines resolves in 0.75s, inside the 1s
 *   display ceiling.
 *
 * The tag is the outer element and the masks are spans inside it, which is both
 * the only valid nesting and the only arrangement that keeps `id` on the real
 * heading, so anchor jumps and the ArrivalCue's heading lookup are unaffected.
 *
 * The split text stays the element's real text — no `aria-hidden` fragments
 * paired with an `sr-only` duplicate. Each fragment carries its separating
 * space as a text node, so the concatenated content is exactly the original
 * string and the accessible name comes out right on its own. The duplicate
 * approach was tried first and was wrong: it doubles the heading for anything
 * reading text content rather than the accessibility tree, so copy-paste and
 * find-in-page both returned "My roleMy role".
 *
 * Unlike every other reveal on the site, this one re-plays: the heading re-sets
 * itself each time it returns to view rather than firing once per page load.
 * See REVEAL_VIEWPORT for why that is affordable here and nowhere else.
 *
 * Under reduced motion the slip is removed entirely rather than shortened — the
 * travel is the whole effect, so a 0.01s slip is a flicker. What is left is the
 * same instant opacity change MotionReveal degrades to.
 */
export function MaskReveal(props: MaskRevealProps) {
  const { as: Tag, mode, duration, className, id, delay = 0 } = props;
  const text = mode === "block" ? "" : props.text;
  const shouldReduce = useReducedMotion();
  const { ref, lines, measured, everMeasured } = useMeasuredLines(
    text,
    mode === "line",
  );

  const items =
    mode === "line" ? lines : mode === "word" ? text.split(" ") : [];

  const item: Variants = {
    hidden: { y: shouldReduce ? 0 : "110%", opacity: shouldReduce ? 0 : 1 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration[duration],
        ease: motionEase.out,
      },
    },
  };

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: shouldReduce ? 0 : delay,
        staggerChildren: shouldReduce ? 0 : intervalFor(items.length, duration),
      },
    },
  };

  /* Block mode uses divs rather than spans: its children are arbitrary, and a
     `<p>` inside a `<span>` is invalid HTML. Word and line modes stay on spans,
     which is what an inline fragment of a heading has to be. */
  if (mode === "block") {
    return (
      <Tag className={className} id={id}>
        <motion.div
          style={{ clipPath: CLIP }}
          initial="hidden"
          whileInView="show"
          viewport={REVEAL_VIEWPORT}
          variants={container}
        >
          <motion.div variants={item}>{props.children}</motion.div>
        </motion.div>
      </Tag>
    );
  }

  return (
    <Tag className={className} id={id}>
      {/* This span declares its own initial/whileInView, so it drives its own
          fragments rather than inheriting variants from an animating ancestor —
          the diagram modules render their heading inside a staggering
          container, and without this the words would join that cascade. */}
      <motion.span
        ref={ref}
        className="block"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL_VIEWPORT}
        variants={container}
      >
        {mode === "line" && !measured ? (
          /* Measure pass: the words laid out exactly as the finished heading
             will be, so the lines they land on can be read off. `visibility`
             rather than `display` because they have to actually wrap.

             Hidden on the first pass only, so the heading does not flash fully
             visible before slipping in. On a re-measure — a resize, the only
             thing that rewraps a heading — it stays visible instead: the words
             wrap identically to the masked lines they are about to become, so
             the reader sees the heading hold still for a frame rather than
             blink out while the window is being dragged. */
          <span className={everMeasured ? undefined : "invisible"}>
            {text.split(" ").map((value, index, all) => (
              <span key={`${value}-${index}`} data-slip-word>
                {value}
                {index < all.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        ) : (
          items.map((value, index) => (
            <MaskedFragment
              key={`${value}-${index}`}
              mode={mode}
              last={index === items.length - 1}
            >
              <motion.span
                className={mode === "line" ? "block" : "inline-block"}
                variants={item}
              >
                {value}
              </motion.span>
            </MaskedFragment>
          ))
        )}
      </motion.span>
    </Tag>
  );
}

/**
 * One masked fragment. clip-path rather than an overflow-hidden wrapper:
 * overflow needs padding to clear descenders and a negative margin to undo the
 * padding, and on an inline-block word that pair shifts the baseline. clip-path
 * clips without touching layout, so a masked fragment sits exactly where an
 * unmasked one would — and in word mode the fragments stay inline-block, so the
 * heading still wraps naturally at every width with nothing to measure.
 *
 * Every fragment carries the separating space as a real text node outside its
 * mask. That is what keeps the split text readable as text: the element's text
 * content stays the original string, so copy-paste, find-in-page, translation,
 * and the accessible name all get "My role" rather than "Myrole". It has to sit
 * outside the mask or it would be clipped along with the fragment and the
 * heading would lose its word spacing.
 */
function MaskedFragment({
  mode,
  last,
  children,
}: {
  mode: "word" | "line";
  last: boolean;
  children: ReactNode;
}) {
  if (mode === "line") {
    return (
      <span className="block" style={{ clipPath: CLIP }}>
        {children}
        {/* Trailing rather than between: the fragment is a block, so the space
            collapses at the end of the line and never renders, while still
            joining this line to the next in the text content. */}
        {last ? null : " "}
      </span>
    );
  }
  return (
    <span>
      <span className="inline-block" style={{ clipPath: CLIP }}>
        {children}
      </span>
      {last ? null : " "}
    </span>
  );
}

/**
 * Groups a heading's words into its rendered lines by measuring where each one
 * landed, so line mode can put one mask per line. Re-measures when the element
 * changes width, because a heading that rewraps needs new groups or the masks
 * stop matching the lines.
 */
function useMeasuredLines(text: string, enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [measured, setMeasured] = useState(false);
  /* Whether a measurement has ever succeeded, which distinguishes the first
     pass (hide the words, nothing has been shown yet) from a re-measure after a
     resize (keep them visible, the heading is already on screen). It only ever
     flips once, in the same batch as the first `setMeasured`, so it costs no
     extra render. */
  const [everMeasured, setEverMeasured] = useState(false);

  const measure = useCallback(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const wordEls = root.querySelectorAll<HTMLElement>("[data-slip-word]");
    if (wordEls.length === 0) {
      return;
    }
    const next: string[] = [];
    let currentTop: number | null = null;
    wordEls.forEach((el) => {
      const top = el.offsetTop;
      const word = (el.textContent ?? "").trim();
      /* A 1px tolerance: sub-pixel line positions can differ between words on
         the same line, and an exact comparison then splits one line into two. */
      if (currentTop === null || Math.abs(top - currentTop) > 1) {
        currentTop = top;
        next.push(word);
      } else {
        next[next.length - 1] = `${next[next.length - 1]} ${word}`;
      }
    });
    setLines(next);
    setEverMeasured(true);
    setMeasured(true);
  }, []);

  /* New text means the old groups are stale — drop back to the measure pass so
     the words are in the DOM to be read again. */
  useIsomorphicLayoutEffect(() => {
    if (enabled) {
      setMeasured(false);
    }
  }, [enabled, text]);

  useIsomorphicLayoutEffect(() => {
    if (enabled && !measured) {
      measure();
    }
  }, [enabled, measured, measure]);

  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root || typeof ResizeObserver === "undefined") {
      return;
    }
    /* Width only. Every leaf heading sits inside a CollapsingLeaf, which
       resizes its content on every scroll frame as the leaf collapses — keying
       off any resize would throw the heading back to its measure pass
       continuously while the reader scrolls. Only a width change can rewrap a
       line, so only a width change invalidates the groups. */
    let lastWidth = root.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const width = root.getBoundingClientRect().width;
      if (Math.abs(width - lastWidth) < 1) {
        return;
      }
      lastWidth = width;
      setMeasured(false);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, lines, measured, everMeasured };
}
