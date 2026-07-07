import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import {
  getCaseStudy,
  getCaseStudyNeighbors,
  workEntryHref,
} from "../work/projects";

const footerLinkClassName =
  "group inline-flex min-h-11 flex-col justify-center outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background";

type CaseStudyShellProps = {
  slug: string;
  children?: React.ReactNode;
};

export function CaseStudyShell({ slug, children }: CaseStudyShellProps) {
  const entry = getCaseStudy(slug);
  if (!entry) {
    throw new Error(`Unknown case study slug: ${slug}`);
  }
  const { previous, next } = getCaseStudyNeighbors(slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-[1800px] px-4 pb-12 pt-14 sm:px-6 md:px-8 md:pb-16 md:pt-20 lg:px-12 lg:pb-24 xl:px-16 xl:pt-28 2xl:px-24">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Case study
          </p>
          <h1 className="max-w-[18ch] text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-[1.35] tracking-[-0.02em] text-muted-foreground md:text-2xl">
            {entry.tagline}
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1800px] px-4 pb-16 sm:px-6 md:px-8 lg:px-12 lg:pb-24 xl:px-16 xl:pb-32 2xl:px-24">
          {children}
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
        <nav
          aria-label="More work"
          className="mx-auto grid w-full max-w-[1800px] grid-cols-2 items-start gap-x-8 gap-y-10 md:grid-cols-[1fr_auto_1fr]"
        >
          <div>
            {previous && (
              <Link href={workEntryHref(previous)} className={footerLinkClassName}>
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
              href="/#work"
              className="inline-flex min-h-11 items-center border-b border-transparent text-xs font-bold uppercase tracking-[0.16em] outline-none transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background"
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
