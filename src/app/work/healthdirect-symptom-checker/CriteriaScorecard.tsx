"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { BookOpenText, HandHeart, type LucideIcon } from "lucide-react";
import { CountUp } from "@/app/components/CountUp";
import { motionDuration, motionEase } from "@/app/lib/motion";

/**
 * The success scorecard for "The problem" chapter: one uniform cell per
 * criterion holding its name and the bar we set. Every criterion gets the
 * same frame so the six read as a single agreed target, not a ranking.
 *
 * Colour runs the reverse of the reading tiles around it: the section is the
 * light teal quiet panel (--secondary, Tile surface="secondary") and the cells
 * are white, so the six read as objects set on the brand field. White, not the
 * theme's retinted --card: at 0.98 lightness the card token barely lifts off
 * the #e6f5f5 mint, and the retint exists to stop pure white glaring against
 * the deep-teal leaves — a hazard these inner cells don't face. Each cell
 * carries --shadow-float, the ramp's furthest and softest rung, and no border:
 * the hairline read as almost nothing against the mint and only pencilled an
 * edge onto a card whose whole job is to float, so the shadow holds the six
 * above the field on its own. --shadow-card sat them too close and
 * --shadow-elevated draws a harder edge; float trades the near shadow for a
 * long diffuse one, which is what the distance costs at six repeats.
 *
 * Two kinds share the frame. A measurable criterion leads with its figure as
 * the dominant mark. A qualitative one has no number, so a full-scale
 * context-matching icon stands where the figure would and the judged statement
 * carries the weight. Both marks — figure and icon — are set large in the deep
 * leaf teal (--leaf #183947, the case study's darkest brand teal; 12.3:1 on
 * white), the same scale and colour as the outcome scorecard this pairs with,
 * so an icon and a number read as equal-weight marks; bar and result are told
 * apart by copy and context, not size.
 *
 * Figures count up from zero every time they scroll into view (CountUp), on
 * the cell stagger's own cadence; "AA" has no digits and stays static in the
 * same frame.
 *
 * Rhythm: a fixed top-down cadence, not a bottom-anchored figure. The eyebrow
 * label sits at the top; a deliberate mt-6/8 gap sets the dominant mark apart
 * as the hero; the supporting line couples tight beneath it (gap-3). The three
 * parts read as one grouped unit inside a generous p-6/8 frame; equal-height
 * cells carry their slack as trailing space, so the figure never crowds an edge.
 *
 * Semantics: a definition list, each cell a `<dt>` name paired with its
 * `<dd>` target, so assistive tech hears "Completion: 60 to 70 percent".
 * The icon is aria-hidden; the label and statement carry the meaning.
 */

type Criterion =
  | { kind: "metric"; label: string; target: string; detail: string }
  | { kind: "qualitative"; label: string; statement: string; icon: LucideIcon };

const criteria: Criterion[] = [
  {
    kind: "metric",
    label: "Completion",
    target: "60–70%",
    detail: "Reach the industry benchmark",
  },
  {
    kind: "metric",
    label: "Task success",
    target: "78%+",
    detail: "Every severity 3 and 4 issue resolved",
  },
  {
    kind: "metric",
    label: "Step loss",
    target: "<20%",
    detail: "No single step loses more",
  },
  {
    kind: "metric",
    label: "Accessibility",
    target: "AA",
    detail: "WCAG 2.1, compliant in full",
  },
  {
    kind: "qualitative",
    label: "Health literacy",
    statement: "People understand medical terms and instructions unaided",
    icon: BookOpenText,
  },
  {
    kind: "qualitative",
    label: "Confidence",
    statement: "People feel guided and supported throughout",
    icon: HandHeart,
  },
];

const eyebrow =
  "text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground";

export function CriteriaScorecard({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  const v: { grid: Variants; cell: Variants } = {
    grid: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.05 },
      },
    },
    cell: {
      hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.out,
        },
      },
    },
  };

  return (
    <motion.dl
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={v.grid}
      className={`grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 ${className ?? ""}`}
    >
      {criteria.map((c, index) => (
        <motion.div
          key={c.label}
          variants={v.cell}
          className="flex flex-col rounded-xl bg-white p-6 md:p-8 shadow-float"
        >
          <dt className={eyebrow}>{c.label}</dt>
          {c.kind === "metric" ? (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <CountUp
                value={c.target}
                delay={shouldReduce ? 0 : index * 0.05}
                className="text-4xl font-semibold leading-[0.95] tracking-[-0.02em] text-leaf break-words md:text-5xl"
              />
              <span className="text-sm font-medium leading-relaxed text-leaf">
                {c.detail}
              </span>
            </dd>
          ) : (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <c.icon
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-12 shrink-0 text-leaf md:size-14"
              />
              <span className="text-base leading-relaxed text-foreground">
                {c.statement}
              </span>
            </dd>
          )}
        </motion.div>
      ))}
    </motion.dl>
  );
}
