import type { Metadata } from "next";

export type WorkSize = "standard" | "large" | "tall" | "wide";

/** Photographic/illustrated still shown inside the home card's media frame. */
export type WorkImageMedia = {
  /** Thumbnail image, cropped with object-cover to the card's aspect. */
  image: { src: string; alt: string };
  /** Brand mark layered over the image; intrinsic SVG dimensions. */
  logo?: { src: string; width: number; height: number };
};

/** Ids of bespoke animated covers registered in `components/ProjectCover.tsx`. */
export type WorkCoverId = "symptom-checker" | "ap-testing-portal" | "macquarie-radar";

/** A composed, animated scene instead of a still image. */
export type WorkCoverMedia = {
  cover: WorkCoverId;
};

/** Artwork shown inside the home card's media frame. */
export type WorkMedia = WorkImageMedia | WorkCoverMedia;

type WorkEntryBase = {
  title: string;
  tagline: string;
  size: WorkSize;
  /** The sector the project served, shown as the single chip on the home
      card. Distinct from `tags`, which mix industry and discipline. */
  industry?: string;
  /** Short category tags (industry + discipline) used elsewhere. */
  tags?: string[];
  /**
   * What Lizzie did on this project, in three or four words — the fact a
   * recruiter scans for first and the one the grid did not carry. The tagline
   * says what the PROJECT was; this says what the CONTRIBUTION was, and the two
   * are not interchangeable. Keep it a title or a scope, not a sentence: "Senior
   * Product Designer", "End to end UX". It must fit one line on a card at 286px.
   *
   * CURRENTLY RENDERED NOWHERE. It was added for LoFiProjectCard's foot block
   * and taken back off: three of the four entries below say "End to end UX", so
   * the row restated one phrase on most of the grid, and a fact that does not
   * vary between cards cannot help a reader tell them apart. Case-study pages
   * state role in their own meta blocks, where the claim can be qualified.
   *
   * Kept because the values are sourced rather than guessed and the provenance
   * comments below are worth more than the field costs. Delete the field and its
   * four values together if nothing takes it up.
   */
  role?: string;
  /**
   * When the work shipped, as a year or a span ("2023", "2022 to 2023").
   * Recency is a first-pass filter for recruiters and it existed nowhere in the
   * repo before this. Kept as a string rather than a number because a span is a
   * legitimate answer and formatting it is not the card's job.
   */
  year?: string;
  /**
   * The one result this project is remembered by — the second beat of the lo-fi
   * card, under the title.
   *
   * THREE RULES, because a card is the easiest place on a portfolio to
   * accidentally over-claim:
   *
   *   1. It must be an OUTCOME, not problem framing and not a target. "67% of
   *      applications are incomplete" describes the world before the work;
   *      "targeting 78%" describes an ambition. Neither belongs here.
   *   2. It must be something LIZZIE'S WORK CAUSED. A cited research finding
   *      that supports a design pattern is evidence for a decision, not a
   *      result of the project.
   *   3. It must match what the case study itself claims. The card is the
   *      headline of the outcome chapter, never a separate marketing line —
   *      Healthdirect's figures below are the same ones OutcomeScorecard.tsx
   *      renders, and every other value here is sourced from that project's
   *      published write-up rather than written for the card.
   *
   * `value` is the mark: short enough to hold one line as display type on a
   * 286px card. `label` is the supporting line that says what the number is of,
   * since a bare "30%" means nothing. Omitted cleanly when a project has no
   * honest result yet — a card with no outcome simply doesn't show the beat.
   */
  outcome?: { value: string; label: string };
  media?: WorkMedia;
};

/** A project with its own case-study page under /work/<slug>. */
export type CaseStudyEntry = WorkEntryBase & {
  kind: "case-study";
  slug: string;
};

/** Writing hosted elsewhere (e.g. Substack); the card links out. */
export type ArticleEntry = WorkEntryBase & {
  kind: "article";
  url: string;
  /**
   * The piece's own deck — its Substack subtitle, verbatim.
   *
   * This is what an article card DEVELOPS INTO on hover, in the slot a case
   * study gives to its client's logo, and the substitution is the point. A case
   * study withholds its colour because the colour belongs to a client, and the
   * payoff is finding out who trusted her. An article has no client and nothing
   * to withhold, so the payoff is the piece telling you what it argues. Reveal
   * the mark for work done for someone; reveal the words for work that is hers.
   *
   * Required rather than optional: an article card with no deck would dissolve
   * on hover into blank paper, which is the bug this field exists to prevent.
   */
  deck: string;
  /**
   * The publication the piece lives on, shown at the foot. Named rather than
   * assumed, because "this leaves the site" is a fact a reader deserves before
   * clicking, not after.
   */
  publication: string;
  /**
   * What the piece is about. DELIBERATELY NOT `industry`, which an earlier pass
   * reused here and should not have: industry means the sector a client
   * operated in, and writing has no client. Left merged, the gallery's industry
   * filter would have offered "Healthcare" and "Leadership" in one list as if
   * they were the same kind of category, which is how a filter starts lying
   * about what it filters. Kept as a separate field so the two taxonomies stay
   * separate — the gallery filters work by industry and writing by kind.
   */
  topic: string;
};

export type WorkEntry = CaseStudyEntry | ArticleEntry;

export const workEntries: WorkEntry[] = [
  {
    kind: "case-study",
    slug: "funding-finder",
    title: "Funding Finder",
    tagline: "Designing trust into a faster private-lending application.",
    size: "standard",
    industry: "Financial services",
    tags: ["Fintech", "Product design"],
    /* Condensed from the published write-up's role block, which opens
       "End-to-end UX design from discovery through delivery". */
    role: "End to end UX",
    /* TODO(lizzie): year unknown. The write-up records a three-month duration
       but never says which year, so the spec bar omits the row. */
    /* The lone delivery outcome in the set, and deliberately so: this project
       published no measured result, but "Shipped in three months. On time and
       under budget" is a true, caused outcome and a fact hiring managers weigh.
       Reaching for one of the write-up's other figures would mean quoting the
       problem back as a result — 67% incomplete submissions and 3 to 6 week
       decisions describe what the work was up against, not what it achieved. */
    outcome: { value: "3 months", label: "Discovery to launch, on budget" },
  },
  {
    kind: "case-study",
    slug: "healthdirect-symptom-checker",
    title: "Healthdirect Symptom Checker",
    tagline:
      "Reframing a clinical path so people could complete it with confidence.",
    size: "tall",
    industry: "Healthcare",
    tags: ["Health", "Service design"],
    /* Taken from this case study's own "My role" meta block, whose first line
       is "Sole designer on the redesign, alongside a product manager, clinical
       leads, and Infermedica's engine team". Not invented here — shortened to
       fit one line on a card. Was "End to end UX", which said less: sole
       designer is the stronger and more specific claim, and it is the one the
       page now makes. */
    role: "Sole designer",
    /* TODO(lizzie): year unknown. Nothing in the repo records when this shipped;
       the spec bar omits the row cleanly until it is filled in. */
    /* Lifted straight from this case study's own OutcomeScorecard — same figure,
       same framing — so the card is the headline of the outcome chapter rather
       than a second claim that could drift from it. Completion beats the other
       two published figures here: 2M checks a year is the service's scale, and
       2× the nurse helpline is its standing, but 49% to 84% is the change the
       design caused, which is the fact a hiring manager is reading for. */
    outcome: { value: "84%", label: "Completion, up from 49%" },
    media: { cover: "symptom-checker" },
  },
  {
    kind: "case-study",
    slug: "ap-testing-portal",
    title: "AP+ Testing Portal",
    tagline: "Making certification workflows and delivery status easier to read.",
    size: "standard",
    industry: "Payments",
    tags: ["Payments", "Platform UX"],
    /* Condensed from the published write-up's role block, which opens
       "End-to-end UX design from rapid discovery through delivery". */
    role: "End to end UX",
    /* TODO(lizzie): year unknown — the write-up records none. */
    /* The range is kept rather than rounded to its top. "20–30% reduction in
       manual effort for internal testers" is what the write-up claims, and a
       card that said "30%" would be quoting the best case as the result. The
       write-up's other figure, "targeting 78%+" task completion, is an ambition
       and is not an outcome. */
    outcome: { value: "20–30%", label: "Less manual effort for testers" },
    media: { cover: "ap-testing-portal" },
  },
  {
    kind: "case-study",
    slug: "macquarie-radar",
    title: "Macquarie Radar",
    /* TODO(lizzie): this tagline does not match the published project. The
       write-up at lizzieteo.com/radar describes Radar as a research reporting
       tool — ERA data preparation and submission, for research and faculty
       teams — not a student-support view for advisors. The student framing
       appears to have been invented alongside the scaffold copy in this
       project's page.tsx, and it feeds the home card, the page title, and the
       meta description. Left in place rather than rewritten from a scraped
       page, but it should be replaced before this ships. */
    tagline: "Helping advisors reach students who need support sooner.",
    size: "standard",
    industry: "Higher education",
    tags: ["Education", "Product design"],
    /* Verbatim from this case study's own meta block. */
    role: "Senior Product Designer",
    /* TODO(lizzie): year unknown. */
    /* From the published write-up: "30% reduction in time spent on ERA data
       preparation and submission". Chosen over its companion figure — "20%
       improvement in strategic research investment decision-making accuracy" —
       because a time saving is concrete and self-explanatory on a card, while
       "decision-making accuracy" needs a paragraph to mean anything.

       NOTE(lizzie): this figure is about ERA research reporting, which is not
       what the tagline above or the scaffold copy in this project's page.tsx
       describes. See the TODO on the tagline. */
    outcome: { value: "30%", label: "Less time preparing ERA submissions" },
    media: { cover: "macquarie-radar" },
  },
  /* WRITING. Three of the twelve pieces on the Substack, chosen for range rather
     than recency: the craft of getting design into production, the practice of
     testing with AI, and leading without the authority to mandate anything.
     Titles, decks, and dates are verbatim from the posts.

     They sit AFTER the case studies rather than interleaved, and that ordering
     is the whole hierarchy argument: work leads, writing follows. A recruiter
     reading top to bottom meets four projects before the first essay, and the
     grid never asks a blog post to compete with Healthdirect for the same
     glance. If writing ever needs its own band with its own heading, this order
     is what makes that a lift rather than a rewrite. */
  {
    kind: "article",
    url: "https://lizzieteo.substack.com/p/figma-to-code-best-practices",
    title: "Figma to Code: Best Practices",
    tagline:
      "Structuring design files so the handoff to production stops losing information.",
    deck: "How to structure design files, align teams, and coach AI to generate production-ready code",
    publication: "Substack",
    size: "standard",
    topic: "Design engineering",
    year: "October 2025",
  },
  {
    kind: "article",
    url: "https://lizzieteo.substack.com/p/how-a-ux-qa-custom-agent-changed",
    title: "How a UX QA Custom Agent Changed the Way I Test",
    tagline: "What building a testing agent taught me about where judgement still sits.",
    deck: "What I learned about multimodal AI, attention, and judgement",
    publication: "Substack",
    size: "standard",
    topic: "AI and testing",
    year: "January 2026",
  },
  {
    kind: "article",
    url: "https://lizzieteo.substack.com/p/leadership-without-authority-learning",
    title: "Leadership Without Authority",
    tagline: "Moving a team toward new tools when you cannot mandate anything.",
    /* The post's full title runs "Leadership Without Authority - On AI Adoption
       and Helping Others". The trailing half is dropped from the card because
       the deck below already says the same thing better, and because the card's
       title slot is display type where a compound subtitle wraps to four lines
       and stops reading as a name. The link goes to the real post either way. */
    deck: "On learning, leading without authority, and knowing when to let go",
    publication: "Substack",
    size: "standard",
    topic: "Leadership",
    year: "November 2025",
  },
];

export function workEntryHref(entry: WorkEntry): string {
  return entry.kind === "case-study" ? `/work/${entry.slug}` : entry.url;
}

const caseStudies = workEntries.filter(
  (entry): entry is CaseStudyEntry => entry.kind === "case-study"
);

export function getCaseStudy(slug: string): CaseStudyEntry | undefined {
  return caseStudies.find((entry) => entry.slug === slug);
}

export function getCaseStudyNeighbors(slug: string): {
  previous?: CaseStudyEntry;
  next?: CaseStudyEntry;
} {
  const index = caseStudies.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return {};
  }
  return {
    previous: caseStudies[index - 1],
    next: caseStudies[index + 1],
  };
}

export function caseStudyMetadata(slug: string): Metadata {
  const entry = getCaseStudy(slug);
  if (!entry) {
    return {};
  }
  return {
    title: `${entry.title} | Lizzie Teo`,
    description: entry.tagline,
  };
}
