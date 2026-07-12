"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/*
 * Shell tokens feeding the shader, quietest to warmest. Resolved at
 * runtime so the shader always tracks theme.css; oklch values are
 * converted to rgb via a canvas because Paper Shaders parses only
 * hex/rgb/hsl.
 */
const BACK_TOKEN = "--background";
const LAYER_TOKENS = ["--muted", "--secondary", "--accent"];

function resolveTokensToRgb(tokens: string[]): string[] | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const rootStyle = getComputedStyle(document.documentElement);
  const resolved: string[] = [];

  for (const token of tokens) {
    const value = rootStyle.getPropertyValue(token).trim();
    if (!value) return null;
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    resolved.push(`rgb(${r}, ${g}, ${b})`);
  }

  return resolved;
}

export function HeroShader() {
  const reducedMotion = useReducedMotion();
  const [colors, setColors] = useState<string[] | null>(null);

  useEffect(() => {
    setColors(resolveTokensToRgb([BACK_TOKEN, ...LAYER_TOKENS]));
  }, []);

  if (!colors) return null;

  const [colorBack, ...layers] = colors;

  return (
    <GrainGradient
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      colorBack={colorBack}
      colors={layers}
      intensity={0.45}
      noise={0.35}
      shape="wave"
      softness={0.85}
      speed={reducedMotion ? 0 : 0.35}
    />
  );
}
