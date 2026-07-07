# Lizzie Teo — Portfolio

An employer-first portfolio built to show senior UX/UI design work — Healthdirect Symptom Checker, AP+ Testing Portal, and Funding Finder — with explanatory motion in place of static screenshots. See `docs/portfolio-plan.md` for the full creative and content direction.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- Tailwind CSS 4 with [shadcn/ui](https://ui.shadcn.com) primitives in `src/components/ui`
- [Motion](https://motion.dev) for reveals and the Explore cursor
- [Remotion](https://www.remotion.dev) for rendering case-study hero videos

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run video:studio` | Open the Remotion Studio for case-study videos |
| `npm run video:render` | Render the Funding Finder hero video to `out/remotion` |
| `npm run video:still` | Export a single frame of the Funding Finder hero |

## Project docs

- `docs/portfolio-plan.md` — positioning, IA, motion language, and build phases
- `docs/style-rules.md` — frontend style rules referenced by `CLAUDE.md`
