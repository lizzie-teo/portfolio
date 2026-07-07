"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PULL_DISTANCE = 60;
const MAX_STRETCH = 0.3;
const SQUASH_RATIO = 0.6;

type PointerState = {
  active: boolean;
  label: string;
  visible: boolean;
  x: number;
  y: number;
  tx: number;
  ty: number;
};

export function ExploreCursor() {
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0, active: false, label: "Take a look" });
  const [enabled, setEnabled] = useState(false);
  const [pointer, setPointer] = useState<PointerState>({
    active: false,
    label: "Take a look",
    visible: false,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  });

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);

    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = () => {
      setPointer((current) => {
        const ease = targetRef.current.active ? 0.2 : 0.11;
        const nextX = current.x + (targetRef.current.x - current.x) * ease;
        const nextY = current.y + (targetRef.current.y - current.y) * ease;
        return {
          active: targetRef.current.active,
          label:
            targetRef.current.active && targetRef.current.label
              ? targetRef.current.label
              : current.label,
          visible: current.visible,
          x: nextX,
          y: nextY,
          tx: targetRef.current.x - nextX,
          ty: targetRef.current.y - nextY,
        };
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>("[data-explore-card]");
      const active = Boolean(card);
      const label = card?.dataset.cursorLabel || "Take a look";
      targetRef.current = { x: event.clientX, y: event.clientY, active, label };
      setPointer((current) => ({ ...current, visible: true }));
    };

    const onPointerLeave = () => {
      setPointer((current) => ({ ...current, visible: false, active: false }));
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const pull = Math.min(Math.hypot(pointer.tx, pointer.ty), MAX_PULL_DISTANCE);
  const pullAngle = (Math.atan2(pointer.ty, pointer.tx) * 180) / Math.PI;
  const stretch = (pull / MAX_PULL_DISTANCE) * MAX_STRETCH;
  const baseScale = pointer.active ? 1 : 0.72;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-[0px] font-bold uppercase tracking-[0.08em] text-background opacity-0 transition-[width,height,opacity] duration-300 ease-out lg:flex"
      style={{
        opacity: pointer.visible ? 1 : 0,
        transform: `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) rotate(${pullAngle}deg) scale(${1 + stretch}, ${1 - stretch * SQUASH_RATIO}) rotate(${-pullAngle}deg) scale(${baseScale})`,
        width: pointer.active ? 118 : 18,
        height: pointer.active ? 118 : 18,
        fontSize: pointer.active ? 13 : 0,
      }}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${Math.max(-5, Math.min(5, pointer.tx * 0.025))}px, ${Math.max(-5, Math.min(5, pointer.ty * 0.025))}px, 0)`,
        }}
      >
        {pointer.active ? pointer.label : ""}
      </span>
    </div>
  );
}
