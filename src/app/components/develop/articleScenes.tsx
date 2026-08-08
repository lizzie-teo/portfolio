/*
 * ARTICLE SCENES — which piece gets a bespoke plate, and what everything else
 * falls back to.
 *
 * DELIBERATELY NOT `"use client"`. This is a lookup table, and marking it as a
 * client module made every function in it uncallable from a server component —
 * which is what the pages that need it are. The individual scenes carry their own
 * `"use client"` because they animate; this module only names them, so it stays a
 * server module that HANDS BACK client elements. Rendering a client component from
 * a server one is fine, and passing the resulting element down as a prop is the
 * standard slot pattern.
 *
 * WHY A BESPOKE SCENE PER ARTICLE. The first pass gave all three articles the same
 * illustration, and the failure was not that it looked bad — it was that it made
 * the plate DECORATION. Three cards showing one motif teach a reader nothing about
 * which piece is which, so the articles became interchangeable at a glance and the
 * largest element on each card carried none of its meaning. A plate has to be about
 * its article or it should not be a plate.
 *
 * THE DEFAULT IS A REAL POSITION, NOT A GAP. There are twelve pieces on the
 * Substack and three are shown here; hand-animating a scene for every future essay
 * is not a commitment worth making, and a card with no plate at all would be a
 * different and worse component. So the long tail gets a shared default and the
 * three pieces that earn a scene get one. `frames` or `clip` can take that slot
 * later for any individual piece without touching this map.
 *
 * KEYED BY URL because that is what identifies an `ArticleEntry` — articles have no
 * slug (they are not routes here). When this ships, the honest home for the key is
 * the registry itself, as a `scene` id on `ArticleEntry`, matching how case studies
 * name their covers (`media: { cover: "symptom-checker" }`). It is kept in the
 * component layer for now so the direction can be judged before `projects.ts`
 * grows a field for it.
 */

import type { PlateMedia } from "./plateMedia";
import type { PlateFrames } from "./plateMedia";
import type { ArticleEntry } from "../../work/projects";
import { FigmaToCodeScene } from "./scenes/FigmaToCodeScene";
import { UxQaAgentScene } from "./scenes/UxQaAgentScene";
import { InfluenceNetworkScene } from "./scenes/InfluenceNetworkScene";

const SCENES: Record<string, () => React.ReactNode> = {
  "https://lizzieteo.substack.com/p/figma-to-code-best-practices": () => <FigmaToCodeScene />,
  "https://lizzieteo.substack.com/p/how-a-ux-qa-custom-agent-changed": () => <UxQaAgentScene />,
  "https://lizzieteo.substack.com/p/leadership-without-authority-learning": () => (
    <InfluenceNetworkScene />
  ),
};

/*
 * THE DEFAULT PLATE — the isometric motif, demoted.
 *
 * PROVENANCE WARNING, and it needs settling before this ships: these three files
 * are the Healthdirect case study's own chapter illustrations. They are stand-ins.
 * Borrowing one project's artwork as the generic mark for all writing is a content
 * error rather than a visual one — it silently attaches a client's illustration to
 * essays that have nothing to do with that client. The mechanism below is right;
 * the pictures in it are placeholders and want either a neutral commissioned set or
 * a per-article `frames` entry.
 */
export const DEFAULT_ARTICLE_FRAMES: PlateFrames = [
  "/assets/chapter-illustrations/decisions.png",
  "/assets/chapter-illustrations/outcome.png",
  "/assets/chapter-illustrations/approach.png",
];

/** The plate media for an article: its own scene, or the shared default. */
export function articleMedia(entry: ArticleEntry): PlateMedia {
  const scene = SCENES[entry.url];
  return scene ? { media: scene() } : { frames: DEFAULT_ARTICLE_FRAMES };
}

export function hasBespokeScene(entry: ArticleEntry): boolean {
  return entry.url in SCENES;
}
