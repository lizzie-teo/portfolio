"use client";

/*
 * EXPLORE-ONLY. The candidate heading primitive under test on
 * /explore/heading-motion. Not wired into any real page yet — if a direction
 * wins, the surviving mode graduates into src/app/components/ as MaskReveal and
 * this file goes away with the explore page.
 *
 * THE GESTURE. Type slips up into place from behind a clip edge, the way a line
 * is set rather than dropped on. It is transform-only (no layout, no paint of
 * the mask itself) and reads as printing, which is the language the case study
 * is already speaking: chapter title pages, engraved plates, the rule under the
 * plate.
 *
 * WHY clip-path AND NOT overflow-hidden. An overflow-hidden wrapper needs
 * padding to clear descenders and a matching negative margin to undo the
 * padding, and on an inline-block word that pair shifts the baseline. clip-path
 * clips without touching layout at all, so a masked word sits on exactly the
 * baseline an unmasked one would. The bleed below the line (see DESCENDER_BLEED)
 * is the one number that has to be judged on screen rather than reasoned about.
 *
 * STRUCTURE. `as` is the outer element and carries the heading class, so a real
 * h2/h3 wraps the masks rather than the masks wrapping a heading — the masks are
 * spans inside the heading, which is the only nesting that is valid HTML and the
 * only one that keeps the `id` contract ArrivalCue relies on intact.
 */

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import { motionDuration, motionEase } from "@/app/lib/motion";

/* Matches MotionReveal's trigger line exactly, so a masked heading and the
   fade-up blocks around it start at the same scroll position. */
const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/* useLayoutEffect warns when a client component is server-rendered. Effects do
   not run on the server, so the swap is safe and silences the warning. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/* How far past the line box the clip is allowed to bleed, in em.
 *
 * Bottom carries the descenders. `leading-[1.12]` on the leaf heading is tight
 * enough that a "p" or "y" tail can sit on or past the content-box edge, and a
 * clipped tail at 52px is obvious. The cost of the bleed is that the incoming
 * line is visible for its last 0.12em of travel — a sliver below the baseline —
 * so this wants to be the smallest value that clears the tails, found on screen.
 *
 * Top carries ascenders and diacritics; it needs far less, and bleeding it is
 * free because nothing travels through the top edge.
 *
 * Sides are bled a little so tight tracking and side bearings are never shaved. */
const DESCENDER_BLEED = { top: 0.06, bottom: 0.12, side: 0.08 } as const;

const CLIP = `inset(${-DESCENDER_BLEED.top}em ${-DESCENDER_BLEED.side}em ${-DESCENDER_BLEED.bottom}em ${-DESCENDER_BLEED.side}em)`;

export type SlipMode = "block" | "line" | "word";

type MaskSlipProps = {
  /** Plain text. Split per `mode`; no rich children, deliberately. */
  text: string;
  mode: SlipMode;
  /** Per-item duration. `slow` for a chapter leaf, `fast` for a section head. */
  duration: "slow" | "fast";
  /** Stagger between lines/words. Ignored in block mode. */
  interval?: number;
  /** Delay before the first item, e.g. to trail an eyebrow reveal. */
  delay?: number;
  /** The outer element. Pass the real heading tag; it carries `className`. */
  as?: ElementType;
  className?: string;
};

export function MaskSlip({
  text,
  mode,
  duration,
  interval = 0.05,
  delay = 0,
  as: Tag = "span",
  className,
}: MaskSlipProps) {
  const shouldReduce = useReducedMotion();
  const seconds = motionDuration[duration];
  const { ref, groups, measured } = useMeasuredLines(text, mode === "line");

  /* Reduced motion drops the slip entirely rather than shortening it: the
     travel is the whole effect, so a 0.01s slip is just a flicker. What is left
     is the opacity change MotionReveal also keeps, so the degraded state is
     indistinguishable from the control. */
  const item: Variants = {
    hidden: { y: shouldReduce ? 0 : "110%", opacity: shouldReduce ? 0 : 1 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduce ? 0.01 : seconds,
        ease: motionEase.out,
      },
    },
  };

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: shouldReduce ? 0 : delay,
        staggerChildren: shouldReduce ? 0 : interval,
      },
    },
  };

  const trigger = {
    initial: "hidden",
    whileInView: "show",
    viewport: REVEAL_VIEWPORT,
    variants: container,
  } as const;

  /* Block: one mask on the whole heading. Line-agnostic, so it survives every
     breakpoint with no measuring and no resize handling. */
  if (mode === "block") {
    return (
      <Tag className={className}>
        <motion.span className="block" style={{ clipPath: CLIP }} {...trigger}>
          <motion.span className="block" variants={item}>
            {text}
          </motion.span>
        </motion.span>
      </Tag>
    );
  }

  /* Word: each word masked and staggered. Only defensible on a short heading —
     on a sentence it becomes a teleprompter and blows the 1s cascade budget. */
  if (mode === "word") {
    const words = text.split(" ");
    return (
      <Tag className={className}>
        <motion.span className="block" {...trigger}>
          {/* The masked words are fragments; the whole string is exposed once
              below so assistive tech hears a heading, not a word list. */}
          <span aria-hidden="true">
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="inline-block" style={{ clipPath: CLIP }}>
                  <motion.span className="inline-block" variants={item}>
                    {word}
                  </motion.span>
                </span>
                {index < words.length - 1 ? " " : null}
              </span>
            ))}
          </span>
          <span className="sr-only">{text}</span>
        </motion.span>
      </Tag>
    );
  }

  /* Line: the expensive one. Words are measured on mount and on resize, grouped
     by the line they landed on, then re-rendered as one mask per line. This is
     the cost flagged in the plan — a measure pass, a resize observer, and a
     re-render every time the heading rewraps. */
  return (
    <Tag className={className}>
      <motion.span ref={ref} className="block" {...trigger}>
        {measured ? (
          <span aria-hidden="true">
            {groups.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className="block"
                style={{ clipPath: CLIP }}
              >
                <motion.span className="block" variants={item}>
                  {line}
                </motion.span>
              </span>
            ))}
          </span>
        ) : (
          /* Measure pass. Laid out exactly as the finished heading but
             invisible, so nothing flashes before the masks take over.
             `visibility` rather than `display` because the words have to
             actually wrap to be read. */
          <span aria-hidden="true" className="invisible">
            {text.split(" ").map((word, index, all) => (
              <span key={`${word}-${index}`} data-slip-word>
                {word}
                {index < all.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        )}
        <span className="sr-only">{text}</span>
      </motion.span>
    </Tag>
  );
}

/**
 * Groups a heading's words into rendered lines by measuring where each one
 * landed. Re-measures whenever the element resizes, because a heading that
 * rewraps at a new width needs new line groups or the masks stop matching the
 * lines.
 */
function useMeasuredLines(text: string, enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [measured, setMeasured] = useState(false);

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
      /* A 1px tolerance: sub-pixel line positions differ between words on the
         same line at some font sizes, and an exact comparison then splits one
         line into several. */
      if (currentTop === null || Math.abs(top - currentTop) > 1) {
        currentTop = top;
        next.push(word);
      } else {
        next[next.length - 1] = `${next[next.length - 1]} ${word}`;
      }
    });
    setGroups(next);
    setMeasured(true);
  }, []);

  /* New text means the old line groups are stale — drop back to the measure
     pass so the words are in the DOM to be read again. */
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
    let first = true;
    const observer = new ResizeObserver(() => {
      /* ResizeObserver fires once on observe; ignoring that first call keeps
         the initial measure from immediately invalidating itself. */
      if (first) {
        first = false;
        return;
      }
      setMeasured(false);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, groups, measured };
}
