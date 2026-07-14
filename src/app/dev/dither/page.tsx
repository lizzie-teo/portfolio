"use client";

/* Local dev tool — not linked from any nav. Tunes the cover dither finish
   live against the two real video covers, then prints copy-pasteable
   constants for DitherOverlay.tsx. The control panel mirrors the Paper Shaders
   image-dithering demo (a compact dark Leva-style panel: presets, colour
   swatch rows, checkboxes, a type select, and value-boxed sliders) mapped onto
   our CSS-tile approach. It reuses buildDitherTile so the preview can never
   drift from what ships. */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { buildDitherTile, DITHER_DEFAULTS } from "../../components/DitherOverlay";

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

/* The two shipped covers, previewed at home-card size with their real fields. */
const COVERS = [
  {
    label: "Healthdirect Symptom Checker",
    src: "/assets/healthdirect/sc-card-cover-assets/child-unwell.mp4",
    field: "#0F2830",
  },
  {
    label: "AP+ Testing Portal",
    src: "/assets/ap-testing-portal/ap-card-cover-assets/ap-testing-portal.mp4",
    field: "#0D033C",
  },
];

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

function CoverPreview({
  cover,
  overlayStyle,
  showDither,
}: {
  cover: (typeof COVERS)[number];
  overlayStyle: CSSProperties;
  showDither: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      /* Autoplay may be blocked; the first frame still previews the finish. */
    });
  }, []);

  return (
    <figure className="m-0">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "1.18 / 1", backgroundColor: cover.field }}
      >
        <video
          ref={videoRef}
          src={cover.src}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showDither ? (
          <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
        ) : null}
      </div>
      <figcaption className="mt-2 text-xs text-neutral-500">{cover.label}</figcaption>
    </figure>
  );
}

/* ---- Leva-style panel primitives ---- */

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

export default function DitherPlayground() {
  const [s, setS] = useState<Settings>(SHIPPED);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  /* Inversion swaps which ink lands on highlights vs shadows, and bakes into
     the copied constants so the shipped values reflect the choice. */
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

  const readout = [
    `const SPECK_LIGHT = "${effLight.toUpperCase()}";`,
    `const SPECK_DARK = "${effDark.toUpperCase()}";`,
    `const BAYER_SIZE = ${s.matrix};`,
    `const SPECK_COUNT = ${s.speckCount};`,
    `export const DITHER_REST_OPACITY = ${s.opacity};`,
    `const CELL_PX = ${s.cellPx};`,
    `const BLEND_MODE = "${s.blendMode}";`,
  ].join("\n");

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
          <h1 className="text-lg font-semibold">Cover dither playground</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Live tuning for the video-cover dither, modelled on the Paper Shaders
            image-dithering controls. Not linked from the site. Find a look, copy
            the constants, paste them into
            <code className="mx-1 rounded bg-neutral-200 px-1 py-0.5 text-xs">
              DitherOverlay.tsx
            </code>
            .
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_16rem]">
          {/* Previews */}
          <section className="grid gap-6 sm:grid-cols-2">
            {COVERS.map((cover) => (
              <CoverPreview
                key={cover.src}
                cover={cover}
                overlayStyle={overlayStyle}
                showDither={s.showDither}
              />
            ))}
          </section>

          {/* Leva-style control panel */}
          <aside className="overflow-hidden rounded-lg border border-[#2c3238] bg-[#181c20] text-[#c8ccd0] shadow-xl lg:sticky lg:top-8">
            <div className="flex items-center justify-between border-b border-[#2c3238] px-2.5 py-2">
              <span className="text-[11px] font-medium tracking-wide text-[#c8ccd0]">
                dither
              </span>
              <button
                type="button"
                onClick={() => setS(SHIPPED)}
                className="rounded border border-[#2c3238] px-1.5 py-0.5 text-[10px] text-[#8a9096] hover:bg-[#20262b] hover:text-[#c8ccd0]"
              >
                reset
              </button>
            </div>

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
          </aside>
        </div>

        {/* Readout */}
        <section className="mt-8 rounded-xl border border-neutral-300 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Copy into DitherOverlay.tsx</h2>
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
