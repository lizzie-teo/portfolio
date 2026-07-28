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
//   --anchor=<id>       after warm-up, reproduce the in-page anchor jump
//                       (useAnchorScroll): scroll so #id's top sits at its own
//                       scroll-margin-top below the viewport edge, then log the
//                       measured gap in px and capture (viewport only). This is
//                       the faithful test of the "lands 1cm from the edge"
//                       behaviour — unlike --hash, which centres.
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
      // Split on the FIRST "=" only: values are often selectors that contain
      // their own, e.g. --focus=a[href="/work/x"].
      const body = a.replace(/^--/, "");
      const eq = body.indexOf("=");
      return eq === -1 ? [body, true] : [body.slice(0, eq), body.slice(eq + 1)];
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
  const height = opts.height ? parseInt(String(opts.height), 10) : heights[width] ?? 900;
  const context = await browser.newContext({
    viewport: { width, height },
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

    // Faithful reproduction of the in-page anchor jump (useAnchorScroll):
    // land the element's top at its own scroll-margin-top below the viewport
    // edge, then report the gap actually achieved. Instant scroll (the global
    // auto override is in force), so this measures the resting landing with no
    // smooth-scroll overshoot — isolating whether the offset itself resolves.
    if (opts.anchor) {
      // Smooth variant re-enables scroll-behavior on html (html's specificity
      // beats the global `*` auto override regardless of order) so the jump
      // eases exactly like the live hook, catching any overshoot/snap that only
      // shows under smooth scrolling.
      if (opts["anchor-smooth"]) {
        await page.addStyleTag({
          content: "html { scroll-behavior: smooth !important; }",
        });
      }
      const gap = await page.evaluate(
        ({ id, smooth }) => {
          const el = document.getElementById(id);
          if (!el) return null;
          const marginTop =
            parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
          if (!smooth) {
            const top =
              el.getBoundingClientRect().top + window.scrollY - marginTop;
            window.scrollTo(0, Math.max(0, top));
          } else {
            // Approximates useAnchorScroll's live-retargeting behaviour: an rAF
            // ease that re-reads the element position each frame, so it self-
            // corrects through the page's mid-scroll reflow. This is a rough
            // exponential lerp (delta * 0.2), NOT the hook's exact curve — the
            // real hook eases on a motionEase.inOut bezier with a short overshoot
            // lobe, so use this to sanity-check the resting landing, not to
            // verify the precise settle. Runs to completion in the page.
            const target = () => {
              const top =
                el.getBoundingClientRect().top + window.scrollY - marginTop;
              const max =
                document.documentElement.scrollHeight - window.innerHeight;
              return Math.max(0, Math.min(top, max));
            };
            const startedAt = performance.now();
            const step = () => {
              const t = target();
              const current = window.scrollY;
              const delta = t - current;
              if (Math.abs(delta) <= 0.5 || performance.now() - startedAt > 1400) {
                window.scrollTo({ top: t, behavior: "instant" });
                return;
              }
              window.scrollTo({ top: current + delta * 0.2, behavior: "instant" });
              requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
          return {
            marginTop,
            measuredTop: Math.round(el.getBoundingClientRect().top),
          };
        },
        { id: opts.anchor, smooth: Boolean(opts["anchor-smooth"]) }
      );
      // Longer settle for smooth so the eased scroll (and any pin snap) finishes.
      await page.waitForTimeout(opts["anchor-smooth"] ? 1600 : 400);
      // Re-measure after settle in case a late layout shift moved the target.
      const settled = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const marginTop = el
          ? parseFloat(getComputedStyle(el).scrollMarginTop) || 0
          : 0;
        const targetY = el
          ? Math.round(
              el.getBoundingClientRect().top + window.scrollY - marginTop
            )
          : null;
        return {
          top: el ? Math.round(el.getBoundingClientRect().top) : null,
          scrollY: Math.round(window.scrollY),
          targetY,
          maxScroll: Math.round(
            document.documentElement.scrollHeight - window.innerHeight
          ),
        };
      }, opts.anchor);
      console.log(
        `  anchor #${opts.anchor} @${width}px — scroll-margin-top ${gap?.marginTop}px, ` +
          `element top after jump ${gap?.measuredTop}px, after settle ${settled.top}px ` +
          `(scrollY ${settled.scrollY}, targetY-now ${settled.targetY}, maxScroll ${settled.maxScroll})`
      );
    }

    // Absolute scroll position (viewport capture), for pinning down a
    // scroll-linked effect at an exact offset.
    if (opts.scroll !== undefined) {
      await page.evaluate((y) => window.scrollTo(0, y), parseInt(opts.scroll, 10));
      await page.waitForTimeout(400);
    }

    // Real hover / focus, for capturing pointer- or keyboard-driven states
    // (e.g. the home hero's keyword payoff). Settles the resulting motion.
    // --settle=<ms> overrides the post-hover/focus wait for ambient cover
    // moments whose ramp runs past the 700ms default (e.g. a 1.6s bloom).
    const settleMs = opts.settle !== undefined ? parseInt(opts.settle, 10) : 700;
    // Real click, for capturing state that only appears after a toggle
    // (accordion expand, tab switch). Playwright auto-scrolls the target into
    // view; we then centre its section so the resulting panel/media is framed.
    // Accepts any Playwright selector, e.g. --click='button:has-text("Advice")'.
    if (opts.click) {
      // Multiple selectors may be chained with " && " and are clicked in order
      // (e.g. open one accordion item then another to frame a default-open one).
      for (const sel of String(opts.click).split(" && ")) {
        await page.click(sel.trim());
        await page.waitForTimeout(200);
      }
      await page.evaluate(() => {
        const el = document.activeElement;
        (el?.closest("section") ?? el)?.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(settleMs);
    }

    // Scroll an internal overflow container (e.g. a dropdown/menu with its
    // own overflow-y-auto) to its bottom, then measure the gap between the
    // first/last "row" elements and the container's own top/bottom edge in
    // viewport pixels. Useful for verifying padding survives scroll-to-end
    // (Chrome/Safari drop a scroll container's own padding-bottom at the
    // scroll limit, which is why padding belongs on an inner wrapper).
    // --scroll-el=<container selector> --scroll-el-rows=<row selector>
    if (opts["scroll-el"]) {
      const containerSel = String(opts["scroll-el"]);
      const rowsSel = String(opts["scroll-el-rows"] ?? `${containerSel} *`);
      const measure = async () =>
        page.evaluate(
          ({ containerSel, rowsSel }) => {
            const container = document.querySelector(containerSel);
            const rows = Array.from(document.querySelectorAll(rowsSel));
            if (!container || rows.length === 0) return null;
            const cRect = container.getBoundingClientRect();
            const first = rows[0].getBoundingClientRect();
            const last = rows[rows.length - 1].getBoundingClientRect();
            return {
              topGap: Math.round(first.top - cRect.top),
              bottomGap: Math.round(cRect.bottom - last.bottom),
              scrollTop: container.scrollTop,
              scrollHeight: container.scrollHeight,
              clientHeight: container.clientHeight,
            };
          },
          { containerSel, rowsSel }
        );

      // Top gap: measured at scrollTop 0, so the first row is the one
      // actually visible at the top edge (meaningless once scrolled away).
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollTop = 0;
      }, containerSel);
      await page.waitForTimeout(200);
      const top = await measure();

      // Bottom gap: scroll to the true end (Chrome/Safari's padding-bottom
      // bug only shows up at the scroll limit), then re-measure. This is the
      // state the final screenshot captures.
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollTop = el.scrollHeight;
      }, containerSel);
      await page.waitForTimeout(300);
      const bottom = await measure();

      console.log(
        `  scroll-el ${containerSel} @${width}px — ${
          top && bottom
            ? `topGap(at top) ${top.topGap}px, bottomGap(at bottom) ${bottom.bottomGap}px (scrollHeight ${bottom.scrollHeight}, clientHeight ${bottom.clientHeight}, scrollTop-at-bottom ${bottom.scrollTop})`
            : "container or rows not found"
        }`
      );
    }

    if (opts.focus) {
      await page.focus(String(opts.focus));
      await page.waitForTimeout(settleMs);
    }
    if (opts.hover) {
      await page.hover(String(opts.hover));
      await page.waitForTimeout(settleMs);
    }

    const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
    const suffix = [opts.dark && "dark", opts["reduced-motion"] && "rm", opts.hash && `hash-${opts.hash}`, opts.anchor && `anchor-${opts.anchor}`, opts.scroll !== undefined && `y${opts.scroll}`, opts.click && "click", (opts.hover || opts.focus) && "state", (opts.hover || opts.focus) && opts.settle !== undefined && `s${opts.settle}`].filter(Boolean).join("-");
    const file = path.join(outDir, `${slug}-${width}${suffix ? `-${suffix}` : ""}.png`);
    const viewportOnly =
      opts.hash || opts.anchor || opts.scroll !== undefined || opts.click || opts["scroll-el"];
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
