/*
 * EXPLORE — three landing-page directions on one page, for comparison.
 *
 * Not part of the site's navigation and not linked from anywhere. It stays
 * reachable in production (so it can be opened on a preview deploy) but is
 * marked noindex, so it never enters search results.
 *
 * WHY ONE PAGE RATHER THAN THREE ROUTES: the decision here is comparative, and
 * comparison wants scrolling between candidates, not tab-switching and memory.
 *
 * All three read the same content module, so every visible difference is a
 * layout decision. Each direction resolves all three tiers of the page —
 * case studies, writing, and the elsewhere/contact links — because the tiering
 * is the actual argument. A direction that only restyles the work grid has not
 * answered the question.
 *
 * The separators between directions are deliberately loud. They are scaffolding
 * for this page only and go away with it.
 */

import type { Metadata } from "next";
import { DirectionClaimCitation } from "./DirectionClaimCitation";
import { DirectionDatedIndex } from "./DirectionDatedIndex";
import { DirectionFeatureRail } from "./DirectionFeatureRail";

export const metadata: Metadata = {
  title: "Landing page directions — explore",
  robots: { index: false, follow: false },
};

const directions = [
  {
    id: "dated-index",
    name: "The Dated Index",
    premise:
      "Work and writing differ in medium, not size. The grid stays image led; writing becomes a pure text index with no thumbnails, so the two tiers can never be confused. Contact resolves into an oversized-name footer.",
    scales: "Gets better the more you publish.",
  },
  {
    id: "feature-rail",
    name: "Feature and Rail",
    premise:
      "One case study runs at feature scale with the writing stacked beside it as a narrow rail, so the articles cost no extra scroll. The remaining case studies follow as an even row.",
    scales: "Needs a project you are happy to feature permanently.",
  },
  {
    id: "claim-citation",
    name: "Claim and Citation",
    premise:
      "No writing band at all. The articles become citations inside the hero, so a claim about how you work carries its own evidence. Everything else drops into a full-width colophon.",
    scales: "Strongest at one to three articles; breaks at fifteen.",
  },
];

export default function ExplorePage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {/* Explore masthead. Scaffolding, not a design proposal. */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore · landing page directions
          </p>
          <h1 className="mt-3 max-w-[24ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Three ways the landing page could hold work, writing, and everything else
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            Same content in all three. Every difference below is a layout
            decision. Each one has to answer where a case study, an article, and
            a LinkedIn link each belong, because that is the part the current
            page does not resolve.
          </p>

          <nav aria-label="Directions" className="mt-8">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {directions.map((direction) => (
                <li key={direction.id}>
                  <a
                    href={`#${direction.id}`}
                    className="inline-flex min-h-12 items-center font-heading text-base font-semibold underline decoration-border decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {direction.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <DirectionBand direction={directions[0]}>
        <DirectionDatedIndex />
      </DirectionBand>

      <DirectionBand direction={directions[1]}>
        <DirectionFeatureRail />
      </DirectionBand>

      <DirectionBand direction={directions[2]}>
        <DirectionClaimCitation />
      </DirectionBand>
    </main>
  );
}

/* The separator and label above each direction. Ink band so the eye reads a
   hard cut between candidates rather than one continuous page. */
function DirectionBand({
  direction,
  children,
}: {
  direction: (typeof directions)[number];
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${direction.id}-heading`} className="scroll-mt-4" id={direction.id}>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-12 xl:px-16 2xl:px-24">
          <h2
            id={`${direction.id}-heading`}
            className="font-heading text-2xl font-semibold tracking-[-0.01em] md:text-3xl"
          >
            {direction.name}
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed opacity-90">
            {direction.premise}
          </p>
          <p className="mt-3 text-sm font-semibold">{direction.scales}</p>
        </div>
      </div>

      {children}
    </section>
  );
}
