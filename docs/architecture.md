# Architecture

Next.js 15 in pages-router mode, fully static.

`build.sh` runs `output: 'export'` against the page, then publishes
the result to GitHub Pages. There is no server-side runtime — every
data dependency the landing page has is fetched client-side from
the public GitHub REST API.

## Pages

| Path | Source | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | terminal-themed landing |

## Stack

- Next.js 15.5.7 / React 19.1.2
- Tailwind 4 + `tailwindcss-animate` + `tailwind-merge`
- Radix UI (`@radix-ui/react-slot`), `class-variance-authority`,
  `clsx`, `lucide-react`, `framer-motion`
- TypeScript with `ignoreBuildErrors: true` and ESLint
  `ignoreDuringBuilds: true` (intentional — see
  `next.config.ts` — lets builds ship through TS noise)
