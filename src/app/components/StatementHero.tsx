"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { HeroDefaultStill } from "./HeroDefaultStill";
import { HeroInkVeil } from "./HeroInkVeil";
import { HeroKeywordField, type HeroKeyword } from "./HeroKeywordField";
import { HeroKeywordVideo } from "./HeroKeywordVideo";
import { useHeroTone } from "./HeroToneContext";
import { displayHeading } from "./typography";

/* ─────────────────────────────────────────────────────────────────────────
   Statement hero — a first-person thesis: one outsized display headline over
   supporting body lines. The band rests on a light warm-neutral shade
   (--secondary), a calm plane a step warmer than the page, with charcoal copy.

   Six words in the copy are live — complexity, users, design systems,
   Figma to code, stakeholders, vibe coder. Hovering, focusing, or tapping one
   does two things at once:

     1. the band inverts to the dark ink stage and the masthead inverts with it
        (via HeroToneContext), so header + hero read as one dark stage;
     2. the frame answers with that word's clip (HeroKeywordVideo), over the
        idle illustration it rests on. A particle field stands behind the clips
        for any word that is not filmed — one system, many arrangements.

   Tone wiring is now just `dark = a keyword is active`. The masthead is a
   static element in normal flow directly above this band, so it cannot outlive
   the hero on screen — scrolling past the hero scrolls past the header too, and
   the old scroll-position guard (a rAF-throttled listener asking whether the
   hero still sat under the header line) was left over from when the header was
   sticky. All six keywords share the one dark state, so sweeping between them
   keeps the band dark continuously; a short debounce on leaving covers the
   plain text between two keywords so the band never flickers.

   Two compositions, one behaviour. The words are live at every width; what
   changes is where their answer stands.

     lg+      the frame is a column of its own beside the copy, square, top
              edge aligned to the headline. The particle field lives here too.
     below lg the frame is a MEDALLION set into the copy flow directly under
              the headline — the same circular artwork at a size a thumb can
              hold, not the desktop square shrunk. A full-width square would
              eat 42% of a 320px screen and push the opening paragraph off the
              fold; a medallion costs a quarter of that and still reads.

   Placement below `lg` is measured, not guessed: after the headline the
   medallion sits high enough to be visible without scrolling at 320px, and
   because the hero is only ~290px taller than the fold there, it stays on
   screen at every scroll position from which any of the six words can be read.
   So the word and its answer are always co-visible on a phone — which is the
   whole concept, and the reason the frame is not parked at the foot of the copy.

   Triggers. At lg+ a mouse hover lights a word; below lg a tap does. Those are
   separate paths on purpose: `pointerenter` fires on a touch tap and
   `pointerleave` on the lift, so a hover-driven word would light and die inside
   one tap. Mouse events are gated to `pointerType === "mouse"`, touch and pen
   activate on `pointerdown`, and a document-level listener reverts on the first
   tap outside a keyword — belt and braces for the browsers that do not focus a
   button on tap, where `blur` alone would never come. Keyboard focus lights a
   word at every width.

   Band tone runs at every width too, and below `lg` it is the more important
   half of the answer: the whole band inverts and the masthead inverts with it,
   so a tap is legible even in the moment the medallion has scrolled to the edge
   of the screen. HeroInkVeil therefore runs below lg as well — the masthead
   floods to the veil's own ink (HERO_VEIL_INK), so gating the veil by width
   would leave a phone's header a different dark from the band beneath it.

   Under reduced motion the band still changes colour (a permitted colour
   transition), the field draws a static composition, and the clips never
   autoplay — the poster frame stands in.
──────────────────────────────────────────────────────────────────────────── */

/* The keywords whose payoff is a clip rather than a particle formation (see
   HeroKeywordVideo). While one is lit the particle field stands down — which,
   with all six filmed, is whenever anything is lit at all. */
const KEYWORD_CLIPS: Array<{
  id: HeroKeyword;
  src: string;
  poster: string;
}> = [
  {
    id: "complexity",
    src: "/assets/my-capabilities/complexity.mp4",
    poster: "/assets/my-capabilities/complexity-poster.webp",
  },
  {
    id: "users",
    src: "/assets/my-capabilities/interface-detailing.mp4",
    poster: "/assets/my-capabilities/interface-detailing-poster.webp",
  },
  {
    id: "vibeCoder",
    src: "/assets/my-capabilities/ai-v2.mp4",
    poster: "/assets/my-capabilities/ai-v2-poster.webp",
  },
  {
    id: "designSystems",
    src: "/assets/my-capabilities/design-system.mp4",
    poster: "/assets/my-capabilities/design-system-poster.webp",
  },
  {
    id: "figmaToCode",
    src: "/assets/my-capabilities/design-to-code.mp4",
    poster: "/assets/my-capabilities/design-to-code-poster.webp",
  },
  {
    id: "stakeholders",
    src: "/assets/my-capabilities/stakeholders.mp4",
    poster: "/assets/my-capabilities/stakeholders-poster.webp",
  },
];

const FILMED_KEYWORDS = new Set<HeroKeyword | null>(
  KEYWORD_CLIPS.map((clip) => clip.id),
);

const IDLE_STILL = "/assets/my-capabilities/hompage-illustration.png";

/* The layered frame both compositions render: the idle illustration at the
   back, then the particle field, then one clip per filmed word. Order is the
   stack order — an incoming clip layers over the still during the hand-off
   crossfade. One component so the two compositions cannot drift apart. */
function HeroFrameStack({
  active,
  dark,
  reduced,
  preload,
  field,
}: {
  active: HeroKeyword | null;
  dark: boolean;
  reduced: boolean;
  preload: "none" | "metadata";
  /* The particle field is desktop-only. It is not a size judgement: with every
     keyword filmed it is handed `null` whenever anything is lit, so below lg it
     would mount a canvas, a ResizeObserver, and an rAF budget to draw nothing.
     Restore it here the moment a keyword goes back to a formation. */
  field: boolean;
}) {
  return (
    <>
      <HeroDefaultStill active={active === null} src={IDLE_STILL} />
      {field && (
        <HeroKeywordField
          active={FILMED_KEYWORDS.has(active) ? null : active}
          reduced={reduced}
          className="absolute inset-0"
        />
      )}
      {KEYWORD_CLIPS.map((clip) => (
        <HeroKeywordVideo
          key={clip.id}
          active={active === clip.id}
          dark={dark}
          src={clip.src}
          poster={clip.poster}
          preload={preload}
        />
      ))}
    </>
  );
}

export function StatementHero() {
  const reduce = useReducedMotion() ?? false;
  const { setDark } = useHeroTone();

  const [activeKeyword, setActiveKeyword] = useState<HeroKeyword | null>(null);
  // Which composition is mounted. Starts false so the server renders the
  // compact one — the mobile frame is real markup on first paint rather than
  // something hydration adds. On a wide screen the compact frame is `lg:hidden`
  // for that first frame and then unmounts, so desktop still mounts its column
  // (and its clips) exactly when it did before: after hydration.
  const [wide, setWide] = useState(false);

  const activeRef = useRef<HeroKeyword | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = useCallback(
    (id: HeroKeyword) => {
      if (clearTimer.current) {
        clearTimeout(clearTimer.current);
        clearTimer.current = null;
      }
      activeRef.current = id;
      setActiveKeyword(id);
      setDark(true);
    },
    [setDark],
  );

  const deactivate = useCallback(() => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    activeRef.current = null;
    setActiveKeyword(null);
    setDark(false);
  }, [setDark]);

  // Debounced clear: crossing the plain text between two keywords must not
  // flip the band — landing on the next keyword cancels this before it fires.
  const scheduleDeactivate = useCallback(() => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      clearTimer.current = null;
      activeRef.current = null;
      setActiveKeyword(null);
      setDark(false);
    }, 150);
  }, [setDark]);

  // Which composition to mount. The interaction is wired at every width now;
  // this only chooses between the beside-the-copy column and the medallion.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Tap away to revert. A touch device may never blur the button it lit (older
  // iOS does not focus a button on tap), so `blur` alone cannot be the only way
  // back to the idle state. Capture phase, so a tap that lands on another
  // keyword is recognised before that keyword's own handler runs and is left
  // alone. Immediate rather than debounced: a tap outside is a decision, not a
  // pointer passing through.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (activeRef.current === null) return;
      const target = event.target as Element | null;
      if (target?.closest?.("[data-keyword]")) return;
      deactivate();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [deactivate]);

  // Reset shared state on unmount.
  useEffect(() => () => setDark(false), [setDark]);

  const entry = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0.01 : motionDuration.base,
      ease: motionEase.out,
      delay: reduce ? 0 : delay,
    },
  });

  const kw = (
    id: HeroKeyword,
    children: ReactNode,
    weight = 600,
    touch: TouchTarget = "body",
    trail?: string,
  ) => (
    <Keyword
      id={id}
      weight={weight}
      touch={touch}
      trail={trail}
      onActivate={activate}
      onDeactivate={scheduleDeactivate}
    >
      {children}
    </Keyword>
  );

  const dark = activeKeyword !== null;

  return (
    <section
      aria-label="Introduction"
      data-hero-tone={dark ? "dark" : "light"}
      className={`relative overflow-hidden transition-colors duration-500 ${
        dark ? "bg-grout text-grout-foreground" : "bg-secondary text-foreground"
      }`}
    >
      {/* Grainy grout wash over the flat CSS band flip, at every width — the
          words are live everywhere now, and the masthead floods to this veil's
          ink rather than to --grout, so a phone without it would carry a header
          a shade off the band below it. Sits under all copy and media. */}
      <HeroInkVeil active={dark} />
      <div className="relative mx-auto w-full max-w-[1800px] px-4 pb-16 pt-10 sm:px-6 md:px-8 md:pb-24 md:pt-16 lg:px-12 lg:pb-28 lg:pt-20 xl:px-16 2xl:px-24">
        {/* The eyebrow sits above the split so the two columns below both begin
            at the headline. From lg up the hero splits into two columns: the
            thesis and body on the left, the keyword frame standing in its own
            right-hand column, its top edge aligned to the headline. Below lg
            the copy runs full width and the frame becomes a medallion set into
            it, directly under the headline. */}
        <motion.p
          {...entry(0)}
          className="mb-7 font-heading text-xs font-bold uppercase tracking-[0.24em] opacity-70 md:mb-10"
        >
          <span className="whitespace-nowrap">Lizzie Teo&nbsp;·</span>{" "}
          Product Designer &amp;{" "}
          {kw(
            "vibeCoder",
            <span className="uppercase">Code Tinkerer</span>,
            700,
            "eyebrow",
          )}
        </motion.p>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20.7rem)] lg:items-start lg:gap-10 lg:pr-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,27.6rem)] xl:gap-16 xl:pr-10 2xl:grid-cols-[minmax(0,1fr)_minmax(0,32.2rem)] 2xl:pr-14">
          <div className="min-w-0">
            <motion.h1
              {...entry(reduce ? 0 : 0.06)}
              /* Measure stays here — it is layout, not type. The staircase
                 itself is `displayHeading`; retune it there, never inline. */
              className={`max-w-[70rem] ${displayHeading}`}
            >
              A decade designing for{" "}
              {kw("complexity", "complexity", 600, "display")}
            </motion.h1>

            {/* The medallion — the frame's small-screen composition. It answers
                the headline it sits under, and it stays in view for every word
                below it (see the placement note at the top of the file). Set on
                the copy's own left axis rather than centred or ranged right, so
                the whitespace beside it continues the ragged edge the headline
                already leaves and the column keeps one axis.

                `ml-2` is an optical correction, not spacing: the artwork rests
                at scale 1.2 (HeroDefaultStill), so its ornamental ring hangs
                about 6% of the box outside it. The nudge puts the ring, not the
                box, on the axis the copy sets. */}
            {!wide && (
              <motion.div
                {...entry(reduce ? 0 : 0.09)}
                aria-hidden="true"
                className="mt-8 flex max-w-prose md:mt-10 lg:hidden"
              >
                <div className="relative ml-2 aspect-square w-2/3 max-w-72 sm:ml-3">
                  <HeroFrameStack
                    active={activeKeyword}
                    dark={dark}
                    reduced={reduce}
                    preload="none"
                    field={false}
                  />
                </div>
              </motion.div>
            )}

            <div className="mt-6 max-w-prose md:mt-8">
              <motion.p
                {...entry(reduce ? 0 : 0.09)}
                className="text-pretty text-base leading-relaxed"
              >
                I&apos;ve{" "}
                {kw("users", "designed for users", 600, "body", ":")}{" "}
                banks, merchants, internal testers, healthcare professionals.
                Knowing I&apos;ve made someone&apos;s day a little easier is
                what gives the work meaning.
              </motion.p>

              <motion.p
                {...entry(reduce ? 0 : 0.12)}
                className="mt-5 text-pretty text-base leading-relaxed md:mt-6"
              >
                I love making things simpler. I rethink clunky workflows and
                build AI ready{" "}
                {kw("designSystems", "design systems", 600, "body", ",")}{" "}
                from{" "}
                {kw("figmaToCode", "Figma to code", 600, "body", ",")}{" "}
                using tools like Claude Code to ship faster.
              </motion.p>

              <motion.p
                {...entry(reduce ? 0 : 0.18)}
                className="mt-5 text-pretty text-base leading-relaxed md:mt-6"
              >
                I&apos;m just as into the people side. Sitting with{" "}
                {kw("stakeholders", "stakeholders")} and making the process
                better for the whole team.
              </motion.p>
            </div>
          </div>

          {wide && (
            <div className="relative hidden h-[20.7rem] w-full lg:block xl:h-[27.6rem] 2xl:h-[32.2rem]">
              {/* Idle default at the back of the stack, then the particle field,
                  then one clip per filmed word. While a filmed keyword is lit
                  the field is handed null (no formation) and the clip reveals
                  over the same square frame. */}
              <HeroFrameStack
                active={activeKeyword}
                dark={dark}
                reduced={reduce}
                preload="metadata"
                field
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* A live word in the hero copy — a real button at every width, so the payoff is
   reachable by mouse, keyboard, and touch alike. The button forces the
   surrounding type (`[font:inherit]`) so it reads as the sentence, not a
   control, with only a dotted underline as a quiet affordance.

   Five of the six words map to a semantic hero-keyword token; the token itself
   resolves to the right tint for the current band tone and colour scheme (see
   theme.css), so the component only names the role. `complexity` is deliberately
   unmapped: it keeps the headline's inherited ink and weight (the underline
   alone marks it live) and inverts with the band exactly like the surrounding
   h1 text. `figmaToCode` carries the hero-highlight marigold family (burnt
   orange on the light band, the bright marigold itself on the dark tones) —
   the one warm accent, sitting alongside the plum design-systems tint in the
   same sentence. */
const KEYWORD_COLOR_VAR: Partial<Record<HeroKeyword, string>> = {
  users: "--hero-kw-users",
  designSystems: "--hero-kw-design-systems",
  stakeholders: "--hero-kw-stakeholders",
  vibeCoder: "--hero-kw-vibe-coder",
  figmaToCode: "--hero-kw-figma-to-code",
};

/* Touch target. An inline word is only as tall as its own line box — about
   19px in the body copy — so below `lg` the button takes vertical padding until
   its hit area clears 44px. Padding on an inline box overflows its line without
   reflowing anything, so the sentence sets exactly as it did; the only cost is
   that the target overlaps the lines above and below, and the worst a mis-tap
   can do is light a neighbouring word, which one tap away undoes.
   `lg:py-0` returns the geometry to the pointer's at desktop widths, where a
   padded target would light the band from a line the mouse is only passing.

   Three sizes because three type sizes: 12px eyebrow, 16px body, and the
   headline, whose line box is already ~43px and needs a hair rather than a
   band. */
type TouchTarget = "eyebrow" | "body" | "display";

const TOUCH_PADDING: Record<TouchTarget, string> = {
  eyebrow: "py-4 -my-4 lg:py-0 lg:my-0",
  body: "py-3.5 -my-3.5 lg:py-0 lg:my-0",
  display: "py-1 -my-1 lg:py-0 lg:my-0",
};

function Keyword({
  id,
  weight,
  touch,
  trail,
  onActivate,
  onDeactivate,
  children,
}: {
  id: HeroKeyword;
  weight: number;
  touch: TouchTarget;
  /* Punctuation that must not be orphaned onto the next line. Below `lg` the
     padded word is an atomic inline, which opens a line-break opportunity at
     its edges that the characters alone would not allow — so at 320px "Figma to
     code" held its line and the comma after it started the next one. The glue
     is dropped at `lg`, where the word is a plain inline again and a nowrap
     wrapper would instead stop the phrase itself from wrapping, which is a
     desktop line-break change. */
  trail?: string;
  onActivate: (id: HeroKeyword) => void;
  onDeactivate: () => void;
  children: ReactNode;
}) {
  // Tinted words set colour and weight inline: the token carries the tone-aware
  // tint and the inline font-weight beats the button's [font:inherit] reset.
  // Colour rides the band at 500ms to match the section's transition. An
  // unmapped word (complexity) takes no colour or weight, so it inherits the
  // headline ink/weight and follows the band like the rest of the h1; only the
  // dotted underline keeps its quicker 200ms hover feedback.
  const varName = KEYWORD_COLOR_VAR[id];
  const style = varName
    ? {
        color: `var(${varName})`,
        fontWeight: weight,
        transition:
          "color 500ms cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 200ms cubic-bezier(0, 0, 0.2, 1)",
      }
    : { transition: "text-decoration-color 200ms cubic-bezier(0, 0, 0.2, 1)" };
  const button = (
    <button
      type="button"
      data-keyword={id}
      style={style}
      // Mouse only. `pointerenter` also fires on a touch tap, with
      // `pointerleave` on the lift, so an ungated hover path would light the
      // word and kill it inside one tap.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onActivate(id);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        if (document.activeElement !== event.currentTarget) onDeactivate();
      }}
      // Touch and pen: the press itself is the trigger, ahead of any focus the
      // browser may or may not give the button. Reverting is the hero's
      // document-level tap-away listener, or blur where focus did land.
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") onActivate(id);
      }}
      onFocus={() => onActivate(id)}
      onBlur={onDeactivate}
      className={`inline cursor-pointer rounded-[2px] bg-transparent px-0 underline decoration-current/40 decoration-dotted decoration-1 underline-offset-[0.18em] outline-none [font:inherit] [letter-spacing:inherit] hover:decoration-current focus-visible:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
        TOUCH_PADDING[touch]
      }${varName ? "" : " text-inherit"}`}
    >
      {children}
    </button>
  );
  if (!trail) return button;
  return (
    <span className="whitespace-nowrap lg:whitespace-normal">
      {button}
      {trail}
    </span>
  );
}
