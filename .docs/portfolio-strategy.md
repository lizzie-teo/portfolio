# Portfolio strategy

Why this site exists, who it is for, and how to tell whether it is working. It
deliberately holds no execution detail. Everything about how the site looks and
behaves lives where it can be checked against running code:

| Question | Authoritative source |
| --- | --- |
| What work exists, in what order, with what published figures | `src/app/work/projects.ts` |
| Colour, type, spacing, motion, accessibility rules | `.docs/style-rules.md` and `src/app/theme.css` |
| What the navigation offers | `src/app/components/SiteHeader.tsx` and the route tree under `src/app/` |
| Animated home card covers | `.docs/cover-effects.md` |
| Video and image weight | `.docs/asset-weight.md`, `.docs/video-blend.md` |

Never restate a figure, a hex value, or a nav item here. This document is
conditions and intent. If a claim in it can be settled by reading code, it
belongs in the code instead.

## Purpose

An employer facing portfolio for design directors, product managers, and senior
partners across functions. It should demonstrate an ability to make complex
products and systems understandable while retaining warmth, curiosity, and a
distinct point of view.

The experience should work at three depths:

1. **10 seconds:** understand positioning, strongest work, and impact.
2. **60 seconds:** understand role, key decisions, and range.
3. **5 minutes:** examine evidence, process, systems thinking, and reflection.

Every layout decision should be legible as a choice about which depth it serves.
A change that improves the 5 minute read at the cost of the 10 second scan is a
trade, not an improvement, and should be argued as one.

## Influences, and the line around them

Three references shaped the ambition. They are named so that borrowing stays
deliberate and so the last criterion under cross audience experience below has
something to measure against.

- **Cuberto:** cinematic project presentation, masked image reveals, confident
  scale, transitions, and an expressive project card cursor.
- **Alex Chiu:** explanatory motion in place of static interface screenshots,
  using focus, dimming, annotation, and sequencing.
- **Simon Pan:** decision led storytelling, honest ownership, narrative
  headings, and measurable outcomes.

What not to borrow, at any point:

- Scroll jacking or interactions that delay access to information.
- Long loading sequences.
- Motion on every element.
- A visual identity that resembles any reference's brand.
- Reconstructed product behaviour, or before and after claims the evidence does
  not support.

## Content principles

- Present work in the order employers evaluate it, not the order it was
  produced.
- Prefer insight, then decision, then evidence, then effect, over a
  chronological process list.
- Use full screen artefacts only where they stay legible. Otherwise crop and
  annotate.
- Treat IA diagrams and slide decks as supporting evidence, never as primary
  content.
- Curate writing as proof of capability rather than embedding a chronological
  feed.
- Never imply access to old systems or to evidence that is no longer available.
- Every published figure comes from the registry. `src/app/work/projects.ts` is
  the single source for outcome values and their framing, and the case study
  pages quote it rather than restating it. A number that appears in prose and
  nowhere in the registry is a number nobody can verify.

## What the project set has to do

Projects share a structure but select different modules. A project with design
system and delivery depth earns modules for it; a shorter legacy project stays
concise and leads with its strongest final evidence. The structure is a menu,
not a checklist, and a module included out of symmetry costs the reader more
than the gap it fills.

Each featured project must prove a **distinct** capability, so that the set
reads as range rather than repetition. The current four, in registry order, hold
zero to one delivery under time pressure, responsible AI in a public health
service, enterprise systems and design to code maturity, and research reporting
in higher education. Those are read from `projects.ts`; if the set changes, the
test is unchanged. Two projects proving the same thing means one of them is
taking a slot rather than earning it.

Each home card should expose the project's domain, a short value statement, and
one outcome without requiring a click. It should not carry the role. That field
exists in the registry and renders nowhere, and the reasoning is recorded
against it: most entries say the same thing, so a row repeating one phrase
across the grid cannot help a reader tell the cards apart. Role belongs in a
case study's own meta block, where the claim can be qualified.

## Users and success criteria

The portfolio is a decision support tool for hiring. It must help different
visitors answer their questions quickly without forcing everyone through the
same depth of content.

### Primary user: UX/UI Design Director or Head of Product Design

They need to assess UX and UI craft, product judgement, seniority, systems
thinking, design system maturity, leadership, and the quality of the decisions
on show.

They evaluate two artefacts at once:

1. **The featured work:** whether each project demonstrates rigorous practice,
   appropriate design system thinking, collaboration, and impact.
2. **The portfolio itself:** whether it is a coherent, usable, distinctive
   digital product that communicates complex work well.

Success means they can:

- Identify level, specialisms, and point of view within 10 seconds.
- Find at least one relevant project and its outcome without opening a case
  study.
- Understand what was personally owned, influenced, and delivered within 60
  seconds of opening a project.
- Trace at least two important decisions from evidence or constraint, through
  design response, to outcome.
- See strong UI craft at a useful scale, not only process artefacts or
  unreadable full screens.
- See how interface decisions become reusable components, patterns, tokens,
  content rules, and accessible states rather than isolated screens.
- Understand the contribution to design system foundations, adoption,
  governance, documentation, and Figma to code alignment where relevant.
- Find evidence that consistency was balanced against product context rather
  than imposed mechanically.
- Assess collaboration with engineering around implementation quality,
  feasibility, QA, and design debt.
- Experience a portfolio whose own typography, spacing, colour, components,
  states, motion, and responsive behaviour form a coherent system.
- Recognise innovation in the explanatory motion and interaction without losing
  orientation, accessibility, speed, or control.
- Follow a clear story in which context, evidence, constraints, decisions,
  solution, and outcomes connect logically.
- See design thinking demonstrated through framing, prioritisation, trade offs,
  iteration, and reflection rather than named as a generic process.
- Trust that the portfolio was designed around hiring needs, including rapid
  scanning and optional depth.
- Distinguish senior judgement from a checklist of UX activities.
- Leave with enough confidence to invite an interview or portfolio
  presentation.

### Primary user: Product Manager or Product Leader

They need to assess understanding of product goals, prioritisation,
constraints, delivery, measurable outcomes, and work across functions.

Success means they can:

- Understand the user problem, the business problem, and the product response
  from the project summary.
- Find scope, constraints, collaborators, and delivery context without reading
  the complete case study.
- See how design decisions affected workflow, risk, efficiency, conversion,
  completion, or strategic direction.
- Identify evidence of collaboration with product, engineering, stakeholders,
  and subject matter experts.
- Separate measured results from targets, hypotheses, and qualitative
  outcomes.
- Understand how ambiguity, trade offs, and changing information were handled.

### Secondary user: Recruiter or Talent Partner

They need to establish role fit quickly and pass a clear, credible summary to a
hiring manager.

Success means they can:

- Identify title, location or working preference, core capabilities,
  industries, and availability immediately.
- Scan the featured projects without specialist product knowledge.
- Match visible capabilities to a job description using plain language labels.
- Reach a resume, a LinkedIn profile, and a contact action without searching.
- Share a direct link to a relevant case study or section.
- Use the site successfully on mobile and under time pressure.

Three of those six depend on a contact tier the site does not yet have. See
**Not yet built** below.

### Secondary user: Engineer, Design Technologist, or Design Systems Leader

They need to assess implementation awareness, systems maturity, accessibility,
and collaboration quality.

Success means they can:

- Find evidence of design system, Figma to code, specification, QA, and
  accessibility work.
- Understand how design logic maps to reusable patterns rather than isolated
  screens.
- See examples of engineering collaboration and realistic delivery
  constraints.
- Reach relevant technical writing without it overwhelming the main product
  story.

### Cross audience experience criteria

- The homepage communicates a coherent positioning rather than a catalogue of
  unrelated work.
- The portfolio itself acts as evidence of capability: useful, coherent,
  responsive, accessible, visually resolved, and intentionally interactive.
- Its component, token, spacing, typography, motion, and content patterns are
  systematic enough to demonstrate design system thinking without making the
  experience feel templated.
- Innovation is judged by whether an interaction improves understanding or
  memorability, not by the number of effects in play.
- Each featured project proves a distinct capability.
- Design system evidence appears inside the product decisions it enabled.
  Deeper foundations, tokens, governance, and design to code material stay in
  focused modules a reader can choose to open.
- Every case study distinguishes personal contribution from team output.
- In page navigation enables non linear scanning while preserving a coherent
  top to bottom story.
- Motion reveals, focuses, or explains. Comprehension never depends on
  animation timing.
- Static exports feel purposeful and alive without pretending to reproduce
  original product behaviour.
- The site remains complete with keyboard only, reduced motion, touch input,
  200% zoom, or no custom cursor.
- The experience works without unintended horizontal overflow from 320px
  through wide desktop layouts.
- The identity feels recognisably personal rather than derivative of any
  reference named above.

## Validation tasks before launch

Test with people resembling the primary and secondary audiences. They should be
able to complete these without guidance:

1. Describe the strengths and level on show after a 10 second homepage scan.
2. Choose the project most relevant to a supplied role description, and explain
   why.
3. Find the contribution, one major decision, and one outcome in a case study
   within 60 seconds.
4. Explain how the featured projects differ from one another.
5. Navigate directly to a project's outcome, then return to the previous
   section.
6. Find technical or AI enabled workflow evidence without losing the main
   product narrative.
7. Find the resume and a way to make contact.

   Currently unanswerable. Nothing in `src/app/` exposes a resume, a LinkedIn
   profile, or an email address.
8. Describe what feels distinctive about the portfolio, and whether its motion
   helped or hindered understanding.

## Initial measurement signals

Analytics are supporting signals, not proof of quality. Track only privacy
conscious events that answer a design question:

- Featured project opens, by project and by homepage position.
- Case study section navigation usage.
- Visitors reaching the outcome section.
- Resume, LinkedIn, contact, and writing clicks.
- Mobile versus desktop completion of key navigation paths.
- Page performance and Core Web Vitals.

Do not optimise for time on page alone. A short visit may mean the site answered
a recruiter's question efficiently.

No analytics package is installed. This section is the brief for when one is,
not a description of anything running.

## Not yet built

These are unbuilt goals rather than abandoned ones. They are separated from
everything above because the live site does not deliver them, and because
deleting them would quietly lower the bar the rest of this document sets.

### The capability summary

The homepage was planned to carry a capability summary between the work and the
closing tier. It does not exist. `src/app/page.tsx` renders the masthead, the
statement hero, and the work band, and nothing else.

The content for it does exist. Six short films in
`/public/assets/my-capabilities` currently surface only as a hover payoff on six
words in the live hero, which means a reader who never hovers never sees them.
`src/app/explore/annotated/page.tsx` makes this its premise and mounts them at
column scale in both of its directions. That is the open experiment; it has not
been promoted to the home page.

### The contact tier

Biography, availability, resume, LinkedIn, and a contact action were planned as
the homepage's closing section. None of it is built, and the site has no footer
at all. This is the largest single gap between what this document claims the
portfolio does and what it does.

All three directions in `src/app/explore/page.tsx` treat this as the question
they exist to answer, and they disagree productively: an oversized name footer,
a quiet row of links under a feature rail, and a full width colophon. The
placeholder link set lives in `src/app/explore/content.ts` and is explicitly
marked as needing real values before promotion.

Until it lands, three recruiter success criteria and validation task 7 cannot be
met, and four of the six measurement signals have nothing to measure.

### Identity questions still open

- How much personality arrives through copy versus visual motifs. The site now
  leans hard on copy, and the hero keyword field is the current experiment in
  doing it visually.
- Final project selection and image quality. The registry carries open notes
  against individual entries, including at least one tagline flagged as not
  matching the published project. Those notes are the working list; do not
  duplicate them here.

Anything else that cannot be confidently classified as finished or abandoned
belongs in this section rather than in the body above.
