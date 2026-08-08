import type { Metadata } from "next";
import { ArtifactSection } from "@/app/components/ArtifactSection";
import { CaseStatement } from "@/app/components/CaseStatement";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import {
  Chapter,
  chapterGap,
  LeafPlate,
  readingTilePadding,
  sectionHeading,
  tileGap,
} from "@/app/components/Chapter";
import { ChapterMarker } from "@/app/components/ChapterMarker";
import { MaskReveal } from "@/app/components/MaskReveal";
import { MediaFrame } from "@/app/components/MediaFrame";
import { MotionReveal } from "@/app/components/MotionReveal";
import { ArrowUpRight } from "lucide-react";
import { Tile } from "@/app/components/Tile";
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
import { NativeConceptFlow } from "./NativeConceptFlow";
import { usabilityFindings } from "./UsabilityFindings";
import { SymptomsHero } from "./SymptomsHero";

const slug = "healthdirect-symptom-checker";

export const metadata: Metadata = caseStudyMetadata(slug);

const chapters: CaseChapter[] = [
  { id: "introduction", title: "Introduction" },
  { id: "problem", title: "The Problem" },
  {
    id: "approach",
    title: "The Approach",
    sections: [
      { id: "engine-audit", title: "AI Engine Audit" },
      { id: "landscape-review", title: "Landscape Review" },
      { id: "user-journey", title: "User Journey" },
      { id: "information-architecture", title: "Information Architecture" },
      { id: "sketches", title: "Sketches" },
      { id: "usability-testing", title: "Usability Testing" },
      { id: "what-testing-changed", title: "What Testing Changed" },
    ],
  },
  { id: "decisions", title: "Key Design Decisions" },
  { id: "outcome", title: "The Outcome" },
  { id: "whats-next", title: "What Came Next" },
];

/* What round 2 changed, as three before-and-after exhibits on the same chip band
   the findings above and the decisions below use.

   Four rules govern the presentation, carried over from the tiled exhibit this
   content used to live in:

   1. **Matched width, always.** Every capture takes the stage's pair track,
      including the solo one, which keeps that track rather than growing into
      the space a missing "after" left. Equal width on 1080px-wide captures is
      equal zoom, so the type in "before" and "after" is the same physical size
      and the comparison is fair rather than two differently scaled pictures.
      The track is a percentage rather than a pixel pin so a pair always fits
      the stage: a comparison the reader has to swipe to complete is not one.
   2. **Both states cut at the same place.** Every capture starts at the top of
      its page and runs off the bottom of the band, hard-clipped at the same
      height by the stage — the band's own treatment, applied equally to both
      states, so neither is favoured by the framing. The captures are whole
      pages, so where the two differ in length that difference is real; the band
      cannot show it, which is why the footnote says it in words.
   3. **Honest framing.** The one recommendation that has not shipped gets a
      single state labelled "Today" and no `shipped` accent, rather than a mock
      in an "after" frame: an absent frame is honest where an invented one would
      read as delivered work.
   4. **Nothing load-bearing is trapped in a bitmap.** The claim, the state
      labels, and the footnotes are real DOM text, so the argument survives at
      320px where the captures are only legible as structure.

   The bolded phrase in each claim is the load-bearing one, matching the findings
   band's evidence vocabulary. */
const testingChangedFeatures: Feature[] = [
  {
    id: "outcome-page",
    label: "See a GP outcome",
    body: [
      <>
        Round 2 asked for one change here, a copy edit to “What to do” so the
        different service categories reached people as a recommendation rather
        than a paragraph to work through.
      </>,
      <>
        The rebuild <strong>says what to do in a sentence</strong>, then{" "}
        <strong>lays the services out as numbered options</strong>. Each one says
        what the service is, what it costs and how you get seen, and links
        straight to it. Before, the three were bullets in a single list, and one
        Service Finder link at the top was the only way in.
      </>,
    ],
    footnote:
      "Both states are shown from the top of the page and run on past the bottom of this band. The new page is the longer of the two: every option now carries the detail that used to sit behind one shared link.",
    images: [
      {
        src: "/assets/healthdirect/before-after/see-doc-before.webp",
        alt: "The original 'See a doctor within 2 hours' page, from the top of the screen to the end of the options: the pink outcome banner, a 'What to do' heading, two paragraphs of advice, then one bullet list mixing Alternate GPs, Virtual Care Clinics and Urgent Care Clinics with their explanations, closed by a single 'About these services' link.",
        width: 1080,
        height: 2530,
        device: "mobile",
        state: { label: "Before", summary: "Advice, then one mixed list." },
      },
      {
        src: "/assets/healthdirect/before-after/see-doc-after.webp",
        alt: "The redesigned page, from the top of the screen to the end of the options: the same outcome banner, a 'What to do' summary card stating you need to see a doctor within the next 2 hours, then three numbered options, 1. Virtual Care Clinics, 2. GP and 3. Urgent Care Clinics, each with bullets on what the service is, what it costs and how you get seen, and its own link.",
        width: 1080,
        height: 3970,
        device: "mobile",
        state: {
          label: "After",
          summary: "A summary, then three options.",
          shipped: true,
        },
      },
    ],
  },
  {
    id: "guidance-panel",
    label: "Service guidance",
    body: [
      <>
        Users found this panel helpful, but round 2 heard the same ask twice
        over: they wanted it more targeted. Several expected it to name the
        services near them, or give them a number to call.
      </>,
      <>
        The rebuild <strong>scopes the panel to a single service</strong> and{" "}
        <strong>sets the headings as the questions people asked</strong>: whether
        an appointment is needed, wait times, cost. Each answer leads with its
        verdict, so the first word or two is usually the whole answer.
      </>,
    ],
    images: [
      {
        src: "/assets/healthdirect/before-after/aboutservices-before.png",
        alt: "The original panel, titled 'About these services', shown whole: Virtual Care Clinics, Urgent Care Clinics and Emergency Departments each described in a flat paragraph and a bullet list, one after another.",
        width: 1080,
        height: 3249,
        device: "mobile",
        state: { label: "Before", summary: "Every service, described in turn." },
      },
      {
        src: "/assets/healthdirect/before-after/aboutservices-after.png",
        alt: "The redesigned panel, titled 'Learn more' and scoped to Virtual Care Clinics, shown whole: a short description, then question headings including 'Do I need an appointment?' answered with 'No' in the first word.",
        width: 1080,
        height: 2400,
        device: "mobile",
        state: {
          label: "After",
          summary: "One service, answered in questions.",
          shipped: true,
        },
      },
    ],
  },
  {
    id: "service-distance",
    label: "Service distance",
    body: [
      <>
        Round 2 asked for one thing the redesign has not answered yet: a way to
        filter services by how far away they are, rather than only sorting by it.
      </>,
      <>
        Sorting by nearest shipped.{" "}
        <strong>
          A distance filter is still open, pending technical feasibility.
        </strong>{" "}
        Until it lands the list orders results nearest first but nothing bounds
        how far it reaches, so a search from one Adelaide suburb returns fifty
        results within 1166km.
      </>,
    ],
    footnote:
      "Shown as it stands today, with no second frame beside it. It is the one round 2 recommendation without a shipped answer, kept here rather than dropped.",
    images: [
      {
        src: "/assets/healthdirect/before-after/nearest-sort.webp",
        alt: "The live service results for Urgent Care in Bowden: a Filter button, a 'Sort by: Nearest' control, then a 'Search results' heading reading '50 results within 1166km', followed by the whole first result card, Total Urgent Care Norwood, at 3.0km.",
        width: 1080,
        height: 2115,
        device: "mobile",
        // No `shipped`: this state is the present, not an answer. The accent
        // means "and here is what shipped", and nothing has.
        state: { label: "Today", summary: "Sorted by nearest, unbounded." },
      },
    ],
  },
];

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
      "Every question is one row and one decision, with three targets big enough for a thumb. No dropdowns, no typing, nothing that needs a steady hand.",
      "'Don't know' sits beside Yes and No, so nobody has to guess their way forward and the engine gets an honest gap instead of an invented answer.",
      "The four stages stay named at the top of every screen. Tested with people with disability and with users wary of technology, and built to meet WCAG for screen readers and keyboard use.",
    ],
    // One capture, no hotspot: the 'More info' explainer story (and its modal
    // capture) belongs to Guided help below, which is the decision it evidences.
    // This chip is about the answer row itself.
    images: [
      {
        src: "/assets/healthdirect/design-decisions/accessibiilty-1.png",
        alt: "The Background step on mobile with a four-stage progress stepper and health background questions, each answerable in one tap",
        width: 1080,
        height: 7866,
        device: "mobile",
        displayWidth: 300,
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
    //
    // All six carry a `demoStep`, so this feature's phone frame runs the auto
    // demo (Hotspot.demoStep / useHotspotDemo). It is the flow that needs one
    // most — the capture is 1080×12910, so every trigger here sits ~430px below
    // the fold of the phone screen and a reader who never scrolls the capture
    // never learns it is tappable — and it is the only flow that exercises both
    // step kinds, popup explainer and paged navigation. Steps follow the
    // authored order, so the loop walks the results page option by option.
    // Every other feature is left reader-only until the pattern is signed off.
    hotspots: [
      {
        onImage: 0,
        x: 3,
        y: 12.6,
        w: 72,
        h: 1.9,
        popupImage: 1,
        demoStep: 1,
        label: "More info: Virtual Care Clinic",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 17.35,
        w: 56,
        h: 1.15,
        goToImage: 2,
        demoStep: 2,
        label: "Find a Virtual Care Clinic",
      },
      {
        onImage: 0,
        x: 3,
        y: 18.6,
        w: 75,
        h: 1.9,
        popupImage: 3,
        demoStep: 3,
        label: "More info: Urgent Care Clinics",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 23,
        w: 59,
        h: 1.1,
        goToImage: 4,
        demoStep: 4,
        label: "Find an Urgent Care Clinic",
      },
      {
        onImage: 0,
        x: 3,
        y: 24.2,
        w: 89,
        h: 2.0,
        popupImage: 5,
        demoStep: 5,
        label: "More info: Emergency Departments",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 29.1,
        w: 72,
        h: 1.3,
        goToImage: 6,
        demoStep: 6,
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
              The redesign integrated{" "}
              <span className="font-semibold text-leaf-highlight">
                Infermedica&apos;s AI engine
              </span>{" "}
              into a flow an anxious person could actually finish, without it
              ever sounding like a diagnosis.
            </p>
          </>
        ),
        /* Flat, not grouped: the role block used to split into Phase 1 and
           Phase 2 columns, and Phase 2 has been parked (see
           _parked/Phase2Chapter.tsx). One list of three also drops the hero
           back to the plain two-column grid the shell uses for Macquarie.
           Every line states ownership rather than naming a discipline — the IA
           flow and the screens below already prove she did IA and UI; what the
           artifacts can't show is that nobody else was making those calls. */
        meta: [
          {
            label: "My role",
            items: [
              "Sole designer on the redesign, alongside a product manager, clinical leads, and Infermedica's engine team",
              "Led it end to end: discovery, architecture, question flow, and final screens",
              "Set the accessibility and plain language bar, then tested the build against it",
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
                <MaskReveal
                  as="h2"
                  mode="word"
                  duration="fast"
                  className={sectionHeading}
                  text="What success had to look like"
                />
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
              {/* Caps the upper slab. The findings band below bleeds edge to
                  edge, so the run of tiles that opened with the chapter leaf
                  ends here rather than carrying on past it. */}
              <ArtifactSection
                id="sketches"
                headingLevel={2}
                roomy
                title="Sketches"
                corners="bottom"
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
              {/* The findings run on the same band as the decisions showcase
                  further down the page — same component, same chip accordion
                  and collapsing screenshot stage — because they are the two
                  halves of one argument: what testing found, and what shipped
                  in answer. A full-bleed band cannot sit inside a bordered tile,
                  so this is a direct child of the chapter rather than an
                  ArtifactSection, and it owns the #usability-testing anchor and
                  its own heading and takeaway.

                  `tone="light"`: the dark band is the decisions chapter's one
                  signature moment and repeating it here would spend it twice.
                  Light also keeps the tinted research surface this section
                  already had, which the "What testing changed" tile below
                  shares. No `reserveNavLane`, matching the decisions usage —
                  this page's shell runs `reserveNavLane={false}` and its dock
                  floats over the page. */}
              <FeatureChips
                id="usability-testing"
                features={usabilityFindings}
                heading="Usability testing"
                lede="Twelve users across two rounds (four priority, four culturally and linguistically diverse, two with disability, two general) produced eleven recommendations, all implemented."
                tone="light"
              />
              {/* The bridge into the decisions chapter: the findings band above
                  is research, this is what shipped in answer to it. The two run
                  on the same component for that reason — the reader meets one
                  finding, then the change it produced, in the same chip-and-stage
                  gesture, so the pairing is felt rather than argued.

                  `tone="dark"` is what separates them. The findings band is
                  light because it is research; this one steps onto the leaf
                  because it is product, and it hands the reader onto the
                  decisions showcase below, which is the same dark band. The two
                  dark bands are deliberately adjacent: the chapter leaf between
                  them is the only pause, and the shared surface is the argument
                  that what shipped here and what shipped there are one body of
                  work.

                  A full-bleed band cannot sit inside a bordered tile, so this is
                  a direct child of the chapter rather than an ArtifactSection.
                  It owns the #what-testing-changed anchor and its own heading;
                  the takeaway ArtifactSection would have set below it is folded
                  into the lede, because FeatureChips leads with its framing
                  sentence and a closing line under a full-bleed media stage
                  would land after the reader has already left for the next
                  chapter. No `reserveNavLane`, matching the two sibling usages. */}
              <FeatureChips
                id="what-testing-changed"
                features={testingChangedFeatures}
                heading="What testing changed"
                lede="Round 2 came back as structure: the outcome page turned prose into a decision list, and the guidance panel narrowed to one service answered in questions."
                tone="dark"
              />
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
              {/* One tile closes the chapter: the statement, the outcomes it
                  unlocked, and the link out to Healthdirect's own announcement
                  of the shipped release. The native app concept used to trail
                  this chapter as a flat composite; it now has its own chapter
                  below, because a future state prototype should not be read as
                  part of the result. */}
              <Tile immersive corners="bottom">
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
                <MotionReveal>
                  <a
                    href="https://about.healthdirect.gov.au/resources/news/healthdirect-symptom-checker-gen2-paves-the-way-to-the-national-virtual-front-door"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline md:mt-14"
                  >
                    Read Healthdirect&apos;s announcement of Gen 2
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </MotionReveal>
              </Tile>
            </Chapter>

            {/* The coda. No leaf plate: the four chapters above each open on
                their own engraving, and there is no fifth drawing — opening
                this one plainly marks it as an epilogue rather than a fifth
                act, which is also what it is. */}
            <Chapter
              id="whats-next"
              title="What came next"
              leafCorners="top"
              lede="The redesign became the evidence base for a native app concept, where the check ends in a care plan you follow at home."
            >
              {/* Not `immersive`: the collapse exists to lift a section that
                  would otherwise rest small against the grout, and this tile is
                  already well past a viewport at every width. Wrapping it in
                  CollapsingLeaf only bought a pool of empty tile below the
                  phone on tall screens. */}
              <Tile corners="bottom" className={readingTilePadding}>
                {/* The module owns the whole composition, heading included: the
                    concept screens are a 9:20 handset, and a section title set
                    full width above it would leave the tile's middle empty. It
                    reads as a spread instead, heading and flow in one column
                    beside the device. */}
                <NativeConceptFlow
                  eyebrow="Concept, not shipped"
                  heading="Care that keeps going after the check"
                  lede="It was pitched alongside the redesign and never built. Five screens carry the idea: the app already knows the household, asks the same short questions, then stays for the days after."
                />
              </Tile>
            </Chapter>

      </div>
      <ChapterDock chapters={chapters} className="hidden xl:block" />
    </CaseStudyShell>
  );
}
