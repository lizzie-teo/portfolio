"use client";

/*
 * WRITING INDEX — the essays, as a contents page rather than a wall of cards.
 *
 * WHY THIS IS NOT A CARD GRID. Writing was briefly given the same 5:7 portrait
 * tile the case studies use, and the shape was wrong in a way that showed
 * immediately: a portrait tile is a POSTER, sized to hold an image and a name,
 * and an essay has neither. What arrived was a mostly empty rectangle with a
 * small title floating in the middle of it, padded out to a shape it had no
 * content for.
 *
 * An essay is a text object, so its index is a list: date, title, deck, one rule
 * between each. That form carries strictly more information per row than the
 * tile did — the tile could not fit the deck at all, and the deck is the line
 * that tells you whether you want to read the piece.
 *
 * IT ALSO HAS TO SCALE, which the tile could not. There are twelve posts on the
 * Substack and three are shown here. Twelve portrait tiles would swamp four case
 * studies and turn a design portfolio into a blog; twelve index rows read as a
 * healthy body of writing and take a fraction of the height. The row is the form
 * that survives the site being successful.
 *
 * THE ROW IS THE LINK, not a title inside a row that is also a link. One target,
 * one focus stop, the whole width live — which matters most on touch, where the
 * title alone would be a 44px-tall sliver of an 88px row.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PLATE, added after the fact, and why it does not contradict any of the
 * above.
 *
 * Each row now carries a developing plate: at rest a latent greyscale image under
 * a halftone screen, and on hover, focus, or scroll-into-centre it develops and
 * performs that article's own argument. The three pieces here have bespoke SVG
 * scenes; anything else falls back to a shared default (see `articleScenes`).
 *
 * A LANDSCAPE PLATE IN A ROW IS NOT THE PORTRAIT TILE THIS FILE ARGUED AGAINST.
 * The tile failed because it was a POSTER SHAPE with nothing to put in it — a
 * name floating in an empty rectangle. The plate is 3:2, sits beside the text
 * rather than instead of it, and has something specific to say about each piece.
 * Every reason the row won is intact: the deck still shows, the date rail still
 * aligns, the row is still one link, and a 3:2 plate costs a fraction of the
 * height a 5:7 tile did — twelve of these still read as an index.
 *
 * IT STACKS ON MOBILE AND SITS RIGHT ON DESKTOP, and the DOM order is the mobile
 * order (plate first) with `md:flex-row-reverse` moving it right on wide screens.
 * That costs nothing in reading order because the plate is decorative and
 * `aria-hidden` — the row's accessible name already carries the piece.
 *
 * THE PLATE IS DELIBERATELY LARGE ON DESKTOP (`md:w-64 lg:w-72`) rather than a
 * small thumbnail. The Figma-to-Code scene turns on reading a 26-character
 * monospace token name, and below roughly 240px that label stops being type and
 * becomes texture. A scene that cannot be read is decoration, which is the exact
 * failure the bespoke scenes were built to fix, so the plate is sized to the
 * scene rather than the scene shrunk to a thumbnail.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ROW'S INK IS SEMANTIC, NOT SCENE. It ran on `loFiInk`'s dark constants
 * while the work band was --grout; the band is light now, so the title takes
 * --foreground (10.39:1 on --secondary), the date and deck take
 * --secondary-foreground (7.00:1 — NOT --muted-foreground, which measures
 * 5.13:1 on this band and would sit under the 7:1 bar small text is held to),
 * and the row separator takes --rule, which is the site's
 * own divider rather than a second grey invented here. Only the DevelopPlate
 * stays artwork: it carries its own ground.
 *
 * IT IS A `ul`, NOT A `dl`, AND THAT IS A BUG FIX. This was a description list
 * with `<dd>` nested INSIDE `<dt>` and an `<a>` sitting between `<dl>` and its
 * terms — none of which is valid, and it was throwing a hydration mismatch on the
 * home page every load. The semantics could not be rescued in place either: a
 * description list cannot have each term-plus-description wrapped in one link,
 * and one link per row is the rule this component is built on. A list of links is
 * what this actually is, so it is now a list of links.
 */

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { articleMedia } from "./develop/articleScenes";
import { DevelopPlate } from "./develop/DevelopPlate";
import { useDevelopActivation } from "./develop/useDevelopActivation";
import { indexItemHeading } from "./typography";
import type { ArticleEntry } from "../work/projects";

export function WritingIndex({ entries }: { entries: ArticleEntry[] }) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry, index) => (
        <WritingRow key={entry.url} entry={entry} index={index} />
      ))}
    </ul>
  );
}

function WritingRow({ entry, index }: { entry: ArticleEntry; index: number }) {
  const shouldReduce = useReducedMotion();
  /* The ref goes on the ANCHOR, which is what lets the plate develop on keyboard
     focus as well as hover — see `useDevelopActivation`. Held in state rather
     than a ref object so the hook re-runs once the node has actually attached. */
  const [node, setNode] = useState<HTMLElement | null>(null);
  const active = useDevelopActivation(node);

  return (
    <li>
      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.out,
          /* The grid's own stagger recipe: 0.05s interval, capped so a long
             index never turns into a slow cascade (style-rules stagger
             budget — total under 500ms). */
          delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
        }}
      >
        <a
          ref={setNode}
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          data-explore-card
          data-cursor-label="Read"
          aria-label={`Read "${entry.title}" on ${entry.publication}, published ${entry.year} (opens in a new tab)`}
          /* `group` drives the hover on the arrow and the title without any of
             them being interactive themselves — nested interactive elements
             inside a card link are banned (style-rules §8), and this is how the
             row gets rich hover while staying exactly one target.
             The top hairline on every row plus one on the last gives the set a
             closing rule without a wrapper border that would double up against
             whatever follows. */
          className="group block border-t border-rule py-5 outline-none transition-colors duration-100 last:border-b focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary md:py-6"
        >
          <div className="flex flex-col gap-5 md:flex-row-reverse md:items-start md:gap-8">
            {/* THE PLATE. First in the DOM so it stacks on top on mobile;
                `flex-row-reverse` puts it on the right from md up. Decorative
                throughout — the row's accessible name carries the piece. */}
            <div className="w-full shrink-0 md:w-64 lg:w-72">
              <DevelopPlate media={articleMedia(entry)} active={active} />
            </div>

            <div className="flex min-w-0 grow items-start gap-4">
              <div className="min-w-0 grow">
                {/* The date, held in its own column from md up so a run of rows
                    aligns into a readable date rail. Below md it stacks above the
                    title instead, because a fixed date column on a 320px screen
                    leaves the title about 180px and starts breaking words. */}
                <span className="block font-mono text-xs font-medium uppercase tracking-[0.16em] text-secondary-foreground md:hidden">
                  {entry.year}
                </span>
                <span className="mt-2 flex items-baseline gap-8 md:mt-0">
                  <span className="hidden w-28 shrink-0 font-mono text-xs font-medium uppercase tracking-[0.16em] text-secondary-foreground md:block">
                    {entry.year}
                  </span>
                  <h4 className={`${indexItemHeading} text-foreground`}>
                    {entry.title}
                  </h4>
                </span>
                {/* The deck, indented to the title's own left edge from md up so
                    it reads as belonging to the title rather than to the date. */}
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-secondary-foreground md:ml-36">
                  {entry.deck}
                </p>
              </div>

              {/* The outbound mark. Decorative: the link's accessible name
                  already says it opens in a new tab, so a second announcement
                  here would be noise. It travels a few pixels on hover — the one
                  moving part in the row that is not the plate, and the cheapest
                  way to say "this goes somewhere". */}
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="mt-1 size-5 shrink-0 text-secondary-foreground transition-transform duration-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </div>
          </div>
        </a>
      </motion.div>
    </li>
  );
}
