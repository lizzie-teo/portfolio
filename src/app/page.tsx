import { ExploreCursor } from "./components/ExploreCursor";
import { HeroToneProvider } from "./components/HeroToneContext";
import { SiteHeader } from "./components/SiteHeader";
import { StatementHero } from "./components/StatementHero";
import { WorkGallery } from "./components/WorkGallery";

export default function Home() {
  return (
    // HeroToneProvider lets the hero invert the masthead along with itself when
    // a keyword lights up, so the two read as one dark stage.
    <HeroToneProvider>
      {/* The page's paper is the warm --secondary ground: hero and work gallery
          both sit on it, and the masthead is typeset directly on it (the header
          paints nothing in light tone). One canvas from the top edge down. */}
      <div className="min-h-screen bg-secondary text-foreground">
        <ExploreCursor />

        <SiteHeader />

        <main>
          <StatementHero />

          {/* The work gallery, on the dark --grout plane. The cards rest as dark
              plates carrying light line work and develop into colour on hover, so
              the section needs a ground the plates can sit ON — grout is defined
              as one step deeper than the leaf ink the cards use, which is the
              plane-and-tile relationship the case studies already run on. The
              band owns its own colour scheme rather than following the shell's,
              so it stays dark in both tones; the rest of the page is unchanged.
              Everything inside is WorkGallery's, including the filter rail.

              No hairline on either edge: grout against the warm paper is already
              a hard tonal step, and the rule only showed itself when the hero
              inverted above it — reading as a stray white line across the page
              rather than an edge. The colour change is the edge. */}
          <section
            id="work"
            className="scroll-mt-24 bg-grout text-grout-foreground"
          >
            <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 xl:py-32 2xl:px-24">
              <WorkGallery />
            </div>
          </section>
        </main>
      </div>
    </HeroToneProvider>
  );
}
