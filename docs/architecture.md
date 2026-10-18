# Architecture

Next.js 15 in pages-router mode. Statically exported and published
to GitHub Pages. There is no runtime backend: everything on the page
is rendered at build time from files in the repo.

| Content | Source | Refreshed by |
|---|---|---|
| name, roles, projects, skills, languages, PDF links | `data/cv.ts` | by hand, mirroring `shared/facts.md` in [mvrozanti/cv](https://github.com/mvrozanti/cv) |
| contribution heatmap | `public/contributions.json` | daily, `.github/workflows/deploy.yml` (GitHub GraphQL) |
| "also running" — the public mvr.ac services | `data/services.json` | daily, same workflow, from the hub's `services.json` in [mvrozanti/mandragora](https://github.com/mvrozanti/mandragora) |
| palette | `public/theme.css` (fallback tokens) + `public/theme.js` → `https://api.mvr.ac/theme` | live; the script keeps the fallback when the endpoint is down |

`public/theme.css` and `public/theme.js` are byte-identical copies of
`nix/hosts/mandragora-vps/compose/hub/static/` in the mandragora repo.
Do not edit them here; copy them again.

Superseded — the heatmap previously called `https://api.mvr.ac/contributions`
at runtime; the static snapshot replaced that so the page needs no
request to render. See [`hub.md`](hub.md) for how the hostnames
slot together.

## Pages

| Path | Source | Purpose |
|---|---|---|
| `/` | `pages/index.tsx` | the résumé sheet: sidebar, experience, projects, public services, heatmap; EN / PT-BR toggle |

`getStaticProps` reads the two JSON snapshots with `node:fs` at
build time. The language toggle is client state; it swaps labels,
dates and the PDF link, never the role text.

## Load choreography

Pure CSS keyframes in `styles/globals.css`, staggered through `--i`,
`--j` and `--c` custom properties set inline: the sheet rises, the
sidebar and roles stagger in, skill pips fill, then the heatmap
sweeps left to right one column at a time (`--c` is the week index).
`prefers-reduced-motion` turns all of it off.

## Tests

`npm test` runs `tests/site.test.mjs` against `out/index.html`, so
export first. It asserts the identity and every company are
rendered, no `undefined`/`NaN` leaked, `theme.css` / `theme.js` /
`contributions.json` / `CNAME` shipped, the heatmap has a full year
of cells, and that every external `href`/`src` on the page answers
2xx–3xx (the PT-BR PDF the toggle reveals is derived from the EN one
and checked too). LinkedIn answers bots with 999; that one status is
allowed for that one host. The deploy workflow runs the suite between
the export and the gh-pages push, so a dead link blocks the deploy.

## Stack

- Next.js 15.5 / React 19.1 (static export — `output: 'export'`)
- `lucide-react` for the four contact icons
- Tailwind 4, Radix, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `framer-motion` remain installed but unused by
  the page; removing them means regenerating the lockfile first
  (see [`deploy.md`](deploy.md))
- TypeScript with `ignoreBuildErrors: true` and ESLint
  `ignoreDuringBuilds: true` (intentional — see `next.config.ts`)

## Why split this way

GitHub Pages gives global anycast for the static page. The two
snapshots keep the page free of runtime requests and tokens; the only
runtime fetch is the palette, which is optional by design.
