import Link from "next/link";
import { cornerClasses, type TileCorners } from "./Chapter";
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

/* Intro meta is a short label/value pair for single facts (Role) or a
   labelled list for grouped scope (the phase breakdown), so the intro can
   carry the snapshot's structure without a separate tile. */
type CaseIntroMeta =
  | { label: string; value: string }
  | { label: string; items: string[] };

type CaseIntro = {
  text: React.ReactNode;
  meta?: CaseIntroMeta[];
};

type CaseStudyShellProps = {
  slug: string;
  intro?: CaseIntro;
  /* For pages that restate the tagline in their own opening module. */
  hideTagline?: boolean;
  /* Anchor id for the title tile, when the page's nav includes the intro. */
  heroId?: string;
  /* Corner rounding for the title tile — "top" when the page groups the
     hero with its opening tiles into one introduction slab. */
  heroCorners?: TileCorners;
  children?: React.ReactNode;
};

export function CaseStudyShell({
  slug,
  intro,
  hideTagline,
  heroId,
  heroCorners = "all",
  children,
}: CaseStudyShellProps) {
  const entry = getCaseStudy(slug);
  if (!entry) {
    throw new Error(`Unknown case study slug: ${slug}`);
  }
  const { previous, next } = getCaseStudyNeighbors(slug);

  return (
    <div
      data-project-theme={slug}
      className="min-h-screen bg-grout text-foreground"
    >
      <SiteHeader tone="dark" />

      <main className="overflow-x-clip">
        <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-3 sm:px-6 md:px-8 md:pt-4 lg:px-12 lg:pb-24 xl:px-16 xl:pb-32 2xl:px-24">
          <div className="xl:pr-64 2xl:pr-72">
            {/* The anchor wrapper (when the page navs to the intro) sits
               outside the leaf so anchor jumps land above the pin line. */}
            <div id={heroId} className={heroId ? "scroll-mt-20" : undefined}>
              <CollapsingLeaf
                pinTopPx={0}
                className={`flex flex-col justify-center ${cornerClasses[heroCorners]} bg-leaf px-5 py-12 sm:px-8 md:py-16 lg:px-12 lg:py-20`}
              >
                <div
                  className={
                    intro
                      ? "grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-16 xl:gap-24"
                      : undefined
                  }
                >
                  <div className="min-w-0">
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
                    <div className="min-w-0 space-y-8">
                      <p className="max-w-prose text-base leading-relaxed text-leaf-foreground/90">
                        {intro.text}
                      </p>
                      {intro.meta?.length ? (
                        <dl className="space-y-6 border-t border-leaf-foreground/20 pt-6">
                          {intro.meta.map((item) => (
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
                                        className="text-sm leading-relaxed text-leaf-foreground/90"
                                      >
                                        {entry}
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
                </div>
              </CollapsingLeaf>
            </div>

            <div className="mt-2 md:mt-3">{children}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-grout-foreground/15 px-4 py-10 text-grout-foreground sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
        <nav
          aria-label="More work"
          className="mx-auto grid w-full max-w-[1800px] grid-cols-2 items-start gap-x-8 gap-y-10 md:grid-cols-[1fr_auto_1fr] xl:pr-64 2xl:pr-72"
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
