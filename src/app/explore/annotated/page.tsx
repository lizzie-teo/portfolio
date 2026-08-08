/*
 * EXPLORE / ANNOTATED — two home page directions derived from one visual
 * reference, on a single page, for comparison.
 *
 * A sibling of /explore and built the same way: unlinked, reachable in
 * production so it can be opened on a preview deploy, and marked noindex so it
 * never enters search results. Same reason for one page rather than two routes —
 * the decision is comparative, and comparison wants scrolling between candidates
 * rather than tab switching and memory.
 *
 * WHAT THIS PAGE IS ARGUING ABOUT, and how it differs from /explore. That page
 * compares three ways of TIERING the same content. This one starts from a
 * reference (a creative production company site) and asks what its visual
 * language would cost and buy on this portfolio. Its language reduces to six
 * moves: warm paper, oversized caps, a quieter counter voice under the display
 * type, one loud field, motion at the width of the page, and a single sparse
 * annotation. Both directions below take all six; they disagree about which one
 * leads, and that disagreement decides the whole tiering.
 *
 * BOTH DIRECTIONS READ THE SAME CONTENT MODULE as /explore (../content), so
 * every visible difference is a composition decision, never a content one. That
 * module documents what is real and what is placeholder; the short version is
 * that the case studies and the hero copy are real and every article and
 * elsewhere link is a placeholder to be replaced before any of this is promoted.
 *
 * WHAT THE REFERENCE ASKED FOR THAT THIS PAGE DECLINED, stated once here so
 * neither direction has to re-argue it:
 *
 *   the marker layer   the reference scatters hand drawn strokes, circled
 *                      labels, and loose annotations across several sections.
 *                      That treatment was tried on this site before and removed
 *                      after critique for reading scrappy. So each direction
 *                      gets exactly ONE annotation moment, and both of them are
 *                      typographic: a struck and corrected word set in plain
 *                      ink, and a bracketed production note joined to a film by
 *                      a hairline. Nothing is drawn.
 *   the serif          the reference answers its display caps with a serif
 *                      paragraph. This stack pairs two sans faces and has no
 *                      serif, and one paragraph does not justify shipping a
 *                      webfont. Both directions build the voice shift out of
 *                      weight, case, tracking, leading, and measure instead, and
 *                      say so where they do it.
 *   the red            the reference floods a viewport with a saturated brand
 *                      red. The shell has no such colour by rule, and its only
 *                      saturated red names an error state. Direction two argues
 *                      the substitution in full at its own header.
 *
 * THE FILMS ARE THE POINT of this exercise, not a garnish. The six clips in
 * /public/assets/my-capabilities currently exist only as a hover payoff on six
 * words in the live hero, which means a reader who never hovers never sees them.
 * Each direction mounts two at the size of a column or better, on a surface that
 * blends. Nothing here loads a clip eagerly; the mount costs a metadata request
 * and the body arrives when something plays. See AnnotatedFilmPlate.
 *
 * The separator bands between directions are deliberately loud. They are
 * scaffolding for this page only and go away with it.
 */

import type { Metadata } from "next";
import { DirectionFieldAndSpine } from "./DirectionFieldAndSpine";
import { DirectionPaperAndReel } from "./DirectionPaperAndReel";

export const metadata: Metadata = {
  title: "Home page directions from a production reference — explore",
  robots: { index: false, follow: false },
};

const directions = [
  {
    id: "paper-and-reel",
    name: "Paper and Reel",
    premise:
      "The page is printed matter with a reel attached. Warm paper, one shouted thesis in oversized caps, a quieter paragraph answering it, and then the film runs at the width of the page on that same paper. The work stops being a gallery and becomes a rail you scan sideways, each frame captioned like a contact sheet. Writing runs down a column beneath it, so the change of axis does the tiering.",
    scales: "A longer rail, not a longer page. Twelve projects cost no extra scroll.",
  },
  {
    id: "field-and-spine",
    name: "Field and Spine",
    premise:
      "The page opens as one loud field: the name at absurd scale, the thesis answering it quietly, a film standing beside them at the size of a column. Below the fold the work is an index of words scattered down a dotted spine with no thumbnails anywhere, so the films are the only pictures on the page. Writing sits on the same spine with the opposite rhythm.",
    scales: "An index absorbs twenty entries by getting denser. A grid has to be redesigned.",
  },
];

export default function AnnotatedExplorePage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {/* Masthead. Scaffolding, not a design proposal. */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore · home page directions from a production reference
          </p>
          <h1 className="mt-3 max-w-[26ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Two ways to put the films on the page and let the type carry the rest
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            Same content in both, read from the module /explore already uses.
            Each one resolves the whole page: the hero, the four case studies,
            the writing, and the contact links. The capability films get real
            size in both, because the question worth answering is what the page
            looks like once they stop being a hover payoff.
          </p>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            Each direction carries exactly one annotation moment, and both of
            them are set in type rather than drawn.
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
        <DirectionPaperAndReel />
      </DirectionBand>

      <DirectionBand direction={directions[1]}>
        <DirectionFieldAndSpine />
      </DirectionBand>
    </main>
  );
}

/* The separator and label above each direction. Ink band so the eye reads a hard
   cut between candidates rather than one continuous page. Matches /explore's
   band exactly, so the two exploration pages read as one exercise. */
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
