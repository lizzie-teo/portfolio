/*
 * EXPLORE — the plain hero.
 *
 * A static, video-free restatement of StatementHero, shared by the directions
 * whose argument is NOT about the hero (the dated index and the feature rail).
 * The real hero mounts six <video> stages and a particle field; rendering that
 * three times on one comparison page would dominate the page's cost and pull
 * attention away from the thing being compared. So the copy is identical and
 * the interaction is dropped.
 *
 * Direction three does not use this — its whole proposition is a changed hero,
 * so it composes its own.
 *
 * Server component on purpose: no state, no motion, no client bundle.
 */

import { hero } from "./content";

export function ExploreHeroPlain({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-label="Introduction" className="bg-secondary text-foreground">
      <div
        className={`mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 ${
          compact ? "pb-10 pt-8 md:pb-14 md:pt-10" : "pb-16 pt-10 md:pb-24 md:pt-16 lg:pb-28 lg:pt-20"
        }`}
      >
        <p className="mb-7 font-heading text-xs font-bold uppercase tracking-[0.24em] opacity-70 md:mb-10">
          {hero.eyebrow}
        </p>

        {/* h3: /explore's outline is h1 (page) → h2 (direction name) → h3 here. */}
        <h3
          className={`max-w-[70rem] font-heading font-semibold leading-[1.06] tracking-tight ${
            compact
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.02]"
          }`}
        >
          {hero.headline}
        </h3>

        <div className="mt-6 max-w-prose md:mt-8">
          {hero.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 24)}
              className={`text-pretty text-base leading-relaxed ${index === 0 ? "" : "mt-5 md:mt-6"}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
