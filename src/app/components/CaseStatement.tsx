import type { ReactNode } from "react";
import { cornerClasses, type TileCorners } from "./Chapter";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MotionReveal } from "./MotionReveal";
import { StatCallout } from "./StatCallout";

type StatementStat = {
  value: string;
  label: string;
  detail?: string;
};

type CaseStatementProps = {
  /** The statement line — short display copy, not a paragraph. */
  children: ReactNode;
  /** Quiet label rooting the statement, e.g. "The reframe". Optional. */
  eyebrow?: string;
  /** Headline outcomes shown as the proof row below the statement. */
  stats?: StatementStat[];
  /** Quiet label anchoring the proof row, e.g. "The result". Optional. */
  statsEyebrow?: string;
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
 * carries the headline outcomes beneath a divider as its proof row — claim
 * above, evidence below — with the stats sized down so the line still leads.
 * One per page.
 */
export function CaseStatement({
  children,
  eyebrow,
  stats,
  statsEyebrow,
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
        <p className="mt-6 max-w-[13em] font-heading text-[clamp(1.875rem,5.2vw,4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground">
          {children}
        </p>

        {stats?.length ? (
          <div className="mt-10 border-t border-border pt-10 md:mt-14 md:pt-14">
            {statsEyebrow ? (
              <p className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground md:mb-10">
                {statsEyebrow}
              </p>
            ) : null}
            <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <StatCallout
                      size="md"
                      value={stat.value}
                      label={stat.label}
                      detail={stat.detail}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </MotionReveal>
    </CollapsingLeaf>
  );
}
