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
        <section className="mx-auto grid w-full max-w-[1800px] px-4 pb-6 pt-14 sm:px-6 md:px-8 md:pb-12 md:pt-20 lg:px-12 xl:px-16 xl:pt-28 2xl:px-24">
          <MotionReveal className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.29fr)] lg:items-start xl:gap-12">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                UX/UI portfolio
              </p>
              <AnimatedTitle
                className="max-w-[22ch] text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
                text="Hi, I'm Lizzie, a product designer at Mastercard."
              />
            </div>
          </MotionReveal>
        </section>

        <section id="work" className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 xl:py-32 2xl:px-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-start lg:gap-x-14 lg:gap-y-20 xl:gap-x-16 xl:gap-y-24">
            {workEntries.map((entry, index) => (
              <ProjectCard
                entry={entry}
                fillRow={
                  workEntries.length % 2 !== 0 &&
                  index === workEntries.length - 1
                }
                index={index}
                key={workEntryHref(entry)}
              />
            ))}
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
