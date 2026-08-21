import type { ReactNode } from "react";
import { cornerClasses, statementHeading, type TileCorners } from "./Chapter";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { InsightCallout } from "./InsightCallout";
import { MotionReveal } from "./MotionReveal";
import { StatCallout } from "./StatCallout";

type StatementStat = {
  value: string;
  label: string;
  detail?: string;
};

type StatementQuote = {
  /** Verbatim, quote marks included — this is somebody speaking. */
  text: string;
  /** Who said it and where, e.g. "Usability testing participant". */
  source?: string;
};

type CaseStatementProps = {
  /** The statement line — short display copy, not a paragraph. */
  children: ReactNode;
  /** Quiet label rooting the statement, e.g. "The reframe". Optional. */
  eyebrow?: string;
  /** Headline outcomes shown as the proof row below the statement. */
  stats?: StatementStat[];
  /** A verbatim quote as the proof below the statement — the other way to
      evidence the claim. Pass one or the other, not both. */
  quote?: StatementQuote;
  /** Quiet label anchoring the proof row, e.g. "The result". Optional. */
  proofEyebrow?: string;
  /** Corner rounding for the tile surface — "bottom" when the statement
      closes a grouped slab. */
  corners?: TileCorners;
};

/**
 * A standalone campaign-weight statement tile: the one line a case study
 * turns on, set large in the display face on the project-tinted quiet panel.
 * Distinct from InsightCallout — that is an attributed research pull quote
 * (quote marks, source rule); this is an unattributed thesis line, sized to
 * read like an advertising statement rather than reading copy. Optionally
 * carries a proof row beneath a divider — claim above, evidence below —
 * either as headline outcomes (`stats`) or as one verbatim quote (`quote`,
 * borrowing InsightCallout's quote bar at its supporting size). Whichever it
 * is, it is sized down so the statement line still leads.
 * One per page.
 */
export function CaseStatement({
  children,
  eyebrow,
  stats,
  quote,
  proofEyebrow,
  corners = "all",
}: CaseStatementProps) {
  /* The statement tile shares the leaf arrival (CollapsingLeaf): under a
     viewport tall it opens at the full leaf height and collapses onto its
     content. MotionReveal sits inside the collapsing surface, not around
     it — a transformed ancestor would re-anchor the sticky pin and break
     the collapse. */
  return (
    <CollapsingLeaf
      pinTopPx={0}
      className={`flex flex-col justify-start ${cornerClasses[corners]} bg-secondary px-6 py-16 sm:px-10 md:px-12 md:py-24 lg:px-16 lg:py-28`}
    >
      <MotionReveal>
        <span
          aria-hidden="true"
          className="block h-1 w-10 rounded-full bg-primary md:w-12"
        />
        {eyebrow ? (
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        {/* Size comes from the shared `statementHeading` rung, never from an
            inline clamp — this line and the outcome statement had already
            drifted apart while both were hand-sized. */}
        <p className={`mt-6 max-w-[13em] ${statementHeading} text-foreground`}>
          {children}
        </p>

        {stats?.length || quote ? (
          <div className="mt-10 border-t border-border pt-10 md:mt-14 md:pt-14">
            {proofEyebrow ? (
              <p className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground md:mb-10">
                {proofEyebrow}
              </p>
            ) : null}
            {stats?.length ? (
              <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
                {stats.map((stat, index) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <StatCallout
                        size="md"
                        value={stat.value}
                        label={stat.label}
                        detail={stat.detail}
                        delay={index * 0.05}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {quote ? (
              <InsightCallout size="supporting" context={quote.source}>
                {quote.text}
              </InsightCallout>
            ) : null}
          </div>
        ) : null}
      </MotionReveal>
    </CollapsingLeaf>
  );
}
