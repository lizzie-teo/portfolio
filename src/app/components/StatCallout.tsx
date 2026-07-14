"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

type StatCalloutProps = {
  /** Display value, e.g. "86.5%", "20%", "4x". Non-numeric values render statically. */
  value: string;
  label: string;
  detail?: string;
  /**
   * lg — the standalone snapshot hero (default). md — a supporting proof
   * row under a larger statement, sized so it never outweighs the line above.
   */
  size?: "lg" | "md";
};

const valueSize = {
  lg: "text-[clamp(2.75rem,5vw,4.5rem)]",
  md: "text-[clamp(2rem,3.4vw,3rem)]",
} as const;

const numericPattern = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/;

export function StatCallout({ value, label, detail, size = "lg" }: StatCalloutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const shouldReduce = useReducedMotion();
  const match = value.match(numericPattern);
  const showStatic = !match || shouldReduce === true;
  const [display, setDisplay] = useState(() =>
    match ? `${match[1]}0${match[3]}` : value
  );

  useEffect(() => {
    if (!isInView || showStatic) {
      return;
    }
    const parts = value.match(numericPattern);
    if (!parts) {
      return;
    }
    const [, prefix, digits, suffix] = parts;
    const target = Number.parseFloat(digits);
    const decimals = digits.split(".")[1]?.length ?? 0;
    const controls = animate(0, target, {
      duration: motionDuration.slow,
      ease: motionEase.out,
      onUpdate: (latest) => {
        setDisplay(`${prefix}${latest.toFixed(decimals)}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [isInView, showStatic, value]);

  return (
    <div ref={ref}>
      <p
        aria-hidden="true"
        className={`${valueSize[size]} font-semibold leading-none tracking-[-0.03em] tabular-nums`}
      >
        {showStatic ? value : display}
      </p>
      <p className="sr-only">{value}</p>
      <p className="mt-3 text-sm font-medium">{label}</p>
      {detail ? (
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
