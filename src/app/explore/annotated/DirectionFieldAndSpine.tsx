/*
 * ANNOTATED — direction two: FIELD AND SPINE.
 *
 * THE ARGUMENT. The page opens as one loud field that owns the whole screen: the
 * name at absurd scale, the thesis answering it in a quieter voice, and a film
 * standing beside them at the size of a column. Below the fold the work is an
 * index of words running down a spine, scattered left and right of it, with no
 * thumbnails anywhere. The films are the only pictures on the page, which is
 * what gives them real weight rather than decorative presence.
 *
 * WHY NO THUMBNAILS FOR THE WORK. Four projects fit in a grid; twenty do not,
 * and a home page that has to be redesigned at twelve projects was designed
 * wrong. An index absorbs growth by getting denser rather than longer, and it
 * lets the case study titles be typography rather than captions under pictures.
 * The cost is honest and worth stating: a reader who scans images will find
 * nothing to scan, so this direction lives or dies on the titles being good.
 *
 * WHY THE LOUD FIELD IS INK AND NOT RED, which is the one place this deviates
 * hard from the reference. The reference floods a viewport with a saturated
 * brand red. This shell has no such colour by rule: the home page is neutral and
 * all colour comes from project imagery. The only saturated red in the token set
 * is --destructive, which names an error state, and flooding a home page with it
 * would make the page read as an alert while quietly turning a semantic role
 * into decoration. So the field is loud by TONE instead: a full screen flood of
 * --grout, the deepest surface the shell owns, inverting the whole page.
 * Chromatic loudness is spent in exactly one place, the marigold --hero-highlight
 * on the thesis word and the annotation note, both of which sit on grout where
 * that token measures 10.85:1 (recorded in theme.css).
 *
 * That choice is also load bearing technically: the films only blend over
 * --secondary or --grout. A red field would have been a surface no film could
 * sit on, so the direction's own premise would have broken its assets.
 *
 * THE CORNER LABELS ARE THE NAVIGATION. The reference pins tiny bracketed labels
 * into the four corners of its field; here those labels do real work, carrying
 * the page's only nav. They are set as a row at the head and a row at the foot of
 * the field so they land in the corners without absolute positioning, which means
 * they behave at 320px instead of colliding with the display type.
 *
 * THE COUNTER VOICE. Same construction as direction one and for the same reason:
 * there is no serif in this stack and one paragraph does not justify a webfont.
 * The shift is built from weight, case, tracking, leading, and measure. Avant
 * Garde carries the display line only; Geist carries every paragraph.
 *
 * THE ONE ANNOTATION MOMENT is the note plate: a bracketed production note in
 * marigold, joined to the second film by a single hairline leader. It is the
 * reference's "white balance" plate translated out of marker and into type, and
 * it says something true about the footage rather than decorating it. There is
 * no second annotation on the page.
 *
 * THE INDEX DOES NOT FADE. The reference sets its index entries at low opacity
 * and lights them as you reach them. Resting text below full contrast fails §4
 * outright, and scroll driven opacity is a motion dependency for reading. So
 * every entry rests at full strength and the marigold rule under a title is the
 * hover and focus state only. The scatter carries the rhythm the fade was doing.
 *
 * THE PAGE ENDS ON PAPER. The closing colophon flips back to --secondary, so the
 * contact links are dark on cream and the field reads as a held breath between
 * two sheets of paper rather than a page that simply went dark.
 *
 * HEADINGS. h1 (page) → h2 (direction band) → h3 for each section here.
 *
 * Server component except the two film plates.
 */

import Link from "next/link";
import { workEntryHref } from "../../work/projects";
import {
  articles,
  capabilityFilms,
  caseStudies,
  elsewhere,
  hero,
  outcomes,
} from "../content";
import { AnnotatedFilmPlate } from "./AnnotatedFilmPlate";

/* Page container and gutters, matched to the live home page. */
const container =
  "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";

/* Corner and section labels. On --grout these inherit --grout-foreground
   (#F1ECE5, about 15:1), so they clear §4's 7:1 bar for small text with room to
   spare and need no tint of their own. */
const microLabel = "text-xs font-medium uppercase tracking-[0.2em]";

/* A corner label that is also a link. 44px target, underline appears on hover
   and focus, focus ring drawn in currentColor because the semantic --focus token
   is ink and would be invisible on this field. */
const cornerLink = `${microLabel} inline-flex min-h-12 items-center underline decoration-transparent decoration-1 underline-offset-[0.4em] outline-none transition-colors hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`;

/* The counter voice: regular weight, mixed case, open tracking, loose leading,
   short measure. Everything the display line is not. */
const counterVoice = "text-base leading-loose tracking-wide sm:text-lg";

/* The marigold. --hero-highlight is a shell token (theme.css), used inline the
   same way StatementHero uses its keyword tints, because it is not exposed as a
   Tailwind colour utility. Measured 10.85:1 on the light scheme grout and higher
   on the dark scheme grout, which is deeper still. */
const marigold = { color: "var(--hero-highlight)" } as const;

/* The vertical scatter down the spine. Theme spacing steps, assigned by position
   rather than at random so the layout is deterministic between server and client
   and stable between builds. All positive: entries alternate sides, so they can
   never collide, and pulling one up with a negative margin buys nothing the
   rhythm does not already have. */
const SPINE_OFFSETS = ["md:mt-0", "md:mt-20", "md:mt-8", "md:mt-16"];

function film(id: string) {
  const found = capabilityFilms.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown capability film: ${id}`);
  return found;
}

function monthYear(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function DirectionFieldAndSpine() {
  const opening = film("vibe-coder");
  const plate = film("design-systems");
  const contact = elsewhere.find((link) => !link.external) ?? elsewhere[0];

  return (
    <div>
      {/* ── The field ──────────────────────────────────────────────────────
          One screen, flooded. The section is a column with the label rows pinned
          to its ends, so at md and up the four labels sit in the four corners of
          a full height field and below md they simply stack with the content.

          SURFACE: --grout, so both plates in this direction pass dark={true}. */}
      <section
        aria-labelledby="field-spine-hero"
        className="flex flex-col bg-grout text-grout-foreground md:min-h-svh"
      >
        <div className={`${container} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8 md:pt-10`}>
          <a className={cornerLink} href="#field-spine-work">
            (Work)
          </a>
          <a className={cornerLink} href="#field-spine-writing">
            (Writing)
          </a>
        </div>

        <div className={`${container} flex-1 py-12 md:py-16 lg:py-20`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-16">
            <div className="min-w-0">
              {/* The wordmark. It sets on one line at every width the page is
                  built for; the 8ch cap is the guard that makes a longer name,
                  or a narrower future column, stack rather than overflow. */}
              <h3
                id="field-spine-hero"
                className="max-w-[8ch] font-heading text-6xl font-bold uppercase leading-[0.86] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
              >
                Lizzie Teo
              </h3>

              {/* The thesis, dropped a full register: mixed case, Geist, one
                  marigold word carrying the page's only chroma. */}
              <p className="mt-8 max-w-[24ch] text-xl font-normal leading-snug tracking-tight md:mt-10 md:text-2xl lg:text-3xl">
                A decade designing for{" "}
                <span style={marigold}>complexity</span>
              </p>

              <p className={`mt-6 max-w-[42ch] text-pretty md:mt-8 ${counterVoice}`}>
                {hero.paragraphs[0]}
              </p>
            </div>

            {/* THE OVERSCAN. A lit film settles at scale 1.2 in a frame that
                does not clip, so it bleeds about a tenth of the frame past every
                edge. The cap holds the frame at 30rem so that tenth is a known
                48px at every width above sm, and the caption clears it. Clipping
                is not the alternative: the feather is what removes the
                rectangle, and an overflow-hidden parent restores it. */}
            <AnnotatedFilmPlate
              film={opening}
              dark
              className="mx-auto w-full max-w-[30rem]"
              frameClassName="aspect-square w-full"
            >
              <p className={`mt-14 text-center indent-[0.2em] md:mt-16 ${microLabel}`}>
                {opening.label}
              </p>
            </AnnotatedFilmPlate>
          </div>
        </div>

        <div className={`${container} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-8 md:pb-10`}>
          <a
            className={cornerLink}
            href={contact.href}
            {...(contact.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            (Contact)
          </a>
          <p className={`${microLabel} opacity-70`}>Sydney</p>
        </div>
      </section>

      {/* ── The spine: work ────────────────────────────────────────────────
          A dotted rule down the page with the case studies hung off it, left and
          right, at uneven intervals. Below md the rule moves to the left margin
          and the entries all sit to its right, because a centre spine on a 320px
          screen leaves two columns of about twelve characters each.

          The DOM order is the reading order at every width: entries alternate
          sides with `ml-auto` rather than being split into two columns, so a
          screen reader and the tab sequence walk the index top to bottom. */}
      <section
        aria-labelledby="field-spine-work-heading"
        className="scroll-mt-4 bg-grout text-grout-foreground"
        id="field-spine-work"
      >
        <div className={`${container} pb-16 md:pb-24`}>
          <h3 id="field-spine-work-heading" className={microLabel}>
            (Work)
          </h3>

          {/* The rule lives on the wrapper, not inside the list: only list items
              may be children of an ol. */}
          <div className="relative mt-10 pl-6 md:mt-14 md:pl-0">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 border-l border-dotted border-rail-tile-border md:left-1/2"
            />

            <ol>
            {caseStudies.map((entry, index) => {
              const outcome = outcomes[entry.slug];
              const toTheRight = index % 2 === 1;
              return (
                <li
                  className={`mt-14 first:mt-0 md:w-1/2 ${
                    toTheRight ? "md:ml-auto md:pl-10 lg:pl-16" : "md:pr-10 md:text-right lg:pr-16"
                  } ${SPINE_OFFSETS[index % SPINE_OFFSETS.length]}`}
                  key={entry.slug}
                >
                  <p className={`${microLabel} opacity-70`}>{entry.industry}</p>

                  <h4 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                    <Link
                      className="inline-flex min-h-12 items-center underline decoration-transparent decoration-2 underline-offset-[0.22em] outline-none transition-colors hover:decoration-[var(--hero-highlight)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                      href={workEntryHref(entry)}
                    >
                      {entry.title}
                    </Link>
                  </h4>

                  <p className="mt-2 max-w-[36ch] text-sm leading-relaxed opacity-90 md:mt-3 md:text-base md:leading-relaxed">
                    {entry.tagline}
                  </p>

                  {/* Only Healthdirect carries a published figure, so only
                      Healthdirect gets a line. A mark that most entries do not
                      have is the reason it means something. */}
                  {outcome ? (
                    <p
                      className={`mt-3 ${microLabel} ${toTheRight ? "" : "md:justify-end"} flex flex-wrap items-center gap-x-3 gap-y-1`}
                      style={marigold}
                    >
                      <span aria-hidden="true" className="h-px w-6 bg-current" />
                      {outcome}
                    </p>
                  ) : null}
                </li>
              );
            })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── The note plate ─────────────────────────────────────────────────
          THE ONE ANNOTATION MOMENT. The reference gives a whole field to a
          production note treated as artwork; this is that field, with the note
          set in bracketed micro caps, joined to the film by a single hairline
          leader. No stroke is drawn. The note says what the footage is, which is
          also what makes it readable under reduced motion, where the plate is a
          blended still.

          SURFACE: --grout, dark={true}. */}
      <section aria-label="Film note" className="bg-grout text-grout-foreground" id="field-spine-note">
        <div className={`${container} pb-16 md:pb-24`}>
          <AnnotatedFilmPlate
            film={plate}
            dark
            className="flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-0"
            frameClassName="aspect-square w-full max-w-[26rem]"
          >
            {/* The plate renders the film first, so the note takes `order-first`
                to sit above it on a phone and to its left on a desktop. */}
            <div className="order-first flex flex-col items-center gap-4 md:flex-row">
              <p
                className={`${microLabel} text-center md:max-w-[26ch] md:text-right`}
                style={marigold}
              >
                (On screen) Six films, drawn and animated in code
              </p>
              <span
                aria-hidden="true"
                className="h-px w-16 shrink-0 md:w-24"
                style={{ backgroundColor: "var(--hero-highlight)" }}
              />
            </div>
          </AnnotatedFilmPlate>
        </div>
      </section>

      {/* ── The spine: writing ─────────────────────────────────────────────
          The same spine, opposite behaviour. Work scatters off the rule; writing
          sits on it, centred, small, consecutive. Same device, changed rhythm, so
          the tier reads as a different kind of thing without a second layout. */}
      <section
        aria-labelledby="field-spine-writing-heading"
        className="scroll-mt-4 bg-grout text-grout-foreground"
        id="field-spine-writing"
      >
        <div className={`${container} pb-20 md:pb-28`}>
          <h3 className={microLabel} id="field-spine-writing-heading">
            (Writing)
          </h3>

          <div className="relative mt-10 pl-6 md:mt-14 md:pl-0">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 border-l border-dotted border-rail-tile-border md:left-1/2"
            />

            <ul>
            {articles.map((article) => (
              <li className="mt-8 first:mt-0 md:mx-auto md:max-w-[40ch] md:text-center" key={article.url}>
                <a
                  aria-label={`Read "${article.title}" on Substack, opens in a new tab`}
                  className="group inline-flex min-h-12 flex-col justify-center outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                  href={article.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="text-lg font-semibold leading-snug underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-current md:text-xl">
                    {article.title}
                  </span>
                  <span className={`mt-2 ${microLabel} opacity-70`}>
                    {article.kicker} · {monthYear(article.date)}
                  </span>
                </a>
              </li>
            ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Back to paper ──────────────────────────────────────────────────
          The colophon flips to --secondary. Contact reads dark on cream, and the
          field above becomes a held section rather than the end of the page. */}
      <section
        aria-labelledby="field-spine-elsewhere"
        className="bg-secondary text-foreground"
      >
        <div className={`${container} py-16 md:py-24`}>
          <h3
            className={`${microLabel} text-foreground`}
            id="field-spine-elsewhere"
          >
            (Elsewhere)
          </h3>

          <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-1 md:mt-8">
            {elsewhere.map((link) => (
              <li key={link.label}>
                <a
                  className="inline-flex min-h-12 items-center font-heading text-2xl font-semibold tracking-tight underline decoration-border decoration-1 underline-offset-[0.3em] outline-none transition-colors hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:text-3xl"
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Designed and built in the browser. The films on this page were
            generated, then blended into the field rather than framed on it.
          </p>
        </div>
      </section>
    </div>
  );
}
