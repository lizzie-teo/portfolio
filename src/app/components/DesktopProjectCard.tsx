"use client";

/*
 * DESKTOP PROJECT CARD — the work entry as a window on a desktop.
 *
 * A third candidate home card, built to be read against `FolderProjectCard` and
 * `LoFiProjectCard` on /explore/folder-cards. It ships nowhere and the home grid
 * does not know it exists.
 *
 * THE SOURCE is screenshots/work-treatment: a flat retro-OS illustration in
 * three panels — cream windows with heavy charcoal outlines lying on a pastel
 * desktop, monochrome line icons, dialogs stacked on dialogs, and one filled
 * charcoal button per screen carrying the loud answer. The whole language is
 * built from a single uniform outline weight and flat fills. There is no
 * gradient and no shadow anywhere in the reference, and there is none here.
 *
 * THE ONE IDEA: A CARD IS A THING YOU OPEN, AND A WINDOW IS THE ONLY OBJECT IN
 * THIS VERNACULAR THAT ALREADY MEANS THAT. So the card is not decorated to look
 * like a window; it IS one, and every part of it does the job that part of a
 * window does. The bar names what kind of thing is open. The body holds it. The
 * filled button at the foot is the answer, and it says the same word the cursor
 * says. The reference's own grammar carries the card's real content rather than
 * sitting beside it.
 *
 * THE HOVER IS THE OPERATING SYSTEM'S, NOT AN EFFECT. In a real desktop the
 * active window is the one with the coloured title bar and the inactive ones are
 * plain. At rest every card here is an inactive window on the same wallpaper.
 * Point at one and it wakes up in ITS OWN CASE STUDY'S COLOURS — read off that
 * project's `[data-project-theme]` scope in theme.css, so the card and the page
 * it opens are the same palette (see `desktopInk.ts`): the title bar floods with
 * a pastel of the theme's `--primary`, and the mark takes that `--primary` raw.
 *
 * THE STOCK AND THE FRAME NEVER MOVE. The body stays the resting off-white
 * (owner's call — a version that tinted it to the theme's accent read as too
 * much colour behind the name), and the 3px outline, the bar rule and the two
 * discs stay one uniform grey in both states. A window changing colour is the
 * OS; a window whose outline changes colour is a different drawing.
 *
 * A case study is the only kind of card with a theme to reveal; an article has
 * no client, so it floods charcoal, reverses its label, and does not tint. That
 * difference falls out of the registry rather than being styled in.
 *
 * WHAT IS DELIBERATELY NOT HERE. The reference's left rail of labelled desktop
 * icons (MyComputer, Solitaire) is the most quotable thing in it and is the
 * first thing cut: it is ornament carrying no information, and a row of four
 * cards each with its own icon rail would be four desktops rather than one. The
 * illustrated inset panel from the reference's first panel is cut for a plainer
 * reason — at 288px a bordered inset beside a title leaves neither enough room.
 * One accessory, removed.
 *
 * WHAT THE CARD SAYS, AND WHY IT IS THIS LITTLE. Three things: the mark, the
 * name, the sector. Nothing else. The first pass carried a tagline, an outcome
 * banner, a docket of publication and year, and a filled button at the foot —
 * all of it true, all of it from the registry, and together far too much for an
 * object a reader scans rather than reads. Cutting it is not a trim: with four
 * fewer things in the window the mark can stop being a bullet beside the title
 * and become the card's PICTURE, at 54px, which is what the reference's own
 * windows do — a large drawn area and a little text under it.
 *
 * THE WINDOW WAS TAKEN DOWN ~15% (Aug 2026, owner's call, in two passes). Every
 * number in it moved together, which is the only way a window shrinks without
 * becoming a different window: the mark 72 → 54px, the height floor 288/320 →
 * 216/244, the body padding 20/24 → 16/20, the title bar's own padding 10 → 8,
 * the air above the name 32 → 24, and the width cap 448 → 384. The title is one
 * shared 24px step for both kinds now (`cardHeading`); it is the one number that
 * did NOT take the second cut, because it had already come down from 30 and is
 * the card's content rather than its frame.
 *
 * THE PROPORTIONS ABOVE STILL HOLD — same three things, same places, drawn
 * quieter. WIDTH ON A WIDE ROW IS STILL THE GRID'S, not the card's: `max-w-sm`
 * only bites where a column is wider than 384px (two-up past ~1100), so on a
 * phone and on a three-up row the cards are as wide as they ever were and the
 * whole of this cut is height. Shrink further from the grid, not from here.
 *
 * WHAT THE CUT COSTS, recorded because it is a real loss and not a free win.
 * The outcome was the one beat that varied card to card from the registry
 * (`84%`, `3 months`, `20–30%`), and it is the fact a hiring manager scans for
 * first. This card no longer states any result. If that turns out to matter
 * more than the quiet, the banner is the thing to put back, not the tagline.
 *
 * THE KIND MARK IN THE TITLE BAR STAYS, and it is the one piece of text here
 * that survived on a job rather than on merit. It is the only warning a sighted
 * reader gets that an article's click leaves the site — the aria-label carries
 * that for assistive technology, and nothing else on a stripped card does. An
 * article's sector line says "Leadership", which is a subject, not a
 * destination.
 */

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { BadgeCheckIcon, LandmarkIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import {
  desktopInk,
  desktopRibbon,
  getFlood,
  type DesktopFlood,
} from "./desktopInk";
import { IndustryGlyph } from "./IndustryGlyph";
import { cardHeading } from "./typography";

/* THE OUTLINE WEIGHT, in CSS pixels, and the one number this whole treatment is
   built from. It is artwork rather than layout (style-rules §3), which is why it
   is a constant here and not a spacing token: the reference's look is a single
   uniform stroke on every drawn edge — the window, the discs, the banner, the
   button — and the moment two of them differ it stops reading as one hand.

   THE WEIGHT IS THE PART THAT WAS KEPT; THE BLACKNESS IS THE PART THAT WENT.
   Every edge here is still 3px and still one stroke, but it is drawn in
   `desktopInk.line` — a warm medium grey — rather than in `ink`, because at
   this size four near-black rectangles on the graph sheet read as harsh. The
   reasoning and the contrast table are on the token; the thing to protect HERE
   is that softening the line is never an excuse to thin it. A 1px window is a
   bordered card, which is the one thing this treatment is not. */
const OUTLINE = 3;
/** Rendered size of the industry mark — the card's picture now that the tagline,
    the banner and the foot are gone. It is stated twice: here, so
    `IndustryGlyph` can derive its stroke from the real render size, and as
    `size-13.5` on the element, because Tailwind cannot read a variable. Move both
    together or the mark's weight silently drifts off the card's.

    THE CARD KEEPS THE VECTOR MARK. The pixel sector icons are the FILTER RAIL's
    (marks/pixelMarks) and deliberately do not appear here: the rail is a field
    of desktop icons on a ruled sheet, which is where a 1-bit icon belongs, while
    the card's mark is a large drawn picture inside a window and reads better as
    line work at this size. Two treatments, one per surface, on purpose. */
const GLYPH_PX = 54;

/** PER-PROJECT MARKS, which override the sector glyph for the slugs listed here.
 *
 *  `IndustryGlyph` names a SECTOR, not a project, and that rule is still the
 *  default — but the registry files Funding Finder and AP+ Testing Portal under
 *  one merged Fintech sector, so the home band drew the same struck coin on two
 *  adjacent windows and the grid read as a repeat rather than as two pieces of
 *  work. That is the case the glyph file flags as "a thing to look at"; this is
 *  the look at it. Both projects therefore carry a mark of their own:
 *
 *    Funding Finder      a columned lender — the institution the borrower is
 *                        applying to, not another picture of money
 *    AP+ Testing Portal  a certification rosette with a check — the portal's
 *                        actual output, a test signed off
 *
 *  THEY ARE LUCIDE (shadcn's icon set), NOT NEW HAND-DRAWN GLYPHS, and they stay
 *  in the family by weight rather than by authorship: lucide draws on a 24-unit
 *  box with round caps and joins, the same construction the hairline set uses,
 *  so passing the card's own OUTLINE scaled to that box (below) renders them at
 *  the identical stroke as the window edge. Do not pass lucide's default
 *  `strokeWidth` — 2 on a 24 box at 54px is 4.5px, half again heavier than every
 *  other line on the card.
 *
 *  Anything not listed falls through to the sector glyph. Add an entry only for
 *  a genuine collision like this one; a mark per project would retire the sector
 *  family for no gain. */
const PROJECT_MARKS: Record<string, LucideIcon> = {
  "funding-finder": LandmarkIcon,
  "ap-testing-portal": BadgeCheckIcon,
};
/** Lucide's viewBox is 24 units; this puts its stroke on the card's 3px edge. */
const LUCIDE_STROKE = (OUTLINE * 24) / GLYPH_PX;

/**
 * THE DESKTOP the cards lie on: base cream and two large ribbons, drawn as one
 * SVG stretched across the whole band.
 *
 * Exported from this file rather than written into the /explore page because
 * /explore is gitignored and Tailwind never generates a class that appears only
 * there — anything with real classes has to live in a scanned component.
 *
 * `preserveAspectRatio="none"` is correct here and would be a bug on the die-cut
 * card next door. That shape's fillets skew when stretched, which is why it is
 * drawn at 1:1; a ribbon has no radius to preserve and no size it is meant to
 * be, so stretching it across a wide band just makes the sweep lazier, which is
 * the reference's own proportion. Decorative and aria-hidden throughout.
 */
export function DesktopWallpaper() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 120 60"
      preserveAspectRatio="none"
    >
      <rect width="120" height="60" fill={desktopInk.desk} />
      {/* The lower sweep, entering left and climbing off the right edge. */}
      <path
        fill={desktopRibbon.blush}
        d="M0 44C20 44 26 26 46 24s28 10 46 6c12-3 20-12 28-16v16c-8 4-16 13-28 16-18 4-26-8-46-6S20 58 0 58Z"
      />
      {/* The upper sweep, narrower and shallower so the two never run parallel —
          two bands at one angle read as a stripe pattern, which the reference
          never is. */}
      <path
        fill={desktopRibbon.teal}
        d="M0 12c16 0 24-10 42-8s28 10 46 6c14-3 24-10 32-12v8c-8 2-18 9-32 12-18 4-28-4-46-6S16 20 0 20Z"
      />
    </svg>
  );
}

/**
 * THE PLACEHOLDER — "another project is coming", as an empty window.
 *
 * The floppy shelf has `ComingSoonFloppy` and the home band renders it, so
 * swapping the card without this would quietly drop a tile the grid was built
 * to show. It is the same window with the same bar and nothing in it: no mark,
 * because there is no sector to name, and no flood, because there is nothing to
 * point at. Not a link and not focusable — there is nowhere to go.
 */
export function ComingSoonWindow({ index = 0 }: { index?: number }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      }}
      className="mx-auto flex h-full min-h-54 w-full max-w-sm flex-col sm:min-h-61"
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl"
        style={{
          border: `${OUTLINE}px solid ${desktopInk.line}`,
          backgroundColor: desktopInk.stock,
        }}
      >
        <div
          className="relative flex items-center px-4 py-2"
          style={{ borderBottom: `${OUTLINE}px solid ${desktopInk.line}` }}
        >
          <div className="relative flex shrink-0 gap-1.5">
            <span
              className="block size-3.5 rounded-full"
              style={{ border: `${OUTLINE}px solid ${desktopInk.line}` }}
            />
            <span
              className="block size-3.5 rounded-full"
              style={{ border: `${OUTLINE}px solid ${desktopInk.line}` }}
            />
          </div>
          <p
            className="pointer-events-none absolute inset-x-0 text-center text-xs font-medium uppercase tracking-[0.16em]"
            style={{ textIndent: "0.16em", color: desktopInk.quiet }}
          >
            Soon
          </p>
        </div>

        <div className="flex grow flex-col justify-end p-4 sm:p-5">
          <p className="text-sm leading-snug" style={{ color: desktopInk.quiet }}>
            Another project is on its way.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * THE WINDOW ITSELF, AND IT KNOWS NOTHING ABOUT WHAT IS OPEN IN IT.
 *
 * Extracted from `DesktopProjectCard` when the home page grew a third band. All
 * three shelves — work, explorations, writing — are this one object, and the
 * reason the page reads as a single desktop is that they are literally the same
 * component rather than three that resemble each other. Everything that varies
 * is something a registry can state: the bar's label, the flood, the picture,
 * the name, and the one line under it.
 *
 * IT IS PRESENTATIONAL ON PURPOSE. Every registry-shaped decision — which word
 * goes in the bar, what the accessible name says, whether the click leaves the
 * site — belongs to the wrapper that knows the entry type. Handing this a
 * `WorkEntry | ExplorationEntry` would mean a discriminated union and a branch
 * per kind inside the chrome, which is exactly the drift the extraction exists
 * to prevent: three kinds of card would start acquiring three kinds of window.
 *
 * NOTHING ABOUT THE DRAWING CHANGED IN THE EXTRACTION. Same 3px stroke on every
 * edge, same discs, same flood-on-hover, same lift, same offset focus outline.
 * The notes on each of those are where they always were, inline below.
 */
export function DesktopWindow({
  href,
  external = false,
  barLabel,
  action,
  ariaLabel,
  flood,
  title,
  filing,
  mark,
  index = 0,
}: {
  href: string;
  /** Leaves the site: a plain anchor opening a new tab, rather than a
   *  `next/link` prefetching a route that is not ours. */
  external?: boolean;
  /** The tracked caps label centred in the title bar. It names what KIND of
   *  thing is open — and on a shelf where the band's heading already gives the
   *  kind, the most useful fact available instead. `ExplorationCard` puts the
   *  verdict here for exactly that reason. */
  barLabel: string;
  /** The word the project cursor already says over this card. The card and the
   *  cursor must never name one action two ways. */
  action: string;
  /**
   * Named on the LINK rather than inside the card: an explicit aria-label
   * replaces the element's contents, so anything set `sr-only` in the window
   * would never be reached.
   *
   * IT MAY SAY MORE THAN THE CARD SHOWS, and it should. The accessible name has
   * to contain the visible text (WCAG 2.5.3), but a reader who cannot see the
   * mark has lost the one thing on the card that hints at what the entry was,
   * and a sentence of description puts that back. It must never assert a claim
   * the interface does not make — an accessible name stating an outcome the
   * card stopped showing is a second version of the card rather than a
   * description of it.
   */
  ariaLabel: string;
  flood: DesktopFlood;
  title: string;
  /** The one line under the name. Omitted cleanly. */
  filing?: string;
  /** The card's picture, drawn high in the body with air under it. Omitted
   *  cleanly — an empty window with the title set low is an honest shape, and
   *  the absence is what tells the kinds apart across a grid at a glance. */
  mark?: React.ReactNode;
  index?: number;
}) {
  const shouldReduce = useReducedMotion();

  const cardMotion: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      },
    },
    tap: { scale: shouldReduce ? 1 : 0.985, transition: motionEase.spring },
  };

  /* The window comes to the front. A few pixels of travel is the whole gesture
     because the reference has no shadow to grow and this card is not allowed
     one; the colour arriving in the bar is what carries the state. Hover only —
     keyboard focus draws an offset outline, and lifting a card inside a
     stationary outline reads as a glitch rather than as a response. */
  const liftClass = shouldReduce
    ? ""
    : "transition-transform duration-200 ease-out group-hover:-translate-y-1";

  const card = (
    <motion.article
      variants={cardMotion}
      initial="hidden"
      whileInView="shown"
      whileTap="tap"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      className="flex h-full min-h-54 flex-col sm:min-h-61"
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl",
          liftClass
        )}
        style={{
          border: `${OUTLINE}px solid ${desktopInk.line}`,
          backgroundColor: desktopInk.stock,
        }}
      >
        {/* ── THE TITLE BAR ────────────────────────────────────────────────
            Two open discs at the left and the kind mark centred, over a flood
            layer that is transparent until the window is the active one. The
            flood is a separate absolutely-positioned fill rather than a
            background-colour transition because the colour is per-card and
            therefore inline: opacity is the one property that can be animated
            from a class while the value it reveals stays in a style attribute. */}
        <div
          className="relative flex items-center px-4 py-2"
          style={{ borderBottom: `${OUTLINE}px solid ${desktopInk.line}` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
            style={{ backgroundColor: flood.bar }}
          />

          {/* The discs. Chrome, and the one piece of pure quotation on the
              card — they are what makes a rounded rectangle read as a window
              before a single word is read. Drawn at the card's own outline
              weight so the whole card is one stroke. */}
          <div aria-hidden="true" className="relative flex shrink-0 gap-1.5">
            <span
              className="block size-3.5 rounded-full"
              style={{ border: `${OUTLINE}px solid ${desktopInk.line}` }}
            />
            <span
              className="block size-3.5 rounded-full"
              style={{ border: `${OUTLINE}px solid ${desktopInk.line}` }}
            />
          </div>

          {/* Centred on the BAR rather than on the space left over beside the
              discs, which is what `absolute inset-x-0` buys: a label centred in
              the remainder would sit right of the window's axis and read as
              badly set rather than as offset. `text-indent` matches the
              tracking (§4) — letter-spacing leaves a trailing space after the
              last letter that centring counts as ink. */}
          <p
            className={cn(
              "pointer-events-none absolute inset-x-0 text-center text-xs font-medium uppercase tracking-[0.16em]",
              "transition-colors duration-200 ease-out",
              "text-[color:var(--dw-bar-rest)] group-hover:text-[color:var(--dw-bar-ink)]"
            )}
            style={{ textIndent: "0.16em" }}
          >
            {barLabel}
          </p>
        </div>

        {/* ── THE WINDOW BODY ────────────────────────────────────────────
            The mark high and alone, the name and the filing line set low.
            Nothing between them but air, which is the shape of the reference's
            own dialogs and is only affordable because everything else was cut.

            THE MARK IS DRAWN IN THE FRAME'S OWN TONE, and the colour is set
            HERE, on the body, rather than on the glyph. `IndustryGlyph` is
            `currentColor` by design and takes no `style` prop — threading one
            through eight glyph components to colour a single call site would be
            the wrong end to fix it from — so the body carries the tone and the
            mark inherits it. That is safe precisely because it is the only
            thing in here that inherits: the title and the line below both carry
            an explicit ink of their own, and the spacer draws nothing. Add
            anything else to this box and give it a colour.

            WHY THE MARK IS NOT LEFT AT FULL INK. It is line work at the card's
            own 3px stroke, which makes it one of the treatment's drawn edges
            rather than an illustration sitting inside them — so it moves with
            the outline, or "a single uniform stroke on every drawn edge" stops
            being true the moment the frame softens. */}
        <div
          className={cn(
            "flex grow flex-col p-4 sm:p-5",
            "transition-colors duration-200 ease-out",
            "text-[color:var(--dw-mark-rest)] group-hover:text-[color:var(--dw-mark-ink)]"
          )}
        >
          {/* SOME WINDOWS HAVE NO MARK AT ALL, and the caller decides by
              passing none. Writing was the first: it used to fall through to
              `IndustryGlyph`'s neutral cluster — a fallback drawn for the case
              where a sector is UNMAPPED, which is not the case here. An article
              has no client and therefore no sector, so the cluster stood in for
              a fact that does not exist and read as the wrong icon rather than
              as an absent one. An exploration is the same shape of absence.
              Nothing replaces either. An empty window with the title set low is
              the honest form, and it needs no second vocabulary of marks. */}
          {mark}

          {/* The air that sets the name low and absorbs a row stretching every
              card to the tallest in it. */}
          <div aria-hidden="true" className="min-h-6 grow" />

          {/* ONE TITLE ROLE FOR EVERY KIND, which reverses the split this card
              used to make. The registry's two card roles (30px for a project
              name, 20 → 24px for an article's sentence) are still right on the
              surfaces that show one kind at a time — but this window stands
              them side by side, and a project title a step above the essay next
              to it read as two sizes of one thing rather than as two kinds of
              thing. The bar already names the kind. `cardHeading` lands on the
              step between them; see the token. */}
          <h3
            className={cn(cardHeading, "text-balance")}
            style={{ color: desktopInk.ink }}
          >
            {title}
          </h3>

          {/* THE FILING LINE, in sentence case rather than as a tracked
              uppercase eyebrow. The bar above already wears that treatment, and
              two tracked caps labels on a card carrying three things total
              would make the set of them read as one repeated device. What goes
              in it is the caller's call and the registries keep the candidates
              apart on purpose — a client's `industry`, a piece of writing's
              `topic`, an exploration's `question` are three different kinds of
              fact and must never be filed as one. */}
          {filing && (
            <p
              className="mt-2 text-sm leading-snug"
              style={{ color: desktopInk.quiet }}
            >
              {filing}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );

  /* Both resting/active PAIRS are handed down as custom properties, because
     each half is a per-card value and a Tailwind `group-hover:` variant can
     read a variable but cannot be given a hex. Two pairs: the bar's label, and
     the mark — which the body carries as `color` and the glyph inherits through
     `currentColor`.

     NEITHER THE STOCK NOR THE FRAME IS IN THIS LIST, and neither should join
     it. The window's body stays the same off-white in both states (owner's
     call, Aug 2026: a tinted body was tried and read as too much colour behind
     the name), and the outline, bar rule and discs stay one uniform grey — that
     single stroke is the whole retro-OS register. The hue arrives in exactly
     two places, the bar and the mark, on a window that is otherwise unchanged. */
  const linkStyle = {
    "--dw-bar-rest": desktopInk.ink,
    "--dw-bar-ink": flood.barInk,
    "--dw-mark-rest": desktopInk.line,
    "--dw-mark-ink": flood.mark,
  } as React.CSSProperties;

  /* Rectangular offset outline rather than a ring, matching the die-cut card:
     an offset outline shows the wallpaper the window is lying on, which is the
     point of the ground. */
  const linkClass =
    "group mx-auto block h-full w-full max-w-sm rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label={action}
      aria-label={ariaLabel}
      className={linkClass}
      style={linkStyle}
    >
      {card}
    </a>
  ) : (
    <Link
      href={href}
      data-explore-card
      data-cursor-label={action}
      aria-label={ariaLabel}
      className={linkClass}
      style={linkStyle}
    >
      {card}
    </Link>
  );
}

/**
 * One WORK ENTRY as a window — the wrapper that knows the work registry.
 *
 * Everything here is a lookup or a branch on `entry.kind`; the drawing is
 * `DesktopWindow` above. If a decision in this function is about how the card
 * LOOKS rather than about what the registry says, it is in the wrong file.
 */
export function DesktopProjectCard({
  entry,
  index = 0,
}: {
  entry: WorkEntry;
  index?: number;
}) {
  const isArticle = entry.kind === "article";
  /* Undefined for an article (no slug, and no mark either — see below) and for
     every project that has no override, which falls through to the sector
     glyph. */
  const ProjectMark = isArticle ? undefined : PROJECT_MARKS[entry.slug];

  return (
    <DesktopWindow
      href={workEntryHref(entry)}
      /* An article lives on Substack. That is the whole of the difference. */
      external={isArticle}
      /* The bar names the kind rather than counting the card — the same call
         `FolderProjectCard` makes, and for the same two reasons: an index would
         be the one thing on the card carrying no information, and "Writing" is
         the only warning a sighted reader gets that the click leaves the
         site. */
      barLabel={isArticle ? "Writing" : "Work"}
      action={isArticle ? "Read" : "Open"}
      /* The tagline the card itself no longer shows, put back for a reader who
         cannot see the mark. Neither branch states an outcome: the card stopped
         making that claim. */
      ariaLabel={
        isArticle
          ? `Read "${entry.title}" on ${entry.publication} (opens in a new tab): ${entry.tagline}`
          : `Open the ${entry.title} case study: ${entry.tagline}`
      }
      flood={getFlood(isArticle ? undefined : entry.slug)}
      title={entry.title}
      /* Resolved from the registry and never from an assumption. `industry` is
         the sector a client operated in; `topic` is what a piece of writing is
         about. The registry keeps them apart on purpose, and so does this. */
      filing={isArticle ? entry.topic : entry.industry}
      /* `IndustryGlyph`'s weight contract is what makes a mark drawn for a 32px
         terminal slot legal at 54px: pass the real render size and the stroke
         re-derives, so the figure stays line work at the card's own outline
         weight instead of scaling into a fat outline. A writing window passes
         nothing — see the note at the mark slot. */
      mark={
        isArticle ? undefined : ProjectMark ? (
          /* `aria-hidden` and no `focusable` for the same reason the sector
             glyph is decorative: the card's real name is its heading. Lucide
             sets those itself, but stating them here keeps the two branches
             obviously equivalent to a reader. */
          <ProjectMark
            className="size-13.5 shrink-0"
            strokeWidth={LUCIDE_STROKE}
            aria-hidden="true"
            focusable="false"
          />
        ) : (
          <IndustryGlyph
            industry={entry.industry}
            className="size-13.5 shrink-0"
            weight={{ sizePx: GLYPH_PX, strokePx: OUTLINE }}
          />
        )
      }
      index={index}
    />
  );
}
