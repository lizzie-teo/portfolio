"use client";

/*
 * FEATURE ITEM — what a single result becomes.
 *
 * THE PROBLEM IT SOLVES. The gallery filters by industry, and with four case
 * studies across four sectors every industry filter returns exactly one entry.
 * Rendered into the normal four-column grid that is one portrait tile stranded
 * in a row of empty space: a control that looks like a feature and behaves like
 * a dead end, and the strongest argument against having the filter at all.
 *
 * Promoting the lone result to a feature turns that weakness into the point. A
 * filter that narrows to one thing SHOULD arrive somewhere — the reward for
 * choosing "Healthcare" is not a smaller grid, it is the Healthcare project
 * shown properly. So the tile goes landscape, takes the full content width, and
 * spends the room it gains on the facts the 5:7 card had to leave out: the
 * tagline, the outcome in full, and the client's own colour.
 *
 * THE PANEL IS SHOWN AT REST HERE, which is the one place this treatment departs
 * from the card's central idea. On the grid, colour is withheld and hover is what
 * pays it off, and that only works because there are seven other cards to point
 * at. A feature is the end of a journey rather than an invitation into one —
 * there is nothing left to explore toward — and a landscape slab of dark plate
 * withholding its colour would just read as an unfinished banner. So the feature
 * states the brand instead of teasing it, and the panel doubles as the thing that
 * makes a one-result view feel like an arrival.
 *
 * THE PANEL WENT DARK WITH THE CARD'S, and the mark reversed with it. The grid
 * card's payoff is now a dark stat panel rather than a pale brand tint, and one
 * table feeds both surfaces on purpose — a feature showing mint where the card
 * shows teal would be two versions of the same client's colour, which is the
 * exact failure this table was extracted to prevent. What the feature does NOT
 * take from the card is the counting figure: it already prints value and label
 * in its own foot block at reading size, and the same result cannot be the
 * arrival twice on one tile. The panel states the client; the foot states the
 * result; the tile still reads as two halves rather than one repeated claim.
 *
 * WRITING GETS THE SAME FRAME AND DIFFERENT CONTENT, because a single essay
 * surfaced by a filter has the same problem and the same fix. Its panel carries
 * the publication rather than a client mark, on the warm writing paper the card's
 * hover payoff already uses, so an essay never borrows a visual language that
 * belongs to client work.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { IndustryGlyph } from "./IndustryGlyph";
import { loFiInk, loFiWriting } from "./loFiInk";
import { PAYOFFS } from "./projectPayoffs";

const eyebrow = "font-mono text-xs uppercase tracking-[0.16em]";

export function FeatureItem({ entry }: { entry: WorkEntry }) {
  const shouldReduce = useReducedMotion();
  const isArticle = entry.kind === "article";
  const href = workEntryHref(entry);
  const payoff = entry.kind === "case-study" ? PAYOFFS[entry.slug] : undefined;

  const label = isArticle
    ? `Read "${entry.title}" on ${entry.publication} (opens in a new tab): ${entry.tagline}`
    : `Open the ${entry.title} case study: ${entry.tagline}`;

  const body = (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
      }}
      /* Landscape from lg up, stacked below it. The panel leads on small screens
         and the type follows, because a colour plate is the fastest thing to
         recognise and the slowest to read — putting it first gives a phone reader
         the identity before the paragraph. */
      className="relative isolate grid overflow-hidden rounded-2xl border shadow-card transition-shadow duration-100 group-hover:shadow-elevated lg:grid-cols-2"
      style={{ backgroundColor: loFiInk.paper, borderColor: loFiInk.rule }}
    >
      {/* THE PANEL. A fixed aspect on small screens so it never collapses to a
          sliver or swallows the fold; on lg it drops the aspect and simply fills
          its half of the row, which is what keeps the two columns level. */}
      <div
        className="order-first flex aspect-[16/10] items-center justify-center p-8 sm:aspect-[2/1] lg:order-last lg:aspect-auto lg:min-h-[26rem]"
        style={{ backgroundColor: payoff ? payoff.panel : loFiWriting.panel }}
      >
        {payoff ? (
          /* eslint-disable-next-line @next/next/no-img-element -- artwork inside
             a fixed-ratio plate, sized by class rather than layout; next/image's
             lazy wrapper buys nothing here and adds a fade on a static mark.

             REVERSED, because the panels went dark. The payoff table now
             resolves each case study to its own dark ground rather than a pale
             brand tint (see projectPayoffs.ts for why), and a coloured mark on
             a near-black plate is unreadable at best and invisible at worst —
             Funding Finder's wordmark is #361134 on a #361134 ground. The filter
             is the table's, not this component's, so the one mark that needs a
             different reversal gets it in both places. */
          <img
            src={payoff.logo}
            alt={payoff.alt}
            width={payoff.width}
            height={payoff.height}
            className="h-auto w-48 sm:w-56 lg:w-64"
            style={{ filter: payoff.markFilter }}
          />
        ) : (
          /* Writing's panel: the publication set as a masthead. Decorative — the
             link's accessible name already says where this goes, and the foot
             below states it in text. */
          <p
            aria-hidden="true"
            className="font-heading text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
            style={{ color: loFiWriting.ink }}
          >
            {entry.kind === "article" ? entry.publication : null}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:justify-center lg:p-12">
        <div className="flex items-center gap-3" style={{ color: loFiInk.quiet }}>
          <span className={eyebrow}>
            {entry.kind === "article" ? entry.topic : entry.industry}
          </span>
          {entry.kind === "case-study" && entry.industry ? (
            <span style={{ color: loFiInk.draw }}>
              <IndustryGlyph industry={entry.industry} className="size-5 shrink-0" />
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <h3
            className="max-w-[18ch] text-balance font-heading text-3xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl"
            style={{ color: loFiInk.ink }}
          >
            {entry.title}
          </h3>
          <p
            className="max-w-prose text-base leading-relaxed"
            style={{ color: loFiInk.quiet }}
          >
            {isArticle && entry.kind === "article" ? entry.deck : entry.tagline}
          </p>
        </div>

        {/* THE FOOT. The outcome in full for a case study — value and label side
            by side rather than stacked, because at this width the two fit on one
            line and stacking them would leave the figure floating. For writing,
            where it was published and when. */}
        <div
          className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t pt-6"
          style={{ borderColor: loFiInk.rule }}
        >
          {entry.outcome ? (
            <>
              <span
                className="font-heading text-2xl font-medium leading-none tracking-[-0.015em] tabular-nums sm:text-3xl"
                style={{ color: loFiInk.ink }}
              >
                {entry.outcome.value}
              </span>
              <span className="text-sm leading-snug" style={{ color: loFiInk.quiet }}>
                {entry.outcome.label}
              </span>
            </>
          ) : entry.kind === "article" ? (
            <span className={eyebrow} style={{ color: loFiInk.quiet }}>
              {entry.publication} · {entry.year}
            </span>
          ) : null}
        </div>

        <p
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: loFiInk.ink }}
        >
          {isArticle ? "Read on Substack" : "Read the case study"}
          <ArrowUpRight
            aria-hidden="true"
            strokeWidth={1.75}
            className="size-4 transition-transform duration-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </p>
      </div>
    </motion.article>
  );

  const linkClass =
    "group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary";

  return isArticle ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label="Read"
      aria-label={label}
      className={linkClass}
    >
      {body}
    </a>
  ) : (
    <Link
      href={href}
      data-explore-card
      data-cursor-label="Open"
      aria-label={label}
      className={linkClass}
    >
      {body}
    </Link>
  );
}
