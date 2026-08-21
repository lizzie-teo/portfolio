"use client";

import { useMemo } from "react";
import { useActiveSection } from "./use-active-section";
import type { CaseChapter } from "../components/CaseStudyRail";

/**
 * Shared active-anchor detection for the case-study chapter navs.
 *
 * Flattens a chapter list into the ids it anchors — each chapter and, under it,
 * each sub-section — and hands them to `useActiveSection`, which owns the
 * reading-line logic. Both CaseStudyRail and ChapterDock derive their open
 * chapter and current section from this single id, so the two patterns always
 * track the same position, and they now share that logic with the site masthead
 * rather than running a second copy of it.
 */
export function useActiveAnchor(chapters: CaseChapter[]): string | null {
  const ids = useMemo(
    () =>
      chapters.flatMap((chapter) => [
        chapter.id,
        ...(chapter.sections ?? []).map((section) => section.id),
      ]),
    [chapters],
  );
  return useActiveSection(ids);
}
