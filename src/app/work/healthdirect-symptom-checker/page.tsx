import type { Metadata } from "next";
import { ArtifactSection } from "@/app/components/ArtifactSection";
import { ArtifactViewer } from "@/app/components/ArtifactViewer";
import { CaseStatement } from "@/app/components/CaseStatement";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import {
  Chapter,
  chapterGap,
  LeafPlate,
  readingTilePadding,
  sectionHeading,
  subsectionHeading,
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
import { ArrowUpRight } from "lucide-react";
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
import { OutcomeScorecard } from "./OutcomeScorecard";
import { FeatureChips, type Feature } from "@/app/components/FeatureChips";
import { EngineAudit } from "./EngineAudit";
import { IaFlow } from "./IaFlow";
import { JourneyMap } from "./JourneyMap";
import { LandscapeReview } from "./LandscapeReview";
import { UsabilityFindings } from "./UsabilityFindings";
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
      { id: "information-architecture", title: "Information Architecture" },
      { id: "sketches", title: "Sketches" },
      { id: "usability-testing", title: "Usability Testing" },
    ],
  },
  { id: "decisions", title: "Key Design Decisions" },
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

/* The four decisions that carried the flow, shown as expandable chips beside a
   frameless screenshot stage (FeatureChips). Copy is the approved AnnotatedFrame
   step text, rephrased to drop dash asides and compound hyphens (house style);
   labels are short editorial pills; alt text reuses the original descriptive
   MediaFrame labels. Dimensions are the assets' real intrinsic pixels so the
   ratio is reserved before load. */
const decisionFeatures: Feature[] = [
  {
    id: "accessible",
    label: "Accessible by design",
    body: [
      "Tested with people with disability and with users wary of technology, and built to meet WCAG for screen readers and keyboard use.",
      "Soothing colour schemes stayed sensitive to how someone felt, and AI outputs were framed to support a decision without ever steering it.",
    ],
    images: [
      {
        src: "/assets/healthdirect/design-decisions/accessibiilty-1.png",
        alt: "The Background step on mobile with a four-stage progress stepper and health background questions, each answerable in one tap",
        width: 1080,
        height: 7866,
        device: "mobile",
        displayWidth: 300,
      },
      {
        src: "/assets/healthdirect/design-decisions/accessbility-2.png",
        alt: "The 'More info' modal explaining diagnosed hypertension in plain language",
        width: 1440,
        height: 3200,
        device: "mobile",
        displayWidth: 300,
      },
    ],
    // Mobile prototype: the "More info" trigger on the Diagnosed hypertension
    // row opens its plain-language modal (accessbility-2). Coords are % of the
    // capture box, verified against the asset (row centres at ~20.2% down).
    hotspots: [
      {
        onImage: 0,
        x: 4,
        y: 18.9,
        w: 92,
        h: 2.6,
        popupImage: 1,
        label: "More info: diagnosed hypertension",
      },
    ],
  },
  {
    id: "guided-help",
    label: "Guided help",
    body: [
      "Where a question could trip people up, a 'More info and how to check it' link opened a plain-language explainer.",
      "It spelled out what the question meant and how to check it, so people could answer with confidence without leaving the flow.",
    ],
    images: [
      {
        src: "/assets/healthdirect/design-decisions/guided-help-mobile-1.png",
        alt: "The Assessment step asking whether you often have problems organising regular tasks or activities, with a 'More info and how to check it' link and Yes, No, and Don't know answers",
        width: 1080,
        height: 6222,
        device: "mobile",
        displayWidth: 300,
      },
      {
        src: "/assets/healthdirect/design-decisions/guided-help-mobile-2.png",
        alt: "The 'More info' modal explaining what the question means and how to check it in plain language",
        width: 1080,
        height: 2400,
        device: "mobile",
        displayWidth: 300,
      },
    ],
    // Mobile prototype: the "More info and how to check it" link opens its
    // explainer modal (guided-help-mobile-2). Link centres at ~20% down.
    hotspots: [
      {
        onImage: 0,
        x: 5,
        y: 18.7,
        w: 76,
        h: 2.6,
        popupImage: 1,
        label: "More info and how to check it",
      },
    ],
  },
  {
    id: "advice",
    label: "Actionable advice",
    body: [
      "There was a bigger goal behind the results page: take pressure off emergency departments by steering people toward virtual care and urgent care clinics when those could safely treat them.",
      "Results surfaced the information people actually weigh when choosing care: wait times, cost, and appointment requirements.",
      "Clinics were numbered in order of recommendation, with essentials like 'No fee' and distance highlighted on each service card.",
    ],
    images: [
      {
        src: "/assets/healthdirect/design-decisions/actionable-1.png",
        alt: "'Seek immediate medical care' outcome page listing care options in order of recommendation — Virtual Care Clinic (no fee), Urgent Care Clinics, then Emergency Departments — above a Find a service search",
        width: 1080,
        height: 12910,
        device: "mobile",
        note: "This prototype is tappable. Info icons open an explainer for each care option, and the Find links open that service's search.",
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-vcc.png",
        alt: "'Learn more' explainer for Virtual Care Clinics covering how care is delivered, whether an appointment is needed, wait times, and cost (free for Medicare card holders)",
        width: 1080,
        height: 2400,
        device: "mobile",
        note: "Ok or the X takes you back to the care options.",
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-find-vcc.png",
        alt: "Service Finder results for Virtual Care in Bowden, with care-type filter chips and a single virtual care clinic result",
        width: 1080,
        height: 2409,
        device: "mobile",
        note: "Service Finder, healthdirect's clinic locator, opens in a new window in the live product. Use the arrows to go back.",
        // Desktop curation: the stage shows the two explainers that differentiate
        // the virtual/urgent-care pathways plus one finder; the full prototype
        // walk (this VCC finder, plus the ED explainer and ED finder below) stays
        // on the mobile carousel.
        desktopHidden: true,
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-3.png",
        alt: "'Learn more' explainer for Urgent Care Clinics covering in-person care that cannot wait for a GP appointment, walk-ins, wait times, and cost (many bulk-billed)",
        width: 1080,
        height: 2400,
        device: "mobile",
        note: "Ok or the X takes you back to the care options.",
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-find-ucc.png",
        alt: "Service Finder results for Urgent Care in Bowden, ordered by nearest, each clinic card showing accessibility, bulk billing, opening hours, and distance",
        width: 1080,
        height: 15705,
        device: "mobile",
        note: "Service Finder, healthdirect's clinic locator, opens in a new window in the live product. Use the arrows to go back.",
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-3b.png",
        alt: "'Learn more' explainer for Emergency Departments covering severe or life-threatening injuries or illness, walk-ins always accepted, wait times, and cost (free for Medicare card holders)",
        width: 1080,
        height: 2400,
        device: "mobile",
        note: "Ok or the X takes you back to the care options.",
        // Desktop curation: ED is the pathway the design steers people AWAY from,
        // so its explainer sits out of the desktop stage; it stays in the mobile
        // walk.
        desktopHidden: true,
      },
      {
        src: "/assets/healthdirect/design-decisions/actionable-find-ed.png",
        alt: "Service Finder results for Emergency department services in Bowden, ordered by nearest, each hospital card showing opening hours and distance",
        width: 1080,
        height: 14781,
        device: "mobile",
        note: "Service Finder, healthdirect's clinic locator, opens in a new window in the live product. Use the arrows to go back.",
        // Desktop curation: the ED finder stays on the mobile walk only.
        desktopHidden: true,
      },
    ],
    // Mobile prototype: on the outcome page (actionable-1) each care option
    // carries two triggers, matching the product. The "info" icon beside the
    // heading opens its Learn more modal as a popup (headings verified against
    // the capture — Virtual Care ~13.5%, Urgent Care ~19.1%, Emergency
    // Departments ~24.9% down), and the "Find a …" link below its bullets pages
    // the carousel to that service's Service Finder results (links at ~17.8%,
    // ~23.5%, ~29.6% down). Images interleave modal-then-finder per service so
    // the arrow walk reads option by option.
    hotspots: [
      {
        onImage: 0,
        x: 3,
        y: 12.6,
        w: 72,
        h: 1.9,
        popupImage: 1,
        label: "More info: Virtual Care Clinic",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 17.35,
        w: 56,
        h: 1.15,
        goToImage: 2,
        label: "Find a Virtual Care Clinic",
      },
      {
        onImage: 0,
        x: 3,
        y: 18.6,
        w: 75,
        h: 1.9,
        popupImage: 3,
        label: "More info: Urgent Care Clinics",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 23,
        w: 59,
        h: 1.1,
        goToImage: 4,
        label: "Find an Urgent Care Clinic",
      },
      {
        onImage: 0,
        x: 3,
        y: 24.2,
        w: 89,
        h: 2.0,
        popupImage: 5,
        label: "More info: Emergency Departments",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 29.1,
        w: 72,
        h: 1.3,
        goToImage: 6,
        label: "Find an Emergency Department",
      },
    ],
  },
  {
    id: "momentum",
    label: "Keeping momentum",
    body: [
      "Usability testing showed the encouragement screen added a human voice and propelled users forward.",
      "Steppers and clear instructions eased anxiety through a long clinical questionnaire.",
    ],
    images: [
      {
        src: "/assets/healthdirect/design-decisions/conclusion_screen0.png",
        alt: "Background step on desktop with a four-stage progress stepper across Background, Symptoms, Assessment, and Results, above the health background questions",
        // PNG master (was conclusion-background.webp, a top crop of this file).
        // Top-aligned and hard-clipped at the stage floor, so the footer below
        // the Next button bleeds off — the visible stepper/form is identical.
        width: 1440,
        height: 2658,
        device: "desktop",
      },
      {
        src: "/assets/healthdirect/design-decisions/conclusion_screen.png",
        alt: "'First step done' encouragement screen thanking the user before the symptoms questions",
        // PNG master (was conclusion-encouragement.webp, identical dimensions).
        width: 1080,
        height: 2400,
        device: "mobile",
      },
    ],
  },
];

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
                value: "84%",
                label: "Completed their check",
                detail: "Up from 49% before the AI redesign",
              },
              {
                value: "2M",
                label: "Checks a year",
                detail: "Across Australian jurisdictions",
              },
              {
                value: "2×",
                label: "More than the helpline",
                detail: "Australians now choose digital first",
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
              lede="Only 49% of people finished the check, and most dropped off before they ever saw care guidance."
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
                  <h2 className={sectionHeading}>
                    What success had to look like
                  </h2>
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
              <IaFlow id="information-architecture" corners="none" />
              <ArtifactSection
                id="sketches"
                headingLevel={2}
                roomy
                title="Sketches"
                corners="none"
                takeaway="Rough concepts kept early debate on flow and framing, not visual polish."
              >
                <MotionReveal>
                  <div className="grid gap-6 md:gap-8">
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
              <ArtifactSection
                id="usability-testing"
                headingLevel={2}
                roomy
                surface="secondary"
                title="Usability testing"
                corners="bottom"
                takeaway="Twelve users across two rounds (four priority, four culturally and linguistically diverse, two with disability, two general) produced eleven recommendations, all implemented."
              >
                <UsabilityFindings />
              </ArtifactSection>
            </Chapter>

            <Chapter
              id="decisions"
              title="Key design decisions"
              leafCorners="all"
              bandBelow
              lede="Every screen had one job: keep an anxious person moving toward care."
              leafPlate={
                /* cube studies: each screen resolved a different way — one
                   nested, one inscribed, one layered — until the flow held */
                <LeafPlate
                  src="/assets/chapter-illustrations/decisions-alpha.webp"
                  width={1200}
                  height={600}
                  heightClass="h-32 md:h-40"
                />
              }
            >
              {/* Full-bleed band on the hero's slate-teal stage (tone="dark"):
                  the chips read on the reading column while the screenshot stage
                  breaks out edge to edge, so the product shots land noticeably
                  larger and closer than the reading-column AnnotatedFrame
                  allowed, sharing the SymptomsHero's dark visual language. The
                  Chapter above owns the "Key design decisions" title, so no
                  heading/lede is passed here (no duplicate); the chapter owns the
                  #decisions anchor, so no id. */}
              <FeatureChips
                id="decisions-showcase"
                features={decisionFeatures}
                tone="dark"
              />
            </Chapter>

            <Chapter
              id="outcome"
              title="The outcome"
              leafCorners="top"
              lede="Completion climbed from 49% to 84%, clearing the industry benchmark the redesign set out to hit."
              leafPlate={
                /* the cube resolves: two dashed scaffolds on the left settle
                   into one solid, fully drawn figure on the right — the result
                   standing clear */
                <LeafPlate
                  src="/assets/chapter-illustrations/outcome-alpha.webp"
                  width={1200}
                  height={600}
                  heightClass="h-32 md:h-40"
                />
              }
            >
              {/* Reframe-manner payoff: the statement line echoes the intro
                  treatment, quieter so the one page hero line still leads. The
                  headline numbers live once, up top under "The result"; the
                  proof here is the system-level outcomes those numbers
                  unlocked. */}
              <Tile immersive corners="none">
                <MotionReveal>
                  <span
                    aria-hidden="true"
                    className="block h-1 w-10 rounded-full bg-primary md:w-12"
                  />
                  <p className="mt-6 max-w-[15em] font-heading text-[clamp(1.5rem,3.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
                    People finished the check, and left knowing what to do next.
                  </p>
                </MotionReveal>
                <OutcomeScorecard className="mt-10 md:mt-14" />
              </Tile>
              <Tile immersive corners="none">
                <div className="space-y-6">
                  <Prose>
                    The redesign also became the evidence base for what came next: a
                    native-app concept with a follow-up care plan for managing symptoms
                    at home, and the broader service-design initiative in Phase 2.
                  </Prose>
                  <MotionReveal>
                    <a
                      href="https://about.healthdirect.gov.au/resources/news/healthdirect-symptom-checker-gen2-paves-the-way-to-the-national-virtual-front-door"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Read Healthdirect&apos;s announcement of Gen 2
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                  </MotionReveal>
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
                      <h3 className={subsectionHeading}>{theme.title}</h3>
                      <p className="text-sm leading-relaxed text-foreground">
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
                        <h3 className={subsectionHeading}>{area.title}</h3>
                        <p className="text-sm leading-relaxed text-foreground">
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
