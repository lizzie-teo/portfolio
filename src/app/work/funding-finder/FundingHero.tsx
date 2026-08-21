"use client";

import { PlayIcon, RotateCwIcon, SquareIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cornerClasses, type TileCorners } from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { TouchRing } from "@/app/components/TouchRing";
import {
  useFlowDemo,
  type FlowDemoPhase,
  type FlowStep,
} from "@/app/lib/useFlowDemo";
import { MobilePrototype } from "./prototype/MobilePrototype";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./prototype/tokens";

/* ─────────────────────────────────────────────────────────────────────────────
   Case-study hero: the borrower application ACTUALLY RUNNING.

   The symptom checker's hero puts a screen recording in its phone slot because
   a recording is what survived that project. This one has the prototype's own
   source, so the handset carries the real thing — a working React build of the
   mobile flow — and a touch ring walks it end to end on a loop: start, see what
   open banking can read, connect a bank, watch the financials arrive
   pre-filled, answer the questions one at a time, and land on three ranked
   lenders and the card the money arrives on.

   Which makes the hero the case study's opening argument rather than a picture
   of it. The reader can also stop watching and do it themselves at any point —
   the first touch hands the prototype over permanently (useFlowDemo).

   The stage is the page's own dark leaf with a soft bloom of the project's
   brand pink behind the handset, so the phone reads as lit rather than pasted
   on. No copy: the masthead directly above has already said what this is, and
   a caption telling the reader the prototype is tappable would be a label where
   a demonstration belongs (.docs/auto-demo.md §1).
─────────────────────────────────────────────────────────────────────────────── */

/**
 * The walkthrough. Data, not code — each beat names a `data-demo` id in the
 * ported screens and nothing here knows what any of them IS.
 *
 * Three of them are READS (`press: false`): the hand rests on the thing the
 * screen is arguing and moves on without touching it. Those are the beats that
 * keep this from being a button-mashing reel — what open banking can see is the
 * trust argument the whole bank connection turns on, and the pre-filled panel is
 * the payoff for having made it.
 *
 * Three beats wait on the product rather than on a timer: `bank-view-prefilled`
 * does not exist until the two-second handshake finishes, `matching-view` until
 * the matcher reaches 100%, and every `q-continue` is disabled until its
 * question is answered. The sequencer just looks for the id and waits, so the
 * demo can never press ahead of the prototype.
 */
const DEMO_STEPS: FlowStep[] = [
  { target: "home-start", label: "Start application" },
  { target: "bank-sees", press: false, hold: 2400, label: "read what open banking sees" },
  { target: "bank-continue", label: "Continue" },
  { target: "bank-commonwealth", label: "pick a bank" },
  { target: "bank-view-prefilled", label: "View pre-filled data (waits on the handshake)" },
  { target: "prefilled-values", press: false, hold: 2400, label: "read the pre-filled financials" },
  { target: "prefilled-continue", label: "Continue to questions" },
  { target: "q-option-2", label: "24 months" },
  { target: "q-continue", label: "Continue — loan details" },
  { target: "q-continue", label: "Continue — annual revenue, pre-filled" },
  { target: "q-continue", label: "Continue — property value, pre-filled" },
  { target: "q-upload", label: "upload ID" },
  { target: "q-continue", label: "Find my lenders" },
  { target: "matching-view", label: "View matched lenders (waits on the matcher)" },
  { target: "lender-0", hold: 2800, label: "Apex Capital, best match" },
  { target: "lenders-proceed", label: "Proceed with Apex Capital" },
  { target: "card-art", press: false, hold: 2600, label: "the funds arrive" },
  { target: "card-done", label: "Done" },
];

/**
 * The handset's rendered width. 390px is the prototype's own canvas, so at the
 * top of the range it draws at 1:1 with no resampling; below that the whole
 * board scales down as one transform rather than reflowing, which is what keeps
 * the screens pixel-identical to the source at 320px.
 */
const MAX_BOARD_WIDTH = 390;

export function FundingHero({ corners = "all" }: { corners?: TileCorners }) {
  const reduce = useReducedMotion() ?? false;

  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  // One transform for the whole board (see MobilePrototype). Measured rather
  // than derived in CSS: a unitless scale cannot be computed from lengths in
  // `calc`, and the demo needs the same number to place the ring.
  //
  // Null until the first measurement, and the board is held invisible until
  // then — for one frame it would otherwise draw at its full 390px inside a
  // narrower slot and be clipped. The SLOT's height comes from an aspect ratio
  // rather than from this number, so the page reserves the right space from
  // first paint and nothing shifts when the scale lands.
  const [scale, setScale] = useState<number | null>(null);
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const measure = () => setScale(slot.clientWidth / SCREEN_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  // Winding back is a full remount: every screen holds its own state (which
  // bank was tapped, which lender is selected, how far the matcher got), and a
  // remount is the only reset that cannot leave one of them behind.
  const [runKey, setRunKey] = useState(0);
  const reset = useCallback(() => setRunKey((k) => k + 1), []);

  const { ring, driving, phase, manual, latched, start, stop } = useFlowDemo({
    steps: DEMO_STEPS,
    stageRef,
    boardRef,
    // The in-view gate watches the SLOT, not the board: the slot holds the
    // handset's exact box and survives the wind-back remount above, and an
    // observer pointed at the board would be left holding a detached node the
    // first time `reset()` ran (useFlowDemo → `viewRef`).
    viewRef: slotRef,
    reset,
    shouldReduce: reduce,
  });

  return (
    <CollapsingLeaf
      pinTopPx={0}
      className={`relative w-full overflow-hidden bg-leaf ${cornerClasses[corners]}`}
    >
      {/* Brand bloom. A single soft radial of the scope's own --primary, offset
          above centre so the handset sits in the lit part of it. Derived from
          the token rather than picked as a hex, so it re-tints with the project
          scope and never becomes a second pink to keep in step. Static: an
          ambient drift at this size reads as noise (see the home hero's grain),
          and there is already one moving thing on this stage. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 38%, color-mix(in oklab, var(--primary) 34%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex w-full flex-col items-center px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14 lg:px-12 lg:pb-20 lg:pt-16 xl:pb-24 xl:pt-20">
        <WalkthroughControl
          phase={phase}
          manual={manual}
          latched={latched}
          onStart={start}
          onStop={stop}
        />

        {/* THE STAGE — the handover surface, and it is exactly the handset.
            Two things turn on that being tight rather than the whole padded
            column. A trusted press anywhere in the column used to latch the
            demo off for the session, so at 1440 a reader clicking dead leaf a
            foot from the phone silently killed the walkthrough; handover should
            mean touching the prototype. And the play control above has to sit
            OUTSIDE this subtree: the latch fires on any trusted pointerdown,
            keydown, or focusin in the stage (correctly — it cannot ask what an
            event meant), so a control inside it would hand the prototype over
            the instant it was pressed or tabbed to, and its own press would be
            the last thing it ever did. Placing it outside is the fix, rather
            than teaching the latch about exceptions. */}
        <div
          ref={stageRef}
          className="w-full"
          style={{ maxWidth: MAX_BOARD_WIDTH }}
        >
          {/* The slot is what gets measured: full width up to the prototype's
              own canvas size, holding the board's aspect so the space is
              reserved from first paint. */}
          <div
            ref={slotRef}
            role="group"
            aria-label="Funding Finder prototype: the borrower application, running"
            className="relative w-full"
            style={{ aspectRatio: `${SCREEN_WIDTH} / ${SCREEN_HEIGHT}` }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                transform: `scale(${scale ?? 1})`,
                transformOrigin: "top left",
                visibility: scale === null ? "hidden" : undefined,
              }}
            >
              <MobilePrototype
                key={runKey}
                ref={boardRef}
                still={reduce}
                // The question screen's autofocus stays off while the hand is
                // the one working it: a hero that grabs focus on its own drags
                // the viewport back up under someone reading further down the
                // page.
                allowFocus={!driving}
              />

              {/* The ring rides in the board's own coordinate space, so it
                  needs no conversion, and is clipped to the handset — a thumb
                  arriving from below the screen's foot passes under the device
                  edge exactly as a real one does. The clip sits on its own
                  layer so the handset's shadow is not cropped with it. */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ borderRadius: 24 }}
              >
                {ring ? (
                  <TouchRing
                    x={ring.x}
                    y={ring.y}
                    from={ring.from}
                    pressed={ring.pressed}
                    pressKey={ring.pressKey}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollapsingLeaf>
  );
}

/**
 * The way in, for the readers the walkthrough does not play itself for.
 *
 * WHY IT IS NOT ALWAYS THERE. It appears exactly where the walkthrough will not
 * happen on its own, which is two states and not one:
 *
 * - REDUCED MOTION (`manual`), where nothing autostarts and the prototype
 *   otherwise sits on its first screen with nothing to say that a walkthrough
 *   exists at all. That is the one case §1's "show it, don't label it" argument
 *   cannot cover: a demonstration cannot announce itself if it is never allowed
 *   to run.
 * - AFTER A HANDOVER, in either mode. The first touch retires autoplay for the
 *   session — correctly, nothing should resume behind a reader's back — but
 *   without an offer back, touching the prototype means losing the walkthrough
 *   until a page reload. Replay is that offer. It is honest about what it will
 *   do (a wind-back, discarding whatever application the reader had started),
 *   and it only ever happens because they pressed it.
 *
 * While the loop is autoplaying, though, there is nothing to render: a button
 * offering to start what is already running is chrome for a thing that already
 * happened. So the hero as first met is pixel-identical to its pre-control
 * self, and the control arrives at the moment the reader makes it meaningful.
 *
 * ITS ROW KEEPS ITS SPACE, AND THAT IS LOAD BEARING. The control must not
 * change the height of anything above the handset when it appears or goes, and
 * the thing that flips it is the reader's finger landing on the prototype.
 * Reflowing between `pointerdown` and `pointerup` moves the handset out from
 * under the press, so the release lands on a different element, the browser
 * never synthesises a `click`, and the tap that just took the prototype over
 * does nothing to it. Reserving the row costs a strip of empty leaf that is
 * invisible on a plain dark stage; not reserving it costs the reader their
 * first tap.
 *
 * WHY IT SITS ABOVE THE HANDSET. The symptom checker's chip is pinned to its
 * stage's upper right because that stage is a composition the chip has to float
 * clear of. This stage is one phone on open ground, and floating fails it at
 * both ends: at 320px a corner chip lands on the prototype's own header, over
 * the app's menu button, reading as part of the product; at 1440px it strands
 * itself a foot of empty leaf away from the only thing it controls. In flow it
 * stays with the phone at every width and needs no absolute positioning against
 * a collapsing leaf's unreliable bottom edge.
 *
 * Above it rather than below because the handset is 800px tall at its own
 * canvas size — taller than a laptop viewport — so anything under its foot is
 * off screen for the whole time the phone is being looked at. Above, it arrives
 * with the top edge of the stage, which is how the hero is met on the way down
 * the page. Right-aligned to the handset's own box: it belongs to the phone
 * rather than to the leaf, and it keeps the hero's one deliberate asymmetry
 * against an otherwise dead-centre composition.
 */
function WalkthroughControl({
  phase,
  manual,
  latched,
  onStart,
  onStop,
}: {
  phase: FlowDemoPhase;
  manual: boolean;
  latched: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  // Autoplay before the reader has touched anything is the one state with
  // nothing to offer. Everything else — reduced motion, and any mode once the
  // latch has retired autoplay — gets the control, in every phase: a run the
  // reader asked for has to keep its Stop, which is exactly what reading this
  // off `phase` alone would lose the moment the run started. Note this is a
  // VISIBILITY decision, never a mounting one: see the row below.
  const offered = manual || latched;
  const playing = phase === "playing";
  // One control, labelled for what it will actually do next — the same
  // one-button idiom as the symptom checker's replay chip, with a stop state
  // added because this walkthrough runs for the better part of a minute and a
  // reader who started it deliberately must be able to end it deliberately.
  // "Stop" and not "Pause": there is no resume, and the prototype is left on
  // the screen the hand reached rather than wound back. The noun rides through
  // all three labels — the same action keeps the same name whatever state it is
  // in — which also keeps the pill within about twenty pixels of one width, so
  // it does not have to be padded out to a fixed size to stop it snapping.
  const { Icon, label } = playing
    ? { Icon: SquareIcon, label: "Stop walkthrough" }
    : phase === "done" || phase === "handedOver"
      ? { Icon: RotateCwIcon, label: "Replay walkthrough" }
      : { Icon: PlayIcon, label: "Play walkthrough" };

  return (
    <div
      className="mb-4 flex w-full justify-end md:mb-5"
      style={{ maxWidth: MAX_BOARD_WIDTH }}
    >
      {/* Same liquid-glass material as the artifact viewer's tour chip and the
          symptom checker's replay chip (style-rules "Glass surfaces": one
          floating-chrome language across the site, and a new surface only if it
          can take the same idiom).

          THE CHIP IS ALWAYS MOUNTED and hidden with `invisible`, never removed
          from flow. The state that reveals it is a handover — a trusted
          `pointerdown` on the handset — so mounting it there would grow this
          row and push the phone down between that press and its release, which
          swallows the tap (see above). Holding the space with the chip itself
          gets the height by construction rather than by a hardcoded value that
          would drift the moment the target size or the rim changed, and
          `visibility: hidden` takes it out of the tab order and the
          accessibility tree, so while it is not on offer it cannot be reached
          by any route. */}
      <div className={`tour-glass-chip rounded-full p-1 ${offered ? "" : "invisible"}`}>
        <button
          type="button"
          onClick={playing ? onStop : onStart}
          // 44px minimum target, and the label carries the accessible name —
          // nothing is announced that is not on screen.
          className="flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-leaf-foreground outline-none transition-colors hover:bg-primary/35 focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf active:bg-primary/50"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {label}
        </button>
      </div>
    </div>
  );
}
