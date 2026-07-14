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
  },
  {
    kind: "case-study",
    slug: "healthdirect-symptom-checker",
    title: "Healthdirect Symptom Checker",
    tagline:
      "Reframing a clinical path so people could complete it with confidence.",
    size: "standard",
    industry: "Healthcare",
    tags: ["Health", "Service design"],
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
    media: { cover: "ap-testing-portal" },
  },
  {
    kind: "case-study",
    slug: "macquarie-radar",
    title: "Macquarie Radar",
    tagline: "Helping advisors reach students who need support sooner.",
    size: "standard",
    industry: "Higher education",
    tags: ["Education", "Product design"],
    media: { cover: "macquarie-radar" },
  },
  // Substack writing slots into the same grid. Example:
  // {
  //   kind: "article",
  //   url: "https://yourname.substack.com/p/post-slug",
  //   title: "Article title",
  //   tagline: "One-line hook for the piece.",
  //   size: "standard",
  // },
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
