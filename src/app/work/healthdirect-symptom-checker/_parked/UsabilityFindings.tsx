"use client";

import {
  FeatureChips,
  type Feature,
  type FeatureChipsProps,
} from "@/app/components/FeatureChips";

/**
 * The three round-2 usability findings, authored for the shared `FeatureChips`
 * band — the same component and layout the "Key design decisions" chapter uses,
 * so research and outcome read as siblings on this page rather than as two
 * unrelated evidence widgets. This module owns the data AND renders the band;
 * page.tsx passes the section heading, lede, and tone.
 *
 * `"use client"`, and the data deliberately does not leave this file. The chip
 * bodies are JSX, and JSX authored in a server module loses React's key-validation
 * marks when it is serialised across the RSC boundary into a client component:
 * every `<strong>` inside a body fragment arrives on the other side looking like
 * an unkeyed child in a list, and dev logs one "Each child in a list should have
 * a unique key prop" per element. Authoring the elements inside the client
 * boundary is what fixes it — adding keys to each `<strong>` would only paper
 * over it, and the next author to bold a phrase would reintroduce the warning.
 * Any future FeatureChips dataset carrying JSX belongs in a client module too.
 *
 * Each finding is one chip. The chip body carries the whole argument as real
 * text — the claim with its load-bearing phrase bolded, then one paragraph per
 * capture led by that capture's verdict in bold — because the desktop stage
 * shows pictures only: it has no captions, so a verdict that lived beside an
 * image would be invisible on the widest screens. Reading the chip alone is the
 * complete finding; the stage is the evidence for it.
 *
 * Evidence keeps the overview-plus-detail pairing the previous carousel
 * established. The whole screen users saw leads the group so a reader can place
 * the finding on the page, and the annotated fragments follow in the order
 * their paragraphs appear.
 */

const A = "/assets/healthdirect/usability-tests";

/**
 * The stage sizing model, as two numbers rather than seven judgement calls.
 *
 * Every capture sets an explicit `displayWidth`, which puts the group on
 * FeatureChips' fixed-width path: the group centres in the stage when it fits
 * and snap-swipes when it doesn't, so a capture is never cropped to fit.
 *
 *   SCREEN (260px) — a whole staged screen. It is the OVERVIEW: orientation for
 *   where the finding sits on the page, not something to read, so it sits a
 *   step below the fragments rather than matching the decisions band's 300px
 *   phones. These are ~2.3:1 portrait, so they run past the stage floor and
 *   bleed off its bottom edge, hard-clipped, the way every capture in the
 *   decisions band does. (They are also 560px exports against the decisions
 *   band's 1080px ones, so at 260 their UI still renders larger than a
 *   decisions phone at 300 — the smaller number is not a smaller picture.)
 *
 *   FRAGMENT (320px) — a crop of one element, and the DETAIL: visibly the
 *   larger plate, because it is the thing being examined. 320 is a floor set by
 *   legibility, not composition: the two dense text crops are 1080px wide, so
 *   below about 300 their body copy drops under 10px on screen and the evidence
 *   stops being evidence.
 *
 * The fragments' own heights then do the rest: a banner is a short strip, a
 * wall of explanatory text is a tall block, and that difference IS the finding,
 * so the row is deliberately ragged along its bottom.
 *
 * The budget is hard, and it is why a three-capture group swipes on a mid-size
 * desktop: the chip column, the container gutters, and the stage's own padding
 * spend ~530px before the first capture, leaving roughly 760px at 1280 and
 * 1030px at 1600 against a 996px group. Shrinking to fit at 1280 would put the
 * dense crops under the legibility floor above, so the group swipes instead —
 * the same fallback the decisions band's own multi-shot group takes at the same
 * widths.
 */
const SCREEN = 260;
const FRAGMENT = 320;

/**
 * `device` is the mobile branch's framing switch, not a claim about where the
 * capture came from. `"mobile"` wears a phone bezel with a bounded inner
 * scroll; `"desktop"` renders frameless at its natural ratio. The whole screens
 * are phones and take the frame. The fragments are NOT screens — a 2.3:1 banner
 * strip letterboxed inside a 9:20 handset would read as a broken screenshot —
 * so they render frameless. On the desktop stage the field has no effect at
 * all, because every capture here sets `displayWidth`.
 */
const usabilityFindings: Feature[] = [
  {
    id: "seek-urgent-care",
    label: "Urgent care outcome",
    body: [
      <>
        Users read this outcome as triage, with services listed in order of
        recommendation. In a real emergency the same page{" "}
        <strong>tested as too wordy</strong>, and{" "}
        <strong>
          heavier still for new arrivals and lower English literacy
        </strong>
        .
      </>,
      // The run after the lead-in is a string expression, not JSX text,
      // because it quotes on-screen copy: JSX text containing an `&apos;`
      // entity loses the space that precedes it once the compiler splits the
      // node, so "The outcome." and "The 'seek…" ran together. Same reason in
      // the "Misfired" paragraph below. Every other paragraph here is ordinary
      // JSX text.
      <>
        <strong>The outcome.</strong>
        {
          " The 'seek immediate medical care' result, read as the next step for the situation."
        }
      </>,
      <>
        <strong>Too wordy.</strong> Three services, each with its own paragraph.
        Under real urgency this was more reading than anyone wanted.
      </>,
    ],
    images: [
      {
        src: `${A}/round-2-seek-context.webp`,
        alt: "The whole urgent care outcome screen: the pink 'Seek immediate medical care' banner at the top, the list of services beneath it, and the important information section further down.",
        width: 560,
        height: 1296,
        device: "mobile",
        displayWidth: SCREEN,
      },
      {
        src: `${A}/round-2-seek-outcome-banner.webp`,
        alt: "Pink outcome banner reading 'Seek immediate medical care' with a medical cross icon.",
        width: 1076,
        height: 463,
        device: "desktop",
        displayWidth: FRAGMENT,
      },
      {
        src: `${A}/round-2-seek-service-list.webp`,
        alt: "The service list: Virtual Care Clinics, Urgent Care Clinics and Emergency Departments, each with a paragraph of explanation.",
        width: 1080,
        height: 1265,
        device: "desktop",
        displayWidth: FRAGMENT,
      },
    ],
  },
  {
    id: "important-information",
    label: "Important information",
    body: [
      <>
        Users found the guidance helpful, but several{" "}
        <strong>expected it to be more targeted</strong>. A few opened the panel
        expecting <strong>details for the services near them</strong>, not a
        general explanation of what each service is.
      </>,
      <>
        <strong>Generic, not local.</strong> Every service explained in general
        terms. Nobody was told which clinic to go to, or given a number to call.
      </>,
    ],
    images: [
      {
        src: `${A}/round-2-guidance-context.webp`,
        alt: "The whole 'About these services' screen: the important information section opened to its full depth, section after section of explanatory text about virtual care, urgent care and emergency departments.",
        width: 560,
        height: 1296,
        device: "mobile",
        displayWidth: SCREEN,
      },
      {
        src: `${A}/round-2-guidance-depth.webp`,
        alt: "The 'About these services' panel: a full screen of dense explanatory text describing Virtual Care Clinics, Urgent Care Clinics and Emergency Departments.",
        width: 1080,
        height: 1760,
        device: "desktop",
        displayWidth: FRAGMENT,
      },
    ],
  },
  {
    id: "see-a-gp",
    label: "See a GP outcome",
    body: [
      <>
        The Service Finder carried people to their next step. But{" "}
        <strong>
          a strict two hour window read as more urgent than the words intended
        </strong>
        , the reverse of the urgent care result.
      </>,
      <>
        <strong>Misfired.</strong>
        {
          " 'See a doctor within 2 hours' landed as more alarming than 'seek immediate medical care', the opposite of the intent."
        }
      </>,
      <>
        <strong>What worked.</strong> The Service Finder moved people straight
        to a nearby option, though a few needed pointing toward it.
      </>,
    ],
    images: [
      {
        src: `${A}/round-2-see-a-doctor-context.webp`,
        alt: "The whole see a GP outcome screen: the pink 'See a doctor within 2 hours' banner at the top, followed by the Service Finder widget and the important information section.",
        width: 560,
        height: 1289,
        device: "mobile",
        displayWidth: SCREEN,
      },
      {
        src: `${A}/round-2-see-a-doctor-banner.webp`,
        alt: "Pink outcome banner reading 'See a doctor within 2 hours'.",
        width: 734,
        height: 340,
        device: "desktop",
        displayWidth: FRAGMENT,
      },
      {
        src: `${A}/round-2-service-finder.webp`,
        alt: "The 'Find a service' widget: a suburb or postcode field prefilled with Bowden SA 5007 and a Search button.",
        width: 984,
        height: 702,
        device: "desktop",
        displayWidth: FRAGMENT,
      },
    ],
  },
];

/**
 * The band itself. Everything except the findings stays the caller's decision,
 * so the page keeps owning the anchor, heading, lede, and tone.
 */
export function UsabilityFindingsBand(
  props: Omit<FeatureChipsProps, "features">
) {
  return <FeatureChips {...props} features={usabilityFindings} />;
}
