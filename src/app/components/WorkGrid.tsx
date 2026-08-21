"use client";

/*
 * THE PROJECT GRID — the shelf of disks, on its own.
 *
 * Extracted from WorkGallery so the two surfaces that show projects can differ
 * in everything except the grid itself. `/work` is the filtered index and wraps
 * this in a filter rail; the home page's `#work` band shows the same shelf with
 * no rail at all, because a filter inside one band of a page whose masthead is
 * already a contents line is one navigation too many.
 *
 * THAT LAST CLAIM WENT STALE AND IS NOW TRUE AGAIN. The home band grew a rail
 * for a stretch (HomeWorkBand recorded the overruling); it has been taken back
 * off, because a control that narrows six projects to two is a decision placed
 * in front of the content, and the sector line on every card already prints the
 * industry passively. `/work` keeps its rail — it is the filtered index, and
 * filtering is the whole job there.
 */

import {
  ComingSoonWindow,
  DesktopProjectCard,
} from "./DesktopProjectCard";
import { ComingSoonFloppy, FloppyProjectCard } from "./FloppyProjectCard";
import { workGridColumns, type WorkGridThreeFrom } from "./gridColumns";
import {
  workEntryHref,
  type CaseStudyEntry,
  type WorkEntry,
} from "../work/projects";

/**
 * WHICH SHELF THIS GRID IS SHOWING.
 *
 * A variant rather than a swap, because the two surfaces using this component
 * are not interchangeable right now. The home band has been moved to the
 * desktop windows on their ruled sheet; `/work` still runs the floppy shelf,
 * and its filter rail, its column maths and its own ground were all tuned
 * against those disks.
 *
 * THIS IS A SPLIT THIS FILE OTHERWISE ARGUES AGAINST, and it should not
 * outlive the decision: the note below says two surfaces showing the same shelf
 * differently read as two different grids, and that is as true of the card as
 * it is of the column count. Point `/work` at `"desktop"` too once the home
 * band settles, and delete the prop.
 */
export type WorkGridCard = "floppy" | "desktop";

export function WorkGrid({
  entries,
  showPlaceholder = false,
  card = "floppy",
  threeFrom = "xl",
}: {
  /**
   * WORK ENTRIES, NOT JUST CASE STUDIES, because the desktop card draws both.
   * The floppy shelf can only show a project — a disk has a client, a sector
   * and a cover, and an essay has none of those — so the floppy branch below
   * filters articles out rather than pretending. The desktop window has no such
   * problem: an article is a window whose kind mark reads "Writing", whose
   * sector line names its topic, and whose title bar floods charcoal because
   * there is no client colour to reveal. That was true from the day the card
   * was built; nothing here had to change for writing except the door.
   */
  entries: WorkEntry[];
  /** The "another project is coming" disk. Work views only — never beside a
   *  feature, where it would undercut the one thing the view exists to show. */
  showPlaceholder?: boolean;
  /** Which card treatment to draw. See `WorkGridCard`. */
  card?: WorkGridCard;
  /** Which breakpoint brings the third column in. See `gridColumns.ts`.
   *  Defaults to the railed shelf, so `/work` needs no opinion. */
  threeFrom?: WorkGridThreeFrom;
}) {
  if (!entries.length && !showPlaceholder) {
    return null;
  }

  return (
    /* SIX AT THREE ACROSS IS TWO COMPLETE ROWS, which is the shape this grid is
       growing into — the registry holds four projects today. Where the third
       column arrives is `threeFrom`; the reasoning for both values, and for the
       ceiling of three, is on `workGridColumns`.

       THE NARROWEST CARD THIS PRODUCES IS NOT THE PHONE. Three across on the
       railed shelf at exactly 1280 lands near 251px, against 288px at a 320px
       viewport and 280px at 640. The disk label's type clamps are sized against
       that card, not against a breakpoint — see TYPE in FloppyProjectCard. */
    <div className={workGridColumns[threeFrom]}>
      {card === "desktop"
        ? entries.map((entry, index) => (
            <DesktopProjectCard
              entry={entry}
              index={index}
              key={workEntryHref(entry)}
            />
          ))
        : entries
            .filter((e): e is CaseStudyEntry => e.kind === "case-study")
            .map((entry, index) => (
              <FloppyProjectCard
                entry={entry}
                index={index}
                key={workEntryHref(entry)}
              />
            ))}
      {showPlaceholder ? (
        card === "desktop" ? (
          <ComingSoonWindow index={entries.length} />
        ) : (
          <ComingSoonFloppy index={entries.length} />
        )
      ) : null}
    </div>
  );
}
