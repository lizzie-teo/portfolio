import { AnimatedTitle } from "./components/AnimatedTitle";
import { ExploreCursor } from "./components/ExploreCursor";
import { MotionReveal } from "./components/MotionReveal";
import { ProjectCard } from "./components/ProjectCard";
import { SiteHeader } from "./components/SiteHeader";
import { workEntries, workEntryHref } from "./work/projects";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExploreCursor />

      <SiteHeader />

      <main>
        <section>
          <div className="mx-auto w-full max-w-[1800px] px-4 pb-10 pt-6 sm:px-6 md:px-8 md:pb-14 md:pt-8 lg:px-12 lg:pb-16 xl:px-16">
            <MotionReveal>
              <div className="text-center md:text-left lg:mx-auto lg:max-w-3xl lg:text-center">
                <AnimatedTitle
                  className="mx-auto max-w-[22ch] text-[clamp(2.25rem,6vw,3.75rem)] font-semibold uppercase leading-[1.08] tracking-[-0.03em] md:mx-0 lg:mx-auto"
                  text="Lizzie Teo"
                />
              </div>
            </MotionReveal>
          </div>
        </section>

        <section id="work" className="border-y border-border bg-card">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 xl:py-32 2xl:px-24">
            <div className="grid gap-10 md:grid-cols-2 md:items-start lg:gap-x-14 lg:gap-y-20 xl:gap-x-16 xl:gap-y-24">
              {workEntries.map((entry, index) => (
                <ProjectCard
                  entry={entry}
                  fillRow={false}
                  index={index}
                  key={workEntryHref(entry)}
                />
              ))}

              {/* Placeholder for the fourth project until its title is set. */}
              <MotionReveal>
                <article>
                  <div
                    aria-hidden="true"
                    className="relative mb-5 aspect-[1.18/1] overflow-hidden rounded-3xl border border-border bg-secondary shadow-card"
                  />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Case study
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-[1] tracking-[-0.04em] text-muted-foreground md:text-4xl">
                    Coming soon
                  </h2>
                </article>
              </MotionReveal>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="mx-auto grid w-full max-w-[1800px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-7xl">
            Available for senior UX/UI and product design roles.
          </p>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Contact details coming soon
          </p>
        </div>
      </footer>
    </div>
  );
}
