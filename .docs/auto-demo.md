# Auto-demo: showing a prototype instead of labelling it

How a mobile prototype gallery demonstrates itself — a touch ring that scrolls, taps, and loops — and the rules that keep it from becoming an annoyance.

Reference implementation: `useHotspotDemo.ts`, `TouchRing.tsx`, and the `advice` feature on `/work/healthdirect-symptom-checker`.

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

Order by the story, not by the layout. `advice` walks option by option (VCC info, find a VCC, then UCC, then ED) because that is how someone actually weighs care, not top-to-bottom down the page.

Keep it short. Six steps is about the ceiling; past that the loop is longer than anyone will watch and the reader has to wait through a cycle to see the step they care about.

## 3. The non-negotiables

These are what separate a demonstration from an animated advertisement in the middle of someone's reading. All are implemented in `useHotspotDemo`; do not weaken them for a new feature.

- **In view, or not running.** An `IntersectionObserver` at 0.5 starts and pauses the loop, and `visibilitychange` pauses it with the tab. A demo nobody can see is a battery drain, and a reader scrolling back to find a popup open with no explanation is a bug.
- **Reduced motion opts out entirely.** Not a shortened version, not a crossfade — no ring, no scripted scrolling, no automatic paging. A demo that scrolls a capture and pages a carousel by itself is exactly the vestibular trigger the preference exists for. The band must be identical to its pre-demo self.
- **The reader always wins, permanently.** The first `pointerdown`, `keydown`, or `focusin` inside the gallery latches the demo off for the life of the page (capture phase, so it lands before the carousel's own handlers). Never fight a thumb. Never resume after a touch, not even later, not even offscreen.
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
- **Dwell beats** (`lead`, `holdPopup`, `holdSlide`, `gap`, `loop`) are reading time, so they are honest milliseconds rather than motion tokens stretched out of shape. These are the only numbers worth arguing about. A popup hold has to clear the heading and the first line (2200ms); a paged screen has more to look at (2600ms).

The scroll parks the trigger at 45% down the screen (`REVEAL_ANCHOR`) — high enough that the modal has room to open below it, low enough that the trigger's context is still visible above.

## 5. What not to do

- **No demo on desktop.** The desktop stage is a curated comparison, not a prototype; it ignores hotspots entirely. The mechanism lives in `PersistentPhoneFrame`, which is only reachable below 1024px, and it should stay that way.
- **No demo without a manual path.** The arrows, dots, keyboard paging, and hand taps must all work identically whether the demo has run, is running, or was never enabled.
- **Never auto-page a carousel the reader has touched.** Covered by the handover latch; do not add a new automatic pager that bypasses it.
- **One running demo per viewport.** Four galleries animating at once is a slot machine. In-view gating handles this today because the bands are tall enough not to co-occur — if that changes, gate explicitly rather than hoping.
- **Do not draw resting markers on the capture instead.** That was the alternative and it loses the thing the frame is for: a clean product screen. The demo shows the affordance in time rather than printing it in space.
- **Do not fill the hotspot with flat colour.** The press cue is a *glow* — an inset edge-light hugging the trigger's shape plus a soft outer halo, over a barely-there tint (`HOTSPOT_AFFORDANCE` in `FeatureChips.tsx`). Earlier passes washed the box in flat primary and it read as a green rectangle stamped on the screenshot, fighting the capture instead of pointing into it; pushing the opacity up for legibility only made it worse. A halo keeps the underlying UI readable through the highlight and survives both a light product capture and the dark grout of a popup, which a mid-opacity fill does not.
- **Do not narrate it.** No "watch this", no step counters, no captions under the ring. The gesture is the explanation.
