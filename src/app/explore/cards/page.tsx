/*
 * EXPLORE / CARDS — four directions for how the home page's work gallery holds
 * its projects, on one page, for comparison.
 *
 * Same scaffolding contract as /explore: not linked from anywhere, reachable in
 * production so it can be opened on a preview deploy, marked noindex. The ink
 * separator bands are scaffolding for this page only and go away with it.
 *
 * WHAT IS BEING DECIDED. The live grid renders four case studies plus a
 * coming-soon tile as five identical 5:7 portrait cards. Two things are wrong
 * with that, and a direction has to answer both:
 *
 *   1. Four projects in a five-across row read as a thin catalogue, and equal
 *      cells divide attention five ways so nothing leads.
 *   2. Every card carries its own effect, so four independent scenes sit on one
 *      screen competing at rest.
 *
 * FOUR WORLDS, NOT FOUR ARRANGEMENTS. Each direction commits to its own ground,
 * type, density, edge treatment and motion language, and none of them hedges
 * back toward the site's current warm luminous rounded card. If two of these
 * could share a stylesheet, one of them is wrong:
 *
 *   A  off-white, near monochrome, hairline rules, one pinned plate
 *   B  flat white, hard-edged panels bleeding off both edges, sideways
 *   C  full-bleed flood colour, one project owning the whole viewport
 *   D  near-black, lit tiles on a wall, a sticky column beside it
 *
 * THE HONEST TEST CASE is `funding-finder`, which has no media at all. Every
 * direction has to survive it deliberately rather than leaving a hole, and each
 * answers differently: a light field plate, a colour flood, a hairline specimen
 * tag, a drawn wireframe tile. The coming-soon placeholder gets four different
 * answers too, and in two of them it stops being a tile.
 *
 * All four read the same case studies, outcomes, and elsewhere links from
 * ../content, which reads the work registry, so every visible difference below
 * is a design decision rather than a content one.
 */

import type { Metadata } from "next";
import { DirectionDarkWall } from "./DirectionDarkWall";
import { DirectionFilmstripRail } from "./DirectionFilmstripRail";
import { DirectionSpecimenSheet } from "./DirectionSpecimenSheet";
import { DirectionTypeIndex } from "./DirectionTypeIndex";

export const metadata: Metadata = {
  title: "Work gallery directions — explore",
  robots: { index: false, follow: false },
};

const directions = [
  {
    id: "type-index",
    name: "The Type Index",
    premise:
      "Off-white and near monochrome. Projects stop being cards and become names at display scale in a stack of hairline rows, with all the imagery moved into one plate pinned beside the list. Pointing at a row, or tabbing to it, plays that project's cover there and cross-fades between them.",
    scales:
      "Gets better as the list grows. The plate never gets busier and a new project costs one row.",
  },
  {
    id: "filmstrip-rail",
    name: "The Filmstrip Rail",
    premise:
      "Flat white, no card objects at all. Hard-edged panels at their own aspects run off both edges of the screen with a caption in small type beneath each. Drag it and the strip carries momentum and shears into the direction of travel; only the panel nearest the centre runs its cover.",
    scales:
      "Adding work costs nothing but rail. Reading all of it costs a horizontal scroll, which is a real trade.",
  },
  {
    id: "specimen-sheet",
    name: "The Specimen Sheet",
    premise:
      "One committed flood colour per project, full bleed. Each project is a page rather than a card: the name runs off the right edge, the metadata hangs on a hairline baseline row, and the cover sits in a small inset plate deliberately outranked by the type. Bands hard cut, never cross-fade.",
    scales:
      "Every project needs a colour it can own. Strong at four, an argument at twelve.",
  },
  {
    id: "dark-wall",
    name: "The Dark Wall",
    premise:
      "Near-black, where the media is the only light source. A quiet sticky column of name, filters and contact sits beside an asymmetric masonry wall of genuinely different aspects. Hovering a tile dims the wall behind a scrim and spotlights that one; filtering re-lays the wall out as a FLIP.",
    scales:
      "Built for more work than there is. The filter list is the part that earns its keep as the set grows.",
  },
];

export default function ExploreCardsPage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {/* Explore masthead. Scaffolding, not a design proposal. */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore · work gallery directions
          </p>
          <h1 className="mt-3 max-w-[24ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Four ways the work gallery could hold four projects
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            All four read the same four case studies from the work registry, so
            every difference below is a design decision. Each is a whole world
            rather than a rearrangement: its own ground, type, edge and motion.
            Each answers the two questions the live grid does not, which project
            leads and how many covers may run at once, and each has to survive
            Funding Finder, the one entry with no media at all.
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
        <DirectionTypeIndex />
      </DirectionBand>

      <DirectionBand direction={directions[1]}>
        <DirectionFilmstripRail />
      </DirectionBand>

      <DirectionBand direction={directions[2]}>
        <DirectionSpecimenSheet />
      </DirectionBand>

      <DirectionBand direction={directions[3]}>
        <DirectionDarkWall />
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
