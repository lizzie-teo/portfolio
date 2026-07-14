import { MotionReveal } from "./MotionReveal";
import { StatCallout } from "./StatCallout";

type SnapshotStat = {
  value: string;
  label: string;
  detail?: string;
};

type SnapshotMeta = {
  label: string;
  items: string[];
};

type CaseSnapshotProps = {
  /** Headline outcomes. Omit when the stats live elsewhere (e.g. the
   * statement panel) and this tile carries only the role/scope metadata. */
  stats?: SnapshotStat[];
  meta: SnapshotMeta[];
};

/**
 * The role and scope layer, placed under the case-study hero so the whole
 * story is answerable before scrolling. Renders the headline outcomes when
 * given `stats`; when they are omitted it degrades to a metadata-only tile.
 */
export function CaseSnapshot({ stats, meta }: CaseSnapshotProps) {
  const hasStats = Boolean(stats?.length);
  return (
    <section aria-label="Project snapshot">
      {hasStats ? (
        <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {stats!.map((stat, index) => (
            <MotionReveal key={stat.label} delay={index * 0.05}>
              <div>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <StatCallout
                    value={stat.value}
                    label={stat.label}
                    detail={stat.detail}
                  />
                </dd>
              </div>
            </MotionReveal>
          ))}
        </dl>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 ${
          hasStats
            ? "mt-12 border-t border-border pt-8 md:mt-16 md:pt-10"
            : ""
        }`}
      >
        {meta.map((group, index) => (
          <MotionReveal key={group.label} delay={index * 0.05}>
            <div>
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </h2>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
