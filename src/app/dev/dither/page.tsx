"use client";

/* Local dev tool — not linked from any nav, 404s in production.
   ────────────────────────────────────────────────────────────────────────
   Two things live here:

   1. CSS dither (default) — the production-feeding tuner. It previews the two
      real video covers at home-card aspect with a CSS-tile Bayer dither over
      them, then prints copy-pasteable constants for DitherOverlay.tsx. This
      flow is UNCHANGED — buildDitherTile still drives the preview so it can
      never drift from what ships.

   2. Paper Shaders playground — real @paper-design/shaders-react effects
      (v0.0.77) driven through the same Leva-style panel. Every effect is a
      real export with real props verified against the package's TypeScript
      types. Effects fall into three rendering modes, made explicit in the UI:

        · overlay    — a transparent-backed generative shader canvas sits OVER
                       the live video (blend + opacity, like the CSS dither).
        · filter     — an image-input shader processes a captured still frame
                       of the cover (these shaders can't read a live <video>,
                       so we grab one frame to a canvas and feed it in).
        · standalone — a purely generative shader fills the tile on its own;
                       the video isn't involved.

   The site's editorial style rules don't bind this dev scratch tool; the point
   is to keep the panel aesthetic consistent with what was already here. */

import { notFound } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import { useReducedMotion } from "motion/react";
import {
  ImageDithering,
  HalftoneCmyk,
  Water,
  Dithering,
  GodRays,
  DotOrbit,
  MeshGradient,
  Warp,
  GrainGradient,
} from "@paper-design/shaders-react";
import { buildDitherTile, DITHER_DEFAULTS } from "../../components/DitherOverlay";
import { IndustryGlyph } from "../../components/IndustryGlyph";
import { getField, type ProjectField } from "../../components/projectFields";
import { getCaseStudy, type CaseStudyEntry } from "../../work/projects";

type BlendMode = NonNullable<CSSProperties["mixBlendMode"]>;

const BLEND_MODES: BlendMode[] = [
  "soft-light",
  "overlay",
  "normal",
  "multiply",
  "screen",
  "hard-light",
];

const MATRIX_OPTIONS = [2, 4, 8] as const;

/* Panel accent + surfaces, tuned to the Leva/Paper Shaders dark panel. */
const ACCENT = "#6b8cc9";
const TRACK = "#2f363c";

/* Ink presets — the demo's preset row, mapped to our two-ink model. */
const INK_PRESETS: { label: string; light: string; dark: string }[] = [
  { label: "Cream + ink", light: "#F4F1EA", dark: "#141210" },
  { label: "Pure mono", light: "#FFFFFF", dark: "#000000" },
  { label: "Warm paper", light: "#FBEFD9", dark: "#2A211A" },
  { label: "Cool print", light: "#E7F0F2", dark: "#0B1A20" },
];

/* ───────────────────────── Preview subjects ──────────────────────────────── */

/* Two real projects drive every preview mode, so a look can be flipped across
   the three grounds (bare clip, current bloom card, video-ground card) on the
   SAME project and compared. Each carries its archived cover clip (the covers
   ship canvas-drawn now; these are the clips from public/assets/cover-cards) and
   the letterbox field the clip sits on. Title, tag, and mark are pulled from the
   work registry via the slug; the bloom ground and inks come from projectFields
   — never hardcoded here. */
type Subject = {
  slug: string;
  video: string;
  /* Solid field behind the clip's letterbox (the clip's own cover ground). */
  videoField: string;
  videoLabel: string;
};

const SUBJECTS: Subject[] = [
  {
    slug: "ap-testing-portal",
    video: "/assets/cover-cards/ap-testing-portal.mp4",
    videoField: "#0D033C",
    videoLabel: "AP+ Testing Portal — cover clip",
  },
  {
    slug: "healthdirect-symptom-checker",
    video: "/assets/cover-cards/child-unwell.mp4",
    videoField: "#0e2932",
    videoLabel: "Symptom checker — cover clip",
  },
];

/* Three things an effect can be previewed on. Bare clip is the original tool;
   the two card modes render the REAL home-card composition (registry title,
   tag, and mark on the exact 5:7 column) so effects can be judged against the
   shipped card, not just loose video.
     · video        two bare clips at the archived 1.18/1 tile aspect
     · card-current the shipped rest-state card: title/tag/mark over the bloom
     · card-video   the same card composition with a clip behind the text */
type Preview = "video" | "card-current" | "card-video" | "card-shader";

const PREVIEW_OPTIONS: { value: Preview; label: string }[] = [
  { value: "video", label: "Bare video tiles" },
  { value: "card-current", label: "Cover card — current design" },
  { value: "card-video", label: "Cover card — video ground" },
  { value: "card-shader", label: "Cover card — paper shader ground" },
];

/* A ground is "pale" when the effect layer sits over the luminous near-white
   bloom (or a shader seeded from it) rather than the dark clips. The soft-light
   and screen blends that read beautifully over midnight/teal video go nearly
   invisible over near-white — which is exactly why the effects "weren't applied"
   on the cover cards. Overlay + CSS defaults switch to a ground-appropriate
   blend below when this is "pale". */
type GroundTone = "dark" | "pale";

function toneOf(preview: Preview): GroundTone {
  return preview === "card-current" || preview === "card-shader" ? "pale" : "dark";
}

/* Which Paper Shader draws the shader-ground card. */
type GroundShader = "mesh" | "grain";

const VIDEO_ASPECT = "1.18 / 1";
const CARD_ASPECT = "5 / 7";

/* Ink for the card composition when it sits over a dark clip instead of the
   luminous near-white bloom. The shipped ink (field.ink) is a deep brand tone
   tuned to read on near-white; over the midnight/teal clips it would vanish, so
   the video-ground variant flips to the site cream. A soft scrim under the type
   buys legibility over the moving frame — the one addition the video ground
   needs that the bloom ground does not. */
const CARD_ON_VIDEO_INK = "#F4F1EA";

/* A preview tile's ground: a live clip, a project's CSS bloom field, or a Paper
   Shader seeded from that field's bloom hues (so ground and effects come from
   one library and compose natively). */
type Ground =
  | { kind: "video"; src: string; bg: string }
  | { kind: "bloom"; field: ProjectField }
  | { kind: "shader"; field: ProjectField; shader: GroundShader; palette: string[] };

/* Optional card chrome drawn over the ground (null on bare-clip tiles).
   `layout` picks the composition: "centred" is the shipped rest state (big
   display title mid-card, tag + mark below, radial scrim); "caption" is the
   video-ground variant — a recessive lower-left caption that lets the clip be
   the feature. When "caption", `scrim` is ignored (the caption carries its own
   local bottom gradient instead of the full-tile radial). */
type CardInfo = {
  entry: CaseStudyEntry;
  ink: string;
  scrim: boolean;
  layout: "centred" | "caption";
} | null;

function ratioOf(aspect: string): number {
  const [a, b] = aspect.split("/").map((n) => parseFloat(n));
  return b ? a / b : 1;
}

/* ───────────────────────── CSS dither (unchanged) ───────────────────────── */

type Settings = {
  matrix: number;
  cellPx: number;
  speckCount: number;
  opacity: number;
  blendMode: BlendMode;
  light: string;
  dark: string;
  inverted: boolean;
  showDither: boolean;
};

const SHIPPED: Settings = {
  matrix: DITHER_DEFAULTS.bayerSize,
  cellPx: DITHER_DEFAULTS.cellPx,
  speckCount: DITHER_DEFAULTS.speckCount,
  opacity: DITHER_DEFAULTS.restOpacity,
  blendMode: DITHER_DEFAULTS.blendMode,
  light: DITHER_DEFAULTS.speckLight,
  dark: DITHER_DEFAULTS.speckDark,
  inverted: false,
  showDither: true,
};

/* ───────────────────────── Paper Shaders registry ────────────────────────── */

type Render = "overlay" | "filter" | "standalone";

type ParamValue = number | string | boolean | string[];
type ParamBag = Record<string, ParamValue>;

/* Control descriptors map onto the existing Leva primitives. Reserved keys
   (prefixed `_`) drive the wrapper — playback speed, and for overlays the
   blend + opacity of the canvas over the video — and are stripped before the
   props reach the shader component. */
type Control =
  | {
      kind: "slider";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      digits?: number;
    }
  | { kind: "color"; key: string; label: string }
  | { kind: "colors"; key: string; label: string; count: number }
  | { kind: "select"; key: string; label: string; options: string[] }
  | { kind: "check"; key: string; label: string };

type Effect = {
  id: string;
  label: string;
  /** JSX tag name, used only for the copy-paste readout. */
  tag: string;
  render: Render;
  Component: FC<Record<string, unknown>>;
  controls: Control[];
  defaults: ParamBag;
  /** Overlay-only: default patch applied when the ground is PALE (the bloom /
      shader card). The dark-video defaults (soft-light, screen, cream ink) are
      near-invisible over near-white, so a pale ground seeds a blend + opacity +
      ink that actually reads. Editable afterwards like any other default. */
  paleOverlay?: ParamBag;
};

const speedCtl = (max = 2): Control => ({
  kind: "slider",
  key: "_speed",
  label: "speed",
  min: 0,
  max,
  step: 0.05,
  digits: 2,
});

const overlayCtls: Control[] = [
  { kind: "select", key: "_blend", label: "blend", options: BLEND_MODES },
  { kind: "slider", key: "_opacity", label: "opacity", min: 0, max: 1, step: 0.05, digits: 2 },
];

const EFFECTS: Effect[] = [
  /* ── Image filters ── process a captured still of the cover ── */
  {
    id: "image-dither",
    label: "Image dithering",
    tag: "ImageDithering",
    render: "filter",
    Component: ImageDithering as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "select", key: "type", label: "type", options: ["random", "2x2", "4x4", "8x8"] },
      { kind: "slider", key: "size", label: "size", min: 0.5, max: 20, step: 0.5, digits: 1 },
      { kind: "slider", key: "colorSteps", label: "steps", min: 1, max: 7, step: 1 },
      { kind: "color", key: "colorFront", label: "front" },
      { kind: "color", key: "colorBack", label: "back" },
      { kind: "color", key: "colorHighlight", label: "highlight" },
      { kind: "check", key: "originalColors", label: "srcColors" },
      { kind: "check", key: "inverted", label: "inverted" },
      { kind: "slider", key: "scale", label: "scale", min: 0.5, max: 3, step: 0.1, digits: 1 },
    ],
    defaults: {
      type: "4x4",
      size: 2,
      colorSteps: 2,
      colorFront: "#F4F1EA",
      colorBack: "#141210",
      colorHighlight: "#F4F1EA",
      originalColors: false,
      inverted: false,
      scale: 1,
    },
  },
  {
    id: "halftone",
    label: "Halftone CMYK",
    tag: "HalftoneCmyk",
    render: "filter",
    Component: HalftoneCmyk as unknown as FC<Record<string, unknown>>,
    /* `size` is a small scale value (~0.01–1), NOT pixels — the whole look
       collapses to blank paper if it's driven like a pixel size. The flood/gain
       channels below aren't exposed as controls but are seeded from the
       library's tuned "Default" preset so the separations actually ink. */
    controls: [
      { kind: "select", key: "type", label: "type", options: ["dots", "ink", "sharp"] },
      { kind: "slider", key: "size", label: "dotScale", min: 0.02, max: 1, step: 0.02, digits: 2 },
      { kind: "slider", key: "contrast", label: "contrast", min: 0, max: 2, step: 0.05, digits: 2 },
      { kind: "slider", key: "softness", label: "softness", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "gridNoise", label: "gridNoise", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "grainOverlay", label: "grain", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "color", key: "colorBack", label: "paper" },
      { kind: "color", key: "colorC", label: "cyan" },
      { kind: "color", key: "colorM", label: "magenta" },
      { kind: "color", key: "colorY", label: "yellow" },
      { kind: "color", key: "colorK", label: "key" },
    ],
    defaults: {
      type: "ink",
      size: 0.2,
      contrast: 1,
      softness: 1,
      gridNoise: 0.2,
      grainOverlay: 0,
      grainSize: 0.5,
      colorBack: "#FBFAF5",
      colorC: "#00B4FF",
      colorM: "#FC519F",
      colorY: "#FFD800",
      colorK: "#231F20",
      floodC: 0.15,
      floodM: 0,
      floodY: 0,
      floodK: 0,
      gainC: 0.3,
      gainM: 0,
      gainY: 0.2,
      gainK: 0,
    },
  },
  {
    id: "water",
    label: "Water",
    tag: "Water",
    render: "filter",
    Component: Water as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "slider", key: "caustic", label: "caustic", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "waves", label: "waves", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "highlights", label: "highlights", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "layering", label: "layering", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "edges", label: "edges", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "size", label: "size", min: 0.5, max: 7, step: 0.1, digits: 1 },
      { kind: "color", key: "colorHighlight", label: "highlight" },
      { kind: "color", key: "colorBack", label: "back" },
      speedCtl(1),
    ],
    defaults: {
      caustic: 0.6,
      waves: 0.3,
      highlights: 0.4,
      layering: 0.5,
      edges: 0.5,
      size: 2,
      colorHighlight: "#8FD8E8",
      colorBack: "#0e2932",
      _speed: 0.4,
    },
  },

  /* ── Overlays ── transparent-backed canvas over the live video ── */
  {
    id: "dithering",
    label: "Dithering (animated)",
    tag: "Dithering",
    render: "overlay",
    Component: Dithering as unknown as FC<Record<string, unknown>>,
    controls: [
      {
        kind: "select",
        key: "shape",
        label: "shape",
        options: ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"],
      },
      { kind: "select", key: "type", label: "type", options: ["random", "2x2", "4x4", "8x8"] },
      { kind: "slider", key: "size", label: "size", min: 0.5, max: 20, step: 0.5, digits: 1 },
      { kind: "color", key: "colorFront", label: "ink" },
      ...overlayCtls,
      speedCtl(),
    ],
    defaults: {
      shape: "warp",
      type: "4x4",
      size: 2,
      colorFront: "#F4F1EA",
      _blend: "soft-light" as BlendMode,
      _opacity: 0.8,
      _speed: 0.6,
    },
    /* Over near-white: a deep ink multiplied on, so the dither actually prints. */
    paleOverlay: {
      colorFront: "#141210",
      _blend: "multiply" as BlendMode,
      _opacity: 0.95,
    },
  },
  {
    id: "god-rays",
    label: "God rays",
    tag: "GodRays",
    render: "overlay",
    Component: GodRays as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "slider", key: "intensity", label: "intensity", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "density", label: "density", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "spotty", label: "spotty", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "midSize", label: "midSize", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "midIntensity", label: "midGlow", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "bloom", label: "bloom", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "colors", key: "colors", label: "ray", count: 3 },
      { kind: "color", key: "colorBloom", label: "bloomHue" },
      ...overlayCtls,
      speedCtl(),
    ],
    defaults: {
      intensity: 0.6,
      density: 0.5,
      spotty: 0.3,
      midSize: 0.3,
      midIntensity: 0.4,
      bloom: 0.5,
      colors: ["#FFE8B0", "#FFB86B", "#FF8C42"],
      colorBloom: "#FFD27F",
      _blend: "screen" as BlendMode,
      _opacity: 0.85,
      _speed: 0.5,
    },
    /* Screen vanishes over near-white; multiply saturated warm rays instead. */
    paleOverlay: {
      colors: ["#E0A24B", "#C9662B", "#8A3A1E"],
      colorBloom: "#D98A3F",
      _blend: "multiply" as BlendMode,
      _opacity: 0.9,
    },
  },
  {
    id: "dot-orbit",
    label: "Dot orbit",
    tag: "DotOrbit",
    render: "overlay",
    Component: DotOrbit as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "slider", key: "size", label: "dotSize", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "sizeRange", label: "sizeVar", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "spreading", label: "orbit", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "stepsPerColor", label: "steps", min: 1, max: 4, step: 1 },
      { kind: "colors", key: "colors", label: "dot", count: 3 },
      ...overlayCtls,
      speedCtl(),
    ],
    defaults: {
      size: 0.3,
      sizeRange: 0.2,
      spreading: 0.4,
      stepsPerColor: 1,
      colors: ["#F4F1EA", "#C9A24B", "#6b8cc9"],
      _blend: "screen" as BlendMode,
      _opacity: 0.8,
      _speed: 0.5,
    },
    /* Deep, saturated dots multiplied on so the orbit reads over near-white. */
    paleOverlay: {
      colors: ["#6e1e50", "#B07A1E", "#2c3072"],
      _blend: "multiply" as BlendMode,
      _opacity: 0.9,
    },
  },

  /* ── Standalone ── purely generative, fills the tile on its own ── */
  {
    id: "mesh",
    label: "Mesh gradient",
    tag: "MeshGradient",
    render: "standalone",
    Component: MeshGradient as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "slider", key: "distortion", label: "distortion", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "swirl", label: "swirl", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "grainOverlay", label: "grain", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "colors", key: "colors", label: "stop", count: 4 },
      speedCtl(),
    ],
    defaults: {
      distortion: 0.8,
      swirl: 0.6,
      grainOverlay: 0,
      colors: ["#0D033C", "#6b8cc9", "#C9A24B", "#F4F1EA"],
      _speed: 0.4,
    },
  },
  {
    id: "warp",
    label: "Warp",
    tag: "Warp",
    render: "standalone",
    Component: Warp as unknown as FC<Record<string, unknown>>,
    controls: [
      { kind: "select", key: "shape", label: "shape", options: ["checks", "stripes", "edge"] },
      { kind: "slider", key: "proportion", label: "balance", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "softness", label: "softness", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "distortion", label: "distortion", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "swirl", label: "swirl", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "swirlIterations", label: "swirlN", min: 0, max: 20, step: 1 },
      { kind: "slider", key: "shapeScale", label: "shapeScale", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "colors", key: "colors", label: "color", count: 3 },
      speedCtl(),
    ],
    defaults: {
      shape: "stripes",
      proportion: 0.5,
      softness: 1,
      distortion: 0.25,
      swirl: 0.8,
      swirlIterations: 8,
      shapeScale: 0.5,
      colors: ["#0e2932", "#8FD8E8", "#F4F1EA"],
      _speed: 0.4,
    },
  },
  {
    id: "grain",
    label: "Grain gradient",
    tag: "GrainGradient",
    render: "standalone",
    Component: GrainGradient as unknown as FC<Record<string, unknown>>,
    controls: [
      {
        kind: "select",
        key: "shape",
        label: "shape",
        options: ["wave", "dots", "truchet", "corners", "ripple", "blob", "sphere"],
      },
      { kind: "slider", key: "softness", label: "softness", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "intensity", label: "intensity", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "slider", key: "noise", label: "noise", min: 0, max: 1, step: 0.05, digits: 2 },
      { kind: "color", key: "colorBack", label: "back" },
      { kind: "colors", key: "colors", label: "stop", count: 3 },
      speedCtl(),
    ],
    defaults: {
      shape: "wave",
      softness: 0.8,
      intensity: 0.5,
      noise: 0.4,
      colorBack: "#141210",
      colors: ["#0D033C", "#6b8cc9", "#C9A24B"],
      _speed: 0.4,
    },
  },
];

const EFFECT_BY_ID = new Map(EFFECTS.map((e) => [e.id, e]));

/* Ground-aware defaults. Over a pale ground an overlay seeds from its
   `paleOverlay` patch; everything else uses its plain defaults. Editable after
   seeding — this only decides where the sliders START per ground. */
function defaultsFor(effect: Effect, tone: GroundTone): ParamBag {
  if (tone === "pale" && effect.render === "overlay" && effect.paleOverlay) {
    return { ...effect.defaults, ...effect.paleOverlay };
  }
  return effect.defaults;
}

/* Params are stored per (effect, ground tone) so a look tuned over the dark
   clips and one tuned over the pale card survive independently in a session. */
function bagKey(effectId: string, tone: GroundTone): string {
  return `${effectId}|${tone}`;
}

const EFFECT_GROUPS: { label: string; ids: string[] }[] = [
  { label: "CSS tiles", ids: ["css"] },
  { label: "Image filters (captured still)", ids: ["image-dither", "halftone", "water"] },
  { label: "Overlays (over live video)", ids: ["dithering", "god-rays", "dot-orbit"] },
  { label: "Standalone canvas", ids: ["mesh", "warp", "grain"] },
];

const RENDER_NOTE: Record<Render, string> = {
  overlay: "Shader canvas over live video — blend + opacity.",
  filter: "Shader filters a captured still frame of the cover.",
  standalone: "Standalone generative canvas — video not used.",
};

/* ───────────────────────── Leva-style primitives ─────────────────────────── */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2 px-2.5 py-1.5 hover:bg-[#20262b]">
      <span className="truncate text-[11px] text-[#8a9096]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ValueBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex h-5 w-11 shrink-0 items-center justify-center rounded border border-[#2c3238] bg-[#0f1316] font-mono text-[11px] text-[#c8ccd0]">
      {children}
    </span>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="flex items-center">
      <input
        type="range"
        className="lva-range min-w-0 flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${ACCENT} ${pct}%, ${TRACK} ${pct}%)`,
        }}
      />
      <ValueBox>{display}</ValueBox>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-2 rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="lva-swatch h-4 w-4 shrink-0 cursor-pointer rounded-sm"
        />
        <input
          type="text"
          value={value.toLowerCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
          }}
          className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-[#c8ccd0] outline-none"
          spellCheck={false}
        />
      </div>
    </Row>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer rounded-sm"
        style={{ accentColor: ACCENT }}
      />
    </Row>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Row label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1 font-mono text-[11px] text-[#c8ccd0] outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Row>
  );
}

/* ───────────────────────── Preview components ────────────────────────────── */

function CoverBox({
  aspect,
  bg,
  children,
}: {
  aspect: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: aspect, backgroundColor: bg }}
    >
      {children}
    </div>
  );
}

/* The real home-card rest state, replicated faithfully (a lightweight copy, not
   the shipped ProjectCard — its column is entangled with the hover FieldDissolve
   canvas, the payoff panel, and a stack of MotionValues, none of which the rest
   state needs). The geometry is lifted verbatim: the 7/6/7 flex airs, the
   min-h-24 title box at 10ch, the caps tag on 0.28em tracking with its optical
   indent, and the 32px hairline mark. Title, tag, and industry come from the
   registry; the glyph is the shipped IndustryGlyph. Static only — no hover
   machinery, which is all the effect previews need. Sits ABOVE the effect layer,
   exactly as the shipped title sits above its rest dither. */
function CardChrome({ entry, ink, scrim, layout }: NonNullable<CardInfo>) {
  if (layout === "caption") return <CardCaption entry={entry} ink={ink} />;
  return (
    <>
      {scrim ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 82% at 50% 42%, rgba(6,6,20,0.46) 0%, rgba(6,6,20,0.18) 46%, rgba(6,6,20,0) 78%)",
          }}
        />
      ) : null}
      <div
        className="relative z-10 flex h-full flex-col items-center px-6 py-5 text-center"
        style={{ color: ink }}
      >
        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
        <div className="flex w-full min-h-24 items-start justify-center sm:min-h-28">
          <h2 className="max-w-[10ch] text-balance font-heading text-3xl font-medium leading-[1.02] tracking-[-0.015em] sm:text-4xl">
            {entry.title}
          </h2>
        </div>
        <div aria-hidden="true" className="min-h-6 basis-0 grow-6" />
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {entry.industry ? (
            <p className="indent-[0.28em] text-xs font-medium uppercase tracking-[0.28em]">
              {entry.industry}
            </p>
          ) : null}
          <IndustryGlyph industry={entry.industry} className="size-8 shrink-0" />
        </div>
        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
      </div>
    </>
  );
}

/* Video-ground caption — the recessive variant. The clip is the feature; the
   card only needs to name itself, so identification drops to a lower-left
   caption and the display title shrinks well below its rest-state scale. Reading
   order runs category then name: a caps industry kicker over a small display
   title. The 32px centred mark would re-assert itself as a focal point here, so
   it tucks into the opposite corner at two-thirds size, on the caption's
   baseline — present for identification, no longer a headline.

   Legibility devices, kept as local as possible so the clip stays bright:
     · a bottom-anchored linear scrim over the lower ~44% only (the shipped card
       darkens the whole tile with a centred radial; this leaves the top of the
       frame untouched);
     · a soft ink text-shadow on the cream type as a second line of defence for
       the bright passages of both clips, where a gradient alone can thin out.
   Both are scene-level artwork values (the same rgba(6,6,20) ink the shipped
   radial scrim already uses), not shell tokens. */
const CAPTION_TEXT_SHADOW = "0 1px 6px rgba(6,6,20,0.55)";

function CardCaption({ entry, ink }: { entry: CaseStudyEntry; ink: string }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%]"
        style={{
          background:
            "linear-gradient(to top, rgba(6,6,20,0.68) 0%, rgba(6,6,20,0.40) 30%, rgba(6,6,20,0.14) 62%, rgba(6,6,20,0) 100%)",
        }}
      />
      <div
        className="relative z-10 flex h-full flex-col justify-end px-5 pb-5"
        style={{ color: ink }}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {entry.industry ? (
              <p
                className="text-xs font-medium uppercase tracking-[0.24em] opacity-85"
                style={{ textShadow: CAPTION_TEXT_SHADOW }}
              >
                {entry.industry}
              </p>
            ) : null}
            <h2
              className="mt-2 max-w-[18ch] font-heading text-lg font-medium leading-[1.12] tracking-[-0.01em] sm:text-xl"
              style={{ textShadow: CAPTION_TEXT_SHADOW }}
            >
              {entry.title}
            </h2>
          </div>
          <IndustryGlyph
            industry={entry.industry}
            className="mb-0.5 size-5 shrink-0 opacity-90 sm:size-6"
          />
        </div>
      </div>
    </>
  );
}

/* A single parsed bloom from a projectFields field.image: the ellipse geometry
   (centre + radii as card percentages) and the five-stop falloff, all read back
   out of the CSS string. The stops share one rgb (the bloom's base colour), so
   `rgb` is the bloom hue and `stops` are [position%, alpha] pairs. */
type BloomSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  rgb: [number, number, number];
  stops: [number, number][];
};

/* Read the structured blooms back out of a field.image string. projectFields
   builds each layer as `radial-gradient(w% h% at x% y%, rgb(r g b / a) p%, …)`
   with a fixed grammar (space-separated rgb, no commas inside the colour), so a
   balanced-paren split plus two regexes recovers every argument exactly. This is
   what lets us PAINT the field natively below instead of rasterising the CSS. */
function parseBloomField(image: string): BloomSpec[] {
  const specs: BloomSpec[] = [];
  const token = "radial-gradient";
  let i = 0;
  while (true) {
    const start = image.indexOf(token + "(", i);
    if (start === -1) break;
    // Walk to the matching close paren (rgb(...) nests one level inside).
    let depth = 0;
    let j = start + token.length;
    for (; j < image.length; j++) {
      const ch = image[j];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const chunk = image.slice(start, j);
    i = j;
    const head = chunk.match(
      /radial-gradient\(\s*([\d.]+)%\s+([\d.]+)%\s+at\s+([-\d.]+)%\s+([-\d.]+)%/,
    );
    if (!head) continue;
    const stops: [number, number][] = [];
    let rgb: [number, number, number] = [0, 0, 0];
    const stopRe = /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)\s*([\d.]+)%/g;
    let m: RegExpExecArray | null;
    while ((m = stopRe.exec(chunk))) {
      if (stops.length === 0) rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
      stops.push([Number(m[5]), Number(m[4])]);
    }
    specs.push({
      x: Number(head[3]),
      y: Number(head[4]),
      w: Number(head[1]),
      h: Number(head[2]),
      rgb,
      stops,
    });
  }
  return specs;
}

/* Paint a bloom field natively with Canvas2D so the image-input shaders can
   filter the card ground the same way they filter a captured video frame.
   Replaces the old foreignObject-SVG raster, which taints the canvas under
   WebKit (a long-standing Safari behaviour) — so on the user's Mac the filter
   shaders silently fell back to the plain bloom. Painting the same radial
   gradients with ctx.createRadialGradient reads back cleanly in both Safari and
   Chrome. Each bloom is an ellipse (w% of width by h% of height), so we scale
   the context and draw a circular gradient. CSS lists the first bloom on top, so
   we paint in reverse. Returns null only if a 2D context can't be had. */
function paintBloomField(field: ProjectField, w: number, h: number): string | null {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = field.ground;
  ctx.fillRect(0, 0, w, h);
  const specs = parseBloomField(field.image);
  for (const s of [...specs].reverse()) {
    const cx = (s.x / 100) * w;
    const cy = (s.y / 100) * h;
    const rx = Math.max(1, (s.w / 100) * w);
    const ry = Math.max(1, (s.h / 100) * h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    const [r, g, b] = s.rgb;
    for (const [pos, a] of s.stops) {
      grad.addColorStop(Math.min(1, Math.max(0, pos / 100)), `rgba(${r}, ${g}, ${b}, ${a})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(-w * 2, -h * 2, w * 4, h * 4);
    ctx.restore();
  }
  try {
    return c.toDataURL("image/png");
  } catch {
    return null;
  }
}

/* The bloom hues of a field, as rgb() strings, for seeding a shader ground from
   the SAME colours the shipped card blooms with. Paper Shaders parses rgb()
   directly, so no token resolution is needed here — projectFields already holds
   concrete rgb, not oklch. */
function shaderPalette(field: ProjectField): string[] {
  return parseBloomField(field.image).map(
    (s) => `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]})`,
  );
}

/* Ground base drawn under the effect layer: the live clip, the CSS bloom, or a
   Paper Shader seeded from the bloom hues. */
function GroundBase({
  ground,
  videoRef,
  show,
  reduce,
}: {
  ground: Ground;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  show: boolean;
  reduce: boolean;
}) {
  if (!show) return null;
  if (ground.kind === "video") {
    return (
      <video
        ref={videoRef}
        src={ground.src}
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  if (ground.kind === "shader") {
    /* speed 0 halts the library's rAF loop under reduced motion (as HeroInkVeil
       relies on). The shader is seeded from the SAME bloom hues the shipped card
       uses, over the field's own near-white ground. */
    const speed = reduce ? 0 : 0.3;
    return ground.shader === "grain" ? (
      <GrainGradient
        className="absolute inset-0 h-full w-full"
        colorBack={ground.field.ground}
        colors={ground.palette}
        shape="wave"
        softness={0.85}
        intensity={0.42}
        noise={0.14}
        speed={speed}
      />
    ) : (
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={[ground.field.ground, ...ground.palette]}
        distortion={0.85}
        swirl={0.5}
        grainOverlay={0}
        speed={speed}
      />
    );
  }
  return (
    <div className="absolute inset-0" style={{ backgroundImage: ground.field.image }} />
  );
}

/* CSS dither preview — the production-feeding path. The dither overlay logic is
   unchanged; only the ground (clip OR bloom) and the optional card chrome are
   new, so the shipped tuner behaviour over the bare clips is identical. */
function CssDitherPreview({
  ground,
  card,
  overlayStyle,
  showDither,
  aspect,
  reduce,
}: {
  ground: Ground;
  card: CardInfo;
  overlayStyle: CSSProperties;
  showDither: boolean;
  aspect: string;
  reduce: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = ground.kind === "video";
  useEffect(() => {
    if (isVideo) videoRef.current?.play().catch(() => {});
  }, [isVideo]);
  return (
    <CoverBox aspect={aspect} bg={isVideo ? ground.bg : ground.field.ground}>
      <GroundBase ground={ground} videoRef={videoRef} show reduce={reduce} />
      {showDither ? (
        <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      ) : null}
      {card ? <CardChrome {...card} /> : null}
    </CoverBox>
  );
}

/* Strips reserved `_` keys before props reach a shader component. */
function shaderProps(params: ParamBag): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!k.startsWith("_")) out[k] = v;
  }
  return out;
}

function ShaderPreview({
  ground,
  card,
  effect,
  params,
  reduce,
  aspect,
}: {
  ground: Ground;
  card: CardInfo;
  effect: Effect;
  params: ParamBag;
  reduce: boolean;
  aspect: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState<string | null>(null);
  const grabbedRef = useRef(false);

  const isFilter = effect.render === "filter";
  const isOverlay = effect.render === "overlay";
  const isStandalone = effect.render === "standalone";
  const isVideo = ground.kind === "video";
  /* A live clip is only mounted when the effect draws over or samples it. */
  const needsVideoEl = isVideo && (isOverlay || isFilter);

  useEffect(() => {
    if (needsVideoEl) videoRef.current?.play().catch(() => {});
  }, [needsVideoEl]);

  /* Capture the still the image-input shaders filter. A video ground grabs one
     frame once it has real pixels; a field ground (bloom OR shader) paints its
     radial gradients natively with Canvas2D — no foreignObject, so the canvas
     never taints under WebKit and the filter reads in Safari as well as Chrome.
     The still is a property of the GROUND, not the effect, so it is reused
     across filters. */
  useEffect(() => {
    if (!isFilter || still || grabbedRef.current) return;

    /* Both the bloom and the shader ground carry a `field` we can paint natively
       as the filter's still input (a live shader canvas can't be read back, so a
       filter over the shader ground samples the field paint of the same hues,
       flagged in the UI). This one-shot Canvas2D capture replaces the old
       foreignObject raster, which taints under WebKit. */
    if ("field" in ground) {
      grabbedRef.current = true;
      const w = 512;
      const h = Math.round(w / ratioOf(aspect));
      const url = paintBloomField(ground.field, w, h);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (url) setStill(url);
      else grabbedRef.current = false;
      return;
    }

    const v = videoRef.current;
    if (!v) return;
    const grab = () => {
      if (v.videoWidth === 0 || still) return;
      const c = document.createElement("canvas");
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0);
      try {
        setStill(c.toDataURL("image/png"));
      } catch {
        /* Tainted canvas — leave the video showing as fallback. */
      }
    };
    v.addEventListener("loadeddata", grab);
    v.addEventListener("timeupdate", grab);
    if (v.readyState >= 2) grab();
    return () => {
      v.removeEventListener("loadeddata", grab);
      v.removeEventListener("timeupdate", grab);
    };
  }, [isFilter, still, ground, aspect]);

  const Comp = effect.Component;
  const speed = reduce ? 0 : ((params._speed as number) ?? 0);
  const base = shaderProps(params);

  let canvas: React.ReactNode = null;
  if (isOverlay) {
    canvas = (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: (params._blend as BlendMode) ?? "normal",
          opacity: (params._opacity as number) ?? 1,
        }}
      >
        <Comp
          {...base}
          colorBack="rgba(0, 0, 0, 0)"
          speed={speed}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  } else if (isStandalone) {
    canvas = (
      <Comp
        {...base}
        speed={speed}
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    );
  } else if (isFilter && still) {
    canvas = (
      <Comp
        {...base}
        image={still}
        speed={speed}
        fit="cover"
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  /* Ground base under the effect. A video shows only when it is drawn over or
     sampled; a bloom shows under an overlay and as the pre-raster fallback under
     a filter, but is hidden once a standalone or a resolved filter covers it. */
  const showGround = isVideo
    ? needsVideoEl
    : !isStandalone && !(isFilter && !!still);

  return (
    <CoverBox aspect={aspect} bg={isVideo ? ground.bg : ground.field.ground}>
      <GroundBase ground={ground} videoRef={videoRef} show={showGround} reduce={reduce} />
      {canvas}
      {card ? <CardChrome {...card} /> : null}
    </CoverBox>
  );
}

/* ───────────────────────── Readouts ───────────────────────────────────────── */

function shaderReadout(effect: Effect, params: ParamBag): string {
  const fmt = (v: ParamValue): string => {
    if (typeof v === "number") return `{${v}}`;
    if (typeof v === "boolean") return `{${v}}`;
    if (Array.isArray(v)) return `{[${v.map((c) => `"${c}"`).join(", ")}]}`;
    return `"${v}"`;
  };
  const lines: string[] = [];
  for (const c of effect.controls) {
    if (c.key.startsWith("_")) continue;
    const v = params[c.key];
    if (v === undefined) continue;
    lines.push(`  ${c.key}=${fmt(v)}`);
  }
  const speed = params._speed;
  if (typeof speed === "number") lines.push(`  speed={${speed}}`);
  if (effect.render === "overlay") lines.push(`  colorBack="rgba(0,0,0,0)"`);
  return `<${effect.tag}\n${lines.join("\n")}\n/>`;
}

/* ───────────────────────── Saved looks ────────────────────────────────────── */

/* A saved look is a complete snapshot of what's on screen: the preview mode, the
   ground shader (only meaningful in card-shader mode), the active effect, and
   that effect's full param bag (reserved _speed/_blend/_opacity keys included) —
   or, for the CSS dither, its whole Settings object. Enough to reproduce the
   exact composition when clicked.

   Persisted in localStorage under a namespaced, versioned key. The playground's
   state shape has changed several times and will change again, so the reader
   fails soft: anything missing, unparseable, or from an older schema version is
   ignored, never thrown. */
const SAVED_STORE_KEY = "dither-playground:saved-looks:v1";
const SAVED_SCHEMA_VERSION = 1;

type SavedLook = {
  id: string;
  name: string;
  createdAt: number;
  effectId: string;
  preview: Preview;
  groundShader: GroundShader;
  /* Exactly one of these carries the tunables: `settings` for the CSS dither,
     `params` for a Paper Shader effect. */
  settings: Settings | null;
  params: ParamBag | null;
};

type SavedStore = { version: number; looks: SavedLook[] };

function loadSavedLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<SavedStore>;
    if (
      !parsed ||
      parsed.version !== SAVED_SCHEMA_VERSION ||
      !Array.isArray(parsed.looks)
    ) {
      return [];
    }
    /* Keep only entries that still carry the fields we read; drop a stale-shaped
       one rather than crash on it. */
    return parsed.looks.filter(
      (l): l is SavedLook =>
        !!l &&
        typeof l.id === "string" &&
        typeof l.name === "string" &&
        typeof l.effectId === "string" &&
        typeof l.preview === "string",
    );
  } catch {
    return [];
  }
}

function writeSavedLooks(looks: SavedLook[]): void {
  if (typeof window === "undefined") return;
  try {
    const store: SavedStore = { version: SAVED_SCHEMA_VERSION, looks };
    window.localStorage.setItem(SAVED_STORE_KEY, JSON.stringify(store));
  } catch {
    /* Storage full or blocked — the in-session list still works. */
  }
}

function newLookId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the timestamp id */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ───────────────────────── Page ──────────────────────────────────────────── */

export default function DitherPlayground() {
  // Dev-only scratch tool: 404 it out of production. NODE_ENV is inlined at
  // build time, so this branch is constant per build — it never runs in dev
  // and always short-circuits before the hooks below in a production build.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // `useReducedMotion` resolves to false during SSR and can flip to true on the
  // client, so reading it directly makes the reduced-motion note (and shader
  // speed) differ between the server and first client render — a hydration
  // mismatch. Gate it behind a mount flag so both agree on false first, then the
  // real preference applies one render later (the same "one extra render is
  // fine" tradeoff the deep-link read below already takes).
  const prefersReduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const reduce = mounted && prefersReduce;

  const [effectId, setEffectId] = useState<string>("css");
  const [preview, setPreview] = useState<Preview>("video");
  const [groundShader, setGroundShader] = useState<GroundShader>("mesh");
  const [s, setS] = useState<Settings>(SHIPPED);
  const [copied, setCopied] = useState(false);

  // Deep-link the active effect (?effect=god-rays) so a look is shareable and
  // each mode is directly capturable. Read once on mount; the select owns it
  // thereafter.
  useEffect(() => {
    // One-shot read on mount (not a lazy useState initializer, which would run
    // during SSR and mismatch hydration when ?effect= is present). The single
    // extra render this costs is fine for a dev tool.
    const q = new URLSearchParams(window.location.search);
    const id = q.get("effect");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id && (id === "css" || EFFECT_BY_ID.has(id))) setEffectId(id);
    const p = q.get("preview");
    if (
      p === "video" ||
      p === "card-current" ||
      p === "card-video" ||
      p === "card-shader"
    )
      setPreview(p);
    const g = q.get("ground");
    if (g === "mesh" || g === "grain") setGroundShader(g);
  }, []);

  // One param bag per shader effect, lazily seeded from its defaults so edits
  // survive switching away and back within a session.
  const [bags, setBags] = useState<Record<string, ParamBag>>({});

  const tone = toneOf(preview);
  const isCss = effectId === "css";
  const effect = isCss ? null : EFFECT_BY_ID.get(effectId) ?? null;
  const key = effect ? bagKey(effect.id, tone) : "";
  const params: ParamBag =
    effect ? bags[key] ?? defaultsFor(effect, tone) : {};

  const setParam = (paramKey: string, val: ParamValue) => {
    if (!effect) return;
    setBags((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? defaultsFor(effect, tone)), [paramKey]: val },
    }));
  };
  const setColorAt = (paramKey: string, i: number, val: string) => {
    if (!effect) return;
    const cur = (params[paramKey] as string[]) ?? [];
    const next = cur.slice();
    next[i] = val;
    setParam(paramKey, next);
  };
  const resetEffect = () => {
    if (!effect) return;
    setBags((prev) => ({ ...prev, [key]: defaultsFor(effect, tone) }));
  };

  const set = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  /* CSS dither derived values — unchanged. */
  const effLight = s.inverted ? s.dark : s.light;
  const effDark = s.inverted ? s.light : s.dark;
  const maxSpeck = Math.floor((s.matrix * s.matrix) / 2);
  const coverage = Math.round((s.speckCount * 2 * 100) / (s.matrix * s.matrix));
  const tile = buildDitherTile({
    matrix: s.matrix,
    speckCount: s.speckCount,
    light: effLight,
    dark: effDark,
  });
  const tilePx = s.matrix * s.cellPx;
  const overlayStyle: CSSProperties = {
    backgroundImage: tile,
    backgroundRepeat: "repeat",
    backgroundSize: `${tilePx}px ${tilePx}px`,
    imageRendering: "pixelated",
    mixBlendMode: s.blendMode,
    opacity: s.opacity,
  };
  /* Over a pale ground the shipped soft-light finish (tuned for the dark video
     covers) is near-invisible — the reported "effect not applied". The PREVIEW
     ONLY switches to a literal salt-and-pepper print so the dither reads on
     near-white; `s`, and therefore the readout that feeds the video cover, is
     left exactly as tuned. */
  const cssPaleAdapted = tone === "pale" && s.showDither;
  const cssOverlayStyle: CSSProperties = cssPaleAdapted
    ? { ...overlayStyle, mixBlendMode: "normal", opacity: 0.5 }
    : overlayStyle;
  const cssReadout = [
    `const SPECK_LIGHT = "${effLight.toUpperCase()}";`,
    `const SPECK_DARK = "${effDark.toUpperCase()}";`,
    `const BAYER_SIZE = ${s.matrix};`,
    `const SPECK_COUNT = ${s.speckCount};`,
    `export const DITHER_REST_OPACITY = ${s.opacity};`,
    `const CELL_PX = ${s.cellPx};`,
    `const BLEND_MODE = "${s.blendMode}";`,
  ].join("\n");

  const readout = isCss || !effect ? cssReadout : shaderReadout(effect, params);

  /* One tile per subject, its ground and card chrome set by the preview mode.
     The card modes render the shipped 5:7 card; the bare mode keeps the archived
     1.18/1 clip tiles. Every tile takes the active effect the same way. */
  type Tile = { key: string; ground: Ground; card: CardInfo; aspect: string; label: string };
  const tiles: Tile[] = SUBJECTS.map((subject): Tile => {
    const entry = getCaseStudy(subject.slug);
    const field = getField(subject.slug);
    const videoGround: Ground = { kind: "video", src: subject.video, bg: subject.videoField };

    if (preview === "video" || !entry) {
      return { key: subject.slug, ground: videoGround, card: null, aspect: VIDEO_ASPECT, label: subject.videoLabel };
    }
    if (preview === "card-current") {
      return {
        key: subject.slug,
        ground: { kind: "bloom", field },
        card: { entry, ink: field.ink, scrim: false, layout: "centred" },
        aspect: CARD_ASPECT,
        label: `${entry.title} — current design`,
      };
    }
    if (preview === "card-shader") {
      return {
        key: subject.slug,
        ground: {
          kind: "shader",
          field,
          shader: groundShader,
          palette: shaderPalette(field),
        },
        card: { entry, ink: field.ink, scrim: false, layout: "centred" },
        aspect: CARD_ASPECT,
        label: `${entry.title} — ${groundShader} shader ground`,
      };
    }
    return {
      key: subject.slug,
      ground: videoGround,
      card: { entry, ink: CARD_ON_VIDEO_INK, scrim: true, layout: "caption" },
      aspect: CARD_ASPECT,
      label: `${entry.title} — video ground`,
    };
  });
  const cardMode = preview !== "video";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(readout);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* Clipboard blocked; the panel text is selectable as a fallback. */
    }
  };

  const applyMatrix = (next: number) =>
    setS((prev) => ({
      ...prev,
      matrix: next,
      speckCount: Math.min(prev.speckCount, Math.floor((next * next) / 2)),
    }));

  /* ── Saved looks ── snapshot the whole on-screen composition, restore on click.
     Read from localStorage after mount only, so SSR and the first client render
     agree on an empty list (the same hydration-safe pattern as the deep-link and
     reduced-motion reads above). Writes happen inline in the mutation handlers,
     not via a reactive effect, so the initial empty list can never clobber
     stored looks before the load runs. */
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [saveName, setSaveName] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedLooks(loadSavedLooks());
  }, []);

  const previewLabel =
    PREVIEW_OPTIONS.find((o) => o.value === preview)?.label ?? preview;
  const autoName = isCss
    ? `CSS dither · ${previewLabel}`
    : `${effect?.label ?? effectId} · ${previewLabel}${
        preview === "card-shader" ? ` (${groundShader})` : ""
      }`;

  const persistLooks = (next: SavedLook[]) => {
    setSavedLooks(next);
    writeSavedLooks(next);
  };

  const saveCurrentLook = () => {
    const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
    const look: SavedLook = {
      id: newLookId(),
      name: saveName.trim() || autoName,
      createdAt: Date.now(),
      effectId,
      preview,
      groundShader,
      settings: isCss ? clone(s) : null,
      params: isCss ? null : clone(params),
    };
    persistLooks([look, ...savedLooks]);
    setSaveName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1400);
  };

  const deleteLook = (id: string) =>
    persistLooks(savedLooks.filter((l) => l.id !== id));

  const applyLook = (look: SavedLook) => {
    setEffectId(look.effectId);
    setPreview(look.preview);
    setGroundShader(look.groundShader);
    if (look.effectId === "css") {
      if (look.settings) setS(look.settings);
    } else if (look.params) {
      const k = bagKey(look.effectId, toneOf(look.preview));
      const bag = look.params;
      setBags((prev) => ({ ...prev, [k]: bag }));
    }
  };

  /* The saved look (if any) whose full snapshot matches what's on screen right
     now — drives the "you are here" dot in the list. Ground shader only counts
     in card-shader mode; tunables compare by value. */
  const activeLookId =
    savedLooks.find((look) => {
      if (look.effectId !== effectId || look.preview !== preview) return false;
      if (
        look.preview === "card-shader" &&
        look.groundShader !== groundShader
      ) {
        return false;
      }
      return look.effectId === "css"
        ? JSON.stringify(look.settings) === JSON.stringify(s)
        : JSON.stringify(look.params) === JSON.stringify(params);
    })?.id ?? null;

  /* Renders one Control descriptor onto a Leva primitive. */
  const renderControl = (c: Control): React.ReactNode => {
    if (c.kind === "slider") {
      const v = (params[c.key] as number) ?? 0;
      const digits = c.digits ?? 0;
      return (
        <Row key={c.key} label={c.label}>
          <Slider
            value={v}
            min={c.min}
            max={c.max}
            step={c.step}
            onChange={(n) => setParam(c.key, n)}
            display={v.toFixed(digits)}
          />
        </Row>
      );
    }
    if (c.kind === "color") {
      return (
        <ColorRow
          key={c.key}
          label={c.label}
          value={(params[c.key] as string) ?? "#000000"}
          onChange={(val) => setParam(c.key, val)}
        />
      );
    }
    if (c.kind === "colors") {
      const arr = (params[c.key] as string[]) ?? [];
      return (
        <div key={c.key}>
          {Array.from({ length: c.count }).map((_, i) => (
            <ColorRow
              key={i}
              label={`${c.label} ${i + 1}`}
              value={arr[i] ?? "#000000"}
              onChange={(val) => setColorAt(c.key, i, val)}
            />
          ))}
        </div>
      );
    }
    if (c.kind === "check") {
      return (
        <CheckRow
          key={c.key}
          label={c.label}
          checked={Boolean(params[c.key])}
          onChange={(val) => setParam(c.key, val)}
        />
      );
    }
    // select
    return (
      <SelectRow
        key={c.key}
        label={c.label}
        value={String(params[c.key] ?? c.options[0])}
        options={c.options.map((o) => ({ value: o, label: o }))}
        onChange={(val) => setParam(c.key, val)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-900 sm:p-8">
      <style>{`
        .lva-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        .lva-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #d4d8dc; border: none; cursor: pointer; }
        .lva-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #d4d8dc; border: none; cursor: pointer; }
        .lva-swatch { -webkit-appearance: none; appearance: none; border: none; padding: 0; background: transparent; }
        .lva-swatch::-webkit-color-swatch-wrapper { padding: 0; }
        .lva-swatch::-webkit-color-swatch { border: 1px solid #3a4046; border-radius: 3px; }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-lg font-semibold">Cover effects playground</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            CSS dither (default) tunes the shipped video-cover finish and prints
            copy-pasteable constants for
            <code className="mx-1 rounded bg-neutral-200 px-1 py-0.5 text-xs">
              DitherOverlay.tsx
            </code>
            . The other effects are real Paper Shaders driven through the same
            panel. Not linked from the site.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_16rem]">
          {/* Previews */}
          <section className="grid gap-6 sm:grid-cols-2">
            {tiles.map((tile) => (
              <figure
                key={tile.key}
                className={cardMode ? "mx-auto m-0 w-full max-w-xs" : "m-0"}
              >
                {isCss || !effect ? (
                  <CssDitherPreview
                    ground={tile.ground}
                    card={tile.card}
                    overlayStyle={cssOverlayStyle}
                    showDither={s.showDither}
                    aspect={tile.aspect}
                    reduce={reduce}
                  />
                ) : (
                  <ShaderPreview
                    ground={tile.ground}
                    card={tile.card}
                    effect={effect}
                    params={params}
                    reduce={reduce}
                    aspect={tile.aspect}
                  />
                )}
                <figcaption className="mt-2 text-xs text-neutral-500">
                  {tile.label}
                </figcaption>
              </figure>
            ))}
            {isCss ? (
              <p className="text-xs text-neutral-500 sm:col-span-2">
                {cssPaleAdapted
                  ? "Preview blend adapted for the pale ground (normal @ 0.5) so the dither reads over near-white — the readout still prints the shipped video-finish values, unchanged."
                  : "The dither previews over the dark video finish it ships on."}
                {reduce ? " Reduced motion is on." : ""}
              </p>
            ) : effect ? (
              <p className="text-xs text-neutral-500 sm:col-span-2">
                {RENDER_NOTE[effect.render]}
                {preview === "card-shader"
                  ? " Ground is a Paper Shader seeded from this project's bloom hues."
                  : ""}
                {effect.render === "overlay" && tone === "pale"
                  ? " Blend and opacity defaulted for the pale ground so the overlay reads over near-white."
                  : ""}
                {effect.render === "filter" && preview === "card-shader"
                  ? " Filters can't read the live shader, so this samples a native paint of the same bloom hues."
                  : ""}
                {cardMode
                  ? " Title, tag, and mark are the shipped card composition over the effect."
                  : ""}
                {reduce ? " Reduced motion is on: speed is pinned to 0." : ""}
              </p>
            ) : null}
          </section>

          {/* Leva-style control panel */}
          <aside className="overflow-hidden rounded-lg border border-[#2c3238] bg-[#181c20] text-[#c8ccd0] shadow-xl lg:sticky lg:top-8">
            <div className="flex items-center justify-between border-b border-[#2c3238] px-2.5 py-2">
              <span className="text-[11px] font-medium tracking-wide text-[#c8ccd0]">
                {isCss ? "dither" : effect?.label.toLowerCase()}
              </span>
              <button
                type="button"
                onClick={() => (isCss ? setS(SHIPPED) : resetEffect())}
                className="rounded border border-[#2c3238] px-1.5 py-0.5 text-[10px] text-[#8a9096] hover:bg-[#20262b] hover:text-[#c8ccd0]"
              >
                reset
              </button>
            </div>

            {/* Effect switcher */}
            <div className="border-b border-[#2c3238] px-2.5 py-2">
              <span className="text-[10px] uppercase tracking-wider text-[#6f767c]">
                Effect
              </span>
              <select
                value={effectId}
                onChange={(e) => setEffectId(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1.5 font-mono text-[11px] text-[#c8ccd0] outline-none"
              >
                {EFFECT_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.ids.map((id) => (
                      <option key={id} value={id}>
                        {id === "css"
                          ? "CSS dither"
                          : EFFECT_BY_ID.get(id)?.label ?? id}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Preview switcher — what the active effect is drawn on. Bare clip,
                or the real home-card composition over the bloom / a clip. */}
            <div className="border-b border-[#2c3238] px-2.5 py-2">
              <span className="text-[10px] uppercase tracking-wider text-[#6f767c]">
                Preview
              </span>
              <select
                value={preview}
                onChange={(e) => setPreview(e.target.value as Preview)}
                className="mt-1.5 w-full rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1.5 font-mono text-[11px] text-[#c8ccd0] outline-none"
              >
                {PREVIEW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {preview === "card-shader" ? (
                <div className="mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#6f767c]">
                    Ground shader
                  </span>
                  <select
                    value={groundShader}
                    onChange={(e) => setGroundShader(e.target.value as GroundShader)}
                    className="mt-1.5 w-full rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1.5 font-mono text-[11px] text-[#c8ccd0] outline-none"
                  >
                    <option value="mesh">MeshGradient</option>
                    <option value="grain">GrainGradient</option>
                  </select>
                </div>
              ) : null}
            </div>

            {isCss ? (
              <>
                <div className="px-2.5 pb-2 pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#6f767c]">
                    Presets
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    {INK_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() =>
                          setS((prev) => ({ ...prev, light: p.light, dark: p.dark }))
                        }
                        className="flex items-center justify-center gap-1.5 rounded bg-[#242a30] px-2 py-1.5 text-[11px] text-[#c8ccd0] hover:bg-[#2c343b]"
                      >
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full border border-[#3a4046]"
                          style={{
                            background: `linear-gradient(135deg, ${p.light} 50%, ${p.dark} 50%)`,
                          }}
                        />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#2c3238] py-0.5">
                  <ColorRow label="inkLight" value={s.light} onChange={(v) => set("light", v)} />
                  <ColorRow label="inkDark" value={s.dark} onChange={(v) => set("dark", v)} />
                  <CheckRow
                    label="inverted"
                    checked={s.inverted}
                    onChange={(v) => set("inverted", v)}
                  />
                  <CheckRow
                    label="showDither"
                    checked={s.showDither}
                    onChange={(v) => set("showDither", v)}
                  />
                  <SelectRow
                    label="type"
                    value={String(s.matrix)}
                    options={MATRIX_OPTIONS.map((m) => ({
                      value: String(m),
                      label: `${m}x${m}`,
                    }))}
                    onChange={(v) => applyMatrix(Number(v))}
                  />
                  <Row label="cellScale">
                    <Slider
                      value={s.cellPx}
                      min={0.5}
                      max={8}
                      step={0.5}
                      onChange={(v) => set("cellPx", v)}
                      display={s.cellPx.toFixed(1)}
                    />
                  </Row>
                  <Row label="coverage">
                    <Slider
                      value={s.speckCount}
                      min={0}
                      max={maxSpeck}
                      step={1}
                      onChange={(v) => set("speckCount", v)}
                      display={`${coverage}%`}
                    />
                  </Row>
                  <Row label="opacity">
                    <Slider
                      value={s.opacity}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(v) => set("opacity", v)}
                      display={s.opacity.toFixed(2)}
                    />
                  </Row>
                  <SelectRow
                    label="blendMode"
                    value={s.blendMode}
                    options={BLEND_MODES.map((m) => ({ value: m, label: m }))}
                    onChange={(v) => set("blendMode", v as BlendMode)}
                  />
                </div>
              </>
            ) : effect ? (
              <div className="border-t border-[#2c3238] py-0.5">
                {effect.controls.map((c) => renderControl(c))}
              </div>
            ) : null}

            {/* Saved looks — snapshot the whole composition, click to restore. */}
            <div className="border-t border-[#2c3238] px-2.5 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#6f767c]">
                  Saved
                </span>
                {savedLooks.length ? (
                  <span className="font-mono text-[10px] text-[#6f767c]">
                    {savedLooks.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-1.5 flex items-center gap-1">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCurrentLook();
                  }}
                  placeholder={autoName}
                  spellCheck={false}
                  aria-label="Name this look"
                  className="min-w-0 flex-1 rounded border border-[#2c3238] bg-[#0f1316] px-1.5 py-1 font-mono text-[11px] text-[#c8ccd0] outline-none placeholder:text-[#5b6167]"
                />
                <button
                  type="button"
                  onClick={saveCurrentLook}
                  className="shrink-0 rounded border px-2 py-1 text-[10px] font-medium hover:bg-[#20262b]"
                  style={
                    justSaved
                      ? { color: ACCENT, borderColor: ACCENT }
                      : { color: "#8a9096", borderColor: "#2c3238" }
                  }
                >
                  {justSaved ? "Saved" : "Save"}
                </button>
              </div>

              {savedLooks.length === 0 ? (
                <p className="mt-2 text-[10px] leading-relaxed text-[#5b6167]">
                  Save the current effect, preview, and params as a look. Click a
                  saved look to restore it exactly.
                </p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {savedLooks.map((look) => {
                    const active = look.id === activeLookId;
                    return (
                      <li key={look.id} className="flex items-stretch gap-1">
                        <button
                          type="button"
                          onClick={() => applyLook(look)}
                          aria-pressed={active}
                          title={look.name}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded border px-1.5 py-1 text-left hover:bg-[#20262b]"
                          style={{
                            borderColor: active ? ACCENT : "#2c3238",
                            background: active ? "#20262b" : "#0f1316",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: active ? ACCENT : "#3a4046" }}
                          />
                          <span className="min-w-0 flex-1 truncate text-[11px] text-[#c8ccd0]">
                            {look.name}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLook(look.id)}
                          aria-label={`Delete ${look.name}`}
                          className="shrink-0 rounded border border-[#2c3238] px-1.5 text-[11px] leading-none text-[#6f767c] hover:border-[#5a3a3a] hover:text-[#d98a8a]"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>

        {/* Readout */}
        <section className="mt-8 rounded-xl border border-neutral-300 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {isCss ? "Copy into DitherOverlay.tsx" : `Copy the <${effect?.tag} /> props`}
            </h2>
            <button
              type="button"
              onClick={copy}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-100"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100">
            <code>{readout}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
