"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/**
 * The single count-up primitive for every displayed metric in a case study.
 * A figure set as a display mark (scorecard cell, stat callout, proof row)
 * counts from zero to its published value every time the reader scrolls it
 * into view: leaving the viewport re-arms it, so scrolling back re-runs the
 * count rather than showing a figure that already resolved off-screen.
 * Numbers inside reading copy stay static — this is for figures the layout
 * presents as evidence, not prose.
 *
 * The trigger deliberately sits well inside the viewport (a -25% bottom
 * margin, so the figure must clear three quarters of the screen). Most case
 * study sections are immersive collapsing leaves that pin and shrink, and a
 * count fired at the screen's bottom edge is finished a full viewport of
 * scroll before the section settles in front of the reader.
 *
 * Values are strings so the published formatting survives verbatim: every
 * numeric run animates, everything else ("%", "×", "<", "M", "AA") is carried
 * through untouched. A range counts as one gesture — "60–70%" runs both
 * numbers off a single 0→1 progress so they land together rather than
 * racing. A value with no digits renders static.
 *
 * Layout: a ghost copy of the final value reserves the column width, so a
 * short early frame ("0%") never lets neighbouring content reflow mid-count.
 * Tabular figures are enforced here rather than left to the caller.
 *
 * Accessibility: the animating text is aria-hidden and the true value is
 * exposed once, statically, to assistive tech — screen readers hear "84%",
 * never a stream of intermediate numbers. Under reduced motion the final
 * value renders immediately with no movement at all.
 */

type NumericRun = {
  /** Literal text between the previous number and this one. */
  lead: string;
  target: number;
  decimals: number;
  /** Whether the published figure used thousands separators. */
  grouped: boolean;
};

type ParsedValue = {
  runs: NumericRun[];
  /** Literal text after the last number. */
  tail: string;
};

const numberPattern = /\d[\d,]*(?:\.\d+)?/g;

function parseValue(value: string): ParsedValue {
  const runs: NumericRun[] = [];
  let cursor = 0;
  for (const match of value.matchAll(numberPattern)) {
    const raw = match[0];
    const index = match.index ?? 0;
    runs.push({
      lead: value.slice(cursor, index),
      target: Number.parseFloat(raw.replace(/,/g, "")),
      decimals: raw.split(".")[1]?.length ?? 0,
      grouped: raw.includes(","),
    });
    cursor = index + raw.length;
  }
  return { runs, tail: value.slice(cursor) };
}

function formatRun(current: number, run: NumericRun) {
  return run.grouped
    ? current.toLocaleString("en-AU", {
        minimumFractionDigits: run.decimals,
        maximumFractionDigits: run.decimals,
      })
    : current.toFixed(run.decimals);
}

/** Renders the whole value at `progress` (0 → 1) so every run lands together. */
function renderAt(progress: number, parsed: ParsedValue) {
  return (
    parsed.runs
      .map((run) => `${run.lead}${formatRun(run.target * progress, run)}`)
      .join("") + parsed.tail
  );
}

type CountUpProps = {
  /** The published figure, formatting included: "84%", "60–70%", "<20%", "2M", "AA". */
  value: string;
  /** Type and colour classes for the figure. Applied to the wrapper. */
  className?: string;
  /** Offset in seconds, to match a staggered grid's cell cadence. */
  delay?: number;
};

export function CountUp({ value, className, delay = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { margin: "0px 0px -25% 0px" });
  const shouldReduce = useReducedMotion();
  const parsed = useMemo(() => parseValue(value), [value]);
  const canAnimate = parsed.runs.length > 0 && shouldReduce !== true;
  /* Progress, not the rendered string, is the state: the text is derived at
     render, so a changed value or a late reduced-motion resolution can never
     leave a stale figure on screen. */
  const [progress, setProgress] = useState(0);
  const display = canAnimate ? renderAt(progress, parsed) : value;

  useEffect(() => {
    if (!canAnimate) {
      return;
    }
    if (!isInView) {
      /* Re-arm while off-screen, so the next entry counts from zero again
         and the reset itself is never visible. */
      setProgress(0);
      return;
    }
    const controls = animate(0, 1, {
      duration: motionDuration.slow,
      delay,
      ease: motionEase.out,
      onUpdate: setProgress,
    });
    return () => controls.stop();
  }, [canAnimate, delay, isInView, parsed]);

  return (
    <span ref={ref} className={`grid tabular-nums ${className ?? ""}`}>
      {/* Reserves the final width so the count never reflows its neighbours. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
