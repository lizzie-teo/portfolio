/*
 * EXPLORE / WIREFRAME CARDS — the home grid's cards with their ground swapped.
 *
 * Same scaffolding contract as the rest of /explore: not linked from anywhere,
 * reachable in production so it can be opened on a preview deploy, marked
 * noindex. Nothing here ships to the home page.
 *
 * WHAT IS BEING COMPARED, AND WHAT IS NOT ANY MORE. The live grid is rendered
 * above the candidate grid with identical entries, geometry, type, and MOTION:
 * the ruling, drift, stagger, comet wake, scatter span, and payoff ramps are one
 * set of numbers, held in step in both components on purpose. A difference in
 * how the two rows MOVE is still a bug.
 *
 * Their COLOUR systems have diverged, and that is no longer one variable. It
 * started as one — a luminous field of blurred pastel blooms against flat
 * greyscale line work — but the candidate has since inverted to a dark plate,
 * replaced its pale brand tints with dark stat panels carrying a reversed mark
 * and a counting figure, and stopped choosing a halftone ink at all: it derives
 * one from the ground its hover resolves to (`halftoneInk`, and the rule in
 * `.docs/cover-effects.md`). The live row keeps the older system it is the
 * control for — pale ground, pale panels, a hand-picked mid-tone ink from
 * `projectFields.ts` — because deriving an ink from a near-white panel would
 * produce dots invisible on a near-white ground, and because a control that
 * moves is not a control.
 *
 * So read the rows for ground, ink, and payoff together as one direction each,
 * and read the motion as the thing held constant between them.
 *
 * The candidate is on the same pure-white gallery band the home grid uses, not a
 * ground chosen to flatter it — a proof-grey card on a white plane is the actual
 * question, and putting it on a tinted band would answer a different one.
 */

import type { Metadata } from "next";
import { ProjectCard } from "../../components/ProjectCard";
import { LoFiProjectCard } from "../../components/LoFiProjectCard";
import { workEntries, workEntryHref } from "../../work/projects";

export const metadata: Metadata = {
  title: "Wireframe cards — explore",
  robots: { index: false, follow: false },
};

const gridClass =
  "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-4 xl:gap-12";

export default function ExploreWireframeCardsPage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore · card ground
          </p>
          <h1 className="mt-3 max-w-[24ch] font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            The same card, undeveloped
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed">
            The composition, type, geometry, hover ramps, and payoff timing are
            one set of numbers across both rows below. What differs is the whole
            colour system: a luminous field of blurred pastel blooms clearing to
            a pale brand tint, or a dark plate that develops into the colour of
            the panel it is about to become. Point at a card in either row to
            break it into halftone and scatter it.
          </p>
        </div>
      </header>

      <Band
        eyebrow="Live"
        title="Luminous field"
        note="Each card carries its project's primary theme colour as the dominant bloom, with supporting hues derived by a stated harmony. The hover breaks that light into coloured print."
      >
        <div className={gridClass}>
          {workEntries.map((entry, index) => (
            <ProjectCard
              entry={entry}
              index={index}
              key={workEntryHref(entry)}
            />
          ))}
        </div>
      </Band>

      <Band
        eyebrow="Candidate"
        title="Undeveloped"
        note="The same composition, resting unfinished: flat paper instead of the luminous field, one neutral grey instead of each project's own ink, a hairline edge, the mark stepped back to pencil. Hover and the halftone forms in that project's real colour, scatters, and the panel seals into a plate the client signs: their mark reversed at the head, and the project's measured outcome at the foot, counting up in the project title's own type. The resting card no longer prints that outcome anywhere, so the hover is an arrival rather than a repeat. Both states wear one skeleton, so the mark lands on the title's own line and the air is equal head and foot."
      >
        <div className={gridClass}>
          {workEntries.map((entry, index) => (
            <LoFiProjectCard
              entry={entry}
              index={index}
              key={workEntryHref(entry)}
            />
          ))}
        </div>
      </Band>
    </main>
  );
}

/* The label above each row, then the row itself on the home page's own
   pure-white gallery band. Ink label band so the eye reads a hard cut between
   the two candidates rather than one continuous grid. */
function Band({
  eyebrow,
  title,
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={`${eyebrow}: ${title}`}>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-12 xl:px-16 2xl:px-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed opacity-90">
            {note}
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 2xl:px-24">
          {children}
        </div>
      </div>
    </section>
  );
}
