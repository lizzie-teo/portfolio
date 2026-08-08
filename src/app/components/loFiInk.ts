/*
 * LO-FI INK — the resting state behind LoFiProjectCard, now drawn dark.
 *
 * Not a replacement for projectFields.ts but a stage before it. The gradient
 * card rests on a luminous field of blurred pastel blooms in its project's own
 * hue; the lo-fi card rests as undeveloped line work and gets that colour back
 * only on hover. So this module owns exactly one state — the resting,
 * undeveloped one — and projectFields keeps owning the colour that arrives.
 * Both are ARTWORK scene constants (style-rules §3 carve-out): they live beside
 * the artwork, never in theme.css, and are never referenced as UI colour.
 *
 * WHY THIS SET IS DARK, having been light. The first pass drew the card as
 * near-white paper (#f2f2f1) with a #c4c4c2 hairline on the warm --secondary
 * ground (#F2F0EB). Those three values sit within a few percent of each other in
 * luminance, which is fine for four cards next to a colourful row and actively
 * tiring for a whole section of them: nothing recedes, nothing advances, every
 * card weighs the same, and the eye is given no anchor to rest on. The complaint
 * that landed was that the grid had become tiring to look at, and that is what a
 * grid with no value structure feels like from the outside.
 *
 * Inverting fixes it at the root rather than restyling around it. The same line
 * work on a dark plate stops reading as DRAINED PAPER and starts reading as
 * DRAFTING: the ink is the bright thing, the plate recedes, and the grid gets
 * depth back. It also buys the hover its strongest possible reveal, because
 * colour arriving out of darkness is a far bigger event than colour arriving out
 * of light grey — the pale brand tints (mint, pink, blue-grey) now detonate.
 *
 * THE VALUES TRACK THE SHELL'S OWN DARK PAIR rather than being freely chosen.
 * `plate` is --leaf's ink (#2A2724) and the section behind it runs on --grout,
 * which theme.css defines as "one step deeper than the leaf so leaf tiles still
 * read as tiles on it". That is exactly the plane-and-tile relationship this
 * grid needs, already derived and already measured, so the card borrows the
 * relationship rather than inventing a second dark system that would drift from
 * it. They stay artwork constants rather than token references because the card
 * is artwork; if the leaf ever moves, this is a deliberate re-derivation, not an
 * automatic one.
 *
 * THE VALUES ARE WARM NEUTRALS, matching the shell's warmth. A cold grey card on
 * a warm dark ground reads as a foreign object rather than as the same paper
 * turned over.
 *
 * CONTRAST. Ink #f1ece5 on plate #2a2724 is 12.5:1, which clears AAA — needed,
 * because the foot block and the industry tag are both small text (style-rules
 * §4) and the card cannot lean on each project's own brand ink to carry them.
 * The one deliberately weak value is `draw`, and that is a decorative mark with
 * no contrast floor.
 */

export const loFiInk = {
  /** The card plate. --leaf's ink; the section runs on the deeper --grout. */
  paper: "#2a2724",
  /** The card's own edge, and the rule above the foot block. Light enough to
      draw a visible boundary on the plate, dark enough not to compete with the
      ink it frames. */
  rule: "#4a443d",
  /** The industry mark at rest. A step brighter than `rule` so a hairline figure
      holds against a 30px title, and well short of `ink` so it stays a drawn
      mark rather than a second heading. Decorative — no contrast floor. */
  draw: "#8a8278",
  /** Title, tag, and foot block at rest. --grout-foreground; 12.5:1 on plate. */
  ink: "#f1ece5",
  /** Supporting text on the dark plane: decks, dates, filter labels at rest.
      A quieter warm tone that still clears the 7:1 bar small text is held to —
      9.4:1 on the grout ground, so "quiet" here means a step down in presence,
      never a step down toward the AA floor (style-rules §4). */
  quiet: "#c9c2b8",
} as const;

/*
 * THE HALFTONE INK IS THE HOVERED GROUND, EXPOSED. This is a rule, not a value:
 * LoFiProjectCard's dot screen is never given a colour, it derives one from the
 * surface the card is developing INTO — the client's payoff panel, or the
 * writing paper on an article.
 *
 * WHY. The hover used to run two colour events on top of each other: the
 * halftone formed in a mid-tone brand ink from `projectFields.ts` and then
 * cleared to a payoff panel that was a different colour, in three of four cases
 * a different HUE (a rose halftone clearing to a plum plate, a plum halftone to
 * an indigo plate, an indigo halftone to a slate plate). Read as motion that is
 * one colour arriving and then being replaced by another, which is a swap
 * dressed up as a development. Derived, the gesture states one thing: the card
 * turns the colour it is about to become, and the flying dots resolve into the
 * plate they were already made of.
 *
 * WHY IT IS NOT LITERALLY THE SAME HEX. The card rests on `paper` at #2a2724 and
 * every payoff panel is a near-black of its own — the four sit between 1.02:1
 * and 1.14:1 against the plate. Drawn at their own value the dots would be
 * invisible, and the hover would read as nothing happening followed by a panel
 * appearing. So the panel colour is EXPOSED: multiplied in linear light until it
 * clears INK_CONTRAST against the resting plate, and never beyond the point
 * where a channel would clip. Because nothing clips, the scale is a pure
 * exposure change — hue and saturation come through mathematically untouched, so
 * this is the same colour, turned up, in exactly the way a photographic print is
 * the same negative at a different exposure. A panel already light enough (the
 * article's #e8e2d4 warm paper) is left exactly as it is.
 *
 * The plate stays much darker than its own ink, which is what keeps the arrival
 * legible: the field clearing to the sealed panel is still a plain change of
 * value, so the payoff ramps did not have to move for this.
 *
 * INK_CONTRAST 3.8 is a legibility figure for artwork, not a text floor — the
 * dots are decorative and carry no information (style-rules §7). It is set at
 * the top of the range the hand-picked inks happened to span (4.04, 3.52, 2.40,
 * 2.31 against the plate) so no card comes out quieter than it was. AP+ lands
 * at 3.03 rather than 3.80 because its indigo hits the sRGB gamut wall first,
 * and clipping to reach the number would bend the hue away from the plate,
 * which is the one thing this rule exists to hold.
 */
const INK_CONTRAST = 3.8;

const toLinear = (channel: number) => {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const toSrgb = (linear: number) => {
  const v =
    linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
};

const parseHex = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const relativeLuminance = (linear: number[]) =>
  0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];

const inkCache = new Map<string, string>();

/**
 * The dot ink for a card whose hover resolves to `ground`: that same colour,
 * exposed until it reads on the resting plate. See the note above for the rule
 * and why it is a derivation rather than a per-project value.
 *
 * Cached because the set of grounds is the registry's, so this resolves four or
 * five times for the life of the page.
 */
export function halftoneInk(ground: string): string {
  const cached = inkCache.get(ground);
  if (cached) return cached;

  const linear = parseHex(ground).map(toLinear);
  const plate = relativeLuminance(parseHex(loFiInk.paper).map(toLinear));
  const target = INK_CONTRAST * (plate + 0.05) - 0.05;

  /* Never darken a ground that already reads, and never push a channel past the
     gamut — a clipped channel is a hue shift, and the hue is the whole point. */
  const headroom = 1 / Math.max(...linear, 1e-6);
  const exposure = Math.min(
    headroom,
    Math.max(1, target / Math.max(relativeLuminance(linear), 1e-6)),
  );

  const ink = `#${linear
    .map((c) => toSrgb(c * exposure).toString(16).padStart(2, "0"))
    .join("")}`;
  inkCache.set(ground, ink);
  return ink;
}

/*
 * THE WRITING PAYOFF — what an article card develops into, where a case study
 * develops into its client's brand panel and mark.
 *
 * It is deliberately the ONLY payoff in the set with no brand in it, because
 * that is the true difference between the two kinds of card. A case study's
 * colour is borrowed: it belongs to healthdirect or AP+, and withholding it
 * until hover is what makes the reveal mean something. An article has nothing
 * borrowed to reveal, so inventing a hue for it would be claiming an identity
 * the piece does not have — a Substack post is not a fifth brand.
 *
 * So the panel is warm paper rather than colour, taken from the neutral
 * `fallbackField` the gradient card already uses for entries with no project
 * theme (its sand bloom #e5e0d2, deepened here so a flat panel carries the same
 * weight a bloom does spread across a field). Against four coloured panels it
 * reads as the one card that is about words rather than a client, which is
 * exactly what it is.
 *
 * CONTRAST: ink #2a2724 on panel #e8e2d4 is 11.5:1. The deck is small text and
 * held to the 7:1 floor (style-rules §4), with room to spare. The halftone that
 * forms before the panel needs no entry here either, and now for a better
 * reason than it used to: `halftoneInk` derives it from this panel, and since
 * warm paper already clears the resting plate by 11.5:1 the dots are literally
 * #e8e2d4. The article card is the one place where the rule's "same colour as
 * the hovered ground" is true to the hex.
 *
 * Artwork scene constants, same category and same rules as `loFiInk` above.
 */
export const loFiWriting = {
  /** The flat panel the deck lands on. */
  panel: "#e8e2d4",
  /** The deck's ink. The shell's warm near-black; 11.5:1 on the panel. */
  ink: "#2a2724",
} as const;
