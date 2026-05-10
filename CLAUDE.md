# CLAUDE.md — Claude-specific deltas

Read [`AGENTS.md`](AGENTS.md) first. Only deltas live here.

## Workflow

- This repo is **not** the mandragora monorepo — the
  worktree-by-default rule does not apply. Plain branches and a
  clean tree are fine.
- Commit messages are sentence-case, no Conventional-Commits
  prefix — matches the existing log.
- `build.sh` runs `npm install` + a `git checkout gh-pages`. A
  dirty tree (e.g. lockfile drift) fails the checkout. Commit
  lockfile updates on master before invoking the build.

## When to actually run `build.sh`

| Change | Action |
|---|---|
| Homepage UI / styling / `pages/index.tsx` | `git push` + `bash ./build.sh` |
| `pages/api/*` | `git push` only — Vercel rebuilds |
| Docs / READMEs | `git push` only — gh-pages unchanged |
| `package.json` deps | `npm install`, commit lockfile, push, then `bash ./build.sh` |

## Pushing

The user authorized `git push` for this repo earlier in the
session, scoped to the deploy path. For unrelated PRs to remote,
confirm first.
