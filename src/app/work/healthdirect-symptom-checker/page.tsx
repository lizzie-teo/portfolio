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
import { TestingChangedBand } from "./TestingChanged";
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
      { id: "what-testing-changed", title: "What User Testing Changed" },
    ],
  },
  { id: "decisions", title: "Key Design Decisions" },
  { id: "outcome", title: "The Outcome" },
  { id: "whats-next", title: "What Came Next" },
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
    // This feature's phone frame runs the auto demo (useHotspotDemo). It is the
    // flow that needs one most — the capture is 1080×12910, so every trigger
    // here sits ~430px below the fold of the phone screen and a reader who never
    // scrolls the capture never learns it is tappable. Every other feature is
    // left reader-only until the pattern is signed off.
    //
    // The loop READS before it presses (demoScan below), then demonstrates ONE
    // option in depth: Urgent Care, steps 1 and 2. Showing all three explainers
    // was the first pass and it was the wrong shape — six presses ran past a
    // minute, and opening every modal in turn answers a question the reader has
    // not been asked yet. The scan carries the recommendation ORDER, which is
    // the actual design decision this chapter argues; one worked example then
    // shows what a tap does. Urgent care is the right example because it is the
    // middle option, the one the design steers people TOWARD when virtual care
    // cannot treat them and an ED would be overkill.
    //
    // The other four triggers keep their coordinates and stay fully tappable by
    // hand — they simply carry no `demoStep`. Re-widening the demo later is
    // adding numbers back, nothing more.
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
        demoStep: 1,
        label: "More info: Urgent Care Clinics",
      },
      {
        onImage: 0,
        x: 9.5,
        y: 23,
        w: 59,
        h: 1.1,
        goToImage: 4,
        demoStep: 2,
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
    // The read-through, run once at the top of each loop before anything is
    // pressed: the outcome verdict, then the three care options in the order
    // the design recommends them. Coordinates measured off actionable-1.png
    // (1080×12910) — the three option headings land within 0.4% of the info
    // hotspots above, which is the check that the mapping is right.
    //
    // Boxes rather than points so the hand centres on the text it is reading
    // and the region says what is being read. x spans the heading text only,
    // not the full column, so the hand rests over words rather than whitespace.
    demoScan: [
      {
        onImage: 0,
        x: 5,
        y: 4.2,
        w: 55,
        h: 1.8,
        label: "Seek immediate medical care",
      },
      { onImage: 0, x: 5, y: 12.9, w: 62, h: 1.3, label: "1. Virtual Care Clinic" },
      { onImage: 0, x: 5, y: 18.6, w: 65, h: 1.3, label: "2. Urgent Care Clinics" },
      {
        onImage: 0,
        x: 5,
        y: 24.3,
        w: 82,
        h: 1.3,
        label: "3. Emergency Departments",
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
          </>
        ),
        /* A credits block, not a paragraph: this used to be three sentences of
           ownership ("Sole designer on the redesign, alongside…"), and before
           that a Phase 1 / Phase 2 split whose second phase has been parked
           (see _parked/Phase2Chapter.tsx). Three labelled facts scan in the time
           a hiring manager actually gives a hero, and the page below is what
           proves the ownership claim the sentences were making. The impact area
           carries what the "Public Health" hero chip used to say, so the chip is
           gone rather than repeating a line that sits four rows below it. */
        meta: [
          { label: "Role", value: "Product Design Consultant" },
          { label: "Impact area", value: "Public health" },
          {
            label: "Focus",
            bullets: [
              "Content Strategy",
              "User Experience",
              "User Testing",
              "User Interface Detailing",
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
            proofEyebrow="User response"
            /* The proof under the reframe is a person, not a number: the
               published figures still close the case study in the outcome
               chapter, and repeating them up here made the opening slab read
               as a results summary before the problem had been stated. */
            quote={{
              text: "“It definitely narrows things down really well. And even though I wouldn’t self diagnose anything usually, it gave perspective on how I might feel if I was properly ill, so I actually had an excuse to avoid the doctor which was great to me.”",
              /* No `source`: the eyebrow above already says whose response
                 this is, and a second label under the quote would repeat it. */
            }}
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
              {/* Reversed against the reading tiles: the section takes the
                  light teal quiet panel and the criteria cells come back in
                  white, so the six targets read as objects set on the brand
                  field rather than tints on white paper. */}
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
              {/* Caps the upper slab. The band below bleeds edge to edge, so
                  the run of tiles that opened with the chapter leaf ends here
                  rather than carrying on past it. */}
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
              {/* The bridge into the decisions chapter: what testing found,
                  stated through what shipped in answer to it. A separate
                  "Usability testing" findings band used to run above this one
                  (parked at _parked/UsabilityFindings.tsx); it argued the same
                  research twice, once as findings and once as changes, so the
                  page now carries only the half that shows the product.

                  `tone="dark"` steps this band onto the leaf and hands the
                  reader onto the decisions showcase below, which is the same
                  dark band — the shared surface is the argument that what
                  shipped here and what shipped there are one body of work.

                  A full-bleed band cannot sit inside a bordered tile, so this is
                  a direct child of the chapter rather than an ArtifactSection.
                  It owns the #what-testing-changed anchor and its own heading;
                  the takeaway ArtifactSection would have set below it is folded
                  into the lede, because FeatureChips leads with its framing
                  sentence and a closing line under a full-bleed media stage
                  would land after the reader has already left for the next
                  chapter. No `reserveNavLane`, matching the sibling usage in the
                  decisions chapter — this page's shell runs
                  `reserveNavLane={false}` and its dock floats over the page. */}
              <TestingChangedBand
                id="what-testing-changed"
                heading="What user testing changed"
                lede="Twelve users across two rounds (four priority, four culturally and linguistically diverse, two with disability, two general) produced eleven recommendations, all implemented. Below are a few examples."
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
              {/* Motion tiers (§7): the heading is structure and slips; the
                  scorecard's count-up is the explanatory motion this section
                  actually earns; the rule and the link are neither, so they sit
                  static. This tile used to fade its heading and its link up in
                  two separate MotionReveals with the scorecard between them, so
                  one tile arrived in three unrelated beats at three different
                  scroll positions and the heading wore the same gesture as a
                  trailing link. */}
              {/* Reversed to match the criteria scorecard one chapter above —
                  light teal field, white cells. The two scorecard sections are
                  bar and result and have to carry the same surface, or the
                  answer stops looking like an answer to the question. */}
              <Tile surface="secondary" immersive corners="bottom">
                <span
                  aria-hidden="true"
                  className="block h-1 w-10 rounded-full bg-primary md:w-12"
                />
                {/* An `h2` on `sectionHeading`, matching "What success had to
                    look like" above the criteria scorecard: per §12 a
                    statement line that titles an artifact block is that
                    section's heading, so it takes the section rung rather
                    than a display size of its own. It was a `<p>` on a
                    bespoke clamp, which both escaped the ladder and left the
                    outcome chapter with no in-flow heading in the outline. */}
                {/* Word slip, matching that sibling heading — the two scorecard
                    sections are the same kind of block and should arrive the
                    same way. It is the longest heading on the page at eleven
                    words, which `intervalFor` handles by tightening the stagger
                    to 0.03s; the cascade still resolves in 0.5s, inside the
                    section-heading budget. */}
                {/* No colour class: `sectionHeading` carries the role's own
                    ink (--heading, this theme's darkest teal). A local
                    `text-foreground` here would silently opt this one
                    heading out of it. */}
                <MaskReveal
                  as="h2"
                  mode="word"
                  duration="fast"
                  className={`mt-6 max-w-[15em] ${sectionHeading}`}
                  text="People finished the check, and left knowing what to do next."
                />
                <OutcomeScorecard className="mt-10 md:mt-14" />
                <a
                  href="https://about.healthdirect.gov.au/resources/news/healthdirect-symptom-checker-gen2-paves-the-way-to-the-national-virtual-front-door"
                  target="_blank"
                  rel="noopener noreferrer"
                  /* --secondary-foreground, not the usual --primary link ink.
                     --primary #007f78 is tuned to clear 4.5:1 on the page
                     background (#F3F7F7) and drops to 4.35:1 on the mint this
                     tile now carries, which fails AA for a text-sm link.
                     --secondary-foreground #006f69 is the same green family one
                     step deeper and is the token defined as readable on this
                     surface: 5.4:1. The rule above stays --primary — it is
                     aria-hidden decoration, judged at the 3:1 non-text bar. */
                  className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground underline-offset-4 hover:underline md:mt-14"
                >
                  Read Healthdirect&apos;s announcement of Gen 2
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
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
