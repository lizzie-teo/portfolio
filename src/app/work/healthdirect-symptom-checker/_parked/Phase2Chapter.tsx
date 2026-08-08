/* PARKED — not rendered anywhere.
 *
 * This was the "Phase 2 — The ecosystem" chapter of the Healthdirect symptom
 * checker case study. It was cut from that page in Aug 2026, not because the
 * material is weak but because it has no traceable outcome: the initiative
 * produced a roadmap, and whether Healthdirect acted on it is unknown. Sitting
 * directly below Phase 1's 49% → 84% completion figure, an untraceable ending
 * read as the point where the evidence ran out.
 *
 * Kept intact because the strongest parts deserve a home in a future
 * research-led case study of their own:
 *   - the insight "more information doesn't mean more confidence under stress"
 *   - the five stress principles (a point of view, not a process)
 *   - the consumer quotes, which are specific and real
 *   - the two annotated service concepts (ArtifactViewer regions)
 * The weaker parts — the purposes list, the roadmap's generic focus areas, and
 * the four soft outcome bullets — are kept only so the section can be read back
 * whole. They should not survive into whatever this becomes.
 *
 * The `_parked` folder is a Next.js private folder (underscore prefix), so it
 * is excluded from routing. Nothing imports this file.
 *
 * Note: `Chapter` renders an `id` anchor. If this is ever restored, the parent
 * page's `chapters` nav array needs its "phase-2" entry and the three
 * subsection entries (research-themes, service-concepts, roadmap) added back.
 */

import { ArtifactSection } from "@/app/components/ArtifactSection";
import { ArtifactViewer } from "@/app/components/ArtifactViewer";
import { Chapter, subsectionHeading } from "@/app/components/Chapter";
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

export function Phase2Chapter() {
  return (
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
  );
}
