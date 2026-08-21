"use client";

/*
 * WORK GALLERY — the work section: a filter rail, the project grid, and the
 * writing index.
 *
 * WHY THE SECTION IS LIGHT AGAIN. It ran on the near-black --grout from the
 * moment the cards became dark plates carrying light line work, and that was
 * the right ground for those cards: an earlier all-light pass had card,
 * hairline and background sitting within a few percent of each other in
 * luminance, so nothing receded and the eye had no anchor. The grid holds
 * something else now. `FloppyProjectCard` is a grey LINE DRAWING of a disk —
 * an index entry, not a plate — and a drawing needs paper under it, not a dark
 * plane it has to fight. So the band is `--secondary` (page.tsx), and the
 * structure the section used to get from an inverted ground now comes from the
 * type: title in full ink, tagline a step behind it, drawing behind them both
 * (`floppyInk.ts`).
 *
 * The rail's chrome therefore runs on SEMANTIC TOKENS rather than `loFiInk`'s
 * dark scene constants. That is not a restyle, it is the correct wiring: the
 * heading, the descriptions and the filter chips are shell UI standing on a
 * shell surface, and they were only ever borrowing an artwork module because
 * the band underneath them was artwork-dark.
 *
 * WHAT THE GRID HOLDS is `FloppyProjectCard`: each entry drawn as the OUTLINE
 * of a 3.5" disk with the project typeset on its sticker, which finishes the
 * hero's sentence in the other drawing of the same object — the hero moulds a
 * disk and slides it into a slot as the reader arrives here, and this is the
 * index of what went in. The disks lie DIRECTLY on the band, no card plate. `LoFiProjectCard` is deliberately left on disk
 * and unimported from here, but note that it is a DARK-GROUND component: a
 * revert to it would have to take the band back to grout with it. `FeatureItem`
 * is still lo-fi and still carries its own dark plate, which reads correctly on
 * light paper as the leaf-tile-on-a-plane relationship the case studies use.
 *
 * WHAT THE FILTERS FILTER, and why the two axes are separate. Kind (work or
 * writing) and industry are different questions, and merging them was tried and
 * abandoned: article topics had been stuffed into the `industry` field, which
 * would have put "Healthcare" and "Leadership" in one list as if they were the
 * same kind of category. Industry means the sector a CLIENT operated in, so it is
 * a case-study fact and articles are simply outside it. Writing filters by kind.
 *
 * ONE RESULT IS A FEATURE, NOT A LONELY TILE. Four case studies across four
 * sectors means every industry filter returns exactly one entry, and a single
 * 5:7 tile stranded in a four-column grid is the strongest argument against
 * having the filter at all. So a one-result view promotes its result to
 * `FeatureItem` — landscape, full width, brand colour stated at rest. The filter
 * arrives somewhere instead of emptying the shelf. That threshold is not a
 * special case for the current data either: it holds whenever a filter narrows
 * to one, including after the registry grows.
 *
 * NO RESULT COUNTS ANYWHERE. A counter beside each filter would tell the reader
 * that most industries hold exactly one project, which is true, unflattering,
 * and not what a filter is for; numbers in navigation are also tiring to read.
 * The count is announced to assistive tech instead, where it is genuinely useful
 * and costs the visual design nothing.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { KindMark, SectorMark } from "./marks/isoMarks";
import { type ShowKind } from "./ShowGlyph";
import {
  workEntries,
  type ArticleEntry,
  type CaseStudyEntry,
} from "../work/projects";
import { FeatureItem } from "./FeatureItem";
import { galleryHeading } from "./typography";
import { WorkGrid } from "./WorkGrid";
import { WritingIndex } from "./WritingIndex";

/* The filter as one flat value rather than two pieces of state. Kind and
   industry are mutually exclusive questions — picking "Healthcare" already means
   "work" — so modelling them as independent toggles would create states with no
   meaning ("writing" plus "Payments") that the UI would then have to forbid. */
export type Filter = "all" | "work" | "writing" | `industry:${string}`;

const isCaseStudy = (e: (typeof workEntries)[number]): e is CaseStudyEntry =>
  e.kind === "case-study";
const isArticle = (e: (typeof workEntries)[number]): e is ArticleEntry =>
  e.kind === "article";

/* Industries come from the registry rather than a hand-kept list, so adding a
   case study adds its filter and no one has to remember to. Order follows first
   appearance in `workEntries`, which is the order the grid shows them in. */
const industries = Array.from(
  new Set(workEntries.filter(isCaseStudy).flatMap((e) => (e.industry ? [e.industry] : []))),
);

export function matches(entry: (typeof workEntries)[number], filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "work") return isCaseStudy(entry);
  if (filter === "writing") return isArticle(entry);
  return isCaseStudy(entry) && entry.industry === filter.slice("industry:".length);
}

export function WorkGallery() {
  const shouldReduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(() => workEntries.filter((e) => matches(e, filter)), [filter]);
  const projects = shown.filter(isCaseStudy);
  const articles = shown.filter(isArticle);
  const feature = shown.length === 1 ? shown[0] : undefined;
  /* The placeholder is a WORK placeholder — it promises another project, not
     another essay — so it appears only in views that are showing projects, and
     never beside a feature, where a "coming soon" tile would undercut the one
     thing the view exists to present. */
  const showPlaceholder = !feature && (filter === "all" || filter === "work");

  return (
    <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-12 xl:grid-cols-[15rem_1fr] xl:gap-16">
      <FilterRail active={filter} onChange={setFilter} />

      <div className="mt-10 lg:mt-0">
        {/* The result count, for assistive tech only. Filtering swaps the whole
            content region with no page navigation, which is exactly the case
            style-rules §12 keeps a live region for. Polite so it waits for a
            pause rather than interrupting the button press that caused it. */}
        <p aria-live="polite" className="sr-only">
          {shown.length === 1
            ? "1 item, shown as a feature"
            : `${shown.length} items`}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduce ? 0.01 : motionDuration.fast,
              ease: motionEase.out,
            }}
            className="flex flex-col gap-12 lg:gap-16"
          >
            {feature ? (
              <FeatureItem entry={feature} />
            ) : (
              <>
                <WorkGrid entries={projects} showPlaceholder={showPlaceholder} />

                {articles.length ? (
                  <section aria-labelledby="writing-heading">
                    <h3
                      id="writing-heading"
                      className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground"
                    >
                      Writing
                    </h3>
                    <div className="mt-6">
                      <WritingIndex entries={articles} />
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* The kind axis as data rather than three hand-written tiles, so the mark, the
   label and the filter value cannot drift apart. `ShowKind` is a subset of
   `Filter`, which is why `onChange(value)` needs no mapping. */
const showFilters: { value: ShowKind; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "work", label: "Work" },
  { value: "writing", label: "Writing" },
];

/**
 * The rail. Sticky on wide screens so the filters stay reachable while the grid
 * scrolls; a plain horizontal row below `lg`, where a sticky sidebar would eat
 * viewport height the cards need (style-rules §9).
 *
 * Buttons rather than links, and `aria-pressed` rather than a radiogroup: these
 * do not navigate, and radio semantics would promise arrow-key traversal that a
 * wrapped row of chips cannot honour sensibly. Each is a real toggle, tab
 * reachable, with its state announced.
 *
 * ── WHY THE FILTERS ARE DESKTOP ICONS AT `lg` ────────────────────────────
 * `DesktopProjectCard` is built from a retro-OS illustration whose most quotable
 * device — a left column of labelled desktop icons — that card deliberately cut,
 * on the grounds that it was "ornament carrying no information" and that four
 * cards each with their own icon rail would be four desktops rather than one.
 *
 * Both halves of that objection die here. A filter is a CONTROL, so its mark is
 * not ornament; and there is exactly one rail, so the band stays one desktop
 * with windows lying on it. The reference puts its icon column precisely where
 * this rail already sits.
 *
 * THE MARKS ARE ISOMETRIC 1-BIT ICONS (`marks/isoMarks`), and BOTH groups draw
 * from that one module — the kind filters and the sectors were previously two
 * separate families (vector `ShowGlyph` beside flat pixel `IndustrySprite`),
 * which is exactly the drift a rail of eight tiles cannot afford.
 *
 * THEY NO LONGER MATCH THE CARDS. The cards keep their vector `IndustryGlyph`,
 * so the pairing this note once called "the payoff" — matching a rail tile to
 * the cards it selects by silhouette — now rests on subject and label instead.
 * Recorded as a real cost rather than deleted: if a reader ever fails to connect
 * the two, that is the diagnosis.
 */
export function FilterRail({
  active,
  onChange,
  variant = "gallery",
}: {
  active: Filter;
  onChange: (next: Filter) => void;
  /**
   * WHICH SURFACE THIS RAIL IS STANDING ON — and it is one prop rather than
   * three booleans because the differences between the two are not independent.
   *
   * `"gallery"` is `/work`: the page shows projects AND writing, so the rail
   * carries both axes, speaks its region's name out loud (a rubric at the head
   * of the sidebar, under the page `h1`), and packs its tiles two across.
   *
   * `"home"` HAS NO CALLER RIGHT NOW. The `#work` band it was built for dropped
   * its rail (see HomeWorkBand for the arithmetic), so this branch and the four
   * behaviours below are dormant rather than dead — kept because the decision
   * that removed the rail is reversible and this is what it would reverse to,
   * and because deleting it would take `/work`'s only other reader of these
   * code paths through a refactor for no gain. If a rail never comes back to a
   * bare surface, this prop collapses to nothing and the branches go with it.
   *
   * It was the `#work` band, which shows CASE STUDIES ONLY since Aug 2026 —
   * writing moved to its own band of cards below. Three consequences, all of
   * them forced by that one fact:
   *
   *   1. THE SHOW GROUP IS GONE. With articles out of the grid, "Everything"
   *      and "Work" select the identical set and "Writing" empties the band.
   *      A filter whose options cannot differ is not a filter. What survives is
   *      the industry axis plus an "All" tile to clear it — the reset the Show
   *      group used to provide.
   *   2. ONE COLUMN, NOT TWO (owner's call). The two-column pack below was
   *      measured against SEVEN tiles; there are five now, and a single file of
   *      them reads as the list view of an icon field rather than as a grid
   *      squeezed into a sidebar.
   *   3. NO HEADING HERE AT ALL. The band's `h2` is rendered by page.tsx, above
   *      the rail and the grid both, so "Selected work" and "Substack" open
   *      their bands on the same left axis at the same size. A second `h2`
   *      naming the same region — even `sr-only`, which is what this rail used
   *      to emit — would put two names on one section in the outline.
   */
  variant?: "gallery" | "home";
}) {
  const home = variant === "home";

  return (
    <div className="lg:sticky lg:top-12 lg:self-start">
      {!home && (
        <>
          <h2 className={`${galleryHeading} text-foreground`}>Selected work</h2>
          {/* Short supporting text in --foreground, and it stays that way
              because this rail stands on TWO grounds. On /work's --secondary the
              quieter --secondary-foreground measures exactly 7.00:1 and just
              clears the bar small text is held to (§4); on the home band's ruled
              sheet (--accent, the theme's quiet neutral) it measures 6.58:1 and
              misses it — which is what moved the other two bands' ledes to
              --foreground as well.
              --foreground clears both with room (9.8:1 on the sheet, 10.4:1 on
              --secondary), so one token serves both surfaces rather than the
              rail needing to know which one it is standing on — which is the
              point, since the home sheet has now been four different colours. --muted-foreground is
              not in the running on either: it measures 5.13:1 here.

              The margin used to be a failure rather than a squeak: the sheet was
              a pale green #E8EFE9, a step darker, where the quiet token dropped
              to 6.82:1. That is the history this token was picked against. */}
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground">
            Four projects and the writing that came out of them.
          </p>
        </>
      )}

      {/* On `/work`, two groups, each labelled, because "Writing" and
          "Healthcare" answer different questions and a single unlabelled run of
          chips would imply they are alternatives of the same kind. On the home
          band there is only one question left to ask, so the group runs without
          its kicker: a heading over the only group labels a distinction the
          rail is not making, and the sector names say what they are. */}
      <div className={cn("flex flex-col gap-6 lg:gap-8", !home && "mt-8")}>
        {!home && (
          <FilterGroup label="Show">
            {showFilters.map(({ value, label }) => (
              <FilterTile
                key={value}
                active={active === value}
                onClick={() => onChange(value)}
                label={label}
                renderMark={(cls) => <KindMark kind={value} className={cls} />}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup label="Industry" columns={home ? 1 : 2} showLabel={!home}>
          {/* THE RESET, on the home band only. It sits inside the Industry
              group rather than in a group of its own: under a column of
              sectors, "All" reads as "all industries", which is exactly what it
              does. On /work the Show group above already carries it. */}
          {home && (
            <FilterTile
              active={active === "all"}
              onClick={() => onChange("all")}
              label="All"
              renderMark={(cls) => <KindMark kind="all" className={cls} />}
            />
          )}
          {industries.map((industry) => (
            <FilterTile
              key={industry}
              active={active === `industry:${industry}`}
              onClick={() => onChange(`industry:${industry}`)}
              label={industry}
              renderMark={(cls) => <SectorMark industry={industry} className={cls} />}
            />
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  columns = 2,
  showLabel = true,
  children,
}: {
  label: string;
  /** Tiles across, once the rail exists at `lg`. See the note below. */
  columns?: 1 | 2;
  /** Draw the kicker. Off on the home band, where the rail asks one question
      and a heading over the only group names a distinction that is not being
      made. The group KEEPS its `aria-label` either way — a screen reader
      arriving at a bare run of tiles gets no such context from the layout. */
  showLabel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label}>
      {/* A group kicker on a neutral surface: dark ink at a heavier weight,
          per style-rules §3's caption-and-eyebrow rule. 10.39:1. */}
      {showLabel && (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
          {label}
        </p>
      )}
      {/* Wraps as a row of pills on the narrow layout; becomes an icon FIELD once
          the rail exists.

          TWO COLUMNS IS THE DEFAULT, and it was a measurement rather than a
          taste: seven icon-over-label tiles stacked single file run past 480px,
          which is most of a laptop viewport for a rail that is supposed to be
          sticky beside the grid. Two columns puts Show at 2+1 and Industry at
          2+2, which is also what an icon field on a desktop actually looks like.

          ONE COLUMN IS AVAILABLE, and the measurement is what makes it safe
          rather than what forbids it: the home rail dropped to FIVE tiles when
          the Show group went, which stacks to roughly 450px — a sticky rail
          that still fits a laptop viewport with room. It would not have been
          affordable at seven.

          Grid rather than a wrapping flex row either way, so "Higher education"
          taking two lines lifts its whole row rather than knocking one tile out
          of line. */}
      <div
        className={cn(
          "flex flex-wrap gap-2 lg:grid lg:gap-x-2 lg:gap-y-5",
          showLabel && "mt-3 lg:mt-4",
          columns === 1 ? "lg:grid-cols-1" : "lg:grid-cols-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* THE MARK IS DRAWN AT 64px AND ONLY AT `lg`, and both halves of that are
   decisions rather than defaults.

   64 BECAUSE THE GRID IS 32. A bitmap is crisp only at integer multiples of its
   own grid, so the legal sizes are 32, 64, 96. 32 is the native one and it does
   not work: at 1:1 the dithered face stops resolving into a checkerboard and
   reads as flat grey, which collapses the three-face system these drawings are
   built on. 64 is the first size where an isometric object still looks
   isometric. The 48 this replaces was 1.5 cells per pixel — every other cell a
   pixel fatter than its neighbour.

   AND ONLY AT `lg` BECAUSE THE PILL FORM CANNOT HOLD ONE. Below `lg` the rail is
   a row of pills where the mark sat at 16px, and no isometric object survives
   sixteen cells — it needs three faces and a 2:1 stair, and neither fits. The
   pill is now label-only, which also retires the "two drawings, one always
   hidden" pair this file used to render: there is one mark per tile again.

   THE COST, stated plainly: on a phone the rail carries no icons at all. That is
   the right trade here because below `lg` the marks were decoration beside a
   word that already said the same thing, while at `lg` the rail becomes a field
   of desktop icons and the drawings are the entire point. If the phone rail ever
   wants marks back, they have to be a separately drawn small set, not these
   shrunk — the same rule `marks/pixelMarks` records for its 16 grid. */

type MarkRenderer = (className: string) => React.ReactNode;

/**
 * One filter, in two forms, from ONE element — not two markup branches behind a
 * breakpoint. Semantics, focus order and the `aria-pressed` state are therefore
 * identical on both layouts, and there is no chance of a keyboard user tabbing
 * through a hidden copy.
 *
 * BELOW `lg` it is the pill this rail always was, unchanged in every respect
 * that was reasoned about, with the mark set inline to its left.
 *
 * AT `lg` it becomes a desktop icon: mark above, label under, and the plate
 * moves off the button and onto the LABEL, which is where an operating system
 * puts it. The mark stays ink on the sheet.
 *
 * THE ACTIVE STATE STILL DOES NOT DEPEND ON HUE. On the pill it is fill plus
 * border plus reversed text; on the icon it is a filled label plate plus
 * reversed text. Either way there are two signals besides colour.
 *
 * WHY THE PLATE IS STILL --primary AND NOT desktopInk's charcoal. Two reasons.
 * A filter is shell UI standing on a shell surface, and style-rules §3 keeps
 * artwork scene constants out of UI colour — the header above already records
 * that this rail's chrome running on semantic tokens is the correct wiring, not
 * a restyle. And the white-on-coral active label is a settled exception that was
 * decided deliberately; the icon form inherits it rather than reopening it.
 */
function FilterTile({
  active,
  onClick,
  label,
  renderMark,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  renderMark: MarkRenderer;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      /* 44px minimum target on touch (style-rules §8) via `min-h-11`, which the
         text alone would miss at this size. The icon form clears it on its own —
         a 40px mark over a label is nearer 70px — so the constraint is left in
         place rather than overridden at `lg`. */
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
        /* The icon form. The button stops being a plate — no fill, no border, no
           pill radius — and becomes a tile whose only ink is the mark and the
           label. `rounded-xs` rather than `rounded-full` because the focus ring
           follows the border radius, and a stadium ring around a tall tile reads
           as a mistake. */
        /* `lg:w-24` rather than `lg:w-full`, which is what makes the two
           halves of this tile one object. Centring inside a full-width tile
           put the mark in the middle of a 200px column; left-aligning the two
           separately put a 64px drawing over a label of some other width, on
           two different axes. A 96px measure — the 64px mark plus room for the
           label plate — centres both on ONE axis, and because the measure is
           narrower than the rail the tile still sits flush left in its column,
           so the marks stack in a straight file down the sheet. */
        "lg:w-24 lg:flex-col lg:items-center lg:gap-2 lg:rounded-xs lg:border-transparent lg:bg-transparent lg:px-1 lg:py-2",
        active
          ? /* `lg:text-foreground` puts the mark back to ink at the icon size:
               the reversed text belongs to the label plate below, not to the
               drawing. */
            "border-primary bg-primary text-primary-foreground lg:text-foreground"
          : /* --foreground rather than --secondary-foreground because this rail
               stands on TWO grounds — see the lede above, where the margins are
               measured. The hover plate is cancelled at `lg`, where hover
               belongs to the label. */
            "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground lg:hover:bg-transparent lg:hover:text-foreground",
      )}
    >
      {/* ONE DRAWING, SHOWN ONLY AT `lg` — see the note on the size above. The
          pill form below it carries its label alone. Decorative and aria-hidden,
          so nothing is lost to a screen reader either way. */}
      {renderMark("hidden size-16 shrink-0 lg:block")}

      <span
        className={cn(
          "lg:rounded-xs lg:px-1.5 lg:py-0.5 lg:text-center lg:text-xs lg:leading-snug",
          active
            ? "lg:bg-primary lg:text-primary-foreground"
            : "lg:group-hover:bg-accent lg:group-hover:text-accent-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}
