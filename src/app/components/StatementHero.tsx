"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { HeroDefaultStill } from "./HeroDefaultStill";
import { HeroInkVeil } from "./HeroInkVeil";
import { HeroKeywordField, type HeroKeyword } from "./HeroKeywordField";
import { HeroKeywordVideo } from "./HeroKeywordVideo";
import { useHeroTone } from "./HeroToneContext";

/* ─────────────────────────────────────────────────────────────────────────
   Statement hero — a first-person thesis: one outsized display headline over
   supporting body lines. The band rests on a light warm-neutral shade
   (--secondary), a calm plane a step warmer than the page, with charcoal copy.

   Six words in the copy are live — complexity, users, design systems,
   Figma to code, stakeholders, vibe coder. Hovering or focusing one (desktop
   only, where the blank space to the right exists) does two things at once:

     1. the band inverts to the dark grout stage and the sticky header inverts
        with it (via HeroToneContext), so header + hero read as one dark stage;
     2. a particle field in the right-hand space reconfigures into a formation
        themed to that word — one system, many arrangements.

   Tone wiring. The header follows the hero only while the hero still sits
   beneath the header line: `dark = a keyword is active AND the hero is under
   the header`. Scroll the hero away and `underHeader` goes false, so the
   header resolves back to light over the white work gallery regardless of any
   stuck hover. All five keywords share the one dark state, so sweeping between
   them keeps the band dark continuously; a short debounce on leaving covers
   the plain text between two keywords so the band never flickers.

   Degradation. Below `lg` there is no room for the field, so the keywords are
   plain text and the band simply stands on its own light — the graceful state
   for phones and tablet portrait. At `lg`+ the keywords are buttons, so the
   payoff is reachable by mouse hover, keyboard focus, and touch tap alike
   (tap focuses the button; tapping away blurs it and the band reverts). Under
   reduced motion the band still changes colour (a permitted colour transition)
   but the field is drawn as a static composition with no movement.
──────────────────────────────────────────────────────────────────────────── */

/* The keywords whose payoff is a hover clip rather than a particle formation
   (see HeroKeywordVideo). While one is lit the particle field stands down. */
const FILMED_KEYWORDS = new Set<HeroKeyword | null>([
  "complexity",
  "users",
  "vibeCoder",
  "designSystems",
  "figmaToCode",
  "stakeholders",
]);

export function StatementHero() {
  const reduce = useReducedMotion() ?? false;
  const { setDark } = useHeroTone();
  const sectionRef = useRef<HTMLElement>(null);

  const [activeKeyword, setActiveKeyword] = useState<HeroKeyword | null>(null);
  const [interactive, setInteractive] = useState(false);

  const activeRef = useRef<HeroKeyword | null>(null);
  const underHeaderRef = useRef(true);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The header is dark only while a keyword is lit AND the hero is still the
  // thing under the header line.
  const syncTone = useCallback(() => {
    setDark(activeRef.current !== null && underHeaderRef.current);
  }, [setDark]);

  const activate = useCallback(
    (id: HeroKeyword) => {
      if (clearTimer.current) {
        clearTimeout(clearTimer.current);
        clearTimer.current = null;
      }
      activeRef.current = id;
      setActiveKeyword(id);
      syncTone();
    },
    [syncTone],
  );

  // Debounced clear: crossing the plain text between two keywords must not
  // flip the band — landing on the next keyword cancels this before it fires.
  const scheduleDeactivate = useCallback(() => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      activeRef.current = null;
      setActiveKeyword(null);
      syncTone();
      clearTimer.current = null;
    }, 150);
  }, [syncTone]);

  // Only wire the interaction where the field has room to live (lg+).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setInteractive(mq.matches);
      if (!mq.matches && activeRef.current !== null) {
        if (clearTimer.current) {
          clearTimeout(clearTimer.current);
          clearTimer.current = null;
        }
        activeRef.current = null;
        setActiveKeyword(null);
        syncTone();
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [syncTone]);

  // Track whether the hero still passes beneath the header (threshold-crossing
  // only, a handful of updates per scroll — never per frame).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const header = document.querySelector("header");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const headerH = header?.getBoundingClientRect().height ?? 56;
      const underHeader = section.getBoundingClientRect().bottom > headerH;
      if (underHeader !== underHeaderRef.current) {
        underHeaderRef.current = underHeader;
        syncTone();
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [syncTone]);

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

  const kw = (id: HeroKeyword, children: ReactNode, weight = 600) => (
    <Keyword
      id={id}
      weight={weight}
      interactive={interactive}
      onActivate={activate}
      onDeactivate={scheduleDeactivate}
    >
      {children}
    </Keyword>
  );

  const dark = activeKeyword !== null;

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      data-hero-tone={dark ? "dark" : "light"}
      className={`relative overflow-hidden transition-colors duration-500 ${
        dark ? "bg-grout text-grout-foreground" : "bg-secondary text-foreground"
      }`}
    >
      {/* Grainy grout wash over the flat CSS band flip — only at lg+, where the
          keywords are live. Sits below all copy and the field/video layers. */}
      {interactive && <HeroInkVeil active={dark} />}
      <div className="relative mx-auto w-full max-w-[1800px] px-4 pb-16 pt-10 sm:px-6 md:px-8 md:pb-24 md:pt-16 lg:px-12 lg:pb-28 lg:pt-20 xl:px-16 2xl:px-24">
        {/* The eyebrow sits above the split so the two columns below both begin
            at the headline. From lg up the hero splits into two columns: the
            thesis and body on the left, the keyword field standing in its own
            right-hand column, its top edge aligned to the headline. Below lg
            there is no room for the field, so the copy runs full width and the
            keywords fall back to plain text. */}
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
          )}
        </motion.p>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20.7rem)] lg:items-start lg:gap-10 lg:pr-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,27.6rem)] xl:gap-16 xl:pr-10 2xl:grid-cols-[minmax(0,1fr)_minmax(0,32.2rem)] 2xl:pr-14">
          <div className="min-w-0">
            <motion.h1
              {...entry(reduce ? 0 : 0.06)}
              className="max-w-[70rem] font-heading font-semibold text-4xl leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.02] xl:text-9xl xl:leading-none 2xl:text-8xl"
            >
              A decade designing for {kw("complexity", "complexity")}
            </motion.h1>

            <div className="mt-6 max-w-prose md:mt-8">
              <motion.p
                {...entry(reduce ? 0 : 0.09)}
                className="text-pretty text-base leading-relaxed"
              >
                I&apos;ve {kw("users", "designed for users")}: banks, merchants,
                internal testers, healthcare professionals. Knowing I&apos;ve
                made someone&apos;s day a little easier is what gives the work
                meaning.
              </motion.p>

              <motion.p
                {...entry(reduce ? 0 : 0.12)}
                className="mt-5 text-pretty text-base leading-relaxed md:mt-6"
              >
                I love making things simpler. I rethink clunky workflows and
                build AI ready {kw("designSystems", "design systems")}, from{" "}
                {kw("figmaToCode", "Figma to code")}, using tools like Claude
                Code to ship faster.
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

          {interactive && (
            <div className="relative hidden h-[20.7rem] w-full lg:block xl:h-[27.6rem] 2xl:h-[32.2rem]">
              {/* Idle default: the light-graded scene fills the column while no
                  keyword is lit. Sits at the back of the stack so an incoming
                  keyword clip layers over it during the brief hand-off crossfade. */}
              <HeroDefaultStill
                active={activeKeyword === null}
                src="/assets/my-capabilities/hompage-illustration.png"
              />
              {/* The filmed keywords swap the particle field for footage: while
                  one is lit the field is handed null (no formation), and its
                  clip reveals over the same square frame. The remaining keywords
                  keep their particle formations. */}
              <HeroKeywordField
                active={FILMED_KEYWORDS.has(activeKeyword) ? null : activeKeyword}
                reduced={reduce}
                className="absolute inset-0"
              />
              <HeroKeywordVideo
                active={activeKeyword === "complexity"}
                dark={dark}
                src="/assets/my-capabilities/complexity.mp4"
                poster="/assets/my-capabilities/complexity-poster.jpg"
              />
              <HeroKeywordVideo
                active={activeKeyword === "users"}
                dark={dark}
                src="/assets/my-capabilities/interface-detailing.mp4"
                poster="/assets/my-capabilities/interface-detailing-poster.jpg"
              />
              <HeroKeywordVideo
                active={activeKeyword === "vibeCoder"}
                dark={dark}
                src="/assets/my-capabilities/ai-v2.mp4"
                poster="/assets/my-capabilities/ai-v2-poster.jpg"
              />
              <HeroKeywordVideo
                active={activeKeyword === "designSystems"}
                dark={dark}
                src="/assets/my-capabilities/design-system.mp4"
                poster="/assets/my-capabilities/design-system-poster.jpg"
              />
              <HeroKeywordVideo
                active={activeKeyword === "figmaToCode"}
                dark={dark}
                src="/assets/my-capabilities/design-to-code.mp4"
                poster="/assets/my-capabilities/design-to-code-poster.jpg"
              />
              <HeroKeywordVideo
                active={activeKeyword === "stakeholders"}
                dark={dark}
                src="/assets/my-capabilities/stakeholders.mp4"
                poster="/assets/my-capabilities/stakeholders-poster.jpg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* A live word in the hero copy. At lg+ it is a real button so the payoff is
   reachable by mouse, keyboard, and touch; below lg it is plain text (the
   field it would trigger has nowhere to render). The button forces the
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

function Keyword({
  id,
  weight,
  interactive,
  onActivate,
  onDeactivate,
  children,
}: {
  id: HeroKeyword;
  weight: number;
  interactive: boolean;
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
  if (!interactive) return <span style={style}>{children}</span>;
  return (
    <button
      type="button"
      data-keyword={id}
      style={style}
      onPointerEnter={() => onActivate(id)}
      onPointerLeave={(event) => {
        if (document.activeElement !== event.currentTarget) onDeactivate();
      }}
      onFocus={() => onActivate(id)}
      onBlur={onDeactivate}
      className={`inline cursor-pointer rounded-[2px] bg-transparent p-0 underline decoration-current/40 decoration-dotted decoration-1 underline-offset-[0.18em] outline-none [font:inherit] [letter-spacing:inherit] hover:decoration-current focus-visible:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current${
        varName ? "" : " text-inherit"
      }`}
    >
      {children}
    </button>
  );
}
