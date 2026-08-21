/*
 * THE SITE NAV, AS A TABLE OF CONTENTS — AND EVERY LABEL IS A PLACE AGAIN.
 *
 * All four labels name a band of the home page, which is what lets the masthead
 * highlight where the reader is as they scroll (see `useActiveSection` and
 * SiteHeader). The rule this file has always carried is back in force with no
 * exception in it: a label that can never light up reads as broken rather than
 * as restraint, so every label points at somewhere on `/`.
 *
 * WHAT MOVED, IN ORDER, BECAUSE THE FIRST ITEM HAS BEEN THREE THINGS.
 *
 *   "Intro" — the garden flight WAS the top of the home page, fourteen
 *   viewports of scrubbed cinematic with the work grid underneath it, and the
 *   label named that stretch of the document. It described a position rather
 *   than a subject.
 *
 *   "What I do" — the walk moved to its own route (`/world`) and the home page
 *   opened on a static hero instead, so the walk became a thing a reader chose
 *   rather than a wall they scrolled past. The label named the thing itself,
 *   and this file gained the mixture of a route item among three section items
 *   plus the argument for why that was allowed.
 *
 *   "My skills" — the owner's 20 Aug restructure, first as a rename of the
 *   route item, now as the name of the walk's place at the top of `/`. THE WALK
 *   IS THE FRONT DOOR AGAIN: `/` opens on the floppy over the garden gate, the
 *   nine legs run, and the Work, Explorations and Writing bands follow in
 *   ordinary flow. `/world` is a redirect to `/` (next.config.ts) so old links
 *   survive; there is no route left for a route item to point at, and the
 *   mixture argument this file used to carry is deleted rather than parked,
 *   because nothing needs it.
 *
 * THE LABEL IS STILL AN OPEN QUESTION FOR THE OWNER. Their FigJam board sketched
 * "My capabilities"; the board's labels are shorthand (it also says "Substack",
 * which the site renamed to "Writing" long ago), so the shipped label is kept
 * until they say otherwise.
 *
 * ORDER IS THE HIERARCHY, and it now agrees with the reading order of the
 * document as well: the walk, then the case studies, then the working notes,
 * then the writing. It was a ranking of what she wants looked at first and it
 * happens to be the page's own sequence again.
 *
 * `skills` IS THE FLIGHT'S OWN CONTAINER, not a wrapper around it — ScrollWorld
 * puts the id on the engine root, which starts at scroll 0 and is exactly as
 * tall as the scrub track. So the item is lit for the whole walk and hands over
 * to Work at the first band, and clicking it lands the reader back on the
 * floppy at scroll 0. That jump crosses the film, so it is instant rather than
 * eased — see `useAnchorScroll`, THE FILM IS NOT SCRUBBED BY A NAVIGATION.
 *
 * THE STANDALONE INDEXES DID NOT GO AWAY. `/work` and `/explorations` are still
 * the addresses to paste into a job application, and each home band's heading
 * links through to its index. They are simply not what the masthead points at.
 *
 * `href` is the cross-page form. On `/` the header intercepts the click and runs
 * the site's own anchor scroll instead (useAnchorScroll); from any other route
 * the browser follows `/#section` home and lands on the band.
 */

export type SiteNavItem = {
  /**
   * The id of the home-page band this item names. Every item has one now; the
   * field decides whether the spy tracks it and whether its click is
   * intercepted, and it is no longer optional because there is no route item
   * left in the set.
   */
  section: string;
  label: string;
  /** Where the link goes. */
  href: string;
};

export const siteNav: readonly SiteNavItem[] = [
  { label: "My skills", section: "skills", href: "/#skills" },
  { label: "Work", section: "work", href: "/#work" },
  { label: "Explorations", section: "explorations", href: "/#explorations" },
  { label: "Writing", section: "writing", href: "/#writing" },
] as const;

/**
 * The ids the masthead's scroll-spy tracks, in document order. All four are
 * real elements on `/` — the first is the flight's own container, the other
 * three are the bands under it.
 */
export const siteNavSections: readonly string[] = siteNav.map(
  (item) => item.section,
);
