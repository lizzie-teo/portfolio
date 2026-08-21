"use client";

/*
 * ONE EXPLORATION AS A WINDOW — the third shelf on the home desktop.
 *
 * It is `DesktopWindow` (see DesktopProjectCard), the same component the work
 * and writing bands draw, given an exploration instead of a work entry. Nothing
 * about the drawing is new and nothing here styles anything: this file is the
 * mapping from one registry's fields to that window's slots, which is the whole
 * reason the window was extracted.
 *
 * ── THE TITLE BAR CARRIES THE VERDICT, NOT THE WORD "EXPLORATION" ─────────
 * The bar's job is to name what kind of thing is open, and on this shelf that
 * word would be free: the band's `h2` says Explorations, and every window under
 * it is one. Spending the slot on a label the reader has already been given is
 * the "counter on a card" objection the treatment makes about ref codes.
 *
 * So it states the fact the library is FOR. `entries.ts` is explicit that the
 * verdict is the point and that `killed` is the most valuable value in the set
 * — a reader assessing design judgement learns more from a good-looking system
 * that was thrown out, and why, than from another thing that shipped. Put in
 * the bar, that word is the first thing read on the card and the last thing a
 * skimmer forgets, which is exactly where it belongs.
 *
 * IT IS A DIFFERENT KIND OF WORD FROM "WORK" AND "WRITING", and that is worth
 * saying out loud because it is the one place the three shelves stop speaking
 * one vocabulary. Those two are kinds; "Killed" is a status. It holds because
 * each band is homogeneous — every bar in THIS grid carries a verdict, so
 * within the shelf it reads as one system rather than as an exception — and
 * because the alternative was a row of identical windows all labelled the same
 * word. If the three bands are ever interleaved into one grid, this is the
 * first thing that breaks.
 *
 * NOTHING IS COLOUR CODED. `entries.ts` resists a status widget and the home
 * page carries no project colour on either side of a hover, so a red KILLED was
 * never available. The word is set in the same ink as every other bar label and
 * carries its weight by being a word.
 *
 * ── THE FLOOD IS CHARCOAL ────────────────────────────────────────────────
 * `writingFlood`, borrowed rather than re-derived. A case study reveals its
 * client's hue on hover because there is a client to reveal; an exploration has
 * no client, exactly like an essay, and inventing a pastel for it would be
 * claiming an identity that a working note does not have.
 *
 * ── NO MARK ──────────────────────────────────────────────────────────────
 * Same absence as a writing window, for the same reason: the mark slot holds a
 * SECTOR glyph, an exploration has no sector, and a stand-in figure would read
 * as the wrong icon rather than as an absent one. The subject ("Marks",
 * "Cards") is a shelf heading on the library index, not a sector, and drawing
 * it would mean a second vocabulary of marks invented for four words.
 *
 * ── THE FILING LINE IS THE QUESTION, AND IT IS LONGER THAN A FILING LINE ──
 * The work and writing windows put a short noun there — "Fintech",
 * "Leadership". The obvious symmetry would be to put the exploration's
 * `subject` there and it is the wrong call, because of what an exploration's
 * TITLE is: "Constructed, not depicted" is a phrase, not the name of a knowable
 * thing. "Healthdirect Symptom Checker" and "Leadership Without Authority" both
 * tell a reader what they are looking at; a card reading "Constructed, not
 * depicted" over the word "Marks" tells them nothing at all.
 *
 * So the question takes the slot, at the same size and ink, unclamped. It runs
 * three or four lines and the card grows — which costs nothing, because a grid
 * row already stretches every card to the tallest in it and the body's own
 * spacer is built to absorb exactly that. `entries.ts` states the reason
 * independently: a reader picks an item by the problem, not by the artefact.
 *
 * WHAT THE SUBJECT COSTS BY BEING DROPPED: nothing on this surface. It exists
 * to shelve the library index by topic, and a preview band showing three cards
 * has no shelves.
 */

import { DesktopWindow } from "./DesktopProjectCard";
import { writingFlood } from "./desktopInk";
import {
  explorationHref,
  verdictLabel,
  type ExplorationEntry,
} from "../explorations/entries";

export function ExplorationCard({
  entry,
  index = 0,
}: {
  entry: ExplorationEntry;
  index?: number;
}) {
  return (
    <DesktopWindow
      href={explorationHref(entry)}
      /* Stays on the site, unlike a Substack post — so `next/link`, not an
         anchor with a new tab. */
      barLabel={verdictLabel[entry.verdict]}
      /* The same word the project cursor says over a writing window, because it
         is the same promise: this opens something to read. */
      action="Read"
      /* The verdict is spoken as part of the name rather than left to the bar,
         which a screen reader never reaches — the explicit label replaces the
         card's contents. The summary follows because it is written to carry on
         its own for a reader who never clicks through (`entries.ts`), which
         makes it the right sentence to hand someone who cannot see the card. */
      ariaLabel={`Read the exploration "${entry.title}" — ${verdictLabel[
        entry.verdict
      ].toLowerCase()}: ${entry.question}`}
      flood={writingFlood}
      title={entry.title}
      filing={entry.question}
      index={index}
    />
  );
}
