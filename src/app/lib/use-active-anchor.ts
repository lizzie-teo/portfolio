"use client";

import { useEffect, useState } from "react";
import type { CaseChapter } from "../components/CaseStudyRail";

/**
 * Shared active-anchor detection for the case-study chapter navs.
 *
 * Returns the id of the last chapter or section anchor whose top has
 * crossed an upper-third reading line (innerHeight * 0.4) — the anchor
 * the reader is currently inside. Both CaseStudyRail and ChapterDock
 * derive their open chapter and current section from this single id, so
 * the two patterns always track the same position. Updates are batched
 * through requestAnimationFrame on scroll/resize; the loop is self-
 * terminating (one frame per burst) and cleans up on unmount.
 */
export function useActiveAnchor(chapters: CaseChapter[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = chapters.flatMap((chapter) => [
      chapter.id,
      ...(chapter.sections ?? []).map((section) => section.id),
    ]);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let next: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) {
          next = id;
        }
      }
      setActiveId(next);
    };
    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [chapters]);

  return activeId;
}
