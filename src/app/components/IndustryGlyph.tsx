/*
 * INDUSTRY GLYPHS — the hairline sector marks that close the ProjectCard column.
 *
 * Promoted from the "Icon" lab direction; consumed by ProjectCard.tsx. Decorative
 * (aria-hidden): the card's real name is the h2 above. Ink is `currentColor`, set
 * by the card to the project's own deepened brand ink from projectFields.ts.
 *
 * One editorial glyph PER INDUSTRY (keyed off each entry's `industry` field),
 * not per project — so two projects in the same sector would share a mark. The
 * family is held together by construction, not subject: every mark is one ink
 * tone, built from the same stroke weight, round caps and joins, at roughly
 * equal optical mass. Each figure differs so the sector reads at a glance while
 * the set still looks like one hand:
 *
 *   Fintech             a coin struck with a dollar sign (money)
 *   Healthcare          a dot-matrix cross (care + screening)
 *   Higher education    a geometric mortarboard (study)
 *
 * THERE ARE THREE NOW, NOT FOUR, and the merge is worth stating because it is
 * visible on the grid: "Financial services" and "Payments" became one Fintech
 * sector in the registry, so the two case studies filed under them would draw
 * the SAME coin. That is the rule at the top of this note working as intended —
 * a mark names a sector, not a project — but on the home band it read as a
 * repeat rather than as two pieces of work, so the CARD now overrides both:
 * `PROJECT_MARKS` in `DesktopProjectCard` swaps in a per-project lucide mark for
 * `funding-finder` and `ap-testing-portal`. The coin is still what Fintech
 * means here and is still what any third Fintech project would get; it is the
 * collision that is handled, not the rule that changed. Anywhere else that
 * draws this set (the filter rail's pixel sprites, `ShowGlyph`) is unaffected
 * and still shows one Fintech mark for both.
 *
 * Marks are abstract, not literal clip-art: the health cross is a lattice of
 * dots, the cap is a bare rhombus and tassel. They are decorative (aria-hidden);
 * the card's real name lives in the heading above.
 *
 * WEIGHT is what this pass is about. The figures are unchanged — same four
 * marks, same coordinates, same family — but the mark is no longer the card's
 * opening statement; it is a small terminal one at 32px, under the title and
 * tag. At that size the old weight (an 11-unit stroke, 20 for the bars, 18-unit
 * filled dots) rendered as 2.5px to 5px of solid ink: a heavy blot rather than a
 * mark. Everything is now LINE WORK at one hairline:
 *
 *   - strokes render at HAIRLINE_PX, dots at DOT_PX across the whole set;
 *   - the finance bars, previously fat round-capped strokes, are the same
 *     stadium shapes drawn as outlines — the figure survives, the fill does not;
 *   - the dot lattices keep their nine and five positions, drawn as fine points
 *     rather than discs.
 *
 * ONE OPTICAL WEIGHT, not one stroke number. Each mark declares its own square
 * viewBox cropped to its drawn bounds, so a shared `strokeWidth` constant would
 * render five different weights (a 76-unit box scales its ink nearly twice as
 * hard as a 146-unit one — which is exactly what the old set did, its fallback
 * dots landing at 7.6px against the payment rings' 2.4px). Stroke and dot radius
 * are therefore DERIVED from each glyph's own box, so every mark renders at the
 * same hairline. Boxes were re-cropped for this pass too: hairline geometry has
 * almost no stroke spilling past its path, so the old boxes — padded out for a
 * fat stroke's overshoot — would have left each mark floating small inside them.
 *
 * Ink is `currentColor`: the card sets the colour (each project's own deepened
 * brand ink from projectFields.ts), so a glyph never hardcodes its own tone.
 *
 * THE WEIGHT CONTRACT IS EXPORTED, and this file is its home. `Box`, `Weight`,
 * `hair()`, `point()`, `HAIRLINE_PX` and `Frame` carry the "one rendered
 * hairline at any size" rule above, and anything else that draws a VECTOR mark
 * for this site derives its stroke from them rather than restating a number.
 * `ShowGlyph` and everything under `components/marks/` are the consumers.
 *
 * THE FILTER RAIL'S SECTOR ICONS ARE NOT DRAWN FROM HERE ANY MORE. They are
 * 1-bit bitmaps in `marks/pixelMarks` (`IndustrySprite`), which has no stroke
 * and reads none of this. The CARD still draws `IndustryGlyph` below — two
 * treatments, one per surface, and that module records why.
 */

/** The size the card renders every mark at, and the default for the `sizePx`
 *  prop. Weights below are derived from it, so a mark keeps its hairline if the
 *  card ever resizes the box — which is exactly what `sizePx` is for: a caller
 *  drawing a mark much larger than 32px (WireframeProjectCard blows one up to
 *  roughly 160px as the card's hero) passes its real render size, and the stroke
 *  and dot geometry re-derive so the figure stays line work instead of scaling
 *  into a fat outline. Without it a mark at 160px would render a 5.5px stroke. */
const GLYPH_PX = 32;
/** Rendered stroke weight. Fine enough to read as drawn line rather than ink,
 *  heavy enough to hold at 1x on a light field. */
export const HAIRLINE_PX = 1.1;
/** Rendered diameter of a point. Twice the line, not equal to it: a hairline
 *  reads by its length and a point has none, so a dot matched to the stroke
 *  weight disappears into dust beside it (measured at 1.9px, where the health
 *  lattice went faint next to the rings and aliased unevenly at 1x). */
const DOT_PX = 2.4;

export type Box = { x: number; y: number; size: number };

/** How heavy the mark should render, and at what size. Defaults are the card's
 *  terminal mark; a caller drawing at another scale passes its own so the family
 *  keeps one rendered weight rather than one viewBox number. */
export type Weight = { sizePx: number; strokePx: number };
export const DEFAULT_WEIGHT: Weight = { sizePx: GLYPH_PX, strokePx: HAIRLINE_PX };

export type GlyphProps = { className?: string; weight?: Weight };

/** Shared stroke defaults, scaled to the glyph's own box so the whole family
 *  lands on one rendered hairline. */
export function hair(box: Box, weight: Weight) {
  return {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: (weight.strokePx * box.size) / weight.sizePx,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

/** Point radius in the glyph's own units, matched to the same rendered size. The
 *  dot keeps its 2.4-to-1.1 ratio against the stroke at any weight, so the
 *  reason for that ratio (a point has no length to read by, so it needs more
 *  diameter than a line needs width) survives a rescale. */
export function point(box: Box, weight: Weight) {
  return (DOT_PX * (weight.strokePx / HAIRLINE_PX) * box.size) / (2 * weight.sizePx);
}

/** Square viewBox cropped to each mark's own drawn bounds, padded ~8% so the
 *  whole family sits at one optical size in one box. */
export function Frame({
  children,
  className,
  box,
}: {
  children: React.ReactNode;
  className?: string;
  box: Box;
}) {
  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Fintech — a coin with a dollar sign struck into it.
 *
 *  ONE MARK REPLACED TWO. This slot used to hold ascending bars for "Financial
 *  services" and interlocking rings for "Payments"; the registry now files both
 *  clients under Fintech, so there is one money mark and the other two drawings
 *  are gone rather than left unreachable.
 *
 *  THE $ IS DRAWN AT THE SAME HAIRLINE AS THE RIM, in three straight strokes
 *  and no curves. A true S at this size needs two tight arcs that, doubled by
 *  the outline, close up into a blot the moment the mark is drawn small in the
 *  rail; the blocky form holds its counters all the way down. It sits on the
 *  coin's own centre so the two never look struck off-axis. */
const FINTECH_BOX: Box = { x: 30, y: 30, size: 140 };
function FintechGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  return (
    <Frame className={className} box={FINTECH_BOX}>
      <g {...hair(FINTECH_BOX, weight)}>
        <circle cx="100" cy="100" r="66" />
        {/* the stem, running proud of the strike top and bottom */}
        <path d="M100 48 L100 152" />
        {/* the strike: top bar, waist, bottom bar, and the two arms that turn
            three parallel rules into a dollar rather than an equals sign */}
        <path d="M72 74 L128 74" />
        <path d="M72 100 L128 100" />
        <path d="M72 126 L128 126" />
        <path d="M72 74 L72 100" />
        <path d="M128 100 L128 126" />
      </g>
    </Frame>
  );
}

/** Healthcare — a dot-matrix cross: care plus screening. */
const HEALTHCARE_BOX: Box = { x: 34, y: 34, size: 132 };
function HealthcareGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  const dots: [number, number][] = [
    [100, 44],
    [100, 72],
    [100, 100],
    [100, 128],
    [100, 156],
    [44, 100],
    [72, 100],
    [128, 100],
    [156, 100],
  ];
  return (
    <Frame className={className} box={HEALTHCARE_BOX}>
      <g fill="currentColor">
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={point(HEALTHCARE_BOX, weight)} />
        ))}
      </g>
    </Frame>
  );
}

/** Higher education — a geometric mortarboard: study. */
const EDUCATION_BOX: Box = { x: 32, y: 30, size: 138 };
function EducationGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  return (
    <Frame className={className} box={EDUCATION_BOX}>
      <g {...hair(EDUCATION_BOX, weight)}>
        {/* the board */}
        <path d="M40 86 L100 62 L160 86 L100 110 Z" />
        {/* tassel off the right corner */}
        <path d="M160 86 L160 128" />
      </g>
      <g fill="currentColor">
        <circle cx="100" cy="86" r={point(EDUCATION_BOX, weight)} />
        <circle cx="160" cy="134" r={point(EDUCATION_BOX, weight)} />
      </g>
    </Frame>
  );
}

/** Neutral fallback — a quiet dot cluster for any unmapped industry. */
const FALLBACK_BOX: Box = { x: 74, y: 74, size: 52 };
function FallbackGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  const dots: [number, number][] = [
    [78, 78],
    [122, 78],
    [78, 122],
    [122, 122],
    [100, 100],
  ];
  return (
    <Frame className={className} box={FALLBACK_BOX}>
      <g fill="currentColor">
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={point(FALLBACK_BOX, weight)} />
        ))}
      </g>
    </Frame>
  );
}

function slugify(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Render the mark for an industry, falling back to the neutral cluster.
 * Returns an element rather than a component type on purpose: resolving to a
 * component and calling it as `<Glyph />` is what the react-hooks
 * static-components rule (rightly) objects to.
 */
export function IndustryGlyph({
  industry,
  className,
  weight,
}: GlyphProps & { industry?: string }) {
  switch (industry ? slugify(industry) : "") {
    case "fintech":
      return <FintechGlyph className={className} weight={weight} />;
    case "healthcare":
      return <HealthcareGlyph className={className} weight={weight} />;
    case "higher-education":
      return <EducationGlyph className={className} weight={weight} />;
    default:
      return <FallbackGlyph className={className} weight={weight} />;
  }
}
