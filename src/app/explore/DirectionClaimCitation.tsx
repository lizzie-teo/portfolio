"use client";

/*
 * EXPLORE — direction three: CLAIM AND CITATION.
 *
 * The premise: there is no writing band. The hero stops asserting and starts
 * arguing, because one of its claims carries its own source. The article is not
 * a card in a list of articles; it is a reference attached to the sentence it
 * backs up.
 *
 * THE CITATION IS THE WHOLE DIRECTION, so it gets the only ornament on the page:
 *
 *   in the prose   the cited phrase is a real element wearing a dotted annotation
 *                  rule (the abbr/gloss mark, deliberately not a link underline)
 *                  and a superscript asterisk. One footnote on the page, so the
 *                  mark is `*` — the correct single-note mark in print, and it
 *                  dodges the counter that a "1" would introduce.
 *   the note       a reference entry: the claim it annotates in quotes, the piece
 *                  that argues it, then kicker and month. Set at text-sm on a
 *                  hairline rule.
 *
 * ONE LINK, NOT TWO. The scholarly instinct is to make the superscript mark the
 * link, but a `*` is a 10px target and this site owes 44px. So the note is the
 * anchor, at full block size, and the in-prose mark is decoration. That also
 * gives assistive tech a single reference with a complete name instead of two
 * links to the same URL.
 *
 * DOM ORDER IS FOOTNOTE ORDER. The note is written after the last paragraph, so
 * a screen reader and the tab sequence get prose-then-reference, which is what a
 * footnote is. At `lg` the grid lifts it into the right margin beside the
 * paragraph it annotates — a sidenote for the eye, a footnote for the outline.
 * Below `lg` there is no margin to lift into, so it stays where it is written
 * and takes a short separator above it. The hairline is the one device: a stub
 * rule hung at the left margin on a phone, a full vertical rule beside the note
 * on a desktop.
 *
 * The rule reappears exactly once more, under the single case study carrying a
 * published outcome — the same "this claim has evidence" gesture applied to the
 * work grid. Cards without a figure get no rule and no line, which is the point:
 * the mark means something because most cards do not have it.
 *
 * ── THE PLATES ────────────────────────────────────────────────────────────
 *
 * A source can be written or it can be shown. The note is the written one; the
 * plates are the shown one, and they hang off the SAME claim, in the same
 * margin lane, under the same hairline. That is the extension: the apparatus
 * grows, the thesis does not move.
 *
 * WHICH FILMS, AND WHY NOT ALL SIX. The set is derived, never picked: it is
 * every capability film whose `phrase` appears inside `citedPhrase`. The cited
 * sentence — "AI ready design systems, from Figma to code" — happens to name
 * exactly two of them, so the note carries two plates, which is what a footnote
 * citing two sources does. Nothing is chosen for looking good, and adding a
 * seventh film would require changing the claim, not the layout.
 *
 * Wiring the other four to their own hero phrases was the obvious alternative
 * and it is the wrong one here. It would put six hover targets in a paragraph
 * that already carries one annotation mark, so the reader could no longer tell
 * which mark is the citation; it would make the loudest thing on the page a
 * rotating film rather than the note; and it is already what the live hero
 * does, so this direction would stop being a distinct proposal. The restraint
 * is not modesty about the footage — it is the reason the device reads.
 *
 * THE FILMS ARE MOUNTED, NEVER HAND-ROLLED, AND THEY ARE PRINTED ON INK. The
 * footage is a glowing lattice on a near-black field, so it needs a `lighten`
 * blend over a backdrop painted in the surrounding tone plus a circular alpha
 * feather. That is ExploreCapabilityFilm's job, not this file's. What this file
 * had to decide is the surface: `lighten` keeps whichever layer is brighter, so
 * on the near-white --secondary this band is painted in, the band wins and the
 * film is all but erased (captured, then fixed). Each plate therefore gets its
 * own --grout ground and `dark` is set to match it. A plate printed on a dark
 * ground is also just what these images are — botanical engravings — so the
 * technical constraint and the visual argument want the same thing.
 *
 * WHY THEY PLAY AT REST. A film here is evidence, and evidence that only exists
 * while a pointer is on it does not exist on a phone and does not exist in a
 * still. So the plates light while the hero is on screen and stop the moment it
 * is not, on every pointer type — the observer below drives fine pointers, and
 * `autoPlayInView` is the sanctioned coarse-pointer path. They are small,
 * captioned with what the footage shows, and parked below the note: an exhibit
 * in a margin, not a showreel across the top.
 *
 * MOTION. The typographic argument still does not animate. The plates do, and
 * reduced motion is handled inside HeroKeywordVideo — no autoplay, the poster
 * frame stands in as the still composition — so nothing is re-implemented here.
 * ProjectCard brings its own approved motion and reduced-motion handling.
 *
 * Client component only because of the in-view observer; ProjectCard and the
 * films are client anyway, so the boundary moves up rather than out.
 */

import { useEffect, useRef, useState } from "react";
import { ProjectCard } from "../components/ProjectCard";
import { ExploreCapabilityFilm } from "./ExploreCapabilityFilm";
import {
  articles,
  capabilityFilms,
  caseStudies,
  citedArticle,
  citedPhrase,
  elsewhere,
  hero,
  outcomes,
  type Article,
} from "./content";

/* Page container and gutters, matched to the rest of /explore. */
const shell =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* Quiet plain-text link, used in the colophon's bottom row. 44px target,
   hairline underline that firms up on hover, semantic focus ring. */
const plainLink =
  "inline-flex min-h-12 items-center underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/* The plates. Derived from the cited sentence, not chosen: every capability
   film whose `phrase` the claim actually contains. Today that resolves to
   "design systems" and "Figma to code". If the claim is reworded, the exhibit
   follows it or disappears — which is the correct failure mode for evidence. */
const citedPlates = capabilityFilms.filter((film) => citedPhrase.includes(film.phrase));

/* Month and year, fixed locale and UTC so the server render is deterministic. */
function monthYear(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* Paragraph two, composed from parts rather than sliced out of the prose at
   runtime, so the cited phrase is a real element and not a substring search.
   The marked part IS `citedPhrase` from content.ts — only the words either side
   of it live here. The dev check below complains if the two ever drift. */
const claimParagraph = [
  "I love making things simpler. I rethink clunky workflows and build ",
  citedPhrase,
  ", using tools like Claude Code to ship faster.",
] as const;

if (
  process.env.NODE_ENV !== "production" &&
  claimParagraph.join("") !== hero.paragraphs[1]
) {
  console.warn(
    "[DirectionClaimCitation] The composed claim paragraph no longer matches hero.paragraphs[1] in content.ts.",
  );
}

export function DirectionClaimCitation() {
  return (
    <div className="bg-secondary text-foreground">
      <CitationHero />
      <Work />
      <Colophon />
    </div>
  );
}

/* ── 1. The citation hero ────────────────────────────────────────────────── */

function CitationHero() {
  return (
    <section aria-label="Introduction" className={shell}>
      {/* The argument runs at a fixed measure and hangs off the left gutter
          rather than centring: a narrow column of prose with a reserved margin
          beside it is the shape of an annotated page, and §3 asks for asymmetry
          in display composition. The work grid below opens back out to the full
          container, so narrow-argument / wide-evidence is the page's rhythm. */}
      <div className="max-w-5xl pb-16 pt-10 md:pb-24 md:pt-16 lg:pb-28 lg:pt-20 xl:max-w-6xl">
        <p className="mb-7 font-heading text-xs font-bold uppercase tracking-[0.24em] md:mb-10">
          {hero.eyebrow}
        </p>

        {/* h3: /explore's outline is h1 (page) → h2 (direction name) → h3 here. */}
        <h3 className="font-heading text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:leading-[1.02]">
          {hero.headline}
        </h3>

        {/* Twelve columns from `lg`. The prose holds seven; the note is placed
            into row two, columns nine to twelve — beside the claim it annotates,
            not beneath it. Below `lg` the grid is off and everything stacks in
            written order, which puts the note at the foot, where a footnote
            goes. */}
        <div className="mt-8 md:mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
          <p className="max-w-prose text-pretty text-base leading-relaxed lg:col-span-7 lg:col-start-1 lg:row-start-1">
            {hero.paragraphs[0]}
          </p>

          <p className="mt-5 max-w-prose text-pretty text-base leading-relaxed md:mt-6 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            {claimParagraph[0]}
            {/* The claim. A dotted rule is the gloss mark — it says "annotated",
                where a solid underline would say "link", and this span is not
                one. The asterisk is `aria-hidden`: the note carries the phrase
                in full, so nothing is lost without it. */}
            <span className="underline decoration-muted-foreground decoration-dotted decoration-1 underline-offset-4">
              {claimParagraph[1]}
            </span>
            <span aria-hidden="true" className="align-super text-xs font-semibold">
              *
            </span>
            {claimParagraph[2]}
          </p>

          <p className="mt-5 max-w-prose text-pretty text-base leading-relaxed md:mt-6 lg:col-span-7 lg:col-start-1 lg:row-start-3">
            {hero.paragraphs[2]}
          </p>

          <Citation />
          <Plates />
        </div>
      </div>
    </section>
  );
}

/* The reference. Written last (footnote order), placed into row two at `lg`
   (sidenote position). One anchor, whose accessible name reads as a complete
   citation out of context: "Source for <claim>: <title>. <kicker>, <month>.
   Opens in a new tab." */
function Citation() {
  return (
    <aside
      aria-label="Source"
      className="mt-8 md:mt-10 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:row-end-4 lg:mt-6 lg:self-stretch lg:border-l lg:border-border lg:pl-6"
    >
      {/* The footnote separator, printed short and hung at the left margin —
          a full-measure rule here would read as a section divider, not as the
          hairline that closes a page and opens its notes. At `lg` the note has
          moved into the margin and the rule turns vertical (border-l above), so
          this one steps aside. */}
      <div aria-hidden="true" className="mb-5 h-px w-16 bg-border lg:hidden" />

      <a
        href={citedArticle.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-12 gap-3 py-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <span
          aria-hidden="true"
          className="select-none text-sm font-semibold leading-relaxed text-foreground"
        >
          *
        </span>

        <span className="min-w-0">
          <span className="sr-only">Source for </span>
          {/* The claim restated, so the reference stands on its own. Quiet tone
              at text-sm — `--muted-foreground` is held to 7:1 per §4. */}
          <span className="block text-sm italic leading-relaxed text-muted-foreground">
            &ldquo;{citedPhrase}&rdquo;
          </span>

          <span className="mt-2 block text-sm font-semibold leading-relaxed text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors group-hover:decoration-foreground">
            {citedArticle.title}
          </span>

          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {citedArticle.kicker}, {monthYear(citedArticle.date)}
          </span>

          <span className="sr-only"> (opens in a new tab)</span>
        </span>
      </a>
    </aside>
  );
}

/* Lights the plates only while they are on screen. ExploreCapabilityFilm's own
   `autoPlayInView` covers coarse pointers by design; this covers the rest, so
   the exhibit behaves the same on a trackpad as on a thumb. A film that is
   scrolled away stops decoding — nothing here loops off screen. */
function useOnScreen<T extends HTMLElement>(margin = "-15% 0px -15% 0px") {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, onScreen] as const;
}

/* The shown source. Written after the note, so the reading order is claim,
   written reference, then plates — the order a page of notes actually runs in.
   At `lg` it takes the implicit fourth row of the margin column, directly under
   the note: its own height therefore lands in a row the prose does not use, so
   adding an exhibit can never stretch the gaps between the paragraphs. The
   left hairline picks up exactly where the note's stops, so the apparatus reads
   as one spine rather than two notes. */
function Plates() {
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();

  if (citedPlates.length === 0) return null;

  return (
    <div
      ref={ref}
      className="mt-10 max-w-xs sm:max-w-md lg:col-span-5 lg:col-start-8 lg:row-start-4 lg:mt-0 lg:max-w-none lg:border-l lg:border-border lg:pb-1 lg:pl-6"
    >
      {/* Two words of apparatus, and they are load bearing. The note above is a
          source you read; these are sources you look at, and "also" is what
          chains them to it rather than leaving two images floating in a margin.
          Set quieter than the colophon's section heads, because this labels a
          caption, not a section. */}
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Also shown
      </h4>

      <div className="mt-5 grid grid-cols-2 gap-x-4">
        {citedPlates.map((film) => (
          <figure key={film.id}>
            {/* THE PLATE GROUND IS --grout, AND IT HAS TO BE.
                These clips are a bright lattice on near-black, composited with
                a `lighten` blend, which keeps whichever layer is brighter. On
                the light --secondary this band is painted in, the band wins
                nearly every pixel and the film all but vanishes — verified in a
                capture, not assumed. So the plate is printed on ink, the way a
                botanical plate is, and `dark` is set to match that real
                surface: the blend backdrop then equals this panel's colour
                exactly, so the footage dissolves into it with no rectangle.
                The padding is not decorative: HeroKeywordVideo paints its disc
                at scale 1.2, so the feathered rim lands 10% of the frame width
                outside the frame. The pad has to exceed that at every width or
                the fade gets clipped and the plate grows a faint straight edge
                — hence p-4 on a phone (small frames) stepping to p-5 once the
                plates get big. `overflow-hidden` is the backstop, so no soft
                dark halo can escape onto the band either way. */}
            <div className="overflow-hidden rounded-2xl bg-grout p-4 sm:p-5">
              <ExploreCapabilityFilm film={film} active={onScreen} dark autoPlayInView />
            </div>
            {/* The plate legend: what the footage shows, not what it is called.
                The name is already in the sentence a few centimetres to the
                left, so repeating it would caption the prose, not the film.
                Kept off the ink, so it stays --muted-foreground on the band —
                the same 7:1 tone the note's own subordinate lines use. */}
            <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {film.description}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ── 2. Work ─────────────────────────────────────────────────────────────── */

function Work() {
  return (
    <section aria-label="Work" className={shell}>
      <div className="grid grid-cols-1 gap-8 pb-16 sm:grid-cols-2 lg:gap-10 lg:pb-24 xl:grid-cols-4 xl:gap-12 xl:pb-32">
        {caseStudies.map((entry, index) => {
          const outcome = outcomes[entry.slug];

          return (
            <div key={entry.slug}>
              <ProjectCard entry={entry} index={index} />

              {/* The same rule-and-note as the hero, on the one project whose
                  figures are published. Absence is the normal case here, so the
                  rule belongs to the note and disappears with it — no empty
                  reserved strip under the other three cards. Width is pinned to
                  ProjectCard's own `max-w-sm` cap so the rule sits under the
                  card, not under the cell. */}
              {outcome ? (
                <p className="mx-auto mt-5 w-full max-w-sm border-t border-border pt-3 text-sm leading-relaxed text-foreground">
                  {outcome}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── 3. Colophon ─────────────────────────────────────────────────────────── */

/* The name is not hardcoded: it is the first segment of the hero eyebrow, which
   is the only place on /explore that carries it. Falls back to the whole string
   if the separator ever goes away. */
const [colophonName, colophonRole] = (() => {
  const parts = hero.eyebrow.split("·").map((part) => part.trim());
  return parts.length > 1 ? [parts[0], parts.slice(1).join(" · ")] : [hero.eyebrow, ""];
})();

function Colophon() {
  return (
    <footer className="border-t border-border bg-background">
      <div className={shell}>
        <div className="py-14 md:py-20 lg:py-24">
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
            <div className="min-w-0">
              {/* h3: sibling of the hero headline in this direction's outline. */}
              <h3 className="font-heading text-5xl font-semibold leading-none tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                {colophonName}
              </h3>
              {colophonRole ? (
                <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {colophonRole}
                </p>
              ) : null}
            </div>

            {/* The bibliography. The hero cites one piece because one citation
                is the argument; the colophon lists the set, which is where a
                reference list belongs. It is the reader's safety net without
                reinstating a writing band above the fold. */}
            <div className="mt-12 lg:mt-2 lg:w-80 lg:shrink-0">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Writing
              </h4>
              <ul className="mt-4 space-y-4">
                {articles.map((article) => (
                  <li key={`${article.url}-${article.title}`}>
                    <WritingLink article={article} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The quiet bottom row: everywhere else she is, as plain text. */}
          <div className="mt-12 border-t border-border pt-3 md:mt-16">
            <h4 className="sr-only">Elsewhere</h4>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-1">
              {elsewhere.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`${plainLink} text-sm text-foreground`}
                  >
                    {link.label}
                    {link.external ? (
                      <span className="sr-only"> (opens in a new tab)</span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WritingLink({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-12 flex-col justify-center outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <span className="text-sm font-semibold leading-relaxed text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors group-hover:decoration-foreground">
        {article.title}
      </span>
      <span className="text-sm leading-relaxed text-muted-foreground">
        {article.kicker}, {monthYear(article.date)}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  );
}
