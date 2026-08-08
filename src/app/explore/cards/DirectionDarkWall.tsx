"use client";

/*
 * EXPLORE / CARDS — direction D: "The Dark Wall".
 *
 * THE WORLD
 *
 *   The only dark direction, and the only one where the media is a light source
 *   rather than a picture on a page. The ground is a warm near-black; the tiles
 *   are the only things emitting. A quiet sticky column on the
 *   left carries the name, a filter list and the contact links, and never moves;
 *   the right-hand wall is loud, asymmetric and full of different shapes.
 *   Reference: Koto.
 *
 *   Everything the other three directions do with whitespace, this one does with
 *   darkness. There are no rules, no floods, no captions in parentheses — just
 *   lit rectangles at different sizes on black.
 *
 * WHY IT ANSWERS THE BRIEF. The current grid gives four projects one shape and
 * one size, so the set reads as a catalogue with a gap in it. A masonry wall of
 * genuinely different aspects (1:1, 3:4, 16:9, 4:5) never reads as an incomplete
 * row, because there is no row to complete. And the filter list turns four
 * projects into a set you can interrogate, which is the one thing that gets
 * BETTER at four than at forty.
 *
 * MOTION
 *   ARRIVAL   tiles scale from 0.98 and fade, staggered by COLUMN rather than by
 *             index, so the wall builds in a lag across the columns instead of a
 *             single wave down the page.
 *   SPOTLIGHT hovering or focusing a tile fades a scrim over the whole wall and
 *             lifts that one tile above it, and starts its cover. Exactly one
 *             cover runs, and the wall going dark around it is the whole reason
 *             the direction can afford them at all.
 *   FILTER    changing the filter re-lays the wall out with Motion's `layout`
 *             prop, which is a real FLIP: surviving tiles travel from their old
 *             box to their new one instead of blinking into place.
 *
 * REDUCED MOTION removes all three. Tiles are simply present, the scrim is an
 * instant opacity change (it is a legibility device, not decoration, so it
 * stays), and the FLIP is disabled so a filter change is an instant re-layout.
 *
 * Content is read whole from ../content.
 */

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { motionDuration, motionEase } from "../../lib/motion";
import { IndustryGlyph } from "../../components/IndustryGlyph";
import { ProjectCover } from "../../components/ProjectCover";
import { getField } from "../../components/projectFields";
import type { CaseStudyEntry } from "../../work/projects";
import { caseStudies, elsewhere, hero, outcomes } from "../content";
import { coverOf, usePlayNextFrame } from "./shared";

/* THE WALL COLOUR IS A SCENE CONSTANT, AND IT IS THE ONE THING ON THIS PAGE THE
   TOKEN SET COULD NOT SUPPLY. The shell's darkest surface is `--grout`
   (oklch 0.205), which is a case-study grout tone rather than a page ground —
   and the /explore separator band directly above this direction is `--primary`
   (oklch 0.275). Rendered together the two were close enough that the hard cut
   between the label band and the direction disappeared, which defeats the
   scaffolding. This direction therefore floods a genuine warm near-black.

   It is scoped to this file, it is never referenced as UI colour, and it must
   not become a token: if the Dark Wall is chosen, the right move is to add a
   proper shell ground token then, with contrast recorded, rather than to
   promote this constant. Ink on it is the existing `--grout-foreground`
   (#F1ECE5), which measures 17.4:1 — comfortably AAA, which matters because the
   sidebar sets small text on it. Hairlines are that ink at 20 to 25%.

   FLAGGED in the report as the one direction that needed a colour the token set
   does not carry. */
const WALL = "#0C0B0A";

/* TILE SHAPES. Authored per project so no two neighbours share a crop, which is
   the difference between a masonry wall and a grid with gaps. The column
   assignment does three jobs at once, and all three had to be satisfied by the
   same two numbers:

     1. it is what the arrival stagger lags against;
     2. it balances the wall — the two columns come out within 5% of each other
        in height at desktop, which is the only reason a masonry of 3:4, 1:1,
        16:9 and 4:5 does not end in a long dangling column;
     3. below sm the columns STACK, so the concatenation of column 0 then column
        1 is the reading order on a phone. The placeholder therefore has to live
        at the foot of the LAST column, or it lands in the middle of the work on
        a phone — which is where the first arrangement of this put it. */
type Tile = { aspect: string; column: 0 | 1 };

const TILES: Record<string, Tile> = {
  "funding-finder": { aspect: "aspect-[3/4]", column: 0 },
  "healthdirect-symptom-checker": { aspect: "aspect-square", column: 0 },
  "ap-testing-portal": { aspect: "aspect-[16/9]", column: 1 },
  "macquarie-radar": { aspect: "aspect-[4/5]", column: 1 },
};

const FALLBACK_TILE: Tile = { aspect: "aspect-[4/5]", column: 1 };

const ALL = "All work";

export function DirectionDarkWall() {
  const shouldReduce = useReducedMotion();
  const [filter, setFilter] = useState<string>(ALL);
  const [spotlit, setSpotlit] = useState<string | null>(null);

  /* Filters come out of the registry, so the list can never drift from the set
     it filters. Order follows the registry rather than the alphabet. */
  const filters = useMemo(() => {
    const seen: string[] = [];
    for (const entry of caseStudies) {
      if (entry.industry && !seen.includes(entry.industry)) seen.push(entry.industry);
    }
    return [ALL, ...seen];
  }, []);

  const visible = useMemo(
    () => (filter === ALL ? caseStudies : caseStudies.filter((e) => e.industry === filter)),
    [filter],
  );

  const light = useCallback((slug: string) => setSpotlit(slug), []);
  const unlight = useCallback(() => setSpotlit(null), []);

  return (
    <div className="text-grout-foreground" style={{ backgroundColor: WALL }}>
      <div className="px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <Sidebar
            active={filter}
            filters={filters}
            onFilter={(value) => {
              setFilter(value);
              setSpotlit(null);
            }}
          />

          {/* THE WALL. Two masonry columns from sm up, one on a phone. CSS
              columns would break the FLIP (a column-broken element has no stable
              box to travel from), so the columns are real flex columns and each
              tile is placed by its authored column index — which is also what the
              arrival stagger lags against. */}
          <div className="relative mt-10 lg:col-span-8 lg:mt-0 xl:col-span-9">
            {/* The scrim. One layer over the whole wall rather than a dim on each
                unlit tile: the spotlit tile is raised above it, so nothing has to
                be recoloured and no tile's own artwork is touched. */}
            <AnimatePresence>
              {spotlit ? (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{ backgroundColor: WALL }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.72 }}
                  exit={{ opacity: 0 }}
                  key="scrim"
                  transition={{
                    duration: shouldReduce ? 0.01 : motionDuration.fast,
                    ease: motionEase.out,
                  }}
                />
              ) : null}
            </AnimatePresence>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
              {[0, 1].map((column) => (
                <div className="flex min-w-0 flex-1 flex-col gap-6 lg:gap-8" key={column}>
                  {visible
                    .filter((entry) => (TILES[entry.slug] ?? FALLBACK_TILE).column === column)
                    .map((entry, index) => (
                      <WallTile
                        entry={entry}
                        index={index}
                        key={entry.slug}
                        onLight={light}
                        onUnlight={unlight}
                        spotlit={spotlit === entry.slug}
                      />
                    ))}

                  {/* The placeholder closes the last column, so it is the last
                      thing on the wall at every width including a phone, where
                      the columns stack. It does the job a placeholder is
                      actually good for in a masonry — finishing a composition
                      rather than announcing an absence. It appears only when
                      nothing is filtered: a filtered wall is a query result, and
                      "more to come" is not a result. */}
                  {column === 1 && filter === ALL ? <PendingTile /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── The sidebar ──────────────────────────────────────────────────────────── */

/**
 * Quiet by design: it is the only thing on the page that is not lit, and it
 * holds still while the wall moves. On a phone it stops being a column and
 * becomes a header block with the filters as a wrapped row, because a sticky
 * sidebar on a 320px screen is just a banner that eats the fold.
 */
function Sidebar({
  active,
  filters,
  onFilter,
}: {
  active: string;
  filters: string[];
  onFilter: (value: string) => void;
}) {
  return (
    <div className="lg:col-span-4 xl:col-span-3">
      <div className="lg:sticky lg:top-10">
        {/* Quiet: the sidebar is the only unlit thing on the page and it stays
            that way. One step above body size, not a display heading. */}
        <p className="max-w-[22ch] font-heading text-lg font-medium leading-snug tracking-tight md:text-xl">
          {hero.eyebrow}
        </p>

        <nav aria-label="Filter work" className="mt-8 md:mt-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 lg:block lg:space-y-1">
            {filters.map((value) => {
              const current = value === active;
              return (
                <li key={value}>
                  <button
                    aria-current={current ? "true" : undefined}
                    className={`inline-flex min-h-12 items-center text-sm transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-grout-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-[#0C0B0A] ${
                      current
                        ? "font-semibold text-grout-foreground underline decoration-2 underline-offset-[0.4em]"
                        : "font-medium text-grout-foreground/70 hover:text-grout-foreground"
                    }`}
                    onClick={() => onFilter(value)}
                    type="button"
                  >
                    {value}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-grout-foreground/20 pt-6 md:mt-10 lg:block lg:space-y-1">
          {elsewhere.map((link) => (
            <li key={link.label}>
              <a
                className="inline-flex min-h-12 items-center text-sm font-medium text-grout-foreground/70 transition-colors duration-100 outline-none hover:text-grout-foreground focus-visible:ring-2 focus-visible:ring-grout-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-[#0C0B0A]"
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
                {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── One tile ─────────────────────────────────────────────────────────────── */

function WallTile({
  entry,
  index,
  onLight,
  onUnlight,
  spotlit,
}: {
  entry: CaseStudyEntry;
  index: number;
  onLight: (slug: string) => void;
  onUnlight: () => void;
  spotlit: boolean;
}) {
  const shouldReduce = useReducedMotion();
  const tile = TILES[entry.slug] ?? FALLBACK_TILE;
  const cover = coverOf(entry);
  const outcome = outcomes[entry.slug];

  return (
    /* `layout` is the FLIP: on a filter change a surviving tile animates from
       its previous box to its new one. Disabled under reduced motion, where a
       filter change is an instant re-layout. */
    <motion.div
      className={spotlit ? "relative z-20" : "relative"}
      layout={!shouldReduce}
      initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.base,
        ease: motionEase.out,
        /* Column lag: the second column trails the first by one interval, and
           each tile within a column trails the one above it. Four tiles, 0.06s
           apart, 300ms each — 480ms total, inside the interactive budget. */
        delay: shouldReduce ? 0 : (index + tile.column) * 0.06,
        layout: { duration: motionDuration.base, ease: motionEase.inOut },
      }}
      onHoverStart={() => onLight(entry.slug)}
      onHoverEnd={onUnlight}
      onFocusCapture={() => onLight(entry.slug)}
      onBlurCapture={onUnlight}
    >
      <Link
        aria-label={[
          `Open the ${entry.title} case study.`,
          entry.tagline,
          outcome ? `Published outcome: ${outcome}.` : null,
        ]
          .filter(Boolean)
          .join(" ")}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-grout-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-[#0C0B0A]"
        href={`/work/${entry.slug}`}
      >
        <div className={`relative w-full overflow-hidden rounded-sm ${tile.aspect}`}>
          {cover ? (
            <TileCover cover={cover} slug={entry.slug} spotlit={spotlit} />
          ) : (
            <DrawnTile entry={entry} />
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="min-w-0 font-heading text-base font-semibold leading-snug tracking-tight text-grout-foreground md:text-lg">
            {entry.title}
          </p>
          {entry.industry ? (
            <p className="shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-grout-foreground/70">
              {entry.industry}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * A lit tile, and the fix for the thing that nearly killed this direction.
 *
 * The covers' RESTING state is a flat rectangle of deep field colour — teal,
 * midnight, plum. On the site's own near-white grid that is a strong dark plate.
 * On a near-black wall it is very nearly invisible, so the first build of this
 * direction was a wall of unlit boxes, which is the exact opposite of "the media
 * is the only light source".
 *
 * So a tile is lit at rest by that project's FIELD artwork from projectFields.ts
 * — the luminous bloom composed for its card — and the animated cover is mounted
 * over it only while the tile is spotlit. At rest the wall glows in four
 * different palettes; spotlighting one hands it to that project's film, which
 * arrives darker and more focused and resolves to its hook line while the scrim
 * takes the rest of the wall down. The luminance drops on the tile you are
 * looking at, which sounds backwards and is not: the scrim drops everything else
 * further, so the film is the only live surface on the page.
 *
 * The field is DOM, so it costs nothing at rest — no canvas, no rAF, no film.
 * Four blooms on screen is four background-images.
 */
function TileCover({
  cover,
  slug,
  spotlit,
}: {
  cover: NonNullable<ReturnType<typeof coverOf>>;
  slug: string;
  spotlit: boolean;
}) {
  const shouldReduce = useReducedMotion();
  const field = getField(slug);

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: field.ground, backgroundImage: field.image }}
      />

      <AnimatePresence>
        {spotlit ? (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="cover"
            transition={{
              duration: shouldReduce ? 0.01 : motionDuration.fast,
              ease: motionEase.out,
            }}
          >
            <SpotlitCover cover={cover} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SpotlitCover({ cover }: { cover: NonNullable<ReturnType<typeof coverOf>> }) {
  const play = usePlayNextFrame();

  return (
    <ProjectCover cover={cover} hovered={play} className="absolute inset-0 h-full w-full" />
  );
}

/**
 * The tile for the entry with no film, and this direction's answer to it.
 *
 * On a wall where the media is the light, an unlit tile has to be a deliberate
 * object rather than an absence — so this one is DRAWN instead of lit: a
 * hairline frame on the bare grout, the project's name set in it, and its sector
 * mark below. It is the only tile you can see the wall through, which reads as a
 * plan or an elevation among photographs, and it is unmistakably intentional.
 *
 * It also degrades honestly: the day Funding Finder gets a cover, this component
 * stops being reachable with no other change.
 */
function DrawnTile({ entry }: { entry: CaseStudyEntry }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between border border-grout-foreground/25 p-5 md:p-6">
      <p className="max-w-[10ch] text-balance font-heading text-2xl font-medium leading-[1.05] tracking-[-0.02em] text-grout-foreground md:text-3xl">
        {entry.title}
      </p>

      <div className="flex items-end justify-between gap-4">
        <p className="max-w-[26ch] text-sm leading-relaxed text-grout-foreground">
          {entry.tagline}
        </p>
        <IndustryGlyph
          industry={entry.industry}
          className="size-8 shrink-0 text-grout-foreground md:size-10"
        />
      </div>
    </div>
  );
}

/**
 * The placeholder, and the one tile on the wall that is not a link.
 *
 * A masonry wall is the one format where a placeholder is genuinely at home:
 * the composition already has holes in it by design, so a dark tile with a
 * hairline and one line of type reads as space held rather than as a broken
 * entry. It takes the widest aspect so it never competes with a project for
 * attention.
 */
function PendingTile() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="flex aspect-[16/9] w-full items-end border border-grout-foreground/20 p-5 md:p-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.base,
        ease: motionEase.out,
      }}
    >
      <p className="text-sm leading-relaxed text-grout-foreground/70">
        More work is on the way.
      </p>
    </motion.div>
  );
}
