# Portfolio redesign plan

## Purpose

Create an employer-first portfolio for design directors, product managers, and senior cross-functional partners. The site should demonstrate Lizzie's ability to make complex products and systems understandable while retaining warmth, curiosity, and a distinct personal point of view.

The experience should work at three depths:

1. **10 seconds:** understand Lizzie's positioning, strongest work, and impact.
2. **60 seconds:** understand her role, key decisions, and range.
3. **5 minutes:** examine evidence, process, systems thinking, and reflection.

## Creative direction

### Influences

- **Cuberto:** cinematic project presentation, masked image reveals, confident scale, transitions, and an expressive project-card cursor.
- **Alex Chiu:** explanatory motion over static interface screenshots, using focus, dimming, annotations, and sequencing.
- **Simon Pan:** decision-led storytelling, honest ownership, narrative headings, and measurable outcomes.

### Borrow

- Large, carefully art-directed project imagery.
- A squishy cursor follower that expands to show `Explore` over project cards.
- Motion that reveals, focuses, and sequences information.
- Short narrative headings that remain meaningful when skimmed.
- Outcome and contribution information before detailed process.

### Do not borrow

- Scroll-jacking or interactions that delay access to information.
- Long loading sequences.
- Motion on every element.
- A visual identity that resembles Cuberto's brand.
- Reconstructed product behaviour or unsupported before-and-after claims.

### Colour direction: dark, playful, and technical

The selected palette is:

- Near black: `#111113`
- Soft white: `#F5F4F0`
- Acid lime: `#C8F54A`
- Lavender: `#9B8AFB`
- Cool grey: `#A6A7AD`

Near black and soft white form the core reading surfaces. Acid lime is reserved for high-character interactions such as the Explore cursor, selected states, and occasional emphasis. Lavender supports explanatory highlights and secondary moments. Cool grey is used for metadata and quieter hierarchy.

The palette should not become a neon-on-black theme applied uniformly. Use generous neutral space, maintain strong text contrast, and let project imagery provide additional colour. Accent colours should communicate interaction or emphasis rather than decorate every section.

## Information architecture

### Primary navigation

- Work
- About
- Writing
- Contact

### Homepage

1. Positioning-led hero.
2. Three to five selected projects.
3. Capability summary.
4. Two or three selected Substack articles.
5. Short biography, availability, and contact.

Each project preview should expose its domain, Lizzie's role, a short value statement, and one outcome without requiring a click.

### Case-study structure

1. Outcome-led hero.
2. Role, team, duration, scope, and constraints.
3. Executive summary: problem, response, and impact.
4. Two or three pivotal design decisions.
5. Explanatory interface sequences.
6. Optional supporting research, IA, or delivery artefacts.
7. Outcomes and reflection.
8. Next project.

Projects share a structure but can select different modules. AP+ may include design-system and AI-enabled delivery modules; MindSpot should remain a more concise legacy case study with selected final evidence.

### Sticky case-study navigation

Every case study includes persistent in-page navigation so visitors can understand the story's shape, jump to relevant evidence, and return to sections without leaving the page.

- On desktop, use a compact sticky rail or bar showing the major story sections.
- Highlight the current section as the visitor scrolls and include restrained reading progress.
- Use direct anchor links so sections can be bookmarked or shared.
- Keep labels short and meaningful, such as `Overview`, `Challenge`, `Decisions`, `Outcome`, and project-specific deep dives.
- Do not make every minor subsection a navigation item; five to seven destinations is the target.
- On mobile, collapse the rail into a sticky current-section control that opens the full section list, or use a concise horizontally scrollable bar if labels remain readable.
- Preserve native scrolling, browser history, keyboard focus, skip links, and reduced-motion preferences.
- The navigation should support non-linear scanning without interrupting the primary top-to-bottom narrative.

## Motion language

### Reveal

Use clipping, opacity, and restrained vertical movement to introduce sections and images. Reveals establish pacing rather than decorate every item.

### Focus

Show a complete static Figma export, dim secondary regions, highlight one interface area, and introduce a concise annotation. Focus then moves to the next design decision before returning to the complete interface.

### Sequence

Use controlled crossfades or horizontal transitions to present related screens as a workflow. Always provide visible controls and context rather than relying solely on automatic playback.

### Explore cursor

- Desktop and precise-pointer devices only.
- Small follower expands into a soft, elastic form over project cards.
- The form contains a short action such as `Explore`.
- Velocity creates restrained stretch or skew before the shape settles.
- The underlying project image responds with a subtle scale or positional shift.
- Touch, keyboard, and reduced-motion users receive clear conventional interactions.
- Project cards remain visibly clickable without the cursor.

### Page transitions

Carry a project image or background colour into the case-study opening where feasible. Transitions must not delay navigation or obscure browser behaviour.

## Content principles

- Present work in the order employers evaluate it, not the order it was produced.
- Prefer `insight -> decision -> evidence -> effect` over chronological process lists.
- Use full-screen artefacts only when they remain legible; otherwise crop and annotate.
- Treat IA diagrams and slide decks as supporting evidence, not primary content.
- Curate Substack writing as proof of capability rather than embedding a chronological feed.
- Never imply access to old systems or evidence that is no longer available.

## Initial scope

### Launch content

- Homepage.
- Healthdirect Symptom Checker case study.
- AP+ Testing Portal case study.
- Funding Finder case study.
- Selected writing section.
- About and contact content.

### Featured project roles

The three launch projects must each prove a distinct dimension of Lizzie's practice:

1. **Healthdirect Symptom Checker — responsible AI and public-health impact.** Lead with the increase in completion from 45% to 86.5%, then show how content, accessibility, clinical constraints, and human oversight shaped the experience.
2. **AP+ Testing Portal — complex enterprise systems and design-to-code maturity.** Lead with the 20–30% reduction in manual certification effort, then show certification logic, workflow visibility, design-system thinking, and engineering collaboration.
3. **Funding Finder — zero-to-one product design, trust, and rapid delivery.** Lead with the three-month, under-budget MVP delivery, then show progressive disclosure, financial-data consent, matching logic, and the borrower-to-broker service relationship.

Recommended homepage order is Symptom Checker, AP+ Testing Portal, then Funding Finder. This moves from the strongest human and quantitative outcome, through enterprise complexity, to entrepreneurial breadth and delivery speed.

### First vertical slice

Build the homepage project previews and one Funding Finder explanatory sequence:

1. Reveal the borrower experience.
2. Focus on progressive questions and explain how the design reduces application overload.
3. Move focus to consent or matching results and explain how content and recommendation logic build trust.
4. Restore the complete experience or transition into the broker view.
5. Reveal the three-month, under-budget MVP delivery and relevant usability outcomes.

Use this slice to validate art direction, motion quality, responsive behaviour, accessibility, and performance before expanding the system.

## Technical direction

- Next.js 16 App Router and React 19.
- Server components by default; client boundaries only for interactive motion.
- Tailwind CSS and a small set of design tokens.
- `next/image` for responsive project imagery.
- A lightweight custom React cursor using spring movement and velocity-based distortion.
- CSS for basic transitions; Motion for React for coordinated reveals and layout motion.
- Consider GSAP only if a complex pinned explanatory sequence cannot be expressed cleanly otherwise.
- Native scrolling by default.
- Respect `prefers-reduced-motion`, keyboard navigation, touch input, and semantic links.

## Build phases

1. **Content and identity:** inventory assets, select projects, establish voice, typography, colour, and art direction.
2. **Homepage prototype:** hero, one project card, Explore cursor, writing card, and footer.
3. **Case-study prototype:** Funding Finder summary and explanatory screenshot sequence.
4. **Systemisation:** shared components, data model, remaining homepage sections, AP+, and Symptom Checker.
5. **Expansion:** additional project, selected writing, about, and contact.
6. **Quality:** responsive refinement, reduced motion, accessibility, performance, metadata, and employer scan testing.

## Users and success criteria

The portfolio is a decision-support tool for hiring. It must help different visitors answer their questions quickly without forcing everyone through the same depth of content.

### Primary user: UX/UI Design Director or Head of Product Design

They need to assess UX and UI craft, product judgement, seniority, systems thinking, design-system maturity, leadership, and the quality of Lizzie's decisions.

They evaluate two artefacts at once:

1. **The featured work:** whether each project demonstrates rigorous UX/UI practice, appropriate design-system thinking, collaboration, and impact.
2. **The portfolio itself:** whether Lizzie has designed a coherent, usable, distinctive digital product that communicates complex work well.

Success means they can:

- Identify Lizzie's level, specialisms, and point of view within 10 seconds.
- Find at least one relevant project and its outcome without opening a case study.
- Understand what Lizzie personally owned, influenced, and delivered within 60 seconds of opening a project.
- Trace at least two important decisions from evidence or constraint through design response to outcome.
- See strong UI craft at a useful scale, not only process artefacts or unreadable full screens.
- See how interface decisions become reusable components, patterns, tokens, content rules, and accessible states rather than isolated screens.
- Understand Lizzie's contribution to design-system foundations, adoption, governance, documentation, and Figma-to-code alignment where relevant.
- Find evidence that consistency was balanced with product context rather than imposed mechanically.
- Assess collaboration with engineering around implementation quality, feasibility, QA, and design debt.
- Experience a portfolio whose own typography, spacing, colour, components, states, motion, and responsive behaviour form a coherent design system.
- Recognise innovation in the portfolio's explanatory motion and interaction without losing orientation, accessibility, speed, or control.
- Follow a clear story in which context, evidence, constraints, decisions, solution, and outcomes connect logically.
- See design thinking demonstrated through framing, prioritisation, trade-offs, iteration, and reflection rather than named as a generic process.
- Trust that the portfolio has been designed around hiring-user needs, including rapid scanning and optional depth.
- Distinguish senior judgement from a checklist of UX activities.
- Leave with enough confidence to invite Lizzie to an interview or portfolio presentation.

### Primary user: Product Manager or Product Leader

They need to assess whether Lizzie understands product goals, prioritisation, constraints, delivery, measurable outcomes, and cross-functional work.

Success means they can:

- Understand the user problem, business problem, and product response from the project summary.
- Find scope, constraints, collaborators, and delivery context without reading the complete case study.
- See how design decisions affected workflow, risk, efficiency, conversion, completion, or strategic direction.
- Identify evidence of collaboration with product, engineering, stakeholders, and subject-matter experts.
- Separate measured results from targets, hypotheses, and qualitative outcomes.
- Understand how Lizzie handled ambiguity, trade-offs, and changing information.

### Secondary user: Recruiter or Talent Partner

They need to establish role fit quickly and pass a clear, credible summary to a hiring manager.

Success means they can:

- Identify title, location or working preference, core capabilities, industries, and availability immediately.
- Scan three featured projects without specialist product knowledge.
- Match visible capabilities to a job description using plain-language labels.
- Access a resume, LinkedIn profile, and contact action without searching.
- Share a direct link to a relevant case study or section.
- Use the site successfully on mobile and under time pressure.

### Secondary user: Engineer, Design Technologist, or Design Systems Leader

They need to assess implementation awareness, systems maturity, accessibility, and collaboration quality.

Success means they can:

- Find evidence of design-system, Figma-to-code, specification, QA, and accessibility work.
- Understand how design logic maps to reusable patterns rather than isolated screens.
- See examples of engineering collaboration and realistic delivery constraints.
- Access relevant technical writing without it overwhelming the main product story.

### Cross-audience experience criteria

- The homepage communicates a coherent positioning rather than a catalogue of unrelated work.
- The portfolio itself acts as evidence of UX/UI capability: it is useful, coherent, responsive, accessible, visually resolved, and intentionally interactive.
- Its component, token, spacing, typography, motion, and content patterns are systematic enough to demonstrate design-system thinking without making the experience feel templated.
- Innovation is judged by whether an interaction improves understanding or memorability, not by the number of effects used.
- Each featured project proves a distinct capability: responsible AI and public health, enterprise systems and design-to-code, or zero-to-one fintech delivery.
- Design-system evidence appears within the product decisions it enabled; deeper foundations, token, governance, and design-to-code material is available through focused expandable modules.
- Every case study distinguishes personal contribution from team output.
- Sticky navigation enables non-linear scanning while preserving a coherent top-to-bottom story.
- Motion reveals, focuses, or explains information; comprehension does not depend on animation timing.
- Static Figma exports feel purposeful and dynamic without pretending to reproduce original product behaviour.
- The site remains complete with keyboard only, reduced motion, touch input, 200% zoom, or no custom cursor.
- The experience works without unintended horizontal overflow from 320px through wide desktop layouts.
- The identity feels recognisably Lizzie rather than derivative of Cuberto, Alex Chiu, or another reference.

### Validation tasks before launch

Test with people resembling the primary and secondary audiences. They should be able to complete these tasks without guidance:

1. Describe Lizzie's strengths and level after a 10-second homepage scan.
2. Choose the project most relevant to a supplied role description and explain why.
3. Find Lizzie's contribution, one major decision, and one outcome in a case study within 60 seconds.
4. Explain the difference between the three featured projects.
5. Navigate directly to a project's outcome, then return to the previous section.
6. Find technical or AI-enabled workflow evidence without losing the main product narrative.
7. Find the resume and a way to contact Lizzie.
8. Describe what feels distinctive about the portfolio and whether its motion helped or hindered understanding.

### Initial measurement signals

Analytics are supporting signals, not proof of portfolio quality. Track only privacy-conscious events that answer a design question:

- Featured project opens by project and homepage position.
- Case-study section navigation usage.
- Visitors reaching the outcome section.
- Resume, LinkedIn, contact, and selected-writing clicks.
- Mobile versus desktop completion of key navigation paths.
- Page performance and Core Web Vitals.

Do not optimise for time-on-page alone. A short visit may mean the site answered a recruiter's question efficiently.

## Open identity decisions

- Display and body typography.
- How much personality appears through copy versus visual motifs.
- Whether project pages inherit project-specific accent colours or use one portfolio accent.
- Final project selection and available image quality.
