import Link from "next/link";
import { ArrivalCue } from "./ArrivalCue";
import { anchorScrollOffset, cornerClasses, type TileCorners } from "./Chapter";
import { CollapsingLeaf } from "./CollapsingLeaf";
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
  /* With grouped meta present, the hero becomes a masthead on three rows: the
     chip kicker (row 1), the H1 with the role credits beneath it (rows 2–3,
     left column), and the intro prose in the right column starting level with
     the H1 — it spans rows 2–3 (`row-start-2 row-span-2`), so its first line
     sits on the title line, not up by the chip. Row three takes the slack
     (`1fr`) so the `self-start` role block stays snug under the title whatever
     the intro's height. On mobile the chip renders inside the title block (see
     JSX) so the stacked spacing is unchanged; the separate row-1 chip is
     `lg:` only. Without grouped meta (Macquarie) the original two-column grid
     is left exactly as it was. */
  const hasGroupedMeta = Boolean(groupedMeta?.length);
  const introGridClassName = hasGroupedMeta
    ? "grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-x-16 lg:gap-y-8 xl:gap-x-24"
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
                className={`flex flex-col justify-center ${cornerClasses[heroCorners]} bg-leaf px-5 py-12 sm:px-8 md:py-16 lg:px-12 lg:py-20`}
              >
                <div className={intro ? introGridClassName : undefined}>
                  {/* Masthead only: the chip is lifted into its own top grid
                     row (lg+) so the intro can align to the H1 line below it.
                     Hidden below lg, where the in-flow copy inside the title
                     block keeps the stacked spacing unchanged. */}
                  {chipNode && hasGroupedMeta ? (
                    <div className="mb-5 hidden lg:col-start-1 lg:row-start-1 lg:mb-0 lg:block">
                      {chipNode}
                    </div>
                  ) : null}
                  <div
                    className={`min-w-0 ${hasGroupedMeta ? "lg:col-start-1 lg:row-start-2" : ""}`}
                  >
                    {chipNode ? (
                      <div className={`mb-5 ${hasGroupedMeta ? "lg:hidden" : ""}`}>
                        {chipNode}
                      </div>
                    ) : null}
                    <h1 className="max-w-[18ch] text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-leaf-foreground">
                      {entry.title}
                    </h1>
                    {!hideTagline && (
                      <p className="mt-6 max-w-prose text-lg leading-[1.35] tracking-[-0.02em] text-leaf-foreground/80 md:text-2xl">
                        {entry.tagline}
                      </p>
                    )}
                  </div>
                  {intro ? (
                    <div
                      className={`min-w-0 space-y-8 ${hasGroupedMeta ? "lg:col-start-2 lg:row-start-2 lg:row-span-2" : ""}`}
                    >
                      <div className="max-w-prose space-y-4 text-base leading-relaxed text-leaf-foreground/90">
                        {intro.text}
                      </div>
                      {plainMeta?.length ? (
                        <dl className="space-y-6 border-t border-leaf-foreground/20 pt-6">
                          {plainMeta.map((item) => (
                            <div key={item.label}>
                              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-leaf-foreground/70">
                                {item.label}
                              </dt>
                              {"items" in item ? (
                                <dd className="mt-2.5">
                                  <ul className="space-y-1.5">
                                    {item.items.map((entry) => (
                                      <li
                                        key={entry}
                                        className="flex gap-2.5 text-sm leading-relaxed text-leaf-foreground/90"
                                      >
                                        <span
                                          aria-hidden="true"
                                          className="mt-[0.65em] h-px w-3 shrink-0 bg-leaf-foreground/40"
                                        />
                                        <span>{entry}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </dd>
                              ) : (
                                <dd className="mt-1.5 text-sm leading-relaxed text-leaf-foreground">
                                  {item.value}
                                </dd>
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
                          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-foreground/70">
                            {group.label}
                          </h2>
                          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                            {group.groups.map((phase) => (
                              <div key={phase.label} className="min-w-0">
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
                              </div>
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
