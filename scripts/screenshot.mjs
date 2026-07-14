#!/usr/bin/env node
// Reusable page-capture script. Replaces ad-hoc Playwright heredocs.
//
// Usage:
//   node scripts/screenshot.mjs [routes...] [options]
//
// Examples:
//   node scripts/screenshot.mjs /                          # home at 320/768/1440
//   node scripts/screenshot.mjs / /work/healthdirect-symptom-checker --viewports=320,1440
//   node scripts/screenshot.mjs / --dark --out=/tmp/shots
//
// Options:
//   --base=<url>        default http://localhost:3000
//   --viewports=<list>  comma-separated widths, default 320,768,1440
//   --out=<dir>         default screenshots/ (gitignored)
//   --dark              emulate prefers-color-scheme: dark
//   --no-full           viewport-height capture instead of full page
//   --reduced-motion    emulate prefers-reduced-motion: reduce
//   --hash=<id>         after warm-up, scrollIntoView(#id) and capture that
//                       scrolled state (viewport only, ignores --no-full)
//   --scroll=<px>       after warm-up, scroll to an absolute Y offset and
//                       capture that state (viewport only)
//   --hover=<selector>  after warm-up, real-hover the element and capture
//   --focus=<selector>  after warm-up, focus the element and capture
//
// Always use this (Playwright) rather than headless Chrome CLI: headless
// Chrome misreports horizontal overflow below 500px widths.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opts = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    })
);
const routes = args.filter((a) => !a.startsWith("--"));
if (routes.length === 0) routes.push("/");

const base = opts.base ?? "http://localhost:3000";
const widths = String(opts.viewports ?? "320,768,1440")
  .split(",")
  .map((w) => parseInt(w, 10));
const outDir = opts.out ?? "screenshots";
const fullPage = !opts["no-full"];

const heights = { 320: 690, 375: 667, 768: 1024, 1440: 900 };

mkdirSync(outDir, { recursive: true });

try {
  const res = await fetch(base, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`status ${res.status}`);
} catch {
  console.error(`Dev server not reachable at ${base} — start it with: npm run dev`);
  process.exit(1);
}

const browser = await chromium.launch();
const saved = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: heights[width] ?? 900 },
    colorScheme: opts.dark ? "dark" : "light",
    reducedMotion: opts["reduced-motion"] ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const route of routes) {
    await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });
    // Force instant scrolling for capture. The site uses scroll-behavior:
    // smooth, so programmatic scrolls animate for over a second on tall
    // pages — long enough that a fixed wait screenshots mid-flight. Scroll-
    // linked effects (e.g. the collapsing case-study leaves) are
    // deterministic per scroll position, so instant scroll lands the exact
    // resting state we want to capture.
    await page.addStyleTag({
      content: "*, :root { scroll-behavior: auto !important; }",
    });
    // let entrance animations and lazy images settle
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    if (opts.hash) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ block: "center" });
      }, opts.hash);
      await page.waitForTimeout(400);
    }

    // Absolute scroll position (viewport capture), for pinning down a
    // scroll-linked effect at an exact offset.
    if (opts.scroll !== undefined) {
      await page.evaluate((y) => window.scrollTo(0, y), parseInt(opts.scroll, 10));
      await page.waitForTimeout(400);
    }

    // Real hover / focus, for capturing pointer- or keyboard-driven states
    // (e.g. the home hero's keyword payoff). Settles the resulting motion.
    if (opts.focus) {
      await page.focus(String(opts.focus));
      await page.waitForTimeout(700);
    }
    if (opts.hover) {
      await page.hover(String(opts.hover));
      await page.waitForTimeout(700);
    }

    const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
    const suffix = [opts.dark && "dark", opts["reduced-motion"] && "rm", opts.hash && `hash-${opts.hash}`, opts.scroll !== undefined && `y${opts.scroll}`, (opts.hover || opts.focus) && "state"].filter(Boolean).join("-");
    const file = path.join(outDir, `${slug}-${width}${suffix ? `-${suffix}` : ""}.png`);
    const viewportOnly = opts.hash || opts.scroll !== undefined;
    await page.screenshot({ path: file, fullPage: viewportOnly ? false : fullPage });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    saved.push({ file, overflow });
    console.log(`${file}${overflow > 0 ? `  ⚠ horizontal overflow: ${overflow}px` : ""}`);
  }
  await context.close();
}

await browser.close();

const overflowing = saved.filter((s) => s.overflow > 0);
if (overflowing.length) {
  console.error(`\n${overflowing.length} capture(s) have horizontal overflow.`);
  process.exitCode = 2;
}
