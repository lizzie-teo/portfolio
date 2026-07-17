import type { Metadata } from "next";
import { AnnotatedFrame } from "@/app/components/AnnotatedFrame";
import { ArtifactSection } from "@/app/components/ArtifactSection";
import { ArtifactViewer } from "@/app/components/ArtifactViewer";
import { CaseStatement } from "@/app/components/CaseStatement";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import {
  Chapter,
  chapterGap,
  LeafPlate,
  readingTilePadding,
  tileGap,
} from "@/app/components/Chapter";
import { ChapterMarker } from "@/app/components/ChapterMarker";
import { InsightCallout } from "@/app/components/InsightCallout";
import { MediaFrame } from "@/app/components/MediaFrame";
import {
  MotionReveal,
  MotionRevealGroup,
  MotionRevealItem,
} from "@/app/components/MotionReveal";
import { Tile } from "@/app/components/Tile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type CaseChapter } from "@/app/components/CaseStudyRail";
import { ChapterDock } from "@/app/components/ChapterDock";
import { caseStudyMetadata, getCaseStudy } from "../projects";
import { CriteriaScorecard } from "./CriteriaScorecard";
import { EngineAudit } from "./EngineAudit";
import { IaFlow } from "./IaFlow";
import { JourneyMap } from "./JourneyMap";
import { LandscapeReview } from "./LandscapeReview";
import { SymptomsHero } from "./SymptomsHero";

const slug = "healthdirect-symptom-checker";

export const metadata: Metadata = caseStudyMetadata(slug);

const chapters: CaseChapter[] = [
  { id: "introduction", title: "Introduction" },
  { id: "problem", title: "The Problem" },
  {
    id: "approach",
    title: "The Approach",
    defaultExpanded: true,
    sections: [
      { id: "engine-audit", title: "AI Engine Audit" },
      { id: "landscape-review", title: "Landscape Review" },
      { id: "user-journey", title: "User Journey" },
      { id: "sketches", title: "Sketches" },
      { id: "information-architecture", title: "Information Architecture" },
      { id: "usability-testing", title: "Usability Testing" },
    ],
  },
  { id: "decisions", title: "Key Decisions" },
  { id: "outcome", title: "The Outcome" },
  {
    id: "phase-2",
    title: "Phase 2 — The Ecosystem",
    sections: [
      { id: "research-themes", title: "Research Themes" },
      { id: "service-concepts", title: "Service Concepts" },
      { id: "roadmap", title: "The Roadmap" },
    ],
  },
];

const approachActivities = [
  "Applied existing user research to inform design",
  "Adhered to government policies and clinical standards",
  "Audited Infermedica AI's capabilities",
  "Conducted landscape review of health products",
  "User journey and IA to identify gaps",
  "Ran moderated usability tests with external agency",
  "Low-fidelity concepts",
  "Content strategy",
];

const round1Recommendations = [
  "Move the urgent care clinic screener from within the assessment into the Service Finder",
  "Rework the postcode introduction copy so users don't expect instant service recommendations",
  "Rewrite the outcome page's 'What to do' copy to highlight the recommended service categories",
  "Restyle and move the SMS link so it stands out on the outcome page",
  "Add a reference number to the outcome",
  "Separate symptom and article links on the outcome page, with transparent article names",
  "Remove 'Example symptoms' from the outcome page's 'Learn more'",
  "Move the find-a-service widget higher so users reach an outcome earlier",
  "Add a 'More information' heading to reinforce the link separation",
  "Add a service distance filter, pending technical feasibility",
  "Trim the SMS validation toast copy",
];

const researchThemes = [
  {
    title: "Confidence to manage symptoms is low",
    body: "Health is complex, and most consumers outsource decisions to professionals. Even with extensive information online, a capability gap remains around safe self-care.",
    quote:
      "Oh I'm not really sure, health is really complex, so I'm not really sure.",
  },
  {
    title: "System literacy is low",
    body: "Newer pathways like urgent care clinics and virtual ED aren't widely understood — and new migrants default to the behaviours of the health system they came from.",
    quote:
      "In Dubai they only have private — you can go to the hospital, max 30 minutes maybe.",
  },
  {
    title: "Time is value",
    body: "Consumers are hyper-aware of time as the currency of healthcare. Waits keep growing, and the pathways with capacity are rarely their regular GP.",
    quote:
      "Hard to see a GP these days because there's a shortage in Bendigo. Nearly two weeks to get an appointment.",
  },
  {
    title: "The digital divide",
    body: "One in four Australians is digitally excluded — with First Nations people living remotely, low-income households, new migrants and refugees, and people over 65 most at risk.",
    quote:
      "I prefer telehealth because I live rurally and travel time is an issue. If I don't have to drive an hour I will jump at it.",
  },
];

const roadmapFocusAreas = [
  {
    title: "Building confidence in health decisions",
    body: "Step-by-step guidance in plain language, AI-assisted triage that escalates to human oversight, and follow-up prompts — so people feel reassured rather than overwhelmed.",
  },
  {
    title: "Strengthening continuity of care",
    body: "Digital summaries consumers can share with GPs, pre-consultation preparation, and post-engagement check-ins — so care feels connected across services.",
  },
  {
    title: "Improving equity and access",
    body: "A multilingual symptom checker, real-time translation for helpline conversations, and partnerships with community, welfare, and immigration services.",
  },
  {
    title: "Making system navigation simpler",
    body: "A recognisable digital front door, cross-directory wayfinding, and visibility of service availability and cost — so people reach appropriate care faster.",
  },
  {
    title: "Supporting preventive and ongoing self-care",
    body: "Screening reminders, medication and adherence support, and trusted, nationally consistent health information — fewer crises through long-term management.",
  },
];

const phase2Purposes = [
  "Identify system-level gaps between consumer needs, service intent, and actual behaviour",
  "Surface future-state opportunities across services and channels",
  "Use research and prototyping to inform strategic decisions and funding discussions",
  "Explore how AI-assisted support could responsibly enhance human-led services",
];

const phase2Contributions = [
  "Conducting consumer interviews across prioritised cohorts",
  "Synthesising qualitative insights to surface recurring patterns",
  "Translating insights into journey maps to make system gaps visible",
  "Prototyping service and AI-assisted concepts to provoke discussion",
  "Sharing Phase 1 findings to maintain evidence continuity",
  "Contributing to research presentations and cross-functional workshops",
];

const stressPrinciples = [
  "Design for what people can cope with, not what the system can do",
  "Explain why a pathway is recommended, not just what to do",
  "Avoid diagnostic language to prevent anxiety escalation",
  "Keep human support visible — self-service can feel like abandonment",
  "Design for the least-resourced user, not the most confident",
];

const phase2Outcomes = [
  "Clarified future-state opportunity areas across Healthdirect services",
  "Informed government funding proposals with evidence-based insights",
  "Provided leadership with tangible artefacts to evaluate strategic options",
  "Created alignment across CX, product, and service design teams on priorities",
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

function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <figure className="border-l border-border pl-4">
      <blockquote className="text-sm leading-relaxed text-muted-foreground">
        “{quote}”
      </blockquote>
      {attribution ? (
        <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <MotionRevealGroup as="ul" className="max-w-prose space-y-3">
      {items.map((item) => (
        <MotionRevealItem
          as="li"
          key={item}
          className="flex gap-3 text-base leading-relaxed text-foreground md:text-lg"
        >
          <span
            aria-hidden="true"
            className="mt-[0.75em] h-px w-4 shrink-0 bg-foreground/40"
          />
          <span>{item}</span>
        </MotionRevealItem>
      ))}
    </MotionRevealGroup>
  );
}

function ProcessDisclosure({
  items,
}: {
  items: { value: string; trigger: string; content: React.ReactNode }[];
}) {
  return (
    <MotionReveal>
      <Accordion className="max-w-prose border-t border-border">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger className="min-h-11 text-xs font-medium uppercase tracking-[0.16em]">
              {item.trigger}
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </MotionReveal>
  );
}

export default function HealthdirectSymptomCheckerPage() {
  return (
    <CaseStudyShell
      slug="healthdirect-symptom-checker"
      chip="Public Health"
      hideTagline
      heroId="introduction"
      heroCorners="top"
      reserveNavLane={false}
      intro={{
        text: (
          <>
            <p>
              Healthdirect is Australia&apos;s government funded health
              information service, reaching{" "}
              <span className="font-semibold text-leaf-highlight">
                millions of Australians
              </span>{" "}
              across digital and phone channels.
            </p>
            <p>
              This project was a full redesign of their legacy product,{" "}
              <span className="font-semibold text-leaf-highlight">
                Symptom Checker
              </span>
              . It&apos;s a triage tool that helps people assess their
              symptoms and decide on next steps for care.
            </p>
            <p>
              Working across a cross-functional team, I{" "}
              <span className="font-semibold text-leaf-highlight">
                led UX across two phases
              </span>
              : a product redesign integrating Infermedica&apos;s AI engine,
              followed by a broader CX and service design initiative across
              Healthdirect&apos;s ecosystem.
            </p>
          </>
        ),
        meta: [
          {
            label: "My role",
            groups: [
              {
                label: "Phase 1 — The redesign",
                items: [
                  "End-to-end UX design from light discovery through delivery",
                  "Content strategy and accessibility compliance",
                  "Information architecture and UI design",
                  "Stakeholder alignment and cross-functional facilitation",
                ],
              },
              {
                label: "Phase 2 — The ecosystem",
                items: [
                  "Consumer research and synthesis",
                  "Service design and ecosystem mapping",
                  "Concept prototyping for strategy",
                ],
              },
            ],
          },
        ],
      }}
    >
      <div className="xl:hidden">
        <ChapterMarker chapters={chapters} />
      </div>

      <div className={chapterGap}>
        {/* The introduction slab continues from the shell's title tile (its
            top cap, carrying the #introduction anchor): product hero square in
            the middle, the reframe statement closing the bottom. */}
        <div className={tileGap}>
          <SymptomsHero corners="none" />
          <CaseStatement
            corners="bottom"
            eyebrow="The reframe"
            statsEyebrow="The result"
            stats={[
              {
                value: "86.5%",
                label: "Completion rate, 2024 release",
                detail: "Up from a 45% baseline",
              },
              {
                value: "68%",
                label: "Completion rate by end of 2023",
                detail: "First release after the redesign",
              },
              {
                value: "20%",
                label: "Reduction in project delays",
                detail: "Through cross-functional workshops",
              },
            ]}
          >
            {getCaseStudy(slug)?.tagline}
          </CaseStatement>
        </div>

        <Chapter
              id="problem"
              title="The problem"
              leafCorners="top"
              lede="Only 45% of people finished the check — most dropped off before they ever saw care guidance."
              leafPlate={
                /* tangled cube: the broken assessment where people lost
                   their way */
                <LeafPlate
                  src="/assets/chapter-illustrations/problem-alpha.webp"
                  width={705}
                  height={767}
                />
              }
            >
              <Tile immersive corners="bottom" className={readingTilePadding}>
                <MotionReveal>
                  <h3 className="whitespace-nowrap font-heading text-[clamp(0.85rem,4.2vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
                    What success had to look like
                  </h3>
                </MotionReveal>
                <CriteriaScorecard className="mt-8 md:mt-10" />
              </Tile>
            </Chapter>

            <Chapter
              id="approach"
              title="The approach"
              leafCorners="top"
              lede="Evidence before pixels: an audit of the AI engine, a map of the real journey, then a rebuilt architecture, tested twice."
              leafPlate={
                /* cube studies: the same problem worked five ways until it
                   resolves */
                <LeafPlate
                  src="/assets/chapter-illustrations/approach-alpha.webp"
                  width={971}
                  height={306}
                />
              }
            >
              <EngineAudit id="engine-audit" corners="none" />
              <LandscapeReview id="landscape-review" corners="none" />
              <JourneyMap id="user-journey" corners="none" />
              <ArtifactSection
                id="sketches"
                headingLevel={2}
                roomy
                title="Sketches"
                corners="none"
                takeaway="Rough concepts kept early debate on flow and framing, not visual polish."
              >
                <MotionReveal>
                  <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
                    <MediaFrame
                      label="Hand-drawn sketch of the tool introduction and basic questions flow"
                      caption="The tool introduction and basic questions flow, sketched before any UI."
                      ratio={2500 / 1130}
                      src="/assets/healthdirect/sketch-intro-basic-questions.webp"
                    />
                    <MediaFrame
                      label="Hand-drawn sketch of a symptom-entry screen option"
                      caption="Sketched options for symptom entry: free text versus guided selection."
                      ratio={2429 / 1088}
                      src="/assets/healthdirect/sketch-option-one.webp"
                    />
                  </div>
                </MotionReveal>
              </ArtifactSection>
              <IaFlow id="information-architecture" corners="none" />
              <ArtifactSection
                id="usability-testing"
                headingLevel={2}
                roomy
                title="Usability testing"
                corners="none"
                takeaway="Twelve sessions across two rounds produced eleven recommendations, all implemented."
              >
                <Prose>
                  Testing with an external agency targeted the language on the
                  prototype: two rounds of moderated 1:1 sessions, with
                  refinement in between, on Figma prototypes we developed
                  in-house. The twelve sessions were weighted toward the people
                  the tool most needs to serve — four priority users, four
                  culturally and linguistically diverse users, two people with
                  disability, and two general users.
                </Prose>
                <Prose>
                  Round 1 surfaced three themes: users were unsure of their
                  next step, expectations of the tool&apos;s outcome
                  weren&apos;t always met, and key functionality like SMS and
                  the service finder lacked clarity.
                </Prose>
                <Prose>
                  Round 2 validated the direction — users read the outcome page
                  as triage, recommending next steps — and pushed us to cut
                  wordiness that could overwhelm people in an emergency, new
                  arrivals, and users with lower English literacy.
                </Prose>
                <MotionReveal>
                  <div className="max-w-prose">
                    <PullQuote
                      quote="I don't need a full explanation — give me some options and if I want to read more I will. I don't want to read through a large amount of text."
                      attribution="Participant 5 — round 2, on the urgent care outcome page"
                    />
                  </div>
                </MotionReveal>
              </ArtifactSection>
              <Tile immersive corners="bottom">
                <ProcessDisclosure
                  items={[
                    {
                      value: "round-1",
                      trigger: "All eleven round-1 recommendations",
                      content: <BulletList items={round1Recommendations} />,
                    },
                    {
                      value: "approach",
                      trigger: "The full research and design approach",
                      content: <BulletList items={approachActivities} />,
                    },
                  ]}
                />
              </Tile>
            </Chapter>

            <Chapter
              id="decisions"
              title="Key decisions"
              leafCorners="top"
              lede="Every screen had one job: keep an anxious person moving toward care."
            >
              <MotionReveal>
                <AnnotatedFrame
                  label="Assessment flow decisions"
                  corners="bottom"
                  steps={[
                    {
                      title: "Motivation through a long assessment",
                      caption:
                        "Usability testing showed the encouragement screen added a human voice and propelled users forward. Steppers and clear instructions eased anxiety through a long clinical questionnaire.",
                      media: (
                        <MediaFrame
                          label="Symptoms step with a four-stage progress stepper, beside the 'First step done' encouragement screen"
                          ratio={4 / 3}
                          fit="contain"
                          src="/assets/healthdirect/symptoms-and-conclusion.webp"
                          sizes="(min-width: 1024px) 60vw, 100vw"
                        />
                      ),
                    },
                    {
                      title: "Actionable care advice",
                      caption:
                        "Results surfaced the decision-making info people actually weigh — wait times, cost, appointment requirements — with clinics numbered in order of recommendation and essentials like 'No fee' and distance highlighted on service cards.",
                      media: (
                        <MediaFrame
                          label="'Seek immediate medical care' outcome page with numbered care options, 'Learn more' explainers, and service finder results showing fees and distance"
                          ratio={4 / 3}
                          fit="contain"
                          src="/assets/healthdirect/content-strategy.webp"
                          sizes="(min-width: 1024px) 60vw, 100vw"
                        />
                      ),
                    },
                    {
                      title: "Microcopy tested with users",
                      caption:
                        "Language was iterated through moderated testing until medical terms and instructions could be understood without assistance — the health-literacy bar the project set.",
                      media: (
                        <MediaFrame
                          label="Health background question screen beside its 'More info' modal explaining diagnosed hypertension in plain language"
                          ratio={4 / 3}
                          fit="contain"
                          src="/assets/healthdirect/health-literacy.webp"
                          sizes="(min-width: 1024px) 60vw, 100vw"
                        />
                      ),
                    },
                    {
                      title: "Accessible, non-directive by design",
                      caption:
                        "Tested with people with disability and tech-wary users; WCAG-compliant for screen readers and keyboard; soothing colour schemes sensitive to user emotion; AI outputs framed to support decisions without feeling directive.",
                      media: (
                        <MediaFrame
                          label="The redesigned Symptoms step shown side by side on desktop and mobile, with calm colour and one clear task per screen"
                          ratio={4 / 3}
                          fit="contain"
                          src="/assets/healthdirect/symptoms-step-desktop-mobile.webp"
                          sizes="(min-width: 1024px) 60vw, 100vw"
                        />
                      ),
                    },
                  ]}
                />
              </MotionReveal>
            </Chapter>

            <Chapter
              id="outcome"
              title="The outcome"
              leafCorners="top"
              lede="Completion nearly doubled — from 45% to 86.5% within two releases."
            >
              <Tile immersive corners="none">
                <div className="space-y-6 md:space-y-8">
                  <BulletList
                    items={[
                      "Met high consumer demand for digital triage across jurisdictions",
                      "Facilitated workshops reducing project delays by approximately 20%",
                    ]}
                  />
                  <Prose>
                    The redesign also became the evidence base for what came next: a
                    native-app concept with a follow-up care plan for managing symptoms
                    at home, and the broader service-design initiative in Phase 2.
                  </Prose>
                </div>
              </Tile>
              <Tile immersive corners="bottom">
                <MotionReveal>
                  <MediaFrame
                    label="Native app concept screens: family profiles, guided basic-info questions, a 'See a GP today' care plan, and a five-day self-care timeline"
                    caption="Future-state prototype pitched alongside motion design explorations — a home for follow-up care plans and managing symptoms at home."
                    ratio={2500 / 1521}
                    src="/assets/healthdirect/mobile-native.webp"
                  />
                </MotionReveal>
              </Tile>
            </Chapter>

            <Chapter
              id="phase-2"
              title="Phase 2 — the ecosystem"
              leafCorners="top"
              lede="Phase 2 stepped back from one product to ask where the whole service system was failing people."
            >
              <Tile immersive corners="none">
                <Prose>
                  Following Phase 1 delivery, the redesign became an input into a
                  broader, time-boxed CX and service design initiative. We examined
                  how people experienced digital services, GP advice, and nurse
                  helplines together, particularly at moments of uncertainty, when
                  users were trying to understand what help was available and what
                  to do next.
                </Prose>
              </Tile>
              <Tile surface="secondary" immersive corners="none">
                <InsightCallout context="Consumer interviews — designing AI for health decisions under stress">
                  More information doesn&apos;t mean more confidence under stress.
                </InsightCallout>
              </Tile>
              <Tile immersive corners="none">
                <div className="space-y-6 md:space-y-8">
                  <Prose>
                    Australians turn to digital tools when anxious or uncertain —
                    moments where AI must build trust, not add confusion. Digital
                    confidence is unevenly distributed, and while users accept AI, they
                    want human oversight. Those findings became design principles:
                  </Prose>
                  <BulletList items={stressPrinciples} />
                </div>
              </Tile>
              <ArtifactSection
                id="research-themes"
                headingLevel={2}
                roomy
                title="Research themes"
                corners="none"
                takeaway="Four gaps consumers quietly navigate around."
              >
                <MotionRevealGroup className="grid gap-8 sm:grid-cols-2 md:gap-10">
                  {researchThemes.map((theme) => (
                    <MotionRevealItem
                      key={theme.title}
                      className="flex flex-col gap-3 border-t border-border pt-5"
                    >
                      <h3 className="text-base font-semibold">{theme.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {theme.body}
                      </p>
                      <div className="mt-auto pt-2">
                        <PullQuote quote={theme.quote} />
                      </div>
                    </MotionRevealItem>
                  ))}
                </MotionRevealGroup>
              </ArtifactSection>
              <Tile immersive corners="none">
                <MotionReveal>
                  <MediaFrame
                    label="Five-step process diagram: discovery research, insights and opportunities, generating ideas, prototyping, and validating with stakeholder and consumer workshops"
                    caption="The prototypes came out of a workshop cycle — consumer interviews and nurse workshops fed generative sessions, and the CX team turned the outputs into testable concepts."
                    ratio={1340 / 729}
                    src="/assets/healthdirect/project-progress-diagram.webp"
                  />
                </MotionReveal>
              </Tile>
              <ArtifactSection
                id="service-concepts"
                headingLevel={2}
                roomy
                title="Service concepts"
                corners="none"
                takeaway="Two concepts built to provoke discussion, not to ship."
              >
                <MotionReveal>
                  <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
                  <ArtifactViewer
                    label="Service concept — AI health assistant"
                    src="/assets/healthdirect/prototype-showcase-1.webp"
                    ratio={2000 / 1204}
                    variant="document"
                    caption="Probing attitudes toward AI-assisted symptom checks during escalation."
                    regions={[
                      {
                        title: "The concept",
                        caption:
                          "An in-app AI assistant that runs a conversational symptom check — one question at a time, in plain language.",
                        x: 30,
                        y: 55,
                        scale: 1.9,
                      },
                      {
                        title: "Explaining terms in place",
                        caption:
                          "Tapping the info icon explains clinical terms like enlarged lymph nodes on the spot — the health-literacy lesson carried over from Phase 1.",
                        x: 61,
                        y: 58,
                        scale: 2,
                      },
                      {
                        title: "The research questions",
                        caption:
                          "Each concept carried its own research intent: attitudes toward AI during symptom escalation, and what people need to feel comfortable self-serving.",
                        x: 84,
                        y: 55,
                        scale: 1.9,
                      },
                    ]}
                  />
                  <ArtifactViewer
                    label="Service concept — SMS symptom monitoring"
                    src="/assets/healthdirect/prototype-showcase-2.webp"
                    ratio={2000 / 1206}
                    variant="document"
                    caption="Remote monitoring over SMS — human reassurance without an app."
                    regions={[
                      {
                        title: "A guided SMS conversation",
                        caption:
                          "The service texts the consumer — symptom questions and a temperature check-in over plain SMS, no app required.",
                        x: 22,
                        y: 55,
                        scale: 1.9,
                      },
                      {
                        title: "Advice with an escape hatch",
                        caption:
                          "Self-care steps with a clear escalation threshold, plus opt-in reminders that keep a human-feeling presence through recovery.",
                        x: 60,
                        y: 55,
                        scale: 1.9,
                      },
                      {
                        title: "The research questions",
                        caption:
                          "Testing attitudes toward monitoring vitals by phone, and toward texting personal health information to a professional.",
                        x: 88,
                        y: 50,
                        scale: 1.9,
                      },
                    ]}
                  />
                  </div>
                </MotionReveal>
              </ArtifactSection>
              <ArtifactSection
                id="roadmap"
                headingLevel={2}
                roomy
                title="The roadmap"
                corners="none"
                takeaway="Five focus areas to anchor government funding discussions."
              >
                <MotionRevealGroup as="ol">
                  {roadmapFocusAreas.map((area, areaIndex) => (
                    <MotionRevealItem
                      as="li"
                      key={area.title}
                      className="flex gap-4 border-t border-border py-5 md:gap-6"
                    >
                      <span className="pt-0.5 text-xs font-medium tabular-nums text-primary">
                        {String(areaIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="max-w-prose space-y-1.5">
                        <h3 className="text-base font-semibold">{area.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {area.body}
                        </p>
                      </div>
                    </MotionRevealItem>
                  ))}
                </MotionRevealGroup>
              </ArtifactSection>
              <Tile immersive corners="none">
                <BulletList items={phase2Outcomes} />
              </Tile>
              <Tile immersive corners="bottom">
                <ProcessDisclosure
                  items={[
                    {
                      value: "purposes",
                      trigger: "Phase 2 purposes",
                      content: <BulletList items={phase2Purposes} />,
                    },
                    {
                      value: "contributions",
                      trigger: "What I worked on",
                      content: <BulletList items={phase2Contributions} />,
                    },
                  ]}
                />
              </Tile>
            </Chapter>
      </div>
      <ChapterDock chapters={chapters} className="hidden xl:block" />
    </CaseStudyShell>
  );
}
