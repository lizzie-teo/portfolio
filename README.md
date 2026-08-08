# Lizzie Teo — Portfolio

An employer facing portfolio built to show senior UX/UI design work, with explanatory motion in place of static screenshots. The case studies and articles it presents are listed in `src/app/work/projects.ts`, which is the single registry every part of the site reads from. See `.docs/portfolio-strategy.md` for the audiences it is designed around and how to tell whether it is working.

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

- `.docs/portfolio-strategy.md` — positioning, audiences, success criteria, and what is not yet built
- `.docs/style-rules.md` — frontend style rules referenced by `CLAUDE.md`
