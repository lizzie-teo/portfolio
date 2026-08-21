"use client";

import {
  FeatureChips,
  type Feature,
  type FeatureChipsProps,
} from "@/app/components/FeatureChips";

/* What round 2 changed, as three before-and-after exhibits on the same chip band
   the findings above and the decisions below use.

   `"use client"`, and the data deliberately does not leave this file, for the
   same reason UsabilityFindings does not: the chip bodies are JSX, and JSX
   authored in a server module loses React's key-validation marks when it is
   serialised across the RSC boundary into a client component, so every
   `<strong>` and `<span>` in a body fragment arrives looking like an unkeyed
   child in a list and dev logs a key warning for each one.

   Four rules govern the presentation, carried over from the tiled exhibit this
   content used to live in:

   1. **Matched width, always.** Every capture in a chip takes the same track.
      Equal width on 1080px-wide captures is equal zoom, so the type in "before"
      and "after" is the same physical size and the comparison is fair rather
      than two differently scaled pictures. A two-shot chip takes a percentage
      track CAPPED at 300px: capped so a phone shot here reads at the same size
      as the pinned phone shots in the decisions showcase below (the two bands
      are one argument and a capture should not change size between them), and a
      percentage rather than a pixel pin so a pair always fits the stage below
      that ceiling — a comparison the reader has to swipe to complete is not one.
      Service guidance carries a third capture and so drops to the stage's
      240px fitting row, which swipes below 2xl; the before-and-after pair still
      fits the stage unswiped, and the swipe only reaches the second "after",
      which extends the claim rather than completing it.
   2. **Both states cut at the same place.** Every capture starts at the top of
      its page and runs off the bottom of the band, hard-clipped at the same
      height by the stage — the band's own treatment, applied equally to both
      states, so neither is favoured by the framing. The captures are whole
      pages, so where the two differ in length that difference is real, even
      though the band cannot show it below the cut.
   3. **A state marker per state, not per picture.** The per-capture `state`
      says which frame is the OLD one, so it belongs to a genuine
      before-and-after. Service distance shows two views of ONE state (the
      results list, and the filter panel that sets it), so it takes a single
      `groupState` caption laid across the top of both instead: setting the same
      word twice would read as a comparison between two things that do not
      differ. Neither takes the `shipped` accent, which means "and here is the
      one that shipped" and needs a pair to point at.
   4. **Nothing load-bearing is trapped in a bitmap.** The claim and the state
      labels are real DOM text, so the argument survives at 320px where the
      captures are only legible as structure.

   The bolded phrase in each claim is the load-bearing one, matching the findings
   band's evidence vocabulary. */
const testingChangedFeatures: Feature[] = [
  {
    id: "outcome-page",
    label: "See a GP outcome",
    body: [
      <>
        “What to do” was reworded so the services read as a recommendation, not
        a paragraph to work through.
      </>,
      <>
        It now{" "}
        <strong>opens with a single sentence telling you what to do</strong>, with
        the important words bolded so people can scan it instead of reading every
        line.
      </>,
      <>
        The services then <strong>follow as numbered options</strong>. Each one
        says what the service is, what it costs and how you get seen, with a link
        straight to it.
      </>,
    ],
    images: [
      {
        src: "/assets/healthdirect/before-after/see-doc-before.png",
        alt: "The original 'See a doctor within 2 hours' page, captured whole: the pink outcome banner, a 'What to do' heading, two paragraphs of advice, then one bullet list mixing Alternate GPs, Virtual Care Clinics and Urgent Care Clinics with their explanations, closed by a single 'About these services' link. Below the advice the page continues into a 'Find a service' postcode search, a Virtual Care Clinic panel, helpline guidance, a 'Check another symptom' prompt, and the standard healthdirect footer.",
        width: 1080,
        height: 10634,
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
        The modal now <strong>covers a single service</strong>, with{" "}
        <strong>headings set as the questions people actually asked</strong>:
      </>,
      /* The three headings stack as their own bulleted lines rather than running
         on in prose: they are the product's own wording, and a reader scanning
         the chip should take them in as a set.

         Block spans with a pseudo-element bullet, NOT a <ul> — FeatureChips
         wraps every body entry in a <p>, and a list inside a <p> is invalid
         nesting the browser would unpick. The marker hangs in the padding
         (`relative` + `absolute left-0`, text indented past it) so a heading
         that wraps at 320px aligns under its own first word rather than back
         under the bullet. Ink is dipped from the body so the markers read as
         punctuation rather than competing with the questions themselves; the
         colour inherits from the paragraph, so this works on the light band and
         the dark leaf without a second class. */
      <>
        <span className="relative block pl-4 before:absolute before:left-0 before:opacity-50 before:content-['•']">
          Do you need an appointment?
        </span>
        <span className="relative block pl-4 before:absolute before:left-0 before:opacity-50 before:content-['•']">
          How long is the wait?
        </span>
        <span className="relative block pl-4 before:absolute before:left-0 before:opacity-50 before:content-['•']">
          What does it cost?
        </span>
      </>,
      <>
        Answering them clearly helps people pick the right service, which
        supports the goal of reducing avoidable emergency presentations.
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
          summary: "Virtual Care Clinics, in questions.",
          shipped: true,
        },
      },
      /* A second "after" rather than a longer caption: the claim is that the
         question headings are a PATTERN, not one panel's wording, and the only
         way to show a pattern is to show it twice. Emergency Departments is the
         right second panel — it is the service the redesign is trying to steer
         people away from when a lighter option would do, so it is where the
         same three questions have to hold. */
      {
        src: "/assets/healthdirect/design-decisions/actionable-3b.png",
        alt: "The same 'Learn more' panel scoped to Emergency Departments, shown whole: a description of severe or life-threatening care, then the same question headings, 'Do I need an appointment?' answered 'No. Walk-ins always accepted', wait times, and cost answered 'Free for Medicare card holders'.",
        width: 1080,
        height: 2400,
        device: "mobile",
        state: {
          label: "After",
          summary: "Emergency Departments.",
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
        The list of nearby health services{" "}
        <strong>sorts by nearest instead of grouping by service type</strong>,
        and shows how far each clinic is from the set location.
      </>,
      <>
        <strong>The search radius is adjustable</strong> and starts at 50km. The
        wide default is deliberate: urgent care clinics are sparse, so a tight
        radius would hide them.
      </>,
      <>
        Anyone looking for other services, like a GP, can pull the radius in to
        2km.
      </>,
    ],
    // Both captures are the SAME state, so the marker belongs to the exhibit
    // rather than to either frame: one "Today" caption spans the row instead of
    // the same word being set twice, which would read as a comparison between
    // two things that do not differ. No `shipped` accent — that accent means
    // "and here is the one that shipped", and it takes a pair to point at.
    groupState: { label: "Today", summary: "Sorted by nearest, radius adjustable." },
    images: [
      {
        src: "/assets/healthdirect/design-decisions/actionable-find-ucc.png",
        alt: "The live service results for Urgent Care in Bowden: care-type filter chips with Urgent Care selected, a Filter button and a 'Sort by: Nearest' control, then a 'Search results' heading reading '50 results within 1166km', followed by result cards led by Total Urgent Care Norwood at 3.0km, each card carrying accessibility, bulk billing, opening hours and its distance.",
        width: 1080,
        height: 15705,
        device: "mobile",
      },
      {
        src: "/assets/healthdirect/before-after/Filters-results-after.png",
        alt: "The Filters panel over the results: an 'Open now' toggle, a 'Search radius' group offering 2km, 5km, 10km, 20km and 'more than 50km' with the widest option selected, then Billing and Appointment type groups, above a 'Show results' button.",
        width: 1080,
        height: 2400,
        device: "mobile",
        note: "The Filter button on the results screen opens this panel.",
      },
    ],
  },
];

/**
 * The band itself. Everything except the exhibits stays the caller's decision,
 * so the page keeps owning the anchor, heading, lede, and tone.
 */
export function TestingChangedBand(
  props: Omit<FeatureChipsProps, "features">
) {
  return <FeatureChips {...props} features={testingChangedFeatures} />;
}
