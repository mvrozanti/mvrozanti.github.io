# Deploy

Two-branch model. One consumer.

| Branch | Consumer | Carries | Trigger |
|---|---|---|---|
| `master` | — | source | `git push origin master` |
| `gh-pages` | GitHub Pages | static export of master + `CNAME` | `bash ./build.sh` |

## `build.sh` — what it does

1. `npm install` to materialize `node_modules`.
2. Backs up `next.config.ts`, overwrites it with the export-mode
   variant (`output: 'export'`, `distDir: 'out'`,
   `trailingSlash: true`, `images.unoptimized: true`).
3. `npx next build` → static export to `out/`.
4. Restores `next.config.ts`.
5. Switches to `gh-pages` (orphan-creates if absent), wipes
   contents preserving `.git`, `.nojekyll`, `.gitignore`.
6. Moves `out/*` to root, writes a minimal `.gitignore` and
   `.nojekyll`.
7. Commits with timestamp, force-pushes.
8. Returns to the original branch, removes `out/`.

## Custom domain — `mvr.ac`

`public/CNAME` contains `mvr.ac`. Next.js copies `public/*`
verbatim into the static export, so the CNAME lands at the gh-pages
root where GitHub Pages reads it. Combined with the registrar
records (`@` → 4× GH anycast IPs), GitHub Pages claims the domain
and provisions its own LE cert. Toggle "Enforce HTTPS" in repo
Settings → Pages once the cert is green.

## Contribution heatmap — static, no backend

The page fetches `/contributions.json`, a static file in `public/`.
`.github/workflows/deploy.yml` refreshes it daily (05:17 UTC) via the
GitHub GraphQL API, commits it, rebuilds, and publishes to
`gh-pages`. A failed refresh keeps the committed snapshot; a missing
or empty file degrades gracefully — the contributions block hides
itself.

Because it is same-origin, the heatmap now also renders on
localhost, which the old CORS-restricted `api.mvr.ac` endpoint never
allowed. That service (`mandragora` repo,
`hosts/mandragora-vps/compose/mvr-api/`) is no longer used.

## Gotchas

- **NixOS shebang.** `build.sh`'s shebang is
  `#!/usr/bin/env bash` for portability; `/bin/bash` doesn't exist
  on NixOS. If you copy the script elsewhere keep the env-line.
- **Lockfile drift blocks the deploy.** `package.json` bumps need
  `package-lock.json` regenerated and committed *before* invoking
  `build.sh`. Otherwise step 1's `npm install` modifies the
  lockfile, and step 5's branch switch aborts ("Your local
  changes to the following files would be overwritten by
  checkout"). Recipe to recover:

  ```
  git checkout master
  npm install
  git add package-lock.json
  git commit -m "Regenerate package-lock.json"
  git push
  bash ./build.sh
  ```

- **`gh-pages` is force-pushed.** Don't keep state on it. Anything
  meaningful goes on `master`.
