#!/usr/bin/env node
/**
 * Case-study architecture conformance guard.
 *
 * The site deliberately has no dynamic `/work/[slug]` route: each case study
 * owns its own `src/app/work/<slug>/page.tsx` so it can compose a bespoke
 * story (see CLAUDE.md "Work architecture"). That freedom is safe only while
 * the *chrome, behaviour, and contracts* stay centralised — every page must
 * still route through `CaseStudyShell` and derive its metadata from the shared
 * registry, so shell-level features (the anchor arrival cue, prev/next nav,
 * project theming, …) apply everywhere with no per-page wiring.
 *
 * This guard enforces exactly that seam so a new or refactored case study
 * can't silently drift off the shared architecture:
 *   1. Every `kind: "case-study"` entry in the registry has a page folder.
 *   2. Every `work/<slug>/page.tsx` is registered (no orphan routes).
 *   3. Every page routes through `CaseStudyShell` and `caseStudyMetadata`.
 *
 * Dependency-free by design (no test runner in this repo): plain Node, run via
 * `npm run check:case-studies`, and wired into `prebuild` so it blocks a build.
 * It reads sources as text rather than importing the TS registry, so it needs
 * no loader; the registry format it parses is stable and asserted below.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = join(root, "src/app/work/projects.ts");
const workDir = join(root, "src/app/work");

const errors = [];

// 1. Registered case-study slugs. The registry is a discriminated union on
//    `kind`; pull the slug from each `kind: "case-study"` object literal. Kept
//    deliberately narrow (slug on the line after the kind) so a stray `slug:`
//    on an article or type definition can't be mistaken for a case study.
const registrySource = readFileSync(registryPath, "utf8");
const registeredSlugs = [
  ...registrySource.matchAll(
    /kind:\s*["']case-study["'],\s*\n\s*slug:\s*["']([^"']+)["']/g,
  ),
].map((match) => match[1]);

if (registeredSlugs.length === 0) {
  errors.push(
    `Parsed 0 case studies from ${rel(registryPath)} — the registry format may have changed; update this guard's matcher.`,
  );
}

// 2. Route folders that ship a page.
const routeSlugs = existsSync(workDir)
  ? readdirSync(workDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => existsSync(join(workDir, name, "page.tsx")))
  : [];

// 3. Registered but no page folder → a dead card/nav link.
for (const slug of registeredSlugs) {
  if (!routeSlugs.includes(slug)) {
    errors.push(
      `Case study "${slug}" is registered in projects.ts but has no work/${slug}/page.tsx.`,
    );
  }
}

// 4. Page folder but not registered → an orphan route the home grid, cards, and
//    prev/next nav will never surface.
for (const slug of routeSlugs) {
  if (!registeredSlugs.includes(slug)) {
    errors.push(
      `work/${slug}/page.tsx exists but "${slug}" is not a case-study entry in projects.ts (add it, or the page is unreachable from the site).`,
    );
  }
}

// 5. Each page routes through the shared chrome. This is the load-bearing
//    check: a page that hand-rolls its own layout instead of CaseStudyShell
//    would miss every shell-level feature — the whole reason the exception is
//    safe.
for (const slug of routeSlugs) {
  const pageSource = readFileSync(join(workDir, slug, "page.tsx"), "utf8");
  if (!pageSource.includes("CaseStudyShell")) {
    errors.push(
      `work/${slug}/page.tsx does not use <CaseStudyShell> — case studies must render through the shared shell so shell-level chrome and behaviour apply.`,
    );
  }
  if (!pageSource.includes("caseStudyMetadata")) {
    errors.push(
      `work/${slug}/page.tsx does not derive metadata from caseStudyMetadata("${slug}") — title/description must come from the registry, not be hardcoded.`,
    );
  }
}

function rel(absolute) {
  return absolute.startsWith(root) ? absolute.slice(root.length + 1) : absolute;
}

if (errors.length > 0) {
  console.error("✗ Case-study conformance check failed:\n");
  for (const message of errors) {
    console.error(`  • ${message}`);
  }
  console.error(
    `\n${errors.length} problem(s). See CLAUDE.md “Work architecture” and .docs/style-rules.md §9.`,
  );
  process.exit(1);
}

console.log(
  `✓ ${routeSlugs.length} case studies conform (registry ↔ routes ↔ shell).`,
);
