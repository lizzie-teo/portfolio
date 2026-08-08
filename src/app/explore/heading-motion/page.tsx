/*
 * EXPLORE / HEADING MOTION — the viable directions for how symptom-checker
 * headings arrive, on one page, replayable, against the current fade-up.
 *
 * Same scaffolding contract as the rest of /explore: not linked from anywhere,
 * reachable in production so it can be opened on a preview deploy, noindex. The
 * ink separator bands and specimen labels are scaffolding for this page only.
 *
 * WHAT IS BEING DECIDED. Every heading on the case study currently wears the
 * same MotionReveal fade-up as a bullet point, so nothing marks a heading as a
 * heading. The question is what replaces that, and at which tier.
 *
 * WHAT IS DELIBERATELY NOT HERE. Two of the three ideas on the table were cut
 * before building rather than shown losing:
 *
 *   Word by word on the leaf lede. 19 words at 0.05s plus a slow item lands at
 *   ~1.3s against a 1s display budget, and a sentence revealed word by word
 *   reads as a teleprompter. It survives only at tier 2, where it is direction D.
 *
 *   A drawn underline. It is a restyle rather than an animation: it duplicates
 *   the hairline rule the leaf plate already owns, and a rule between a heading
 *   and its lede breaks the heading-to-lede pairing the style rules require.
 *
 * WHAT TO WATCH FOR, in rough order of how likely it is to sink a direction:
 *
 *   1. Descenders. The leaf heading runs leading-[1.12] with tight tracking. If
 *      a "p" or "y" tail is shaved at 52px, DESCENDER_BLEED in MaskSlip is wrong.
 *   2. Tier 2 repeated. Direction D is judged on the second heading, not the
 *      first — that is why each section specimen renders two.
 *   3. Reduced motion. The slip is removed entirely rather than shortened, so
 *      the degraded state should be a plain fade, indistinguishable from control.
 *   4. Resize, on direction B only. Drag the window narrow and watch the line
 *      groups regroup; that re-measure is the cost B is asking for.
 */

import type { Metadata } from "next";
import { HeadingMotionLab } from "./HeadingMotionLab";

export const metadata: Metadata = {
  title: "Heading motion directions — explore",
  robots: { index: false, follow: false },
};

export default function ExploreHeadingMotionPage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore · heading motion directions
          </p>
          <h1 className="mt-3 max-w-[26ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            How a heading should arrive
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            One gesture is on trial: type slipping up into place from behind a
            clip edge, the way a line is set rather than dropped on. It is shown
            at both tiers that matter, in the modes that are worth the argument,
            and against the fade-up that ships today. Every specimen uses the
            real strings from the live page, including the longest lede on it.
          </p>
        </div>
      </header>

      <HeadingMotionLab />
    </main>
  );
}
