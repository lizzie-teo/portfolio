import type { Metadata } from "next";

/*
 * THE EXPLORATIONS REGISTRY — a sibling to `work/projects.ts`, deliberately not
 * part of it.
 *
 * WHY THIS IS A SEPARATE FILE. `workEntries` is the one registry for work, and
 * everything that ships on the home grid derives from it. An exploration is not
 * work in that sense: it has no client, no outcome, no industry and no cover,
 * and it must never appear in the home grid — the grid's job is selling four
 * case studies, and a note about icon geometry competing there would cost more
 * than it earns. Folding these in would mean adding a third `kind` and then
 * filtering it back out of every consumer, which is a registry lying about what
 * it holds. Same discipline, separate list.
 *
 * A LIBRARY, NOT A JOURNAL. The index groups by SUBJECT, not by date, so the
 * page is a catalogue rather than a stream. That is the whole reason this
 * surface can sit on a portfolio safely: a journal with six entries and nothing
 * new for a year reads as abandoned, while a library with six items is just a
 * library. `date` is still required and still shown, because when the work
 * happened is evidence a reader is entitled to — it is metadata on the item,
 * not the spine of the page.
 *
 * THE VERDICT IS THE POINT. Every entry states what happened to the direction,
 * and "killed" is the most valuable value in the set. A reader assessing design
 * judgement learns more from a good looking system that was thrown out, and
 * why, than from another thing that shipped. An entry with no verdict is a pile
 * of artefacts; an entry with one is a decision.
 */

/** What became of the direction. `killed` is not a failure state — see above. */
export type ExplorationVerdict = "shipped" | "killed" | "superseded" | "open";

/** Shelf headings on the library index. Add one only when a second entry needs
 *  it: a shelf holding a single item reads thinner than no shelf at all. */
export type ExplorationSubject = "Marks" | "Cards" | "Typography" | "Motion";

export type ExplorationEntry = {
  slug: string;
  title: string;
  /**
   * The question the exploration set out to settle, as a question. Shown on the
   * library card under the title, and it is what makes the catalogue scannable
   * — a reader picks an item by the problem, not by the artefact.
   */
  question: string;
  subject: ExplorationSubject;
  verdict: ExplorationVerdict;
  /** ISO `YYYY-MM-DD`. Stored machine readable and formatted at the call site
   *  so the index and the entry head can never disagree about a date. */
  date: string;
  /** Two or three sentences for the library card: what was tried and how it
   *  ended. Not the entry's lede — this one has to carry on its own, because a
   *  reader who never clicks through should still take the decision away. */
  summary: string;
};

export const explorationEntries: ExplorationEntry[] = [
  {
    slug: "project-marks",
    title: "Constructed, not depicted",
    question:
      "Can a project mark be generated from a rule instead of drawn as a picture, so it has something to animate?",
    subject: "Marks",
    verdict: "killed",
    date: "2026-08-15",
    /* VERDICT NOTE: `killed` covers both halves. The three constructed families
       were rejected for being interchangeable between projects; the animated
       glyph direction that replaced them was rejected on look. If either is
       ever revived, change this value rather than softening the summary — the
       card is allowed to say the work did not survive. */
    summary:
      "I replaced the site's four depictive sector glyphs with a parametric system: three construction families, every figure generated from an equation so it had count, spacing and bearing to animate. It was legible from 32px to 240px and completely interchangeable. Swap two projects' marks and no reader could tell which was which, so I threw it out and went back to the glyphs already shipping.",
  },
];

export function explorationHref(entry: ExplorationEntry): string {
  return `/explorations/${entry.slug}`;
}

export function getExploration(slug: string): ExplorationEntry | undefined {
  return explorationEntries.find((entry) => entry.slug === slug);
}

export function getExplorationNeighbors(slug: string): {
  previous?: ExplorationEntry;
  next?: ExplorationEntry;
} {
  const index = explorationEntries.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return {};
  }
  return {
    previous: explorationEntries[index - 1],
    next: explorationEntries[index + 1],
  };
}

/** Shelves, in the order `ExplorationSubject` declares them, with empty ones
 *  dropped. Order is stated by the type rather than by insertion so adding an
 *  entry can never reshuffle the index. */
const SUBJECT_ORDER: ExplorationSubject[] = [
  "Marks",
  "Cards",
  "Typography",
  "Motion",
];

export function explorationsBySubject(): {
  subject: ExplorationSubject;
  entries: ExplorationEntry[];
}[] {
  return SUBJECT_ORDER.map((subject) => ({
    subject,
    entries: explorationEntries.filter((entry) => entry.subject === subject),
  })).filter((shelf) => shelf.entries.length > 0);
}

/** Reader facing label for a verdict. Plain past tense: the card states what
 *  happened, and hedging it ("paused", "on hold") would give up the one thing
 *  this surface has that a case study does not. */
export const verdictLabel: Record<ExplorationVerdict, string> = {
  shipped: "Shipped",
  killed: "Killed",
  superseded: "Superseded",
  open: "Still open",
};

/** Long form date for display. Written out rather than numeric so it reads as
 *  prose in the entry head instead of as a version stamp. */
export function formatExplorationDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
}

export function explorationMetadata(slug: string): Metadata {
  const entry = getExploration(slug);
  if (!entry) {
    return {};
  }
  return {
    title: `${entry.title} | Explorations | Lizzie Teo`,
    description: entry.question,
  };
}
