"use client";

/*
 * EXPLORE / CARDS — direction A: "The Type Index".
 *
 * THE ARGUMENT
 *
 *   Four projects cannot fill a five-across row of identical cards without the
 *   row reading as a thin catalogue. So the project stops being a card and
 *   becomes a NAME, set at display scale, in a stack of ruled rows. Imagery
 *   moves off the row entirely and into ONE stage pinned beside the list.
 *   Pointing at a row (or tabbing to it) plays that project's cover in the
 *   stage; moving between rows cross-fades it. Everything else recedes.
 *
 *   The load-bearing consequence is the one the current grid cannot offer:
 *   EXACTLY ONE COVER IS MOUNTED AND RUNNING AT ANY MOMENT. Not four idling
 *   scenes competing for the same eye — one, chosen by where the reader is
 *   looking. Reference: A24's film index and Freshman's directors list, where
 *   the type is the object and the picture is peripheral.
 *
 * WHAT MAKES THE ROW A ROW. Three parts, and each encodes something true:
 *   - the NAME at display scale, because a name is what a reader is scanning;
 *   - the INDUSTRY as a raised annotation on the name, not a chip below it —
 *     the sector qualifies the project the way a footnote marker qualifies a
 *     word. Below `md` it drops to a kicker line, same node, no duplicated text;
 *   - the PUBLISHED OUTCOME right-aligned, where a film index puts the year.
 *     Only Healthdirect carries one, and the three empty slots are left empty
 *     on purpose: the asymmetry states which claim is citable.
 *
 * THE RECEDE IS A TOKEN CHANGE, NOT AN OPACITY DIP. Fading unhovered rows to
 * ~0.5 is the obvious move and it quietly breaks contrast (charcoal at 0.5 on
 * --secondary lands near 2.7:1). Instead the inactive rows move from
 * `text-foreground` to `text-muted-foreground`, which is held to >= 7:1 on every
 * reading surface by style-rules §4. Same read, no contrast cost, and it is a
 * colour transition — the one thing §7 still lets CSS do.
 *
 * TWO ENTRIES THAT HAVE TO BE HANDLED, NOT HIDDEN:
 *
 *   funding-finder has NO cover. Its stage plate is not a hole and not a
 *   borrowed cover: it is that project's own field artwork from projectFields.ts
 *   (the floating rose mass, ink #7d0c37 at 7.0:1 measured there) carrying its
 *   tagline where the other three carry their hook line. The entry with no film
 *   simply opens where the others finish.
 *
 *   The coming-soon placeholder is DELETED as a row and re-stated as the index's
 *   closing line. In a grid a placeholder can be a tile, because tiles are a set
 *   and an empty one reads as room. In a type index every row is a name you can
 *   open, so a name you cannot open is a lie — and at display scale it is a loud
 *   one. It becomes one quiet line under the last rule instead.
 *
 * MOBILE. There is no hover and no room for a side stage, so the stage is not
 * hidden — it is redistributed. Each row grows its own inline plate and the
 * VIEWPORT becomes the pointer: a plate mounts as it approaches and plays its
 * cover while it sits in the middle band of the screen, reversing its own
 * dissolve back to the flat field as it leaves (the covers' ramps are position
 * based, so this costs nothing extra). At most one or two plates exist at a
 * time, so the direction's central claim survives the phone rather than being
 * abandoned on it.
 *
 * Content is read whole from ../content. Nothing here hardcodes a title, slug,
 * tagline, figure, or URL.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { motionDuration, motionEase } from "../../lib/motion";
import { IndustryGlyph } from "../../components/IndustryGlyph";
import { ProjectCover } from "../../components/ProjectCover";
import { getField } from "../../components/projectFields";
import type { CaseStudyEntry, WorkCoverId } from "../../work/projects";
import { caseStudies, featuredSlug, outcomes } from "../content";
import { coverOf, useMediaQuery, usePlayNextFrame } from "./shared";

const frame =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* Small uppercase label role (style-rules §3/§4): foreground ink at semibold on
   this neutral surface (~11:1), tracked into the documented 0.16em–0.28em
   display range. 0.22em is where "Financial services" separates into words. */
const eyebrow =
  "font-heading text-xs font-semibold uppercase tracking-[0.22em] text-foreground";

export function DirectionTypeIndex() {
  /* The stage is a pointer/keyboard instrument. Below lg it does not exist, so
     it must not mount a cover even if a keyboard user reaches a row there —
     the inline plates own that width. */
  const wide = useMediaQuery("(min-width: 1024px)");
  /* Slug and paint order held as one value: the newest stage layer must always
     sit above the one it is replacing, whatever order AnimatePresence keeps its
     exiting child in. Without an explicit z-index the cross-fade can render as a
     cut (old layer on top, then a hard swap) instead of a dissolve. */
  const [stage, setStage] = useState<{ slug: string | null; layer: number }>({
    slug: null,
    layer: 1,
  });

  const activate = useCallback((slug: string) => {
    setStage((current) =>
      current.slug === slug ? current : { slug, layer: current.layer + 1 },
    );
  }, []);

  const deactivate = useCallback((slug: string) => {
    setStage((current) =>
      current.slug !== slug ? current : { slug: null, layer: current.layer + 1 },
    );
  }, []);

  const active = wide ? caseStudies.find((entry) => entry.slug === stage.slug) : undefined;

  return (
    <div className="bg-background text-foreground">
      <section aria-label="Selected work" className="border-t border-border">
        <div className={`${frame} py-16 md:py-24 lg:py-28 xl:py-36`}>
          <p className={eyebrow}>Selected work</p>

          {/* At lg the index takes seven of twelve columns and the stage takes
              four, with one column of air between them so the display type
              never runs up against the plate. Below lg there is one column and
              the plates live inside the rows. */}
          <div className="mt-8 md:mt-10 lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <IndexList activeSlug={active?.slug ?? null} onActivate={activate} onDeactivate={deactivate} />
            </div>

            <div className="hidden lg:col-span-5 lg:block xl:col-span-4">
              <Stage entry={active} layer={stage.layer} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── The list ─────────────────────────────────────────────────────────────── */

function IndexList({
  activeSlug,
  onActivate,
  onDeactivate,
}: {
  activeSlug: string | null;
  onActivate: (slug: string) => void;
  onDeactivate: (slug: string) => void;
}) {
  const shouldReduce = useReducedMotion();

  /* The house list cascade, hand-rolled rather than borrowed from
     MotionRevealGroup because each row has to carry Motion's own hover events
     (so a touch tap never fires the stage). Same recipe: `fast` items, 0.05s
     apart, four rows — 350ms total, inside the < 500ms interactive budget. */
  const list: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
  };
  const row: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
      },
    },
  };

  return (
    <>
      <motion.ul
        className="border-t border-border"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        variants={list}
      >
        {caseStudies.map((entry) => (
          <IndexRow
            key={entry.slug}
            entry={entry}
            variants={row}
            active={activeSlug === entry.slug}
            dimmed={activeSlug !== null && activeSlug !== entry.slug}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        ))}
      </motion.ul>

      {/* The coming-soon placeholder, demoted out of the list. See the header:
          a row in this format is a name you can open, and this is not one. */}
      <p className="py-6 text-sm leading-relaxed text-muted-foreground md:py-8">
        More work is on the way.
      </p>
    </>
  );
}

function IndexRow({
  entry,
  variants,
  active,
  dimmed,
  onActivate,
  onDeactivate,
}: {
  entry: CaseStudyEntry;
  variants: Variants;
  active: boolean;
  dimmed: boolean;
  onActivate: (slug: string) => void;
  onDeactivate: (slug: string) => void;
}) {
  const shouldReduce = useReducedMotion();
  const outcome = outcomes[entry.slug];

  const enter = useCallback(() => onActivate(entry.slug), [entry.slug, onActivate]);
  const leave = useCallback(() => onDeactivate(entry.slug), [entry.slug, onDeactivate]);

  return (
    /* Motion's hover events, not CSS :hover — a touch tap must not drive the
       stage (style-rules §8, and the same contract every cover is built on).
       Focus is wired to the identical handlers on the link inside, so a keyboard
       reader gets the stage exactly as a pointer reader does. */
    <motion.li
      variants={variants}
      onHoverStart={enter}
      onHoverEnd={leave}
      className="border-b border-border"
    >
      <Link
        href={`/work/${entry.slug}`}
        onFocus={enter}
        onBlur={leave}
        aria-label={[
          `Open the ${entry.title} case study.`,
          entry.tagline,
          outcome ? `Published outcome: ${outcome}.` : null,
        ]
          .filter(Boolean)
          .join(" ")}
        className="group block py-9 outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background md:py-12 lg:py-14"
      >
        {/* ONE container, two arrangements. On a phone it is a flex column read
            in `order`: name, plate, tagline, metadata — the plate lands where
            the eye already is and the metadata closes the row. At lg it becomes
            the twelve-column index row: name and tagline stacked on the left,
            metadata held in a right-hand column spanning both. */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6">
          {/* The name leads the row and every name starts on the same left edge
              — which is why the sector TRAILS it as a raised annotation rather
              than prefixing it. One node: a kicker line below md, an inline
              superscript from md up, so nothing is announced twice. */}
          <h3
            className={`order-1 flex flex-col text-balance font-heading text-4xl font-medium leading-[1.02] tracking-[-0.02em] transition-colors duration-100 sm:text-5xl md:block lg:col-span-9 lg:row-start-1 lg:text-5xl xl:text-6xl ${
              dimmed ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            <span>{entry.title}</span>
            {entry.industry ? (
              /* Written after the name so it reads as an annotation on it, and
                 pulled above the name on a phone with `order` rather than a
                 second copy of the text — the h3 is a flex column below md and
                 a plain block from md up, where the label becomes the
                 superscript. */
              <span className="order-first mb-3 text-xs font-semibold uppercase tracking-[0.22em] md:mb-0 md:ml-4 md:align-super">
                {entry.industry}
              </span>
            ) : null}
          </h3>

          {/* The phone's answer to the stage: the row grows its own plate. */}
          <InlinePlate entry={entry} />

          {/* The tagline stays on --muted-foreground in both states. It is small
              text, so §4 holds it at >= 7:1 already and there is nowhere quieter
              for it to recede to; the recede is carried by the name above it. */}
          <p className="order-3 mt-5 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground lg:col-span-9 lg:col-start-1 lg:row-start-2 lg:max-w-[52ch]">
            {entry.tagline}
          </p>

          {/* Metadata, where a film index puts the year. The arrow leads the
              column so all four align down the right edge whether or not the
              row has a figure under it; only Healthdirect does, and the three
              empty slots state which claim is citable. */}
          <div className="order-4 mt-5 flex items-center gap-4 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:mt-2 lg:flex-col lg:items-end lg:text-right">
            <motion.span
              aria-hidden="true"
              className="order-2 ms-auto shrink-0 lg:order-1 lg:ms-0"
              initial={false}
              animate={{ x: shouldReduce ? 0 : active ? 4 : 0 }}
              transition={{ duration: motionDuration.instant, ease: motionEase.out }}
            >
              <ArrowRight
                className={`size-5 transition-colors duration-100 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={1.75}
              />
            </motion.span>

            {outcome ? (
              <p
                className={`order-1 max-w-[22ch] text-sm font-semibold leading-snug transition-colors duration-100 lg:order-2 lg:mt-5 ${
                  dimmed ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {outcome}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

/* ── The stage ────────────────────────────────────────────────────────────── */

/**
 * The single pinned cover stage. Exactly one plate is live: the pointed-at (or
 * focused) project's cover, played in its hovered state so the halftone forms
 * and scatters into the hook line as the plate arrives — one gesture, not a
 * fade followed by an animation.
 *
 * THE CROSS-FADE IS ONE-SIDED ON PURPOSE. The outgoing layer holds at full
 * opacity and is simply covered by the incoming one, which fades 0 -> 1 above it
 * on an explicit z-index. Fading both would dip the composite in the middle of
 * the swap and flash the plate beneath; holding the old one means the reader
 * only ever sees a dissolve into the new scene. Two covers are mounted for the
 * 300ms of a swap and one at every other moment.
 *
 * Decorative: the rows carry every fact the stage illustrates, so the whole
 * frame is aria-hidden (the same contract as the home card's media frame).
 */
function Stage({ entry, layer }: { entry: CaseStudyEntry | undefined; layer: number }) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="lg:sticky lg:top-8">
      <div
        aria-hidden="true"
        className="relative aspect-[4/5] overflow-hidden xl:aspect-[3/4]"
      >
        <AnimatePresence>
          <motion.div
            key={entry?.slug ?? "rest"}
            className="absolute inset-0"
            style={{ zIndex: layer }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            /* Hold, do not fade: the incoming layer above does the work. */
            exit={{ opacity: 1 }}
            transition={{
              duration: shouldReduce ? 0.01 : motionDuration.base,
              ease: motionEase.out,
            }}
          >
            {entry ? <StagePlate entry={entry} hook /> : <RestPlate />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** The active project's plate: its real cover, or its field artwork if it has none. */
function StagePlate({ entry, hook }: { entry: CaseStudyEntry; hook: boolean }) {
  const cover = coverOf(entry);
  const play = usePlayNextFrame();

  return cover ? (
    <ProjectCover cover={cover} hovered={play} className="absolute inset-0 h-full w-full" />
  ) : (
    <StillPlate entry={entry} hook={hook} />
  );
}

/**
 * The plate for an entry with no cover, and the direction's answer to the honest
 * test case.
 *
 * It is not a hole, not a borrowed cover, and not invented copy. It is that
 * project's OWN field artwork from projectFields.ts — the composed rose mass
 * authored for its card — carrying its sector mark as the one figure on it. Read
 * against the three animated covers it is deliberately quiet and deliberately
 * light: sweeping the list you can tell at a glance which project has a film and
 * which does not, with no label saying so, and the plate is still a picture
 * rather than a gap. The covers' own resting state, for comparison, is a bare
 * flat rectangle of field colour with nothing on it at all.
 *
 * `hook` is the responsive half. On the desktop stage the plate carries the
 * project's tagline where a cover carries its hook line, because the row's copy
 * is a column away. Inline on a phone the row's tagline sits directly beneath
 * the plate, so the text is dropped and the mark carries it alone — the same
 * plate, composed for where it is.
 *
 * Type and spacing come from the standard scale rather than the container units
 * the covers use. A cover is one scene that has to compose from a 320px card to
 * a full-bleed plate, which is what earns it the §2 carve-out; this plate lives
 * at exactly two known sizes, so the scale is both simpler and more predictable.
 * Ink is the project's measured artwork constant: #7d0c37 clears 7.0:1 on the
 * worst cell of its own field, recorded in projectFields.ts.
 */
function StillPlate({ entry, hook }: { entry: CaseStudyEntry; hook: boolean }) {
  const field = getField(entry.slug);

  return (
    <div
      className={`absolute inset-0 flex flex-col overflow-hidden ${
        hook ? "items-start justify-end gap-5 p-6 xl:p-8" : "items-center justify-center p-6"
      }`}
      style={{ backgroundColor: field.ground, backgroundImage: field.image, color: field.ink }}
    >
      <IndustryGlyph
        industry={entry.industry}
        className={hook ? "size-10 shrink-0 xl:size-12" : "size-12 shrink-0 sm:size-14"}
      />

      {hook ? (
        <p className="max-w-[16ch] text-balance font-heading text-2xl font-semibold leading-[1.1] tracking-[-0.02em] xl:text-3xl">
          {entry.tagline}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The stage before anything is pointed at. Not an empty frame and not an
 * instruction to hover: the one published figure on the site, set at display
 * scale with the project it belongs to as its byline. It gives the stage a
 * reason to be looked at before the reader touches anything, and every word of
 * it is also in the rows, so nothing is available only here.
 */
function RestPlate() {
  const featured = caseStudies.find((entry) => entry.slug === featuredSlug);
  const outcome = featured ? outcomes[featured.slug] : undefined;

  return (
    <div className="absolute inset-0 flex flex-col justify-center bg-muted p-8 xl:p-10">
      {outcome && featured ? (
        <>
          <p className={eyebrow}>Published outcome</p>
          <p className="mt-6 max-w-[14ch] text-balance font-heading text-3xl font-medium leading-[1.06] tracking-[-0.015em] text-foreground xl:text-4xl">
            {outcome}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{featured.title}</p>
        </>
      ) : null}
    </div>
  );
}

/* ── The phone's stage ────────────────────────────────────────────────────── */

/**
 * Below lg the stage is redistributed into the rows, and the viewport takes the
 * pointer's job. Two thresholds, both from the same `useInView`:
 *
 *   MOUNT   a generous 200px band, so the plate exists slightly before it is
 *           seen and there is never a blank frame scrolling in.
 *   PLAY    the middle half of the screen. While the plate sits there its cover
 *           runs `hovered`; as it leaves, `hovered` drops and the cover reverses
 *           its own ramps back to the flat field. The covers are position based
 *           and interruptible by construction, so scrolling back up mid-dissolve
 *           retargets rather than queues.
 *
 * Rows are tall enough that one plate is usually the only one in the play band,
 * which is the mobile form of this direction's whole argument.
 */
function InlinePlate({ entry }: { entry: CaseStudyEntry }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "200px 0px 200px 0px" });
  const centred = useInView(ref, { margin: "-25% 0px -25% 0px" });
  const cover = coverOf(entry);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative order-2 mt-7 aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/10] lg:hidden"
    >
      {near ? (
        cover ? (
          <InlineCover cover={cover} playing={centred} />
        ) : (
          <StillPlate entry={entry} hook={false} />
        )
      ) : null}
    </div>
  );
}

/* One frame of grace before the cover is told to play, for the same StrictMode
   reason the stage needs it: a plate can mount already inside the play band. */
function InlineCover({ cover, playing }: { cover: WorkCoverId; playing: boolean }) {
  const play = usePlayNextFrame();

  return (
    <ProjectCover
      cover={cover}
      hovered={play && playing}
      className="absolute inset-0 h-full w-full"
    />
  );
}
