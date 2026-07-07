import type { ReactNode } from "react";
import { MotionReveal } from "./MotionReveal";

type InsightCalloutProps = {
  children: ReactNode;
  /** Where the insight came from, e.g. "Consumer interviews, Phase 2". */
  context?: string;
};

/**
 * A hero-weight pull quote for the single insight a section turns on.
 * Use sparingly — one per chapter at most.
 */
export function InsightCallout({ children, context }: InsightCalloutProps) {
  return (
    <MotionReveal>
      <figure className="border-l-2 border-primary py-2 pl-6 md:pl-10">
        <blockquote className="max-w-[28ch] text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.03em]">
          {children}
        </blockquote>
        {context ? (
          <figcaption className="mt-4 text-sm text-muted-foreground">
            {context}
          </figcaption>
        ) : null}
      </figure>
    </MotionReveal>
  );
}
