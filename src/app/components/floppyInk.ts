/*
 * FLOPPY INK — the geometry and the line values of the home grid's disks.
 *
 * ARTWORK SCENE CONSTANTS, not tokens (style-rules §3, "Artwork scene
 * constants"). Every value here composes a picture of a 3.5" disk. None of it
 * is ever referenced as UI colour and none of it belongs in theme.css.
 *
 * ── THE GRID DRAWS THE DISK; THE HERO MOULDS IT ──────────────────────────
 * `HomeFlight` → `src/app/world/WorldGlassCard.tsx` draws one floppy as a
 * tonally-modelled OBJECT: opaque plates, stepped greys, a sub-pixel bevel
 * standing in for every outline. It assembles on load, opens its shutter, and
 * slides up into a slot as the reader scrolls toward the work section.
 *
 * The grid below it is deliberately the OTHER drawing of the same thing: a
 * clean technical outline, the way a disk appears in a catalogue or an index
 * rather than in a photograph. One object, rendered twice, and the contrast is
 * the point — the hero is the thing itself, the grid is the record of it. Three
 * successive passes tried to make the grid a smaller copy of the hero (plates,
 * then plates in colour, then plates in grey) and every one of them read as a
 * miniature of an object rather than as an index of work.
 *
 * IT IS NOT A SKETCH. This repo tried hand-drawn line work on the case-study
 * rail and killed it after crit. Nothing here is rough, wobbly, or pencilled:
 * one weight, geometric arcs, consistent joins, hidden lines removed. Drafting,
 * not doodling.
 *
 * ── AND THE GROUND IT LIES ON IS LIGHT ───────────────────────────────────
 * The work band was `--grout` (a near-black plane) and is now `--secondary`
 * (#F2F0EB), so every ratio below is measured against warm light paper.
 */

/* ── GEOMETRY ─────────────────────────────────────────────────────────────
   A 188 × 200 viewBox: 0.94, the real proportion of a 3.5" disk (90 × 94mm).
   Keep the ratio or the drawing letterboxes inside its own box.

   FOUR LINES, DOWN FROM EIGHT PLATES. The insertion arrow, the write-protect
   window, the recess step and the whole bevel construction are gone. What is
   left is the minimum set that still says "3.5 inch disk": the chamfered body,
   the shutter, the window it uncovers, and the sticker.

   THE SPACING IS OUTLINE SPACING, not plate spacing. Stroked forms need real
   air between them or two lines a few units apart read as one thick line, so
   the shutter sits 9 units below the body's top edge (it used to sit 4) and the
   open shutter clears the window by 8 (it used to clear it by 3). */
export const DISK_VIEW = { w: 188, h: 200 } as const;

const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}` +
  `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
  `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

export const DISK = {
  /* The shell, with its 22 × 22 chamfer at the top right — a true 45°, because
     the box is 0.94 and 22/188 of the width is the same physical length as
     22/200 of the height. The chamfer is the whole silhouette: without it the
     object reads as a card with two rectangles on it. */
  body: "M8 3H163L185 25V192A5 5 0 0 1 180 197H8A5 5 0 0 1 3 192V8A5 5 0 0 1 8 3Z",
  /* The shutter, and the window it covers. In outline these two are ONE
     rectangle at rest and TWO once the shutter has run open, which is the whole
     mechanism stated in line: 36 → 120 open, 68 → 152 closed, against a window
     at 128 → 150 that the closed shutter clears by 2 units on the right and 5
     top and bottom. Both stay well inside the chamfer, whose diagonal has only
     reached x172 by the time it drops to the shutter's own y12. */
  shutter: roundRect(36, 12, 84, 50, 2),
  window: roundRect(128, 17, 22, 40, 2),
  /* The sticker, centred on the shell (x3 → x185 puts its centre at x94, so a
     143-wide plate starts at x22.5). The vertical is deliberately NOT
     symmetrical — the shutter owns the top of the object, so the paper runs y80
     to y184 against a shell ending at y197. */
  sticker: roundRect(22.5, 80, 143, 104, 3),
} as const;

/* THE SHUTTER'S TRAVEL. The number is WINDOW's clearance: the closed shutter's
   right edge lands at 152, two units past the window's own 150, so nothing of
   the window survives at either sub-pixel edge. Re-derive it if either moves. */
export const SLIDE = 32;

/* ── THE LINE ─────────────────────────────────────────────────────────────
 * ONE WEIGHT, AT EVERY SIZE. `vector-effect="non-scaling-stroke"` resolves the
 * width in CSS pixels after the viewBox transform, so the 251px card the
 * three-column grid produces at 1280 and the 443px card a wide viewport
 * produces draw exactly the same line. Without it the same declaration would
 * render 1.7px on one and 2.9px on the other, and a shelf of disks drawn at two
 * different weights reads as two different drawings.
 *
 * 1.25px is a drafting line: heavy enough to hold on a warm ground at a phone
 * width, light enough that a 22-unit window does not fill with its own stroke.
 * Round joins and caps throughout, so the chamfer and the four corner arcs
 * belong to one hand.
 *
 * THE LINE IS GREY, AND STAYS GREY. Not a black technical pen at either end of
 * the develop: the type is what carries the information here, so the drawing is
 * never allowed to outweigh it. The develop moves the line ONE STEP, from a
 * quiet draft grey to the deep warm grey the tagline is already set in — while
 * the tagline itself moves up past it to full ink. Two values crossing, and the
 * hierarchy holds in both states: title darkest, tagline next, drawing behind.
 *
 * CONTRAST, on the `--secondary` band (#F2F0EB):
 *   rest  #7D7A76 .... 3.75:1   clears the 3:1 bar WCAG 1.4.11 sets for a
 *                               graphical object, deliberately and not by
 *                               luck: the silhouette IS the card's shape, and
 *                               a line that vanishes takes the card with it.
 *   dev   #4A4743 .... 8.11:1   2.16:1 against `rest`, which is a plain,
 *                               obvious darkening rather than a nuance.
 *
 * Both are INK (#2A2724) mixed into the band in oklab — the same mixing space
 * `--rule` uses in theme.css, because an sRGB mix of two warm neutrals walks
 * the middle toward a colder grey that reads as pencil. */
export const STROKE_WIDTH = 1.25;

export const LINE = {
  /** The undeveloped drawing. INK 55% into the band; 3.75:1 on it. */
  rest: "#7d7a76",
  /** The developed drawing. INK 80%; 8.11:1, and the same value `LABEL_INK.
      quiet` sets the resting tagline in. Deliberately NOT ink-black. */
  dev: "#4a4743",
} as const;

/* ── THE TWO FILLS, AND WHY AN OUTLINE DRAWING HAS ANY ────────────────────
 * `PLATE` is not meant to be seen. It is the band's own colour, painted into
 * the body and the shutter so the drawing removes its own hidden lines: a
 * technical illustration shows the shutter in front of the window, not through
 * it, and that occlusion is what turns the shutter's travel into a mechanism
 * rather than two rectangles drifting past each other. It is the one value here
 * COUPLED TO THE SHELL — if the work band ever leaves `--secondary`, this moves
 * with it or the disk grows a visible plate.
 *
 * `STICKER` is meant to be seen, and only on hover. Pure white against the
 * band's warm off-white is 1.14:1, which is exactly the relationship `--card`
 * already has with `--secondary` everywhere else on this site ("pure white pops
 * slightly off the bg", style-rules §3) — a whisper, plus its own outline, and
 * it reads as a fresh label being pressed on rather than as a panel appearing.
 * It also lifts the title from 13.04:1 to 14.85:1 on the way past.
 */
export const PLATE = "#f2f0eb";
export const STICKER = "#ffffff";

/* The sticker plate, in percentages of the same box, so the HTML type layer and
   the SVG stay registered at every size. Each figure carries the viewBox
   coordinate it comes from; change one and change the other. */
export const LABEL_BOX = {
  inset: "11.968%", // viewBox x22.5 → x165.5, equal both sides (the plate is centred)
  top: "40%", // viewBox y80
  height: "52%", // …to y184
} as const;

/* ── THE TYPE ON THE STICKER ──────────────────────────────────────────────
 * MEASURED AGAINST THE BAND, not against the developed sticker, because the
 * sticker has no fill until a pointer arrives and nothing on this label may be
 * legible only once something has run (style-rules §7, "motion is not
 * information"). All of it is small text and is therefore held to the 7:1 AAA
 * bar, not the 4.5:1 AA floor (style-rules §4).
 *
 *   ink   #2A2724 on #F2F0EB ... 13.04:1   the title, at rest and developed
 *   quiet #4A4743 on #F2F0EB .... 8.11:1   the tagline before it inks in
 *
 * (On the white sticker the same pair measures 14.85:1 and 9.24:1.)
 *
 * `quiet` is not the shell's `--muted-foreground` (#6B6459), which measures
 * 5.13:1 on this band and would sit under the bar; a scene that mixes its own
 * greys has to measure them.
 */
export const LABEL_INK = {
  /** The title, at every moment. 13.04:1 on the band. */
  ink: "#2a2724",
  /** The tagline before the develop inks it in. 8.11:1 on the band. */
  quiet: "#4a4743",
} as const;
