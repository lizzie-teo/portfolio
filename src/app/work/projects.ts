import type { Metadata } from "next";

export type WorkSize = "standard" | "large" | "tall" | "wide";

type WorkEntryBase = {
  title: string;
  tagline: string;
  size: WorkSize;
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
    size: "large",
  },
  {
    kind: "case-study",
    slug: "healthdirect-symptom-checker",
    title: "Healthdirect Symptom Checker",
    tagline:
      "Reframing a clinical path so people could complete it with confidence.",
    size: "tall",
  },
  {
    kind: "case-study",
    slug: "ap-testing-portal",
    title: "AP+ Testing Portal",
    tagline: "Making certification workflows and delivery status easier to read.",
    size: "wide",
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
