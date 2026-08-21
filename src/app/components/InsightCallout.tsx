import type { ReactNode } from "react";
import { MotionReveal } from "./MotionReveal";

type InsightCalloutProps = {
  children: ReactNode;
  /** Where the insight came from, e.g. "Consumer interviews, Phase 2". */
  context?: string;
  /** "hero" is the chapter-weight pull quote that a section turns on.
      "supporting" is the same quote bar set quieter, for a quote that sits
      as evidence *under* a larger line — a verbatim participant quote in a
      CaseStatement's proof band. Display size there would out-shout the
      statement it is proving, and a long verbatim quote needs a reading
      measure, not a 28ch display measure. */
  size?: "hero" | "supporting";
};

const quoteSize = {
  hero: "max-w-[28ch] text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.03em]",
  supporting:
    "max-w-[46ch] text-xl font-medium leading-snug tracking-[-0.02em] md:text-2xl",
} as const;

/**
 * A pull quote for the single insight a section turns on.
 * Use sparingly — one per chapter at most.
 */
export function InsightCallout({
  children,
  context,
  size = "hero",
}: InsightCalloutProps) {
  return (
    <MotionReveal>
      <figure className="border-l-2 border-primary py-2 pl-6 md:pl-10">
        <blockquote className={quoteSize[size]}>{children}</blockquote>
        {context ? (
          <figcaption className="mt-4 text-sm font-medium text-leaf">
            {context}
          </figcaption>
        ) : null}
      </figure>
    </MotionReveal>
  );
}
