/*
 * GRAPH DESK — the ground as engineering paper.
 *
 * The third candidate ground for `DesktopProjectCard`, against the pastel
 * ribbon wallpaper and the shader paper on /explore/folder-cards — and the one
 * that won. It is the ground of the whole lower home page: work, explorations
 * and writing all stand on ONE sheet of it, painted once in page.tsx rather
 * than per band. The reasoning for one sheet over three coloured ones is at
 * that call site, and it is the thing to read before tinting this per section.
 *
 * ── WHAT THE REFERENCE ACTUALLY IS ───────────────────────────────────────
 * `screenshots/work-treatment/…8.46.07 am.png` is not the retro-OS desktop the
 * other three panels are. It is a SPEC SHEET: white panels with a thin black
 * border and a hard offset shadow, lying on fine graph paper, with monospace
 * labels and a dotted stage inside each panel holding the specimen. Read
 * closely, four devices carry the whole look, and only three of them are taken:
 *
 *   THE GRID          a plain uniform square rule, roughly 18px, in a light
 *                     grey barely above its ground. No heavier accent line
 *                     every fifth cell — it is graph paper, not a plan.
 *   THE HARD SHADOW   solid, offset down and right, NO BLUR. This is the one
 *                     doing most of the character work.
 *   THE DOTTED STAGE  a finer dot field inside the panel, under the specimen,
 *                     so the thing on show reads as mounted rather than
 *                     floating.
 *   THE REF CODES     `RSP-01`, `RSP-02`… and a barcode. NOT TAKEN. A counter
 *                     on a card is the one thing carrying no information, the
 *                     site does not number things a reader cannot use the
 *                     number for, and numbered marks were already judged
 *                     tiring here. The barcode is the same objection with
 *                     fewer digits.
 *
 * ── WHY IT IS A NEAR-NEUTRAL AND NOT A COLD GREY ──────────────────────────
 * The reference is cold: #e1e1e1 rule on #e2e2e1 ground, near-black ink, no
 * hue anywhere. Copied verbatim that would put a cold grey plane directly under
 * a hand-drawn garden whose paper samples #eadacc — a warmer, pinker cream —
 * and the seam the home page spends effort hiding would become the loudest edge
 * on the page. So the STRUCTURE is taken exactly and the TEMPERATURE is the
 * site's — the sheet is `--accent`, a 0.0087-chroma warm grey, which reads as
 * neutral to the eye without being a cold plane under warm cards. Rule and
 * ground sit at the same low contrast the reference uses (1.06:1 there, 1.26:1
 * here). It reads as the same paper, ruled.
 *
 * ── WHY CSS AND NOT A SHADER ─────────────────────────────────────────────
 * Two repeating linear gradients. No WebGL context, no image, no shader
 * compile, nothing to bake later — which matters because the home page is
 * already running the world's WebCodecs renderer and this is the ground that
 * would sit directly beneath it. The paper shader was one compile and one draw;
 * this is zero.
 *
 * BOTH COLOURS ARE TOKENS, and that is a change from how this file started.
 * They were artwork scene constants — the §3 carve-out `desktopInk` still takes,
 * for a palette that has to hold a specific reference's look no matter what the
 * theme does. That was the right shape while the sheet was a colour SAMPLED off
 * the film, because no token could have carried it. It is the wrong shape for a
 * neutral grey: the sheet is `--accent` and the ruling is `--graph-rule`, both
 * declared in theme.css, both derived there from one another (owner's call,
 * Aug 2026 — "shouldn't we use theme and global css"). Nothing here holds a hex.
 */

/**
 * THE SHEET IS `--accent`, AND IT IS THE ONE GROUND HERE THAT IS NOT A SAMPLE.
 *
 * The history in four steps, because the ground has now been all four things:
 * a pale green tint of the Macintosh hello-world screen; then NOTHING at all,
 * letting the page's `--secondary` plane show between the lines; then a warm
 * brown cream taken off the walk's final frame; and now a neutral grey out of
 * the theme (owner's call, Aug 2026 — "a gray colour similar to the glass pane
 * of the world page", then "find a neutral gray from the theme").
 *
 * ── WHY A TOKEN RATHER THAN A SAMPLED CONSTANT ───────────────────────────
 * The three grounds before this were all pulled out of a picture — a screen, a
 * frame, a pane — and each one then had to be lifted or dropped along its own
 * hue until the type on it cleared. That is a derivation to re-run every time
 * anything moves. `--accent` is already the theme's answer to "a quiet neutral
 * surface a step below the page", it is already measured against the ink family
 * (`--accent-foreground` is declared with its own ratio right there in
 * theme.css), and it needs no derivation at all. §3's rule is that colour comes
 * from a token unless there is a reason it cannot; the sampling was the reason,
 * and it stopped being one when the sheet stopped needing to quote a picture.
 *
 * AND IT LANDS ON THE GLASS ANYWAY, which is the part worth keeping. The ask
 * before this one was for the world pane's grey. `--wgc-pane-solid` — the
 * landed panel, the last surface on screen before these bands begin — resolves
 * to `#EBE8E1`, and `--accent` is `#ECE9E3`. They are 1.010:1 apart, which is
 * below the threshold at which two greys can be told apart side by side. The
 * token IS the pane's grey; nobody had to go and get it.
 *
 * ── WHY IT IS THIS NEUTRAL AND NOT MORE SO ──────────────────────────────
 * `--accent` is L 0.9347 / C 0.0087 / h 84.6°. The chroma is the point: a tenth
 * of what a tint carries and half the retired brown's 0.0194, so it reads
 * plainly as GREY, while the warm hue keeps it from putting a blue-grey plane
 * under cream cards — the failure mode the header note describes.
 *
 * ── THE TWO VALUES EITHER SIDE OF IT, BOTH TRIED AND BOTH REJECTED ───────
 * `#F3F0E9` (L 0.956) was TOO LIGHT, and the reason is structural rather than a
 * matter of taste: it was pinned at `--secondary`'s own lightness by the 7:1 §4
 * holds small text to, so the paper could not be more than a hair off the plane
 * behind it and read as no sheet at all. `#E3E0D9` (L 0.907) was TOO DARK.
 * `--accent` sits between them, and the cards lift 1.085:1 off it where the
 * pinned value gave them 1.019:1 — which is the whole gain being bought.
 *
 * ── WHAT IT COSTS, AND IT IS THE COST THIS FILE ALWAYS SAID IT WOULD ─────
 * `--secondary-foreground` #55504A measures 6.583:1 here, under the 7:1 bar.
 * Every ground before this was chosen to clear that bar, which is exactly what
 * pinned them all to one lightness. So the copy moved instead, as this note has
 * always said it would have to: the two ledes standing on the sheet (page.tsx's
 * Substack band, `ExplorationsBand`) are `--foreground` now, at 9.769:1.
 * `WorkGallery`'s rail already stood in `--foreground` for its own reason, so
 * the three bands are finally one ink rather than two.
 *
 * `desktopInk.line` IS THE SAME #55504a AND DOES NOT MOVE. It measures the same
 * 6.583:1, which is a non-text boundary held to 3:1 (§12) and clears it twice
 * over. The cards' own type is on their stock, not on this.
 *
 * ── THE SEAM IS A VALUE STEP, NOT A CHANGE OF PAPER ──────────────────────
 * The reason the ground was removed once was that a tinted sheet announced
 * itself at the flight's foot: contrast ratio says nothing about hue, so even a
 * luminance-matched green read as a change of paper. THE OBJECTION WAS ABOUT
 * HUE, and this value shares its hue with everything it meets — 84.6°, against
 * the world's `--sw-paper` #F6F3EC at 87.5° and `--secondary` #F2F0EB at 88.6°.
 * What is left is a difference in VALUE alone: 1.093:1 from `--sw-paper` and
 * 1.064:1 from this page's plane. Same paper, shaded, which is a different thing
 * from the green's change of stock.
 *
 * ── THE THREE RETIRED GROUNDS, AND THEIR DERIVATIONS ARE STILL WORTH KEEPING ─
 * The pane grey was `#F3F0E9`: `--wgc-pane-solid` at its own hue and chroma,
 * lifted in lightness until the quiet token cleared 7:1 exactly, and `#E3E0D9`
 * was the same grey dropped a step. The brown was `#FBEEE4`:
 * `public/assets/world/leg-9-final.webp` quantised, where `#E9DCD2` covers 53%
 * of the frame and `#E8D9CC` another 27%, taken at its own hue (L 0.902 /
 * C 0.0197 / h 60.2°) and lifted the same way. The green was `#e9efe3`: the
 * Macintosh hello-world screen taken to a pale tint, sampled off
 * `public/assets/world/scene-9-hello-world.webp` (`#d6e2cb`) rather than off the
 * graded film, which is the sampling error that made an earlier `#e8efe9` read
 * faintly cold.
 */
const GRAPH_GROUND: string | undefined = "var(--accent)";
/**
 * THE RULE, AND IT IS THE SHEET DARKENED — NOT A GREY LAID OVER IT.
 *
 * It has been a green (the Macintosh hue held a step deeper than a green sheet),
 * then a warm grey `#d8d4cc` (the reference's own near-neutral, for a sheet that
 * had stopped being a colour), then `#DED2C8` for the brown sheet. The rule
 * always follows the paper: a line that kept a hue the paper had left would read
 * as printed ON the sheet rather than ruled INTO it.
 *
 * `--graph-rule` is `--accent` darkened along its own OKLCH hue — L 0.879
 * against the sheet's 0.935, chroma and hue held. It is declared in theme.css
 * beside the surface it is derived from, NOT here, so a re-valued `--accent`
 * and its ruling move together. It is also not `--rule`, which is this site's
 * structural hairline drawn from the ink; the difference is argued at the
 * declaration.
 *
 * AND IT IS THE FIRST RULE ON THIS SHEET THAT IS LIGHTER THAN 1.30:1. Every pair
 * before it carried very nearly the same separation (green 1.287:1, the first
 * grey 1.298:1, brown 1.303:1) — a number that was never chosen so much as
 * inherited. It is 1.26:1 now, after a pass at 1.19:1 that read as too faint
 * (owner's calls, Aug 2026). Some of what looked too faint at 1.19 was the mixed
 * rasterisation the tiling note below describes rather than the value; the two
 * were fixed together, so this number is the first one judged on a sheet whose
 * lines all weigh the same.
 *
 * THE REFERENCE STILL GOVERNS THE STRUCTURE. The spec sheet runs #e1e1e1 on
 * #e2e2e1 — a rule that is simply a darker version of its ground, at a contrast
 * so low it is barely there. That relationship is what is being copied; the
 * temperature is the site's, and always was (see the header note).
 *
 * Decorative, carries no information, exempt from any contrast floor. The floor
 * that does bind it is the 20px repeat, and that is recorded at the token.
 */
const GRAPH_RULE = "var(--graph-rule)";
/** Cell size. The reference runs about 18px; 20 gives the same read and lands
    on the spacing scale's own rhythm rather than a number pulled off a
    screenshot of somebody else's page. */
const CELL = 20;
/** The rule's width, and every line on the sheet is this — see the note on the
    tiling below for why they did not all used to be. */
const RULE_PX = 1;

/**
 * The ruling. Absolutely positioned to fill its container; the caller supplies
 * the `relative`. It paints no ground of its own — see GRAPH_GROUND — so
 * whatever plane it is laid over shows through between the lines.
 *
 * ── ONE TILE, REPEATED — NOT ONE GRADIENT ACROSS THE WHOLE BAND ──────────
 * THE LINES USED TO COME OUT AT MIXED WEIGHTS, and the cause was the drawing
 * method rather than the width. This was two `repeating-linear-gradient`s, which
 * ask the browser to evaluate ONE gradient the full length of the sheet — some
 * three thousand pixels down the home page, or a hundred and fifty repeats. Each
 * of those repeats lands on its own sub-pixel phase, and a 1px band rasterised
 * at a different phase every time is a 1px band that covers one device pixel
 * here and splits across two there. On any display that is not at an exact
 * integer device-pixel ratio — a scaled macOS mode, a Windows laptop at 150%,
 * any browser zoom off 100% — the result is visibly some crisp lines and some
 * half-strength ones, read as mixed stroke thickness.
 *
 * A NON-REPEATING GRADIENT PLUS `background-size` DRAWS ONE 20 × 20 TILE AND
 * REPEATS THE IMAGE. The tile is rasterised once, at one phase, and every copy
 * of it is that same bitmap — so whatever a line looks like, all of them look
 * like it. That is the whole fix and it is the same number of layers, the same
 * zero draw calls, and no shader (see the header note).
 *
 * THE RULE'S WEIGHT NOW DEPENDS ONLY ON `RULE_PX`, which is the property the
 * name promised all along. If the lines ever need to be heavier, this is the one
 * number to change; do not compensate with the colour.
 *
 * Decorative and aria-hidden. Static — there is no motion and therefore no
 * reduced-motion branch.
 */
export function GraphDesk() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: GRAPH_GROUND,
        backgroundImage: [
          /* The tile's left edge — a vertical rule, repeated across. */
          `linear-gradient(to right, ${GRAPH_RULE} 0 ${RULE_PX}px, transparent ${RULE_PX}px)`,
          /* …and its top edge — a horizontal rule, repeated down. */
          `linear-gradient(to bottom, ${GRAPH_RULE} 0 ${RULE_PX}px, transparent ${RULE_PX}px)`,
        ].join(", "),
        backgroundSize: `${CELL}px ${CELL}px`,
      }}
    />
  );
}

/** Exported so a card can size its dotted stage against the sheet it lies on,
 *  and match the paper it lies on. `ground` is back because there is a ground
 *  again — while the sheet painted nothing it was deliberately absent, since a
 *  constant naming the plane's colour would have been a second copy of
 *  `--secondary` free to drift from the token. This value is the sheet's own,
 *  so exporting it is the opposite: one place to read it from. */
export const graphDesk = {
  ground: GRAPH_GROUND,
  rule: GRAPH_RULE,
  cell: CELL,
} as const;
