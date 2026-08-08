"use client";

/*
 * EXPLORE — direction two: "Feature and Rail".
 *
 * THE ARGUMENT
 *
 *   Hierarchy, and writing that costs no extra scroll. One case study runs at
 *   feature scale; the articles sit BESIDE it in a narrow rail rather than
 *   below it in a band of their own, so the writing is visible without a second
 *   scroll section. The remaining case studies follow as an even row.
 *
 * THE ONE INVERSION worth arguing about: inside the feature, the OUTCOME is set
 * larger than the project's own name. The published figure is the strongest
 * single piece of evidence on the site, so it gets the display size and the
 * project title becomes its byline. A landing page for a hiring reader should
 * lead with what changed, not with what it was called.
 *
 * The feature and the rail sit on one plane, divided by a vertical hairline —
 * no panel, no card. The rule is the structural device: it says "these two
 * things are beside each other", which is the entire direction. Card weight is
 * spent below, on the supporting ProjectCards, so the page has exactly one card
 * layer instead of three competing ones.
 *
 * Content is read whole from ./content — nothing here hardcodes a title, slug,
 * tagline, figure, or URL.
 */

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { MotionReveal, MotionRevealGroup, MotionRevealItem } from "../components/MotionReveal";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectCover } from "../components/ProjectCover";
import type { WorkCoverId } from "../work/projects";
import {
  articles,
  capabilityFilms,
  caseStudies,
  elsewhere,
  featuredSlug,
  hero,
  outcomes,
  type CapabilityFilm,
} from "./content";
import { ExploreCapabilityFilm } from "./ExploreCapabilityFilm";
import { ExploreHeroPlain } from "./ExploreHeroPlain";

/* Shared page frame: the site's container and gutters, kept identical across
   every band of this direction so the feature, the row, and the colophon share
   one left edge. */
const frame =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* The small uppercase label role, per style-rules §3/§4: foreground ink at
   semibold on this neutral surface (about 11:1), tracked past the utility scale
   into the documented 0.16em–0.28em display range. 0.22em is where the longest
   label in the set ("Featured case study") separates into words. */
const eyebrowBase = "font-heading text-xs font-semibold uppercase tracking-[0.22em]";
const eyebrow = `${eyebrowBase} text-foreground`;
/* Same label role on the one ink band. --foreground is charcoal and disappears
   on grout, so the band's own on-surface token carries it (§3: on a dark band
   the caption stays on the readable on-surface token). #F1ECE5 on #191714 is
   about 15:1, clear of the 7:1 small-text bar. */
const eyebrowOnGrout = `${eyebrowBase} text-grout-foreground`;

export function DirectionFeatureRail() {
  const featured = caseStudies.find((entry) => entry.slug === featuredSlug);
  const supporting = caseStudies.filter((entry) => entry.slug !== featuredSlug);

  return (
    /* One warm --secondary canvas from the hero down, the same paper the live
       home page uses, so the ProjectCards below read as lit objects against it
       (and their focus ring, which offsets onto --secondary, lands correctly). */
    <div className="bg-secondary text-foreground">
      <ExploreHeroPlain compact />

      <section aria-label="Featured case study and writing" className="border-t border-border">
        <div className={`${frame} py-12 md:py-16 lg:py-20 xl:py-24`}>
          {/* Below lg this is one column in reading order: feature, then the
              writing rail as full-width rows. At lg the rail moves beside the
              feature on a 12-column grid and narrows again at xl, where the
              feature can afford the extra width. */}
          <div className="grid grid-cols-1 gap-10 md:gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
            <div className="lg:col-span-8 xl:col-span-9">
              {featured ? <Feature entry={featured} /> : null}
            </div>

            <div className="lg:col-span-4 xl:col-span-3">
              <WritingRail />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="fr-more-heading" className="border-t border-border">
        <div className={`${frame} py-12 md:py-16 lg:py-20 xl:py-24`}>
          <MotionReveal>
            <h3 className={eyebrow} id="fr-more-heading">
              More case studies
            </h3>
          </MotionReveal>

          {/* The even row the direction promises. Deliberately no "coming soon"
              tile: the feature above already carries the weight, and a
              placeholder here would read as a gap in an otherwise complete row.

              ProjectCard caps its own artwork at max-w-sm, so a three-up row in
              an 1800px container would centre three small cards inside oversized
              cells and drift right of the section's left edge. Capping the row at
              max-w-7xl (three capped cards plus their gaps) keeps the first card
              flush with the eyebrow above it at every width; past 2xl the row is
              simply a capped, left-aligned row. */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mt-10 lg:max-w-7xl lg:grid-cols-3 lg:gap-10 xl:gap-12">
            {supporting.map((entry, index) => (
              <ProjectCard entry={entry} index={index} key={entry.slug} />
            ))}
          </div>
        </div>
      </section>

      <CapabilityStrip />

      <Colophon />
    </div>
  );
}

/* ── The feature ──────────────────────────────────────────────────────────── */

type FeaturedEntry = (typeof caseStudies)[number];

function Feature({ entry }: { entry: FeaturedEntry }) {
  /* Hover AND focus drive the cover, so a keyboard reader gets the same state a
     pointer reader does (style-rules §8). The cover owns its own reduced-motion
     behaviour, so nothing is gated here. */
  const shouldReduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const activate = useCallback(() => setActive(true), []);
  const deactivate = useCallback(() => setActive(false), []);

  const cover = entry.media && "cover" in entry.media ? entry.media.cover : undefined;
  const outcome = outcomes[entry.slug];

  return (
    <MotionReveal>
      <a
        href={`/work/${entry.slug}`}
        data-fr-feature=""
        /* An explicit name, so tabbing to the feature announces the project,
           what it did, and the figure — rather than reading the whole panel. */
        aria-label={[
          `Open the ${entry.title} case study.`,
          entry.tagline,
          outcome ? `Published outcome: ${outcome}.` : null,
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={activate}
        onMouseLeave={deactivate}
        onFocus={activate}
        onBlur={deactivate}
        className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary"
      >
        {/* The label runs on one line from sm up and breaks to two at 320,
            where the separator would otherwise start the second line. */}
        <p className={eyebrow}>
          Featured case study
          {entry.industry ? (
            <>
              <span aria-hidden="true" className="hidden sm:inline">
                {" · "}
              </span>
              <span className="block sm:inline">{entry.industry}</span>
            </>
          ) : null}
        </p>

        {/* THE PLATE. The real animated cover, used read-only at feature scale —
            a container-query scene, so its type scales with the frame instead of
            staying card-sized. Its rest state is a bare deep-teal field, which is
            right on a small card and reads as an empty rectangle at 1000px, so
            the plate is given something to carry: the published figure, set on
            the teal at display size. That makes the strongest evidence on the
            site the single largest object on the page, and it removes the dead
            state. Hover or focus fades the figure out and the cover's own
            halftone dissolve resolves into the project's hook line in the same
            optical position — one swap, not two things on screen at once.

            The crop follows the COLUMN, not the viewport: the feature column
            narrows at lg when the rail arrives beside it, so the plate goes back
            to a squarer crop there and only opens out again at xl, where the
            column is wide enough to carry a 16:9 band without shrinking the
            figure. */}
        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl shadow-card transition-shadow duration-100 group-hover:shadow-elevated sm:aspect-[16/10] md:mt-6 lg:aspect-[4/3] lg:rounded-3xl xl:aspect-[16/9] 2xl:aspect-[2/1]">
          {cover ? (
            <ProjectCover
              cover={cover as WorkCoverId}
              hovered={active}
              className="absolute inset-0 h-full w-full"
            />
          ) : null}

          {outcome ? (
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col items-start justify-end p-5 sm:p-8 md:p-10 xl:p-14 2xl:p-16"
              initial={false}
              animate={{ opacity: active ? 0 : 1 }}
              /* Leaving is an exit — shorter and ease-in, per §7 — because the
                 cover's own dissolve is already taking over the plate. Coming
                 back is an entry: `fast` and ease-out. */
              transition={{
                duration: shouldReduce
                  ? 0.01
                  : active
                    ? motionDuration.instant
                    : motionDuration.fast,
                ease: active ? motionEase.in : motionEase.out,
              }}
            >
              {/* On artwork rather than on a shell surface, so the label and the
                  figure take the cover's own on-field ink (white on #0e2932 is
                  about 15:1) — the same pairing SymptomCheckerCover sets for its
                  hook line. See the rule note in the report. */}
              <span className="font-heading text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Published outcome
              </span>
              <span className="mt-3 block max-w-[18ch] text-balance font-heading text-2xl font-semibold leading-[1.06] tracking-tight text-white sm:text-4xl md:mt-4 md:text-5xl xl:text-6xl 2xl:text-7xl">
                {outcome}
              </span>
            </motion.div>
          ) : null}
        </div>

        {/* The byline under the plate. The project's name is deliberately a
            step down from the figure above it: on a landing page a hiring reader
            wants what changed before what it was called. */}
        <div className="mt-6 md:mt-8 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-10 xl:gap-16">
          <h3 className="max-w-[18ch] text-pretty font-heading text-2xl font-semibold leading-[1.1] tracking-tight underline decoration-transparent decoration-2 underline-offset-[0.25em] transition-colors duration-100 group-hover:decoration-foreground md:text-3xl lg:col-span-6">
            {entry.title}
          </h3>

          <div className="mt-3 lg:col-span-6 lg:mt-0">
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
              {entry.tagline}
            </p>

            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground md:mt-5">
              Read the case study
              <ArrowRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
            </p>
          </div>
        </div>
      </a>
    </MotionReveal>
  );
}

/* ── The rail ─────────────────────────────────────────────────────────────── */

function WritingRail() {
  return (
    /* At lg the rail is separated from the feature by a vertical hairline —
       the "beside" is stated by the rule, not by a panel. Below lg the rule
       turns horizontal and becomes the band divider, and the rows go
       full width. */
    <div className="border-t border-border pt-8 lg:h-full lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-10">
      <h3 className={eyebrow} id="fr-writing-heading">
        Writing
      </h3>

      {/* Rules between rows and at both ends, so the list closes rather than
          trailing off; the column rule beside it runs the feature's full height. */}
      <MotionRevealGroup
        as="ul"
        className="mt-4 divide-y divide-border border-y border-border"
        delay={0.05}
      >
        {articles.map((article) => (
          <MotionRevealItem as="li" key={article.url}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="-mx-3 flex min-h-12 items-start gap-3 rounded-lg px-3 py-5 transition-colors duration-100 hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <span className="min-w-0 flex-1">
                <span className={`block ${eyebrow}`}>{article.kicker}</span>

                <span className="mt-2 block text-pretty font-heading text-base font-semibold leading-snug tracking-tight md:text-lg">
                  {article.title}
                </span>

                <span className="mt-2 block text-pretty text-sm leading-relaxed text-muted-foreground">
                  {article.hook}
                </span>
              </span>

              {/* The one glyph in the rail: it marks every row as leaving the
                  site, which is the fact a reader needs before clicking. */}
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </MotionRevealItem>
        ))}
      </MotionRevealGroup>
    </div>
  );
}

/* ── The capability strip ─────────────────────────────────────────────────────
 *
 * The six capability films as a specimen row: one ink band, six glowing discs,
 * one small label each. An index of the practice, not a stage and not a hover
 * payoff.
 *
 * WHY IT SITS HERE, BELOW THE WORK. This direction's premise is that the reader
 * meets the featured project sooner, which is why the hero is compact — so the
 * strip may not cost a single pixel above the feature. Placing it last, between
 * the supporting row and the colophon, costs exactly zero: the reading order
 * becomes claim → outcome → writing → the rest of the work → how the work gets
 * made → where to find her. That is also the honest hierarchy for a direction
 * whose whole argument is hierarchy. A capability index is evidence ABOUT the
 * practice; putting it in the masthead would say "how I work matters more than
 * what I shipped", which contradicts the feature's own inversion (lead with the
 * outcome, demote the project name to a byline).
 *
 * WHY IT IS NOT STRANDED DOWN HERE. It is the page's only tone change. Every
 * other band is the same warm --secondary paper, so an ink plane full of
 * glowing discs is the second most arresting object on the page after the
 * feature plate — it cannot be scrolled past unnoticed. It also runs full
 * bleed, which is the one band on this page that fills an ultrawide viewport;
 * the supporting row above caps at max-w-7xl and leaves the right third of a
 * 1920 page empty.
 *
 * WHY INK IS NOT OPTIONAL. Measured off the shipped posters: the footage has a
 * median luminance of 8 and peaks around 100–200 out of 255. A `lighten` blend
 * clamps everything darker than the backdrop to the backdrop, and --secondary
 * (#F2F0EB) sits at ~240 — so on the warm plane the blend erases the entire
 * clip and leaves a blank square. These films are only legible on --grout. That
 * is a stronger constraint than "the dark flag must match the surface": the
 * surface itself has to be dark, so the strip brings its own band with it.
 */

/* The same feather HeroKeywordVideo uses (.docs/video-blend.md): a colourless
   alpha mask holding a solid core out to 78% of the inscribed circle so the
   lattice keeps its reach, with only the outer sliver easing to nothing. It has
   to be identical here, because the resting still and the playing film are two
   layers of one dissolve and any difference in the rim would read as a jump. */
const FILM_EDGE_FADE =
  "radial-gradient(circle closest-side at 50% 50%, #000 78%, transparent 100%)";

/* The resting frame of a specimen.
 *
 * HeroKeywordVideo is opacity 0 whenever it is inactive, by design — in the
 * hero it is a payoff that appears over an idle illustration. An index needs
 * all six visible at rest, so each cell carries its own poster still underneath
 * and the film crossfades over it. This is NOT a hand-rolled video: the film is
 * still mounted only through ExploreCapabilityFilm. It is the still half of the
 * pair, and it is built to the same recipe HeroDefaultStill uses for the hero's
 * idle art — lighten over a backdrop painted in the surface token, plus the
 * same circular feather — so the rectangle is gone from the resting state too.
 *
 * Scale and timing mirror HeroKeywordVideo exactly (1.152 at rest, 1.2 lit),
 * so the two layers are always the same size in the same place and the swap is
 * a pure dissolve between a still frame and a moving one rather than a zoom
 * with a ghost. Reduced motion: HeroKeywordVideo shows its poster and never
 * plays, so the strip simply stays a set of stills. */
function CapabilityStill({ film, active }: { film: CapabilityFilm; active: boolean }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: active ? 0 : 1,
        scale: active ? 1.2 : reduce ? 1.2 : 1.152,
      }}
      transition={{
        duration: reduce ? 0.01 : active ? motionDuration.base : motionDuration.instant,
        ease: active ? motionEase.out : motionEase.in,
      }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-full"
        style={{ maskImage: FILM_EDGE_FADE, WebkitMaskImage: FILM_EDGE_FADE }}
      >
        {/* Painted in the band's own token, so the film's near-black field
            clamps to exactly the surface behind it. */}
        <div className="absolute inset-0 bg-grout" />
        <Image
          alt=""
          className="object-cover [mix-blend-mode:lighten]"
          fill
          sizes="(min-width: 1536px) 260px, (min-width: 1024px) 200px, 180px"
          src={film.poster}
        />
      </div>
    </motion.div>
  );
}

function CapabilityStrip() {
  /* Exactly one specimen is ever lit. Six clips playing at once is noise and
     ~9MB; one is an index developing a frame at a time. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Coarse pointers only — the same split ExploreCapabilityFilm argues for.
     There is no hover on a phone, so the film nearest the strip's own centre
     lights instead: swiping the filmstrip develops each specimen as it passes
     the middle. Its `autoPlayInView` flag is deliberately not used, because it
     observes vertically and would light all six at once in a horizontal row.
     Nothing plays while the band is off screen. */
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const section = sectionRef.current;
    const scroller = scrollerRef.current;
    if (!section || !scroller) return;

    let frame = 0;
    let onScreen = false;

    const pick = () => {
      frame = 0;
      if (!onScreen) {
        setActiveIndex(null);
        return;
      }
      const box = scroller.getBoundingClientRect();
      const centre = box.left + box.width / 2;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      itemRefs.current.forEach((element, index) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - centre);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setActiveIndex(best);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        schedule();
      },
      { rootMargin: "-20% 0px -20% 0px" },
    );
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    scroller.addEventListener("scroll", schedule, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      scroller.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Keyboard parity with hover, and the keyboard answer for the scrolling
     strip. The strip is one tab stop (a group, not six fake buttons — nothing
     here navigates); focusing it lights the first specimen and the arrow keys
     walk the set, scrolling the lit one into view where the row scrolls. */
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = capabilityFilms.length - 1;
    setActiveIndex((current) => {
      const from = current ?? 0;
      let next = from;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(last, from + 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, from - 1);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = last;
      else return current;

      event.preventDefault();
      itemRefs.current[next]?.scrollIntoView({ block: "nearest", inline: "center" });
      return next;
    });
  }, []);

  return (
    <section
      aria-labelledby="fr-capability-heading"
      className="bg-grout text-grout-foreground"
      ref={sectionRef}
    >
      <div className={`${frame} pt-12 md:pt-16 lg:pt-20 xl:pt-24`}>
        <MotionReveal>
          <h3 className={eyebrowOnGrout} id="fr-capability-heading">
            How I work
          </h3>
          {/* One line, because six labelled discs are cryptic without it and
              longer than one line would turn an index into a section. */}
          <p className="mt-3 max-w-prose text-base leading-relaxed">
            A short film for each part of it.
          </p>
        </MotionReveal>
      </div>

      {/* Below lg the row scrolls sideways rather than shrinking six discs into
          illegibility; it is its own scroll container inside the page's
          overflow-x-clip main, so it never becomes page-level overflow. From lg
          the six fit as an even grid on the shared frame, so the first disc
          lines up with the heading above it. `py` inside the scroller leaves
          room for the lit disc's 1.2 bloom, which would otherwise clip. */}
      <div
        aria-label="Capability films"
        className="mt-8 overflow-x-auto pb-12 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-grout-foreground md:mt-10 md:pb-16 lg:overflow-x-visible lg:pb-20 xl:pb-24"
        onFocus={() => setActiveIndex((current) => current ?? 0)}
        onBlur={() => setActiveIndex(null)}
        onKeyDown={onKeyDown}
        ref={scrollerRef}
        role="group"
        tabIndex={0}
      >
        <MotionRevealGroup
          as="ul"
          className="flex w-max gap-6 px-4 py-5 sm:px-6 md:gap-8 md:px-8 lg:mx-auto lg:grid lg:w-full lg:max-w-[1800px] lg:grid-cols-6 lg:gap-6 lg:px-12 xl:gap-8 xl:px-16 2xl:gap-10 2xl:px-24"
        >
          {capabilityFilms.map((film, index) => {
            const active = activeIndex === index;

            return (
              <MotionRevealItem
                as="li"
                className="w-36 shrink-0 sm:w-40 md:w-44 lg:w-auto"
                key={film.id}
              >
                <div
                  className="scroll-mx-4 sm:scroll-mx-6 md:scroll-mx-8"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex((current) => (current === index ? null : current))}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                >
                  <div className="relative aspect-square w-full">
                    <CapabilityStill active={active} film={film} />
                    <div className="absolute inset-0">
                      <ExploreCapabilityFilm
                        active={active}
                        className="h-full w-full"
                        dark
                        film={film}
                      />
                    </div>
                  </div>

                  {/* The label is the content; the film is the medium. It has
                      to survive with the footage never playing. */}
                  <h4 className="mt-3 text-pretty text-sm font-semibold leading-snug">
                    {film.label}
                  </h4>
                </div>
              </MotionRevealItem>
            );
          })}
        </MotionRevealGroup>
      </div>
    </section>
  );
}

/* ── The colophon ─────────────────────────────────────────────────────────── */

function Colophon() {
  return (
    /* Compact on purpose. This direction spends its weight on the feature, so
       the footer only has to resolve "where else can I find her" — a typeset
       line and a row of links, no oversized name. LinkedIn lives here, never as
       a card in the work row.

       It rides the capability strip's ink rather than starting a fourth band of
       paper under it. The strip has to be dark (the films are unreadable on the
       warm plane), and a 110px paper sliver below an ink band read as a leftover
       rather than an ending — so the two share one plane, divided by a hairline,
       exactly the move the feature and the rail make above. The page still has
       only one tone change in it, and an ink foot is native to this site: the
       real header and case-study prev/next footer are already grout. */
    <footer aria-label="Elsewhere" className="bg-grout text-grout-foreground">
      <div
        className={`${frame} flex flex-col gap-6 border-t border-grout-foreground/20 py-10 md:flex-row md:items-baseline md:justify-between md:py-12`}
      >
        <p className={eyebrowOnGrout}>{hero.eyebrow}</p>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 md:gap-x-8">
          {elsewhere.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                /* --focus is ink and vanishes on grout, so the ring takes the
                   band's on-surface token — the same swap CaseStudyRail makes
                   for its grout tiles. */
                className="inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold underline decoration-grout-foreground/40 decoration-2 underline-offset-[0.3em] transition-colors duration-100 hover:decoration-grout-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grout-foreground"
              >
                {link.label}
                {link.external ? (
                  <>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
