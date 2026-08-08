"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { minorHeading, subsectionHeading } from "@/app/components/Chapter";
import { ExhibitCarousel } from "@/app/components/ExhibitCarousel";

/**
 * The bridge between the round-2 findings and the decisions chapter: what the
 * shipped redesign did about them, shown as matched region crops of the live
 * pages rather than whole screens.
 *
 * It follows the `usability-testing` findings band (`FeatureChips`, fed by
 * `UsabilityFindings`) and shares that band's tinted research surface and its
 * evidence vocabulary — the claim as real body prose with the load-bearing
 * phrase bolded, muted figure legends, and product screenshots at `rounded-xs`
 * with the clip on the shadow-bearing element. The two are deliberately not the
 * same component: the findings band is a full-bleed chip accordion beside a
 * collapsing screenshot stage, while this stays a tiled `ExhibitCarousel`,
 * because a before-and-after belongs in one framed slide where both states can
 * be seen at once rather than paged apart.
 *
 * The slide is a plate: `--card` fill closed by a `border-border` hairline and
 * no shadow, so it reads as a clean sheet laid flat — the same soft hairline
 * the sketch frames use — rather than a lifted card competing with the two
 * shadowed screenshot frames inside it.
 *
 * Headings are set as real headings on their §12 tokens rather than as accent
 * kickers: the pair label as an `h3` on `subsectionHeading`, spanning the full
 * slide above the grid because it names all three columns, and the two state
 * labels as `h4`s on `minorHeading`. The crops are the loud element on this
 * slide, and an accent mark competing above them made the argument column read
 * as chrome rather than as the sentence that explains the pictures.
 *
 * Four rules govern the presentation:
 *
 * 1. **Matched width, always.** Every shot renders at an identical width —
 *    including the solo one, which keeps the paired track rather than growing
 *    into the space a missing "after" left. Equal width on 1080px-wide phone
 *    captures is equal zoom, so the type in "before" and "after" is the same
 *    physical size and the comparison is fair rather than two differently-scaled
 *    pictures. Height is the variable, and it is set by rule 2.
 * 2. **Cut both states at the same place in the page — a shape or a landmark,
 *    never neither.** A pair either runs both states end to end at their true
 *    ratios (`Shot.size`), which is right where the length itself is the
 *    argument; or cuts both to one shape, 1080 by 1300, from the same anchor,
 *    which is right where the change is visible near the top and two long
 *    columns would bury it; or runs both from the page top to the same
 *    *content* landmark, again at true ratios, which is right where the
 *    argument is what happened to a whole run of the page. The guidance pair is
 *    whole; the outcome pair runs top to the foot of the last service option in
 *    each version, so the frames differ in height by exactly as much as the
 *    pages do. The rule binds *pairs*, because what it protects is a fair
 *    comparison. A single-state slide has nothing to be compared against, so it
 *    is cut to whatever depth its own argument needs and keeps a fade cut to
 *    that depth (`Shot.fadeFrom`) — the service-distance shot runs to the foot
 *    of the first result, deeper than a matched crop and far short of a page
 *    that carries fifty of them.
 * 3. **Honest framing.** Nothing may imply text was cut that was not. A matched
 *    crop stops mid-page, so both its states fade at the foot and the frames say
 *    nothing about length either way. A whole-page shot has no continuation, so
 *    it takes no fade, and the two frames are then free to differ in height —
 *    that difference is real and is the point. A landmark cut is the same
 *    bargain read the other way: the heights differ because the pages do, and
 *    both fade because both pages carry on below the landmark. Each landmark
 *    crop therefore runs a little past its cut, so the fade falls on the head of
 *    whatever comes next rather than on the last line of the argument. A pair
 *    carries a written legend
 *    only where the frames alone would leave the point in doubt. The same rule
 *    is why the one recommendation that has not shipped gets a slide with a
 *    single state and no `--primary` accent, rather than a mock in the "after"
 *    column: an empty frame is honest where an invented one would read as
 *    delivered work.
 * 4. **Nothing load-bearing is trapped in a bitmap.** The claim, the state
 *    labels, and the legends are real DOM text, so the argument survives at
 *    320px where the crops are only legible as structure.
 */

type Shot = {
  /** Web asset path under /public — a matched region crop of the live page. */
  src: string;
  /** Describes the captured region, and its structure, for assistive tech. */
  alt: string;
  /** Six words at most: what this state is, so the column reads on its own. */
  summary: string;
  /**
   * A whole-page capture rather than a matched region crop, given as its own
   * pixel dimensions. Where a pair supplies these, the frame takes the image's
   * true ratio and drops the foot fade: there is no continuation to imply,
   * because the panel is shown end to end. Rule 1's matched *width* still holds
   * (equal width on 1080px-wide captures is still equal zoom); only the matched
   * height goes, which is the whole point of showing a page whole.
   */
  size?: { width: number; height: number };
  /**
   * Where the foot fade starts, as a percentage of the frame. Only for a shot
   * that carries both a `size` and a continuation: a region deeper than the
   * standard crop still needs the "and it kept going" cue, but the shared 84%
   * band is cut for a 1300px frame and on a taller one it would reach up into
   * live content. Left unset, a sized shot takes no fade (it is whole) and an
   * unsized one takes the shared band.
   */
  fadeFrom?: number;
};

type Pair = {
  id: string;
  /** Names the screen this pair reports on — matches the finding it answers. */
  label: string;
  /**
   * What the state on the left is called. "Before" on a shipped pair; on a
   * single-state slide it names the present, because there is no "after" for it
   * to precede.
   */
  beforeLabel?: string;
  /**
   * What the redesign did, as one or more `claimParagraph` paragraphs with the
   * load-bearing phrase bolded inline. Paragraphs rather than a single block
   * because the argument has two beats — what testing asked for, then what
   * shipped — and running them together made the ask read as our own reasoning.
   * The pair supplies its own `<p>` tags so it can break where the beat breaks.
   * Never claims the page got shorter: it did not.
   */
  claim: ReactNode;
  before: Shot;
  /**
   * Omitted where nothing has shipped yet. A slide without an `after` runs one
   * state instead of two and drops the `--primary` rule entirely, so the accent
   * that marks "this is the current state" is never spent on a change that has
   * not been made. Inventing a mock to fill the column would read as shipped
   * work, which is exactly the claim this slide must not make.
   */
  after?: Shot;
  /**
   * Optional framing note: what the capped frames do not show, stated plainly,
   * so a reader who measures the live pages finds the framing already admitted.
   * Sits at the foot of the argument column, under the claim it qualifies.
   * Omitted where the crops already make the point without it.
   */
  legend?: string;
};

const A = "/assets/healthdirect/before-after";

/**
 * The matched region frame: 1080 by 1300, cut from each page's own anchor. A
 * pair framed this way shares a shape and a scale, and the frame says nothing
 * about how long either page is — the legend does that in words. Shots carrying
 * their own `size` are whole pages and bypass this entirely.
 */
const CAPTURE_WIDTH = 1080;
const CAPTURE_HEIGHT = 1300;

/**
 * One paragraph of the argument column. Body reading prose, not a §5 lede: the
 * heading it explains titles the whole three-column block, and this is the
 * first column of that block rather than the sentence beneath a heading. Same
 * size and colour as `sectionLede` deliberately — only the token's `mt-3` would
 * be wrong here, since the gap above the column lives on the grid wrapper.
 * Carried by the pair data rather than the layout because a claim decides for
 * itself where its beats break.
 */
const claimParagraph = "max-w-prose text-base leading-relaxed text-foreground";

const pairs: Pair[] = [
  {
    id: "outcome-page",
    label: "See a GP outcome",
    claim: (
      <>
        <p className={claimParagraph}>
          Round 2 asked for one change here, a copy edit to “What to do” so the
          different service categories reached people as a recommendation
          rather than a paragraph to work through.
        </p>
        <p className={`${claimParagraph} mt-4`}>
          The rebuild <strong>says what to do in a sentence</strong>, then{" "}
          <strong>lays the services out as numbered options</strong>. Each one
          says what the service is, what it costs and how you get seen, and
          links straight to it. Before, the three were bullets in a single
          list, and one Service Finder link at the top was the only way in.
        </p>
      </>
    ),
    before: {
      src: `${A}/see-doc-before.webp`,
      alt: "The original 'See a doctor within 2 hours' page, from the top of the screen to the end of the options: the pink outcome banner, a 'What to do' heading, two paragraphs of advice, then one bullet list mixing Alternate GPs, Virtual Care Clinics and Urgent Care Clinics with their explanations, closed by a single 'About these services' link.",
      summary: "Advice, then one mixed list.",
      size: { width: 1080, height: 2530 },
      fadeFrom: 95,
    },
    after: {
      src: `${A}/see-doc-after.webp`,
      alt: "The redesigned page, from the top of the screen to the end of the options: the same outcome banner, a 'What to do' summary card stating you need to see a doctor within the next 2 hours, then three numbered options, 1. Virtual Care Clinics, 2. GP and 3. Urgent Care Clinics, each with bullets on what the service is, what it costs and how you get seen, and its own link.",
      summary: "A summary, then three options.",
      size: { width: 1080, height: 3970 },
      fadeFrom: 95,
    },
    legend:
      "Both states run from the top of the page to the same point, just past the last service option, and fade where each carries on. The new page is the longer one: every option now carries the detail that used to sit behind one shared link.",
  },
  {
    id: "guidance-panel",
    label: "Service guidance",
    claim: (
      <>
        <p className={claimParagraph}>
          Users found this panel helpful, but round 2 heard the same ask twice
          over: they wanted it more targeted. Several expected it to name the
          services near them, or give them a number to call.
        </p>
        <p className={`${claimParagraph} mt-4`}>
          The rebuild <strong>scopes the panel to a single service</strong> and{" "}
          <strong>sets the headings as the questions people asked</strong>:
          whether an appointment is needed, wait times, cost. Each answer leads
          with its verdict, so the first word or two is usually the whole
          answer.
        </p>
      </>
    ),
    before: {
      src: `${A}/aboutservices-before.png`,
      alt: "The original panel, titled 'About these services', shown whole: Virtual Care Clinics, Urgent Care Clinics and Emergency Departments each described in a flat paragraph and a bullet list, one after another.",
      summary: "Every service, described in turn.",
      size: { width: 1080, height: 3249 },
    },
    after: {
      src: `${A}/aboutservices-after.png`,
      alt: "The redesigned panel, titled 'Learn more' and scoped to Virtual Care Clinics, shown whole: a short description, then question headings including 'Do I need an appointment?' answered with 'No' in the first word.",
      summary: "One service, answered in questions.",
      size: { width: 1080, height: 2400 },
    },
  },
  {
    id: "service-distance",
    label: "Service distance",
    beforeLabel: "Today",
    claim: (
      <>
        <p className={claimParagraph}>
          Round 2 asked for one thing the redesign has not answered yet: a way
          to filter services by how far away they are, rather than only sorting
          by it.
        </p>
        <p className={`${claimParagraph} mt-4`}>
          Sorting by nearest shipped.{" "}
          <strong>A distance filter is still open, pending technical
          feasibility.</strong>{" "}
          Until it lands the list orders results nearest first but nothing
          bounds how far it reaches, so a search from one Adelaide suburb
          returns fifty results within 1166km.
        </p>
      </>
    ),
    before: {
      src: `${A}/nearest-sort.webp`,
      alt: "The live service results for Urgent Care in Bowden: a Filter button, a 'Sort by: Nearest' control, then a 'Search results' heading reading '50 results within 1166km', followed by the whole first result card, Total Urgent Care Norwood, at 3.0km.",
      summary: "Sorted by nearest, unbounded.",
      size: { width: 1080, height: 2115 },
      // Ends in the gap after a complete result card, with forty-nine more
      // below it. A shallow band, so the cue lands in the margin and never
      // reaches the "3.0km" that shows the sort working.
      fadeFrom: 94,
    },
    legend:
      "Shown as it stands today, with no second frame beside it. It is the one round 2 recommendation without a shipped answer, kept here rather than dropped.",
  },
];

/**
 * Fades a crop at its foot so a capped region reads as "and it kept going"
 * rather than a hard cut. A transparency mask, not a colour gradient, so it
 * works on any surface. Set at 84% rather than the 78% an earlier draft used,
 * because these crops are cut far tighter: at this depth a longer fade band
 * would eat the very heading that carries the argument. Purely visual, so no
 * reduced-motion
 * concern. Within a matched-region pair both states always carry it, so the fade
 * never reads as a claim that one page ran out before the other; a whole-page
 * pair carries it on neither, for the same reason.
 */
const FOOT_FADE = "linear-gradient(to bottom, black 84%, transparent 100%)";

/**
 * The fade a given shot wears, or none. A matched region crop takes the shared
 * band; a whole panel takes nothing; a sized shot that names its own
 * `fadeFrom` takes a band cut to its own depth.
 */
function footFade(shot: Shot) {
  if (shot.fadeFrom !== undefined) {
    return `linear-gradient(to bottom, black ${shot.fadeFrom}%, transparent 100%)`;
  }
  return shot.size ? undefined : FOOT_FADE;
}

/**
 * Sizing hints for the crops: a third of the reading column on desktop where
 * the slide runs copy, before, after across; half of it on tablet where the
 * pair sits under the copy; close to full width on a phone where it stacks.
 */
const shotSizes =
  "(min-width: 1024px) 280px, (min-width: 640px) 44vw, 88vw";

/**
 * One state of a page — "Before", "After", or on a single-state slide the
 * present — as a print figure: the state label over a rule, a one line summary,
 * then the crop.
 *
 * The rule is the whole marker system. Before takes the page's own hairline;
 * After takes a 2px `--primary` rule, the single accent in the pair, so the
 * current state is unmistakable at a glance. A solo state takes the hairline
 * too: the accent means "and here is what shipped", so a slide with nothing
 * shipped must not wear it. Colour is never the only signal —
 * the word above the rule says which is which, and it is the first thing read
 * in both the visual and the accessibility order. That word is an `h4` on
 * `minorHeading` rather than the §3 kicker: it titles half the exhibit, and at
 * 12px uppercase it sat too far under the crop it named to read as its label.
 *
 * From `sm` the figure spans the slide's two subgrid rows, so both captions
 * share one height and both crops start on the same line no matter how the
 * summaries wrap. Below `sm` the pair is stacked and alignment is moot, so the
 * figure falls back to a plain column.
 */
function StateFigure({
  state,
  shot,
  isAfter = false,
  paired = true,
}: {
  state: string;
  shot: Shot;
  /** Carries the one `--primary` rule on the slide. Only a shipped state does. */
  isAfter?: boolean;
  /**
   * Whether a sibling figure sits beside this one. Only then is there a caption
   * height to match, so only then does the figure claim the two subgrid rows —
   * a lone figure has no parent grid to borrow tracks from.
   */
  paired?: boolean;
}) {
  const fade = footFade(shot);
  return (
    <figure
      className={
        paired
          ? "flex flex-col gap-4 sm:row-span-2 sm:grid sm:grid-rows-subgrid sm:gap-4"
          : "flex flex-col gap-4"
      }
    >
      <figcaption>
        {/* §12 outline: section h2 → pair label h3 → state h4. "Before" and
            "After" title the two halves of the exhibit, so they are headings
            doing a heading's job and wear their level's token rather than the
            §3 uppercase kicker they used to. */}
        <h4 className={minorHeading}>{state}</h4>
        {/* The state rule. A fixed 2px track keeps both columns' captions on
            one baseline while the lines themselves differ in weight. */}
        <span aria-hidden="true" className="mt-2 block h-0.5">
          <span
            className={
              isAfter
                ? "block h-0.5 w-full rounded-full bg-primary"
                : "block h-px w-full bg-border"
            }
          />
        </span>
        {/* A figure legend, so the quiet supporting tone. --muted-foreground
            (#55504A) on the softened Healthdirect card (#F6F9F9) is 7.5:1,
            clearing the §4 7:1 bar for small text. */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {shot.summary}
        </p>
      </figcaption>
      {/* Genuine product screenshot, so `rounded-xs` per the house carve-out,
          clipped at the shadow-bearing element so no square shadow halos the
          rounded crop. `self-start` keeps the frame at its own height rather
          than stretching to the row — load-bearing for a whole-page pair, whose
          two frames are deliberately different heights, and harmless for a
          matched-crop pair, whose frames match anyway. Nothing is scaled to
          fill: the frame always takes the image's ratio. */}
      <div className="overflow-hidden rounded-xs border border-border bg-card shadow-card sm:self-start">
        <div
          className="relative w-full"
          style={{
            aspectRatio: shot.size
              ? `${shot.size.width} / ${shot.size.height}`
              : `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`,
          }}
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes={shotSizes}
            className="object-contain object-top"
            // A whole-page shot has no continuation to imply, so it takes no
            // fade; anything that stops mid-page keeps one, cut to its depth.
            style={
              fade === undefined
                ? undefined
                : { maskImage: fade, WebkitMaskImage: fade }
            }
          />
        </div>
      </div>
    </figure>
  );
}

/**
 * One screen's before and after as a slide: the argument, then the pair —
 * beside it on desktop, beneath it on smaller screens.
 *
 * The slide is a plate: `--card` fill on the section's tinted band, closed by a
 * `border-border` hairline and no shadow. It exists to bind the three columns
 * under the heading that names them and to give the carousel a fixed edge to
 * page against, without adding a second lifted object to a slide that already
 * holds two shadowed screenshot frames.
 */
function PairBlock({ pair }: { pair: Pair }) {
  const { after } = pair;
  /**
   * The slide's shape at `lg`. A pair runs argument, before, after across three
   * tracks. A solo state runs two, and the crop keeps the same 18rem track the
   * paired crops sit in rather than growing to fill the space a missing "after"
   * left behind: every crop in the carousel is then the same physical size, and
   * the argument column simply takes the width back. An empty third column
   * would have said "something belongs here", which is the opposite of what
   * this slide means.
   */
  const gridColumns = after
    ? "lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_minmax(0,1fr)]"
    : "lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]";
  return (
    // The slide is its own plate: `--card` fill and the shared tile padding on
    // the tinted band, closed by the same soft hairline the sketch frames use
    // (`MediaFrame`'s `border-border`, no shadow). Shadow is the deliberate
    // omission: this reports what shipped and reads better as a clean sheet laid
    // flat, held by an edge rather than lifted off the band. Flat also keeps the
    // plate from competing with the two screenshot frames inside it, which are
    // the one thing here that does carry a shadow.
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-8 lg:p-10">
      {/* §12 outline: section h2 → pair label h3 → state h4. The label titles the
          whole exhibit — argument, before, and after alike — so it sits above
          the grid at full width rather than at the head of the first column,
          where it read as that column's heading and left the two crops looking
          unnamed. Full width also takes the wrap pressure off: at `lg` the
          argument column is only 18rem, and a 24px h3 in it broke over two
          lines. */}
      <h3 className={subsectionHeading}>{pair.label}</h3>
      {/* From `lg` the slide runs three columns across — argument, before,
          after — so it stays short and wide and the whole exhibit lands with
          its controls inside a viewport. The shape is an argument column beside
          an evidence lane, with the lane simply split in two.
          The grid is two rows: state caption, then crop. The argument column
          spans both.
          The second row is `1fr`, not `auto`: the argument column spans both
          rows and is usually the taller of the two, and against two `auto`
          tracks the browser would grow the caption row to absorb that height,
          floating the crops away from the labels that name them. With a
          flexible second track the slack falls below the crops instead, where
          it reads as margin.
          One `mt-6` under the heading, carried by this wrapper rather than by
          the prose, so all three columns start on the same line — the claim's
          first line and both state captions. A margin on the paragraph alone
          would drop the argument column below the captions beside it. */}
      <div
        className={`mt-6 lg:grid lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:gap-y-4 xl:gap-x-8 2xl:gap-x-10 ${gridColumns}`}
      >
        <div className="lg:row-span-2">
          {/* A plain wrapper, not a `<p>`: the claim ships its own paragraphs
              on `claimParagraph` so it can break where its argument breaks,
              and a paragraph nested in a paragraph is invalid markup the
              browser would silently unnest. */}
          <div>{pair.claim}</div>
          {/* The framing note, where a pair carries one, sits with the claim it
              qualifies rather than under the crops, so the evidence lane stays
              clean and the honesty about length is read as part of the
              argument. */}
          {pair.legend ? (
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {pair.legend}
            </p>
          ) : null}
        </div>
        {/* Below `lg` this wrapper is a real box that lays the pair out under
            the copy: side by side from `sm`, stacked in Before → After order
            below that, where two columns would leave each crop too narrow to
            read. At `lg` it goes `contents` and hands the two figures straight
            to the slide grid as columns two and three.
            With one state there is nothing to sit beside, so it stays a single
            column and is capped at `max-w-sm`: a lone 1080×1300 crop run to the
            full tablet width would tower over the argument that explains it. */}
        <div
          className={
            after
              ? "mt-8 flex flex-col gap-10 sm:mt-10 sm:grid sm:grid-cols-2 sm:grid-rows-[auto_auto] sm:gap-x-6 sm:gap-y-4 lg:contents"
              : "mt-8 sm:mt-10 sm:max-w-sm lg:row-span-2 lg:mt-0 lg:max-w-none"
          }
        >
          <StateFigure
            state={pair.beforeLabel ?? "Before"}
            shot={pair.before}
            paired={Boolean(after)}
          />
          {after ? <StateFigure state="After" shot={after} isAfter /> : null}
        </div>
      </div>
    </article>
  );
}

/**
 * The shipped answers to the round-2 findings, as one paged comparison per
 * slide, on the shared `ExhibitCarousel`. Paging is the only motion here; the
 * shell collapses its slide offset to an instant swap under reduced motion.
 */
export function ResolvedFindings() {
  return (
    <ExhibitCarousel
      label="Before and after the redesign"
      // "Comparison" rather than "finding", so a screen reader user hears at
      // once that this control is not the findings band above.
      noun="comparison"
      // Pulls the carousel up from ArtifactSection's shared `sectionContentGap`
      // (40/56px): the slide leads with a claim and reads as one unit with the
      // section takeaway above it, so it wants a tighter pause than a standalone
      // artifact. Net gap ~24px / 32px.
      className="-mt-4 md:-mt-6"
      items={pairs.map((pair) => ({
        id: pair.id,
        label: pair.label,
        slide: <PairBlock pair={pair} />,
        summary: (
          <>
            {pair.label}: {pair.claim} {pair.beforeLabel ?? "Before"}:{" "}
            {pair.before.alt}
            {pair.after ? <> After: {pair.after.alt}</> : null}
            {pair.legend ? <> {pair.legend}</> : null}
          </>
        ),
      }))}
    />
  );
}
