# AGENTS.md — mvrozanti.github.io

Single source of truth for any AI agent working in this repo. Read
this first; lazy-load deeper docs from
[`docs/index.md`](docs/index.md) only when relevant. Optimize for
context efficiency: don't re-read what you don't need.

## What this repo is

Next.js 15 + React 19 single-page personal site. Terminal-themed
landing card. One output path:

| URL | Branch | Deployer | Purpose |
|---|---|---|---|
| [`mvr.ac`](https://mvr.ac/) | `gh-pages` | GitHub Pages | canonical static page |
| [`mvrozanti.github.io`](https://mvrozanti.github.io/) | `gh-pages` | GitHub Pages | 301 → mvr.ac |

Fully static — no server-side runtime. Architecture detail:
[`docs/architecture.md`](docs/architecture.md).

`mvr.ac` is also the apex of a wider hub —
[Seafile](https://seafile.mvr.ac), [Radicale](https://cal.mvr.ac),
[ttyd / paste / grafana on tailnet], slither-io simulator. Those
sibling services live in a different repo
([`mandragora`](https://github.com/mvrozanti/mandragora)) on a
separate VPS. See [`docs/hub.md`](docs/hub.md) when working on
anything that crosses subdomains.

## Who you are working with

m (mvrozanti) — power Linux user on NixOS+Hyprland. Direct,
technical communication. Same person who maintains the wider
`mvr.ac` hub.

## Non-Negotiables

1. **Two branches, two purposes.** `master` = source.
   `gh-pages` = static export + `CNAME`. Don't collapse them.
2. **Deploy via `./build.sh`.** Plain `npm run build` does not
   publish anything to GitHub Pages. The script swaps
   `next.config.ts` for export-mode, exports, force-replaces
   `gh-pages`, pushes. Detail:
   [`docs/deploy.md`](docs/deploy.md).
3. **`public/CNAME` is load-bearing.** Removing it un-claims
   `mvr.ac` on GitHub Pages.
4. **Lockfile in sync with `package.json`.** A `package.json` bump
   without regenerating `package-lock.json` breaks `build.sh`
   mid-flight: `npm install` modifies the lockfile, the
   subsequent `git checkout gh-pages` then aborts on dirty tree.
   Recipe in [`docs/deploy.md`](docs/deploy.md).
5. **No code comments.** Naming + structure self-document.
6. **Runs on NixOS.** `build.sh`'s shebang is
   `#!/usr/bin/env bash` so it works without `/bin/bash`.

## Workflow

```
edit  →  git push origin master         (source-of-truth branch)
      →  bash ./build.sh                (rebuilds + pushes gh-pages)
```

A docs-only edit doesn't need `build.sh`. A homepage UI change does.

## Per-agent deltas

- [`CLAUDE.md`](CLAUDE.md) — Claude-specific.

Add `GEMINI.md`, `local-llm.md` etc. as siblings if their behavior
needs to differ.
