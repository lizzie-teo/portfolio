/*
 * THE LIBRARY INDEX — every exploration, shelved by subject.
 *
 * SCAFFOLD, NOT THE FINISHED SURFACE. This lays out the information architecture
 * correctly (shelves by subject, each item stating its question and its verdict)
 * but it is a plain typographic list, and the brief for this page is a catalogue
 * of SPECIMENS — each item showing the artefact it produced rather than only
 * naming it. That pass has not happened yet. It is the first thing an employer
 * sees on this surface, so it earns the design attention; do not treat the list
 * below as settled.
 *
 * WHY SUBJECT AND NOT DATE. See the header in `entries.ts`. Short version: a
 * catalogue does not promise a publishing cadence and a dated stream does, and
 * six items with nothing new for a year reads as abandoned only in the second
 * framing.
 *
 * NO COUNTER ANYWHERE. Not on the shelves, not in the nav. A number here invites
 * the reader to judge the library by its size, which is the one measure a
 * growing collection always loses on.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { galleryHeading, indexItemHeading } from "../components/typography";
import {
  explorationHref,
  explorationsBySubject,
  formatExplorationDate,
  verdictLabel,
} from "./entries";

export const metadata: Metadata = {
  title: "Explorations | Lizzie Teo",
  description:
    "Directions tried while building this site, and what became of them.",
};

export default function ExplorationsIndexPage() {
  const shelves = explorationsBySubject();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader tone="light" />

      <main className="overflow-x-clip">
        <div className="mx-auto w-full max-w-[1100px] px-4 pb-20 pt-6 sm:px-6 md:px-8 md:pt-10 lg:pb-28">
          <header className="border-b border-border pb-10 md:pb-14">
            <h1 className="max-w-[22ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Explorations
            </h1>
            <p className="mt-5 max-w-prose text-base leading-relaxed">
              Directions I tried while building this site, and what became of
              them. Most of these did not ship. The ones that were killed are
              here for the same reason as the ones that were not: the decision is
              the work, and the artefact is the evidence for it.
            </p>
          </header>

          {shelves.map((shelf) => (
            <section key={shelf.subject} className="pt-12 md:pt-16">
              <h2 className={galleryHeading}>{shelf.subject}</h2>

              <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
                {shelf.entries.map((entry) => (
                  <li key={entry.slug} className="bg-background">
                    <Link
                      href={explorationHref(entry)}
                      className="group flex flex-col gap-3 p-6 outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset sm:p-8"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        <span>{formatExplorationDate(entry.date)}</span>
                        <span aria-hidden className="select-none opacity-40">
                          &middot;
                        </span>
                        <span className="text-foreground">
                          {verdictLabel[entry.verdict]}
                        </span>
                      </span>

                      <span
                        className={`${indexItemHeading} border-b border-transparent transition-colors group-hover:border-foreground`}
                      >
                        {entry.title}
                      </span>

                      <span className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                        {entry.question}
                      </span>

                      <span className="max-w-prose text-sm leading-relaxed">
                        {entry.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
