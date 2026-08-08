"use client";

/*
 * EXPLORE — direction one: THE DATED INDEX.
 *
 * THE ARGUMENT. Work and writing differ in MEDIUM, not in size. The case-study
 * grid is a plane of image objects, exactly as the live home page builds it.
 * The writing is a dated text index: no thumbnails, no cards, no images. That
 * change of material is what keeps the two tiers apart, so neither has to be
 * shrunk to prove it is the lesser one — a smaller second card grid would have
 * said "these matter less", which is not the claim.
 *
 * THE SPINE. Below the hero the page runs on one device: a left margin column
 * carrying small marginal labels (the years in the index, "Elsewhere" in the
 * colophon) against a right column carrying the content, with hairlines ruling
 * across. Group rules span the full width; row rules start at the text column.
 * That difference is the hierarchy — you can see where a year ends without a
 * heavier line or a number.
 *
 * WHY THE YEAR IS IN THE MARGIN AND NOT ON THE ROW. It is load-bearing, not
 * decorative: because the year is stated once per group, each row's date only
 * has to carry the day and month. The margin earns its width by removing four
 * repeated digits from every row.
 *
 * NO HEADING ABOVE THE GRID. The cards announce themselves; the text index is
 * the tier that needs typography to say what it is. `ProjectCard` also emits
 * its own `h2` per card, so an `h3` band label above the grid would put the
 * outline out of order for no reading gain.
 *
 * THREE MATERIALS, IN ORDER. The hero now carries the capability films, so the
 * page steps down through one material per tier: MOTION (the films), then
 * IMAGE (the card grid), then TEXT (the dated index). The drop into pure text
 * has to read as a change of material, and it only does that if the top is
 * unmistakably image led. A hero of plain paragraphs made the writing index
 * look like the section where the pictures ran out.
 *
 * Client component now, for the hero's hover/focus state only. Everything below
 * the hero is the same static markup it was; `ProjectCard` is already a client
 * component, so nothing new is pulled into the bundle by the directive.
 */

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ProjectCard } from "../components/ProjectCard";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref } from "../work/projects";
import {
  articles,
  capabilityFilms,
  caseStudies,
  elsewhere,
  hero,
  idleStill,
  type Article,
  type CapabilityFilm,
} from "./content";
import { ExploreCapabilityFilm } from "./ExploreCapabilityFilm";

/* Shared page container. Same gutters and cap as the live home page, so the
   grid below sits exactly where it does in production. */
const container =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* The margin column. `w-24`/`lg:w-32` are theme spacing steps, not invented
   widths — wide enough for a four digit year and the word "Elsewhere" at the
   small tracked size, narrow enough to read as a margin rather than a column. */
const marginCol = "w-24 shrink-0 lg:w-32";

/* The one small-label treatment on this page: uppercase, tracked into words,
   `text-muted-foreground` (held to 7:1 by the token contract, per §4). */
const marginalLabel =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* Parsed off the ISO string rather than through `new Date()`: a date-only
   string is parsed as UTC and would render a day early west of Greenwich, and
   the server and client must agree. */
function splitDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: String(year), dayMonth: `${day} ${MONTHS[month - 1]}` };
}

/* Newest first, then grouped by year in that order. Sorted defensively so the
   index cannot fall out of order when the placeholder posts are replaced. */
function groupByYear(entries: Article[]) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const groups: { year: string; items: Article[] }[] = [];

  for (const article of sorted) {
    const { year } = splitDate(article.date);
    const current = groups.at(-1);
    if (current?.year === year) current.items.push(article);
    else groups.push({ year, items: [article] });
  }

  return groups;
}

export function DirectionDatedIndex() {
  const years = groupByYear(articles);

  return (
    <div className="bg-secondary text-foreground">
      <FilmHero />

      {/* OUTCOMES: EVALUATED, BUILT, AND CUT. `outcomes` carries a figure for
          exactly one of the four case studies. Rendered under its card it read
          as an errata note pinned to Healthdirect: the other three look like
          they failed to load something, the gallery loses the even bottom edge
          its own composition rules are built on, and the line is unclickable
          text sitting in a grid of links. It cannot go inside the card either —
          §8 forbids a competing target within a project-card link, and
          ProjectCard is not this file's to restyle. One published metric wants
          a band of its own, which is a different direction's argument. */}

      {/* ── Tier one: the work. Structurally identical to the live home grid
          (same columns, same gaps, same container), minus the trailing
          placeholder — this direction assumes it is retired. The hairline is
          the only addition, and it is the same rule that opens every band
          below. */}
      <section aria-label="Case studies" className="border-t border-border">
        <div className={`${container} py-12 md:py-16 lg:py-24`}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-4 xl:gap-12">
            {caseStudies.map((entry, index) => (
              <ProjectCard entry={entry} index={index} key={workEntryHref(entry)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tier two: the writing. Narrower measure than the gallery above it,
          which is the second signal (after the loss of imagery) that the
          material has changed. */}
      <section aria-labelledby="dated-index-writing" className="border-t border-border">
        <div className={`${container} py-12 md:py-16 lg:py-24`}>
          <div className="max-w-6xl">
            <h3
              id="dated-index-writing"
              className="font-heading text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl"
            >
              Writing
            </h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed">
              Notes on design, AI, and the way teams work. Each one opens on
              Substack.
            </p>

            <div className="mt-10 border-b border-border md:mt-14">
              {/* The rule hierarchy is the whole navigation of this list: a YEAR
                  rule runs the full width (it sits on the group), a ROW rule
                  starts at the text column (it sits on the row, and the first
                  row of a group drops it so the two never double). You can see
                  where a year ends without a heavier line, a colour, or a
                  count. */}
              {years.map((group) => (
                <div className="border-t border-border md:flex md:gap-8 lg:gap-12" key={group.year}>
                  <div className={`${marginCol} pt-6 md:pt-8`}>
                    {/* Hidden from assistive tech on purpose: every row below
                        already carries its own full date (see IndexRow), so an
                        announced "2026" would only be an orphan number.

                        Full-strength ink where the row metadata is muted. On
                        desktop the margin position alone says "structure"; at
                        mobile widths the year stacks above its group, where it
                        and the row's date line would otherwise be the same
                        small caps line, and the ink is what keeps it a marker
                        rather than a second date.

                        Sticky from md up. With three posts it never moves; with
                        a year of them it holds the year in the margin for the
                        whole group, which is the "gets better the more you
                        publish" claim actually paying out. Position only — no
                        animation, nothing to reduce. */}
                    <p
                      aria-hidden="true"
                      className={`${marginalLabel} text-foreground md:sticky md:top-8`}
                    >
                      {group.year}
                    </p>
                  </div>

                  <ol className="min-w-0 flex-1">
                    {group.items.map((article) => (
                      <IndexRow article={article} key={article.url + article.date} />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tier three: the colophon. The name is the last and largest thing on
          the page; LinkedIn and the rest are marginal notes beneath it, at the
          same size and in the same column as the years. Nothing here can be
          mistaken for a piece of work. */}
      <section aria-labelledby="dated-index-colophon" className="border-t border-border">
        <div className={`${container} py-12 md:py-16 lg:py-24`}>
          {/* Fluid display size — the §2 carve-out for display typography. 20vw
              holds the name on ONE line at about 88% of the measure at every
              width, because the page gutters scale roughly in proportion; the
              4rem floor keeps it oversized on a 320px phone and the 19rem
              ceiling stops it growing past a readable object once the 1800px
              container stops widening. */}
          <h3
            className="font-heading text-[clamp(4rem,20vw,19rem)] font-semibold leading-none tracking-tighter"
            id="dated-index-colophon"
          >
            Lizzie Teo
          </h3>

          {/* The links share one 48px row box with the "Elsewhere" label, so the
              marginal label sits on the links' own centre line rather than
              floating above them. They are set in the body face at reading size
              — quiet enough that LinkedIn can never read as a fifth project. */}
          <div className="mt-12 border-t border-border pt-6 md:mt-16 md:flex md:gap-8 md:pt-8 lg:gap-12">
            <div className={`${marginCol} flex items-center md:min-h-12`}>
              <h4 className={marginalLabel}>Elsewhere</h4>
            </div>

            <ul className="min-w-0 flex-1 md:flex md:flex-wrap md:gap-x-10 lg:gap-x-16">
              {elsewhere.map((link) => (
                <li key={link.label}>
                  <a
                    className="group flex min-h-12 items-center gap-3 text-base font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:text-lg"
                    href={link.href}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    target={link.external ? "_blank" : undefined}
                  >
                    {link.label}
                    {link.external ? (
                      <>
                        <LeavesMark />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE FILM HERO

   The hero's only imagery is the six capability films, tied to the words they
   illustrate — the live site's idea, recomposed for this direction.

   WHY THE BAND DOES NOT INVERT. The live hero flips the whole section to the
   dark --grout stage while a word is lit, because the footage is a pale lattice
   on near-black and would all but vanish lightened against --secondary. It
   still needs a dark surface here, so the TONE FLIP IS SCOPED TO THE STAGE: the
   film brings its own grout plate (`dark`), feathered to a soft disc, and the
   page around it never moves. Three reasons that is the better call here:

     1. The direction's whole argument is ONE contrast, material. A band that
        also flips light to dark adds a second, louder contrast that the
        writing index cannot answer.
     2. /explore stacks each direction under a `bg-primary` ink band from
        page.tsx. A hero that inverts to near-black would merge with the band
        sitting directly above it.
     3. The keyword tints in theme.css are contrast-checked per band tone. A
        band that never leaves --secondary keeps them in their verified resting
        set, in both colour schemes, with no `data-hero-tone` bookkeeping and
        no chance of a dark disc appearing mid-crossfade (the failure
        HeroKeywordVideo's header warns about — there is no crossfade to
        mistime, because `dark` is constant).

   The plate is the film's own backdrop, so it is only ever painted where a film
   is painted: nothing to keep in sync, and no rectangle at any width — the
   feather closes the frame into a circle before the plate ends.

   BELOW lg the live hero drops the interaction and the films with it. That is
   the wrong trade once the films ARE the argument, so instead of one stage
   with nothing to trigger it, each film is set as a PLATE IN THE PROSE, after
   the block whose sentence it illustrates: eyebrow and headline share the
   opening pair, then one after each paragraph. It reads as an illustrated
   essay, needs no interaction at all, and it makes the change of material at
   the index far starker on a phone than it ever was on desktop.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Which layout is mounted. `null` until the media query is measured, so the
   films for the OTHER layout are never mounted even briefly — six spare
   <video> elements would each fire a metadata request for nothing. Both
   layouts reserve their own space in CSS, so the resolve costs no layout
   shift. */
type StageMode = "stage" | "inline" | null;

/* Longest phrase first: matching is greedy at each index, so a short phrase
   can never swallow a longer one that starts in the same place. */
const PHRASES = [...capabilityFilms].sort(
  (a, b) => b.phrase.length - a.phrase.length,
);

type Segment = { text: string; film?: CapabilityFilm };

/* Split a line of hero copy into plain runs and the runs that name a film.
   Derived from `capabilityFilms[].phrase`, so no slice of prose is ever
   hardcoded here and re-wording the copy in content.ts cannot silently break
   the mapping — a phrase that no longer appears simply stops being marked. */
function segmentCopy(text: string): Segment[] {
  const out: Segment[] = [];
  let plain = "";
  let i = 0;

  while (i < text.length) {
    const hit = PHRASES.find((film) => text.startsWith(film.phrase, i));
    if (hit) {
      if (plain) out.push({ text: plain });
      plain = "";
      out.push({ text: hit.phrase, film: hit });
      i += hit.phrase.length;
    } else {
      plain += text[i];
      i += 1;
    }
  }
  if (plain) out.push({ text: plain });

  return out;
}

function filmsIn(text: string): CapabilityFilm[] {
  return segmentCopy(text).flatMap((part) => (part.film ? [part.film] : []));
}

/* The four marked words that sit in BODY copy take the project hue they evoke,
   from the same semantic tokens the live hero uses. The two in display copy do
   not: `complexity` keeps the headline's ink (as it does on the live site), and
   `Code Tinkerer` sits in the eyebrow, which is 12px, uppercase and already at
   70% — a 6:1 tint there would fail §4's 7:1 floor for small text carrying
   meaning. Both keep the dotted underline, which is the actual mark. */
const FILM_TINT: Record<string, string | undefined> = {
  users: "--hero-kw-users",
  "design-systems": "--hero-kw-design-systems",
  "figma-to-code": "--hero-kw-figma-to-code",
  stakeholders: "--hero-kw-stakeholders",
};

/* Every film's disc is its frame scaled to 1.2 (HeroKeywordVideo's rest scale),
   so a frame inset to five sixths of its plate lands the lit disc exactly on
   the plate's own square. Without it the disc overflows its box by 10% a side,
   which at 320px means the film runs under the page gutter. */
const FILM_FRAME = "aspect-square w-5/6";

const filmHint = "dated-index-film-hint";

function FilmHero() {
  const [mode, setMode] = useState<StageMode>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = useCallback((id: string) => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    activeRef.current = id;
    setActiveId(id);
  }, []);

  /* Debounced clear, straight from the live hero's reasoning: sweeping from one
     marked word to another crosses plain text between them, and an immediate
     clear would blink the stage back to the idle still on the way. Landing on
     the next word cancels this before it fires. */
  const scheduleDeactivate = useCallback(() => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      activeRef.current = null;
      setActiveId(null);
      clearTimer.current = null;
    }, 150);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setMode(mq.matches ? "stage" : "inline");
      if (!mq.matches && activeRef.current !== null) {
        if (clearTimer.current) {
          clearTimeout(clearTimer.current);
          clearTimer.current = null;
        }
        activeRef.current = null;
        setActiveId(null);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const marked = (text: string) => (
    <MarkedCopy
      text={text}
      interactive={mode === "stage"}
      onActivate={activate}
      onDeactivate={scheduleDeactivate}
    />
  );

  /* The eyebrow's film is deferred into the opening pair rather than set under
     the eyebrow itself: a plate between the eyebrow and the headline would push
     the thesis off the first screen. */
  const openingFilms = [...filmsIn(hero.headline), ...filmsIn(hero.eyebrow)];
  const activeFilm = capabilityFilms.find((film) => film.id === activeId);

  return (
    <section aria-label="Introduction" className="bg-secondary text-foreground">
      <div className={`${container} pb-16 pt-10 md:pb-24 md:pt-16 lg:pb-28 lg:pt-20`}>
        <p className="mb-7 font-heading text-xs font-bold uppercase tracking-[0.24em] opacity-70 md:mb-10">
          {marked(hero.eyebrow)}
        </p>

        {/* From lg the hero splits: copy left, one stage right, its top edge on
            the headline's. Below lg there is no stage — the plates are in the
            prose instead, so the copy simply runs full width. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:gap-16 2xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
          <div className="min-w-0">
            {/* h3: /explore's outline is h1 (page) → h2 (direction name) → h3. */}
            <h3 className="max-w-[70rem] font-heading text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.02] xl:text-8xl">
              {marked(hero.headline)}
            </h3>

            <FilmPlates films={openingFilms} mount={mode === "inline"} />

            {hero.paragraphs.map((paragraph, index) => (
              <div key={paragraph.slice(0, 24)}>
                <p
                  className={`max-w-prose text-pretty text-base leading-relaxed ${
                    index === 0 ? "mt-6 md:mt-8" : "mt-5 md:mt-6"
                  }`}
                >
                  {marked(paragraph)}
                </p>
                <FilmPlates
                  films={filmsIn(paragraph)}
                  mount={mode === "inline"}
                />
              </div>
            ))}

            {/* Read on focus, so the sentence itself stays clean in browse mode
                and a keyboard user still learns what the marked word does. */}
            <span className="sr-only" id={filmHint}>
              Reveals a short film beside the text.
            </span>
          </div>

          {/* The stage. The box is always here so the desktop grid never
              reshuffles when the media query resolves; only its contents wait
              for it. */}
          <div className="hidden lg:block">
            <div className="relative aspect-square w-full">
              {mode === "stage" ? (
                <>
                  <IdleStill active={activeId === null} />
                  {capabilityFilms.map((film) => (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      key={film.id}
                    >
                      <ExploreCapabilityFilm
                        active={activeId === film.id}
                        className={FILM_FRAME}
                        dark
                        film={film}
                      />
                    </div>
                  ))}
                </>
              ) : null}
            </div>

            {/* The stage's own caption line, in the same marginal register the
                index below uses, and the same line the plates carry below lg.
                At rest it says what the marks in the copy are for, which is the
                one thing a stage that only answers to hover cannot say for
                itself; lit, it names the film. No instruction verb: "hover" is
                a lie on a touch laptop, which reaches these by tap. */}
            <p className={`mt-6 ${marginalLabel}`}>
              {activeFilm ? activeFilm.label : "A film for every marked word"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* The below-lg answer: the films set as plates in the prose, one row after the
   block they illustrate. The imagery breaks past the reading measure the copy
   holds, so text and image are never the same width — the same "different
   material" move the page makes at full scale.

   From md the plates run on a two column grid, and a lone plate takes the OUTER
   column: a pair spans the measure, a single hangs off the right edge, and the
   reading line zigzags instead of leaving a hole beside every odd film. Hidden
   from lg, where the stage takes over. */
function FilmPlates({
  films,
  mount,
}: {
  films: CapabilityFilm[];
  mount: boolean;
}) {
  if (films.length === 0) return null;

  return (
    <div className="mt-8 grid gap-x-8 gap-y-10 md:mt-10 md:grid-cols-2 lg:hidden">
      {films.map((film) => (
        <FilmPlate
          className={films.length === 1 ? "md:col-start-2" : ""}
          film={film}
          key={film.id}
          mount={mount}
        />
      ))}
    </div>
  );
}

function FilmPlate({
  className,
  film,
  mount,
}: {
  className: string;
  film: CapabilityFilm;
  mount: boolean;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  /* ExploreCapabilityFilm's own `autoPlayInView` is coarse-pointer only, which
     is right for its brief and not enough here: on a narrow window with a mouse
     these plates would stay unlit for good. So the plate owns "lit while it is
     the thing you are looking at" itself, and `autoPlayInView` stays on as the
     sanctioned touch path. Roughly one plate is inside the band at a time, so
     the page never plays a wall of film at once. Under reduced motion the same
     state reveals the poster frame and HeroKeywordVideo declines to play it. */
  useEffect(() => {
    if (!mount) return;
    const frame = frameRef.current;
    if (!frame) return;
    /* The band is generous on purpose. A plate reveals with its film, so a
       tight centre band leaves a hole in the layout wherever a plate is only
       half on screen — the reserved square with nothing in it. Lighting as soon
       as the plate is properly entering (its top above the bottom tenth) and
       holding until it has fully left means the reader never meets an empty
       frame, at the cost of at most two or three clips lit at once. */
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [mount]);

  return (
    <figure
      /* Capped to a plate below md, where the single column would otherwise
         blow one film up to the full 640px measure; from md the grid track
         sets the size. */
      className={`w-full max-w-xs md:max-w-none ${className}`}
      ref={frameRef}
    >
      <div className="relative aspect-square w-full">
        {mount ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <ExploreCapabilityFilm
              active={inView}
              autoPlayInView
              className={FILM_FRAME}
              dark
              film={film}
            />
          </div>
        ) : null}
      </div>
      <figcaption className={`mt-4 ${marginalLabel}`}>{film.label}</figcaption>
    </figure>
  );
}

/* Hero copy with its filmed words marked. Plain runs stay plain text; a marked
   run is a button at lg (mouse, keyboard, and tap all reach the payoff) and a
   marked span below it, where the plate is already on the page and there is
   nothing to trigger. The dotted underline is the mark in both states. */
function MarkedCopy({
  text,
  interactive,
  onActivate,
  onDeactivate,
}: {
  text: string;
  interactive: boolean;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
}) {
  return (
    <>
      {segmentCopy(text).map((part, index) =>
        part.film ? (
          <Keyword
            film={part.film}
            interactive={interactive}
            key={`${part.film.id}-${index}`}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          >
            {part.text}
          </Keyword>
        ) : (
          <span key={`plain-${index}`}>{part.text}</span>
        ),
      )}
    </>
  );
}

const KEYWORD_MARK =
  "underline decoration-current/40 decoration-dotted decoration-1 underline-offset-[0.18em]";

function Keyword({
  film,
  interactive,
  onActivate,
  onDeactivate,
  children,
}: {
  film: CapabilityFilm;
  interactive: boolean;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
  children: ReactNode;
}) {
  const varName = FILM_TINT[film.id];
  // The tint and its weight ride inline: the token carries the hue and the
  // inline weight beats the button's [font:inherit] reset. Colour is a
  // permitted CSS transition (§7).
  const style = varName
    ? {
        color: `var(${varName})`,
        fontWeight: 600,
        transition: "text-decoration-color 200ms cubic-bezier(0, 0, 0.2, 1)",
      }
    : { transition: "text-decoration-color 200ms cubic-bezier(0, 0, 0.2, 1)" };

  if (!interactive) {
    return (
      <span className={KEYWORD_MARK} style={style}>
        {children}
      </span>
    );
  }

  return (
    <button
      aria-describedby={filmHint}
      /* Two details here are load bearing, not tidiness.
         `[text-transform:inherit]`: the UA sheet resets text-transform on form
         controls, so without it the eyebrow's marked word drops out of the
         uppercase line it sits in.
         NO `outline-none`: in Tailwind v4 outline-style rides a variable, so
         `outline-none` on the base class silently cancels the focus-visible
         ring that follows it — the button focuses with no ring at all. The ring
         is the page's own `outline-focus`, as on every other link here, not
         `outline-current`: a plum ring around plum text is not a state change. */
      className={`inline cursor-pointer rounded-[2px] bg-transparent p-0 [font:inherit] [letter-spacing:inherit] [text-transform:inherit] hover:decoration-current focus-visible:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${KEYWORD_MARK}${
        varName ? "" : " text-inherit"
      }`}
      data-film={film.id}
      onBlur={onDeactivate}
      onFocus={() => onActivate(film.id)}
      onPointerEnter={() => onActivate(film.id)}
      onPointerLeave={(event) => {
        if (document.activeElement !== event.currentTarget) onDeactivate();
      }}
      style={style}
      type="button"
    >
      {children}
    </button>
  );
}

/* The stage at rest. `idleStill` is light graded — dark line art on a near
   white field — so unlike the films it takes no blend: the band never inverts
   under it, and blending it would erase it outright in the dark colour scheme,
   where --secondary is a mid dark warm grey. The circular feather stays,
   because the mask is what removes the square edge; the same colourless alpha
   gradient the films use, held solid to 88% (the light-artwork figure from
   .docs/video-blend.md, which keeps the ornamental ring intact). */
const IDLE_EDGE_FADE =
  "radial-gradient(circle closest-side at 50% 50%, #000 88%, transparent 100%)";

function IdleStill({ active }: { active: boolean }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0 }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      initial={false}
      style={{ maskImage: IDLE_EDGE_FADE, WebkitMaskImage: IDLE_EDGE_FADE }}
      transition={{
        duration: reduce
          ? 0.01
          : active
            ? motionDuration.base
            : motionDuration.fast,
        ease: active ? motionEase.out : motionEase.in,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative art
          sized and masked by the frame; next/image adds nothing here */}
      <img alt="" className="h-full w-full object-contain" src={idleStill} />
    </motion.div>
  );
}

/* One row of the index. The whole row is the link — title, metadata, and hook
   — so the target is the full column and comfortably past 44px at every width
   without a minimum height propping it up.
   Hover and focus are colour and underline only: §7 reserves CSS transitions
   for colour, border, focus and shadow, and this direction has no reason to
   move anything. */
function IndexRow({ article }: { article: Article }) {
  const { year, dayMonth } = splitDate(article.date);

  return (
    <li className="border-t border-border first:border-t-0">
      <a
        className="group flex items-start gap-3 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:gap-8 md:py-8"
        href={article.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="min-w-0 flex-1">
          <span className={`block ${marginalLabel}`}>
            <time dateTime={article.date}>
              {dayMonth}
              {/* The year lives in the margin visually; screen readers get it
                  here so no row is dateless out of context. */}
              <span className="sr-only"> {year}</span>
            </time>
            <span aria-hidden="true"> · </span>
            {article.kicker}
          </span>

          <h4 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight underline-offset-4 group-hover:underline md:text-xl lg:text-2xl">
            {article.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </h4>

          <span className="mt-2 block max-w-prose text-base leading-relaxed text-muted-foreground">
            {article.hook}
          </span>
        </span>

        {/* The mark is alignment furniture, not its own target — the whole row
            is the link — so at 320px it takes the narrower box and gives the
            title back twelve pixels of measure. */}
        <LeavesMark className="size-8 justify-center md:size-11" />
      </a>
    </li>
  );
}

/* The "this leaves the site" mark. A drawn 45 degree arrow rather than a glyph,
   so its weight matches the hairlines it sits among and it never picks up a
   font's own idea of the character. Decorative: every link that carries it also
   carries a visually hidden "opens in a new tab". */
function LeavesMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center text-muted-foreground transition-colors group-hover:text-foreground ${className}`}
    >
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 16 16"
      >
        <path d="M4.5 11.5 11.5 4.5" />
        <path d="M5.75 4.5h5.75v5.75" />
      </svg>
    </span>
  );
}
