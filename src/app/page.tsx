import { ExploreCursor } from "./components/ExploreCursor";
import { HeroToneProvider } from "./components/HeroToneContext";
import { ComingSoonCard, ProjectCard } from "./components/ProjectCard";
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

          {/* The work gallery. The project cards are near-white luminous fields,
              so the section drops one step to the warm-neutral --secondary ground
              (not the pure-white --card the light-shell cards used) to give every
              card an edge and let its bloom read as lit. Leans into the approved
              warm-canvas direction; see the report's rule note against §3. */}
          <section id="work" className="scroll-mt-24 border-y border-border bg-secondary">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 xl:py-32 2xl:px-24">
            {/* Five portrait tiles (four projects + the trailing placeholder).
                Each card caps its own width and centres in its cell, so the
                column count sets density, not card size: one up on the narrowest
                phones, two up through the tablet range, four up at xl, and all
                five in one row at 2xl. */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-4 xl:gap-12 2xl:grid-cols-5">
              {workEntries.map((entry, index) => (
                <ProjectCard entry={entry} index={index} key={workEntryHref(entry)} />
              ))}

              {/* Trailing placeholder for the next project. A muted member of the
                  same set — same 5:7 frame, no field, no hover. See ComingSoonCard.
                  Its index continues the grid's stagger. */}
              <ComingSoonCard index={workEntries.length} />
            </div>
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
