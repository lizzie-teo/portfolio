"use client";

/*
 * WORK GALLERY — the dark work section: a filter rail, the project grid, and the
 * writing index.
 *
 * WHY THE SECTION IS DARK. The cards used to rest as near-white paper on the
 * warm shell ground, and a whole section of them was tiring to look at for a
 * measurable reason rather than a stylistic one: card, hairline, and background
 * all sat within a few percent of each other in luminance, so nothing receded,
 * nothing advanced, and the eye had no anchor. Inverting gives the grid value
 * structure back. See `loFiInk` for the full derivation.
 *
 * The band runs on --grout and the cards on --leaf's ink, which is a relationship
 * theme.css already defines and measures ("grout, one step deeper than the leaf
 * so leaf tiles still read as tiles on it") for the case-study tile system. The
 * gallery borrows it rather than inventing a second dark system that would drift
 * from the first, so no new tokens exist for this section.
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
import { motionDuration, motionEase } from "../lib/motion";
import {
  workEntries,
  workEntryHref,
  type ArticleEntry,
  type CaseStudyEntry,
} from "../work/projects";
import { FeatureItem } from "./FeatureItem";
import { LoFiProjectCard } from "./LoFiProjectCard";
import { loFiInk } from "./loFiInk";
import { ComingSoonCard } from "./ProjectCard";
import { WritingIndex } from "./WritingIndex";

/* The filter as one flat value rather than two pieces of state. Kind and
   industry are mutually exclusive questions — picking "Healthcare" already means
   "work" — so modelling them as independent toggles would create states with no
   meaning ("writing" plus "Payments") that the UI would then have to forbid. */
type Filter = "all" | "work" | "writing" | `industry:${string}`;

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

function matches(entry: (typeof workEntries)[number], filter: Filter): boolean {
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
                {projects.length || showPlaceholder ? (
                  /* THREE ACROSS AT THE TOP END, AND IT STOPS THERE. Sized for
                     six projects rather than the four in the registry today: six
                     at three across is two complete rows, which is the shape this
                     grid is growing into. The ceiling matters as much as the
                     number — the earlier version kept adding columns up to four,
                     so every extra bit of screen width made the cards SMALLER,
                     which is the opposite of what more room should buy. Held at
                     three, width past `2xl` goes into the cards instead.

                     Three waits for `xl`. At `lg` the rail has just claimed a
                     column of the page and a third card would land near 210px,
                     which is below where the title and foot block stay readable;
                     two across holds them at a comfortable width until there is
                     genuinely room for a third. */
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3 xl:gap-12">
                    {projects.map((entry, index) => (
                      <LoFiProjectCard
                        entry={entry}
                        index={index}
                        key={workEntryHref(entry)}
                      />
                    ))}
                    {showPlaceholder ? <ComingSoonCard index={projects.length} /> : null}
                  </div>
                ) : null}

                {articles.length ? (
                  <section aria-labelledby="writing-heading">
                    <h3
                      id="writing-heading"
                      className="font-mono text-xs uppercase tracking-[0.16em]"
                      style={{ color: loFiInk.quiet }}
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

/**
 * The rail. Sticky on wide screens so the filters stay reachable while the grid
 * scrolls; a plain horizontal row below `lg`, where a sticky sidebar would eat
 * viewport height the cards need (style-rules §9).
 *
 * Buttons rather than links, and `aria-pressed` rather than a radiogroup: these
 * do not navigate, and radio semantics would promise arrow-key traversal that a
 * wrapped row of chips cannot honour sensibly. Each is a real toggle, tab
 * reachable, with its state announced.
 */
function FilterRail({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (next: Filter) => void;
}) {
  return (
    <div className="lg:sticky lg:top-12 lg:self-start">
      <h2
        className="font-heading text-2xl font-medium tracking-[-0.015em] md:text-3xl"
        style={{ color: loFiInk.ink }}
      >
        Selected work
      </h2>
      <p className="mt-3 max-w-prose text-sm leading-relaxed" style={{ color: loFiInk.quiet }}>
        Four projects and the writing that came out of them.
      </p>

      {/* Two groups, each labelled, because "Writing" and "Healthcare" answer
          different questions and a single unlabelled run of chips would imply
          they are alternatives of the same kind. The rule between them does the
          same job visually that the labels do semantically. */}
      <div className="mt-8 flex flex-col gap-6">
        <FilterGroup label="Show">
          <Chip active={active === "all"} onClick={() => onChange("all")}>
            Everything
          </Chip>
          <Chip active={active === "work"} onClick={() => onChange("work")}>
            Work
          </Chip>
          <Chip active={active === "writing"} onClick={() => onChange("writing")}>
            Writing
          </Chip>
        </FilterGroup>

        <FilterGroup label="Industry">
          {industries.map((industry) => (
            <Chip
              key={industry}
              active={active === `industry:${industry}`}
              onClick={() => onChange(`industry:${industry}`)}
            >
              {industry}
            </Chip>
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p
        className="font-mono text-xs uppercase tracking-[0.16em]"
        style={{ color: loFiInk.quiet }}
      >
        {label}
      </p>
      {/* Wraps on the narrow layout, stacks into a column once the rail exists.
          `items-start` keeps a chip's hit area to its own text width rather than
          stretching it across the rail, so the target matches what looks live. */}
      <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      /* 44px minimum target on touch (style-rules §8) via `min-h-11`, which the
         text alone would miss at this size. Colour is not the only signal for the
         active state — it also takes the filled plate and the border — so the
         control does not depend on hue alone to say which one is on. */
      className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-grout"
      style={
        active
          ? { backgroundColor: loFiInk.ink, borderColor: loFiInk.ink, color: loFiInk.paper }
          : { backgroundColor: "transparent", borderColor: loFiInk.rule, color: loFiInk.quiet }
      }
    >
      {children}
    </button>
  );
}
