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
 * SO THE PROJECT'S COLOUR IS SPENT ENTIRELY ON THE HOVER, and on the thing in
 * this vernacular that already means "the window you are pointing at": the
 * active window. At rest every window is inactive — bare bar, grey mark. Point
 * at one and it becomes that project's window: the bar floods with the theme's
 * hue and the mark takes the theme's primary. The stock and the frame do not
 * move. The interaction is the operating system's, not an effect laid over it.
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
 * WHAT A WINDOW TURNS INTO WHEN IT BECOMES THE ACTIVE ONE.
 *
 * CASE STUDIES TAKE THEIR CLIENT'S COLOUR, and now they take THE CASE STUDY'S
 * OWN: every value below is read off that project's `[data-project-theme]`
 * scope in theme.css, so pointing at a card on the home band shows the colours
 * the page behind it is built from —
 *
 *   bar   a pastel of the scope's `--primary`, flooding the title bar
 *   mark  that same `--primary`, raw. The mark is line work at the card's own
 *         stroke, so it is the one drawn edge that can carry hue without
 *         turning the window into a coloured box.
 *
 * AND NOTHING ELSE TAKES IT. The window's body keeps the resting cream in both
 * states. A third value ran here for a pass — the scope's `--accent` fading in
 * as the stock behind the mark and the name — and it came off on the owner's
 * call (Aug 2026): the colour behind the title was more than the moment wanted,
 * and the bar plus the mark already says whose window this is. If it is ever
 * revisited, the contrast note to carry forward is that `quiet` #55504a lands
 * at 6.3–6.8:1 on those accents, under the §4 7:1 bar, so a tinted body needs
 * its filing line deepened to `ink`.
 *
 * Restated here as hexes rather than read from the tokens, for the reason
 * `loFiInk` restates too: this palette is consumed from inline `style` objects
 * on a surface that has no project scope on it, so `var(--accent)` here would
 * resolve to the SHELL's accent and every card would flood the same grey. If a
 * project's primary moves in theme.css, these move with it as a deliberate
 * re-derivation.
 *
 * TWO OF THE FOUR BARS WERE THE WRONG HUE and are re-derived (Aug 2026). The
 * pastels used to come from `projectFields.ts` — the home-cover blooms — and on
 * two projects that is a different colour from the case study: AP+ bloomed
 * corporate plum #80225f while its scope runs on purple #6250bb, and Macquarie
 * bloomed an invented indigo while MQ Health's scope runs on slate blue
 * #415364. A card that promises plum and opens on purple is the card lying
 * about where it goes, so the scope wins and the bloom no longer feeds this.
 *
 * WRITING KEEPS ITS CHARCOAL AND GAINS NOTHING ELSE, which is the whole point
 * of the difference. An article has no client, so there is no theme to pick up:
 * its bar floods the site's own ink and its mark stays chrome. Four windows wake
 * up in someone's colour and the writing ones wake up in hers.
 *
 * CONTRAST on the active window. The bar figures are unchanged (the table at
 * the top of this file). The mark is non-text line work and answers to §12's
 * 3:1, measured on the stock it is actually drawn on, #f6f2e9:
 *
 *   #c21358 rose   5.3:1     #007f78 teal   4.4:1
 *   #6250bb purple 5.6:1     #415364 slate  7.1:1
 */
export type DesktopFlood = {
  /** The colour the title bar floods with on hover. */
  bar: string;
  /** The bar's label ink once flooded. Ink on every pastel; stock on charcoal. */
  barInk: string;
  /** The mark's tone once active — the theme's `--primary`, raw. */
  mark: string;
};

const floods: Record<string, DesktopFlood> = {
  /* Funding Finder — primary #c21358, as a pastel in the bar */
  "funding-finder": { bar: "#ecbdd2", barInk: desktopInk.ink, mark: "#c21358" },
  /* Healthdirect — HDA green #007f78 */
  "healthdirect-symptom-checker": {
    bar: "#b0e3e1",
    barInk: desktopInk.ink,
    mark: "#007f78",
  },
  /* AP+ — purple #6250bb */
  "ap-testing-portal": {
    bar: "#cdc3f3",
    barInk: desktopInk.ink,
    mark: "#6250bb",
  },
  /* Macquarie — MQ Health slate blue #415364. The quietest of the four, and
     correctly so: MQ Health's own theme is the near-neutral one. */
  "macquarie-radar": {
    bar: "#c3ced7",
    barInk: desktopInk.ink,
    mark: "#415364",
  },
};

/** The writing flood: the site's own ink in the bar, the bar's label reversed,
    and a mark left in chrome — there is no client theme to pick up. */
export const writingFlood: DesktopFlood = {
  bar: desktopInk.ink,
  barInk: desktopInk.stock,
  mark: desktopInk.line,
};

/** Resolve a card's flood, falling back to the writing one. */
export function getFlood(slug: string | undefined): DesktopFlood {
  return (slug && floods[slug]) || writingFlood;
}
