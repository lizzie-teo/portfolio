/*
 * THE EXPLORATIONS BAND — the library, previewed on the home page.
 *
 * A shelf of `ExplorationCard` windows: the same object the work band and the
 * writing band are made of, so the lower half of the home page is one desktop
 * with three shelves on it rather than three treatments stacked. The mapping
 * from an exploration to that window — verdict in the title bar, charcoal
 * flood, no mark, the question on the filing line — is all in `ExplorationCard`
 * and none of it is here.
 *
 * ── WHAT THIS REPLACED, AND WHY THE OLD ARGUMENT LOST ────────────────────
 * This band used to be set in TYPE and nothing else — no plate, no thumbnail,
 * no mark — and the reasoning was good enough to be worth keeping rather than
 * deleting:
 *
 *   "It sits between two pictorial bands, so this one is set in type and
 *   nothing else. That is not restraint for its own sake, it is what the
 *   content is: an exploration on the home page is a decision stated, and the
 *   artefacts that back it up live behind the link. A band with no picture in
 *   it, between two bands that are mostly picture, is unmistakably its own
 *   thing while borrowing every part of its language from its neighbours. It
 *   removes a visual language rather than adding a third."
 *
 * Each entry was a STAMP: name, question, then `KILLED ──────── AUGUST 2026` on
 * one rule, verdict last because it was the answer to the question above it.
 * The rule did double duty, tying the verdict to its date and dividing one
 * entry from the next.
 *
 * IT LOST ON ONE FACT, not on taste (owner's call, Aug 2026): the reader meets
 * two bands of windows and then a page of type, and a shelf that is
 * unmistakably its own thing is also unmistakably the one that looks unfinished
 * next to its neighbours. Uniformity across the three bands was worth more than
 * the contrast the type-only treatment bought.
 *
 * WHAT SURVIVED THE MOVE. The verdict is still the point and is still read
 * FIRST rather than last — it is in the title bar now, which is the loudest
 * slot on the card instead of the closing line of a stamp. The question is
 * still the line a reader picks by. Nothing is colour coded, nothing is
 * chipped, and there is still no counter anywhere.
 *
 * WHAT DID NOT SURVIVE, recorded as a real loss: the DATE. The stamp carried it
 * on the other end of the rule and the window has no slot for it — the card
 * holds three things and a fourth was the thing this treatment cut on purpose.
 * `entries.ts` calls the date "evidence a reader is entitled to", which it
 * still is on the library index at /explorations, where every entry states one.
 * The home band is a preview and now says when nothing happened. If that
 * matters more than the uniformity, the date is the thing to put back, and the
 * filing line is the only place it could go.
 *
 * ── IT STILL HAS TO SURVIVE ONE ENTRY AND TWELVE ─────────────────────────
 * One entry is what the registry holds today, and this is where a card shelf is
 * genuinely weaker than the list it replaced: a list holding one row reads as a
 * list with one row in it, while a shelf holding one card reads as an empty
 * shelf. The grid below is the same three-across recipe the other two bands
 * use, so a single card sits in the left column with two columns of air beside
 * it. That is the shape to watch. The band is not padded out to look busier and
 * should not be — but unlike the list, it does now want a second and third
 * entry to look like itself.
 *
 * NO COUNTER, per the index's own rule: a number here invites the reader to
 * judge the library by its size, which is the one measure a growing collection
 * always loses on.
 */

import Link from "next/link";
import { explorationEntries } from "../explorations/entries";
import { ExplorationCard } from "./ExplorationCard";
import { bandHeading } from "./typography";
import { workGridColumns } from "./gridColumns";

export function ExplorationsBand() {
  return (
    <div>
      <h2 className={`${bandHeading} text-foreground`}>Explorations</h2>
      {/* --foreground, and the quiet tokens are out of reach here now. This note
          used to assume the ruling painted no ground and the surface was still
          --secondary; it is GraphDesk's --accent sheet, a step darker, and
          --secondary-foreground / --muted-foreground (one colour, #55504A) both
          measure 6.583:1 on it — under the 7:1 bar small text is held to (§4).
          The full ink clears at 9.769:1. This is the trade GraphDesk's own note
          describes: every earlier sheet was pinned to --secondary's lightness by
          exactly this figure, and a sheet that actually reads costs the quiet
          ink. WorkGallery's rail already stood in --foreground for its own
          reason, so the three bands are one ink rather than two. */}
      {/* THE GAP OPENED WITH THE HEADING. It was `mt-3`, set under a 36px
          rubric; the band name is the cover line now (40 → 88px) and 12px
          under an 88px display line is a lede sitting on the descenders. The
          same 5 → 6 step is under the Substack band's lede — the two are one
          pairing and must not drift. */}
      <p className="mt-5 max-w-prose text-sm leading-relaxed text-foreground md:mt-6">
        Directions tried while building this site, and what became of them.
        Killed is the most useful verdict in here.
      </p>

      {/* THE SAME COLUMN RECIPE AS `WorkGrid`, AND NOW ACTUALLY BORROWED.
          It used to be restated here by hand, on the grounds that `WorkGrid` is
          typed to the work registry and an exploration is deliberately not in
          it (see `entries.ts` on why the two registries are siblings). That
          reasoning held for the component and never held for the class string,
          which carries no typing at all — so the string is imported and the
          note's own warning, that two shelves of the same windows at different
          column counts read as two different grids, is enforced rather than
          trusted.

          `lg`, not `xl`: this band has no filter rail, like the two card bands
          it sits between on this page. `gridColumns.ts` carries the widths, and
          is a plain module rather than a `WorkGrid` export precisely so this
          server component can read it without crossing a client boundary. */}
      <div className={`mt-10 ${workGridColumns.lg}`}>
        {explorationEntries.map((entry, index) => (
          <ExplorationCard key={entry.slug} entry={entry} index={index} />
        ))}
      </div>

      {/* The way through to the full library, and the one place the DATE and
          the subject shelves still exist. The masthead points at this band, so
          this is the only link on the page to the index itself — see
          lib/site-nav.ts. */}
      <p className="mt-10">
        <Link
          href="/explorations"
          className="group relative inline-block font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary"
        >
          All explorations
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-full h-px origin-left scale-x-0 bg-current transition-transform duration-100 ease-in group-hover:scale-x-100 group-hover:duration-200 group-hover:ease-out group-focus-visible:scale-x-100 motion-reduce:scale-x-100 motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:group-hover:opacity-100"
          />
        </Link>
      </p>
    </div>
  );
}
