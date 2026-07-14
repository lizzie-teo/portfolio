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

1. **Neutral shell.** The default `:root` theme is quiet and mostly off-white: warm charcoal text, ink interaction states, warm-neutral surface tints, whisper hairlines. The home page, header, footer, and all shared chrome are strictly neutral; no product or brand hue ever appears there. Colour on the home page comes from project imagery alone.
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
- Ring/focus: ink focus ring from `--ring`, matching primary.

### Project theme contract

A `[data-project-theme="<slug>"]` scope may override only these tokens:

- `--background`: a whisper tint of the brand hue, near-white — the page should read as "this product's air", not a coloured poster.
- `--primary` and `--ring`: the brand hue, deepened until it clears 4.5:1 against white. This recolours eyebrows, links, selection, CTAs, and focus.
- `--accent` / `--accent-foreground` and `--secondary` / `--secondary-foreground`: brand-tinted hover surfaces and quiet panels.
- `--border` / `--input`: a brand-warmed hairline.
- `--chart-1` through `--chart-5` if the case study charts data.
- Project-specific module tokens (e.g. the Healthdirect journey-map pastels), named with a clear project prefix and defined inside the scope, never in `:root`.

Rules for project colour:

- `--foreground`, `--card`, `--muted-foreground`, and shadows stay neutral. The product colour frames the page; it never colours narrative reading text, and reading surfaces stay white or near-white.
- Sample the brand hue from real product assets (logo SVG fills, brand marks), not from memory. Where the raw hue fails WCAG AA as text or a fill, deepen the token and record the contrast ratio in a comment; the raw hue may only appear in imagery or large decorative media.
- Never hardcode a project colour in JSX. Components use semantic roles; the scope supplies the hue. If a case-study module needs a colour the contract does not cover, add a prefixed module token to its scope.
- The reveal is part of the design: home cards stay neutral, and the product's colour appears on entering the case study. Do not tint home cards with per-project colour.
- A case study without a scope simply renders on the neutral shell — project themes are opt-in per project.
- To add one: extract the brand hue from assets, derive the deepened primary plus tint set, verify contrast (4.5:1 for text tokens on their surfaces), and add the scope in `theme.css` under PROJECT THEMES.

General token rules:

- Components should use semantic roles such as background, foreground, muted, accent, focus, border, and surface rather than repeating raw colour values. Raw palette values belong in the token definition only.
- Do not introduce arbitrary colour utilities or inline hex values in components.
- Do not use decorative gradients, neon accents, or heavy colour blocking in the portfolio shell.
- Project imagery supplies most colour on the home page. Each project preview and case study may preserve its own native product, brand, or campaign visual language inside the portfolio frame.
- Do not use `text-accent` for important labels. In this theme, `--accent` is a pale surface token; use `text-primary` or `text-muted-foreground` for readable text.
- Any new colour or global token must be added to `src/app/theme.css` first, then exposed through `src/app/globals.css` if Tailwind utilities are needed.

### Clean surface rules

- Page sections use `bg-background`. Exception: the home work section sits on a full-bleed pure-white `bg-card` band with `border-y border-border`, one step whiter than the page shell, so the project grid reads as its own gallery plane.
- Repeated UI and panels use `bg-card border border-border shadow-card`.
- Large empty project thumbnails use `bg-secondary border border-border shadow-card` so they read as quiet warm-neutral panels, one step softer than the page.
- Hover lift may transition from `shadow-card` to `shadow-elevated`.
- Secondary text uses `text-muted-foreground`, not `text-muted`.
- Narrative body copy (multi-sentence paragraphs, list prose, case-study reading text at `text-base` or larger) uses `text-foreground`. Reserve `text-muted-foreground` for supporting text of a sentence or two: captions, taglines, legends, persona quotes, and panel descriptions at `text-sm` or smaller.
- Category labels use `text-xs font-medium uppercase tracking-wide`.
- Shadows must use the theme custom properties via Tailwind utilities such as `shadow-card`, `shadow-bubble`, and `shadow-elevated`; avoid hardcoded Tailwind `shadow-lg` or `shadow-xl`.
- Use `rounded-xl` for standard cards, `rounded-2xl` or `rounded-3xl` for large media containers, and `rounded-full` for chips or icon controls.
- The portfolio pairs two sans-serifs: the ITC Avant Garde Gothic design (served as TeX Gyre Adventor, loaded in `layout.tsx`) for headings and display type, and Geist for body copy, labels, and navigation. Avant Garde is display-only — its closed geometric forms fatigue at paragraph sizes — while Geist keeps sustained reading comfortable and the mood modern and editorial rather than vintage.

### Editorial agency direction

- The site should feel like a high-end digital agency portfolio: confident, spacious, precise, tactile, and quietly playful.
- Use oversized sans-serif typography, compact navigation, small uppercase section labels, large body copy, and generous whitespace.
- Prefer asymmetry and staggered alignments in display typography and section composition. The home project grid is the deliberate exception: cards share one aspect ratio and align their top edges per row, so the gallery reads as a calm, even plane against the expressive hero.
- Avoid decorative cards. Use cards only for project previews or repeated artefacts where the image/content itself is the object.
- Use large rounded-corner project thumbnails with crisp image crops. Avoid heavy shadows; separation should come from scale, crop, spacing, and thin borders.
- Nav states should be thin underlines or precise text changes, not filled pills.

## 4. Typography and readable measure

- Establish display, heading, body, label, and metadata roles; do not select type sizes ad hoc per component.
- Body text is a primary reading role: it uses `text-foreground`, not a grey. Colour expresses the hierarchy between body copy and metadata; size and weight express the hierarchy between body copy and headings.
- Use responsive type scaling and comfortable line-height.
- Keep narrative body text near `max-w-prose`.
- Keep summaries deliberately shorter than process detail.
- Avoid long centred paragraphs; centre only short display copy.
- Prevent widows in prominent headings where practical, without inserting hard line breaks that fail responsively.
- Metadata must remain legible and should not rely on cool grey at insufficient contrast.

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
- Use CSS transitions only for colour, border, focus-ring, and shadow changes. Do not use CSS keyframes for product UI motion.
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

### Core patterns

- **Fade up** is the default for cards, list items, and content blocks: opacity from `0` to `1`, `y` from `10px` to `0`, duration `fast`, easing `out`.
- **Scale in** is for popovers, tooltips, menus, dropdowns, and modals: opacity from `0` to `1`, scale from `0.95` to `1`, duration `150-200ms`.
- **Slide in** is for drawers, sidebars, and bottom sheets: enter from the panel edge, duration `base`, easing `out`.
- **Layout changes** caused by state should use Motion's `layout` prop rather than manual dimension animation.
- **Shared-element expand** (see `ArtifactViewer`) is for enlarging evidence artifacts: the thumbnail and overlay share a `layoutId` so the card morphs from its own position (origin-aware), duration `base`, easing `inOut`. The morphing element carries no opacity initial/exit (only the backdrop fades — `fast`/`out` in, `instant`/`in` out) to avoid the layoutId + AnimatePresence double-animation artifact. The zoom is a vestibular trigger: under reduced motion drop the `layoutId` entirely and use a ~0.01s fade. Enlargement is inspection, not information — the caption must stay readable on the thumbnail.
- **Exit motion** must be explicit. Wrap conditional animated UI in `AnimatePresence`, use a stable key, and define an `exit` state.

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
| Explanatory diagram stage reveal (see `IaFlow`) | `fast` (200ms) nodes, `base` (300ms) drawn connectors | `0.06s` | < 1s per stage |

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
- If this introduces a new staggered reveal, does it match an existing recipe in the Stagger budgets table, or has a new one been added there with its total cascade time checked against budget?

### Project cursor

- Render only on devices matching a fine pointer and hover capability.
- Never replace the only visible indication that a project card is interactive.
- Do not render on touch devices.
- Keyboard focus must produce an equally clear card state.
- Reduced-motion mode uses a simple non-elastic state change.
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
- Every anchor destination must render a visible heading whose text matches its nav link text exactly. Chapters do this via `Chapter`; subsection anchors use `ArtifactSection` (quiet unnumbered `h3` title matching the link, plus a one-line takeaway) — except artifact modules that render their own card holder and internal `h3` title, which take the anchor `id` directly so the nav ties to that heading and no duplicate label sits above the holder. Never anchor to an unlabelled container.
- Wide desktop (`xl:` and up) uses the "On this page" rail (`CaseStudyRail`), a fixed overlay floating at the top right with scroll-spied `aria-current` states — it sits on the dark grout beside the content tiles, every tile drawn flat on the same plane (no shadow — one is invisible on the dark grout, and all-one-plane reads better). The rail floats visually but owns a dedicated lane: content containers widen their right gutter from `xl` up (`xl:pr-64 2xl:pr-72`) so no content ever runs beneath it. The rail is a stack of chapter blocks: every chapter is a rounded tile, and the chapter the reader is inside expands onto the `--rail-tile-active` pair (tile, foreground; the shell falls back to `--primary` / white), carrying its subsection links within it, while the rest sit collapsed as quick-jump tiles on the `--rail-tile` set (tile, foreground, hover, plus `--rail-tile-border`). Collapsed tiles are clean flat wireframes: no fill, a 1px `--rail-tile-border` hairline (the grout ink via `color-mix`) with the label in the same ink at the tile foot, taking a faint wash of that ink on hover — the open chapter is the single filled tile on the `--rail-tile-active` flood. Its height scales with content: a chapter with subsections expands taller to carry its links (label at the head), while a sectionless chapter keeps the collapsed tiles' exact geometry — same height, foot-anchored label — and changes only fill and ink, so it never opens an empty coloured belly and the label never jumps. Project scopes may re-tint the set — Healthdirect keeps the shell's white line work on its deep teal grout and floods the active tile coral `#e37778` with white labels. This is a deliberate, user-chosen exception to §12: white on this coral is 2.9:1 (below AA; the AA-passing grout-ink alternative was tried and rejected on looks). Keep the exception scoped to the rail's active tile — don't extend white-on-coral to body text or new components. Position is expressed by which block is open — no numbering, no progress hardware. The expansion is a repeated in-flow interaction: Motion layout animation at the `fast` token, opacity-only under reduced motion. Labels stay typographic and Title Case throughout — chapter anchor links and subsection links alike, each rendered as a semibold `h4`-wrapped link so it carries the display face (uppercase is reserved for the on-page chapter eyebrows, not navigation). Wayfinding numbers appear nowhere in headings or nav links — chapter arrival feedback is the leaf itself; the chapter pill's progress fraction is the one remaining numeric element.
- Below `xl:`, the compact chapter control (`ChapterMarker`) takes over; its expanded menu shows the active chapter's subsections, and its collapsed pill shows the active subsection title when one is active. Do not run both at the same width.
- Mobile uses a compact current-section control or readable horizontal navigation.
- Sticky UI must not consume excessive mobile viewport height or cover anchored headings.
- Active sections use `aria-current="location"` where appropriate.
- Anchor navigation must move keyboard focus meaningfully and account for the sticky header offset.

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
- Content remains usable at 200% zoom and with increased text spacing.
- The experience is complete with keyboard only, without motion, and without the custom cursor.

## 13. Definition of done for a component

- Reuses existing components and tokens where appropriate.
- Works at every validation width.
- Has no unintended horizontal page overflow.
- Handles long and missing content safely.
- Provides correct image behaviour and alt text.
- Meets touch-target and keyboard-focus requirements.
- Has a reduced-motion state if animated.
- Has been checked in its real page context, not only in isolation.
