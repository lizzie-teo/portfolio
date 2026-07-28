/*
 * THROWAWAY LAB — FeatureChips full-bleed band. Scratch only.
 *
 * Not linked from anywhere, never shipped: this route 404s in production and is
 * marked noindex. It reproduces the case-study shell's container context — an
 * `overflow-x-clip` <main> wrapping the shell's padded, max-width container —
 * so the component's full-bleed break-out (`left-1/2 w-screen -translate-x-1/2`)
 * is exercised exactly as it would be inside a case study. A component rendered
 * in a bare page can't reveal a gutter break-out or horizontal-scroll bug.
 *
 * Feature set uses real Healthdirect screenshots, varying the count per feature
 * (1 / 2 / 1 / 3) so the media composition logic is exercised. Dimensions are
 * the assets' real pixel sizes.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureChips, type Feature } from "../../components/FeatureChips";

export const metadata: Metadata = {
  title: "Feature chips direction — lab",
  robots: { index: false, follow: false },
};

const A = "/assets/healthdirect";

const features: Feature[] = [
  {
    id: "result",
    label: "The result",
    heading: "Advice people can act on",
    body: [
      "Every check ends with a clear recommendation and a timeframe, so a person knows whether to rest at home, book a GP, or seek urgent care.",
      "The result reads like plain advice from a clinician rather than a list of probabilities, which is what people said they wanted at an anxious moment.",
    ],
    images: [
      {
        src: `${A}/triage-results-tablet.webp`,
        alt: "A person holding a tablet showing a triage result that recommends consulting a doctor within 24 hours",
        width: 1910,
        height: 930,
        device: "desktop",
      },
    ],
  },
  {
    id: "web",
    label: "On the web",
    heading: "Answer at your own pace",
    body: [
      "The web journey moves through background, symptoms, and assessment one step at a time, holding a single question in focus so nothing feels rushed.",
      "The same layout reflows from a wide desktop down to a phone without losing its place, so a person can start on one screen and finish on another.",
    ],
    images: [
      {
        src: `${A}/symptoms-step-desktop-mobile.webp`,
        alt: "The symptoms step of the web symptom checker shown side by side on desktop and mobile",
        width: 2500,
        height: 1334,
        device: "desktop",
      },
      {
        src: `${A}/symptoms-and-conclusion.webp`,
        alt: "The desktop symptoms question with a confirmation modal for the first completed step",
        width: 2500,
        height: 1814,
        device: "desktop",
      },
    ],
  },
  {
    id: "app",
    label: "In the app",
    heading: "A home for every profile",
    body: [
      "In the native app, families keep a profile for each person, so a parent can run a check for a child and hold the history in one place.",
      "Symptom checks, saved advice, and self care plans all sit behind the same tab bar, so the next step is always a tap away.",
    ],
    images: [
      {
        src: `${A}/mobile-native.webp`,
        alt: "Five screens from the native app: the home dashboard, two symptom check questions, a care recommendation, and a self care plan",
        width: 2500,
        height: 1521,
        device: "desktop",
      },
    ],
  },
  {
    id: "testing",
    label: "What testing showed",
    heading: "Shaped by real sessions",
    body: [
      "Two rounds of moderated testing put the outcomes in front of real people and recorded where the wording landed and where it did not.",
      "Findings like a strict two hour window reading as more urgent than intended fed straight back into the copy and the visual hierarchy.",
      "Each round narrowed the gap between what the service meant to say and what people actually heard.",
    ],
    images: [
      {
        src: `${A}/moderated-testing-approach.webp`,
        alt: "The moderated testing approach across two rounds of sessions with priority audiences",
        width: 2500,
        height: 1345,
        device: "desktop",
      },
      {
        src: `${A}/testing-participants.webp`,
        alt: "The mix of usability test participants across the two testing rounds",
        width: 2500,
        height: 1347,
        device: "desktop",
      },
    ],
  },
];

export default function FeatureChipsLab() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="overflow-x-clip bg-background">
      <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-3 sm:px-6 md:px-8 md:pt-4 lg:px-20 lg:pb-24 xl:px-48 xl:pb-32 2xl:px-64">
        <header className="max-w-prose py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Lab · feature chips
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Expandable feature chips
          </h1>
          <p className="mt-4 text-base leading-relaxed text-foreground">
            A ragged stack of pill chips that expand one at a time into a
            reading card, while the right side shows the active feature as a
            frameless set of screenshots. The band bleeds to both viewport edges
            while the chips and media stay aligned to this reading column, so the
            layout can be checked against the shell&rsquo;s real gutters.
          </p>
        </header>
      </div>

      <FeatureChips
        id="features"
        heading="How the symptom checker works"
        lede="A tour of the product across the web, the app, and the research that shaped it, one part at a time."
        features={features}
      />

      <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-3 sm:px-6 md:px-8 lg:px-20 lg:pb-24 xl:px-48 xl:pb-32 2xl:px-64">
        <p className="max-w-prose py-12 text-base leading-relaxed text-foreground">
          Copy below the band, in the reading column, to confirm the section
          returns to the gutters cleanly once the band has spanned the full
          width.
        </p>
      </div>
    </main>
  );
}
