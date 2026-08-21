/*
 * THE HOME WORK BAND — one unfiltered shelf of projects on the ruled sheet.
 *
 * ── THE RAIL CAME OFF, AND THIS IS THE SECOND REVERSAL ───────────────────
 * `WorkGrid` used to state that the home band deliberately had NO rail: "a
 * filter inside one band of a page whose masthead is already a contents line is
 * one navigation too many." That was overruled by the owner and a `FilterRail`
 * ran here — All plus one tile per industry, in a 13–15rem column at `lg+`.
 *
 * It is off again, and the argument that took it off is not the old one. It is
 * arithmetic: four projects today and six planned, and a control that narrows
 * six items to two is a decision placed IN FRONT of the content rather than a
 * way through it. Filters start paying for their column somewhere north of a
 * dozen items. Nothing is lost from the page, because the signal the rail sold
 * — which sectors this work covers — is already printed on every card's sector
 * line, passively, where the eye picks it up without being asked a question
 * first.
 *
 * Both reversals are recorded rather than deleted so the next person to want a
 * rail here can see it has been tried, and on what grounds it went.
 *
 * ── WHAT WENT WITH IT ────────────────────────────────────────────────────
 * The two-column wrapper, the `filter` state, the `AnimatePresence` swap and
 * the `aria-live` count are all gone. The live region existed to announce a
 * result count after a control changed it; with no control, there is nothing to
 * announce, and an empty polite region is noise for a screen reader rather than
 * courtesy. This file is a server component again as a result.
 *
 * The "another project is on its way" window is gone too. It obeyed the
 * gallery's rule — only ever shown under "All" — but in a set read as one shelf
 * of six it takes a whole slot of a 3×2 rectangle to promise something that
 * does not exist yet. `WorkGrid` still draws it for `/work`.
 *
 * ── ONE KIND, AND IT IS WORK ─────────────────────────────────────────────
 * The band showed BOTH kinds for a stretch: `DesktopProjectCard` draws an
 * article correctly — kind mark "Writing", the topic on the sector line, a
 * charcoal title-bar flood because there is no client colour to reveal — so
 * writing sat in this grid as windows beside the projects. It has its own band
 * of the same windows now, under its own `h2`, directly below this one
 * (page.tsx). This band answers exactly one question: which projects.
 *
 * ── THE HEADING IS NOT HERE ──────────────────────────────────────────────
 * The band's `h2` is page.tsx's, so it stands on the same left axis as
 * "Explorations" and "Substack" below it and the three read as one set.
 */

import { workEntries } from "../work/projects";
import { WorkGrid } from "./WorkGrid";

export function HomeWorkBand() {
  const shown = workEntries.filter((entry) => entry.kind === "case-study");

  /* THE SHEET IS NOT DRAWN HERE. `GraphDesk` fills its positioned ancestor, and
     this component renders inside the band's max-width measure — so painting it
     from here would centre an 1800px rectangle of ruled paper on a wider screen
     and leave the section's own edges unruled. It belongs on the `<section>`,
     which is the element that actually spans the page, and page.tsx puts it
     there. */
  /* `threeFrom="lg"`: no rail on this surface, so the third column arrives a
     breakpoint sooner than on `/work` — six projects would otherwise sit in
     three rows at `lg`. See `workGridColumns`. The two bands below this one
     pass the same value, because three shelves of the same windows on one page
     at different column counts would read as three different grids. */
  return <WorkGrid card="desktop" entries={shown} threeFrom="lg" />;
}
