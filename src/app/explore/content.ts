/*
 * EXPLORE — shared content for the three landing-page directions.
 *
 * The point of /explore is to compare LAYOUT, so all three directions read from
 * this one module. Any difference you see between them is a composition
 * decision, never a content difference.
 *
 * WHAT IS REAL AND WHAT IS PLACEHOLDER
 *
 *   real         the case studies (pulled live from the work registry), the hero
 *                copy (lifted verbatim from StatementHero), and the Healthdirect
 *                outcome figures (the published ones already cited in that case
 *                study).
 *   placeholder  every article, and every "elsewhere" href. These are marked
 *                below and MUST be replaced with the real Substack posts and
 *                profile URLs before any of this is promoted to the home page.
 *
 * No email address is hardcoded here on purpose — publishing one is the page
 * owner's call, not a default.
 */

import { workEntries, type CaseStudyEntry } from "../work/projects";

/* ── The case studies ──────────────────────────────────────────────────────
   Straight off the registry, so /explore can never drift from the real set. */
export const caseStudies: CaseStudyEntry[] = workEntries.filter(
  (entry): entry is CaseStudyEntry => entry.kind === "case-study",
);

/* ── Outcomes ──────────────────────────────────────────────────────────────
   The one line a hiring reader wants that the current card does not carry.

   ONLY Healthdirect has a figure here, and deliberately so: those numbers are
   published (they already appear in that case study). The other three have no
   citable public outcome yet, so they carry `undefined` rather than an invented
   one. That is also the useful test — every direction has to survive a set
   where most entries have no metric, which is the honest state of the data.

   Fill the gaps only with figures that are actually publishable. */
export const outcomes: Record<string, string | undefined> = {
  "healthdirect-symptom-checker": "Completion 49% to 84%, 2M checks a year",
  "funding-finder": undefined,
  "ap-testing-portal": undefined,
  "macquarie-radar": undefined,
};

/* The case study each direction leads with when it needs a single hero project.
   Healthdirect, because it is the only one carrying a published outcome and it
   has the richest cover. */
export const featuredSlug = "healthdirect-symptom-checker";

/* ── Writing ───────────────────────────────────────────────────────────────
   PLACEHOLDER. Titles, dates, and URLs are invented so the layouts can be
   judged at a realistic length. Replace wholesale with the real posts.

   `date` is an ISO string so the directions can group and format it themselves;
   `kicker` is the small category label. */
export type Article = {
  title: string;
  /** One-line hook. Shown by the directions that have room for it. */
  hook: string;
  date: string;
  kicker: string;
  url: string;
};

export const articles: Article[] = [
  {
    title: "Placeholder — the AI article",
    hook: "Why designing with AI changed how I scope a system rather than how fast I draw one.",
    date: "2026-05-14",
    kicker: "AI",
    url: "https://example.com/replace-me",
  },
  {
    title: "Placeholder — a second post",
    hook: "A shorter note, here so the index can be judged with more than one row in it.",
    date: "2026-02-03",
    kicker: "Design systems",
    url: "https://example.com/replace-me-too",
  },
  {
    title: "Placeholder — an older post",
    hook: "A third row, sitting in a previous year so the year grouping is exercised.",
    date: "2025-11-20",
    kicker: "Process",
    url: "https://example.com/replace-me-three",
  },
];

/* The article a direction cites inline as evidence for the hero's AI claim
   (direction three). Points at the AI post. */
export const citedArticle = articles[0];

/* ── Elsewhere ─────────────────────────────────────────────────────────────
   PLACEHOLDER hrefs. This is where LinkedIn lives — a colophon item, never a
   card in the work grid. */
export type ElsewhereLink = { label: string; href: string; external: boolean };

export const elsewhere: ElsewhereLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/REPLACE-ME", external: true },
  { label: "Substack", href: "https://example.com/replace-me", external: true },
  { label: "Email", href: "mailto:REPLACE-ME", external: false },
];

/* ── Hero copy ─────────────────────────────────────────────────────────────
   Lifted verbatim from StatementHero so the directions argue about placement,
   not wording. The live hero makes six words interactive; on /explore the copy
   is static (three heavy video stages on one page would drown the comparison),
   except in direction three where the citation treatment is the whole point. */
export const hero = {
  eyebrow: "Lizzie Teo · Product Designer & Code Tinkerer",
  headline: "A decade designing for complexity",
  paragraphs: [
    "I've designed for users: banks, merchants, internal testers, healthcare professionals. Knowing I've made someone's day a little easier is what gives the work meaning.",
    "I love making things simpler. I rethink clunky workflows and build AI ready design systems, from Figma to code, using tools like Claude Code to ship faster.",
    "I'm just as into the people side. Sitting with stakeholders and making the process better for the whole team.",
  ],
} as const;

/* The exact substring in paragraph two that direction three attaches its
   citation to. Kept here so the direction never hardcodes a slice of prose. */
export const citedPhrase = "AI ready design systems, from Figma to code";

/* ── Capability films ──────────────────────────────────────────────────────
   The six clips in /public/assets/my-capabilities that the live hero reveals
   when you hover its keywords. REAL assets, already shipped.

   Each is a generative clip in one shared visual language: a bright glowing
   lattice on a near-black field. That matters technically — the footage is
   light-on-nothing, so it is composited with a `lighten` blend over a backdrop
   painted in the current band tone (see .docs/video-blend.md and the long note
   in components/HeroKeywordVideo.tsx). It only blends correctly over --secondary
   or --grout. Put one of these on any other surface and you get a visible black
   rectangle.

   `phrase` is the words in the hero copy this film belongs to, so a direction
   can tie a film to the sentence it illustrates rather than captioning it
   generically. `label` is the short standalone caption for directions that
   present the films as a set instead of as a hover payoff.

   Superseded assets in the same folder — ai.mp4, ai.png, ui-design.mp4 — are
   NOT in this list on purpose. ai-v2.mp4 replaced ai.mp4. Do not reach for them.

   Weights run 0.9MB to 3.0MB per clip, so nothing here may be eagerly loaded;
   see ExploreCapabilityFilm, which is the only sanctioned way to mount one. */
export type CapabilityFilm = {
  id: string;
  /** The words in the hero copy this film illustrates. */
  phrase: string;
  /** Short standalone caption, for set presentations. */
  label: string;
  /** What the footage actually shows — for alt text and captions. */
  description: string;
  src: string;
  poster: string;
};

const FILM_DIR = "/assets/my-capabilities";

export const capabilityFilms: CapabilityFilm[] = [
  {
    id: "complexity",
    phrase: "complexity",
    label: "Complexity",
    description:
      "A circular botanical labyrinth with one glowing path threading from the entrance to the flower at its centre.",
    src: `${FILM_DIR}/complexity.mp4`,
    poster: `${FILM_DIR}/complexity-poster.webp`,
  },
  {
    id: "users",
    phrase: "designed for users",
    label: "Designing for users",
    description:
      "A hand with a quill detailing a wireframed interface, flowers at its margin.",
    src: `${FILM_DIR}/interface-detailing.mp4`,
    poster: `${FILM_DIR}/interface-detailing-poster.webp`,
  },
  {
    id: "design-systems",
    phrase: "design systems",
    label: "Design systems",
    description:
      "A specimen grid of botanical line art, its order dissolving into pixels.",
    src: `${FILM_DIR}/design-system.mp4`,
    poster: `${FILM_DIR}/design-system-poster.webp`,
  },
  {
    id: "figma-to-code",
    phrase: "Figma to code",
    label: "Figma to code",
    description:
      "A stone bridge over a stream, a line-art garden on one bank becoming a pixel-square garden on the other.",
    src: `${FILM_DIR}/design-to-code.mp4`,
    poster: `${FILM_DIR}/design-to-code-poster.webp`,
  },
  {
    id: "vibe-coder",
    phrase: "Code Tinkerer",
    label: "Code tinkering",
    description: "A glowing node-and-flower lattice dissolving into pixels.",
    src: `${FILM_DIR}/ai-v2.mp4`,
    poster: `${FILM_DIR}/ai-v2-poster.webp`,
  },
  {
    id: "stakeholders",
    phrase: "stakeholders",
    label: "Stakeholders",
    description:
      "A ring of portrait medallions tied together by ribbons, a hub-and-satellite network drawn as people.",
    src: `${FILM_DIR}/stakeholders.mp4`,
    poster: `${FILM_DIR}/stakeholders-poster.webp`,
  },
];

/* The idle still the live hero shows while no keyword is lit. Light graded, so
   unlike the films it needs no blend treatment. */
export const idleStill = `${FILM_DIR}/hompage-illustration.png`;
