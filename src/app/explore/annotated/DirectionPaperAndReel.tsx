/*
 * ANNOTATED — direction one: PAPER AND REEL.
 *
 * THE ARGUMENT. The home page is printed matter with a reel attached. It opens
 * as a poster on the warm --secondary paper the site already uses: a tiny
 * centred mark, one shouted thesis in oversized caps, and a much quieter
 * paragraph set directly beneath it. Then the paper stops and the film starts,
 * edge to edge on an ink band. The work is no longer a gallery you scroll past;
 * it is a rail you scan sideways, each frame captioned like a contact sheet.
 *
 * THE TIERING, which is the actual proposal:
 *
 *   work       pictures, on a horizontal rail. Adding a project lengthens the
 *              rail, not the page.
 *   writing    words, in a vertical column of hairline ruled rows directly
 *              under it. The change of axis is the tier signal: you cannot
 *              mistake a row in a column for a frame on a rail, so neither has
 *              to be shrunk to prove it is the lesser one.
 *   elsewhere  a closing plate that inverts to ink, carrying the second film
 *              and the contact labels, with the name cropped by the bottom edge.
 *
 * THE COUNTER VOICE, and why there is no serif. The reference sets its display
 * type as heavy caps and answers it with a small serif paragraph. This stack has
 * two sans faces and no serif, and adding a webfont for one paragraph is not a
 * trade worth making. So the voice shift is built from everything except the
 * face: the display line is Avant Garde, bold, uppercase, tracked tight, set at
 * a leading under one; the answering paragraph is Geist, regular weight, mixed
 * case, tracked open, set at `leading-loose` on a measure narrow enough that no
 * line runs past about forty characters. Two registers, one type pairing. Avant
 * Garde stays display only throughout, per the house rule.
 *
 * THE ONE ANNOTATION MOMENT is the struck correction in the masthead role line:
 * "Developer" ruled through and answered by "Code Tinkerer". It earns its place
 * because it is true — that line is already a self correction in the live hero
 * copy, and the strike simply shows the edit instead of hiding it. It is set in
 * plain ink at label size, not drawn, not coloured, and it happens exactly once
 * on the page. Everything else the reference does with a marker (circled labels,
 * loose strokes) is expressed here as brackets and rules instead.
 *
 * THE BRACKETED LABELS are a labelling system, not annotation: `(Work)`,
 * `(Writing)`, `(Elsewhere)`. They carry section names at label size so the
 * display type never has to shrink to a subheading, and the brackets do the job
 * a rule or a numeral would otherwise do. No counters appear anywhere.
 *
 * THE FILMS. Two, both on --grout (dark={true}):
 *
 *   complexity      the reel band that cuts in under the thesis it illustrates.
 *   figma to code   the closing plate.
 *
 * The reel started on the paper and was moved. The reason is written at the band
 * itself and is the most useful thing this direction learned: --secondary is a
 * valid blend surface but a poor one in the light theme, because lighten keeps
 * whichever layer is brighter and cream out-brightens most of the footage.
 * Neither clip is eagerly loaded; see AnnotatedFilmPlate.
 *
 * MOTION. Nothing here animates except the films and the ProjectCards, both of
 * which bring their own reduced motion handling. The rail is a native scroller,
 * so keyboard focus moves cards into view by the browser's own behaviour and
 * there is no scroll hijacking to undo.
 *
 * HEADINGS. /explore/annotated runs h1 (page) → h2 (direction band) → h3 here,
 * so every section of this direction takes an h3. ProjectCard emits its own h2
 * per card, which is correct on the live home page and out of order on a
 * comparison page; it is a shared component and is deliberately not touched.
 *
 * Server component except for the film plates and the cards, which bring their
 * own client boundaries.
 */

import { ProjectCard } from "../../components/ProjectCard";
import { workEntryHref } from "../../work/projects";
import { articles, capabilityFilms, caseStudies, elsewhere, hero } from "../content";
import { AnnotatedFilmPlate } from "./AnnotatedFilmPlate";

/* Page container and gutters, matched to the live home page so the rail and the
   poster sit exactly where production would put them. */
const container =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* The one small label treatment on this direction: uppercase, tracked into
   words, full strength ink. §4 holds text at this size to 7:1, and --foreground
   on --secondary paper measures about 11:1, so the label never needs a tint. */
const microLabel =
  "text-xs font-medium uppercase tracking-[0.2em] text-foreground";

/* The counter voice. Everything here is the opposite of the display setting
   above it: regular weight, mixed case, open tracking, loose leading, narrow
   measure. Read the header note on why this is not a serif. */
const counterVoice =
  "text-base leading-loose tracking-wide text-foreground sm:text-lg";

/* Film lookup by id rather than by index, so re-ordering the catalogue in
   content.ts can never silently swap which clip illustrates which line. */
function film(id: string) {
  const found = capabilityFilms.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown capability film: ${id}`);
  return found;
}

/* Month and year, fixed locale and UTC so server and client agree. */
function monthYear(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function DirectionPaperAndReel() {
  const reel = film("complexity");
  const closing = film("figma-to-code");

  return (
    <div className="bg-secondary text-foreground">
      {/* ── The poster ─────────────────────────────────────────────────────
          Centred, symmetric, and deliberately top heavy: mark, corrected role
          line, thesis, answer. The whole block is centred because the reference
          is, and because a centred axis is what makes the rail below read as a
          departure rather than more of the same. */}
      <section aria-labelledby="paper-reel-poster" className={`${container} pb-12 pt-12 text-center md:pb-16 md:pt-20 lg:pt-24`}>
        <p className="font-heading text-sm font-bold uppercase tracking-[0.28em] indent-[0.28em]">
          Lizzie Teo
        </p>

        {/* THE ANNOTATION MOMENT. Two renderings of the same line: the visible
            one carries the strike so the edit is on the page, and the screen
            reader gets the corrected sentence only — a struck word read aloud in
            sequence would say the opposite of what the line means. */}
        <p className={`mt-4 ${microLabel}`}>
          <span className="sr-only">Product designer and code tinkerer</span>
          <span aria-hidden="true">
            Product Designer &amp;{" "}
            <s className="text-muted-foreground decoration-foreground decoration-1">
              Developer
            </s>{" "}
            <span className="font-semibold">Code Tinkerer</span>
          </span>
        </p>

        <h3
          id="paper-reel-poster"
          className="mx-auto mt-10 max-w-[13ch] font-heading text-4xl font-bold uppercase leading-[0.92] tracking-tight sm:text-6xl md:mt-14 md:text-7xl lg:text-8xl xl:text-9xl"
        >
          {hero.headline}
        </h3>

        {/* Ranged left on the narrowest screens and centred from sm. §4 rules
            out long centred paragraphs, and at 320px this one sets over seven
            lines; from sm it settles at four or fewer, which is short display
            copy and may be centred with the rest of the poster. */}
        <p className={`mx-auto mt-8 max-w-[42ch] text-pretty text-left sm:text-center md:mt-10 ${counterVoice}`}>
          {hero.paragraphs[0]}
        </p>
      </section>

      {/* ── The reel ───────────────────────────────────────────────────────
          The paper stops and the film starts, edge to edge, exactly where the
          reference cuts from its poster to full width video.

          SURFACE: --grout, so dark={true}. THIS BAND WAS FIRST BUILT ON THE
          PAPER and it did not work, which is worth recording because the
          surface contract reads as if either tone is fine. It is fine
          technically: over --secondary the lighten blend still clamps the
          footage's empty field to exactly the paper, so there is no rectangle.
          But --secondary in the light theme is #F2F0EB, and lighten keeps
          whichever layer is brighter — so cream out-brightens everything in
          these clips except their few near-white highlights, and the film
          renders as a ghost. A film you have to look for is not the presence
          this direction is arguing for, so the reel takes the ink.

          Capped at 44rem because the frame draws a square inscribed circle: an
          uncapped disc on a wide desktop would be over a thousand pixels tall
          and push the rail two screens down.

          THE OVERSCAN, which every plate on this page has to pay for. A lit film
          settles at scale 1.2 inside a frame that does not clip, so it bleeds
          about 10% of the frame's own size past every edge. Captions and section
          padding are therefore sized to clear a tenth of the frame at the width
          they apply to, and the frame's cap steps with the breakpoints so that
          tenth stays inside the margins rather than growing past them. Clipping
          instead is not an option: the feather is what removes the rectangle, and
          an overflow-hidden parent would put a hard edge straight back. */}
      <section aria-label="Opening film" className="bg-grout text-grout-foreground" id="paper-reel-reel">
        <div className={`${container} py-16 md:py-20 lg:py-24`}>
          <AnnotatedFilmPlate
            film={reel}
            dark
            className="mx-auto w-full max-w-[30rem] md:max-w-[36rem] lg:max-w-[44rem]"
            frameClassName="aspect-square w-full"
          >
            <p className="mt-12 text-center text-xs font-medium uppercase tracking-[0.2em] indent-[0.2em] md:mt-16 lg:mt-20">
              {reel.label}
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-center text-sm leading-relaxed opacity-90">
              {reel.description}
            </p>
          </AnnotatedFilmPlate>
        </div>
      </section>

      {/* ── The rail ───────────────────────────────────────────────────────
          Work as a contact sheet. The scroller runs the full page width with the
          gutters carried inside it, so the first card starts on the page margin
          and the last one can scroll clear of the right edge; the next card
          always peeks, which is the affordance. Snap points align each frame to
          the gutter. Native scrolling throughout: no hijack, no custom wheel
          handling, and keyboard focus moves a card into view by itself. */}
      <section aria-labelledby="paper-reel-work" className="pb-16 pt-12 md:pb-20 md:pt-16">
        <div className={`${container} flex flex-wrap items-baseline justify-between gap-3`}>
          <h3 id="paper-reel-work" className={microLabel}>
            (Work)
          </h3>
          <p className="text-sm text-muted-foreground">Scan the rail sideways</p>
        </div>

        <ul
          className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 md:mt-8 md:gap-8 md:scroll-px-8 md:px-8 lg:scroll-px-12 lg:px-12 xl:scroll-px-16 xl:px-16 2xl:scroll-px-24 2xl:px-24"
        >
          {/* THE CELL WIDTH steps up faster than the page does, on purpose: at
              the widest desktop four cells still measure wider than the
              container, so the rail always has somewhere to go. A rail that
              happens to fit is just a row, and the label above it would be
              telling the reader to do something the page will not do. */}
          {caseStudies.map((entry, index) => (
            <li
              key={workEntryHref(entry)}
              className="w-60 shrink-0 snap-start sm:w-64 lg:w-72 xl:w-80 2xl:w-96"
            >
              <ProjectCard entry={entry} index={index} />
              {/* The frame's caption. The card already names the project and its
                  sector; the tagline is the one thing it does not carry, which
                  is exactly what a contact sheet label is for. */}
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {entry.tagline}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── The writing column ─────────────────────────────────────────────
          Words, ruled, running down the page. The change of axis against the
          rail above is the whole tiering device. */}
      <section aria-labelledby="paper-reel-writing" className={`${container} pb-16 md:pb-24`}>
        <h3 id="paper-reel-writing" className={microLabel}>
          (Writing)
        </h3>

        <ul className="mt-6 border-t border-border md:mt-8">
          {articles.map((article) => (
            <li key={article.url}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read "${article.title}" on Substack, opens in a new tab`}
                className="group flex min-h-12 flex-col gap-2 border-b border-border py-5 outline-none transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-8 md:py-6"
              >
                <span className="font-heading text-lg font-semibold tracking-tight underline decoration-border decoration-1 underline-offset-4 transition-colors group-hover:decoration-foreground md:text-xl">
                  {article.title}
                </span>
                <span className={microLabel}>
                  {article.kicker} · {monthYear(article.date)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── The closing plate ──────────────────────────────────────────────
          The page inverts to ink for its last screen: the second film, the
          contact labels, and the name cropped by the bottom edge. The crop is
          the reference's cropped wordmark, done with a quarter turn of the line
          box rather than a magic offset — the section clips, the wordmark sits
          last with nothing beneath it, so a quarter of its own height falls off
          the page.

          SURFACE: --grout, so dark={true} on the plate below. */}
      <section
        aria-labelledby="paper-reel-elsewhere"
        className="relative overflow-hidden bg-grout text-grout-foreground"
      >
        <div className={`${container} pt-16 md:pt-24`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
            <div>
              <h3 id="paper-reel-elsewhere" className="text-xs font-medium uppercase tracking-[0.2em]">
                (Elsewhere)
              </h3>

              <ul className="mt-6 flex flex-col gap-1 md:mt-8">
                {elsewhere.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex min-h-12 items-center font-heading text-2xl font-semibold tracking-tight underline decoration-current/30 decoration-1 underline-offset-[0.3em] outline-none transition-colors hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:text-3xl"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-10 max-w-[46ch] text-sm leading-relaxed opacity-90">
                Designed and built in the browser. The films on this page were
                generated, then blended into the paper rather than framed on it.
              </p>
            </div>

            {/* Capped and margined for the overscan noted at the reel band. */}
            <AnnotatedFilmPlate
              film={closing}
              dark
              className="mx-auto w-full max-w-[26rem]"
              frameClassName="aspect-square w-full"
            >
              <p className="mt-12 text-center text-xs font-medium uppercase tracking-[0.2em] indent-[0.2em] md:mt-14">
                {closing.label}
              </p>
            </AnnotatedFilmPlate>
          </div>
        </div>

        <p
          aria-hidden="true"
          className={`${container} mt-10 translate-y-1/4 font-heading text-7xl font-bold uppercase leading-none tracking-tight sm:text-8xl md:mt-16 md:text-9xl`}
        >
          Lizzie Teo
        </p>
      </section>
    </div>
  );
}
