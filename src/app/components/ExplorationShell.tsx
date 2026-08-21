import Link from "next/link";
import {
  explorationHref,
  formatExplorationDate,
  getExploration,
  getExplorationNeighbors,
  verdictLabel,
} from "../explorations/entries";
import { SiteHeader } from "./SiteHeader";
import { sectionLede, statementHeading } from "./typography";

/*
 * EXPLORATION SHELL — the chrome every library entry inherits, and the sibling
 * of CaseStudyShell.
 *
 * IT IS DELIBERATELY THE OTHER SURFACE. A case study runs on the grout token:
 * dark masthead, tiled plates, its own project theme. An exploration runs on
 * plain paper with a light masthead and one reading column. The difference is
 * not decoration — it is how a reader knows, before reading a word, that this
 * is working notes rather than a finished argument for a client. Do not port
 * the grout system across; a note dressed as a case study over claims itself.
 *
 * THE HEAD STATES THE VERDICT ABOVE THE FOLD. Subject, date and outcome sit
 * together under the title, so a reader who bounces still leaves knowing the
 * direction was killed and roughly when. That ordering is the surface's whole
 * argument: the decision is the content, the artefacts are the evidence.
 *
 * The entry supplies its own body. Anything specific to one exploration — live
 * specimens, plates, comparison rows — belongs in that entry's folder, exactly
 * as a case study keeps its project modules in its own page rather than in the
 * shell.
 */

const footerLinkClassName =
  "group flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background";

export function ExplorationShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const entry = getExploration(slug);
  if (!entry) {
    throw new Error(`Unknown exploration slug: ${slug}`);
  }
  const { previous, next } = getExplorationNeighbors(slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader tone="light" />

      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
        <div className="mx-auto w-full max-w-[1100px] px-4 pb-20 pt-6 sm:px-6 md:px-8 md:pt-10 lg:pb-28">
          <header className="border-b border-border pb-10 md:pb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Exploration &middot; {entry.subject}
            </p>

            <h1 className={`mt-4 max-w-[20ch] ${statementHeading}`}>
              {entry.title}
            </h1>

            {/* Date and verdict on one line: two facts, equal weight, neither
                worth its own row. The verdict is not a badge or a pill — a
                coloured chip saying "Killed" would read as a status widget,
                and this is a sentence about what happened. */}
            <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>{formatExplorationDate(entry.date)}</span>
              <span aria-hidden className="select-none opacity-40">
                &middot;
              </span>
              <span className="text-foreground">
                {verdictLabel[entry.verdict]}
              </span>
            </p>

            <p className={`${sectionLede} mt-8 text-lg`}>{entry.question}</p>
          </header>

          {children}
        </div>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6 md:px-8 md:py-14">
        <nav
          aria-label="More explorations"
          className="mx-auto grid w-full max-w-[1100px] grid-cols-2 items-start gap-x-8 gap-y-10 md:grid-cols-[1fr_auto_1fr]"
        >
          <div>
            {previous && (
              <Link href={explorationHref(previous)} className={footerLinkClassName}>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Previous
                </span>
                <span className="mt-2 border-b border-transparent text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:border-foreground md:text-2xl">
                  {previous.title}
                </span>
              </Link>
            )}
          </div>

          <div className="col-span-2 row-start-2 text-center md:col-span-1 md:row-start-auto md:self-center">
            <Link
              href="/explorations"
              className="inline-flex min-h-11 items-center border-b border-transparent text-xs font-bold uppercase tracking-[0.16em] outline-none transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              All explorations
            </Link>
          </div>

          <div className="text-right">
            {next && (
              <Link
                href={explorationHref(next)}
                className={`${footerLinkClassName} items-end`}
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next
                </span>
                <span className="mt-2 border-b border-transparent text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:border-foreground md:text-2xl">
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
