# Auto-demo: showing a prototype instead of labelling it

How a mobile prototype gallery demonstrates itself — a touch ring that scrolls, taps, and loops — and the rules that keep it from becoming an annoyance.

Reference implementation: `useHotspotDemo.ts`, `TouchRing.tsx`, and the `advice` feature on `/work/healthdirect-symptom-checker`.

**There are two sequencers, and they share one rulebook.** Sections 1 to 5 below describe the screenshot demo (`useHotspotDemo`), which is the original and still the default. Section 6 describes the live-prototype demo (`useFlowDemo`), used where the prototype's own source survived and the hero can run the real thing. The non-negotiables in §3 apply to both, unchanged; only the coordinate model and what "act" means differ.

## 1. When a prototype earns one

The mobile decisions band (`FeatureChips` → `MobileGallery` → `PersistentPhoneFrame`) puts real screenshots in a phone frame and lays invisible hotspots over the trigger elements. Invisible is deliberate: a capture with markers drawn on it stops reading as a product screen.

The cost of invisible is that nothing announces the prototype is live. A caption saying "this prototype is tappable" is a label where a demonstration belongs, and it fails completely when the trigger is below the fold of the phone screen — which is the normal case, because these captures are full-page scrolls. `actionable-1.png` is 1080×12910; inside a 288px screen its first hotspot sits ~430px below the visible area. A reader who does not scroll a screenshot they had no reason to think was scrollable sees none of it.

Add a demo when **all three** hold:

- the feature has hotspots,
- they are invisible at rest, and
- at least one sits below the fold of the phone screen, or the flow spans more than one screen.

A single trigger visible without scrolling does not need one. Neither does a gallery that is just a swipe of stills.

## 2. Authoring it

The sequence is data, not code. Add `demoStep` (1-based) to the hotspots you want demonstrated, in `projects`-adjacent page data:

```ts
{ onImage: 0, x: 3, y: 12.6, w: 72, h: 1.9, popupImage: 1,
  label: "More info: Virtual Care Clinic", demoStep: 1 },
```

A feature's sequence is its hotspots carrying a `demoStep`, sorted. Omit the field and the hotspot stays reader-only — the demo never touches it. Omit it everywhere and the feature behaves exactly as it did before the mechanism existed. That is the default: **opt in per user flow.**

Two scopes fall out of the same field:

- **Popups only** — mark just the `popupImage` hotspots. The loop opens each explainer and closes it. Use when the modals are the point and the carousel position matters to the reader.
- **Full walk** — also mark the `goToImage` hotspots, so the loop pages the carousel to the linked screens and back. Use when the flow *is* the story. `advice` runs all six: info → find, per care option.

Keep it short. **Two or three presses, not six.** The first pass at `advice` demonstrated all three care options — six steps, over a minute a cycle — and it was the wrong shape twice over: nobody waits out a loop that long to see the step they care about, and opening every explainer in turn answers a question the reader has not been asked yet. Read the set, demonstrate one of it. Pick the example that carries the argument: `advice` presses Urgent Care because it is the middle option, the one the design steers people toward when virtual care cannot treat them and an ED would be overkill.

## 2a. The scan — read before you press

A press sequence alone answers "what happens if I tap this" before establishing that there is a list to tap in. On a tall capture the options do not share a screenful, so drilling straight into one shows a modal with no visible sense of what it was chosen *from* — and on `advice` the recommendation **order** is the design decision the chapter is arguing.

So the loop reads first. `Feature.demoScan` is a list of regions the hand travels over, resting on each, pressing none:

```ts
demoScan: [
  { onImage: 0, x: 5, y: 4.2,  w: 55, h: 1.8, label: "Seek immediate medical care" },
  { onImage: 0, x: 5, y: 12.9, w: 62, h: 1.3, label: "1. Virtual Care Clinic" },
  { onImage: 0, x: 5, y: 18.6, w: 65, h: 1.3, label: "2. Urgent Care Clinics" },
  { onImage: 0, x: 5, y: 24.3, w: 82, h: 1.3, label: "3. Emergency Departments" },
]
```

Same coordinate model as a hotspot — percentages of the capture, top-left plus size — because the scan and the press share all their positioning maths (`reachTo` in the hook serves both). Boxes rather than points so the hand centres on the text being read; keep `x`/`w` to the heading text, not the full column, or the hand rests over whitespace.

It runs once per loop, before the first press, and scrolls exactly as the press steps do. Unhurried is the point: rushing it makes the demo look like it is failing to click rather than declining to.

**Measure the coordinates, do not estimate them.** Crop the capture and read the pixels off it:

```bash
ffmpeg -i public/assets/.../actionable-1.png -vf "crop=1080:3550:0:0,scale=360:-1" /tmp/top.png
```

Then convert: `percent = (measured_y / cropped_height) × (crop_height / full_height) × 100`. Check the result against a hotspot whose position is already known — on `advice` the three option headings landed within 0.4% of their info hotspots, which is what confirmed the mapping rather than the eyeball.

## 3. The non-negotiables

These are what separate a demonstration from an animated advertisement in the middle of someone's reading. All are implemented in `useHotspotDemo`; do not weaken them for a new feature.

- **In view, or not running.** An `IntersectionObserver` at 0.5 starts and pauses the loop, and `visibilitychange` pauses it with the tab. A demo nobody can see is a battery drain, and a reader scrolling back to find a popup open with no explanation is a bug.
- **Reduced motion never starts anything.** Not a shortened version, not a crossfade — no ring, no scripted scrolling, no automatic paging. A demo that scrolls a capture and pages a carousel by itself is exactly the vestibular trigger the preference exists for, and the band at rest must be identical to its pre-demo self. What the preference governs is what the page does *unasked*: a walkthrough that is the only complete account of a flow may be offered behind an explicit control, because a press is consent. If it is, the control is a real one (labelled, 44px, in flow, focusable), it runs **once** rather than looping, and it obeys every other rule here.
- **The reader always wins, permanently.** The first `pointerdown`, `keydown`, or `focusin` inside the gallery latches the demo off for the life of the page (capture phase, so it lands before the carousel's own handlers). Never fight a thumb. Never resume after a touch, not even later, not even offscreen. What the latch retires is the *automatic* demo, not the reader's ability to ask for it back: a labelled replay control may still start a fresh run, because the reader pressing it is the opposite of the thing the rule protects against. The offer has to be honest about the cost — a run winds the prototype back, so whatever the reader had started is discarded — which is why it may only ever be reached through a control, never through anything the page decides on its own.
- **A control that appears or disappears must not reflow the stage.** Reserve its space and toggle `visibility`. The state that flips it is usually a touch on the prototype, so mounting or unmounting it moves the handset between `pointerdown` and `pointerup`: the release lands on a different element, no `click` is synthesised, and the tap that just took the prototype over does nothing to it. Invisible in review, and only ever found by driving the real thing.
- **Handover leaves things where they are.** If the demo had a popup open when the reader arrived, it stays open — they dismiss it with the same X the demo was about to press. A *pause* (scrolled out of view) cleans up so the restart is clean; a *handover* does not. The distinction matters: never yank the screen out from under someone who has just touched it.
- **Never steal focus.** A demo-opened popup skips the autofocus and the Tab trap (`autoFocus={false}` on `PhonePopup`); a reader-opened one keeps both. Otherwise the loop drags focus around the page and scrolls the viewport under someone reading a paragraph three sections away.
- **Never spam assistive tech.** The stage is `aria-live="polite"`. It flips to `off` while the demo drives and back the instant the reader takes over, so automated changes are silent and manual ones still announce. The ring itself is `aria-hidden` and `pointer-events-none`.
- **Cause before effect.** The press is held briefly *before* the action fires, so the tap reads as causing the modal rather than coinciding with it. And a popup is dismissed by travelling to a visible control and pressing it — never by vanishing.
- **Dismiss on the primary action, not the escape hatch.** The demo presses the modal's wide labelled "Ok" pill at the foot of the screen, not the X in the corner. Ok is what a reader would actually press, and it is already where a thumb rests; a hand reaching up to a corner X reads as cancelling out of the explainer rather than finishing with it. Both controls still work by hand — only the demonstrated one is chosen.
- **Clean up everything.** Timers, rAF, scroll animations, observers, listeners — on unmount, on pause, on handover. The sequencer uses a generation counter so a cancelled run cannot resume from a timer that was already in flight.

## 4. Timing

Every beat lives in the `DEMO` object at the top of `useHotspotDemo.ts`. Tune there and nowhere else.

The split is the useful part:

- **Movement beats** (`reveal`, `approach`, `exitTravel`, `press`, `pageSwap`) are the shared motion tokens. A travelling ring and an eased capture scroll are both `slow`, the explanatory-sequence duration, and `TouchRing`'s own transitions use the same values so the sequencer and the visual cannot drift. `pageSwap` is not a choice at all — it is what the carousel's `AnimatePresence mode="wait"` already takes.
- **Dwell beats** (`lead`, `holdPopup`, `holdSlide`, `gap`, `loop`, and the `scan*` group) are reading time, so they are honest milliseconds rather than motion tokens stretched out of shape. These are the only numbers worth arguing about. A popup hold has to clear the heading and the first line (2200ms); a paged screen has more to look at (2600ms); `scanDwell` (1100ms) is the one that decides whether the read-through reads as reading or as drifting.

The scroll parks the trigger at 45% down the screen (`REVEAL_ANCHOR`) — high enough that the modal has room to open below it, low enough that the trigger's context is still visible above.

## 5. What not to do

- **No demo on desktop.** The desktop stage is a curated comparison, not a prototype; it ignores hotspots entirely. The mechanism lives in `PersistentPhoneFrame`, which is only reachable below 1024px, and it should stay that way.
- **No demo without a manual path.** The arrows, dots, keyboard paging, and hand taps must all work identically whether the demo has run, is running, or was never enabled.
- **Never auto-page a carousel the reader has touched.** Covered by the handover latch; do not add a new automatic pager that bypasses it.
- **One running demo per viewport.** Four galleries animating at once is a slot machine. In-view gating handles this today because the bands are tall enough not to co-occur — if that changes, gate explicitly rather than hoping.
- **Do not draw resting markers on the capture instead.** That was the alternative and it loses the thing the frame is for: a clean product screen. The demo shows the affordance in time rather than printing it in space.
- **Do not fill the hotspot with flat colour.** The press cue is a *glow* — an inset edge-light hugging the trigger's shape plus a soft outer halo, over a barely-there tint (`HOTSPOT_AFFORDANCE` in `FeatureChips.tsx`). Earlier passes washed the box in flat primary and it read as a green rectangle stamped on the screenshot, fighting the capture instead of pointing into it; pushing the opacity up for legibility only made it worse. A halo keeps the underlying UI readable through the highlight and survives both a light product capture and the dark grout of a popup, which a mid-opacity fill does not.
- **Do not re-tone the pointer.** `TouchRing` is the same circle as the pointer in the page's own hero clip — white hairline, translucent white fill, soft drop shadow — because one page should have one prototype pointer. An earlier pass drew it as a dark translucent pad so it would hold on white screenshots; it did, and it also read as a second, unrelated convention arriving halfway down the page. The shadow is what carries the edge over white paper, so keep it whatever else changes.
- **Do not narrate it.** No "watch this", no step counters, no captions under the ring. The gesture is the explanation.

## 6. The live-prototype demo

`useFlowDemo` drives a working React build of a prototype instead of a capture. Reference: `FundingHero` on `/work/funding-finder`, which ports the mobile flow out of `public/assets/funding-finder/prototype/funding-finder.jsx` and walks it end to end.

Reach for this only where the prototype's **source** survived. A recording or a set of captures is not a candidate — porting a flow is a real build, and the payoff is specifically that the hero is the thing rather than a picture of it: the reader can stop watching and finish the application themselves.

What changes from the screenshot demo:

- **Targets are found, not measured.** Each beat names a `data-demo` id and the sequencer queries for it. Nothing is authored in percentages, so nothing has to be re-measured when the prototype changes. The attribute goes on the **pressable element itself**, never a wrapper — the press is dispatched to that node, and a wrapper's click never reaches the child's handler.
- **Acting means real events.** A `pointerdown`/`pointerup` pair (what the prototype's buttons animate off) then a `click` (what its rows and cards listen for). No private demo pathway: the sequencer works the product exactly as a thumb does, which is the whole claim it is making. Those events are untrusted by construction, which is also how the handover latch tells the demo's own press apart from the reader arriving — `event.isTrusted` is the guard, not a flag.
- **Waiting is a property of the target, not a timer.** A button that does not exist yet (a connection still handshaking, a matcher still running) or is disabled (a question not yet answered) simply is not found, and the loop polls until it is. So the demo can never press ahead of the product, and no beat carries a hardcoded "wait 2 seconds for the bank".
- **The loop boundary is a remount.** Every screen holds its own state; a `key` bump is the only reset that cannot leave one behind. Lift the hand *before* the reset, or the wind-back reads as the ring having pressed something it did not. The consequence is that **nothing long-lived may hold the board element** — an `IntersectionObserver` is attached once and keeps the node it was given, so pointing the in-view gate at the board leaves it holding a detached node the first time the loop winds back. It then fires a final `isIntersecting: false`, the sequencer cancels the run as "scrolled away", and the demo is dead for the life of the page: one pass, no loop, and nothing when the reader scrolls back to it. Observe the slot that holds the handset's box instead (`viewRef`) — same geometry, no remount.
- **The board is authored at life size and scaled once.** The prototype's own canvas (390×800 for Funding Finder) with a single `transform: scale()` over the whole thing, so screens stay pixel-identical to the source at every width and the ring — a sibling inside the same scaled box — needs no coordinate conversion. The slot around it holds the aspect ratio so the page reserves the space before the scale is measured.
- **Suppress the product's own autofocus while the demo drives.** A form prototype focuses its input on mount. In a hero that drags the viewport back up under someone reading three sections below. The hook publishes `driving` for exactly this.

What does not change: in-view gating, `visibilitychange`, reduced motion opting out entirely, the permanent handover latch, leaving the prototype where the reader found it, and the generation-counter cleanup. Same rules, different target.

Two things worth keeping honest when you port:

- **A curated slice is legitimate; a re-skin is not.** Funding Finder's real question set is twenty long, and twenty is a loop nobody watches to the end — the hero runs one question per group. That is fine, because the reader who takes over gets the same set. What is not fine is tidying the prototype into Tailwind and shell tokens on the way in: the inline styles, the brand pink and the odd bit of shorthand are the artefact, and a version rewritten in the portfolio's idiom is a picture of the portfolio.
- **The reads are what stop it being a button-mashing reel.** Same job as `demoScan` in §2a, expressed as `press: false` on a beat. Funding Finder rests on what open banking can see, on the pre-filled financials, and on the card at the end — the three screens carrying an argument rather than a control.
