/*
 * ISOMETRIC PIXEL MARKS — the home work band's filter icons.
 *
 * Six 1-bit icons on a 32 x 32 grid, drawn cell by cell: the three kind
 * filters (Everything, Work, Writing) and the three sectors. They are the marks
 * the filter rail draws on `GraphDesk`'s ruled grey sheet, and they are the
 * rail's ONLY marks — this module replaced both `ShowGlyph` (vector kinds) and
 * `marks/pixelMarks` (flat 1-bit sectors), so the two groups are finally drawn
 * by one hand instead of two.
 *
 * THE CARDS DO NOT USE THESE. `DesktopProjectCard` keeps its vector
 * `IndustryGlyph` at 54px — the card's mark is a large picture inside a window,
 * and a bitmap in that slot reads as a system resource in the content area. The
 * rail is a field of desktop icons on ruled paper, which is where these belong.
 * Two treatments, one per surface, deliberately.
 *
 * THE FACE SYSTEM IS THE WHOLE SET. Isometric gives every object three visible
 * planes, and 1-bit gives exactly three fills, so the mapping is forced and the
 * eight drawings cannot drift apart:
 *
 *   top face     empty     the light is up and to the left
 *   left face    dither    half lit
 *   right face   solid     in shadow
 *
 * This is a better home for the dither than the flat set had. There it was
 * decoration looking for a plane to justify it; here every object has a real
 * shaded face and the checkerboard is what that face IS.
 *
 * EVERY DIAGONAL IS 2:1 — two cells across per one down. That is the pixel-art
 * standard rather than a true 30 degrees, and the reason is that 2:1 lands on
 * exact whole cells, so an edge is a clean repeating stair instead of an
 * approximation the renderer has to smooth.
 *
 * SILHOUETTE CARRIES, SURFACE DETAIL MOSTLY DOES NOT. At 32 cells a two-cell
 * line on a top face vanishes; the marks that read are the ones whose OUTLINE
 * differs — a stack against a cube, bars of three heights, a pen crossing a
 * sheet's edge. Every piece of detail that survived here is an area at least
 * three cells thick.
 *
 * ONE / MANY IS THE KIND SYSTEM. Work is a single solid object and Everything is
 * three plates stacked. Writing breaks the pattern on purpose — it is a pen and
 * no sheet at all, because the instrument says "writing" faster than any
 * arrangement of pages, and a sheet-plus-pen was too close to the plate stack
 * beside it.
 *
 * THE PEN IS THE ONE OBJECT OFF THE ISO AXIS. It runs 45 degrees UP to the
 * right — one cell across per one down, the opposite diagonal to everything
 * else. Laid on the set\u2019s own 2:1 axis it read as another edge of another
 * box; against the grain it reads as a pen. That is a deliberate exception, not
 * a drift, and it is the only one.
 *
 * THERE IS NO FALLBACK. An "unmapped / article" one was drawn and cut:
 * the rail's Industry group is built from the sectors actually present in
 * `workEntries`, so a fallback can never render there, and articles are already
 * answered by the Writing kind filter. The only surface that needs a fallback is
 * the CARD, which draws vector marks and never reads this module.
 *
 * TWO THINGS COST SEVERAL ATTEMPTS EACH, recorded so they are not re-tried:
 * a cross KNOCKED OUT of the first-aid box's solid front face fails at both
 * sizes — small it reads as a chipped corner, large it eats the face and leaves
 * four dark corner scraps — because a six-deep face cannot carry a shape and
 * stay a face. It is two crossed bands on the lit lid instead. And detail on a
 * top plane has to be an AREA: every two-cell line drawn on one vanished.
 */

export type IsoKey = keyof typeof GRIDS;

const GRIDS = {
  everything: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "...............##...............",
    ".............##..##.............",
    "...........##......##...........",
    ".........##..........##.........",
    ".......##..............##.......",
    ".....##..................##.....",
    "...##......................##...",
    "...####..................####...",
    "...##::##..............##.###...",
    "...##::::##..........##.#####...",
    ".....##::::##......##.######....",
    ".....####::::##..##.#######.....",
    "...##....##::::##.######...##...",
    "...####....##::#######...####...",
    "...##::##....#######...##.###...",
    "...##::::##....###...##.#####...",
    ".....##::::##......##.######....",
    ".....####::::##..##.#######.....",
    "...##....##::::##.######...##...",
    "...####....##::#######...####...",
    "...##::##....#######...##.###...",
    "...##::::##....###...##.#####...",
    ".....##::::##......##.######....",
    ".......##::::##..##.######......",
    ".........##::::##.######........",
    "...........##::#######..........",
    ".............#######............",
  ],

  work: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "...............##...............",
    ".............##..##.............",
    "...........##......##...........",
    ".........##..........##.........",
    ".......##..............##.......",
    ".....##..................##.....",
    "...##......................##...",
    "...####..................####...",
    "...##::##..............##.###...",
    "...##::::##..........##.#####...",
    "...##::::::##......##.#######...",
    "...##::::::::##..##.#########...",
    "...##::::::::::##.###########...",
    "...##::::::::::##############...",
    "...##::::::::::##############...",
    ".....##::::::::#############....",
    ".......##::::::###########......",
    ".........##::::#########........",
    "...........##::#######..........",
    ".............#######............",
    "...............###..............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ],

  writing: [
    "................................",
    "................................",
    "................................",
    "................................",
    ".....................#..........",
    "....................#...........",
    "...................#............",
    "..................#.#...........",
    ".................#.:.#...#......",
    "................#.:.:.#.#.......",
    "...............#.:.:.:.#........",
    "..............#.:.:.:.#.........",
    ".............#.:.:.:.#..........",
    "............#.:.:.:.#...........",
    "...........#.:.:.:.#............",
    "..........#.:.:.:.#.............",
    ".........#.:.:.:.#..............",
    "........#.:.:.:.#...............",
    ".......#.:.:.:.#................",
    "......#.#.:.:.#.................",
    ".....#...#.:.#..................",
    "..........#.#...................",
    ".....#.....#....................",
    "....#...#.#.....................",
    ".....#.#........................",
    "....#...........................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ],

  /* FINTECH — a coin on edge, dollar sign on the face, rim as the solid plane.
     This IS the drawing that was filed under `payments`, unchanged cell for
     cell and renamed rather than redrawn.

     ONE SECTOR MARK REPLACED TWO. The rail used to carry `finance` (ascending
     bars) beside it, because the registry filed one client under "Financial
     services" and another under "Payments". Those are one sector for a reader
     scanning a portfolio, so the registry says Fintech for both now and this is
     the only money mark left. The bars were deleted rather than kept unused —
     an icon nothing can select is a drawing that quietly rots.

     A FLAT FACE-ON COIN WAS DRAWN AS THE REPLACEMENT AND REJECTED (owner's
     call). Recorded so it is not re-attempted on the reasoning that the $ gets
     more room face on: it does, and it still loses. Face on, the mark is a
     circle with a glyph in it and the only thing left of the object is its
     outline — while this one keeps the coin's edge and its lit face, so it
     belongs to the same lit-from-upper-left world as the plates and the block,
     and it is a THING rather than a symbol. */
  fintech: [
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    ".................#..............",
    ".............#########..........",
    "...........#############........",
    ".........####.###########.......",
    ".......##.........########......",
    "......#.............######......",
    ".....#.......#.......######.....",
    ".....#.......#.......######.....",
    "....#......#####......#####.....",
    "....#.....#..#..#.....#####.....",
    "....#.....#..#........######....",
    "....#.....#..#........#####.....",
    "...#.......#####.......####.....",
    "....#........#..#.....#####.....",
    "....#........#..#.....#####.....",
    "....#.....#..#..#.....####......",
    "....#......#####......####......",
    ".....#.......#.......####.......",
    ".....#.......#.......###........",
    "......#.............##..........",
    ".......##.........##............",
    ".........####.####..............",
    ".............#..................",
    "................................",
    "................................",
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
    "........#####......#####........",
    ".......#.....#....#.....#.......",
    "......#.......#..#.......#......",
    ".....#.........##.........#.....",
    ".....#....................#.....",
    "....#.........####.........#....",
    "....#.........####.........#....",
    "....#.....############.....#....",
    ".....#....############....#.....",
    ".....#....############....#.....",
    "......#...############...#......",
    ".......#......####......#.......",
    "........#.....####.....#........",
    ".........#....####....#.........",
    "..........#...####...#..........",
    "...........#........#...........",
    "............#......#............",
    ".............#....#.............",
    "..............#..#..............",
    "...............##...............",
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
    "................................",
    "................................",
    "................................",
    "................................",
    "...............##...............",
    ".............##..##.............",
    "...........##......##...........",
    ".........##..........##.........",
    ".......##..............##.......",
    ".......####..........####.......",
    ".......##::##......##.###.......",
    ".......##::::##..##.#####.......",
    ".......##::::::##########.......",
    ".......##::::::##########.......",
    ".......##::::::##########.......",
    ".......##::::::##########.......",
    ".....####::::::############.....",
    "...##....##::::#########...##...",
    ".##........##::#######.......##.",
    ".####........#######.......####.",
    ".##::##........###.......##.###.",
    ".##::::##..............##.#####.",
    "...##::::##..........##.######..",
    ".....##::::##......##.######....",
    ".......##::::##..##.######......",
    ".........##::::##.######........",
    "...........##::#######..........",
  ],
} as const;

function runs(rows: readonly string[]): string {
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

const PATHS = Object.fromEntries(
  Object.entries(GRIDS).map(([k, v]) => [k, runs(v)]),
) as Record<IsoKey, string>;

export const ISO_KEYS = Object.keys(GRIDS) as IsoKey[];

/** One isometric mark. Sized by the caller; ink is `currentColor`. */
export function IsoMark({
  mark,
  className,
  style,
}: {
  mark: IsoKey;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      style={style}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[mark]} />
    </svg>
  );
}

/* ── THE RAIL'S OWN RESOLVERS ─────────────────────────────────────────────
   The rail asks in its own vocabulary — a `ShowKind` or an industry string from
   the registry — rather than in mark names, so the mapping lives here beside the
   drawings instead of being restated at the call site. */

const KIND_MARK = {
  all: "everything",
  work: "work",
  writing: "writing",
} as const satisfies Record<string, IsoKey>;

const SECTOR_MARK: Record<string, IsoKey> = {
  fintech: "fintech",
  healthcare: "healthcare",
  "higher-education": "education",
};

/** The mark for one of the three kind filters. */
export function KindMark({
  kind,
  className,
}: {
  kind: keyof typeof KIND_MARK;
  className?: string;
}) {
  return <IsoMark mark={KIND_MARK[kind]} className={className} />;
}

/**
 * The mark for one industry, resolved from the registry's own `industry` string.
 *
 * There is no fallback drawing and there does not need to be: the rail builds
 * its Industry group from the sectors actually present in `workEntries`, so an
 * unmapped value cannot reach here from the only call site. If one ever does it
 * renders nothing rather than a wrong object, which is the failure worth having.
 */
export function SectorMark({
  industry,
  className,
}: {
  industry: string;
  className?: string;
}) {
  const key =
    SECTOR_MARK[
      industry.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")
    ];
  return key ? <IsoMark mark={key} className={className} /> : null;
}
