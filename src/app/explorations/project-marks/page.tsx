/*
 * EXPLORATION / PROJECT MARKS — the first library entry.
 *
 * COPY STATUS: DRAFT. The structure, the specimens and the argument are settled;
 * the prose has not been through the `writer` agent yet. Every fact below is
 * sourced from the work itself (the marks in `components/marks/`, the lab at
 * /explore/graphical-icons, and the motion designer's own report on what failed
 * at 32px) rather than written to sound good. Edit the sentences freely; do not
 * add a claim that is not already true of the files.
 *
 * WHY THE SPECIMENS ARE LIVE AND NOT SCREENSHOTS. The entire finding is about
 * motion and about how a figure behaves between two states, and a still cannot
 * carry either. Embedding the real components also means this page cannot drift
 * from the work: if a mark changes, the entry changes with it.
 *
 * `components/marks/` now has a committed consumer for the first time. Before
 * this entry it was 1,800 lines whose only caller was a gitignored lab route,
 * which meant the repo would have shipped it as dead code.
 */

import type { Metadata } from "next";
import { ExplorationShell } from "../../components/ExplorationShell";
import { sectionHeading } from "../../components/typography";
import { explorationMetadata } from "../entries";
import { ConstructedSpecimens, GlyphSpecimens } from "./MarkSpecimens";

export const metadata: Metadata = explorationMetadata("project-marks");

const proseClassName = "mt-5 max-w-prose text-base leading-relaxed";

export default function ProjectMarksExploration() {
  return (
    <ExplorationShell slug="project-marks">
      <section className="pt-12 md:pt-16">
        <h2 className={sectionHeading}>What I started with</h2>
        <p className={proseClassName}>
          Four hairline glyphs close the project cards on the home page, one per
          sector: ascending bars for financial services, a dot matrix cross for
          healthcare, two interlocking rings for payments, a rhombus board for
          higher education. They are drawn at 32px, they read cleanly, and they
          have been on the site for a while.
        </p>
        <p className={proseClassName}>
          My objection was that they depict. A drawn mortarboard is a picture of
          a subject, and a picture has nothing to animate. I wanted marks that
          were built from a rule instead, so that they would have count, spacing
          and bearing to move through, and so they would look like this site had
          drawn them rather than like something chosen from a set.
        </p>
      </section>

      <section className="pt-14 md:pt-20">
        <h2 className={sectionHeading}>What I built</h2>
        <p className={proseClassName}>
          Three construction families, each applied to two projects. Every figure
          is generated parametrically, so the element count is derived from the
          render size and a mark at 32px and the same mark at 240px are one
          drawing at two rulings rather than two drawings. One hairline, one box,
          one ramp, one reduced motion rule across all six, so any difference
          between two marks is a difference of construction.
        </p>
        <p className={proseClassName}>
          At rest each is an even field. On hover it resolves: the elements
          converge, one holds at full strength while the rest fall back, and a
          filled point appears where the figure landed. Funding Finder resolves
          by alignment, the symptom checker by narrowing.
        </p>
        <p className="mt-5 max-w-prose text-sm text-muted-foreground">
          Hover or focus a plate to run both projects at once. On a touch screen,
          tap to hold it open and tap again to release.
        </p>
        <div className="mt-8">
          <ConstructedSpecimens />
        </div>
      </section>

      <section className="pt-14 md:pt-20">
        <h2 className={sectionHeading}>Why I killed it</h2>
        <p className={proseClassName}>
          Read the pairs above again. The construction is doing what I asked, the
          figures are legible at every size I tested, and the two projects in each
          row are telling you nothing about each other. Swap them and no reader
          could tell which mark belonged to which project.
        </p>
        <p className={proseClassName}>
          The mistake was thinking construction could replace subject. It cannot.
          Construction is a grammar, and all three families were speaking the same
          sentence: an even field resolves to one answer. That is true of any
          design project ever undertaken, which is why the marks were handsome and
          interchangeable at the same time. I had solved the animation problem and
          lost the identification problem, and the identification problem was the
          one the glyphs were there for.
        </p>
      </section>

      <section className="pt-14 md:pt-20">
        <h2 className={sectionHeading}>The second attempt</h2>
        <p className={proseClassName}>
          So I went back to the four glyphs already shipping and asked a narrower
          question: can the original figure stay exactly as it is at rest, and
          move using only its own parts? The cross is nine discrete dots. The
          finance mark is three unequal quantities. The payments mark is two
          bodies with an overlap. Those are parts with somewhere to go.
        </p>
        <p className={proseClassName}>
          The rule became: rest is the sector glyph, unchanged, and motion is the
          project&rsquo;s own argument performed on that glyph&rsquo;s parts.
          Nothing gets redrawn. That also meant the rest states were already
          approved and already proven at 32px, which the invented families had to
          earn from nothing.
        </p>
        <div className="mt-8">
          <GlyphSpecimens />
        </div>
      </section>

      <section className="pt-14 md:pt-20">
        <h2 className={sectionHeading}>What I learned from the failures</h2>
        <p className={proseClassName}>
          Two of these were rebuilt because the first version failed at the only
          size that decides anything. The narrowing cross originally retracted all
          eight dots into the centre, which at 32px resolved to a single four
          pixel dot in an empty box. It now keeps the outer four as a ghosted
          field and absorbs only the inner four, so the figure still reads as a
          cross closing rather than as a mark disappearing.
        </p>
        <p className={proseClassName}>
          The finance bars first levelled onto the tallest, which raises two bars
          off the baseline and reads as a chart entrance. That says growth, and
          growth is not what the project did. Levelling onto the middle makes the
          movement reciprocal, and the bar that never had to move becomes the
          survivor, which is the truer claim anyway: the match was always among
          the options, and what changed is that the options became comparable.
        </p>
        <p className={proseClassName}>
          This direction did not ship either. It is better than the first and it
          is still not good enough to put on the home page, mostly because the
          payments mark resolves to a ring with a centred dot, which is a record
          button. But the rule it produced is the part worth keeping, and it is
          the thing I would start from next time: a mark earns its motion from
          what it already is, not from a system layered over it.
        </p>
      </section>
    </ExplorationShell>
  );
}
