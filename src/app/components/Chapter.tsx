import type { ReactNode } from "react";
import { MotionReveal } from "./MotionReveal";

type ChapterProps = {
  /** Anchor id — must match the id passed to ChapterMarker. */
  id: string;
  /** Zero-based position in the chapter list. */
  index: number;
  /** Short wayfinding title, shown in the chapter label and ChapterMarker. */
  title: string;
  /** The speakable opening statement — one sentence you would say out loud. */
  lede: string;
  children?: ReactNode;
};

/**
 * A narrative chapter: numbered label, a large speakable opening statement,
 * then supporting content. Chapters are the interview talking beats — a
 * reader who only reads the ledes should still get the whole story.
 */
export function Chapter({ id, index, title, lede, children }: ChapterProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <section
      id={id}
      aria-labelledby={`${id}-lede`}
      className="scroll-mt-24 border-t border-border pt-12 md:pt-16 lg:pt-24 [&:not(:first-of-type)]:mt-16 md:[&:not(:first-of-type)]:mt-24 lg:[&:not(:first-of-type)]:mt-32"
    >
      <MotionReveal>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-primary">{number}</span>
          <span aria-hidden="true"> — </span>
          {title}
        </p>
      </MotionReveal>
      <MotionReveal delay={0.05}>
        <h2
          id={`${id}-lede`}
          className="mt-5 max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em]"
        >
          {lede}
        </h2>
      </MotionReveal>
      {children ? (
        <div className="mt-8 space-y-10 md:mt-12 md:space-y-12">{children}</div>
      ) : null}
    </section>
  );
}
