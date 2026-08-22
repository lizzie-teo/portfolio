/* THE TYPE ROLE REGISTRY — every named typographic role on the site.
   =================================================================
   Resolved sizes for all of these, mobile through desktop, are tabulated in
   `.docs/type-scale.md`; the reasoning lives in `.docs/style-rules.md` §4 and
   §12. This file is the source of truth for the values themselves.

   A ROLE IS NOT A HEADING LEVEL. `h1` is a document-structure fact — one per
   page, whatever size it happens to be. A role is a typographic fact: what this
   text is doing to the reader. The same element is both at once, and the two
   never determine each other. Naming the site's largest type "H1" would let the
   88px case-study cover and the 128px home hero share a name while sharing
   nothing else, and would leave two `h2` roles (`leafHeading` at 46px,
   `sectionHeading` at 36px) with no name at all. So every role below is named
   for its job, and the tag is chosen separately by outline position (§12).

   TWO FAMILIES, TWO VOICES. The site runs two typographic voices on purpose,
   and a role belongs to exactly one:

     EDITORIAL (case studies) — `font-semibold`, `tracking-[-0.03em]`. Tight,
     dense, set-down reading type. A case study is a document.

     GALLERY (home) — `font-medium`, tracking from -0.01em to -0.015em. Lighter
     weight and more open letterfit, because these sit on plates and cards as
     objects to be scanned, not paragraphs to be read.

   The poster line (`displayHeading`) sits above both as the site's loudest
   display voice: semibold like the editorial family, `tracking-tight` like
   neither. Roles here are named by SHAPE, not by placement — the home hero
   wore this one until the restructure and now wears `statementHeading`,
   because its copy became two whole sentences and a 128px staircase is cut
   for a five-word poster. Naming a role after a page is how a comment goes
   stale the day the page changes.

   Do not mix a family's weight or tracking into the other's surface; that is
   what makes a card title read as a section heading.

   ONE ROLE ON THE HOME PAGE IS EDITORIAL, recorded here so the rule above is
   not read as still covering it. `bandHeading` — "Selected work",
   "Explorations", "Substack" — is the case-study cover's own line
   (`.type-cover`, globals.css): semibold at -0.03em, standing over card titles
   that are still `font-medium` at -0.015em.

   THAT IS NOT THE MIXING THIS RULE FORBIDS, which is a card title borrowing a
   section heading's weight until the two read as one object. Here the two
   voices are 3.7× apart in size and doing different jobs on the same sheet:
   the band name is the page's STRUCTURE, the windows under it are its content.
   The change of family is what stops the size step reading as the same object
   shouted. It is the only exception, and a second one should be argued for
   from scratch rather than from this one. */

/* ── DISPLAY ───────────────────────────────────────────────────────────────
   Type large enough that it stops being read as document structure and starts
   being read as an image of a sentence. Both roles here are `h1` elements; the
   size is the reason they are display, not the tag. */

/* The poster line (36 → 128px) — the site's largest type and its only
   breakpoint staircase, deliberately outside the fluid ladder below. A short
   poster phrase in a narrow column (StatementHero, now parked at
   /home-original); the live home hero wears `statementHeading`. It is sized to
   characters per line against its own COLUMN (~530px at lg, 610 xl, 710 2xl),
   not the viewport, so a fluid curve on viewport width would overshoot it by a
   full step and fragment the headline. Every rung is 1.2–1.35× the one before,
   monotonic with no skips, and leading tightens as size grows (1.06 → 0.95).
   `text-9xl` is the top of the standard scale, so 2xl is this approach's
   ceiling — going past 128px means a clamp, which is a carve-out to justify.
   Measure (`max-w-[70rem]`) stays at the call site: it is layout, not type. */
export const displayHeading =
  "font-heading font-semibold text-4xl leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.02] xl:text-8xl xl:leading-none 2xl:text-9xl 2xl:leading-[0.95]";

/* The case-study cover (40 → 88px) — the top rung of the fluid ladder below,
   worn by the `h1` on a case study's opening plate. Display by size, but on the
   ladder's shared anchors rather than a staircase, because unlike the home hero
   it sits in a full-bleed plate whose width tracks the viewport. Carries the
   leaf ink like `leafHeading`; measure (`max-w-[18ch]`) stays at the call site.

   ITS SHAPE MOVED TO CSS, and the values did not change. The home page's band
   names now wear the same line (`bandHeading`, below), so the four properties
   are `--type-cover-*` in theme.css and `.type-cover` in globals.css assembles
   them — one declaration for two consumers, rather than a class string here
   and a copy of it there. What stays in this token is the INK, because that is
   the one thing the two do not share: a cover sets on the dark leaf plate, a
   band name on the home page's light ruled sheet. */
export const coverHeading = "type-cover text-leaf-foreground";

/* ── THE EDITORIAL LADDER — four roles, one curve ──────────────────────────
   Every role here is a two-viewport fluid clamp: it sits at its min at 375px,
   interpolates linearly, and reaches its max at 1440px. All four share those
   anchors, so the curves are parallel and the ladder's order is preserved at
   *every* width, not just at the endpoints:

                       375px   1440px
     coverHeading        40  →   88
     statementHeading    32  →   60
     leafHeading         28  →   46
     sectionHeading      28  →   36
     subsectionHeading   18  →   24   (Tailwind steps — see below)

   `leafHeading` and `sectionHeading` deliberately share a 28px floor: a section
   title should not shrink below the chapter opener's size on a phone just to
   preserve an abstract step. The two never appear together — a chapter opener
   owns a full-bleed dark plate with its own eyebrow and illustration, while a
   section title sits in-flow on a light tile — so on small screens the roles are
   told apart by surface, and only from 375px up does the leaf pull ahead on
   size. This is a tie at the floor, not an inversion: `leafHeading` has the
   steeper slope, so it leads at every width above the anchor.

   This shape is load-bearing, not stylistic. The previous scale mixed a `vw`
   clamp (leafHeading) with a breakpoint staircase (sectionHeading), and a fluid
   curve crossing a staircase inverts: from 768px to ~833px the chapter opener
   rendered *smaller* than the section headings inside it (28px vs 30px), and
   was still only ~1px above them at 1024px. Adding a breakpoint at the crossing
   only moves the next crossing. Parallel curves remove the failure mode.

   Each is written `clamp(min, Nrem + Mvw, max)` rather than `clamp(min, Mvw,
   max)`. The `rem` term is what keeps the heading responsive to browser text
   zoom — a size expressed in `vw` alone ignores the reader's font-size setting
   between the clamp bounds.

   To retune a role, move its two endpoints and recompute both terms with
     slope  = 100 * (max - min) / 1065
     offset = min - 375 * (max - min) / 1065
   Never hand-set one role's size in isolation; that is how the ladder inverted
   the first time. Below the ladder, `subsectionHeading` and `minorHeading` stay
   on plain Tailwind steps — they sit far enough below `sectionHeading` (24 vs
   36 at desktop) that no crossing is reachable, and the standard scale is the
   §4 default wherever it works. */

/* The display sentence (32 → 60px) — the top rung below the cover `h1`, worn
   by a full sentence set at display size: a case study's thesis statement
   (CaseStatement), the home hero's two-sentence opener (HomeHero), the /work
   and exploration mastheads. §5 exempts a statement headline from the §4 scale
   lookup, but not from being named: before this token both statement instances
   carried their own inline `clamp()` and had drifted to different sizes.
   Carries `font-heading` explicitly because a statement is not always marked up
   as a heading tag, and the display face is applied globally by tag.

   An in-flow statement that *titles* a section or artifact block is not this
   role — per §12 it is that section's `h2` and wears `sectionHeading`. This one
   is reserved for the full-width statement that stands alone.

   It also clothes the opening line of a standalone index page (`/work`), which
   is the same job on a different surface: one sentence at display size, on a
   full-width plane, standing alone rather than titling a block beneath it. It
   is NOT the poster line — `displayHeading` is a poster sized to a narrow
   column and would fragment on a page-wide measure — and it is not
   `galleryHeading`, which is a quiet rubric that deliberately sits *under* the
   card titles it introduces. */
export const statementHeading =
  "font-heading text-[clamp(2rem,1.3838rem+2.6291vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.03em]";

/* The chapter-leaf title (28 → 46px) — worn only by a chapter opener plate on
   its dark leaf surface. It is a top-level `h2` like every other section, but a
   chapter opener is a distinct display role and sits one rung above
   `sectionHeading` on the ladder, sharing its 28px floor and pulling ahead from
   375px up (see the ladder note above). Named, not inline, so a leaf title can
   never drift from this one size. */
export const leafHeading =
  "text-[clamp(1.75rem,1.3539rem+1.6901vw,2.875rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-leaf-foreground";

/* The canonical top-level section heading (28 → 36px). Every top-level section
   title wears this one display line, whether the module tiles itself
   (EngineAudit, LandscapeReview, JourneyMap, IaFlow) or renders through
   ArtifactSection, so the look can never drift and no section title falls back
   to the small uppercase eyebrow. That eyebrow style is reserved for captions
   and kickers, never for section titles.

   The explicit `leading` is required, not decorative: an arbitrary font-size
   carries no paired line-height the way `text-2xl` does, so omitting it drops
   the heading to the inherited body leading.

   `text-heading` is the role's own ink rather than the inherited body colour,
   so a project scope can set its section titles in the brand's deepest tone
   while the paragraphs under them stay neutral (see --heading in theme.css).
   The shell resolves it to --foreground, so unthemed pages are unchanged. A
   heading on a DARK surface still overrides it locally with
   `text-leaf-foreground`; that lands later in the class list and twMerge keeps
   the last colour, so the two never fight. */
export const sectionHeading =
  "text-[clamp(1.75rem,1.5739rem+0.7512vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-heading";

/* A nested subsection heading (ArtifactSection with headingLevel 3, and every
   content-level h3 — persona cards, roadmap items, scorecard titles): a clear
   two steps down from sectionHeading at both ends of the range (h2 36 → h3 24
   at desktop, h2 28 → h3 18 on a phone) so a nested heading reads unmistakably
   below its section, never as a second h2, and never reverting to an eyebrow.
   It stays on Tailwind steps rather than joining the ladder because it clears
   `sectionHeading` by a wide enough margin at every width that the staircase
   can never cross the curve above it. This is the single content-h3 style — do
   not size nested headings ad hoc; reach for this token. */
export const subsectionHeading =
  "text-lg font-semibold tracking-[-0.03em] md:text-xl lg:text-2xl";

/* A content-level h4 — the deepest heading the case-study outline goes (§12:
   h2 section → h3 subsection → h4, never deeper). It names one part *inside* a
   subsection: the "Before" and "After" states of a comparison exhibit, and any
   future peer at that depth. One step below subsectionHeading at desktop
   (h3 24px → h4 18px) in the same display family, so depth still reads from
   size alone and an h4 never draws level with the h3 above it.

   This is a heading role, not a label role. The small uppercase tracked eyebrow
   (§3) remains the right treatment for a caption or kicker that happens to use
   a heading tag for outline reasons — reach for this token only when the text
   genuinely titles a block of content. */
export const minorHeading =
  "text-base font-semibold tracking-[-0.03em] md:text-lg";

/* The canonical lede that sits directly beneath a sectionHeading /
   subsectionHeading — the sentence or short paragraph that frames the section
   (an ArtifactSection takeaway, or the intro paragraph a self-tiled module
   renders under its own heading, e.g. EngineAudit, LandscapeReview). One
   treatment so the heading→lede pairing never drifts in size, colour, measure,
   or the gap above it: full-strength foreground reading text (§4 — the lede is
   primary reading copy, not muted metadata) at the same body size as the
   case-study cover intro (CaseStudyShell), i.e. text-base with no desktop
   step-up, capped to a reading measure. Apply it to the single element that
   immediately follows the heading — do not add a competing top margin on a
   wrapper. Diagram modules (JourneyMap, IaFlow) are exempt: their heading is
   followed by a legend or persona block, not a lede. See .docs/style-rules.md
   §"Section heading + lede". */
export const sectionLede =
  "mt-3 max-w-prose text-base leading-relaxed text-foreground";

/* ── THE GALLERY VOICE (home) ──────────────────────────────────────────────
   Lighter weight and more open letterfit than the editorial family, because
   these roles label objects on plates rather than set paragraphs to be read.
   All of them carry `font-heading` explicitly: a card title is not always an
   `hN`, and the display face is applied globally by tag.

   THE NAME OVER THESE CARDS HAS LEFT THE VOICE ENTIRELY, and the history is
   stated rather than erased because every step of it was a deliberate call.
   The rubric and the card title went 36 → 30 (inversion), then 30 = 30 (a tie,
   when the card came down to meet the /world glass pane), then 36 over 24 (the
   rubric a clear two steps up), and the home page's version is now 88 over 24
   in the editorial voice — `bandHeading`, the case-study cover's line. What is
   left in THIS voice is the index pages: `galleryHeading` on /work and
   /explorations, and every card role below.

   THE OLD ARGUMENT, kept because it is the diagnosis if the home page ever
   feels top heavy: "Selected work" is a quiet label naming a region, while the
   card titles ARE the gallery's content — the grid is the composition and the
   label is a caption on it, so hierarchy should come from the plates and the
   ground rather than from out-sizing the thing the reader came for. What
   overrode it, twice: the cards came down far enough that the rubric read as
   too small to open a band, and then the bands became the home page's chapter
   breaks rather than captions on it.

   IF THE GAP EVER READS AS SHOUTING, close it from the NAME's end; the card
   title is the content and has already been sized to its box twice. */

/* The gallery's section rubric (30 → 36px) — a shelf's subject on
   /explorations, and "Selected work" on /work.

   IT NO LONGER CLOTHES THE HOME PAGE, which is the one change to the note
   above and the reason this role now lives on index pages only. The three home
   bands wear `bandHeading` (the cover line, 40 → 88px). This is still the
   right size HERE, and the reason is the outline rather than taste: both index
   pages open with their own `h1` — 48px on /explorations, 32 → 60px on /work —
   and an `h2` at 88px under either of them is an inverted outline rather than
   a chapter break. A band name can be the loudest thing on its page because
   the bands ARE the page's structure; a shelf heading sits under a title that
   has already named the whole page.

   TWO PAGES NOW SAY "Selected work" AT DIFFERENT SIZES, recorded because it
   looks like a bug and is not: on `/` it is a chapter break at 88px, on /work
   it is a shelf heading at 36px under that page's own opening statement. If
   the two ever need to converge, move /work's `h1` first — the heading under
   it cannot lead. */
export const galleryHeading =
  "font-heading text-3xl font-medium tracking-[-0.015em] md:text-4xl";

/* The home page's band name (40 → 88px) — "Selected work", "Explorations",
   "Substack", and any future peer that opens a band on `/`.

   IT IS THE CASE-STUDY COVER'S OWN LINE (owner's call, Aug 2026): "the
   selected work explorations and writing take on the size of project titles
   like Funding Finder in the first section of case study". Both are the name
   of a whole thing, set as the opening of the surface it names, so they are
   one role — `.type-cover`, assembled in globals.css from `--type-cover-*` in
   theme.css, which carries every value and the record of what this replaced.
   The only thing not shared is the ink: a cover sets on the dark leaf plate,
   a band name on the home page's light ruled sheet, so this token carries no
   colour and the call site sets `text-foreground`.

   IT IS 3.7× THE CARDS UNDER IT AT DESKTOP, and that is the point rather than
   an oversight. The band names are the home page's chapter breaks — the walk
   ends, and three named divisions follow it — so they are read as structure
   and the windows under them as content. It is also a change of FAMILY: this
   is the editorial voice (semibold, -0.03em) standing over card titles that
   stay in the gallery's (`font-medium`, -0.015em), which is what stops the
   size step reading as the same object shouted.

   WHAT IT REPLACED, kept because the failure is the useful part. The band
   names were first typeset from the /world glass pane — same face, same 600,
   same -0.02em, same 30 → 36px — on the argument that a reader meets the pane
   and the bands on one scroll. It measured identical and did not look it (the
   pane's ramp floors at 24px for its panel's sake; the display face has no 600
   of its own, so the bands jumped from the regular file to the bold one while
   the pane did not move). A relationship that is obviously a different size
   reads as a hierarchy; one that is almost-but-not-quite the same reads as a
   mistake.

   NOT FOR /work OR /explorations — see `galleryHeading` directly above for
   why, before reaching for this on an index page. */
export const bandHeading = "type-cover";

/* A project card's title (30px, flat) — the largest type in the gallery voice
   and the home grid's real content. `leading-[1.02]` is tight because these
   wrap to two or three lines inside a fixed plate and must not blow the box
   floor the row is aligned to.

   IT WAS PINNED TO 30px TO MATCH THE WORLD PANE, AND THE PANE HAS SINCE MOVED.
   THE RHYME IS BROKEN AND THIS IS A NOTE, NOT A DECISION. The `sm:text-4xl`
   step was dropped from this token because the walk's chapter titles capped at
   1.875rem on desktop and a 36px card read a full step louder than the pane it
   was supposed to answer. That cap is `2.25rem` now (world.css, THE PANE'S TYPE
   ROLES — the owner asked for a bigger chapter line twice and settled on
   `text-4xl`), so the two are a step APART again, in the other direction: the
   pane reaches 36px from about 1442px of width and the card holds 30.

   WHAT RESTORING IT WOULD TAKE is putting the step back — `text-3xl` →
   `text-4xl` at the desktop breakpoint, which is the same 36px the pane now
   caps at. THAT IS THE OWNER'S CALL AND IT IS NOT MADE HERE. The cards are a
   different surface from the walk, they sit in a grid of identical windows
   rather than alone on a panel, and `cardHeading` below already took the home
   grid's own titles DOWN to 24px for reasons that have nothing to do with the
   pane. Whether the rhyme is still worth having is a composition question, not
   an arithmetic one.

   NOT MIRRORED AS A CLAMP, deliberately, and that half still holds. The pane's
   desktop ramp starts at 24px at 861 and climbs — it gets SMALLER as the layout
   widens into its two-plate form, because the panel is narrowing at the same
   time. A card has no such moment, so copying the curve would import an
   inversion that only makes sense over there. If the rhyme is ever restored it
   is the pane's CEILING that is matched, never its curve.

   LoFiProjectCard's animated outcome figure quotes this token rather than
   re-specifying it: same face, step, weight, leading, and tracking, so the
   title→figure dissolve swaps like for like and stays locked if this moves. */
export const projectCardHeading =
  "font-heading text-3xl font-medium leading-[1.02] tracking-[-0.015em]";

/* An article card's title (20 → 24px) — one step down from a project card's,
   because an article title is a sentence (the longest here runs 46 characters)
   and at the project step on a 10ch measure it wraps to five lines, breaks the
   box floor, and stops reading as a name. Stepping down and opening the measure
   to 20ch is the same decision the scale makes everywhere: display type is
   sized to its content, not to its slot. Both land inside the shared floor, so
   the two kinds of card still line up across a row. */
export const articleCardHeading =
  "font-heading text-xl font-medium leading-[1.15] tracking-[-0.01em] sm:text-2xl";

/* THE ONE TITLE A CARD IN THE HOME GRID WEARS (24px, flat) — used by
   `DesktopProjectCard` for a project and an article alike, which is the whole
   point of it. The two roles above are still correct on the surfaces that show
   one kind at a time; this grid shows both kinds side by side in identical
   windows, and a project title set a step above the essay beside it read as two
   sizes of the same thing rather than as two kinds of thing. The window's title
   bar already says which is which.

   24px IS THE STEP BETWEEN THE TWO IT REPLACES — one below the project card's
   30px, level with the article card's desktop size, and the only standard rung
   in that gap (§4 keeps the site on the Tailwind scale, so 27px is not
   available and is not worth a carve-out). It also holds a 46-character essay
   title to three lines on a phone-width card, which is what stopped the project
   step from being usable for both.

   IT NOW SITS TWO STEPS UNDER `galleryHeading` (36px at desktop) rather than
   level with it. That is deliberate and was asked for in two halves — titles
   down, then rubric up — so the band opens on its name and the windows under it
   read as a set of objects rather than as a stack of headings. */
export const cardHeading =
  "font-heading text-2xl font-medium leading-[1.08] tracking-[-0.015em]";

/* A writing-index row title (18 → 20px) — the deepest rung of the gallery
   voice, worn by each entry in the list of articles beside the cards. Sits
   clearly below `articleCardHeading` so a listed article never draws level with
   a carded one. */
export const indexItemHeading =
  "font-heading text-lg font-medium leading-snug tracking-[-0.01em] md:text-xl";
