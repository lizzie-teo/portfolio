/*
 * SHOW GLYPHS — the three kind marks: Everything, Work, Writing.
 *
 * WHY A SIBLING MODULE AND NOT THREE MORE CASES IN `IndustryGlyph`. These are
 * not industries. `IndustryGlyph` switches on a slugified value that comes out
 * of the work registry and falls back to a neutral cluster for anything it does
 * not know; putting "writing" in that switch would make the registry's own
 * vocabulary and the filter rail's vocabulary the same list, which is the exact
 * merge `WorkGallery`'s header argues against ("Healthcare" and "Leadership" in
 * one list "is how a filter starts lying about what it filters").
 *
 * So: separate module, SHARED PRIMITIVES. `hair`, `point`, `Frame` and the
 * weight contract are imported rather than re-derived, because the two families
 * hang side by side in one rail and a second copy of the 8% padding rule is
 * precisely how they would drift to two optical sizes.
 *
 * ── THE THREE MARKS READ WITHOUT THEIR LABELS: STACK → WINDOW → PAGE ──────
 * All three come out of `screenshots/work-treatment`, the same retro-OS
 * illustration `DesktopProjectCard` and `desktopInk` are built from.
 *
 *   EVERYTHING  two offset window frames. A stack of windows is the whole grid
 *               and not just the projects in it, which is only true because of
 *               what the card is — `HomeWorkBand` puts articles in windows too:
 *               "a window is a window whatever is open in it".
 *   WORK        one window, with the title bar and the two discs the cards draw.
 *               More detail than the stack's front window, deliberately: the
 *               stack is many windows, this is THE window.
 *   WRITING     a sheet with a folded corner and three text rules — the
 *               reference's own document icon.
 *
 * ── WHAT IS REFUSED FROM THE REFERENCE ───────────────────────────────────
 * ITS DEPTH. The reference's folders have a back plane and its monitors are
 * drawn at an angle. Every mark on this site is flat single-weight line work,
 * and an isometric icon hanging beside `IndustryGlyph`'s hairline figures would
 * put two hands in one rail. The stack gets its depth from OCCLUSION instead —
 * see `EverythingGlyph` for why that is drawn as an open path rather than two
 * rectangles.
 *
 * ITS SPOT COLOUR. The reference accents in mint and coral. Ink only here:
 * `desktopInk` spends the project's hue entirely on the title-bar hover flood,
 * and a rail that also carried colour would spend that currency twice.
 *
 * ── THE HONEST COST, recorded because it is real ─────────────────────────
 * These three marks are VERNACULAR, NOT INFORMATION. "Everything", "Work" and
 * "Writing" are already unambiguous words, and unlike the industry marks — which
 * are the same figures the matching cards carry, so the filter points at what it
 * selects — nothing here tells a reader something the label did not. They earn
 * their place by making the rail one object with the grid, and if that ever
 * stops being worth three drawings to maintain, this module is the thing to
 * delete: `FilterTile` renders whatever mark it is handed, including none.
 */

import { DEFAULT_WEIGHT, Frame, hair, point, type Box, type GlyphProps } from "./IndustryGlyph";

/** The window corner. The reference's windows are round-cornered and its icons
 *  are not drawn with a compass, so this is small — 10 units is 2px at the 40px
 *  the rail renders at, enough to read as softened rather than as a stadium. */
const WINDOW_RX = 10;

/**
 * Everything — a stack of windows.
 *
 * THE BACK WINDOW IS AN OPEN PATH, NOT A RECTANGLE, and that is the whole
 * drawing problem in this module. Every mark here is `fill: none`, so a second
 * rect behind the first would show straight through it and the pair would read
 * as a lattice rather than a stack. The reference solves it with flat cream
 * fills that occlude — unavailable, since a glyph is one `currentColor` and has
 * no ground to paint with. So only the back window's EXPOSED contour is drawn:
 * up its right edge to the corner, along its top, down its left, and out along
 * the bottom to where the front window covers it. Occlusion without a fill.
 */
const EVERYTHING_BOX: Box = { x: 30, y: 30, size: 140 };
function EverythingGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  return (
    <Frame className={className} box={EVERYTHING_BOX}>
      <g {...hair(EVERYTHING_BOX, weight)}>
        {/* the window behind, exposed contour only */}
        <path d="M132 74 L132 46 L38 46 L38 126 L66 126" />
        {/* the window in front */}
        <rect x={66} y={74} width={96} height={80} rx={WINDOW_RX} />
        <path d="M66 96 L162 96" />
      </g>
    </Frame>
  );
}

/**
 * Work — one window: frame, title bar, two discs.
 *
 * The discs are the card's own. `DesktopProjectCard` draws the same pair at the
 * left of its title bar, so the mark for "Work" is a small copy of the object
 * the filter fills the grid with.
 */
const WORK_BOX: Box = { x: 36, y: 36, size: 128 };
function WorkGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  return (
    <Frame className={className} box={WORK_BOX}>
      <g {...hair(WORK_BOX, weight)}>
        <rect x={44} y={54} width={112} height={92} rx={WINDOW_RX} />
        <path d="M44 80 L156 80" />
      </g>
      <g fill="currentColor">
        <circle cx={62} cy={67} r={point(WORK_BOX, weight)} />
        <circle cx={82} cy={67} r={point(WORK_BOX, weight)} />
      </g>
    </Frame>
  );
}

/**
 * Writing — a sheet with a folded corner.
 *
 * THE LAST RULE IS SHORT. Three rules of equal length read as a barcode or a
 * menu; one short line is what makes a block of strokes read as prose, and it
 * is the only thing separating this mark from a list icon.
 */
const WRITING_BOX: Box = { x: 36, y: 36, size: 128 };
function WritingGlyph({ className, weight = DEFAULT_WEIGHT }: GlyphProps) {
  return (
    <Frame className={className} box={WRITING_BOX}>
      <g {...hair(WRITING_BOX, weight)}>
        {/* the sheet, corner cut */}
        <path d="M58 44 L120 44 L142 66 L142 156 L58 156 Z" />
        {/* the fold */}
        <path d="M120 44 L120 66 L142 66" />
        {/* the prose */}
        <path d="M74 92 L126 92" />
        <path d="M74 112 L126 112" />
        <path d="M74 132 L108 132" />
      </g>
    </Frame>
  );
}

/** The three values `Filter` uses for the kind axis, so the rail can hand this
 *  component its filter value directly rather than mapping to a second name. */
export type ShowKind = "all" | "work" | "writing";

/**
 * Render the mark for a kind.
 *
 * Returns an element rather than a component type, for the same reason stated on
 * `IndustryGlyph`: resolving to a component and calling it as `<Glyph />` is what
 * the react-hooks static-components rule (rightly) objects to.
 */
export function ShowGlyph({
  kind,
  className,
  weight,
}: GlyphProps & { kind: ShowKind }) {
  switch (kind) {
    case "work":
      return <WorkGlyph className={className} weight={weight} />;
    case "writing":
      return <WritingGlyph className={className} weight={weight} />;
    default:
      return <EverythingGlyph className={className} weight={weight} />;
  }
}
