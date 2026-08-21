/*
 * DESKTOP INK — the palette and the wallpaper behind DesktopProjectCard.
 *
 * ARTWORK scene constants (style-rules §3 carve-out), the same category and the
 * same rules as `projectFields.ts` and `loFiInk.ts`: they live here beside the
 * artwork, never in theme.css, and are never referenced as UI colour. The shell
 * around this grid stays neutral; only the card artwork carries hue.
 *
 * THE REGISTER is the flat retro-OS illustration in
 * screenshots/work-treatment — a desktop of cream and pastel sweeps with
 * outlined windows lying on it. Three things carry that look and nothing else
 * does: one uniform heavy charcoal outline on every drawn edge, flat fills with
 * no gradient and no shadow anywhere, and a wallpaper whose curves have no
 * relationship to the rectangles sitting on them.
 *
 * WHY THE WALLPAPER IS THE BAND'S AND NOT THE CARD'S. The reference is one
 * desktop with windows on it, not a set of stickers each carrying its own
 * background. Giving every card its own ground would produce four unrelated
 * illustrations in a row; running one wallpaper behind the whole grid is what
 * makes them read as windows on a single surface. It is also why no project's
 * colour appears in the wallpaper — a shared ground cannot belong to one entry.
 *
 * SO THE PROJECT'S COLOUR IS SPENT ENTIRELY ON THE HOVER, and on the one thing
 * in this vernacular that already means "the window you are pointing at": the
 * title bar of the active window. At rest every window is inactive and its bar
 * is plain stock. Point at one and its bar floods with the project's own hue.
 * The interaction is the operating system's, not an effect laid over it.
 *
 * CONTRAST, measured rather than assumed. Every value below is stated against
 * the surface it actually sits on:
 *
 *   ink #2a2724 on stock #f6f2e9          13.3:1   title, tagline, banner
 *   quiet #55504a on stock                 7.1:1   docket and labels (§4: small
 *                                                  text clears 7:1, not 4.5)
 *   stock on ink                          13.3:1   the reversed button label
 *   ink on desk #f0e7d3                   12.1:1   the band's own heading copy
 *   ink on rose / teal / plum / indigo     9.0 / 10.6 / 8.6 / 8.5:1
 *                                                  the flooded title bar
 *   stock on ink flood                    13.3:1   an article's flooded bar
 *
 * NON-TEXT CONTRAST (§12, 1.4.11). The window's fill is only 1.10:1 against the
 * wallpaper, which does not matter and is not the number to read: the window's
 * boundary is drawn by its 3px outline, and that outline clears 3:1 on every
 * ground it crosses — see the full table on `line` below. The edge a reader
 * needs in order to see where a card starts is carried by that line, not by the
 * difference between two creams. The wallpaper's own ribbons are decorative,
 * carry no information, and are exempt.
 */

/* THE CHROME TONE, and it is a THEME COLOUR rather than an artwork one.
   `#55504a` is the exact value of `--muted-foreground` / `--secondary-foreground`
   in theme.css, exposed to Tailwind as `text-muted-foreground` /
   `text-secondary-foreground`.

   It is written here as a hex, not as `var(--muted-foreground)`, for the same
   reason `quiet` always was: this module is a palette consumed from inline
   `style` objects, some of it inside SVG attributes, and a scene constant that
   silently re-tinted whenever a project scope overrode the shell token would be
   a card that changes colour depending on which page last rendered. Borrowed by
   value, deliberately — but borrowed, so the drawn line is one of the site's
   own greys and not a fifth one invented for this card.

   ONE CONST FEEDS TWO ROLES below. The line and the supporting text are the
   same tone on purpose, so the frame, the mark and the sector line read as one
   quiet layer with only the project's name above it in full ink. */
const CHROME = "#55504a";

export const desktopInk = {
  /** The title ink, the bar's resting label, and the writing flood. The shell's
      own warm near-black (--note-ink), so the card writes in the same black the
      rest of the site does rather than a second one.

      IT IS NO LONGER THE OUTLINE. Every drawn edge takes `line` below. */
  ink: "#2a2724",
  /** EVERY DRAWN EDGE — the window's border, the rule under the title bar, the
      two chrome discs — AND THE INDUSTRY MARK inside it. The theme's own
      `--muted-foreground` (see `CHROME` above).

      WHY IT SPLIT FROM `ink`. The reference's whole look is a heavy charcoal
      outline, and drawn at 3px on a card the size of a home tile that is
      genuinely harsh — four near-black rectangles on a pale ruled sheet read as
      a table of boxes rather than as windows lying on paper. Softening the
      WEIGHT was the other option and it is the worse one: the uniform 3px
      stroke is the one thing carrying the retro-OS register, and a 1px window
      is just a card with a border. So the line keeps its weight and loses its
      blackness, which is the change that makes the frame recede without
      changing what kind of object it is.

      THE MARK TAKES IT TOO, which is the part that keeps the treatment honest.
      `DesktopProjectCard` states that the look is "a single uniform stroke on
      every drawn edge" and that "the moment two of them differ it stops reading
      as one hand". `IndustryGlyph` is `currentColor` line work at the card's own
      3px stroke, so it IS one of those edges — leaving it at full ink while the
      frame around it softened would have broken exactly the rule the frame was
      being careful about. Frame, discs, bar rule and mark are one tone; the
      project's name is the only thing on the card in full `ink`.

      WHY THIS EXACT GREY AND NOT A LIGHTER ONE. An earlier pass used `#736c63`,
      which is a genuinely medium grey and measures 4.55:1 on the graph ground.
      It is not a theme colour — it was mixed for this card — and the site's grey
      ladder has nothing between `--muted-foreground` #55504a and `--border`
      #e7e3dd, so "slightly darker, from the theme" resolves to the top of that
      gap rather than to a small nudge. The step is bigger than the word slight
      suggests (4.55:1 → 6.58:1 on the ground) and it is still a little over half
      the weight of the `#2a2724` this treatment started with.

      CONTRAST, against every surface it actually crosses (§12, 1.4.11 — this
      line is what identifies the card's boundary, so it is measured everywhere,
      not merely on the ground it usually sits on):

        line on graph ground --accent  6.58:1   the live home band (#ECE9E3)
        line on stock #f6f2e9          7.13:1   the inside of the window
        line on desk #f0e7d3           6.47:1   the /explore ribbon wallpaper
        line on blush ribbon #e9c9cf   5.21:1   the tightest case
        line on teal ribbon #bfdcd4    5.47:1

      Every one clears 3:1 with room to spare, and the stock figure is the same
      7.1:1 the supporting text has always been held to — which follows, since
      they are now the same colour. */
  line: CHROME,
  /** The window's stock. A pale warm cream — the reference's window fill, and a
      clear step lighter than the desk so a window still reads as lying ON the
      wallpaper even where its outline runs over a ribbon. */
  stock: "#f6f2e9",
  /** The wallpaper's base. Warmer and deeper than the stock. */
  desk: "#f0e7d3",
  /** Supporting text ON STOCK: the docket and the banner's label. This is
      --muted-foreground's exact value, borrowed rather than invented, and it
      clears the §4 bar for small text at 7.1:1 on stock.

      IT IS SPECIFIED AGAINST THE STOCK AND NOWHERE ELSE. On the wallpaper it
      measures 6.5:1 on the bare desk and 5.2:1 where a blush ribbon runs under
      it, both under the 7:1 bar — so supporting copy laid directly on the
      desktop takes `ink` (9.7:1 on the worst ribbon) instead. The quiet tone
      only ever appears inside a window.

      IT IS NOW THE SAME VALUE AS `line`, through the shared `CHROME` const, so
      the two cannot drift. They stay separate FIELDS because they are separate
      jobs with separate floors — `quiet` answers to the §4 7:1 text bar, `line`
      to the §12 3:1 non-text one — and the day one of them has to move, the
      call site should not have to guess which role it was serving. */
  quiet: CHROME,
} as const;

/*
 * THE WALLPAPER RIBBONS. Two large sweeps and nothing else — the reference
 * never shows more than three shapes at once, and at this scale a third would
 * turn a surface into a pattern. Both are deliberately NEUTRAL of the four
 * project hues (a dusty blush and a soft teal that belong to no entry in the
 * registry), because a ground shared by every card cannot be one card's colour.
 *
 * Decorative, aria-hidden, and exempt from any contrast floor. They sit 1.24:1
 * and 1.19:1 against the desk, which is the register: visible as a change of
 * material, never as a graphic competing with the windows on top of it.
 */
export const desktopRibbon = {
  blush: "#e9c9cf",
  teal: "#bfdcd4",
} as const;

/**
 * The title-bar tone a card floods with when it becomes the active window.
 *
 * CASE STUDIES TAKE THEIR CLIENT'S COLOUR, and take it verbatim: each value is
 * the primary bloom hex from that project's field in `projectFields.ts`, which
 * is itself derived from the `--primary` token in the project's own
 * `[data-project-theme]` scope. Restated here rather than imported because
 * those hexes live inside a composed `background-image` string and parsing one
 * back out would be worse than writing it down — the same reason `loFiInk`
 * restates rather than reaches. If a project's primary moves, this moves with
 * it as a deliberate re-derivation.
 *
 * WRITING FLOODS CHARCOAL, and that is the one entry here that is not a
 * borrowed hue. An article has no client, so there is no brand to reveal, and
 * giving it a pastel of its own would be claiming an identity a Substack post
 * does not have — the argument `loFiInk` already makes about its writing
 * payoff. Flooding the bar with the site's own ink says the opposite of the
 * four cards beside it: this one is hers. The bar's label reverses to stock,
 * which is the only reason `barInk` exists as a field at all.
 */
export type DesktopFlood = {
  /** The colour the title bar floods with on hover. */
  bar: string;
  /** The bar's label ink once flooded. Ink on every pastel; stock on charcoal. */
  barInk: string;
};

const floods: Record<string, DesktopFlood> = {
  /* rose 336 — Funding Finder's primary bloom, --primary #c21358 as a pastel */
  "funding-finder": { bar: "#ecbdd2", barInk: desktopInk.ink },
  /* teal 177 — the HDA green #007f78 as a pastel */
  "healthdirect-symptom-checker": { bar: "#b0e3e1", barInk: desktopInk.ink },
  /* plum 321 — AP+ corporate plum #80225f as a pastel */
  "ap-testing-portal": { bar: "#e6b7d6", barInk: desktopInk.ink },
  /* indigo 246 — the chosen primary, flagged in projectFields as having no
     theme scope to sample from. Replace with the rest of that entry. */
  "macquarie-radar": { bar: "#c3bfee", barInk: desktopInk.ink },
};

/** The writing flood: the site's own ink, with the bar's label reversed. */
export const writingFlood: DesktopFlood = {
  bar: desktopInk.ink,
  barInk: desktopInk.stock,
};

/** Resolve a card's flood, falling back to the writing one. */
export function getFlood(slug: string | undefined): DesktopFlood {
  return (slug && floods[slug]) || writingFlood;
}
