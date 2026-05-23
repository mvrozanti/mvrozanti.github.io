# Architecture

Next.js 15 in pages-router mode. Statically exported and published
to GitHub Pages. The landing page calls one external endpoint at
runtime — `https://api.mvr.ac/contributions` — for the GitHub
contribution-calendar heatmap.

The API service is **not in this repo**. It lives in the
`mandragora` repo at
`hosts/mandragora-vps/compose/mvr-api/` and runs on the Oracle VPS
behind caddy-docker-proxy. See [`hub.md`](hub.md) for how the
hostnames slot together.

## Pages

| Path | Source | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | terminal-themed landing |

## Stack

- Next.js 15.5.7 / React 19.1.2 (static export — `output: 'export'`)
- Tailwind 4 + `tailwindcss-animate` + `tailwind-merge`
- Radix UI (`@radix-ui/react-slot`), `class-variance-authority`,
  `clsx`, `lucide-react`, `framer-motion`
- TypeScript with `ignoreBuildErrors: true` and ESLint
  `ignoreDuringBuilds: true` (intentional — see
  `next.config.ts` — lets builds ship through TS noise)

## Why split this way

GitHub Pages gives global anycast for the static landing. The
contributions panel needs an authenticated GitHub GraphQL call
(token can't ship in a static bundle), so that one bit runs on the
VPS. CORS on the VPS side whitelists `mvr.ac`,
`www.mvr.ac`, `mvrozanti.github.io`.
