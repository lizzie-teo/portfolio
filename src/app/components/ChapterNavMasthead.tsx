"use client";

import Link from "next/link";
import { underlineSegment } from "./SiteHeader";

/**
 * Site-level return inside the case study's page-level navigation — one row,
 * shared by the ChapterDock slab and the ChapterMarker menu.
 *
 * The problem it solves: the masthead is static and scrolls away by design, so
 * deep inside a case study the only routes back to site level were the very top
 * of the page or the prev/next footer at the very bottom. The chapter nav is the
 * one piece of chrome that persists, so the return belongs there.
 *
 * The design problem is tiering: site navigation sitting inside page navigation
 * must not be scanned as a fourth chapter. Three things separate it, and none of
 * them is a coloured badge or a second card:
 *
 * 1. Structure — it is not in the chapter list. It sits above the `<nav>`, on
 *    the slab's frame rather than in its scrolling contents, exactly as the
 *    site's masthead sits above the page's contents.
 * 2. Indent — it hangs left of the chapter labels' text column, in the lane the
 *    pips occupy, so the offset alone reads as a level up. Two louder devices
 *    were tried and cut: a masthead-fragment type treatment (display face,
 *    uppercase, 0.2em tracking), which read as a foreign object in a panel of
 *    Geist list rows, and a leader rule running from the label to the panel
 *    edge, which read as a stray line rather than a typeset baseline once it
 *    was the only rule in the panel. The row sets in the list's own face, size
 *    and weight.
 * 3. Behaviour — chapter rows fill on hover like list items; this row draws its
 *    underline segment out of the leader (`underlineSegment`, imported from
 *    SiteHeader so it is literally the same device, reduced motion included).
 *    It hangs left of the chapter labels' text column, in the pip lane, so the
 *    indent alone reads as a level up.
 *
 * The label names the destination rather than the site: "Selected work", to
 * `/work` — the same destination the prev/next footer uses (`CaseStudyShell`),
 * and for the same reason. A reader who reaches for this row mid-read is leaving
 * to pick a different project, not to read the introduction; sending them to `/`
 * landed them above the home page's hero every time and made them scroll past it
 * to get to the grid. The footer already got this right, but the footer is only
 * reachable by finishing the article, and this row is the one that persists.
 *
 * It was `/#work` until the work got a page of its own. The anchor was always
 * the workaround — it landed the reader partway down the home page, and once
 * that page became the fourteen-viewport garden flight it landed them partway
 * down THAT, with the whole walk sitting above them. `/work` is the thing the
 * anchor was standing in for.
 *
 * A real `next/link` because this leaves the page (the
 * chapter anchors do not). Contrast: full-strength `text-leaf-foreground`,
 * never a dimmed tint — small text carries the 7:1 bar (style rules §4), so the
 * tier is expressed by typography, not by fading the ink.
 */
export function ChapterNavMasthead({ className }: { className?: string }) {
  return (
    <Link
      href="/#work"
      // min-h-11 (44px) so the row is a touch target in the mobile menu.
      className={`group flex min-h-11 items-center rounded-lg px-3 text-leaf-foreground outline-none focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf ${className ?? ""}`}
    >
      {/* leading-none, unlike the wrapping chapter rows: the drawn underline
          hangs off the bottom of this line box (see SiteHeader), and a taller
          box would drop the rule into a floating gap. `whitespace-nowrap` keeps
          "Selected work" on one line so the rule stays put. */}
      <span className="relative block whitespace-nowrap text-sm font-medium leading-none">
        Selected work
        {/* Drawn from the start of the word, as the masthead's own nav links
            are — the label is the whole target now, so there is nothing for a
            right-origin draw to travel toward. */}
        <span aria-hidden className={`${underlineSegment} origin-left`} />
      </span>
    </Link>
  );
}
