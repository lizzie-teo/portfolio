/*
 * PROJECT PAYOFFS — the dark stat panel and reversed mark each case-study card
 * resolves to.
 *
 * Lifted out of LoFiProjectCard once a second component needed them: the card
 * reveals a payoff on hover, and the gallery's feature item shows the same panel
 * at rest. Two copies of a brand colour is exactly how a portfolio ends up
 * shipping a client's logo on the wrong background, so there is one table.
 *
 * ARTWORK scene constants (style-rules §3 carve-out): they live beside the
 * artwork, never in theme.css, and are never referenced as UI colour. Widths are
 * optical rather than measured — the marks run from a 4:1 wordmark to a 2.4:1
 * three-line lockup, and matching their BOX widths would leave the chunky ones
 * looking twice the weight of the wide ones, so each records the ratio it was
 * balanced against.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PANELS WERE PALE BRAND TINTS AND ARE NOW DARK GROUNDS, and that is the
 * consequential change in this file. The old panels (mint, pale pink, pale
 * blue-grey, one indigo) existed to do one job: flood colour into a card that
 * had withheld it. They did that job and then had nothing to say — a pale plate
 * carrying a logo is a brand slide, and the strongest fact the registry holds
 * about each project, its measured OUTCOME, was left down in the resting card's
 * foot block at annotation size.
 *
 * So the panel now carries the result: the client's mark reversed at the head,
 * and a counting figure with its supporting line at the foot. A stat wants a dark
 * ground for the same reason a scoreboard does — white type at display size on
 * near-black is the loudest a small card can be, and the pale tints could not
 * carry a figure without the figure having to be dark, quiet, and second to the
 * panel colour. The colour moment did not go away; it moved. The halftone that
 * forms and scatters IS the project's colour arriving, and the panel is now the
 * settle it lands on rather than the reveal itself — an argument this table
 * already made for AP+ alone, now true of all four.
 *
 * HOW EACH GROUND WAS CHOSEN. One rule, applied four times: take the darkest
 * surface that project's OWN material already defines, so no ground is invented
 * here and each card reads as its project rather than as a free composition.
 * The four land on distinct hues (teal, plum, indigo, slate) which is what keeps
 * them apart from each other; they are near enough in VALUE to the --grout plane
 * the gallery sits on that hue, the card's hairline, and its shadow are what
 * separate plate from plane. That is not a new risk — the resting plate is only
 * 1.20:1 on the grout and reads as a tile — so the panels were kept at their
 * source values rather than lifted for separation they do not need.
 *
 * WHY NOT ONE SHARED DARK for all four: the reversed mark is the only brand
 * signal left on a dark panel, and three of the four marks are wordmarks that
 * knock out to plain white. On one shared ground the four payoffs would be
 * indistinguishable until you read the logo. The hue is doing the identifying.
 *
 * THE MARKS ARE KNOCKED OUT with `brightness(0) invert(1)`, which flattens any
 * source art (multi-fill SVG, already-reversed lockup, raster with alpha) to one
 * white silhouette. Each was rendered on its own ground and checked before being
 * accepted; `markFilter` exists because one of them failed that check. See
 * Macquarie below.
 *
 * CONSEQUENCE FOR FeatureItem, which shows these panels AT REST in the gallery's
 * one-result view: its panel goes dark with them and its mark takes the same
 * knockout. The feature keeps its stated purpose — it declares the brand rather
 * than teasing it — but now declares it reversed, which is how a client mark is
 * stated on a dark editorial plane anyway. It does NOT gain the counting figure:
 * the feature already prints value and label in its own foot block at reading
 * size, and a stat cannot be the arrival twice on one tile.
 */

/** The default reversal: any source art flattened to one white silhouette. */
const MARK_KNOCKOUT = "brightness(0) invert(1)";

export type Payoff = {
  panel: string;
  logo: string;
  width: number;
  height: number;
  alt: string;
  /** Optical width of the mark on the card, in `cqw` of the payoff layer. */
  markCqw: number;
  /**
   * Transparent padding baked into the TOP of the artwork, as a fraction of its
   * own WIDTH — measured off the alpha bounding box, not estimated. One
   * denominator for both axes so the numbers stay comparable across a 4:1
   * wordmark and a 1:1 square.
   */
  markPadTop: number;
  /** The same measurement at the BOTTOM. */
  markPadBottom: number;
  /** Reversal filter. Defaults to the flat white knockout. */
  markFilter: string;
};

/*
 * THE INK ON THE PANELS. One pair across all four grounds rather than a tuned
 * pair per ground: four near-whites that differ by a percent would read as a
 * bug, and one pair can be measured against the WORST ground and cleared
 * everywhere. Ratios below are the worst case (Macquarie slate #26323b, the
 * lightest of the four); every other ground is higher.
 */
export const payoffInk = {
  /** The outcome figure. Display size, so far past any floor — 13.1:1 worst. */
  figure: "#ffffff",
  /** The supporting line under it. Small text, held to 7:1 (style-rules §4):
      8.7:1 on the slate, 10.1:1 on the teal, 10.9:1 on the plum, 11.2:1 on the
      indigo. Warm rather than neutral, matching the shell's warmth and the
      resting card's own ink family. */
  label: "#d8d2c8",
} as const;

/*
 * MARK WIDTHS ARE SET IN `cqw` against the payoff layer's own container, not in
 * fixed `w-*` steps. The card's width does not track viewport breakpoints at
 * all — the gallery goes to two columns at `sm`, which makes a card NARROWER at
 * 640px than at 639px, and back down to a narrow card again when it goes to
 * three at `xl`. A `w-40 sm:w-44` pair steps the mark UP at exactly the width
 * where the card shrinks. Container units track the thing the mark actually sits
 * in, which is the established treatment for type and artwork inside a cover
 * (`cover-effects.md`, and every cover component).
 *
 * THEY ARE A NUMBER RATHER THAN A CLASS because the trim below is derived from
 * them, and a width buried in a Tailwind string cannot be multiplied.
 *
 * SIZED BACK UP AFTER A FIRST PASS CUT THEM BY A QUARTER. The argument for
 * shrinking them was sound — the mark stopped being the payoff and became the
 * signature under a result — but a quarter was too far and the marks stopped
 * reading as the client's at a glance, which is the one job they still have.
 * They now sit at essentially the width they had as the payoff, and the
 * hierarchy is carried by POSITION and by the figure's own scale instead: the
 * figure runs to 30cqw of a card, roughly two thirds of the width, so a 38cqw
 * wordmark two thirds of the way down the panel is unmistakably second without
 * having to be small. The optical parity between the four is unchanged and was
 * scaled as a set, never re-tuned individually.
 *
 * SIZED AS A SET, ALWAYS. The four widths are one balanced set (38 / 38 / 34 /
 * 48 as originally struck) and the parity between them is the whole point, so
 * they are scaled together or not at all — the values below are that set at
 * ×1.5. Nudging one of them individually is how a portfolio ends up with three
 * marks that look like a system and a fourth that looks like a mistake.
 *
 * ×1.5 IS THE CEILING, AND THE GUTTERS SET IT, not taste. The binding case is
 * Macquarie — the widest box in the set — on the narrowest card the grid
 * produces, which is the `xl` three-column one at around 250px. Inside the
 * card's `px-6` that leaves about 201px of content, and 72cqw of it comes to
 * 180px: roughly 10px of gutter either side of the box and 18px either side of
 * the ink, since this mark's art carries 4% of its own width as side padding.
 * At ×1.6 the same box measures 192px in a 201px hole and reads as touching the
 * edge; at ×1.7 it does not fit at all. So the set stops here.
 *
 * The other candidate ceiling did not bind. The result at the foot of the panel
 * is set at the project title's size, and at ×1.5 the widest mark's ink runs
 * about 1.9 times the width of a figure like "84%" — big enough to lead the
 * panel, not big enough to turn the figure into a caption under a logo. If the
 * card were ever to grow a narrower gutter, that ratio is the second thing to
 * check.
 *
 * HIERARCHY IS POSITION NOW, NOT SCALE. The figure used to run to nearly two
 * thirds of the card's width as fitted display type, so a mark could be sized
 * generously and still read as second. The figure is now set at the PROJECT
 * TITLE's size — the same `text-3xl sm:text-4xl` step the resting card's h2
 * takes — and the mark has moved to the head of the panel with the result
 * beneath it. So the two are close in weight by design: the panel states whose
 * work it was, then what it did. That is the order a case study argues in.
 *
 * THE TRIM IS WHAT MAKES THE FOUR MARKS SHARE A LINE, and it is measured on both
 * edges. Padding alone only equalises the CANVAS edge, and one of these canvases
 * is nothing like the others: mq.webp is a 550×550 square holding a 505×152
 * horizontal lockup, so 36.2% of its width is empty above the ink and 36.2%
 * again below — measured, not assumed symmetric. Placed identically to the SVGs
 * it would float half a mark clear of the line the other three sit on.
 *
 * Subtracting BOTH makes the element's outer box the INK's box, so whichever
 * edge the card anchors is an ink edge. The card hangs its mark from the top of
 * the panel and measures the head air to that edge, which is only an honest
 * measurement because of the trim.
 */
export const PAYOFFS: Record<string, Payoff> = {
  /* GROUND: #0e2932, the FIELD of SymptomCheckerCover — the deep teal the real
     case-study cover is drawn on, so the card's payoff and the page it opens
     share one plane. Deeper and greener than HDA's own leaf #183947, which is
     the point: the cover is what a reader meets next.
     Was --accent #ccecea (HDA Green Lighten 80). White 15.2:1.
     Width-bounded at the widest ratio (4:1); the baseline the others match. */
  "healthdirect-symptom-checker": {
    panel: "#0e2932",
    logo: "/assets/logos-clients/logo-hda.svg",
    width: 444,
    height: 109,
    alt: "healthdirect logo",
    markCqw: 57, // 38 × 1.5
    markPadTop: 0,
    markPadBottom: 0, // alpha bbox fills the viewBox exactly
    markFilter: MARK_KNOCKOUT,
  },
  /* GROUND: #361134, the darkest fill in the brand's own SVG — the plum the
     Funding Finder wordmark is set in. Reversing the mark takes that plum out of
     the logo, so putting it under the logo keeps it in the card. It is the one
     ground with red in it, which is what separates it from the indigo.
     Was --accent #fbe9f0 (pale pink). White 16.3:1.
     Its 3.2:1 wordmark is close enough to HDA's line to carry the same width. */
  "funding-finder": {
    panel: "#361134",
    logo: "/assets/logos-clients/funding-finder.svg",
    width: 160,
    height: 50,
    alt: "Funding Finder logo",
    markCqw: 57, // 38 × 1.5
    markPadTop: 0,
    markPadBottom: 0.002, // 0.2% of width; effectively tight
    markFilter: MARK_KNOCKOUT,
  },
  /* GROUND: #1d124e (AP+ surfaceLow indigo), unchanged — the one panel that was
     already dark, and the reason the others could follow it. It was chosen over
     the brand's #0d033c midnight because near-black arriving over warm
     near-black is no event; that argument holds under the new treatment too, and
     a figure needs a ground with enough life in it to sit on. White 16.8:1.
     Filename carries spaces, referenced URL-encoded. The mark is ALREADY a
     reversed lockup (white wordmark plus a lilac device), so the knockout only
     flattens the lilac to white — verified as no loss. Chunkiest mark at 2.4:1
     over three lines, so it takes the narrowest width to hold optical parity. */
  "ap-testing-portal": {
    panel: "#1d124e",
    logo: "/assets/logos-clients/AP%20plus%20logo%201_sm.svg",
    width: 242,
    height: 102,
    alt: "AP+ Testing Portal logo",
    markCqw: 51, // 34 × 1.5
    markPadTop: 0.001, // 0.1%; the cap clearance above "Australian"
    markPadBottom: 0.009, // 0.9% of width, the descender clearance in "Payments"
    markFilter: MARK_KNOCKOUT,
  },
  /* GROUND: #26323b, the --leaf of the macquarie-radar project scope ("slate
     deepened", already derived from the raw MQ slate blue #415364 and already
     measured at white 13.1:1). The scope's own dark band is the honest source
     here — MQ's other brand hue is a purple that would collide with Funding
     Finder's plum. It is the lightest and coolest of the four grounds, which is
     also what keeps it apart from the teal.
     Was --accent #eaebed (pale blue-grey).

     THE ONE MARK THAT DOES NOT KNOCK OUT CLEANLY, and the reason `markFilter`
     is a field. Macquarie's lockup is a crest plus a wordmark, and the crest is
     a red shield containing a white lighthouse and a white star. Under the flat
     knockout the shield, the lighthouse, and the star all become the same white
     and the crest collapses to a featureless shield silhouette — the wordmark
     still identifies the client, but the mark loses its drawing. `grayscale(1)
     invert(1)` was chosen instead: it reverses LIGHTNESS while keeping the
     internal value structure, so the shield reads as a light plate with the
     lighthouse still drawn inside it, and the wordmark still reverses to white.
     The cost is that this one mark is silver where the other three are pure
     white. That is a smaller loss than a blank shield, and it is a stopgap: the
     real fix is Macquarie's official mono/reversed lockup, which the brand
     publishes and this repository does not have.

     The one raster mark: a square canvas holding a horizontal lockup with heavy
     transparent padding, so it takes a wider class than the SVGs to land at the
     same optical weight. */
  "macquarie-radar": {
    panel: "#26323b",
    logo: "/assets/logos-clients/mq.webp",
    width: 550,
    height: 550,
    alt: "Macquarie University logo",
    markCqw: 72, // 48 × 1.5
    markPadTop: 0.362, // 199px of a 550px canvas; the whole reason trim exists
    markPadBottom: 0.362, // and 199px again below it — measured, not assumed
    markFilter: "grayscale(1) invert(1)",
  },
};
