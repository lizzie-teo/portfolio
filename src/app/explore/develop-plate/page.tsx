/*
 * EXPLORE / DEVELOP PLATE — three bespoke article scenes, side by side.
 *
 * Same scaffolding contract as the rest of /explore: not linked from anywhere,
 * reachable in production so it can be opened on a preview deploy, noindex.
 * Nothing here ships.
 *
 * WHAT CHANGED SINCE THE LAST PASS. All three cards showed one illustration, which
 * made the plate decoration: nothing distinguished the articles, and the biggest
 * element on each card carried none of its meaning. Each of these three pieces now
 * performs its own argument in an inline SVG scene, and the shared illustration has
 * been demoted to the default plate for the long tail of essays that have no scene
 * yet. The plate wrapper is identical in every case — halftone, grain,
 * develop-on-attention, `rounded-xs` — so the only variable across the row is what
 * is inside the box.
 *
 * WHAT IS AND IS NOT SETTLED. The plate, the scenes, the shared frame, and the
 * activation rules are real components. The TYPE BLOCK is still provisional and
 * still written inline here rather than extracted, so looking at it does not imply
 * the writing shell has been agreed.
 *
 * WHAT TO LOOK FOR:
 *   · each scene should say what its article is about before you have read the
 *     headline. If a scene needs its title to make sense, it has failed.
 *   · at rest the plate should read as an IMAGE, not a dot texture. The screen was
 *     retuned this pass — coarser dots, about a third less ink.
 *   · Tab through the row: focus must produce exactly what hover produces.
 *   · reduced motion must hold each scene's CLOSING frame — cursor landed, markers
 *     placed, lateral lines drawn — never its first frame.
 */

import type { Metadata } from "next";
import { DevelopCard } from "../../components/develop/DevelopCard";
import { loFiInk } from "../../components/loFiInk";
import {
  DEFAULT_ARTICLE_FRAMES,
  articleMedia,
  hasBespokeScene,
} from "../../components/develop/articleScenes";
import { workEntries, type ArticleEntry } from "../../work/projects";

export const metadata: Metadata = {
  title: "Develop plate — explore",
  robots: { index: false, follow: false },
};

const articles = workEntries.filter((e): e is ArticleEntry => e.kind === "article");
const bespoke = articles.filter(hasBespokeScene);

export default function ExploreDevelopPlatePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--grout)" }}>
      <header className="mx-auto w-full max-w-[1400px] px-4 pt-12 pb-10 sm:px-6 md:px-8 md:pt-16 lg:px-12">
        <p
          className="font-mono text-xs uppercase tracking-[0.16em]"
          style={{ color: loFiInk.quiet }}
        >
          Explore · develop plate
        </p>
        <h1
          className="mt-3 max-w-[22ch] font-heading text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
          style={{ color: loFiInk.ink }}
        >
          A plate that argues the article
        </h1>
        <p
          className="mt-4 max-w-prose text-base leading-relaxed"
          style={{ color: loFiInk.quiet }}
        >
          Three pieces, three scenes, one plate. Each scene performs its own
          article in a single looping gesture, drawn in SVG and animated with
          transform and opacity only. The wrapper never changes — the same
          halftone, the same stepped grain, the same develop on hover, focus, and
          scroll — so the only thing that differs across the row is the argument
          inside it.
        </p>
      </header>

      <Band
        title="Bespoke scenes"
        note="Point at each one. A token name changing form as a cursor crosses between two canvases; a scan line leaving a marker pinned to every element it passes; a reach upward that fades because there is nothing at the other end, followed by four lateral lines that hold."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {bespoke.map((entry, index) => (
            <ArticleCard key={entry.url} entry={entry} index={index} />
          ))}
        </div>
      </Band>

      <Band
        title="Default plate"
        note="The long tail. An essay with no bespoke scene falls back to the shared illustration on the frames strategy, so a card is never plateless and a scene is never mandatory. These three stills are stand-ins borrowed from the Healthdirect case study and should not ship as the generic mark for writing — see the note in articleScenes.tsx."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {articles.slice(0, 1).map((entry, index) => (
            <ArticleCard
              key={`default-${entry.url}`}
              entry={entry}
              index={index}
              forceDefault
            />
          ))}
        </div>
      </Band>
    </main>
  );
}

function ArticleCard({
  entry,
  index,
  forceDefault = false,
}: {
  entry: ArticleEntry;
  index: number;
  forceDefault?: boolean;
}) {
  return (
    <DevelopCard
      href={entry.url}
      external
      index={index}
      cursorLabel="Read"
      ariaLabel={`Read "${entry.title}" on ${entry.publication} (opens in a new tab): ${entry.deck}`}
      media={forceDefault ? { frames: DEFAULT_ARTICLE_FRAMES } : articleMedia(entry)}
    >
      {/* PROVISIONAL TYPE BLOCK — see the file header. */}
      <div className="mt-5 flex grow flex-col">
        {/* The brief asked for roughly 0.14em here; this is 0.16em, the bottom of
            the range §4 bounds uppercase kickers to. The difference is invisible at
            this size and it keeps the kicker on the same setting as every other
            eyebrow on the site, which a bespoke value would quietly break. */}
        <p
          className="indent-[0.16em] text-xs font-medium uppercase tracking-[0.16em]"
          style={{ color: loFiInk.quiet }}
        >
          {entry.topic}
        </p>
        <h2
          className="mt-3 max-w-[24ch] text-balance font-heading text-xl font-medium leading-[1.15] tracking-[-0.01em]"
          style={{ color: loFiInk.ink }}
        >
          {entry.title}
        </h2>
        <p
          className="mt-3 max-w-[38ch] text-sm leading-relaxed"
          style={{ color: loFiInk.quiet }}
        >
          {entry.deck}
        </p>
        <div
          className="mt-auto flex items-baseline justify-between gap-3 border-t pt-3 font-mono text-xs uppercase tracking-[0.16em]"
          style={{ borderColor: loFiInk.rule, color: loFiInk.quiet }}
        >
          <span className="min-w-0 truncate">{entry.year}</span>
          <span className="shrink-0">{entry.publication}</span>
        </div>
      </div>
    </DevelopCard>
  );
}

function Band({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6 md:px-8 lg:px-12">
      <div className="border-t pt-8" style={{ borderColor: loFiInk.rule }}>
        <h2
          className="font-heading text-2xl font-medium tracking-[-0.015em]"
          style={{ color: loFiInk.ink }}
        >
          {title}
        </h2>
        <p
          className="mt-3 max-w-prose text-sm leading-relaxed"
          style={{ color: loFiInk.quiet }}
        >
          {note}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
