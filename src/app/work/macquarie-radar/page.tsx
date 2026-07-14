import type { Metadata } from "next";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import { CaseStudyRail, type CaseChapter } from "@/app/components/CaseStudyRail";
import { Chapter, chapterGap } from "@/app/components/Chapter";
import { ChapterMarker } from "@/app/components/ChapterMarker";
import { MotionReveal } from "@/app/components/MotionReveal";
import { Tile } from "@/app/components/Tile";
import { caseStudyMetadata } from "../projects";

const slug = "macquarie-radar";

export const metadata: Metadata = caseStudyMetadata(slug);

/* Scaffold copy — plausible placeholder until the real case study lands.
   Radar is framed as an early-support view for student advisors. Every string
   here is written to be replaced. */
const chapters: CaseChapter[] = [
  { id: "introduction", title: "Introduction" },
  { id: "problem", title: "The Problem" },
  { id: "approach", title: "The Approach" },
  { id: "decisions", title: "Key Decisions" },
  { id: "outcome", title: "The Outcome" },
];

const problemPoints = [
  "Signals about a struggling student were scattered across separate systems.",
  "Advisors often saw the warning signs only after a student had fallen behind.",
  "There was no shared view of who needed a conversation this week.",
];

const approachPoints = [
  "Started from the signals advisors already trusted, rather than new metrics.",
  "Mapped the moments where a timely nudge changes a student's path.",
  "Prototyped one calm view that answers a single question at a glance.",
];

const outcomePoints = [
  "Advisors reach students earlier, with less time spent hunting through systems.",
  "Support conversations start from shared context, not a cold call.",
  "The team has a foundation to fold in new signals as trust grows.",
];

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <MotionReveal>
      <p className="max-w-prose text-base leading-relaxed text-foreground md:text-lg">
        {children}
      </p>
    </MotionReveal>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="max-w-prose space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-base leading-relaxed text-foreground md:text-lg"
        >
          <span
            aria-hidden="true"
            className="mt-[0.75em] h-px w-4 shrink-0 bg-foreground/40"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <MotionReveal>
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </h3>
    </MotionReveal>
  );
}

export default function MacquarieRadarPage() {
  return (
    <CaseStudyShell
      slug={slug}
      heroId="introduction"
      intro={{
        text: (
          <>
            Macquarie University asked how its advisors could{" "}
            <span className="font-semibold text-leaf-highlight">
              reach students
            </span>{" "}
            who were quietly falling behind. Radar gathers the signals that
            already exist across the university into{" "}
            <span className="font-semibold text-leaf-highlight">
              one calm, readable view
            </span>
            , so the right person can{" "}
            <span className="font-semibold text-leaf-highlight">
              step in early
            </span>
            . The full case study is coming soon.
          </>
        ),
        meta: [
          { label: "Role", value: "Senior Product Designer" },
          {
            label: "Scope",
            items: [
              "Discovery and research",
              "Product and interaction design",
              "Design system and accessibility",
            ],
          },
        ],
      }}
    >
      <div className="xl:hidden">
        <ChapterMarker chapters={chapters} />
      </div>

      <div className={chapterGap}>
        <Chapter
          id="problem"
          title="The problem"
          leafCorners="top"
          lede="Advisors could only see a student was struggling once they had already fallen behind."
        >
          <Tile immersive corners="bottom">
            <SectionHeading>Where the picture broke down</SectionHeading>
            <div className="mt-4">
              <BulletList items={problemPoints} />
            </div>
          </Tile>
        </Chapter>

        <Chapter
          id="approach"
          title="The approach"
          leafCorners="top"
          lede="Start from the signals advisors already trust, then make them easy to read at a glance."
        >
          <Tile immersive corners="bottom">
            <div className="space-y-6 md:space-y-8">
              <Prose>
                The work began with the advisors, not the data. We sat with the
                people who reach out to students and traced how they already
                sensed trouble, then looked for where that instinct ran out of
                information. Radar grew from those conversations.
              </Prose>
              <BulletList items={approachPoints} />
            </div>
          </Tile>
        </Chapter>

        <Chapter
          id="decisions"
          title="Key decisions"
          leafCorners="top"
          lede="Every view answered one question: who needs a conversation today?"
        >
          <Tile immersive corners="bottom">
            <div className="space-y-6 md:space-y-8">
              <Prose>
                Radar leads with people, not dashboards. The home view is a
                short, prioritised list of students to reach, each with just
                enough context to open a warm conversation. Detail waits one tap
                away, so the first screen stays calm under pressure.
              </Prose>
              <Prose>
                Placeholder for the design walkthrough: flows, screens, and the
                trade-offs behind them will land here with the full case study.
              </Prose>
            </div>
          </Tile>
        </Chapter>

        <Chapter
          id="outcome"
          title="The outcome"
          leafCorners="top"
          lede="Advisors reached more students earlier, with less time spent hunting through systems."
        >
          <Tile immersive corners="bottom">
            <SectionHeading>Early signals</SectionHeading>
            <div className="mt-4 space-y-6 md:space-y-8">
              <BulletList items={outcomePoints} />
              <Prose>
                Placeholder for outcomes: measured results and reflections will
                replace this summary once the work is written up in full.
              </Prose>
            </div>
          </Tile>
        </Chapter>
      </div>

      <CaseStudyRail chapters={chapters} className="hidden xl:block" />
    </CaseStudyShell>
  );
}
