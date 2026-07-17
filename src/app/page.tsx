import { CoverPlaybackProvider } from "./components/CoverPlaybackProvider";
import { ExploreCursor } from "./components/ExploreCursor";
import { HeroToneProvider } from "./components/HeroToneContext";
import { MotionReveal } from "./components/MotionReveal";
import { ProjectCard } from "./components/ProjectCard";
import { SiteHeader } from "./components/SiteHeader";
import { StatementHero } from "./components/StatementHero";
import { workEntries, workEntryHref } from "./work/projects";

export default function Home() {
  return (
    <HeroToneProvider>
      <div className="min-h-screen bg-background text-foreground">
        <ExploreCursor />

        <SiteHeader />

        <main>
          <StatementHero />

          <section id="work" className="scroll-mt-24 border-y border-border bg-card">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 xl:py-32 2xl:px-24">
            <CoverPlaybackProvider>
            <div className="grid gap-10 md:grid-cols-2 md:items-start lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 xl:gap-x-10 xl:gap-y-16">
              {workEntries.map((entry, index) => (
                <ProjectCard
                  entry={entry}
                  fillRow={false}
                  index={index}
                  key={workEntryHref(entry)}
                />
              ))}

              {/* Placeholder for the fourth project until its title is set.
                  Mirrors ProjectCard: same aspect string, same isolated frame,
                  same frosted-glass panel classes (keep in sync). No media sits
                  behind it and no cover to reveal, so it omits the hover fade and
                  stays visible. The dark smoked-glass pane reads over --secondary
                  and carries the same white title as the real cards; the
                  "Coming soon" label alone reads clearly, so it drops both the
                  subtitle and the industry chip (no sector to name yet) and
                  keeps a title-only panel. */}
              <MotionReveal>
                <article className="@container relative isolate aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-secondary shadow-card">
                  <div className="project-card-glass pointer-events-none absolute inset-x-[8px] bottom-[8px] overflow-hidden rounded-xl p-4 md:p-6">
                    <p className="font-heading font-semibold leading-[1.05] tracking-[-0.03em] text-[clamp(1.2rem,5.6cqw,2.35rem)] text-glass-foreground">
                      Coming soon
                    </p>
                  </div>
                </article>
              </MotionReveal>
            </div>
            </CoverPlaybackProvider>
          </div>
          </section>
        </main>

        <footer id="contact" className="scroll-mt-24 border-t border-border px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
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
    </HeroToneProvider>
  );
}
