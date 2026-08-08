"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "@/app/lib/motion";
import { sectionHeading, sectionLede } from "@/app/components/Chapter";
import { MaskReveal } from "@/app/components/MaskReveal";
import { MotionReveal } from "@/app/components/MotionReveal";

/**
 * The closing chapter's artifact: the unbuilt native app, walked one screen at
 * a time.
 *
 * Three constraints shaped this, in order:
 *
 * 1. **The captures are up to 1:4.13.** Three of the five are full-page scroll
 *    exports (1080 × 4458, 4458, 4104); two are exactly one viewport
 *    (1080 × 2400). A row of five would be either illegible or absurdly tall,
 *    so the flow pages through ONE persistent phone whose screen is a bounded
 *    9:20 window — the two short screens fill it edge to edge with nothing to
 *    scroll, and the three long ones scroll vertically inside it, the way you
 *    would scroll a Figma prototype. This is deliberately the same device
 *    grammar as the decisions band above (`FeatureChips`' PersistentPhoneFrame):
 *    by the time a reader reaches this chapter they have already learned that a
 *    phone screen on this page scrolls, and a second, different device on one
 *    page would only teach it twice.
 *
 * 2. **It is a sequence, not a set.** Where the decisions band is four parallel
 *    choices behind pills, this is one journey with a first and a last screen,
 *    so the control is a track rather than a chip row: the app's own progress
 *    bar below `lg`, and a vertical dotted track at `lg` that rhymes with the
 *    dated day list on the final screen. Steps are named, never numbered
 *    (house rule), and the last two labels — "What to do", "Follow up" — are
 *    lifted straight off the concept's own tab bar.
 *
 * 3. **It never shipped.** The chapter says so in words rather than in styling
 *    tricks; the treatment here stays a quiet reading tile instead of borrowing
 *    the dark full-bleed stage the shipped work earned.
 *
 * Radius note: the phone is a device frame, which CLAUDE.md's `rounded-xs`
 * screenshot rule already carves out for (`FeatureChips.tsx` — "a bezel is not
 * a card"). The bezel and screen radii are the exact values that component uses
 * so the two handsets on this page read as one object, and the clip lives on
 * the shadow-bearing bezel so no square shadow can halo the rounded screen.
 */

/* The exports all share one geometry: a 1080px-wide app capture sitting at
   (189, 180) inside a 1470px-wide canvas, with the rest of the canvas a
   transparent margin carrying the designer's own drop shadow. Rendering that
   margin would inset every screen inside the phone by a visible gutter, so the
   crop is done in CSS, and the PNGs on disk stay untouched (asset-weight rule:
   these go through next/image, so a re-encode would move nothing for visitors).

   The offsets are percentage MARGINS on an in-flow image, not `top`/`left` on
   an absolutely positioned one: percentage margins always resolve against the
   containing block's width, which is the same reference for all five files
   however tall they are. `top: -16.6%` would have resolved against each
   wrapper's own height instead, i.e. a different crop per screen. */
const CANVAS_WIDTH = 1470;
const CAPTURE_WIDTH = 1080;
const CAPTURE_X = 189;
const CAPTURE_Y = 180;

/* The phone's screen window: 1080 × 2400, the design frame these were exported
   at. Any capture taller than this scrolls inside the window. */
const SCREEN_HEIGHT = 2400;

const cropStyle = {
  width: `${(CANVAS_WIDTH / CAPTURE_WIDTH) * 100}%`,
  marginLeft: `${(-CAPTURE_X / CAPTURE_WIDTH) * 100}%`,
  marginTop: `${(-CAPTURE_Y / CAPTURE_WIDTH) * 100}%`,
} as const;

/* Device radii, matched to FeatureChips so both phones on this page are the
   same object: a soft bezel, and a screen clipped one step tighter so the
   cutout still reads as crisp. */
const BEZEL_RADIUS = "rounded-[1.5rem]";
const SCREEN_RADIUS = "rounded-xl";

type ConceptScreen = {
  id: string;
  /** Track label — the reader's name for this step. Never a number. */
  step: string;
  /** What this screen is doing in the flow, in one or two sentences. */
  caption: string;
  /** Path under /public. Spaces are URL-encoded; the files keep their names. */
  src: string;
  alt: string;
  /** Intrinsic file height, so the browser reserves the ratio before load. */
  fileHeight: number;
  /** Height of the opaque capture inside the file, i.e. the screen's own length. */
  captureHeight: number;
};

/* Order follows the product, not the filenames: "2-basic info" is question one
   (who is this check for) and "1-gender" is question three, so they run Q1 then
   Q3 here — the question counters are legible on the captures, and reversing
   them would read as an error. */
const screens: ConceptScreen[] = [
  {
    id: "profiles",
    step: "Profiles",
    caption:
      "The app opens on the household. A parent can start a check for a child without entering their details again.",
    src: "/assets/healthdirect/mobile-native/0-Logged%20in%20users.png",
    alt: "Native app home screen with family profiles for Charlie and Aliya, above cards for checking symptoms, checking risk of disease, viewing My Health Record, exploring health topics, and finding a service",
    fileHeight: 4638,
    captureHeight: 4458,
  },
  {
    id: "who-for",
    step: "Who it is for",
    caption:
      "The first question names the person being checked, so an adult checking on someone else never has to answer as themselves.",
    src: "/assets/healthdirect/mobile-native/2-basic%20info.png",
    alt: "Basic info, question one: 'Hi Jenny, who is this symptom check for?' with You, Charlie, and Someone else options and a nickname field",
    fileHeight: 2790,
    captureHeight: 2400,
  },
  {
    id: "about-you",
    step: "About you",
    caption:
      "The web tool's rhythm carries over. One decision a screen, targets big enough for a thumb, and the stage you are in named at the top.",
    src: "/assets/healthdirect/mobile-native/1-gender.png",
    alt: "Basic info, question three: 'What is your sex at birth?' with large Female and Male cards and a 'Why am I being asked this?' link",
    fileHeight: 2790,
    captureHeight: 2400,
  },
  {
    id: "what-to-do",
    step: "What to do",
    caption:
      "The answer arrives as a plan. Care options keep the order of recommendation from the redesign, and the nearest GP is one tap away.",
    src: "/assets/healthdirect/mobile-native/4-What%20to%20do%20-%20GP.png",
    alt: "Help and advice result for dizziness, face pain, and impaired memory: see a GP today, a 'Find your nearest GP' button, and care options listed as Virtual Care Clinics, GP, then Urgent Care Clinics",
    fileHeight: 4638,
    captureHeight: 4458,
  },
  {
    id: "follow-up",
    step: "Follow up",
    caption:
      "The part a web session could never do. Five dated days of self care, so the advice is still there once the check is closed.",
    src: "/assets/healthdirect/mobile-native/5-Follow%20up%20care%20advice.png",
    alt: "A five day follow up plan dated 18 to 22 December, one card per day covering self care in the first 48 hours, medical issues, coping with stress and anxiety, taking a RAT test, and what to do if severe symptoms continue",
    fileHeight: 4494,
    captureHeight: 4104,
  },
];

/* Arrow keys inside the screen scroll the capture rather than bubbling out to
   the page. Lifted from FeatureChips so inner scrolling behaves identically on
   both devices; native focusable-scroll already covers Space, Page, Home, and
   End. */
function scrollOnArrows(event: KeyboardEvent<HTMLDivElement>) {
  event.stopPropagation();
  const el = event.currentTarget;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    el.scrollBy({ top: 48 });
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    el.scrollBy({ top: -48 });
  }
}

type NativeConceptFlowProps = {
  /** The honesty kicker, e.g. that this never shipped. */
  eyebrow: string;
  /** Section heading — the concept's thesis in one line. */
  heading: string;
  /** The framing sentence beneath it. */
  lede: string;
  className?: string;
};

export function NativeConceptFlow({
  eyebrow,
  heading,
  lede,
  className,
}: NativeConceptFlowProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const active = screens[index];
  const scrollable = active.captureHeight > SCREEN_HEIGHT;
  const slideOffset = shouldReduce ? 0 : 24;

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * slideOffset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -slideOffset }),
  };

  const goTo = (next: number) => {
    if (next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  return (
    <div
      className={cn(
        /* Fixed desktop tracks rather than a 1fr split. An elastic reading
           column would stretch the lede to the tile's full width and leave the
           surplus as a gap between the two halves; fixed tracks pack left and
           send the surplus to the outer margin, which is how the rest of the
           page treats its air. Tops align, so the heading and the phone's top
           edge start on one line. */
        "grid gap-8 lg:grid-cols-[22rem_19rem] lg:items-start lg:gap-12 xl:grid-cols-[26rem_22rem] xl:gap-20",
        className,
      )}
    >
      {/* The reading column: the section's own heading and lede sit here rather
          than full width above, because a 9:20 handset is far taller than a
          five row track and a two line caption — split the other way and the
          tile opens a hole in its middle. Set as a column beside the device,
          the two sides come out near enough the same height and the section
          reads as a spread. */}
      <div>
        <MotionReveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        </MotionReveal>
        <MaskReveal
          as="h2"
          mode="word"
          duration="fast"
          className={`mt-3 ${sectionHeading}`}
          text={heading}
        />
        <MotionReveal>
          <p className={sectionLede}>{lede}</p>
        </MotionReveal>

        {/* The track and its caption. Below lg it is the concept's own progress
            bar — five segments filling as the flow advances, each a full height
            44px touch target with only the bar drawn. At lg it stands up into a
            named vertical track that rhymes with the dated day list on the last
            screen. */}
        <div className="relative mt-10 md:mt-14">
          {/* The track's spine, drawn between the first and last dot only, so
              the list reads as a run rather than a rule with loose ends. */}
          <span
            aria-hidden="true"
            className="absolute left-1.5 top-5 bottom-5 hidden w-px bg-border lg:block"
          />
          <ol className="flex gap-1.5 sm:gap-3 lg:flex-col lg:gap-0">
            {screens.map((screen, step) => {
              const isActive = step === index;
              const isDone = step <= index;
              return (
                <li key={screen.id} className="flex-1 lg:flex-none">
                  <button
                    type="button"
                    onClick={() => goTo(step)}
                    aria-current={isActive ? "true" : undefined}
                    /* Named in full because below sm the button draws only its
                       bar. The visible label is contained in the accessible
                       name at the widths that show one (WCAG 2.5.3). */
                    aria-label={`Show the ${screen.step} screen`}
                    /* Full width below lg so the segment and its label are one
                       target across the bar; auto width at lg so the focus ring
                       hugs the row's own words instead of stretching the width
                       of the reading column. */
                    className="group flex min-h-11 w-full flex-col justify-center gap-2 rounded-md pb-1 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:justify-start lg:min-h-0 lg:w-auto lg:flex-row lg:items-start lg:gap-3 lg:rounded-sm lg:py-2.5 lg:pb-2.5"
                  >
                    {/* Below lg: the segment bar, reading like the concept's
                        own "1 of 5" progress bar. Steps already visited hold a
                        lighter fill than the current one, so the bar says where
                        you are as well as how far in you have come. */}
                    <span
                      className={cn(
                        "block h-1.5 w-full shrink-0 rounded-full transition-colors lg:hidden",
                        isActive
                          ? "bg-primary"
                          : isDone
                            ? "bg-primary/45"
                            : "bg-border group-hover:bg-primary/40",
                      )}
                    />
                    {/* At lg: the dot on the spine, then the step name. */}
                    {/* `relative` so the dot paints over the spine — the spine
                        is absolutely positioned and would otherwise draw a line
                        straight through every marker. */}
                    <span className="relative mt-0.5 hidden w-3 shrink-0 justify-center lg:flex">
                      <span
                        className={cn(
                          "size-2.5 rounded-full border-2 bg-card transition-colors",
                          isActive
                            ? "border-primary bg-primary"
                            : "border-border group-hover:border-primary/60",
                        )}
                      />
                    </span>
                    {/* The step name. Hidden only at the widths where five of
                        them cannot sit side by side; from sm it labels its own
                        segment, and at lg it labels its dot. */}
                    <span
                      className={cn(
                        "hidden text-xs leading-snug transition-colors sm:block lg:text-sm",
                        isActive
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {screen.step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* One caption slot with a reserved height, so paging never shunts the
            phone up and down the page on narrow screens. The step name is
            visible only where the track cannot show it. */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="mt-6 min-h-28 sm:min-h-20 lg:mt-8 lg:min-h-24"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduce ? 0.01 : motionDuration.fast,
                ease: motionEase.out,
              }}
            >
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground sm:sr-only">
                {active.step}
              </h3>
              <p className="mt-2 max-w-prose text-base leading-relaxed text-foreground lg:mt-0">
                {active.caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* The phone. The bezel is the shadow-bearing element and carries the
          clip, so the shadow follows the rounded device rather than boxing it. */}
      <div className="mx-auto w-full max-w-[19rem] lg:mx-0 lg:max-w-none">
        <div
          className={cn(
            "bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-card",
            BEZEL_RADIUS,
          )}
        >
          <div
            className={cn("relative overflow-hidden bg-card", SCREEN_RADIUS)}
            style={{ aspectRatio: `${CAPTURE_WIDTH} / ${SCREEN_HEIGHT}` }}
          >
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={active.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: shouldReduce ? 0.01 : motionDuration.base,
                  ease: motionEase.out,
                }}
                className="h-full"
              >
                {/* Each screen is its own scroll container, so paging always
                    arrives at the top of the new screen. */}
                <div
                  tabIndex={0}
                  role="group"
                  aria-label={`Scrollable preview: ${active.alt}`}
                  onKeyDown={scrollOnArrows}
                  className={cn(
                    "h-full overflow-y-auto overscroll-contain outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    SCREEN_RADIUS,
                  )}
                >
                  {/* Sized to the capture's own length, so a one-viewport
                      screen has nothing to scroll and a long one scrolls
                      exactly as far as it runs — the transparent export margin
                      never becomes empty scroll. */}
                  <div
                    className="overflow-hidden"
                    style={{
                      aspectRatio: `${CAPTURE_WIDTH} / ${active.captureHeight}`,
                    }}
                  >
                    <Image
                      src={active.src}
                      alt={active.alt}
                      width={CANVAS_WIDTH}
                      height={active.fileHeight}
                      sizes="(min-width: 1024px) 480px, 100vw"
                      quality={90}
                      className="block h-auto max-w-none"
                      style={cropStyle}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quiet cue that the screen runs on under the bezel. Only for the
                screens that actually scroll. */}
            {scrollable ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-gradient-to-b from-transparent to-grout/30"
              />
            ) : null}
          </div>
        </div>
        {scrollable ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This screen runs longer than the phone. Scroll inside it to see the
            rest.
          </p>
        ) : null}
      </div>

      {/* Every step as plain text, so nothing here is reachable only by paging. */}
      <ol className="sr-only">
        {screens.map((screen) => (
          <li key={screen.id}>
            {screen.step}. {screen.caption} {screen.alt}.
          </li>
        ))}
      </ol>
    </div>
  );
}
