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
 *   Financial services  ascending rounded bars (value, growth, markets)
 *   Healthcare          a dot-matrix cross (care + screening)
 *   Payments            two interlocking rings (value moving between parties)
 *   Higher education    a geometric mortarboard (study)
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
 */

/** The size the card renders every mark at. Weights below are derived from it,
 *  so a mark keeps its hairline if the card ever resizes the box. */
const GLYPH_PX = 32;
/** Rendered stroke weight. Fine enough to read as drawn line rather than ink,
 *  heavy enough to hold at 1x on a light field. */
const HAIRLINE_PX = 1.1;
/** Rendered diameter of a point. Twice the line, not equal to it: a hairline
 *  reads by its length and a point has none, so a dot matched to the stroke
 *  weight disappears into dust beside it (measured at 1.9px, where the health
 *  lattice went faint next to the rings and aliased unevenly at 1x). */
const DOT_PX = 2.4;

type Box = { x: number; y: number; size: number };
type GlyphProps = { className?: string };

/** Shared stroke defaults, scaled to the glyph's own box so the whole family
 *  lands on one rendered hairline. */
function hair(box: Box) {
  return {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: (HAIRLINE_PX * box.size) / GLYPH_PX,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

/** Point radius in the glyph's own units, matched to the same rendered size. */
function point(box: Box) {
  return (DOT_PX * box.size) / (2 * GLYPH_PX);
}

/** Square viewBox cropped to each mark's own drawn bounds, padded ~8% so the
 *  whole family sits at one optical size in one box. */
function Frame({
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

/** Financial services — ascending rounded bars: value, growth, markets.
 *  The same three stadiums the fat strokes drew (centres 58/100/142, feet on
 *  the 160 baseline, heads at 112/84/50), now outlined instead of filled. An
 *  outline doubles every contour, so at the drawing's original 20-unit width
 *  this mark carried visibly more ink than the single-contour rings and cap
 *  beside it; narrowing the bars to 16 buys back the difference and leaves each
 *  one clearly a bar rather than a ring. */
const FINANCIAL_BOX: Box = { x: 40, y: 45, size: 120 };
function FinancialGlyph({ className }: GlyphProps) {
  const bars: [number, number][] = [
    [50, 112],
    [92, 84],
    [134, 50],
  ];
  return (
    <Frame className={className} box={FINANCIAL_BOX}>
      <g {...hair(FINANCIAL_BOX)}>
        {bars.map(([x, y]) => (
          <rect key={x} x={x} y={y} width={16} height={160 - y} rx={8} />
        ))}
      </g>
    </Frame>
  );
}

/** Healthcare — a dot-matrix cross: care plus screening. */
const HEALTHCARE_BOX: Box = { x: 34, y: 34, size: 132 };
function HealthcareGlyph({ className }: GlyphProps) {
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
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={point(HEALTHCARE_BOX)} />
        ))}
      </g>
    </Frame>
  );
}

/** Payments — two interlocking rings: value moving between parties. */
const PAYMENTS_BOX: Box = { x: 30, y: 30, size: 140 };
function PaymentsGlyph({ className }: GlyphProps) {
  return (
    <Frame className={className} box={PAYMENTS_BOX}>
      <g {...hair(PAYMENTS_BOX)}>
        <circle cx="76" cy="100" r="38" />
        <circle cx="124" cy="100" r="38" />
      </g>
    </Frame>
  );
}

/** Higher education — a geometric mortarboard: study. */
const EDUCATION_BOX: Box = { x: 32, y: 30, size: 138 };
function EducationGlyph({ className }: GlyphProps) {
  return (
    <Frame className={className} box={EDUCATION_BOX}>
      <g {...hair(EDUCATION_BOX)}>
        {/* the board */}
        <path d="M40 86 L100 62 L160 86 L100 110 Z" />
        {/* tassel off the right corner */}
        <path d="M160 86 L160 128" />
      </g>
      <g fill="currentColor">
        <circle cx="100" cy="86" r={point(EDUCATION_BOX)} />
        <circle cx="160" cy="134" r={point(EDUCATION_BOX)} />
      </g>
    </Frame>
  );
}

/** Neutral fallback — a quiet dot cluster for any unmapped industry. */
const FALLBACK_BOX: Box = { x: 74, y: 74, size: 52 };
function FallbackGlyph({ className }: GlyphProps) {
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
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={point(FALLBACK_BOX)} />
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
export function IndustryGlyph({ industry, className }: GlyphProps & { industry?: string }) {
  switch (industry ? slugify(industry) : "") {
    case "financial-services":
      return <FinancialGlyph className={className} />;
    case "healthcare":
      return <HealthcareGlyph className={className} />;
    case "payments":
      return <PaymentsGlyph className={className} />;
    case "higher-education":
      return <EducationGlyph className={className} />;
    default:
      return <FallbackGlyph className={className} />;
  }
}
