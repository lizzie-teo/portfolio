# Portfolio styling and responsive rules

These rules apply to every page and component in the portfolio. They are adapted from the supplied Figma-to-React checklist for this portfolio's editorial, motion-led experience and the Clean Look shadcn theme system.

## 1. Mobile-first is mandatory

- Write the small-screen layout first, then add `md:`, `lg:`, and `xl:` enhancements.
- Every component must work at 320px without horizontal page overflow, clipped controls, overlapping text, or inaccessible content.
- Responsive behaviour is part of the component definition, not a later page-level patch.
- Do not reproduce desktop compositions at a smaller scale. Recompose hierarchy, order, navigation, media, and motion for touch screens.

### Mobile-first responsive checklist

- ✅ Breakpoints: `md:`, `lg:`, `xl:`
- ✅ Touch targets: min 44px (`h-12`)
- ✅ Scale typography: `text-2xl md:text-3xl lg:text-4xl`
- ✅ Scale spacing: `px-4 md:px-8 lg:px-12 xl:px-60`
- ✅ Constrain text: `max-w-prose`

### Validation widths

At minimum, verify pages at:

- 320px: narrow mobile
- 375px: common mobile
- 640px: large mobile / `sm:` boundary
- 768px: tablet
- 1024px: compact desktop
- 1440px: standard large desktop
- 1920px: wide desktop sanity check

Also test content resilience with long titles, multi-line labels, missing optional metadata, and portrait as well as landscape images.

## 2. Breakpoints and progressive scaling

Use Tailwind's configured breakpoints consistently:

- Base: mobile
- `sm:`: large mobile, 640px+
- `md:`: tablet, 768px+
- `lg:`: desktop, 1024px+
- `xl:`: large desktop, 1280px+
- `2xl:`: wide desktop, 1536px+

Scale spacing and typography progressively. Avoid abrupt jumps from cramped mobile layouts to oversized desktop layouts.

Spacing always comes from the theme: use Tailwind's spacing scale (`p-4`, `gap-6`, `py-12`, …), made responsive with breakpoint prefixes. Never write arbitrary spacing values (`p-[22px]`, `p-[6.8cqw]`, `mt-[1.3rem]`) — if no step on the scale fits, pick the nearest step rather than inventing a value. Fluid `clamp()`/container-query sizing is reserved for display typography and cover artwork, not component padding or gaps.

Recommended starting patterns:

- Page gutters: `px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24`
- Vertical section spacing: `py-12 md:py-16 lg:py-24 xl:py-32`
- Content gaps: `gap-6 md:gap-8 lg:gap-12 xl:gap-16`
- Compact component padding: `p-4 md:p-6`
- Feature-panel padding: `p-5 md:p-8 lg:p-12 xl:p-16`

Page-level gutters, section spacing, and content gaps should keep scaling through `xl:` and `2xl:` — the editorial direction in section 3 calls for a confident, spacious desktop feel, not a layout that plateaus the moment it clears `lg:`. Compact component padding is the deliberate exception: it sizes small in-page elements (chips, inline controls), not page-level breathing room, so it stops scaling at `md:`.

Use a centred maximum-width container for reading and alignment. Full-bleed project imagery may leave the container intentionally, but text should retain readable gutters.

## 3. Theme tokens — neutral shell, project colour

Define brand and semantic tokens in `src/app/theme.css`. `src/app/globals.css` is shared infrastructure: it imports Tailwind, shadcn, animation helpers, `theme.css`, and maps CSS variables into Tailwind's `@theme inline` layer.

The portfolio uses two theming layers:

1. **Neutral shell.** The default `:root` theme is quiet and mostly off-white: warm charcoal text, ink interaction states, warm-neutral surface tints, whisper hairlines. The home page, header, footer, and all shared chrome stay on those neutral **tokens**; no product or brand hue is ever tokenised there. Brand colour does reach the home page, but only as artwork a card paints on hover, never as a token the shell adopts — the distinction is drawn under "Rules for project colour" below.
2. **Project colour.** Each case study picks up its product's own colour when the reader enters it. `CaseStudyShell` stamps `data-project-theme="<slug>"` on its root, and a matching scope in `theme.css` re-tints a fixed contract of semantic tokens with the product's brand hue. Components never change: they keep using the same semantic roles, and the scope recolours them.

### Neutral shell palette

- Background: soft off-white `#FEFEFC` for the page shell.
- Card: pure white `#FFFFFF` so lifted panels pop slightly off the page.
- Secondary: warm-neutral panel tint `#F2F0EB` for project thumbnails, tag chips, and large quiet surfaces, with deep warm-grey text `#55504A`.
- Muted: warm-neutral wash `#F5F3EF`, the quietest surface, for recessed areas and empty states.
- Accent: warm-neutral tint `#ECE9E3` for hover and focus surfaces, with deep text `#4A453E`.
- Foreground: charcoal `#3A3733` for primary text, including headings and all narrative body copy.
- Muted foreground: warm grey `#6B6459` for short secondary text only: taglines, captions, timestamps, labels, and figure legends. It is too light for sustained reading and must never style narrative body paragraphs.
- Primary: ink `#2A2724` for CTAs, selected states, labels, selection, and strong interaction cues.
- Border/input: whisper-warm neutral hairline `#E7E3DD`.
- Rule: structural divider, `color-mix(in oklab, var(--foreground) 20%, transparent)` — diluted body ink, not a second border. See the border-versus-rule split below. It is a **shell constant that no project scope may retint**, and it sits deliberately below WCAG 1.4.11 (§12). The 20% is not a free choice: it is the value `IaFlow` already draws its connector lines at (`bg-foreground/20`), so the diagram modules of a case study share one line language.
- Ring/focus: ink focus ring from `--ring`, matching primary.

### Project theme contract

A `[data-project-theme="<slug>"]` scope may override only these tokens:

- `--background`: a whisper tint of the brand hue, near-white — the page should read as "this product's air", not a coloured poster.
- `--card` (optional): the reading-tile surface. Only re-tint it when the default pure-white card glares against the case study's own dark immersive bands (deep leaf/grout sections) — softening it removes the harsh white-on-dark seam. Keep it near-white: hold lightness high (about 2–3% off white, no lower) and carry only a whisper of the brand hue so it reads as soft tinted paper, never a neutral grey (which reads dirty) and never a saturated tint. Keep it a step above `--background` so cards still lift off the page rather than blending in, and re-verify text contrast on the softened surface (see the reading-surface rule below). Precedent: Healthdirect softened `--card` from `#FFFFFF` to `oklch(0.98 0.003 200)` (#F6F9F9).
- `--primary` and `--ring`: the brand hue, deepened until it clears 4.5:1 against white. This recolours eyebrows, links, selection, CTAs, and focus.
- `--accent` / `--accent-foreground` and `--secondary` / `--secondary-foreground`: brand-tinted hover surfaces and quiet panels.
- `--border` / `--input`: a brand-warmed hairline. Decorative only (see the border-versus-rule split below), so it is contrast-exempt and may be as light as the scope likes.
- `--heading` (optional): the ink of in-flow section headings (`sectionHeading`) on light reading surfaces. It defaults to `--foreground`, and a scope may set it to the deepest tone of the brand — typically the same value as its own `--leaf` or `--grout`, so the light tiles' titles are set in the material of the dark plates between them. Headings only: body copy, ledes, and captions stay on the neutral ink, which is what keeps this from colouring the reading experience. Whatever the scope sets must clear the §4 bar as large text on both `--card` and `--background`, with the ratio recorded in a comment. Headings on dark surfaces (`leafHeading`, a dark-tone `FeatureChips` band) are out of scope — they carry `--leaf-foreground`. Precedent: Healthdirect sets `--heading: var(--grout)` (#10262f, 14.7:1 on the card).
- `--chart-1` through `--chart-5` if the case study charts data.
- Project-specific module tokens (e.g. the Healthdirect journey-map pastels), named with a clear project prefix and defined inside the scope, never in `:root`.

Rules for project colour:

- `--foreground`, `--muted-foreground`, `--rule`, and shadows stay neutral. The product colour frames the page; it never colours narrative reading text. `--rule` is on that list for a second reason beyond reading comfort: the same structural treatment has to read *identically* across every case study, so a diagram rule is a fixed piece of the portfolio's own language rather than something each product recolours. A teal-cooled rule was built for Healthdirect and then removed for exactly this — it looked right on that page and would have meant re-deriving the value, and the contrast argument, once per project. It is derived as `color-mix(in oklab, var(--foreground) 36%, transparent)` rather than picked as a hex, which makes the neutrality structural: `--foreground` is already neutral in every scope by contract, and mixing toward `transparent` lets one declaration serve light and dark and recompose correctly against whatever surface it lands on. A rule can therefore only ever be wrong somewhere the body ink is already wrong. The percentage is also shared rather than invented: `IaFlow` draws its connector stems and fork bars at `foreground/20`, Tailwind's opacity modifier compiles to the same `color-mix`, so `--rule` and the IA flow's lines are one declaration written twice — one line language for every diagram on a page. If `IaFlow`'s connector colour ever moves, move this with it. (Its node *outlines* are `foreground/30` and its dashed modal outline is `/35`; those are different roles and are not the reference.) Section headings are the one place a scope may carry the brand tone onto a light reading surface (`--heading` above) — a title is a landmark, not reading copy, and the paragraph under it stays neutral ink. Reading surfaces stay white or near-white: `--card` defaults to pure white and may only be softened within the bounds above — a whisper of hue at near-white lightness, never a grey or a saturated tint. Whenever `--card` is re-tinted, re-verify body ink (`--foreground`) and any on-card `--primary` still clear WCAG AA on the new surface and record the ratio in a comment (Healthdirect: foreground 11.2:1, primary 4.6:1 on #F6F9F9).
- Sample the brand hue from real product assets (logo SVG fills, brand marks), not from memory. Where the raw hue fails WCAG AA as text or a fill, deepen the token and record the contrast ratio in a comment; the raw hue may only appear in imagery or large decorative media.
- Never hardcode a project colour in JSX. Components use semantic roles; the scope supplies the hue. If a case-study module needs a colour the contract does not cover, add a prefixed module token to its scope.
- **The home page carries no project colour at all, on either side of a hover.** `FloppyProjectCard` is a grey line drawing at rest and developed; its reveal is a change of value, not of hue. Token theming waits entirely for the case study — entering it is what re-tints `--primary`, `--border`, the surfaces, and everything else in the contract above. *Amended August 2026: this rule used to read "a home card rests neutral and the product's colour arrives on hover", and described the disk developing into a per-project pastel shell derived from the world-scene accents. Two passes of that treatment were built and both were rejected on sight — first as dusty equal-luminance mid-tones, then as pastel at all — and the card is now a grey outline drawing with no fill to flood. The carve-out it relied on (brand hue as an artwork scene constant a card may paint) still stands and is still how animated covers work; it simply has no consumer on the home grid any more.*
- A case study without a scope simply renders on the neutral shell — project themes are opt-in per project.
- To add one: extract the brand hue from assets, derive the deepened primary plus tint set, verify contrast (4.5:1 for text tokens on their surfaces), and add the scope in `theme.css` under PROJECT THEMES.

General token rules:

- Components should use semantic roles such as background, foreground, muted, accent, focus, border, and surface rather than repeating raw colour values. Raw palette values belong in the token definition only.
- Do not introduce arbitrary colour utilities or inline hex values in components.
- Do not use decorative gradients, neon accents, or heavy colour blocking in the portfolio shell.
- **Artwork scene constants** are the one carve-out to the two rules above, and only inside artwork. The colour values that compose an animated cover or a card field (bloom hues, wash grounds, shader palettes) live in a dedicated module beside the artwork, not in `theme.css` and not inline in a component. Each value documents its derivation: the source hue it came from, the harmony that produced it, and the measured contrast against any ink it carries. The dominant colour of a project's artwork is that project's primary theme colour; supporting colours are derived from it by a stated harmony (triadic or complementary), so a card reads as its project at a glance rather than as a free composition. These constants are never referenced as UI colour, never become tokens, and never enter `theme.css`. See `cover-effects.md`, which already applies this to animated covers.
- **The home grid is an index whose information is typographic, drawn in line.** Each card is a `FloppyProjectCard`: a technical OUTLINE of a 3.5" disk, lying directly on the light `bg-secondary` band with no card plate under it, carrying the project's title and tagline as real HTML text on its sticker. Four lines and two of type — the chamfered body, the shutter, the window it uncovers, the sticker — and nothing else. Rules that bind:
  - **Grey line, one weight, at every size.** `vector-effect="non-scaling-stroke"` at `1.25px`, round joins and caps, so a 251px card and a 443px card draw the same line. The stroke is grey and stays grey in both states (`#7D7A76` at rest, 3.75:1 on the band; `#4A4743` developed, 8.11:1) — never an ink-black technical pen, because the type carries the information and a drawing that outshouts its own label is how three earlier versions of this card failed. Values and derivations live in `floppyInk.ts` as scene constants.
  - **It is a drafting line, not a sketch.** Geometric arcs, consistent joins, hidden lines removed by opaque fills in the band's own colour. Hand-drawn or roughened line work was tried on the case-study rail and killed after crit; do not bring it back here.
  - **The hover is a develop, and it has no colour.** The grey line darkens one step, the shutter slides so one rectangle becomes two, the sticker gains a white paper fill, and the tagline inks from quiet to full ink. Everything is legible before any of it runs.
  - **The hero and the grid are deliberately the two drawings of one object.** `WorldGlassCard` moulds the disk in tonal plates with a bevel instead of an outline; the grid draws its outline. The hero is the thing, the grid is the record of it. Do not converge them.
  - **No product imagery appears on the card.** A case study may still preserve its own native product, brand, or campaign visual language inside the portfolio frame.

  *Amended August 2026, three times, and the history is the rule. (1) This read "the home grid is typographic, not pictorial" and described `LoFiProjectCard`'s flat paper plate; the disk shelf keeps that intent while letting the grid complete the hero disk's insert-into-the-shelf narrative. (2) The disk shipped with eight forms, a ROLE / YEAR / OUTCOME field table under a hairline, and a per-project pastel shell flooding the plastic on hover; all three were cut for reading as an archival diagram of a floppy with a half-filled form on it. (3) The reduced tonal version was cut too, for the same underlying reason: any plate-and-bevel disk in this grid reads as a miniature of the hero rather than as an index of work. The line drawing is the answer to that, not a style preference — the minimum set of marks that still says "3.5 inch disk" is the rule, not the maximum set that is accurate.*
- Do not use `text-accent` for important labels. In this theme, `--accent` is a pale surface token; use `text-primary` or `text-muted-foreground` for readable text.
- Any new colour or global token must be added to `src/app/theme.css` first, then exposed through `src/app/globals.css` if Tailwind utilities are needed.

### Clean surface rules

- Page sections use `bg-background`, except where a section needs to read as a different plane rather than a different area of the same one. The home page is the worked case: the garden flight paints its own `--sw-paper` (#F6F3EC) across the top of the page, and the work section under it is a full-bleed `bg-secondary` band. `--secondary` (#F2F0EB) is within 1.02:1 of the flight's paper, so the handover lands on a continuation of the same warm surface rather than a seam between two whites; `bg-background` (#FEFEFC) is a cooler near-white and would draw that seam. No hairline at either edge — the flight dissolving is the transition. *Amended August 2026: this band was a full-bleed `bg-grout text-grout-foreground` plane, chosen when the grid held dark card plates carrying light line work (one step deeper than the leaf ink, the plane-and-tile relationship the case studies run on). The grid now holds monochrome tonal disks whose own ladder runs from paper to near-black, and an object like that needs paper under it rather than a second dark plane competing with its darkest note. Two consequences to keep together: anything rendering inside the band takes semantic shell tokens rather than a dark artwork module, and small supporting text on this surface takes `--secondary-foreground` (7.00:1) not `--muted-foreground` (5.13:1 here, under the small-text bar). `LoFiProjectCard` and `loFiInk` are still dark-ground components; reverting the grid to them means taking the band back to grout with it.*
- **A tonal step is the edge; do not draw a rule as well.** Where a full-bleed band changes colour against the page, `border-y border-border` adds nothing at the seam and shows itself the moment the neighbouring section inverts, reading as a stray line across the page. Hairlines are for dividing content that shares a surface — unless the step is content dependent and can fall to nothing (a bar whose ground depends on what a film or image happens to be showing underneath it), in which case the rule is the guarantee and the step is the bonus.
- Repeated UI and panels use `bg-card border border-border shadow-card`.
- **A border seals an edge; a rule carries meaning. They are two tokens.** `border-border` is the container hairline — a tile edge, an image frame, an input outline. It is decoration sitting where the eye already reads a boundary (`shadow-card` and the surface change do the real work), so it is exempt from WCAG 1.4.11 and stays a whisper; darkening it is what turns an editorial tile into a boxed-in one. `border-rule` is the line *inside* a diagram that a reader needs in order to parse it — a column-header underline, a row rule in a matrix, a stacked-list stage separator, a quote bar. Those are graphical objects needed to understand content, which WCAG 1.4.11 would put at **3:1** — but this site's `--rule` sits below that by a deliberate, owner-chosen exception; read §12 before touching the value.

  Reach for `border-rule` by asking what the line is doing, not where it sits: if removing it would leave the content ambiguous, it is a rule.

  **When a structural rule reads too heavy, reach for its extent before its contrast.** Shorten it, or drop a redundant one where spacing and a heading already carry the division — those cost nothing in legibility, and lightening does. That is an ordering, not a prohibition: contrast was in the end the lever the owner chose, twice, and pretending otherwise would leave this document contradicting the token it describes. What the ordering protects against is reaching for the dimmer first *by reflex*, which is how these lines got to 1.11:1 and invisible in the first place. If contrast is the lever, the cost is real and the floor below is what bounds it.

  **Match an existing line before inventing a value.** The strongest argument for where `--rule` sits is not a ratio, it is that the same page already draws lines: `IaFlow`'s connectors. Two diagram modules a reader meets minutes apart should not be drawn in two different greys, and "matches the diagram next to it" beats any value derived in isolation. Where a page has no such precedent, that is when the worst-case check below is the only guide.

  **The floor is legibility on the worst case, not a ratio.** For `--rule` that worst case is `JourneyMap`'s mobile stage separator at 320px: the only structural mark on the narrow layout, with no heading weight or surface change carrying the division beside it. Check that line before lowering the token, and note that a rule's legibility is not contrast alone — that separator survives well under 2:1 partly because it runs the full tile width in clear space, where a short rule at the same value would not. Worked case: `JourneyMap` and `LandscapeReview` in the Healthdirect case study, where the tile edge and the Ada image frame stayed on `border-border` and every grid rule moved to `border-rule`.

  **Colour is only half of a line's weight; stroke width is the other half.** `IaFlow` draws at `1.5px`, every `border-rule` draws at `1px`, so a rule reads a shade lighter than the connector it is matched to even though the declared colour is identical. Verified at 320 through 1440: close enough that the two modules read as one language, and the difference partly compensates itself (the rules are long horizontal runs in clear space, the connectors are short verticals that need the extra half pixel). Do not "fix" the gap by darkening the colour — if the two ever need to match exactly, take the rules to `1.5px` and leave the token alone.
- Where a panel is a quiet empty surface rather than a card of content, use `bg-secondary border border-border shadow-card` so it reads one step softer than the page. This is not the home grid's pattern: those cards carry no imagery to be missing (see the note on the typographic grid below).
- Hover lift may transition from `shadow-card` to `shadow-elevated`.
- Secondary text uses `text-muted-foreground`, not `text-muted`.
- Narrative body copy (multi-sentence paragraphs, list prose, case-study reading text at `text-base` or larger) uses `text-foreground`. Reserve `text-muted-foreground` for supporting text of a sentence or two: captions, taglines, legends, persona quotes, and panel descriptions at `text-sm` or smaller — and because that is small text, the muted tone must clear the 7:1 small-text bar in §4 on its surface. The token clears it on `--background` and `--card` only; on `--secondary` and other tinted panels it measures 5.13:1, so small supporting text there takes `--secondary-foreground` (7.00:1) instead. Do not weaken the token back toward the AA floor. *(Qualified August 2026 when the home work band moved onto `--secondary` and the measurement surfaced.)*
- Category labels use `text-xs font-medium uppercase`, tracked from the display range in §4 (0.16em to 0.28em) rather than from `tracking-wide` — at 12px uppercase, Tailwind's 0.1em ceiling still reads as a solid block. Pick the value that separates the longest label in the set, and add the matching `text-indent` when the label is centred.
- Caption and eyebrow labels, the small uppercase tracked kickers that sit above or beside a value, figure, or artifact (a scorecard cell label, a persona kicker, a diagram group heading, a quote attribution), are surface aware. On a white or neutral surface they use dark grey ink at a slightly heavier weight than body labels, `text-foreground` at `font-semibold`, so the kicker reads as a firm quiet label rather than the accent. On a light accent tint (the brand tint surfaces such as `--secondary` or `--accent`, for example the mint `#e6f5f5` and `#ccecea` in the Healthdirect scope) the label takes the darkest tone of that accent as its text, `text-accent-foreground`, so it belongs to the surface it sits on. Contrast is the guardrail: every caption must clear WCAG AA on its surface (charcoal on white is about 11:1; `#006f69` on the mint tints is 4.8:1 to 5.4:1), and where the darkest accent tone would still fail on a given surface, such as a dark leaf or grout band, keep that instance on the readable on-surface token (`--leaf-foreground`, `--grout-foreground`, or `text-muted-foreground`) and record the ratio. This is the caption or eyebrow role only. Longer caption prose, a sentence or two of figure legend or panel description, and functional diagram annotations such as flow edge labels stay on `text-muted-foreground`.
- Shadows must use the theme custom properties via Tailwind utilities such as `shadow-card`, `shadow-bubble`, and `shadow-elevated`; avoid hardcoded Tailwind `shadow-lg` or `shadow-xl`.
- Use `rounded-xl` for standard cards, `rounded-2xl` or `rounded-3xl` for large media containers, and `rounded-full` for chips or icon controls.
- When an icon stands in for a figure as a cell's dominant mark, such as the qualitative cells in a scorecard grid where there is no number, size it large so it carries the cell rather than reading as a small adornment: `size-12 md:size-14` at `strokeWidth={1.75}`. The measured figures in the same grid are set large too but a step below the icon, `text-4xl md:text-5xl`, so the number reads as the dominant mark without shouting. Both marks take the deep brand teal `text-leaf` (in the Healthdirect scope `--leaf` is `#183947`, 10.9:1 on the `bg-secondary` mint) — the darker counterpart to `--primary` for large marks, deep enough to clearly outweigh the small eyebrow label above. This is the paired scorecard rule: the criteria scorecard ("What success had to look like") and the outcome scorecard share one frame, so their icon and figure size and colour must stay matched. Small inline glyphs beside a label or in a control are a different role and keep their control-scale sizing (`size-4` to `size-5`).
- Stat or figure cells (the scorecard pattern: eyebrow label → dominant mark → supporting line) group their three parts top-down as one bonded unit, never bottom-anchored with `mt-auto`. Padding `p-6 md:p-8`; eyebrow-to-mark `mt-6 md:mt-8` (the dominant-mark separation, deliberately larger than the coupling gap so the eyebrow reads as a small kicker); mark-to-detail `gap-3` (tight coupling by proximity). With `auto-rows-fr` for equal heights, a cell's extra slack falls as trailing space below the detail line, never as an interior void between the eyebrow and the mark.
- The portfolio pairs two sans-serifs: the ITC Avant Garde Gothic design (served as TeX Gyre Adventor, loaded in `layout.tsx`) for headings and display type, and Geist for body copy, labels, and navigation. Avant Garde is display-only — its closed geometric forms fatigue at paragraph sizes — while Geist keeps sustained reading comfortable and the mood modern and editorial rather than vintage.

### Glass surfaces

Four surfaces in the site are glass, sharing three classes: the chapter dock as slab and resting spine (`.chapter-dock-glass`, `.chapter-dock-spine`, used by `ChapterDock` above `xl` and by `ChapterMarker` below it), and the artifact viewer's tour control chip (`.tour-glass-chip`). They share one idiom on purpose, so a page carrying more than one speaks a single floating-chrome language rather than several. Add a fourth only if it can take the same idiom; a glass surface with its own values reads as a mistake rather than a variant.

- **Derive every value from the scope's own tokens.** All of it is `color-mix` from the inherited `--leaf` and `--leaf-foreground`, so a project scope tints its own glass with no per-scope wiring and no new tokens. A `--dock-glass-*` token set was planned once and proved unnecessary. If a future surface needs something these tokens cannot express, that is the signal to add a token, not the moment to hardcode one.
- **Blur is the material, and it wants to be high.** More blur means a more legible foreground, not less. The slab runs `blur(22px)`, the chip `blur(18px)`, the resting spine `blur(14px)` because its footprint is too small to blur convincingly at slab strength. A typical card's 12px is too low here.
- **Saturate, or it goes grey.** Blur alone averages the backdrop toward grey, which is what makes a blur panel read as lifeless. `saturate(1.8)` on the slab and chip, `1.7` on the spine, restores the chroma. Every frost treatment rejected on this site was missing this.
- **Tint is a contrast tool, not decoration.** The instinct that glass should be barely tinted is right in general and wrong for these surfaces: white labels and the coral position pip have to hold over both a dark chapter leaf and a light content tile scrolling behind, and CSS cannot sample its backdrop the way a native adaptive material can. So the tint is engineered near opaque, `color-mix(in oklab, var(--leaf) 78%, transparent)` on the slab and chip and `74%` on the spine. Legibility over the lightest thing that can pass behind is the acceptance criterion and it is what sets the number. Do not lower it toward a clearer frost without first measuring the labels against a blurred light tile.
- **Give it thickness, feathered rather than crisp.** A lit top inner highlight and a soft outer shadow are what separate glass from a translucent rectangle, but a hard rim turns it into an outlined card. The shipped stack is a `158deg` sheen from `--leaf-foreground` at 15% falling to 4% by 24% and clear by 58%, a 1px border at 8%, an inset top catch (`inset 0 1.5px 2px -1px` at 26%), a denser pool of `--leaf` at the foot for volume, and `--shadow-elevated` lifting it off the ground. The foot pool is the only value that varies by surface: deep on the slab (`-26px 46px -30px`), shallow on the chip (`-8px 14px -8px`), absent on the spine.
- **Always ship the opaque fallback, and write it first.** The glass lives inside `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`. Declare the solid `--leaf` surface with `--shadow-elevated` as the base so an unsupported browser gets a legible surface rather than a transparent one.
- **The fallback needs a second trigger, and it is not built yet.** A user who has asked their operating system to reduce transparency must get the opaque surface too, which means re-asserting the fallback declarations inside `@media (prefers-reduced-transparency: reduce)` placed after the `@supports` block. `prefers-reduced-transparency` currently appears nowhere in the repo, so the dock, the mobile chapter marker, and the tour chip all render full blur regardless of that preference. Treat this as an open accessibility defect rather than a settled rule.

### Editorial agency direction

- The site should feel like a high-end digital agency portfolio: confident, spacious, precise, tactile, and quietly playful.
- Use oversized sans-serif typography, compact navigation, small uppercase section labels, large body copy, and generous whitespace.
- Prefer asymmetry and staggered alignments in display typography and section composition. The home project grid is the deliberate exception: cards share one aspect ratio and align their top edges per row, so the gallery reads as a calm, even plane against the expressive hero.
- Avoid decorative cards. Use cards only for project previews or repeated artefacts where the image/content itself is the object.
- Where a card does carry an image crop, give it a large corner radius and a crisp crop. Avoid heavy shadows; separation should come from scale, crop, spacing, and thin borders. The home grid does not carry one — see the typographic-grid note in §3 — so its cards earn their separation from the plate colour against the grout band and a `rounded-2xl` edge.
- Nav states should be thin underlines or precise text changes, not filled pills.

## 4. Typography and readable measure

> **Resolved sizes for every role, mobile through desktop, are tabulated in `.docs/type-scale.md`.** Read that for "what size is this"; read this section for why.

- Establish display, heading, body, label, and metadata roles; do not select type sizes ad hoc per component. Type sizes come from the scale (Tailwind's `text-xs`/`text-sm`/… plus the project's named steps); do not write arbitrary sizes (`text-[13px]`, `text-[0.72rem]`) — the same spirit as the §2 spacing ban. If no step fits, add a named step, do not inline a value.
- Use the standard Tailwind type scale (`text-xs`, `text-sm`, `text-base`, …) only. Do not write arbitrary sizes (`text-[13px]`, `text-[0.72rem]`) and do not mint intermediate custom type-size tokens — if a size feels in-between, pick the nearest standard step. Compact labels, annotations, and subsection nav links use `text-sm`; uppercase category eyebrows use `text-xs` (see §3).
- **Letter-spacing is exempt from the standard-scale rule above**, which governs type size and spacing only. Tailwind's tracking scale tops out at `tracking-widest` (0.1em) and has no display-letterspacing steps, and 0.1em on a 12px uppercase colophon still reads as a solid block. Uppercase eyebrows, kickers, and colophons may set tracking directly in the range **0.16em to 0.28em**, choosing the value that separates the longest label in the set into words. Stay inside that range so it remains a bounded choice rather than a free value; lowercase type keeps the named tracking utilities. When a centred label is tracked, add a `text-indent` equal to the tracking: letter-spacing leaves a trailing space after the final letter that centring counts as ink, which hangs the label left of its axis.
- Body text is a primary reading role: it uses `text-foreground`, not a grey. Colour expresses the hierarchy between body copy and metadata; size and weight express the hierarchy between body copy and headings.
- Use responsive type scaling and comfortable line-height.
- Keep narrative body text near `max-w-prose`.
- Keep summaries deliberately shorter than process detail.
- Avoid long centred paragraphs; centre only short display copy.
- Prevent widows in prominent headings where practical, without inserting hard line breaks that fail responsively.
- **Small text needs more contrast, not less.** WCAG AA's 4.5:1 is a floor for body-size text; small type reads as washed out well before it technically fails that floor. Any text at `text-sm` (14px) or below that carries meaning — captions, figure legends, notes, eyebrows, metadata, tag and judgment labels — must clear **7:1 (AAA)** on its surface, not merely AA. Essential small copy uses `text-foreground` (about 11:1 on white). The quiet supporting tone for small text is `text-muted-foreground`, which is therefore itself held to **≥7:1 on every reading surface** (see §3) — it may never sit near the AA floor. Never carry small text in the brand `--primary` colour, `text-accent`, or any tint that lands below 7:1; mark a small emphasis with weight (`font-semibold`) plus a *decorative* primary bar or dot (a mark is contrast-exempt, tinted letters are not), never by colouring the letters themselves. Where a small-text colour is not the obvious foreground default, record the measured ratio in a comment. This supersedes any older guidance that sent small supporting text to the lightest grey: the tone stays "quiet", but quiet now means a darker grey that clears 7:1, not a pale one that merely clears AA.
- Metadata must remain legible and should not rely on cool grey at insufficient contrast.

### Display headline sizing

Hero and statement headlines are the one place where type size is a composition decision rather than a scale lookup. Four things set it, and only the last is a pixel number. Applies to `StatementHero` and any future full-width statement headline; ordinary section headings stay on their §4 roles.

- **Size to characters per line, not to a size step.** Display type wants roughly **20–40 characters per line**. Below ~20 it fragments into short stacked scraps; above ~45 it stops reading as a statement and starts reading as a large paragraph. Pick the size that puts the break where you want it, then read the step off the scale — never choose the step first and accept whatever break falls out.
- **Measure the column, not the viewport.** A headline inside a two-column hero grid is far narrower than the screen. `StatementHero`'s h1 column is about **530px at lg, 610px at xl, 710px at 2xl**, not the 1024/1280/1536 the breakpoint names suggest. Sizing against viewport width overshoots by a full step and fragments the headline. Check the actual column before choosing.
- **Ratio to adjacent body copy carries the weight.** The danger zone is **3–4:1** against the body text beside it: large enough to be a heading, not large enough to be a statement, so it reads as merely big. A statement hero wants **6:1 or more**. The contrast does the work, not the absolute size.
- **Leading and tracking tighten as size grows.** Display leading runs **0.95–1.06**, tightening at each step up; `tracking-tight` holds across the ladder. Avant Garde's tall x-height means short ascenders and descenders, so lines nest closer than a humanist face would allow — leading below 1.0 is available here and is not available everywhere. Leading may use arbitrary values (`leading-[0.95]`); it is not a type-size token and is not bound by the standard-scale rule above.

**The ladder must be monotonic.** Every breakpoint is larger than the one before it, with no skipped rung and no step down. A headline that shrinks at the widest breakpoint gives the largest screens the weakest hero, which is backwards; a skipped rung arrives with a lurch. Keep the ratio between steps in the **1.2–1.35** band. The current `StatementHero` ladder:

```
     text-4xl   36px
sm   text-5xl   48px   ×1.33
md   text-6xl   60px   ×1.25
lg   text-7xl   72px   ×1.20
xl   text-8xl   96px   ×1.33
2xl  text-9xl  128px   ×1.33
```

`text-9xl` is the top of the standard scale, so 2xl is the ceiling this approach can reach. Going past 128px on wide screens means a fluid `clamp()` on the single h1 — a deliberate carve-out to propose and justify, not a default. Do not mint custom size tokens to bridge the gap.

### Section heading + lede

Every case-study section that pairs a heading with a framing sentence or short intro paragraph beneath it (e.g. AI engine audit, Landscape review, Sketches, Usability testing) uses **one** treatment for that lede, so the heading→lede pairing never drifts in size, colour, measure, or the gap above it. Do not restyle it per module.

- Use the shared `sectionLede` token from `Chapter.tsx` — never hand-roll the lede's classes. It is `mt-3 max-w-prose text-base leading-relaxed text-foreground`. The `mt-3` (12px) is the space below the heading, kept deliberately tight so the lede reads as one unit with the heading above it.
- **Colour is full-strength `text-foreground`**, not a grey. The lede is primary reading copy (per §4), not muted metadata — the same reason body text stays foreground.
- **Size matches the case-study cover intro** (`CaseStudyShell` intro body): `text-base` with no desktop step-up. The lede must not be larger than the cover's own body copy.
- Apply the token to the single element that immediately follows the heading. Do not add a competing top margin on a wrapper — the `mt-3` gap lives in the token.
- **Gap below the pairing.** After the heading+lede block, the section's artifact or content sits below **one** shared gap, the `sectionContentGap` token from `Chapter.tsx` (`mt-10 md:mt-14`, i.e. 56px on desktop) — a deliberate pause, clearly wider than the gaps inside the diagram, so the heading→lede reads as finished and the artifact gets its own attention. Reference the token; never hand-set this gap per module, so it can't drift. It is theme-scale only (per §2 — 40/56px land exactly on `mt-10`/`mt-14`; never write `mt-[56px]`). Applies to every section that pairs a heading with a lede (ArtifactSection, EngineAudit, LandscapeReview). Chapter leaves are out of scope, as are the lede-exempt diagram modules below.
- **Diagram modules are exempt.** Where a heading is followed by a legend, persona card, or the diagram itself rather than a lede (JourneyMap / User journey, IaFlow / Information architecture), the lede rule and the gap rule above do not apply — those modules set their own gap after the heading.

## 5. Layout rules

- Prefer Grid and Flexbox with intrinsic sizing, `minmax()`, and sensible maximum widths.
- Avoid fixed component heights for text-bearing content.
- Avoid fixed widths except for deliberate icons, controls, and bounded media frames.
- Use `min-w-0` on flexible children that contain text or media.
- Preserve a clear reading order when multi-column desktop layouts collapse to one column.
- A component may change composition across breakpoints, but its content and meaning must remain available.

## 6. Images and case-study media

- Use `next/image` for responsive raster images unless an animation or technical constraint requires otherwise.
- Provide meaningful `alt` text for evidence-bearing images and `alt=""` for purely decorative media.
- Declare image dimensions or use a stable aspect-ratio container to prevent layout shift.
- Use `object-contain` for UI screenshots unless an intentional crop is part of the explanation.
- Use `object-cover` only where cropping cannot remove meaningful interface content.
- On mobile, replace unreadably scaled full interfaces with a focused crop, controlled horizontal gallery, or stacked detail sequence.
- Never require pinch-zoom to understand the primary design decision.
- Keep full-resolution masters outside the web asset folder; the repository holds web-ready assets.

## 7. Motion rules

- Animation is part of the product experience, not decoration. Motion must reveal hierarchy, focus attention, explain an interface, clarify navigation, or provide responsive feedback.
- Use Motion for React for element entry/exit, springs, gestures, scroll-triggered sequences, layout transitions, coordinated reveals, and any conditional UI that appears or disappears.
- Import Motion from the current package: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`.
- Use CSS transitions for colour, border, focus-ring, and shadow changes. A CSS `transition-transform` is also allowed for a hairline hover affordance on chrome that is otherwise static — a rule drawing itself under a link, and nothing larger. The masthead's `underlineSegment` (`SiteHeader`) is the precedent: it scales a 1px segment from `scale-x-0`, and the Tailwind duration and easing utilities it uses are literally the `fast`/`instant` and `out`/`in` values in `motion.ts`, so the two stay in step without mirroring the tokens into CSS. The condition is that the element is not already a Motion component and the movement is a single sub-pixel-scale draw; anything with state, interruption, or exit belongs in Motion. Do not use CSS keyframes for product UI motion.
- Avoid scroll-jacking and forced scroll snapping.
- Every motion component must provide a useful static state.
- Respect `prefers-reduced-motion`; remove non-essential movement and shorten necessary transitions.
- Do not autoplay long sequences that block reading or interaction.
- Avoid animating expensive layout properties when transforms and opacity can express the same result.
- Motion should feel premium, responsive, and confident: quick fade-up reveals, subtle card lift, clear enter/exit, and explanatory case-study sequences.
- Use ease-out timing for entries and avoid ease-in for elements entering the screen.
- Smooth or inertial scrolling must preserve native browser behavior, anchors, history, keyboard navigation, and reduced-motion preferences.
- UI responses should complete within 300ms. Longer motion is reserved for page transitions, hero reveals, and onboarding-like explanatory sequences.

### Motion decision principles

Adopted from the publicly documented practice of Emil Kowalski, Jakub Krehel, and Jhey Tompkins (via `kylezantos/design-motion-principles`), kept only where they survive scrutiny and agree with this document. Where that source conflicts with these rules (duration ranges, spring usage, stylistic recipes like blur-on-enter), **this document wins** — it is the contract; external principles are reasoning aids.

- **Frequency gate.** Before animating, ask how often the interaction fires per visit. Rare, reader-initiated moments (artifact enlargement, hero reveal) may be expressive; repeated in-flow interactions (accordion, step controls, nav) stay at `fast` or instant; keyboard-initiated actions never animate.
- **Origin-aware motion.** Expansion and disclosure originate from their trigger, not from screen center — a shared-element morph or a matching `transform-origin`, so the motion itself explains where the new surface came from.
- **Exits are subtler than entries.** The user's attention has already moved on: less movement, shorter duration (`instant`), `ease.in`. Entries get the fuller treatment (`fast`, `ease.out`).
- **Interruptibility.** Anything the user can re-trigger rapidly must retarget mid-flight, not queue — test by clicking fast. (Motion handles this natively; another reason CSS keyframes are banned for product motion.)
- **Vestibular safety.** Large-scale zooms, spins, and parallax are vestibular triggers: under reduced motion they are removed entirely (not shortened), leaving an opacity-only change.
- **Motion is not information.** Any content revealed or explained by motion must also be reachable and readable without it (static captions, expanded states, focus-visible equivalents).

Use these shared tokens from `src/app/lib/motion.ts` rather than ad hoc timings:

| Token | Value | Use for |
| --- | --- | --- |
| `instant` | `100ms` | Hover fills, icon swaps, colour changes |
| `fast` | `200ms` | Element enter/exit, tooltips, badges, card reveals |
| `base` | `300ms` | Drawers, modals, tab switches |
| `slow` | `500ms` | Page transitions, hero reveals, onboarding/explanatory sequences |

Easing:

- `out`: `[0, 0, 0.2, 1]` for entering and settling; use this most often.
- `in`: `[0.4, 0, 1, 1]` for exiting.
- `inOut`: `[0.4, 0, 0.2, 1]` for repositioning.
- `spring`: `{ type: "spring", stiffness: 320, damping: 28 }` for interactive press/release only.
- `springMorph`: `{ type: "spring", visualDuration: 0.3, bounce: 0.25 }` for a `transition.layout` — an element changing size or position in place. It grows a touch past target and settles, or dips below and springs back, which is what makes a morph read as one object moving rather than two states swapped. The bounce is small and it resolves inside the interactive ceiling.
- `springMedia`: `{ type: "spring", visualDuration: 0.3, bounce: 0.18 }` for media entering alongside such a morph — a swapped-in screenshot sliding and scaling into place. It shares `springMorph`'s `visualDuration` so the media answers the morph in the same material, at a lower bounce because large imagery wobbles where a chip does not.

### Core patterns

- **Fade up** is the default for cards, list items, and content blocks: opacity from `0` to `1`, `y` from `10px` to `0`, duration `fast`, easing `out`.
- **Mask slip** (see `MaskReveal`) is the case study's typographic reveal: content slips up into place from behind a clip edge, the way a line of type is set rather than dropped on. Easing `out`, no opacity fade layered on (the clip does the reveal; fading as well makes it mushy). It exists to mark structure — before it, a section title wore the same fade-up as a bullet point. The gesture is therefore spent the moment it spreads: if body copy, captions, and every list row also slip, nothing reads as the heading any more.

  **The boundary is the masthead, not the heading tag.** A case-study hero is one typeset block, so everything standing in it slips together — the chip, the title, the tagline, the intro paragraphs, the meta labels and their rows — and it reads as the page being set rather than as five gestures competing. Once the reader is into the body, the mask belongs to headings alone: in-flow reading copy, captions, figure legends, and list items keep fade up. Ask which of the two a piece of text is standing in before reaching for a mask.

  Three modes, picked by what the content is, not by how important it feels:

  - **Word slip** — headings. `sectionHeading`-level titles at `fast`; a hero `h1` at `slow`, which is the existing headline-word-reveal recipe (3-6 display words). The longest section heading on the site is six words and resolves in 0.45s.
  - **Line slip** — a display *sentence*: a chapter leaf lede (`Chapter`) or a hero tagline (`CaseStudyShell`). One mask per rendered line, `slow`, `0.05s` apart. Word by word is wrong at this length — a full sentence revealed word by word reads as a teleprompter and overruns the 1s display budget. Line mode costs a measure pass and a width-keyed resize observer, because a mask per line only works if the lines are known and they change on every rewrap. Key the re-measure off width alone: a leaf heading lives inside a `CollapsingLeaf` that resizes its content on every scroll frame, and observing height throws the heading back to its measure pass continuously as the reader scrolls. Line mode rebuilds text from plain strings, so it cannot carry inline markup — a paragraph with highlighted phrases has to use block mode.
  - **Block slip** — a unit that is not plain text: a chip, a paragraph with inline markup, a small label/value row. **Size is the constraint, and it is a hard one.** A mask moves its content by its own height, so a block slip is only a slip while the block is short. Mask a tall column and it travels hundreds of pixels, stops reading as type, and starts reading as a panel being pushed on screen — at which point it is also the kind of large-scale movement reduced motion exists for. Split a column into its paragraphs and slip each one; put anything taller than a few lines (a labelled group with its own list, a card) on fade up instead, where 10px is the right size of movement. **Interactive elements are excluded from block slip outright**: the mode's `clip-path` inset (~1px) is permanent — it is what makes the mask a mask — and the button primitive's focus ring stands 3px outside the border box, so a slipped control is a control whose keyboard focus indicator is shaved. Controls arrive on fade up (the home hero's pair is the precedent).

  The masks are `clip-path` rather than `overflow-hidden` wrappers: overflow needs padding to clear descenders plus a negative margin to undo it, and that pair shifts an inline-block word off its baseline, while clip-path clips without touching layout — and in word mode it lets the heading wrap naturally at every width with nothing to measure. The clip bleeds below the line to clear descenders; the value is tuned on screen and worth re-checking against any face or leading it was not measured on. The real element stays the outer node so `id` anchors and the ArrivalCue heading lookup are unaffected.

  **Split text must stay real text.** Do not pair `aria-hidden` fragments with an `sr-only` duplicate of the string — the obvious approach, and wrong. It fixes the accessible name and breaks everything that reads text content instead of the accessibility tree: copy-paste, find-in-page, and translation all return the heading twice ("My roleMy role"). Instead give every fragment its separating space as a real text node just outside its mask, so the element's text content is exactly the original string and the accessible name follows for free. Outside the mask, or the space is clipped along with the fragment and the words run together.

  The travel is the whole effect, so reduced motion removes it entirely rather than shortening it, degrading to the same instant opacity change as fade up.

  The case-study hero (`CaseStudyShell`) is where all three appear together, and it is the reference for how to mix them: chip block, title word, tagline line, intro paragraphs block one at a time, meta labels word, meta rows block. Each carries its own `delay` rather than sitting in one stagger container, because they occupy different grid cells.

  Where a labelled column is short — a label plus three or four one-line rows, like the hero's phase credits — mask it as one block so it arrives as a single card of type instead of ticking in row by row. Past that, slip the column by its parts instead: the label as a heading, each row as a row. The judgement is how far the block travels, so it is made by looking, not by counting children.

  It is also the one reveal on the site that re-plays rather than firing once per page load: a case study gets scrolled up and down, and a gesture that only ever fires on first pass is invisible to a reader scrolling back to re-read a section. That is affordable only because the slip is short and cheap — do not give the heavier fade-up reveals the same treatment, or the whole page turns restless.
- **Scale in** is for popovers, tooltips, menus, dropdowns, and modals: opacity from `0` to `1`, scale from `0.95` to `1`, duration `150-200ms`.
- **Slide in** is for drawers, sidebars, and bottom sheets: enter from the panel edge, duration `base`, easing `out`.
- **Layout changes** caused by state should use Motion's `layout` prop rather than manual dimension animation.
- **Shared-element expand** (see `ArtifactViewer`) is for enlarging evidence artifacts: the thumbnail and overlay share a `layoutId` so the card morphs from its own position (origin-aware), duration `base`, easing `inOut`. The morphing element carries no opacity initial/exit (only the backdrop fades — `fast`/`out` in, `instant`/`in` out) to avoid the layoutId + AnimatePresence double-animation artifact. The zoom is a vestibular trigger: under reduced motion drop the `layoutId` entirely and use a ~0.01s fade. Enlargement is inspection, not information — the caption must stay readable on the thumbnail.
- **Exit motion** must be explicit. Wrap conditional animated UI in `AnimatePresence`, use a stable key, and define an `exit` state.
- **Metric count-up** is mandatory for every displayed figure in a case study — scorecard cells, stat callouts, proof rows, any number the layout presents as a display mark. The figure counts from zero to its published value every time the reader scrolls it into view, re-arming when it leaves the viewport. Use the shared `CountUp` component (`src/app/components/CountUp.tsx`); never hand-roll a counter or render an in-flow display figure as static text. Details in Metric count-up below.

  **The rule is scoped to figures in the reading flow.** A number that is artwork inside a hover scene is a different object and may be hand-rolled, because `CountUp` is built for the opposite job: it is driven by scroll position and only ever runs forward, which is exactly wrong for a figure that has to retarget and reverse every time the pointer leaves and returns. `OutcomeFigure` in `LoFiProjectCard` is the documented exception — it counts on the card's hover payoff, reverses on hover out, and is `aria-hidden` because the link's accessible name already states the outcome as a static sentence. Before hand-rolling one, check that both conditions hold: it is artwork rather than evidence, and it needs behaviour `CountUp` cannot give it.

#### Metric count-up

- **Scope.** Figures the layout presents as evidence count up. Numbers inside reading copy do not — a lede that says "most of the 55% drop-off" stays static, because animating text mid-sentence fights reading, and the same number appearing twice with two behaviours reads as a bug.
- **Value strings keep their published formatting.** Pass the figure exactly as published — `"84%"`, `"60–70%"`, `"<20%"`, `"78%+"`, `"2M"`, `"2×"`, `"1,200"`. Every numeric run animates and everything else is carried through untouched. A range is one gesture: both numbers run off a single progress value so they land together rather than racing.
- **A value with no digits renders static.** `"AA"` is a legitimate target, not a failure case; it sits in the same cell frame at the same scale and simply does not move.
- **Timing** is `slow` (500ms) with `out` easing — an explanatory reveal, not a UI response, so it sits above the 300ms interactive ceiling deliberately. Do not stretch it further for drama; a figure that takes a second to resolve reads as a loading state.
- **The trigger sits well inside the viewport**, not at its edge: a `-25%` bottom margin on the in-view observer, so the figure must clear three quarters of the screen before it counts. Most case-study sections are immersive `CollapsingLeaf` surfaces that pin at the top and shrink, which means a figure crosses the screen's bottom edge roughly a full viewport of scroll before the section settles in front of the reader — an edge-triggered count is over before anyone is looking at it. If a metric ever sits somewhere it can never rise above 75% of the viewport, that placement is the bug, not the margin.
- **Every entry counts.** The observer is not `once`; leaving the viewport resets progress to zero while the figure is off-screen, so scrolling back to a section replays its count instead of showing an already-resolved number. The reset is never visible, because it only happens outside the trigger zone.
- **Stagger** follows the containing grid's own cell cadence (`delay={index * 0.05}`), so the counts arrive with their cells instead of forming a second, competing wave.
- **Layout must not reflow.** `CountUp` reserves the final value's width with a ghost copy and enforces `tabular-nums`, so an early `"0%"` frame never shifts neighbouring content. Callers pass type and colour classes only.
- **Accessibility.** The animating text is `aria-hidden` and the true value is exposed once, statically — screen readers hear "84%", never a stream of intermediate numbers, and a re-run on scroll back changes nothing they perceive. Under reduced motion the final value renders immediately with no movement, and never re-runs.

### Stagger budgets

Staggered reveals (lists, grids, headline words, anything with `staggerChildren`) don't share one fixed duration — different elements need different per-item timing. Instead of picking numbers ad hoc, derive them:

1. Pick the per-item duration from the Motion tokens table, matched to that element's own role (a card reveal uses `fast`; a hero headline word uses `slow`).
2. Set the stagger interval close to `0.05s`. Only raise it for large, low-count, spaced-out elements (e.g., 3-6 display words); never exceed `0.08s`.
3. Check the total cascade time — `(item count − 1) × interval + per-item duration` — against the ceiling for that context:
   - Interactive lists/grids (cards, nav items): keep total under `500ms`; content should feel present almost immediately.
   - Hero/display text (word-by-word headline reveals, explanatory sequences): keep total under `1s`; confident, not draggy.
4. Once a recipe is confirmed for a given element type, record it here so the next component reuses it instead of re-deriving from scratch:

| Pattern | Item duration | Interval | Total budget |
| --- | --- | --- | --- |
| List/grid stagger | `fast` (200ms) | `0.05s` | < 500ms |
| Title/headline word reveal | `slow` (500ms) | `0.05s` | < 1s |
| Section heading word slip (`MaskReveal`) | `fast` (200ms) | `0.05s` | < 500ms |
| Chapter leaf line slip (`MaskReveal`) | `slow` (500ms) | `0.05s` | < 1s |
| Masthead block slip (`MaskReveal` — chip, intro paragraph, meta row) | `fast` (200ms) | `0.05s` | < 500ms |
| Explanatory diagram stage reveal (see `IaFlow`) | `fast` (200ms) nodes, `base` (300ms) drawn connectors | `0.06s` | < 1s per stage |
| Grouped content reveal (`MotionRevealGroup` — bullet lists, card grids, roadmap) | `fast` (200ms) | `0.05s`, auto-tightened to `0.3 / (count − 1)` beyond 7 items | < 500ms |

### Reduced motion

- Use `useReducedMotion()` in Motion components.
- When reduced motion is requested, keep helpful opacity transitions but remove positional movement, scale, rotation, parallax, and springy cursor movement.
- Reduced-motion durations should be effectively instant, around `0.01s`.

### Motion checklist

- Does this motion communicate state, relationship, sequence, or focus?
- Does entry use `ease.out` and stay near `200ms`?
- Does exit use `ease.in`, with an `exit` state if the element is conditional?
- Are no more than two or three unrelated things moving at once?
- Is hover/press scoped to the interactive element, not the whole page?
- Has reduced motion been tested?
- If this shows a metric as a display figure, does it count up from zero via `CountUp` on every scroll into view?
- If this introduces a new staggered reveal, does it match an existing recipe in the Stagger budgets table, or has a new one been added there with its total cascade time checked against budget?

### Project cursor

- Render only on devices matching a fine pointer and hover capability.
- Never replace the only visible indication that a project card is interactive.
- Do not render on touch devices.
- Keyboard focus must produce an equally clear card state.
- Under reduced motion the cursor does not render at all. `ExploreCursor` gates on `(hover: hover) and (pointer: fine)` **and** the absence of a reduced-motion preference, and returns `null` when either fails. A magnetic follower is pointer movement made elastic, so there is no non-elastic version of it worth keeping — which is why the rule above holds: the card's own hover and focus states must already carry the affordance.
- The project cursor is a circular black follower/button with magnetic easing over project thumbnails. It should follow the pointer smoothly and settle with restrained elasticity.
- Avoid generic agency labels such as `Explore`. Use concise, portfolio-native labels like `View story`, `View path`, or project-specific verbs that make the interaction feel personal.
- Project hover motion may feel tactile and slightly squishy, but the project card must still read as a normal semantic link without the custom cursor.

### Explanatory UI motion

- Begin with the complete interface to establish context.
- Dim secondary regions without making the screenshot illegible.
- Highlight one decision at a time.
- Keep annotation text concise and readable independently of animation timing.
- On mobile, prefer tap-controlled or naturally stacked steps over pinned scroll sequences.

## 8. Interaction and touch

- Interactive targets must be at least 44 by 44 CSS pixels on touch devices.
- Hover may enhance an interaction but must never reveal essential content exclusively.
- Provide visible keyboard focus using the semantic focus token.
- Use semantic links for navigation and buttons for actions.
- Preserve expected browser behaviour for anchor links, back navigation, opening new tabs, and hash URLs.
- Do not place competing nested interactive elements inside a project-card link.

## 9. Sticky navigation

- Case-study navigation is anchored by five to seven chapters. On wide desktop it may add one level of subsection anchors beneath each chapter; never deeper than two levels, and never every heading.
- Chapters open on a dark leaf (`Chapter`): a full-screen title page in the `--leaf` / `--leaf-foreground` tokens holding only the small uppercase chapter title and its lede — the chapter's one speakable takeaway — like the dark divider page of a book. Leaves collapse rather than get covered (`CollapsingLeaf`): the leaf opens at `110svh` — a deliberate 10% overshoot past the fold, so on arrival the screen is all leaf and stays immersed a beat longer before the collapse becomes visible — and, as the reader scrolls on, pins at the top of the viewport and shrinks scroll-linked down to its natural title-and-lede height, its receding bottom edge tracking the incoming tile at the normal grout gap the whole way. The open-state content is optically centred within the first, visible `100svh` via a scroll-decaying lift (`marginBottom = openAmount * 10svh`, riding the same MotionValue) that reaches zero exactly as the leaf comes to rest, so the resting tile is pixel identical to a plain one. An outer wrapper reserves the full leaf height so page layout never jumps; the motion rides on a MotionValue (no per-frame React re-renders); scroll stays native — no snap points, no hijack. The case-study cover in `CaseStudyShell` shares the same behaviour with its natural content height as the floor (on small screens where content exceeds the viewport, the floor wins and the collapse quietly becomes a no-op). The collapse is a large scroll-linked resize — a vestibular trigger — so reduced motion removes it entirely: chapter leaves rest statically at full height, the cover at its natural height. Leaves are tiles like everything else: they keep the grid's side gutters and rounded corners and re-centre their content on the shell's container gutters; the floating rail overlays them. Leaf tokens live in `theme.css`: ink in the neutral shell, the project's brand hue pushed toward ink inside its scope (contrast with `--leaf-foreground` recorded at the token). Leaves carry no dividers and no numbering; a leaf's lede must be a conclusion, not a topic label, and jumping to a chapter anchor lands the reader on its full leaf as arrival feedback.
- Every anchor destination must render a visible heading whose text matches its nav link text exactly. Chapters do this via `Chapter`; subsection anchors use `ArtifactSection` (an unnumbered display title matching the link, wearing the shared `sectionHeading`, with its one-line takeaway as the subheading beneath) — except artifact modules that render their own card holder and internal section heading, which take the anchor `id` directly so the nav ties to that heading and no duplicate label sits above the holder. The heading level of every anchor destination follows the case-study heading hierarchy in §12: a section that reads as a top-level division is an `h2` (`ArtifactSection` takes `headingLevel={2}`), and a heading that nests inside a section steps down to `h3`. Never anchor to an unlabelled container.
- Anchor jumps land with a **coral arrival marker** (`ArrivalCue`), shell-level chrome so every case study inherits it. When the reader jumps from the rail, dock, or marker, `useAnchorScroll` fires a global `case:arrival` event once its glide settles, and the overlay answers with a single coral tick in the destination tile's left margin — the same `--rail-tile-active` accent as the nav's travelling "you are here" pip, now arrived at the content, so the navigation and its destination read as one motion system. It fires on nav jumps only, never on plain scroll-into-view. This portability rests on the visible-heading contract above: the marker top-aligns to the destination heading (`Chapter`'s `#<id>-heading`, or the module's leading `h2`/`h3`), and on a chapter title page it starts from the opening illustration plate that sits above the heading. A section that leads with a heading — i.e. follows the shell components — gets the cue correctly with no per-page wiring; one that anchors to an unlabelled container falls back to the tile top. The marker is decorative confirmation only (the scroll, hash, and focus move carry the real arrival), so under reduced motion it is removed entirely, not shortened.
- Wide desktop (`xl:` and up) uses the "On this page" rail (`CaseStudyRail`), a fixed overlay floating at the top right with scroll-spied `aria-current` states — it sits on the dark grout beside the content tiles, every tile drawn flat on the same plane (no shadow — one is invisible on the dark grout, and all-one-plane reads better). The rail floats visually but owns a dedicated lane: content containers widen their right gutter from `xl` up (`xl:pr-64 2xl:pr-72`) so no content ever runs beneath it. The rail is a stack of chapter blocks: every chapter is a rounded tile, and the chapter the reader is inside expands onto the `--rail-tile-active` pair (tile, foreground; the shell falls back to `--primary` / white), carrying its subsection links within it, while the rest sit collapsed as quick-jump tiles on the `--rail-tile` set (tile, foreground, hover, plus `--rail-tile-border`). Collapsed tiles are clean flat wireframes: no fill, a 1px `--rail-tile-border` hairline (the grout ink via `color-mix`) with the label in the same ink at the tile foot, taking a faint wash of that ink on hover — the open chapter is the single filled tile on the `--rail-tile-active` flood. Its height scales with content: a chapter with subsections expands taller to carry its links (label at the head), while a sectionless chapter keeps the collapsed tiles' exact geometry — same height, foot-anchored label — and changes only fill and ink, so it never opens an empty coloured belly and the label never jumps. Project scopes may re-tint the set — Healthdirect keeps the shell's white line work on its deep teal grout and floods the active tile coral `#e37778` with white labels. This is a deliberate, user-chosen exception to §12: white on this coral is 2.9:1 (below AA; the AA-passing grout-ink alternative was tried and rejected on looks). Keep the exception scoped to the rail's active tile — don't extend white-on-coral to body text or new components. Position is expressed by which block is open — no numbering, no progress hardware. The expansion is a repeated in-flow interaction: Motion layout animation at the `fast` token, opacity-only under reduced motion. Labels stay typographic and Title Case throughout — chapter anchor links and subsection links alike, each rendered as a semibold `h4`-wrapped link so it carries the display face (uppercase is reserved for the on-page chapter eyebrows, not navigation). Wayfinding numbers appear nowhere in headings or nav links — chapter arrival feedback is the leaf itself. This holds across every case-study nav surface: the wide-desktop rail, the auto-hiding `ChapterDock`, and the mobile `ChapterMarker` pill all carry the reader's position with the same coral "you are here" pip, never a counter. No numeric wayfinding appears anywhere in case-study navigation.
- Below `xl:`, the compact chapter control (`ChapterMarker`) takes over; its expanded menu shows the active chapter's subsections, and its collapsed pill shows the active subsection title when one is active. Do not run both at the same width.
- Mobile uses a compact current-section control or readable horizontal navigation.
- Sticky UI must not consume excessive mobile viewport height or cover anchored headings.
- Active sections use `aria-current="location"` where appropriate.
- Anchor navigation must move keyboard focus meaningfully, and it lands against the leaf pin line rather than a header offset. `SiteHeader` is a masthead in normal flow that scrolls away on every page except `/`, where the garden flight is the top of the document and the bar is fixed over it for the whole track; on the pages that matter here there is no sticky chrome to subtract. Chrome that stands over moving imagery carries a plate or adaptive ink — `tone="bare"` is only valid where a static surface is guaranteed behind the bar at every breakpoint (the flight earns it by stepping the film out from under the bar, not by laying anything over the artwork, and by fading an opaque plate up as the bands arrive); what does constrain the landing is `CollapsingLeaf`, whose target sits about 1cm above its pin line — cross that by a hair and the leaf pins flush and starts collapsing instead of resting. Because a long glide passes through sections that collapse and reveal on the way, a landing computed once at click time is stale on arrival, so `useAnchorScroll` recomputes the live target every frame and homes to it. Use that hook for every in-page jump rather than a fixed `scrollTo` with an offset constant. **An eased jump may never scrub a scroll-linked film.** Where a page carries a scrub track, glide across it and the reader watches the scenes run backwards at 15x, so the hook cuts to `behavior: "instant"` when a jump would scrub more than a viewport of film — it tests the `data-sw-scrub-track` element rather than the route, so short hops between bands below the track keep the eased landing. Any control that jumps in-page without the hook (an engine-built CTA, a skip cue) imports the same predicate rather than restating the rule.

## 10. Component system

Before creating a component:

1. Search the repository for an existing equivalent.
2. Use an existing local shadcn/ui primitive from `@/components/ui/*` when the need maps to a standard UI pattern.
3. Decide whether the need is a primitive, composed component, case-study module, or page section.
4. Reuse tokens and existing layout conventions.
5. Define mobile, tablet, desktop, keyboard, touch, and reduced-motion behaviour.
6. Keep content data separate from reusable presentation where doing so avoids duplicated markup.

### shadcn/ui usage

- Use local shadcn/ui components as the default primitive layer for reusable interface elements: cards, buttons, sheets, dialogs, accordions, tabs, tooltips, forms, separators, and similar standard patterns.
- Import shadcn primitives from `@/components/ui/*`; do not import directly from the registry or rebuild equivalent primitives by hand.
- Add new shadcn components through the configured shadcn CLI so generated files follow `components.json`, local aliases, and the shared `cn()` utility.
- Treat shadcn as structure and interaction infrastructure. Final styling should come from `src/app/theme.css`, semantic shadcn tokens, editorial spacing, typography, and motion rules.
- Project previews and future case-study modules may use shadcn primitives internally, but each project still keeps its own visual style inside the portfolio frame.
- Avoid default dashboard-like shadcn styling when it conflicts with the portfolio direction. Keep the shell minimal, monochrome, spacious, and image-led.
- When a shadcn component introduces new theme tokens, define values in `src/app/theme.css` and map them in `src/app/globals.css` before using them broadly.

## 11. Figma translation

When implementing from Figma:

1. Inspect variables and styles before individual frames.
2. Map Figma values to the existing semantic token system.
3. Search existing components before creating new ones.
4. Treat the supplied frame as one viewport example, not a fixed blueprint.
5. Infer and document responsive behaviour where Figma does not provide it.
6. Add new global tokens before using them in components.
7. Compare implementation against screenshots at relevant breakpoints.

Do not paste arbitrary Figma values directly into JSX or create a separate token vocabulary for each case study.

## 12. Accessibility acceptance criteria

Target WCAG 2.2 AA.

- All meaningful images have accurate alternatives.
- Icon-only controls have accessible names.
- Dynamic status changes use an appropriate live region only when necessary.
- Modals trap focus and return it to their trigger.
- Heading levels reflect document hierarchy.
- Navigation exposes its current page or location.
- Text and interactive states meet contrast requirements.
- Non-text contrast (1.4.11): graphical objects a reader needs in order to understand content clear 3:1 on their surface. That covers diagram structure — grid rules, axis and column dividers, connector lines, quote bars — which take `--rule`, not `--border` (§3). Purely decorative edges are exempt and stay on `--border`.

  **`--rule` is a deliberate, user-chosen exception to that 3:1 bar** — the same standing as the white-on-coral rail tile below. It measures **1.44:1 on white `#FFFFFF`, 1.43:1 on the Healthdirect card `#F6F9F9`, 1.43:1 on its page `#F3F7F7`**. That is well under the bar, and under the 2:1 the token carried before it.

  The reason it is defensible is not the ratio, it is what it matches. `--rule` is now the same value as `IaFlow`'s connector lines (`foreground/20`), so the diagram modules of a case study are drawn in one line colour instead of two greys a reader meets minutes apart. Consistency with a real element on the page is a better argument than a number derived on its own, and it is why this exception is written as a rule rather than a concession.

  The history is worth keeping, because the direction of travel is the risk: these lines were **1.11:1 and effectively invisible**, were raised to **3:1** and rejected twice as too dark against soft near-white paper, sat at **2:1**, and are now anchored at the IA flow's weight. Do not raise it back to 3:1 on the strength of the 1.4.11 line above — that is the trap this note exists to close. What is not negotiable is the floor: at 1.11:1 a reader could not parse the diagrams at all. Anything that lands back near that has failed regardless of who asked for lighter, so re-verify the §3 worst case (`JourneyMap`'s 320px stage separator) before lowering it again. It was re-verified at this value and still divides.
- Content remains usable at 200% zoom and with increased text spacing.
- The experience is complete with keyboard only, without motion, and without the custom cursor.

### Case-study heading hierarchy

On a case-study page the document outline is fixed, and heading tags follow position in that outline, not visual size:

- The case-study title in the shell hero (`CaseStudyShell`) is the sole `h1`. Nothing else on the page is an `h1`.
- Every top-level section heading is an `h2`. That means chapter leaves (`Chapter`) and every section that reads as a top-level division of the story: the in-chapter artifact sections a reader jumps to from the rail (`ArtifactSection` with `headingLevel={2}`) and the self-tiled artifact modules that carry their own `h2` (`EngineAudit`, `JourneyMap`, `IaFlow`, and peers). In-flow section titles wear the shared display heading `sectionHeading`; a chapter opener is the one distinct display role among the `h2`s and wears `leafHeading` — the same family, one step larger (28 → 46px) on its dark leaf plate. A nested subsection (`ArtifactSection` with `headingLevel={3}`) steps down to `subsectionHeading` in the same family. All three live in `typography.ts` (re-exported from `Chapter.tsx`) so each level's look is defined once and no section title can drift.
- Headings nested inside a section step down in order — `h3`, then `h4` — and never skip a level. Draw the line by role, not by where the text sits: a heading that *titles a section or artifact block* — including a statement line that introduces an artifact, e.g. "What success had to look like" above the criteria scorecard — is that section's `h2`, even when it lives inside a chapter alongside other `h2`s. Only the *repeating labels within* such a block (a persona card, a roadmap item, a research-theme or opportunity-area card label, an individual scorecard cell label) step down to `h3`. When unsure, ask whether the heading names the whole block (`h2`) or one item inside it (`h3`).
- **One token per heading level, no exceptions, no ad-hoc sizes.** Every `h2` in-flow section title wears `sectionHeading`; every chapter opener wears `leafHeading`; every `h3` wears `subsectionHeading`; every content-level `h4` wears `minorHeading`. This holds for *all* content headings equally — a standalone subsection, a repeating card or list-item label, and a one-off statement heading alike. Never size a heading inline (`text-base font-semibold`, `text-lg …`, a bespoke `clamp()`); that drift is exactly what makes a card label read as body text, a subsection read as a second `h2`, or a "special" statement escape the scale. If a heading is level N, it takes level N's token, full stop. There is no display-statement exemption.
- **Name a role for its job, never for its tag.** `h1` is a document-structure fact; "display" is a typographic one, and the same element is both at once. Two roles are `h1`s at very different sizes (`displayHeading` 128px on the home hero, `coverHeading` 88px on a case-study cover) and two are `h2`s at different sizes (`leafHeading`, `sectionHeading`), so naming by tag would collapse the first pair and leave the second unnamed. The home page also runs its own **gallery voice** (`font-medium`, tracking -0.01em to -0.015em) distinct from the editorial family here (`font-semibold`, -0.03em) — see `.docs/type-scale.md` for both families and the reason the home grid's card title is deliberately larger than the section rubric above it.
- **The display ladder is one curve, and that is what makes level read from size.** The four display roles — `coverHeading` (the case-study cover `h1`), `statementHeading`, `leafHeading`, `sectionHeading` — are all two-viewport fluid clamps sharing the same anchors: each sits at its minimum at 375px, interpolates linearly, and reaches its maximum at 1440px. Sizes are `coverHeading` 40 → 88px; `statementHeading` (full-width thesis statement) 32 → 60px; `leafHeading` (chapter-opener `h2`) 28 → 46px; `sectionHeading` (in-flow `h2`) 28 → 36px. Because the curves are parallel, the ladder's order holds at *every* width, not only at the endpoints.

  `leafHeading` and `sectionHeading` deliberately share a 28px floor. A section title should not shrink below the chapter opener's size on a phone just to preserve an abstract step, and the two roles never appear together: a chapter opener owns a full-bleed dark plate with its own eyebrow and illustration, while a section title sits in-flow on a light tile, so at small widths they are told apart by surface rather than by size. From 375px up the leaf pulls ahead — it has the steeper slope, so it leads at every width above the anchor. This is a tie at the floor, not an inversion.

  This is a correctness property, not a stylistic one. The scale this replaced mixed a `vw` clamp (`leafHeading`) with a breakpoint staircase (`sectionHeading`), and a fluid curve crossing a staircase inverts: between 768px and roughly 833px the chapter opener rendered **smaller** than the section headings nested inside it (28px against 30px), and was still only about 1px above them at 1024px — so through the whole tablet-to-small-laptop range the page's largest heading role read as level with its smallest `h2`. Patching the crossover with another breakpoint only relocates the next crossing. Keep every display role on the shared anchors.

  Write each as `clamp(min, Nrem + Mvw, max)`, never `clamp(min, Mvw, max)`. The `rem` term is what keeps a heading responsive to browser text zoom; a size expressed in viewport units alone ignores the reader's font-size setting everywhere between the clamp bounds. To retune a role, move its two endpoints and recompute both terms — `slope = 100 * (max − min) / 1065`, `offset = min − 375 * (max − min) / 1065`. Never hand-set one role's size in isolation.

- Below the ladder the two nested roles stay on plain Tailwind steps, because they sit far enough below `sectionHeading` that no crossing is reachable and the standard scale is the §4 default wherever it works: `subsectionHeading` (`h3`) `text-lg md:text-xl lg:text-2xl` (18 → 24px) — two steps below the in-flow h2 at both ends of the range (36 → 24 at desktop, 28 → 18 on a phone), so an `h3` never crowds the `h2` above it; `minorHeading` (`h4`) `text-base md:text-lg` (16 → 18px), one step below the h3 and the deepest the outline goes. Adjust a gap only by editing these tokens, never by hand-sizing an individual heading.

- **An arbitrary font-size carries no line-height.** `text-2xl` ships a paired leading; `text-[clamp(…)]` does not, and silently inherits the body leading. Every display role therefore sets its own `leading-*` alongside the clamp. Dropping it is a quiet regression that reads as a heading gone loose.

  `minorHeading` is a heading role, not a label role, and the distinction is where it gets misused. Reach for it only when the `h4` genuinely *titles a block of content* — the "Before" and "After" halves of a comparison exhibit (`ResolvedFindings`). An `h4` that is really a caption, kicker, or nav label keeps the §3 uppercase tracked eyebrow, per the tag-vs-role point below; a heading tag used for outline reasons does not by itself earn a heading token.
- Heading tags are semantic and independent of visual size: the class list carries the size, the tag carries the meaning. Never promote or demote a tag to reach for a font — headings already carry the display face at every level. A section title never wears the small uppercase eyebrow style; the uppercase tracked eyebrow, and small nav/meta labels, are the caption/kicker (§3) and navigation (§9) roles, not section headings — even where they happen to use a heading tag for outline reasons, they are out of scope for the heading tokens above.

## 13. Definition of done for a component

- Reuses existing components and tokens where appropriate.
- Works at every validation width.
- Has no unintended horizontal page overflow.
- Handles long and missing content safely.
- Provides correct image behaviour and alt text.
- Meets touch-target and keyboard-focus requirements.
- Has a reduced-motion state if animated.
- Has been checked in its real page context, not only in isolation.
