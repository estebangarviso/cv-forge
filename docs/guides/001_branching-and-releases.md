# Branching, Releases and Stacked Pull Requests

CVForge uses two long-lived branches, each bound to a Vercel environment:

| Branch    | Deploys to | Ruleset               | Merges in via                            |
| --------- | ---------- | --------------------- | ---------------------------------------- |
| `develop` | Preview    | `develop-integration` | Squash-merged feature PRs                |
| `main`    | Production | `main-production`     | Release PRs from `develop`, merge commit |

Every short-lived branch starts from `develop`. Nothing is committed to `main` except through a release PR.

## Why two branches

Google OAuth only accepts redirect URIs registered in advance, with no wildcards. Per-branch Vercel previews get a random URL, so sign-in — and therefore anything touching Drive — cannot be tested on them. `develop` gives a stable, OAuth-registered pre-production URL. It has already caught a bug that only reproduced on a deployed build, never locally.

Per-branch previews are disabled in Vercel; only `develop` and `main` deploy.

## What each ruleset enforces

- **`develop-integration`** — blocks force-push and deletion. Nothing else: checks run on every PR but are informational, so a green PR is not a precondition for merging. This keeps the preview loop fast; a build error still fails the Vercel preview deploy itself.
- **`main-production`** — PR required, `Lint` / `Type-check` / `Test` / `Build` must pass, force-push and deletion blocked, and **merge commits only**. This is the single quality gate before production.

## When to stack

Stack PRs when work naturally splits into ordered, dependent chunks — e.g. a tooling/foundation change, then a feature built on top of it, then a second feature that depends on the first. Each PR in the stack must still be small enough to review on its own and pass CI independently. If the chunks aren't actually dependent, open separate PRs against `develop` instead of a stack.

## 1. Create the stack

```bash
git fetch origin
git checkout -b chore/foundation origin/develop
# ...commit foundation work...
git push -u origin chore/foundation
gh pr create --base develop --head chore/foundation

git checkout -b feat/thing-a chore/foundation
# ...commit feature A...
git push -u origin feat/thing-a
gh pr create --base chore/foundation --head feat/thing-a

git checkout -b feat/thing-b feat/thing-a
# ...commit feature B...
git push -u origin feat/thing-b
gh pr create --base feat/thing-a --head feat/thing-b
```

Each PR after the first targets the **previous branch in the stack**, not `develop`.

## 2. CI must run on every branch in the stack

The workflow's `pull_request` trigger must not restrict `branches:` — a stacked PR's base is another feature branch, so a `branches: [develop]` filter silently skips CI on PR2+ and the stack shows as unverified. Leave `pull_request:` unfiltered so checks run regardless of the PR's target branch.

## 3. Amending an earlier branch in the stack

When review feedback or a shared tooling fix needs to land in an earlier branch, amend/commit there, then re-parent every downstream branch with `rebase --onto`:

```bash
git checkout chore/foundation
# ...amend/add commit...
git push --force-with-lease origin chore/foundation

git rebase --onto chore/foundation <old-foundation-sha> feat/thing-a
# resolve conflicts, then:
git push --force-with-lease origin feat/thing-a

git rebase --onto feat/thing-a <old-thing-a-sha> feat/thing-b
git push --force-with-lease origin feat/thing-b
```

Get `<old-*-sha>` with `git rev-parse <branch>` **before** amending. Repeat down the stack — each rebase's new tip becomes the next branch's old base.

## 4. Verify a branch in true isolation before pushing

A local working tree that has switched between stack branches can carry contamination (uncommitted files from another branch, stale `.next/` cache producing false type errors). Verify the branch's actual committed state with a detached worktree instead of trusting the working tree:

```bash
git worktree add --detach /tmp/wt-check <branch-or-sha>
cd /tmp/wt-check
pnpm install --frozen-lockfile
pnpm lint && pnpm type-check && pnpm exec vitest run --passWithNoTests && pnpm build
cd - && git worktree remove --force /tmp/wt-check
```

Only push `--force-with-lease` once this passes.

## 5. Merge order

Merge bottom-up with **squash**: the PR based on `develop` first, then the next. After merging a lower PR, GitHub re-targets the next PR's base automatically (or rebase it onto `develop` manually if it doesn't).

## 6. Releasing to production

```bash
gh pr create --base main --head develop --title "release: <summary>"
# wait for Lint / Type-check / Test / Build, then:
gh pr merge <n> --merge
```

Always a **merge commit** — the ruleset rejects squash and rebase here, on purpose. Squashing `develop` into `main` produces a commit `develop` never contains, so the two branches diverge permanently and every later release re-shows old commits or conflicts. A merge commit keeps `develop` an ancestor of `main`.

`develop` survives the merge even though the repo auto-deletes merged head branches: the `develop-integration` ruleset blocks its deletion.

## 7. Hotfixes

For a production bug that cannot wait for the next release:

```bash
git checkout -b fix/<name> origin/main
# ...fix + test...
gh pr create --base main --head fix/<name>     # merge commit
gh pr create --base develop --head main --title "chore: back-merge hotfix"
```

The back-merge is not optional. Skipping it means the next `develop → main` release reverts the fix.

## Pitfalls learned the hard way

- **Repo-wide tools ignore PR boundaries.** `prettier --check .` (or any whole-tree lint/format check) scans everything, not just the current PR's diff. If such a check was never actually enforced before, the PR that first turns it on must absorb a full-repo remediation pass — you cannot cleanly split formatting adoption across the stack.
- **Stale `.next/` build cache gives false positives.** Always type-check/build from a clean worktree, not a working tree that recently had another branch checked out.
- **"Not mergeable" often just means the last rebase wasn't pushed.** If a stack shows failing/missing checks after a rebase, confirm `git rev-parse HEAD` matches `git rev-parse origin/<branch>` before debugging further.
- **Starting a branch from `main` instead of `develop`** silently drops every unreleased change from your branch's base. Always branch from `origin/develop`.

## Release checklist

- [ ] The preview at `cv-forge-dev.vercel.app` was exercised with a real sign-in.
- [ ] `gh pr checks <n>` is green on the `develop → main` PR.
- [ ] Merged with **merge commit**, not squash.
- [ ] Any hotfix merged to `main` since the last release has been back-merged into `develop`.
