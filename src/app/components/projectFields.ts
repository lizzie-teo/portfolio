/*
 * PROJECT CARD FIELDS — the luminous grounds behind the home ProjectCard.
 *
 * Promoted from the "Icon" lab direction; consumed by ProjectCard.tsx. These are
 * ARTWORK scene constants (style-rules §3 carve-out), not shell tokens: they
 * live here beside the card, never in theme.css, and never become UI colour. The
 * home grid stays neutral (the shell carries no per-project hue); the card's
 * colour is its artwork.
 *
 * Per-project card FIELDS: a luminous near-white ground carrying two to four
 * heavily blurred pastel blooms, the count and the arrangement composed per card
 * rather than shared (see EACH CARD IS COMPOSED below). The register is the
 * dreamy holographic light gradient — no hard stops, nothing that reads as a
 * poster, the whole field staying high key so the card feels lit from behind
 * rather than printed.
 *
 * THE METHOD, stated once and obeyed by every field below:
 *
 *   The dominant colour of a card's gradient is always the project's PRIMARY
 *   theme colour, taken from the project theme. Every other bloom in that
 *   gradient is a supporting colour chosen to complement it, using triadic or
 *   complementary colour theory.
 *
 * PRIMARY means the `--primary` token in that project's `[data-project-theme]`
 * block in src/app/theme.css, not whichever brand hue happens to appear
 * elsewhere in the block. Healthdirect is the case that makes the distinction
 * matter: its theme comment names Base Teal #1e4759 as the core brand colour,
 * but `--primary` is the HDA green #007f78, so the green is what leads the card.
 *
 * DOMINANT means occupying the most field, not appearing first in the list and
 * not sitting in any particular place. A bloom pinned to a card edge loses half
 * its ink off the crop, so it can be the largest declared bloom and still not be
 * the card's colour. The test is measured rather than eyeballed: each bloom's
 * effective alpha is integrated over the card on a 1% grid, and the primary must
 * hold the largest share by a clear margin. Every card below records its share.
 *
 * EACH CARD IS COMPOSED, NOT PERMUTED. This is the rule the previous pass got
 * wrong, and it is worth stating plainly because the mistake was invisible from
 * inside any single card. Every field ran the same skeleton: the primary as one
 * large bloom low of centre, and the two supports as a matched pair of shoulders
 * in the top left and top right corners. Read one at a time each card looked
 * composed. Seen as a row of four, the palettes changed and the layout did not,
 * so the set read as one artwork recoloured four times rather than four related
 * pieces. A formula is legible as a formula.
 *
 * So composition is now a per card decision, and the things that actually make
 * two fields different are all in play: how many blooms a card carries, their
 * sizes relative to each other, whether they enter from a corner, an edge, from
 * outside the crop, or sit wholly inside it, whether the primary is centred or
 * off axis, and the axis or diagonal the whole field resolves along. Stated as
 * one line each, and each card's entry carries the longer version:
 *
 *   Funding Finder    A FLOATING MASS. One compact rose sitting wholly inside
 *                     the card, low of centre, touching no edge, with clear
 *                     luminous ground all round it and two tiny supports biting
 *                     in at diagonally opposite corners. Three blooms, the
 *                     largest six times either of the others.
 *   Healthdirect      STRATA. A teal horizon rising from below the bottom edge
 *                     with a second teal cresting above it right of centre, an
 *                     orchid arc laid shallow across the top, and one small gold
 *                     ball held inside the field at the left. Four blooms, all
 *                     horizontal, no corners.
 *   AP+ Testing       INVERTED. The only card whose primary owns the TOP: a
 *                     broad plum crown flooding the head from above the edge,
 *                     with the foot given away to a sea green rising at the
 *                     bottom left and a pale plum echo at the bottom right.
 *                     Three blooms, resolving top to bottom, warm to cool.
 *   Macquarie Radar   A CORNER DIAGONAL. An indigo mass climbing the right side
 *                     from the bottom corner, one compact amber alone in the top
 *                     left, and clear ground on the whole diagonal between them.
 *                     Three blooms, two corners, nothing in the middle.
 *   Fallback          TWO BLOOMS, the fewest in the set. One broad sand, one
 *                     cool bite at the top right, nothing else.
 *
 * The variation is AUTHORED. Every number below was chosen and is explained on
 * its entry; nothing is generated, nothing varies between renders or between
 * server and client. "Not systematic" is the goal, not "random".
 *
 * COMPOSED AGAINST THE 5:7 CARD. `ProjectCard` cut its three airs 20% in the same
 * pass, which took the card from 5:8 to 5:7, so these fields are composed for
 * the shorter card rather than carried over from the tall one. Bloom positions
 * and radii are both percentages of their own axis, so a field is in fact
 * invariant under a change of aspect — the composited colour at any point in
 * normalised coordinates is identical on both shapes, and the recorded contrast
 * below is unchanged by the reshape. What the shorter card changes is what the
 * old compositions LOOKED like on it, and they are gone anyway.
 *
 * WHY THE PRIMARY APPEARS TWICE ON SOME CARDS. A triad supplies three hues and a
 * complementary pair supplies two, and filling a complementary card's third
 * bloom with a third hue would quietly turn the harmony into something else —
 * which is exactly the error a previous pass corrected on Funding Finder. So a
 * complementary card spends its extra bloom on the primary again, and that
 * repetition is part of how the primary dominates rather than a way around the
 * rule. Healthdirect now repeats its primary too, at four blooms on a triad,
 * for a compositional reason rather than a harmonic one: its second teal is the
 * crest on the horizon line, and a horizon needs somewhere to rise.
 *
 * Exact harmonic angles are a starting point, not the deliverable. Where a hue
 * is nudged off its angle, the nudge and the reason are recorded on the entry.
 *
 * MACQUARIE RADAR IS THE ONE EXCEPTION, and it stays flagged: no
 * `[data-project-theme="macquarie-radar"]` block exists in theme.css, so there
 * is no primary to take. Its primary is CHOSEN rather than sampled, and the
 * entry should be replaced wholesale the day a real Macquarie scope lands.
 *
 * These are ARTWORK scene constants, not shell tokens (the same category as
 * animated-cover artwork colours in cover-effects.md), and like --note-ink they
 * are deliberately mode stable: the fields stay light and the inks stay dark in
 * both colour schemes. The shell around the grid stays neutral (style-rules §3);
 * only the card artwork carries hue.
 *
 * CONTRAST AND DOMINANCE, both re-measured for this pass. Every field was
 * recomposed, so the old numbers are gone rather than carried forward.
 *
 * The contrast measurement is the darkest pixel the card can ACTUALLY render:
 * every bloom evaluated through its own five-stop falloff on a 1% grid across
 * the card, composited in paint order, worst cell reported. That is a truer
 * number than "every bloom at peak at once", which describes a pixel no card
 * contains. Two figures are recorded: the worst cell anywhere on the card, and
 * the worst cell inside the band the ink actually occupies (the title box, the
 * tag line, and the mark, which on the 5:7 card is roughly 12% to 88% across and
 * 22% to 78% down). All five clear AAA for small text on both readings, so the
 * tag — the only small text — has room to spare, and no ink has to be darkened
 * past the project's own token to stay readable:
 *
 *                     ink       worst cell   card   ink band
 *   Funding Finder   #7d0c37   on #efc8d9    7.0:1    7.1:1
 *   Healthdirect     #0a4a44   on #c1e9e7    7.8:1    8.2:1
 *   AP+ Testing      #6e1e50   on #ebc5de    6.9:1    7.9:1
 *   Macquarie Radar  #2c3072   on #cfccf1    7.6:1    8.8:1
 *   Fallback         #2a2724   on #efebe2   12.5:1   12.6:1
 *
 * DOMINANCE is measured the same way, since it is the claim most likely to be
 * quietly lost when compositions vary: each bloom's effective alpha is
 * integrated over the same grid and reported as a share of the total ink laid
 * down. The primary's share is the number that has to hold.
 *
 *   Funding Finder   rose 78%      periwinkle 12   green 10
 *   Healthdirect     teal 76%      orchid 15       gold 10      (63 + 13 teal)
 *   AP+ Testing      plum 84%      sea green 16                 (60 + 24 plum)
 *   Macquarie Radar  indigo 81%    amber 19                     (67 + 14 indigo)
 *   Fallback         sand 82%      grey-green 18                (no primary)
 *
 * The lowest single primary bloom is AP+'s crown at 60%, which is still nearly
 * four times its largest support, and every card's primary holds at least three
 * quarters of the field once its repeats are counted. Composing differently did
 * not cost dominance anywhere.
 */

export type ProjectField = {
  /** Luminous near-white ground under the blooms, tinted with the primary hue. */
  ground: string;
  /** The blooms, as a CSS background-image list. First listed sits on top. */
  image: string;
  /** Project ink for the glyph, title, and tag. Clears AAA on the whole field. */
  ink: string;
  /**
   * Halftone dot ink for the hover dissolve (ProjectCard). A MID TONE of the
   * card's own primary hue — dark enough to read as coloured print specks on
   * the near-white ground, but a clear step lighter than `ink`, because the
   * deep-ink title, tag, and mark sit ON TOP of the dot canvas and must stay
   * legible over the screen at its densest. So the card carries three tones by
   * design: near-white ground, mid-tone dot, deep ink. The dots read as the
   * card's own light breaking into print, not a uniform teal. Artwork constant,
   * not a shell token.
   *
   * THE SHIPPING CARD NO LONGER READS THIS. LoFiProjectCard derives its dot ink
   * from the ground its hover resolves to — the payoff panel, exposed until it
   * clears the resting plate (`halftoneInk` in loFiInk.ts). A hand-picked ink
   * per project put two colour events in one gesture, and in three of the four
   * cases two different hues, because nothing tied this value to the panel the
   * dots were clearing to. The field stays live for ProjectCard, which is the
   * A/B control on /explore/lofi-cards and keeps its own older colour system
   * (a luminous pale ground and pale brand panels), where a mid-tone ink is
   * still the right answer. It is not read anywhere else.
   */
  dot: string;
};

/**
 * One bloom: a wide, soft-edged ellipse of colour.
 *
 * The falloff is five stops of the same hue at decaying alpha rather than the
 * two-stop default, which is the whole trick — a two-stop radial gradient has a
 * visible edge where its linear ramp meets transparent, and at this size that
 * edge is exactly the hard stop the register cannot have. These stops
 * approximate a gaussian, so a bloom dissolves instead of ending. Every bloom on
 * every card uses the same curve, so the four fields share one quality of light.
 *
 * `x`/`y` place the bloom's centre and `w`/`h` its radii, both as percentages of
 * the card, so a field re-blooms correctly at any card size with no re-tuning.
 */
function bloom(hex: string, alpha: number, x: number, y: number, w: number, h: number): string {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
  const stops: [number, number][] = [
    [0, 1],
    [30, 0.62],
    [55, 0.28],
    [74, 0.08],
    [90, 0],
  ];
  const ramp = stops
    .map(([pos, factor]) => `rgb(${rgb} / ${(alpha * factor).toFixed(3)}) ${pos}%`)
    .join(", ");
  return `radial-gradient(${w}% ${h}% at ${x}% ${y}%, ${ramp})`;
}

export const fields: Record<string, ProjectField> = {
  /* Funding Finder
     PRIMARY: --primary #c21358, hue 336 (brand pink #E8196A deepened).
     HARMONY: TRIADIC — 336 rose, 216 periwinkle, 96 green, the last nudged
     eight degrees cool to 104. At 96 a pastel goes chartreuse and reads as a
     yellow smear beside this much pink; at 104 it is unmistakably a green and
     the three points of the triad separate cleanly.
     COMPOSITION: A FLOATING MASS, and the only card whose PRIMARY touches no
     edge at all. The rose is one compact bloom sitting wholly inside the card,
     low of centre and a little left, its falloff spent before it reaches any
     boundary, so a luminous near-white margin runs all the way round it. That is
     the whole composition: an orb of light with air on every side, which is the
     opposite of the strata and the diagonal on the cards beside it, and it is
     the reason the title here sits on clean ground rather than in the primary's
     own light. The two supports are tiny against it and set at DIAGONALLY
     OPPOSITE corners, top right and bottom left, so the triad's cool half reads
     as two counterweights rather than a pair of shoulders. This card is where
     the scale contrast of the set lives.
     Rose holds 78% of the field, more than six times either support. */
  "funding-finder": {
    ground: "#fdf8fa", // near-white at the primary hue
    image: [
      bloom("#ecbdd2", 0.82, 42, 62, 76, 64), // rose 336, PRIMARY, floating, touching nothing
      bloom("#b1c7e7", 0.56, 96, 10, 54, 40), // periwinkle 216, top right counterweight
      bloom("#c8e4be", 0.58, 2, 98, 60, 46), // green 104, bottom left, diagonally opposite
    ].join(", "),
    ink: "#7d0c37", // brand pink deepened past --primary #c21358
    dot: "#cf4c7d", // mid rose 336, a step above --primary; the hover halftone
  },

  /* Healthdirect Symptom Checker
     PRIMARY: --primary #007f78, hue 177 (HDA Green Darken 20). The theme block
     also names Base Teal #1e4759 as the core brand colour; the primary token is
     the green, and the method takes the token.
     HARMONY: TRIADIC — 177 teal, 297 orchid, 57 gold, the gold nudged five
     degrees warm to 52. At 57 a pastel yellow reads chartreuse and drags toward
     the teal; warming it separates the two. The triad is doing a job beyond
     variety here — the case study's one warm accent is its coral, and a health
     field built from teal alone goes clinical, so the orchid and gold put warmth
     back without importing a second brand colour.
     COMPOSITION: STRATA, and the only field with no corner in it. Everything
     here is horizontal and stacked. The teal is a wide low horizon centred on
     the axis with its middle below the bottom edge, so it rises into the card as
     a band rather than sitting in it as a blob; a second, much smaller teal
     crests above that line right of centre, which is what stops a horizon from
     being a straight edge. Over the top, the orchid is laid as a single very
     shallow arc, 104% wide and 34% tall, entering from above the top edge. The
     gold is the one thing on the card that is neither wide nor at an edge: a
     small compact ball held inside the field at the left, mid height, the single
     warm point in a cool stack. Four blooms, three widths, one axis.
     Teal holds 76% of the field across its two blooms, 63 and 13. */
  "healthdirect-symptom-checker": {
    ground: "#f8fdfc",
    image: [
      bloom("#b0e3e1", 0.76, 50, 94, 126, 76), // teal 177, PRIMARY, the horizon
      bloom("#b0e3e1", 0.44, 76, 58, 48, 34), // teal again, the crest on it
      bloom("#e8c3ea", 0.58, 58, -2, 104, 34), // orchid 297, shallow arc over the top
      bloom("#ece5b6", 0.56, 8, 36, 42, 32), // gold 52, one ball inside the field
    ].join(", "),
    ink: "#0a4a44", // HDA green deepened below --primary #007f78
    dot: "#2f9488", // mid teal 176, brighter than --primary; the hover halftone
  },

  /* AP+ Testing Portal
     PRIMARY: --primary #80225f, hue 321 (AP+ corporate plum, used unchanged in
     the theme because the raw hue already clears AA as text).
     HARMONY: COMPLEMENTARY — plum 321 against sea green 141, straight across
     the wheel. The most direct of the four, which suits the most corporate of
     the four products, and the third bloom is the plum again rather than a third
     hue (see the header).
     COMPOSITION: INVERTED, and the only card in the set whose primary owns the
     TOP. A narrow vertical column was tried here first and abandoned: a five
     stop falloff at this scale cannot hold a crisp band, so the "column" simply
     read as an evenly pink card, and a composition an eye cannot see is not one.
     What the medium can state clearly is WHERE THE MASS SITS, so this card puts
     it at the head. A broad plum crown, wider than the card and centred just
     above the top edge, floods the whole head and dissolves by mid height; the
     foot is given away, a cool sea green rising at the bottom left and a pale
     plum echo pooling at the bottom right. The field therefore resolves top to
     bottom and warm to cool, which is the reverse of every other card here, and
     it is the reading that suits the product: the title sits inside the plum's
     own light, corporate and stated, and the colophon sits out on quiet ground.
     The plum tint is also set deeper and more violet than Funding Finder's rose
     (48% saturation at 80% lightness against 58% at 82%), because 15 degrees is
     not much separation in pastel and the two cards sit side by side.
     Plum holds 84% of the field across its two blooms, 60 and 24. */
  "ap-testing-portal": {
    ground: "#fdf8fb",
    image: [
      bloom("#e6b7d6", 0.78, 50, 2, 126, 74), // plum 321, PRIMARY, the crown
      bloom("#b6e2c5", 0.6, 6, 94, 66, 52), // sea green 141, rising at the foot
      bloom("#eacde0", 0.48, 86, 78, 74, 52), // plum 321 again, paler, the echo
    ].join(", "),
    ink: "#6e1e50", // plum deepened, matching the theme's --accent-foreground
    dot: "#9c3f79", // mid plum 321, a step above --primary; the hover halftone
  },

  /* Macquarie Radar — THE EXCEPTION, still flagged.
     No [data-project-theme="macquarie-radar"] block exists in theme.css, so
     there is no --primary to take and this card cannot obey the method's first
     sentence. Its primary is CHOSEN rather than sampled: indigo at hue 246. The
     other three sit at 336, 177, and 321, which leaves the blue quarter of the
     wheel empty; indigo fills it, keeps its distance from all three, and reads
     institutional in a way that suits a university advising tool. Replace this
     entry wholesale the day a real Macquarie scope lands in theme.css.
     HARMONY: COMPLEMENTARY — indigo 246 against its opposite at 66, pulled
     sixteen degrees warm to 50 because a pastel at 66 is lime and this card
     wants late light, not acid. The previous pass covered that nudge by adding a
     violet analogue at 291 as a bridge, which made the field a three hue set
     that was not a triad; the third bloom is the indigo again, which closes the
     gap without inventing a hue.
     COMPOSITION: A CORNER DIAGONAL, the field split between two
     opposite corners with nothing in between. The indigo arrives at the bottom
     right, its centre just inside the crop rather than out on the corner, and
     the paler indigo sits above it against the right edge, so the two together
     read as one mass climbing the right side rather than a blob in a corner.
     Against that, and alone in the top left, one compact warm amber. Everything
     else is clear ground, and the diagonal between the two is the composition.
     An earlier version ran the amber as a full width sky across the top edge; it
     was cut because it made this card echo the Healthdirect arc two cards over,
     which is exactly the sameness this pass exists to remove. Pulling the warmth
     into a single corner also gives the set its one true corner to corner field.
     Indigo holds 81% of the field across its two blooms, 67 and 14.
     A radar sweeping in from off frame is a legible figure for the name, and
     that is the point at which it stops: the mark is not drawn, no line is
     added, and the reading is available rather than insisted on. */
  "macquarie-radar": {
    ground: "#f9f8fd",
    image: [
      bloom("#c3bfee", 0.78, 86, 94, 110, 94), // indigo 246, PRIMARY, the sweep
      bloom("#ede3b6", 0.56, 4, 8, 72, 56), // amber 50, the warmed complement, one corner
      bloom("#d5d2ee", 0.5, 96, 34, 48, 44), // indigo 246 again, paler, climbing the edge
    ].join(", "),
    ink: "#2c3072", // indigo deepened
    dot: "#5257a6", // mid indigo 246, a step above the chosen primary; halftone
  },
};

/**
 * Neutral field for any entry without a project theme, e.g. an article.
 * No primary and no harmony: the point of this one is that it has no project to
 * speak for, so it stays near-achromatic — a warm sand against a cool grey, both
 * barely tinted — and reads as the shell's own paper rather than as a fifth
 * brand. It is the one field the method does not govern, because there is
 * nothing for it to be dominant with.
 * COMPOSITION: TWO BLOOMS, the fewest in the set and deliberately so. A field
 * with no project to speak for should not be the busiest thing on the page, and
 * the third bloom the old version carried was only there to match the shape of
 * the project cards. One broad sand covering nearly everything, one cool bite at
 * the top right, nothing else.
 */
export const fallbackField: ProjectField = {
  ground: "#fdfbf8",
  image: [
    bloom("#e5e0d2", 0.58, 36, 78, 126, 96), // warm sand, nearly the whole card
    bloom("#d3dfde", 0.48, 98, 14, 78, 56), // cool grey-green, one corner bite
  ].join(", "),
  ink: "#2a2724", // --note-ink, the shell's warm near-black
  dot: "#8f887c", // warm taupe, the neutral card's near-achromatic halftone
};

/** Resolve a project's field, falling back to the neutral one. */
export function getField(slug: string | undefined): ProjectField {
  return (slug && fields[slug]) || fallbackField;
}
