"use client";

import { useInView } from "motion/react";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   Hero keyword field — one particle system, five formations.

   The blank space to the right of the hero copy holds a single field of dots.
   Hovering (or focusing) a keyword in the copy hands this field a formation:
   the *same* particles rearrange into a different arrangement per word, so the
   field reads as one system reconfiguring itself — a design-systems thesis in
   motion, which is the point of the page.

     complexity     an interconnected tangle — every node wired to its nearest
     users          a scattered crowd of individuals, a few standing prouder
     designSystems  a clean modular lattice, order out of the scatter
     stakeholders   a small network of hubs with their satellites and links
     vibeCoder      loose rhythmic waves, the playful one

   None of this is WebGL — it is Canvas 2D plus arithmetic, the same discipline
   as the card covers (see .docs/cover-effects.md): state in refs, imperative
   draws (no per-frame React re-renders), a self-terminating rAF loop, dt
   clamped, dpr capped at 2, off-screen pause via useInView. The field only
   ever shows on the dark grout band (it fades in with the band on activation),
   so its ink is a warm off-white on grout — decorative artwork, aria-hidden,
   never a shell token.

   Reduced motion: no rAF, no morph, no wave. The active formation is drawn
   once as a static composition and cleared on deactivation. Every state stays
   reachable and readable without motion.
──────────────────────────────────────────────────────────────────────────── */

export type HeroKeyword =
  | "complexity"
  | "users"
  | "designSystems"
  | "stakeholders"
  | "vibeCoder"
  | "figmaToCode";

/* Scene constants — artwork ink, not shell tokens. The warm off-white matches
   --grout-foreground so the field sits in the same tonal family as the band's
   text; it is decorative (aria-hidden) so it carries no contrast requirement,
   but at ~7:1 on the grout it stays clearly legible as a composition. */
const INK = "#F1ECE5";
const PARTICLE_COUNT = 120;
const WAVE_BANDS = 3;
const NETWORK_HUBS = 5;

type Formation = {
  tx: Float32Array; // target x, css px
  ty: Float32Array; // target y, css px
  pr: Float32Array; // per-particle radius factor
  links: Array<[number, number]>;
  wave: boolean; // formation animates its own y over time
  waveBaseX: Float32Array;
  waveBand: Float32Array;
};

/* Small seeded RNG (mulberry32) so a given formation is deterministic — the
   scatter does not jump on resize, and the morph between two formations is
   always the same rearrangement of the same points. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS: Record<HeroKeyword, number> = {
  complexity: 11,
  users: 23,
  designSystems: 37,
  stakeholders: 53,
  vibeCoder: 71,
  // Filmed keyword (see StatementHero) — the field is handed null while it is
  // lit, so this seed only satisfies the exhaustive record.
  figmaToCode: 89,
};

function emptyFormation(): Formation {
  return {
    tx: new Float32Array(PARTICLE_COUNT),
    ty: new Float32Array(PARTICLE_COUNT),
    pr: new Float32Array(PARTICLE_COUNT).fill(1),
    links: [],
    wave: false,
    waveBaseX: new Float32Array(PARTICLE_COUNT),
    waveBand: new Float32Array(PARTICLE_COUNT),
  };
}

function computeFormation(
  kind: HeroKeyword,
  w: number,
  h: number,
): Formation {
  const f = emptyFormation();
  const rng = makeRng(SEEDS[kind]);
  const padX = w * 0.08;
  const padY = h * 0.14;
  const iw = Math.max(1, w - padX * 2);
  const ih = Math.max(1, h - padY * 2);
  const n = PARTICLE_COUNT;

  if (kind === "designSystems") {
    // Modular lattice — order out of scatter.
    const cols = Math.max(4, Math.round(Math.sqrt(n * (iw / ih))));
    const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      f.tx[i] = padX + (cols === 1 ? iw / 2 : (c / (cols - 1)) * iw);
      f.ty[i] = padY + (rows === 1 ? ih / 2 : (r / (rows - 1)) * ih);
      f.pr[i] = 1;
    }
    return f;
  }

  if (kind === "users") {
    // A crowd of individuals — best-candidate spread, a few standing prouder.
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      let best: [number, number] = [0, 0];
      let bestD = -1;
      const tries = 8;
      for (let t = 0; t < tries; t++) {
        const cx = padX + rng() * iw;
        const cy = padY + rng() * ih;
        let d = Infinity;
        for (const [ox, oy] of pts) {
          const dd = (cx - ox) ** 2 + (cy - oy) ** 2;
          if (dd < d) d = dd;
        }
        if (d > bestD) {
          bestD = d;
          best = [cx, cy];
        }
      }
      pts.push(best);
      f.tx[i] = best[0];
      f.ty[i] = best[1];
      f.pr[i] = rng() < 0.16 ? 1.6 + rng() * 0.6 : 0.7 + rng() * 0.4;
    }
    return f;
  }

  if (kind === "complexity") {
    // Scatter, then wire each node to its two nearest — a dense tangle.
    for (let i = 0; i < n; i++) {
      f.tx[i] = padX + rng() * iw;
      f.ty[i] = padY + rng() * ih;
      f.pr[i] = 0.85 + rng() * 0.3;
    }
    const seen = new Set<string>();
    for (let i = 0; i < n; i++) {
      const d: Array<[number, number]> = [];
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        d.push([(f.tx[i] - f.tx[j]) ** 2 + (f.ty[i] - f.ty[j]) ** 2, j]);
      }
      d.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < 2; k++) {
        const j = d[k][1];
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        f.links.push([i, j]);
      }
    }
    return f;
  }

  if (kind === "stakeholders") {
    // A few hubs, each with a ring of satellites; hubs chained together.
    const hubs: Array<[number, number]> = [];
    for (let hHub = 0; hHub < NETWORK_HUBS; hHub++) {
      const hx = padX + ((hHub + 0.5) / NETWORK_HUBS) * iw + (rng() - 0.5) * iw * 0.08;
      const hy = padY + (0.28 + rng() * 0.44) * ih;
      hubs.push([hx, hy]);
      f.tx[hHub] = hx;
      f.ty[hHub] = hy;
      f.pr[hHub] = 2.1 + rng() * 0.5;
    }
    for (let i = NETWORK_HUBS; i < n; i++) {
      const hHub = Math.floor(rng() * NETWORK_HUBS);
      const ang = rng() * Math.PI * 2;
      const rad = (0.05 + rng() * 0.11) * Math.min(iw, ih) + 14;
      f.tx[i] = Math.min(w - padX * 0.4, Math.max(padX * 0.4, hubs[hHub][0] + Math.cos(ang) * rad));
      f.ty[i] = Math.min(h - padY * 0.4, Math.max(padY * 0.4, hubs[hHub][1] + Math.sin(ang) * rad * 0.9));
      f.pr[i] = 0.7 + rng() * 0.3;
      f.links.push([hHub, i]);
    }
    for (let hHub = 0; hHub < NETWORK_HUBS - 1; hHub++) f.links.push([hHub, hHub + 1]);
    return f;
  }

  // vibeCoder — loose rhythmic waves.
  const per = Math.ceil(n / WAVE_BANDS);
  for (let i = 0; i < n; i++) {
    const band = Math.floor(i / per);
    const idxInBand = i - band * per;
    const bx = padX + (idxInBand / Math.max(1, per - 1)) * iw;
    f.waveBaseX[i] = bx;
    f.waveBand[i] = band;
    f.tx[i] = bx;
    f.ty[i] = padY + ((band + 0.5) / WAVE_BANDS) * ih;
    f.pr[i] = 0.8 + (i % 3) * 0.12;
  }
  f.wave = true;
  return f;
}

function waveY(f: Formation, i: number, h: number, phase: number): number {
  const padY = h * 0.14;
  const ih = Math.max(1, h - padY * 2);
  const band = f.waveBand[i];
  const baseY = padY + ((band + 0.5) / WAVE_BANDS) * ih;
  const amp = ih * 0.11;
  const k = (Math.PI * 2) / Math.max(120, f.waveBaseX.length * 3);
  return baseY + Math.sin(f.waveBaseX[i] * (0.012 + band * 0.002) + phase + band) * amp * (0.7 + 0.3 * Math.sin(f.waveBaseX[i] * k));
}

export function HeroKeywordField({
  active,
  reduced,
  className,
}: {
  active: HeroKeyword | null;
  reduced: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "200px" });

  // Live particle state — held in refs so the rAF loop never re-renders React.
  const px = useRef(new Float32Array(PARTICLE_COUNT));
  const py = useRef(new Float32Array(PARTICLE_COUNT));
  const formation = useRef<Formation | null>(null);
  const intro = useRef(0); // 0 hidden, 1 fully present
  const introTarget = useRef(0);
  const phase = useRef(0);
  const activeRef = useRef<HeroKeyword | null>(null);
  const inViewRef = useRef(inView);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const seededRef = useRef(false);
  // Bridge from React prop → imperative applier (assigned inside the effect).
  const applyRef = useRef<((next: HeroKeyword | null) => void) | null>(null);
  const ensureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { w, h } = sizeRef.current;
      const f = formation.current;
      ctx.clearRect(0, 0, w, h);
      if (!f || intro.current <= 0.001) return;
      const baseR = Math.min(Math.max(Math.min(w, h) * 0.0072, 1.56), 3.6);
      const a = intro.current;

      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      for (const [i, j] of f.links) {
        ctx.globalAlpha = 0.1 * a;
        ctx.beginPath();
        ctx.moveTo(px.current[i], py.current[i]);
        ctx.lineTo(px.current[j], py.current[j]);
        ctx.stroke();
      }

      ctx.fillStyle = INK;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const r = baseR * f.pr[i];
        ctx.globalAlpha = a * Math.min(1, 0.4 + 0.45 * f.pr[i]);
        ctx.beginPath();
        ctx.arc(px.current[i], py.current[i], r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Static (reduced-motion) render: snap to targets and draw once.
    const renderStatic = () => {
      const f = formation.current;
      if (!f) return;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        px.current[i] = f.tx[i];
        py.current[i] = f.wave ? waveY(f, i, sizeRef.current.h, 0) : f.ty[i];
      }
      intro.current = 1;
      draw();
    };

    let last = 0;
    const loop = (now: number) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.064);
      last = now;

      intro.current += (introTarget.current - intro.current) * Math.min(1, dt * 6);
      const f = formation.current;
      let moving = false;
      if (f) {
        const k = 1 - Math.pow(0.0012, dt); // framerate-independent settle
        if (f.wave && activeRef.current) phase.current += dt * 0.7;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const tyi = f.wave ? waveY(f, i, sizeRef.current.h, phase.current) : f.ty[i];
          px.current[i] += (f.tx[i] - px.current[i]) * k;
          py.current[i] += (tyi - py.current[i]) * k;
          if (
            Math.abs(f.tx[i] - px.current[i]) > 0.4 ||
            Math.abs(tyi - py.current[i]) > 0.4
          )
            moving = true;
        }
      }

      draw();

      const introSettled = Math.abs(introTarget.current - intro.current) < 0.004;
      if (activeRef.current === null && intro.current < 0.01) {
        intro.current = 0;
        ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h);
        runningRef.current = false;
        return;
      }
      const keepAnimating =
        !!(f && f.wave && activeRef.current) || moving || !introSettled;
      if (!keepAnimating) {
        runningRef.current = false;
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const ensureRunning = () => {
      if (reduced) return;
      if (!inViewRef.current) return;
      if (runningRef.current) return;
      runningRef.current = true;
      last = 0;
      rafRef.current = requestAnimationFrame(loop);
    };

    const applyActive = (next: HeroKeyword | null) => {
      activeRef.current = next;
      const { w, h } = sizeRef.current;
      if (next) {
        formation.current = computeFormation(next, w, h);
        // First reveal ever seeds a scatter so the field assembles from noise;
        // subsequent switches morph from wherever the points already are.
        if (!seededRef.current) {
          const rng = makeRng(9);
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            px.current[i] = w * 0.08 + rng() * w * 0.84;
            py.current[i] = h * 0.14 + rng() * h * 0.72;
          }
          seededRef.current = true;
        }
        introTarget.current = 1;
      } else {
        introTarget.current = 0;
      }
      if (reduced) {
        if (next) renderStatic();
        else {
          intro.current = 0;
          ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h);
        }
        return;
      }
      ensureRunning();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === 0 || h === 0) return;
      const prev = sizeRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Scale live positions so a resize does not teleport an in-flight morph.
      if (prev.w > 0 && prev.h > 0) {
        const sx = w / prev.w;
        const sy = h / prev.h;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          px.current[i] *= sx;
          py.current[i] *= sy;
        }
      }
      sizeRef.current = { w, h };
      if (activeRef.current) formation.current = computeFormation(activeRef.current, w, h);
      if (reduced && activeRef.current) renderStatic();
      else if (intro.current > 0 || activeRef.current) ensureRunning();
    };

    resize();
    // Prime for the current prop value (e.g. mounted already-active).
    applyActive(active);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Stash the applier so the prop-sync effect below can reach it.
    applyRef.current = applyActive;
    ensureRef.current = ensureRunning;

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      applyRef.current = null;
      ensureRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    applyRef.current?.(active);
  }, [active]);

  // Resume the loop when the field scrolls back into view mid-interaction.
  useEffect(() => {
    if (inView && (activeRef.current || intro.current > 0)) ensureRef.current?.();
  }, [inView]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
