import Link from "next/link";
import { Children, Fragment, isValidElement } from "react";
import { ArrivalCue } from "./ArrivalCue";
import { anchorScrollOffset, cornerClasses, type TileCorners } from "./Chapter";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MaskReveal } from "./MaskReveal";
import { SiteHeader } from "./SiteHeader";
import {
  getCaseStudy,
  getCaseStudyNeighbors,
  workEntryHref,
} from "../work/projects";

/* The case-study page is a tiled card system: the shell owns the container,
   the xl+ lane reserved for the floating rail, and the opening title tile;
   page content follows as sibling tiles separated by the shared grout
   (see tileGap in Chapter.tsx). */

/* Flattens an intro's prose into its individual paragraphs, unwrapping the
   fragments case studies naturally write it in (`<><p/><p/></>`). The hero slips
   each paragraph on its own rather than masking the column as one block: a mask
   moves its content by its own height, so a whole intro column would travel
   hundreds of pixels and read as a panel being pushed on screen instead of type
   arriving. Per paragraph the travel stays a few lines high. Done here rather
   than by changing the `intro.text` type, so no case study has to restructure
   how it writes its intro. */
function introBlocks(node: React.ReactNode): React.ReactNode[] {
  return Children.toArray(node).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? introBlocks((child.props as { children?: React.ReactNode }).children)
      : [child],
  );
}

const footerLinkClassName =
  "group inline-flex min-h-11 flex-col justify-center outline-none focus-visible:ring-2 focus-visible:ring-grout-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-grout";

/* Intro meta is a short label/value pair for single facts (Role), a labelled
   list for grouped scope, or a titled set of groups for a fuller breakdown
   (the phase-by-phase role split). The first two render in the narrow intro
   sidebar; the grouped variant is promoted to a full-width row below the hero
   columns so its sub-lists get room to breathe. */
type CaseIntroMeta =
  | { label: string; value: string }
  | { label: string; items: string[] }
  | { label: string; groups: { label: string; items: string[] }[] };

type GroupedIntroMeta = Extract<CaseIntroMeta, { groups: unknown }>;
type PlainIntroMeta = Exclude<CaseIntroMeta, GroupedIntroMeta>;

type CaseIntro = {
  text: React.ReactNode;
  meta?: CaseIntroMeta[];
};

type CaseStudyShellProps = {
  slug: string;
  intro?: CaseIntro;
  /* Optional category chip pinned above the hero title, sizing the project
     before its name is read. Opt-in per case study; shells without it render
     an unchanged title tile. */
  chip?: string;
  /* For pages that restate the tagline in their own opening module. */
  hideTagline?: boolean;
  /* Anchor id for the title tile, when the page's nav includes the intro. */
  heroId?: string;
  /* Corner rounding for the title tile — "top" when the page groups the
     hero with its opening tiles into one introduction slab. */
  heroCorners?: TileCorners;
  /* Reserve the xl+ right lane for a permanent CaseStudyRail. Pages that use
     the auto-hiding ChapterDock instead (an overlay that tucks its resting
     spine into the container's own right margin) pass false, so their content
     centres symmetrically rather than sitting offset for a phantom lane. */
  reserveNavLane?: boolean;
  children?: React.ReactNode;
};

export function CaseStudyShell({
  slug,
  intro,
  chip,
  hideTagline,
  heroId,
  heroCorners = "all",
  reserveNavLane = true,
  children,
}: CaseStudyShellProps) {
  const entry = getCaseStudy(slug);
  if (!entry) {
    throw new Error(`Unknown case study slug: ${slug}`);
  }
  const { previous, next } = getCaseStudyNeighbors(slug);

  /* Plain facts stay in the narrow sidebar dl; grouped entries move out to a
     full-width row below both hero columns. Case studies with no grouped meta
     (Macquarie Radar) render exactly as before. */
  const plainMeta = intro?.meta?.filter(
    (item): item is PlainIntroMeta => !("groups" in item),
  );
  const groupedMeta = intro?.meta?.filter(
    (item): item is GroupedIntroMeta => "groups" in item,
  );
  /* The masthead hero lays out on three rows: the chip kicker (row 1), the H1
     with any grouped role credits beneath it (rows 2–3, left column), and the
     intro prose in the right column starting level with the H1 — it spans rows
     2–3 (`row-start-2 row-span-2`), so its first line sits on the title line,
     not up by the chip. Row three takes the slack (`1fr`) so a `self-start`
     role block stays snug under the title whatever the intro's height. On
     mobile the chip renders inside the title block (see JSX) so the stacked
     spacing is unchanged; the separate row-1 chip is `lg:` only.

     A chip is enough to earn this: whenever one sits above the title, the
     intro must start at the title line rather than at the chip, or the two
     columns read as unrelated. Grouped meta also forces it, because those
     credits are positioned at `row-start-3` and need the three-row grid to
     land. Macquarie has neither a chip nor grouped meta, so it keeps the plain
     two-column grid exactly as it was. */
  const hasGroupedMeta = Boolean(groupedMeta?.length);
  const isMasthead = Boolean(intro) && (Boolean(chip) || hasGroupedMeta);
  const introGridClassName = isMasthead
    ? "grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-x-16 lg:gap-y-4 xl:gap-x-24"
    : "grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-16 xl:gap-24";

  const chipNode = chip ? (
    <span className="inline-flex items-center rounded-full border border-leaf-foreground/35 bg-leaf-foreground/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-leaf-foreground">
      {chip}
    </span>
  ) : null;

  return (
    <div
      data-project-theme={slug}
      className="min-h-screen bg-grout text-foreground"
    >
      <SiteHeader tone="dark" />

      {/* Arrival payoff for anchor jumps — a coral marker lands on the target's
          heading, tying the nav's coral "you are here" pip to the destination.
          Shell-level chrome so every case study inherits it: it listens for the
          global `case:arrival` event any nav's useAnchorScroll fires, and is
          suppressed under reduced motion. */}
      <ArrivalCue />

      <main className="overflow-x-clip">
        <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-3 sm:px-6 md:px-8 md:pt-4 lg:px-20 lg:pb-24 xl:px-48 xl:pb-32 2xl:px-64">
          <div className={reserveNavLane ? "xl:pr-64 2xl:pr-72" : undefined}>
            {/* The anchor wrapper (when the page navs to the intro) sits
               outside the leaf so anchor jumps land above the pin line. */}
            <div id={heroId} className={heroId ? anchorScrollOffset : undefined}>
              <CollapsingLeaf
                pinTopPx={0}
                /* Top-aligned, on the chapter leaf's vertical rhythm: the top
                   padding is the same scale a Chapter leaf carries (see
                   Chapter.tsx), so the opening tile and every chapter divider
                   below it set their first line at the same y and the page
                   reads as one system of surfaces rather than a hero of a
                   different kind. Top-aligned rather than centred (the leaf's
                   original cover behaviour) because centring dropped the title
                   a fifth of the viewport down and handed half of any trimmed
                   padding straight back as centring slack. */
                className={`flex flex-col justify-start ${cornerClasses[heroCorners]} bg-leaf px-5 pb-12 pt-10 sm:px-8 sm:pt-12 md:pb-16 md:pt-16 lg:px-12 lg:pb-20 lg:pt-20 xl:pt-24`}
              >
                <div className={intro ? introGridClassName : undefined}>
                  {/* Masthead only: the chip is lifted into its own top grid
                     row (lg+) so the intro can align to the H1 line below it.
                     Hidden below lg, where the in-flow copy inside the title
                     block keeps the stacked spacing unchanged. */}
                  {/* The masthead cascade: chip, then the title setting itself
                      word by word, then the tagline line by line. Each item
                      carries its own delay rather than sitting in one stagger
                      container, because they live in different grid cells. */}
                  {chipNode && isMasthead ? (
                    <MaskReveal
                      as="div"
                      mode="block"
                      duration="fast"
                      className="mb-5 hidden lg:col-start-1 lg:row-start-1 lg:mb-0 lg:block"
                    >
                      {chipNode}
                    </MaskReveal>
                  ) : null}
                  <div
                    className={`min-w-0 ${isMasthead ? "lg:col-start-1 lg:row-start-2" : ""}`}
                  >
                    {chipNode ? (
                      <MaskReveal
                        as="div"
                        mode="block"
                        duration="fast"
                        className={`mb-4 ${isMasthead ? "lg:hidden" : ""}`}
                      >
                        {chipNode}
                      </MaskReveal>
                    ) : null}
                    {/* Word, not line: the project name is three or four display
                        words — the case the headline-word-reveal recipe exists
                        for — and at this size setting it word by word is the
                        page's opening statement. `slow` because a hero title is
                        the one reveal on the page allowed to take its time. */}
                    <MaskReveal
                      as="h1"
                      mode="word"
                      duration="slow"
                      delay={0.05}
                      className="max-w-[18ch] text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-leaf-foreground"
                      text={entry.title}
                    />
                    {!hideTagline && (
                      /* Line, not word: the tagline is a sentence, the same role
                         and the same treatment as a chapter leaf lede, so the
                         hero and the chapters speak one language. */
                      <MaskReveal
                        as="p"
                        mode="line"
                        duration="slow"
                        delay={0.1}
                        className="mt-6 max-w-prose text-lg leading-[1.35] tracking-[-0.02em] text-leaf-foreground/80 md:text-2xl"
                        text={entry.tagline}
                      />
                    )}
                  </div>
                  {intro ? (
                    <div
                      className={`min-w-0 space-y-8 ${isMasthead ? "lg:col-start-2 lg:row-start-2 lg:row-span-2" : ""}`}
                    >
                      <div className="max-w-prose space-y-4 text-base leading-relaxed text-leaf-foreground/90">
                        {/* One mask per paragraph. These carry inline markup
                            (the highlighted phrases), so line mode is out — it
                            rebuilds text from plain strings and would drop the
                            highlights. A paragraph is a small enough block for
                            the mask to still read as type arriving. */}
                        {introBlocks(intro.text).map((block, index) => (
                          <MaskReveal
                            key={index}
                            as="div"
                            mode="block"
                            duration="fast"
                            delay={0.15 + index * 0.05}
                          >
                            {block}
                          </MaskReveal>
                        ))}
                      </div>
                      {plainMeta?.length ? (
                        <dl className="space-y-6 border-t border-leaf-foreground/20 pt-6">
                          {/* Same rule as the role credits: slip the label and
                              each row on its own rather than masking a term and
                              its whole list as one block. */}
                          {plainMeta.map((item, index) => (
                            <div key={item.label}>
                              <MaskReveal
                                as="dt"
                                mode="word"
                                duration="fast"
                                delay={0.2 + index * 0.05}
                                className="text-xs font-medium uppercase tracking-[0.16em] text-leaf-foreground/70"
                                text={item.label}
                              />
                              {"items" in item ? (
                                /* Sized for credits that wrap. `mt-2.5` and
                                   `space-y-1.5` were tuned when these were
                                   one-line items in the grouped two-column
                                   block; a 6px gap is less than the leading
                                   inside a wrapped item, so a list of full
                                   sentences collapsed into one grey mass. The
                                   gap has to clearly beat the ~9px interline
                                   space for each credit to read as its own
                                   line. */
                                <dd className="mt-4">
                                  <ul className="space-y-4">
                                    {item.items.map((entry, entryIndex) => (
                                      <MaskReveal
                                        key={entry}
                                        as="li"
                                        mode="block"
                                        duration="fast"
                                        delay={
                                          0.25 + index * 0.05 + entryIndex * 0.05
                                        }
                                      >
                                        <span className="flex gap-2.5 text-sm leading-relaxed text-leaf-foreground/90">
                                          <span
                                            aria-hidden="true"
                                            className="mt-[0.65em] h-px w-3 shrink-0 bg-leaf-foreground/40"
                                          />
                                          <span>{entry}</span>
                                        </span>
                                      </MaskReveal>
                                    ))}
                                  </ul>
                                </dd>
                              ) : (
                                <MaskReveal
                                  as="dd"
                                  mode="block"
                                  duration="fast"
                                  delay={0.25 + index * 0.05}
                                  className="mt-1.5 text-sm leading-relaxed text-leaf-foreground"
                                >
                                  {item.value}
                                </MaskReveal>
                              )}
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  ) : null}
                  {groupedMeta?.length
                    ? groupedMeta.map((group) => (
                        <div
                          key={group.label}
                          className="min-w-0 border-t border-leaf-foreground/20 pt-8 lg:col-start-1 lg:row-start-3 lg:self-start lg:pt-8"
                        >
                          {/* The group label is a heading, so it slips like
                              every other heading — word mode, because it is two
                              words. */}
                          <MaskReveal
                            as="h2"
                            mode="word"
                            duration="fast"
                            delay={0.2}
                            className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-foreground/70"
                            text={group.label}
                          />
                          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                            {/* One mask per phase column: the label and its
                                credits arrive together as a single card of
                                type, rather than the rows ticking in one by
                                one. A deliberate exception to the "slip a
                                column by its parts" guidance — these columns
                                are short enough (a label plus three or four
                                one-line credits) that the block still reads as
                                type arriving, and holding each phase together
                                keeps the two of them legible as a pair. */}
                            {group.groups.map((phase, phaseIndex) => (
                              <MaskReveal
                                key={phase.label}
                                as="div"
                                mode="block"
                                duration="fast"
                                delay={0.25 + phaseIndex * 0.05}
                                className="min-w-0"
                              >
                                <h3 className="text-sm font-semibold tracking-[-0.01em] text-leaf-foreground">
                                  {phase.label}
                                </h3>
                                <ul className="mt-3 space-y-1.5">
                                  {phase.items.map((item) => (
                                    <li
                                      key={item}
                                      className="flex gap-2.5 text-sm leading-relaxed text-leaf-foreground/90"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="mt-[0.65em] h-px w-3 shrink-0 bg-leaf-foreground/40"
                                      />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </MaskReveal>
                            ))}
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </CollapsingLeaf>
            </div>

            <div className="mt-2 md:mt-3">{children}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-grout-foreground/15 px-4 py-10 text-grout-foreground sm:px-6 md:px-8 md:py-14 lg:px-20 xl:px-48 2xl:px-64">
        <nav
          aria-label="More work"
          className={`mx-auto grid w-full max-w-[1800px] grid-cols-2 items-start gap-x-8 gap-y-10 md:grid-cols-[1fr_auto_1fr] ${
            reserveNavLane ? "xl:pr-64 2xl:pr-72" : ""
          }`}
        >
          <div>
            {previous && (
              <Link href={workEntryHref(previous)} className={footerLinkClassName}>
                <span className="text-xs font-medium uppercase tracking-wide text-grout-foreground/60">
                  Previous
                </span>
                <span className="mt-2 border-b border-transparent text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:border-grout-foreground md:text-2xl">
                  {previous.title}
                </span>
              </Link>
            )}
          </div>
          <div className="col-span-2 row-start-2 text-center md:col-span-1 md:row-start-auto md:self-center">
            <Link
              href="/#work"
              className="inline-flex min-h-11 items-center border-b border-transparent text-xs font-bold uppercase tracking-[0.16em] outline-none transition-colors hover:border-grout-foreground focus-visible:border-grout-foreground focus-visible:ring-2 focus-visible:ring-grout-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-grout"
            >
              All work
            </Link>
          </div>
          <div className="text-right">
            {next && (
              <Link
                href={workEntryHref(next)}
                className={`${footerLinkClassName} items-end`}
              >
                <span className="text-xs font-medium uppercase tracking-wide text-grout-foreground/60">
                  Next
                </span>
                <span className="mt-2 border-b border-transparent text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:border-grout-foreground md:text-2xl">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </footer>
    </div>
  );
}
