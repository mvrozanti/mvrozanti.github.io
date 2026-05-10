# Architecture

Next.js 15 in pages-router mode. Two output configurations used in
different contexts:

| Context | Mode | Notes |
|---|---|---|
| Vercel deploy of `master` | server-rendered (default) | needed for `pages/api/contributions.ts` (uses GitHub token at request time) |
| `build.sh` static export | `output: 'export'` | for GitHub Pages — no API routes; the static pages call back to Vercel for `/api/*` |

`build.sh` overwrites `next.config.ts` only during the
static-export step, then restores it. Vercel always reads the
unmodified config.

## Pages

| Path | Source | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | terminal-themed landing |
| `/api/contributions` | `pages/api/contributions.ts` | fetches GitHub contributions via GraphQL — server-only, Vercel |

## Stack

- Next.js 15.5.7 / React 19.1.2
- Tailwind 4 + `tailwindcss-animate` + `tailwind-merge`
- Radix UI (`@radix-ui/react-slot`), `class-variance-authority`,
  `clsx`, `lucide-react`, `framer-motion`
- TypeScript with `ignoreBuildErrors: true` and ESLint
  `ignoreDuringBuilds: true` (intentional — see
  `next.config.ts` — lets builds ship through TS noise)

## Why two deploy targets

`pages/api/contributions.ts` makes authenticated GitHub GraphQL
calls and can't be prerendered. Vercel handles the dynamic side;
GitHub Pages handles the public static side; the static page does
a fetch to Vercel for the contributions panel. This keeps the user
flow free of redirects (the canonical URL is always `mvr.ac`)
while still allowing a runtime API.
