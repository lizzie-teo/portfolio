"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the last element in `ids` whose top has crossed the reading
 * line — an upper-third datum at 40% of the window — which is the section the
 * reader is currently inside.
 *
 * This is the one implementation of "where am I on this page". The case-study
 * navs reach it through `useActiveAnchor` (which flattens chapters and their
 * sub-sections into ids first) and the site masthead calls it directly with the
 * home page's four band ids. Keeping one copy matters because the two would
 * otherwise disagree by a few pixels on a case study, where both are on screen.
 *
 * MISSING IDS ARE SKIPPED RATHER THAN TREATED AS ABSENT POSITIONS. The masthead
 * ships the same four ids on every route, and on a case study none of them
 * exist; the loop simply finds nothing and no label lights up, which is the
 * correct answer there.
 *
 * THE LAST SECTION GETS A FLOOR. A final band shorter than 40% of the window
 * can never cross the reading line, so it would stay unhighlighted no matter how
 * far the reader scrolled. Once the document is scrolled to its end the last
 * present id wins outright.
 *
 * Updates are batched through requestAnimationFrame on scroll/resize; the loop
 * is self-terminating (one frame per burst) and cleans up on unmount.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  // Joined so the effect keys off the ids' VALUES: every caller builds this
  // array inline, so a reference dep would re-subscribe on every render.
  const key = ids.join("|");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const list = key ? key.split("|") : [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let crossed: string | null = null;
      let lastPresent: string | null = null;
      for (const id of list) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }
        lastPresent = id;
        if (element.getBoundingClientRect().top <= line) {
          crossed = id;
        }
      }
      // 2px of slack: sub-pixel zoom and mobile URL-bar resizing mean the exact
      // equality is never reliably hit.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      setActiveId(atEnd && lastPresent ? lastPresent : crossed);
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
  }, [key]);

  return activeId;
}
