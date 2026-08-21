"use client";

/*
 * PIXEL SECTOR MARKS — the filter rail's sector icons, as 1-bit Mac app icons.
 *
 * Each sector is TWO hand-authored bitmaps, 32 x 32 and 16 x 16, drawn cell by
 * cell.
 *
 * ── WHERE THESE GO, AND WHERE THEY DELIBERATELY DO NOT ────────────────────
 * THE FILTER RAIL ONLY. `WorkGallery`'s rail is a field of labelled desktop
 * icons standing on `GraphDesk`'s ruled grey sheet, which is exactly the
 * context a 1-bit application icon comes from — a row of them on ruled paper is
 * the thing being quoted.
 *
 * THE CARD KEEPS ITS VECTOR MARK (`IndustryGlyph`). That is the owner's call and
 * it is a good one: the card's mark is a single large drawing inside a window,
 * where hairline geometry reads as a picture, and a 64px bitmap in the same slot
 * reads as a system resource that wandered into the content area. So the two
 * surfaces run two treatments on purpose, and this module has exactly one
 * consumer. Do not "unify" them without re-opening that decision.
 *
 * THE COST, stated plainly: the rail no longer draws the identical figure the
 * cards carry, which `WorkGallery` used to describe as the payoff that made the
 * rail more than a costume. What still holds the pairing together is SUBJECT —
 * both are per-sector marks of the same five things, and the labels are the same
 * words — but a reader can no longer match rail tile to card by silhouette. If
 * that turns out to matter, this note is the diagnosis.
 *
 * ── WHY TWO GRIDS AND NOT ONE SCALED ──────────────────────────────────────
 * This is the whole reason the module has the shape it does, and it is not
 * belt-and-braces. A bitmap is defined by exact cell placement, so it only
 * renders crisply at INTEGER multiples of its grid: the 32 grid is sharp at
 * 64px (2x) and mush at 20px (0.6x), where the renderer has to average
 * neighbouring cells and every edge greys out. The rail draws these small.
 *
 * Classic Mac icons solved it the same way and for the same reason — `ICN#` at
 * 32 x 32 beside `ics#` at 16 x 16, each REDRAWN so the shape survives the
 * coarser grid rather than shrunk. Compare the two sets below and the 16s are
 * not the 32s with detail removed: the document loses two rule lines, the
 * first-aid case loses its dither entirely, and the bar chart's bars are
 * re-spaced so they cannot fuse with the page edge they sit beside.
 *
 * ── WHAT THE DITHER IS FOR ────────────────────────────────────────────────
 * ':' is a 50% checkerboard, lit only where (x + y) is even. It is the era's
 * signature and it is used ONLY where there is a real second plane to shade: a
 * page's folded corner, the shaded foot of a case, a pediment's tympanum.
 *
 * IT NEEDS DEPTH TO READ. A checkerboard one cell deep is a dashed line, not a
 * shade — that was the first pass and it looked like a mistake at every size.
 * Nothing here is dithered in a band under three cells deep, and the 16 x 16
 * set carries no dither at all, because at that size a checkerboard collapses
 * into a flat grey wash and the originals were drawn flat for the same reason.
 *
 * ── EDITING ONE ───────────────────────────────────────────────────────────
 * The strings ARE the source; there is no exporter and no binary. Every row
 * must be exactly as wide as the grid is tall, which `assertGrid` checks at
 * module load in development rather than trusting — a short row does not error,
 * it silently skews the icon. Draw with a fixed-width font and the cells line
 * up under each other on screen exactly as they render.
 */

export type Grid = readonly string[];

/* THE LARGE SIZE — 32 x 32. Currently unused by any call site: the rail draws
   both its forms from the 16 grid, and the card kept its vector mark. It is kept
   drawn rather than deleted because it is the set's reference rendering, it is
   what a future large slot would take, and redrawing five icons is a day's work
   where keeping them is free. */
const G32 = {
  finance: [
    "................................",
    "................................",
    "......#############.............",
    "......#...........##............",
    "......#...........#:#...........",
    "......#...........#::#..........",
    "......#...........#:::#.........",
    "......#...........#::::#........",
    "......#...........#######.......",
    "......#.................#.......",
    "......#.................#.......",
    "......#.................#.......",
    "......#.................#.......",
    "......#............###..#.......",
    "......#............###..#.......",
    "......#............###..#.......",
    "......#............###..#.......",
    "......#.......###..###..#.......",
    "......#.......###..###..#.......",
    "......#.......###..###..#.......",
    "......#.......###..###..#.......",
    "......#..###..###..###..#.......",
    "......#..###..###..###..#.......",
    "......#..###..###..###..#.......",
    "......#..###..###..###..#.......",
    "......#..###..###..###..#.......",
    "......#..##############.#.......",
    "......#.................#.......",
    "......#.................#.......",
    "......###################.......",
    "................................",
    "................................",
  ],

  healthcare: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    ".............######.............",
    ".............#....#.............",
    ".............#....#.............",
    ".............#....#.............",
    ".....######################.....",
    "....#......................#....",
    "....#......................#....",
    "....#.........####.........#....",
    "....#.........####.........#....",
    "....#.........####.........#....",
    "....#.....############.....#....",
    "....#.....############.....#....",
    "....#.....############.....#....",
    "....#.....############.....#....",
    "....#.........####.........#....",
    "....#.........####.........#....",
    "....#.........####.........#....",
    "....#......................#....",
    "....#::::::::::::::::::::::#....",
    "....#::::::::::::::::::::::#....",
    "....#::::::::::::::::::::::#....",
    ".....######################.....",
    "................................",
    "................................",
    "................................",
    "................................",
  ],

  payments: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "....########################....",
    "...#........................#...",
    "...#........................#...",
    "...##########################...",
    "...##########################...",
    "...##########################...",
    "...#........................#...",
    "...#........................#...",
    "...#........................#...",
    "...#..####.####.####.####...#...",
    "...#..####.####.####.####...#...",
    "...#........................#...",
    "...#........................#...",
    "...#........................#...",
    "...#........................#...",
    "...#........................#...",
    "....########################....",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ],

  education: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "...............##...............",
    ".............##..##.............",
    "...........##......##...........",
    ".........##..........##.........",
    ".......##::::::::::::::##.......",
    ".....##::::::::::::::::::##.....",
    "...##::::::::::::::::::::::##...",
    "..############################..",
    "..############################..",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "....###..###..###..###..###.....",
    "..############################..",
    ".##############################.",
    "################################",
    "................................",
    "................................",
    "................................",
    "................................",
  ],

  document: [
    "................................",
    "................................",
    "................................",
    ".......############.............",
    ".......#..........##............",
    ".......#..........#:#...........",
    ".......#..........#::#..........",
    ".......#..........#:::#.........",
    ".......#..........#::::#........",
    ".......#..........#######.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#..############..#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#..############..#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#..############..#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#..############..#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......#..#######.......#.......",
    ".......#................#.......",
    ".......#................#.......",
    ".......##################.......",
    "................................",
    "................................",
    "................................",
  ],
} as const;

/* THE SMALL SIZE — 16 x 16, drawn for the rail. Redrawn, not reduced. */
const G16 = {
  finance: [
    "................",
    "..#########.....",
    "..#.......##....",
    "..#.......#.#...",
    "..#.......####..",
    "..#..........#..",
    "..#.......##.#..",
    "..#.......##.#..",
    "..#....##.##.#..",
    "..#....##.##.#..",
    "..#.##.##.##.#..",
    "..#.##.##.##.#..",
    "..#.########.#..",
    "..#..........#..",
    "..############..",
    "................",
  ],

  healthcare: [
    "................",
    "................",
    "......####......",
    "......#..#......",
    "..############..",
    "..#..........#..",
    "..#....##....#..",
    "..#....##....#..",
    "..#..######..#..",
    "..#..######..#..",
    "..#....##....#..",
    "..#....##....#..",
    "..#..........#..",
    "..############..",
    "................",
    "................",
  ],

  payments: [
    "................",
    "................",
    "................",
    "................",
    ".##############.",
    ".#............#.",
    ".##############.",
    ".##############.",
    ".#............#.",
    ".#.##.##.##...#.",
    ".#............#.",
    ".#............#.",
    ".##############.",
    "................",
    "................",
    "................",
  ],

  education: [
    "................",
    "................",
    ".......##.......",
    ".....######.....",
    "...##########...",
    ".##############.",
    ".##############.",
    "...##.##.##.##..",
    "...##.##.##.##..",
    "...##.##.##.##..",
    "...##.##.##.##..",
    "...##.##.##.##..",
    ".##############.",
    "################",
    "................",
    "................",
  ],

  document: [
    "................",
    "...#######......",
    "...#.....##.....",
    "...#.....#.#....",
    "...#.....####...",
    "...#........#...",
    "...#.######.#...",
    "...#........#...",
    "...#.######.#...",
    "...#........#...",
    "...#.######.#...",
    "...#........#...",
    "...#.####...#...",
    "...#........#...",
    "...##########...",
    "................",
  ],
} as const;

export type SectorKey = keyof typeof G32;

/* A short row does not throw, it draws a skewed icon — so the shape of every
   grid is checked rather than trusted. Development only: the grids are static
   literals, so a set that passes once passes forever, and there is nothing for
   this to catch in a production bundle. */
function assertGrid(name: string, rows: Grid, size: number) {
  if (rows.length !== size) {
    throw new Error(`pixelMarks: ${name} has ${rows.length} rows, expected ${size}`);
  }
  rows.forEach((row, y) => {
    if (row.length !== size) {
      throw new Error(`pixelMarks: ${name} row ${y} is ${row.length} wide, expected ${size}`);
    }
    if (/[^#:.]/.test(row)) {
      throw new Error(`pixelMarks: ${name} row ${y} has a character outside "#:."`);
    }
  });
}

if (process.env.NODE_ENV !== "production") {
  Object.entries(G32).forEach(([k, v]) => assertGrid(`${k}/32`, v, 32));
  Object.entries(G16).forEach(([k, v]) => assertGrid(`${k}/16`, v, 16));
}

/* ONE RECT PER RUN OF LIT CELLS, not one per cell. A 32-grid icon is around a
   thousand cells and under a hundred runs, so this is the difference between an
   SVG that is cheap to ship and inline and one that is not. Runs are horizontal
   only — merging vertically too would need a real rectangle decomposition for a
   saving that does not show at this scale.

   Computed ONCE per grid at module load, not per render: the grids are
   immutable literals and every card and rail tile draws the same handful of
   shapes. */
function runs(rows: Grid): string {
  const out: string[] = [];
  rows.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x += 1) {
      const c = row[x];
      const lit = c === "#" || (c === ":" && (x + y) % 2 === 0);
      if (lit && start < 0) start = x;
      if (!lit && start >= 0) {
        out.push(`M${start} ${y}h${x - start}v1h${-(x - start)}z`);
        start = -1;
      }
    }
  });
  return out.join("");
}

const PATHS = {
  32: Object.fromEntries(
    Object.entries(G32).map(([k, v]) => [k, runs(v)]),
  ) as Record<SectorKey, string>,
  16: Object.fromEntries(
    Object.entries(G16).map(([k, v]) => [k, runs(v)]),
  ) as Record<SectorKey, string>,
};

/**
 * One sector mark.
 *
 * `grid` picks WHICH DRAWING, not how big it renders — the element is sized by
 * `className` like every other mark on the site. Pass 32 where the mark is drawn
 * at 32px or above, and 16 below it. Both rail forms use 16: the pill draws it
 * at 16px (1:1) and the icon tile at 48px (3x), and both are integer multiples,
 * which is the whole reason those two sizes and not the 20/40 they replaced.
 *
 * `shapeRendering="crispEdges"` is the load-bearing attribute: without it the
 * renderer antialiases every cell boundary and the whole point of a bitmap —
 * hard edges on a grid — is lost at exactly the sizes it matters most.
 *
 * Ink is `currentColor`, so these keep the behaviour the vector marks had and
 * take the frame's tone from whatever draws them.
 */
export function PixelMark({
  sector,
  grid,
  className,
}: {
  sector: SectorKey;
  grid: 16 | 32;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${grid} ${grid}`}
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[grid][sector]} />
    </svg>
  );
}

const SECTOR: Record<string, SectorKey> = {
  "financial-services": "finance",
  healthcare: "healthcare",
  payments: "payments",
  "higher-education": "education",
};

/**
 * The rail's sector icon, resolved from an entry's `industry` field.
 *
 * It mirrors `IndustryGlyph`'s signature — same `className`, same tolerated
 * `weight` — so `FilterTile`'s `renderMark` can spread one props object across
 * this and `ShowGlyph` without branching. `weight` is accepted and ignored: a
 * filled cell has no stroke to derive. Keep the parameter; removing it breaks
 * that call site's shared renderer type.
 *
 * Always the 16 grid, because both rail forms are small — see the note on
 * `PixelMark`.
 */
export function IndustrySprite({
  industry,
  className,
}: {
  industry?: string;
  className?: string;
  weight?: unknown;
}) {
  const slug = industry
    ? industry.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")
    : "";
  return (
    <PixelMark sector={SECTOR[slug] ?? "document"} grid={16} className={className} />
  );
}
