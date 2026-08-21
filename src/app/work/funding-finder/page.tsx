import type { Metadata } from "next";
import { CaseStatement } from "@/app/components/CaseStatement";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import {
  Chapter,
  chapterGap,
  LeafPlate,
  readingTilePadding,
  sectionHeading,
  sectionLede,
  tileGap,
} from "@/app/components/Chapter";
import { ChapterMarker } from "@/app/components/ChapterMarker";
import { MaskReveal } from "@/app/components/MaskReveal";
import { Tile } from "@/app/components/Tile";
import { type CaseChapter } from "@/app/components/CaseStudyRail";
import { ChapterDock } from "@/app/components/ChapterDock";
import { caseStudyMetadata, getCaseStudy } from "../projects";
import { DesignDirection } from "./DesignDirection";
import { FundingHero } from "./FundingHero";
import { IaFlow } from "./IaFlow";
import { LandscapeReview } from "./LandscapeReview";
import { Personas } from "./Personas";
import { ProblemSpace } from "./ProblemSpace";
import { ResearchMethod } from "./ResearchMethod";
import { SuccessCriteria } from "./SuccessCriteria";
import { TaskAnalysis } from "./TaskAnalysis";
import { UserInsights } from "./UserInsights";
import { UserJourneys } from "./UserJourneys";

const slug = "funding-finder";

export const metadata: Metadata = caseStudyMetadata(slug);

/* Seven chapters rather than the symptom checker's five, because the fact this
   project has and that one does not is that it serves two people at once. A
   borrower and a broker want opposite things from the same deal — one wants to
   answer as little as possible, the other wants to see everything — so the
   decisions chapter splits in two rather than averaging them into a single
   "key design decisions" run that would have to keep saying "and for brokers".

   The approach chapter carries the research in the order it happened, which is
   also the order it has to be read: what we asked, what we found, who we found
   it about, then what we decided to do about it. */
const chapters: CaseChapter[] = [
  { id: "introduction", title: "Introduction" },
  { id: "problem", title: "The Problem" },
  {
    id: "approach",
    title: "The Approach",
    sections: [
      { id: "research-methodology", title: "Research Methodology" },
      { id: "landscape-review", title: "Landscape Review" },
      { id: "user-insights", title: "What Users Told Us" },
      { id: "personas", title: "Who We Designed For" },
      { id: "task-analysis", title: "Task Analysis" },
      { id: "design-direction", title: "Design Direction" },
      { id: "user-journeys", title: "User Journeys" },
      { id: "information-architecture", title: "Information Architecture" },
    ],
  },
  { id: "borrower", title: "Designing for Borrowers" },
  { id: "broker", title: "Designing for Brokers" },
  { id: "testing", title: "What Testing Changed" },
  { id: "outcome", title: "The Outcome" },
];

export default function FundingFinderPage() {
  return (
    <CaseStudyShell
      slug={slug}
      hideTagline
      heroId="introduction"
      heroCorners="top"
      reserveNavLane={false}
      intro={{
        text: (
          <>
            <p>
              Funding Finder matches borrowers with{" "}
              <span className="font-semibold text-leaf-highlight">
                private lenders
              </span>{" "}
              across short term debt, property development finance, and business
              term loans.
            </p>
            <p>
              I joined at the start, when the process still ran on emailed
              documents and spreadsheets. A borrower wants to answer{" "}
              <span className="font-semibold text-leaf-highlight">
                as few questions as possible
              </span>
              , and a broker needs to see every answer. The same application
              had to work for both of them.
            </p>
          </>
        ),
        /* A credits block, matching the symptom checker's: three labelled facts
           a hiring manager can scan, with the page below as the proof. The
           published write-up's role block ran four bullets long; Role carries
           its opening claim and Focus carries the rest. */
        meta: [
          { label: "Role", value: "Sole designer, discovery to delivery" },
          { label: "Impact area", value: "Financial access" },
          {
            label: "Focus",
            bullets: [
              "User and Stakeholder Research",
              "Information Architecture",
              "Content Strategy",
              "User Interface Design",
            ],
          },
        ],
      }}
    >
      <div className="xl:hidden">
        <ChapterMarker chapters={chapters} />
      </div>

      <div className={chapterGap}>
        {/* The introduction slab continues from the shell's title tile, which
            carries the #introduction anchor and caps its top. */}
        <div className={tileGap}>
          {/* The prototype itself, running, before a word of analysis — same
              slot the symptom checker gives its product hero. */}
          <FundingHero corners="none" />
          <CaseStatement
            corners="bottom"
            eyebrow="The reframe"
            proofEyebrow="What borrowers said"
            /* The verbatim the whole reframe answers, sitting where the
               symptom checker put its user response. It is the problem stated
               in a borrower's own words, which is the honest thing to evidence
               a reframe with before any result exists to quote. */
            quote={{
              text: "“There are so many questions all at once. I just close the tab. I don’t have all this information in front of me.”",
              source: "Borrower, user interviews",
            }}
          >
            {getCaseStudy(slug)?.tagline}
          </CaseStatement>
        </div>

        <Chapter
          id="problem"
          title="The problem"
          leafCorners="top"
          /* No figures here on purpose. Two in three incomplete and three to six
             weeks are the display marks in the section below, and spending them
             in the lede first means a reader meets both numbers as reading copy
             before they meet them as evidence. */
          lede="Nobody could tell a borrower whether they qualified until they had already done all the work."
          leafPlate={
            /* tangled cube: the process nobody could find their way through */
            <LeafPlate
              src="/assets/chapter-illustrations/problem-alpha.webp"
              width={705}
              height={767}
            />
          }
        >
          <ProblemSpace corners="none" />
          {/* Reversed against the reading tile above: the section takes the
              light tinted panel and the criteria cells come back in white, so
              the six read as targets set on the brand field rather than tints
              on white paper. Same pairing as the outcome scorecard that answers
              it — bar and result have to carry the same surface, or the answer
              stops looking like an answer to the question. */}
          <Tile
            surface="secondary"
            immersive
            corners="bottom"
            className={readingTilePadding}
          >
            <MaskReveal
              as="h2"
              mode="word"
              duration="fast"
              className={sectionHeading}
              text="What success had to look like"
            />
            {/* The scorecard shows the six targets; what it cannot show is who
                agreed them, when, and what they were cut down from. */}
            <p className={sectionLede}>
              The founder and I agreed these six targets before I drew a
              screen. They come from a longer list of eleven, and I dropped the
              ones that measured the same thing twice.
            </p>
            <SuccessCriteria className="mt-8 md:mt-10" />
          </Tile>
        </Chapter>

        <Chapter
          id="approach"
          title="The approach"
          leafCorners="top"
          /* Same rule as the problem chapter: the eight participants, three
             products and two rounds are the scope column of the ledger below,
             so the lede states what the chapter is for instead of counting. */
          lede="Before I drew a screen I needed to know how a borrower and a broker each work today, and which parts of that work the platform would be replacing."
          leafPlate={
            /* cube studies: the same problem worked several ways */
            <LeafPlate
              src="/assets/chapter-illustrations/approach-alpha.webp"
              width={971}
              height={306}
            />
          }
        >
          {/* Eight sections, in the order the work happened, which is also the
              order it has to be read: how we looked, what was already out
              there, what people said, who they were, what the platform's
              operators actually do, and then the turn into decisions — with
              the two artefacts that carry both sides of the deal last, because
              they are the bridge into the borrower and broker chapters.

              Only the final section caps the slab; every one before it is
              square, so the eight read as one long chapter rather than eight
              loose tiles. */}
          <ResearchMethod id="research-methodology" corners="none" />
          <LandscapeReview id="landscape-review" corners="none" />
          <UserInsights id="user-insights" corners="none" />
          <Personas id="personas" corners="none" />
          <TaskAnalysis id="task-analysis" corners="none" />
          <DesignDirection id="design-direction" corners="none" />
          <UserJourneys id="user-journeys" corners="none" />
          <IaFlow id="information-architecture" corners="bottom" />
        </Chapter>

        <Chapter
          id="borrower"
          title="Designing for borrowers"
          leafCorners="top"
          lede="Ask one question at a time, show that the bank connection is safe, then recommend a lender and say why."
          leafPlate={
            /* cube studies resolving. This plate and the broker chapter's are
               deliberately the same drawing: the two chapters are one act in
               two halves, and giving each its own engraving would say they are
               separate arguments when they are the same argument told from
               either side of the deal. */
            <LeafPlate
              src="/assets/chapter-illustrations/decisions-alpha.webp"
              width={1200}
              height={600}
              heightClass="h-32 md:h-40"
            />
          }
        >
          <Tile corners="bottom" className={readingTilePadding}>
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              Placeholder — the borrower decisions band lands here.
            </p>
          </Tile>
        </Chapter>

        <Chapter
          id="broker"
          title="Designing for brokers"
          leafCorners="top"
          lede="Put every deal and every stage in one place, so a broker can see where things stand without asking anyone."
          leafPlate={
            /* The borrower chapter's plate again, on purpose — see the note
               there. */
            <LeafPlate
              src="/assets/chapter-illustrations/decisions-alpha.webp"
              width={1200}
              height={600}
              heightClass="h-32 md:h-40"
            />
          }
        >
          <Tile corners="bottom" className={readingTilePadding}>
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              Placeholder — the broker decisions band lands here.
            </p>
          </Tile>
        </Chapter>

        {/* No leaf plate. The five chapters around it each open on their own
            engraving; this one is the bridge between the two decision bands and
            the result, and opening it plainly marks it as the turn rather than
            a sixth act. Same reasoning as the symptom checker's coda. */}
        <Chapter
          id="testing"
          title="What testing changed"
          leafCorners="top"
          lede="Two rounds of testing found six problems serious enough to block launch. One of them still shipped."
        >
          <Tile corners="bottom" className={readingTilePadding}>
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              Placeholder — the heuristic findings land here.
            </p>
          </Tile>
        </Chapter>

        <Chapter
          id="outcome"
          title="The outcome"
          leafCorners="top"
          lede="The platform shipped in three months, on time and under budget."
          leafPlate={
            /* the cube resolves: dashed scaffolds settling into one solid,
               fully drawn figure */
            <LeafPlate
              src="/assets/chapter-illustrations/outcome-alpha.webp"
              width={1200}
              height={600}
              heightClass="h-32 md:h-40"
            />
          }
        >
          <Tile corners="bottom" className={readingTilePadding}>
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              Placeholder — the outcome scorecard lands here.
            </p>
          </Tile>
        </Chapter>
      </div>
      <ChapterDock chapters={chapters} className="hidden xl:block" />
    </CaseStudyShell>
  );
}
