# Home feed: component-simulation covers

Direction note for rebuilding the home page as a vertical feed of one card per row, where each card's cover art simulates a single component from the product doing a single thing.

Status: **superseded, August 2026.** The home grid was rebuilt instead as a shelf of floppy disks continuing the hero `WorldGlassCard` narrative — see the amended rule at `.docs/style-rules.md` §3 ("the home grid is an object shelf"). Note that the shelf as shipped is a **grey outline drawing**, not the moulded object described in the older passes: intermediate versions did develop into a per-project pastel shell from the world-scene accents and did typeset recruiter metadata on the paper label, and both were cut in August 2026 along with the plate-and-bevel construction itself. The card is now four lines, two lines of type, and a hover that darkens the line, slides the shutter and fills the sticker — on a light `bg-secondary` band rather than the grout plane. The touch-gap analysis in §1 and the auto-demo gating notes in §4 remain useful reading; the vertical feed and component-simulation cover direction below is parked, not agreed. The §8 Macquarie tagline blocker has been fixed in the registry.

## 1. Why

The home page today is a bio hero over a three-up grid of seven uniform 5:7 plates (`WorkGallery.tsx` → `LoFiProjectCard.tsx`). Two problems.

**The grid under-serves the first impression.** Every plate is the same dark ground carrying a title and a grey industry label. Client colour, the logo, and the outcome figure all arrive only on hover, and hover is driven by Motion's `onHoverStart` (`LoFiProjectCard.tsx:1322`) rather than CSS, deliberately, so that a tap never fires it. The consequence is that on a phone the home page is seven identical rectangles and the outcome exists only inside an `aria-label`. Phones are where a portfolio link gets opened first.

**Covers are built and unused.** `SymptomCheckerCover`, `ApTestingPortalCover`, and `MacquarieRadarCover` render only on `/explore` prototypes; `.docs/cover-effects.md:13` bars them from the home grid, and `.docs/style-rules.md:110` states the home grid is typographic, not pictorial.

The intended outcome: each project gets one strong self-explanatory impression that behaves identically on touch and desktop, and the cover art is evidence of the work rather than decoration around it.

## 2. The shape

A **vertical feed, one card per row**, closer to a Linear or Vercel changelog than to a social feed.

Because a card owns the viewport, **in view becomes the animation trigger**. That removes the hover dependency entirely and fixes the touch gap structurally rather than by adding a mobile special case. It also means the outcome figure can simply be printed on the plate at full size instead of being hover-only artwork.

**Never let a card fill the whole viewport.** Leave the next one peeking by 10 to 15 percent. Seven items is not a feed in the Instagram sense, where linear consumption is free because the supply is bottomless; with seven, the peek is what tells a reader the set continues and roughly how long it is. The filter rail (`WorkGallery.tsx:188`) also has to survive as the way to see everything at once, rather than becoming something scrolled past once.

## 3. What the cover art is

**One component from the product, doing one thing.** A symptom search input receiving a query and returning suggestions. A certification status board resolving. An ERA submission table filling. Not a product tour, not a flow, not a dashboard. The beat lands in roughly two seconds and then holds.

**Built as live DOM, not captured video or screenshots.** Crisp at full plate width, near-zero asset weight (`.docs/asset-weight.md` covers why generated clips are a trap), retunable when the beat is wrong, and honest — it reads as a rendering of the design rather than as something pretending to be a screengrab. It also demonstrates the Figma-to-code capability that is already one of the hero's own keywords.

**The family is the container, not the effect.** Each component is genuinely different, which is where the differentiation comes from for free — the products did that work. What makes seven cards read as one set is the shared plate: same frame, same type, same caption block, same corner treatment. CLAUDE.md's `rounded-xs` product-screenshot rule applies here and gives the family a built-in signal.

## 4. Inherit the auto-demo contract

`.docs/auto-demo.md` §3 already settles what separates a demonstration from an advertisement running in the middle of someone's reading, for the phone-frame prototype galleries. A feed of self-playing covers is the same problem at larger scale, and it should inherit those rules rather than invent new ones:

- **In view, or not running.** `IntersectionObserver`, plus `visibilitychange` to pause with the tab. Seven live covers in a scroll feed makes this a correctness requirement, not a nicety.
- **Reduced motion opts out entirely.** Not shortened, not crossfaded. Every cover needs a strong frozen frame, and the right still is the moment *after* the interaction resolves with results showing, never the empty input.
- **The reader always wins, permanently.** First interaction latches the demo off for the life of the page.
- **Never steal focus**, and never spam assistive tech — the covers are decorative, so the plate is `aria-hidden` and the card's accessible name carries title, tagline, and outcome as static text.
- **Cause before effect.** The press is held briefly before the action fires, so the interaction reads as causing the result.
- **Clean up everything** — timers, rAF, observers, listeners — on unmount, on pause, on handover.
- **Do not narrate it.** No captions, no step counters, no "watch this".

One rule there does *not* transfer: §5's "no demo on desktop" is scoped to the phone-frame galleries, where the desktop stage is a curated comparison. Feed covers play on both.

## 5. The shader question

The proposal includes animated shaders behind the component. Treat this as unproven and cheap to cut.

The site has already established that ambient grain drift on the home hero reads as static to a viewer. A slow shader behind a *moving component* is the same trap with more cost, because the component is stealing the eye by design. If the shader stays, give it a job other than drifting: have it warm or bloom **on the interaction beat**, so it is punctuation rather than atmosphere. Otherwise a flat tinted plate in the client's colour reads nearly identically for a fraction of the cost and the complexity.

`@paper-design/shaders-react` is already a dependency (`HeroInkVeil.tsx` uses `GrainGradient`), so capability is not the constraint. Judgement is.

## 6. What to reuse, and what to rewrite

Reuse:

- `FeatureItem.tsx` — the landscape full-width card that already fires when a filter narrows to one result. A feed is close to "always FeatureItem".
- `usePlayNextFrame()` (`src/app/explore/cards/shared.ts:20`) — already autoplays a cover on a feature plate one frame after mount, with a good comment on why StrictMode forced it.
- `useHotspotDemo.ts` — the sequencer, generation counter, and handover latch behind `.docs/auto-demo.md`. Closest existing prior art for a self-playing UI demonstration.
- `ProjectCover.tsx` — the id to component registry. The pattern stands even if every cover is rewritten.

Rewrite:

- All three existing covers are the same halftone-dot-scatter idiom in different colours. At card size that reads as one house style; at full plate width, one per screen, adjacent, it will read as the same effect recoloured — which is the problem this work exists to solve. Assume all covers are new under a shared engine rather than three kept plus four added.
- They are also roughly 450 lines each with near-identical skeletons. Extract the shared plate, frame, and timing engine before writing more of them.

Also note `WorkSize` (`projects.ts:3`) is set on every entry and consumed by nothing. Give it meaning in the feed or delete it.

## 7. Rules to amend, deliberately

- `.docs/style-rules.md:110` — "the home grid is typographic, not pictorial". This direction reverses it.
- `.docs/cover-effects.md:13` — covers are currently barred from the home grid.
- `.docs/cover-effects.md:31` — bans WebGL in covers. Only relevant if the shader survives §5.

**Already done:** ChapterDock's "Main tree" now points at `/#work` rather than `/` (`ChapterNavMasthead.tsx`). It is the one piece of chrome that persists through a case study, and it was landing returning readers above the home statement every time. The prev/next footer already used `/#work`, but the footer is only reachable by finishing the article.

## 8. Blocker

`projects.ts:203` records that the Macquarie Radar tagline is wrong: the real product is ERA research data reporting, not student support. That error currently lives in one line of copy. Building a cover around it would illustrate the wrong product, which is much harder to undo. Resolve before designing that cover.

## 9. Sequencing

1. Build **one** cover at full fidelity — symptom checker, the strongest project and the clearest single interaction — and judge it live before committing to the rest. Motion-led work, so route it to the `ms` agent.
2. If it lands, build the feed shell around it and the remaining covers as variations on a settled recipe.

Verify at 320, 375, 768, 1440, and 1800px. Confirm the cover plays on scroll into view on a real touch device, that nothing depends on hover, that offscreen cards are not running, that reduced motion gets a static frame with no positional movement, and that the outcome is readable without interaction on every card.

## 10. Open

- **Writing.** Do the three Substack essays get feed cards, or does writing become a compact stack at the end? They have no client, no logo, and no component to simulate, and giving a blog post equal screen weight to Healthdirect flattens a hierarchy the registry was careful to build (`projects.ts:230`).
- **The statement.** Does the hero become card zero of the feed — same rhythm, scrolling away like any other card — or move to a new `/about` page with the three bio paragraphs and the six keyword films? `SiteHeader.tsx:7` already handles a second nav item.
