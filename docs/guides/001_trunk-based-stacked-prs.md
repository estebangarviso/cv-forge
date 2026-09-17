# Trunk-Based Development with Stacked Pull Requests

`main` is protected by the `main-trunk-based` GitHub ruleset: every change lands through a PR with passing `Lint`, `Type-check`, `Test`, and `Build` checks, linear history only (no merge commits), and no force-push or deletion on `main`. This guide is the repeatable protocol for shipping larger bodies of work as a **stack** of small, sequentially-dependent PRs instead of one large PR.

## When to stack

Stack PRs when work naturally splits into ordered, dependent chunks — e.g. a tooling/foundation change, then a feature built on top of it, then a second feature that depends on the first. Each PR in the stack must still be small enough to review on its own and pass CI independently. If the chunks aren't actually dependent, open separate PRs against `main` instead of a stack.

## 1. Create the stack

```bash
git checkout -b chore/foundation main
# ...commit foundation work...
git push -u origin chore/foundation
gh pr create --base main --head chore/foundation

git checkout -b feat/thing-a chore/foundation
# ...commit feature A...
git push -u origin feat/thing-a
gh pr create --base chore/foundation --head feat/thing-a

git checkout -b feat/thing-b feat/thing-a
# ...commit feature B...
git push -u origin feat/thing-b
gh pr create --base feat/thing-a --head feat/thing-b
```

Each PR after the first targets the **previous branch in the stack**, not `main`.

## 2. CI must run on every branch in the stack

The workflow's `pull_request` trigger must not restrict `branches:` to `main` only — a stacked PR's base is another feature branch, so a `branches: [main]` filter silently skips CI on PR2+ and the stack will show as unverified. Leave `pull_request:` unfiltered (or list every possible stack base) so checks run regardless of the PR's target branch.

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

Merge bottom-up: the PR based on `main` first, then the next, and so on. After merging a lower PR, GitHub re-targets the next PR's base automatically (or rebase it onto `main` manually if it doesn't). Re-check `gh pr checks <n>` and `gh pr view <n> --json mergeable,mergeStateStatus` before merging the next one — a PR that hasn't received the latest rebase push will show stale/pending checks even though the code is correct.

## Pitfalls learned the hard way

- **Repo-wide tools ignore PR boundaries.** `prettier --check .` (or any whole-tree lint/format check) scans everything, not just the current PR's diff. If such a check was never actually enforced before, the PR that first turns it on must absorb a full-repo remediation pass — you cannot cleanly split formatting adoption across the stack.
- **Stale `.next/` build cache gives false positives.** Always type-check/build from a clean worktree, not a working tree that recently had another branch checked out.
- **"Not mergeable" often just means the last rebase wasn't pushed.** If a stack shows failing/missing checks after a rebase, confirm `git rev-parse HEAD` matches `git rev-parse origin/<branch>` before debugging further.

## Pre-merge checklist

- [ ] Every branch's `pull_request` CI run is green (`gh pr checks <n>`).
- [ ] `git rev-parse <branch>` matches `git rev-parse origin/<branch>` for each branch in the stack.
- [ ] `gh pr view <n> --json mergeable,mergeStateStatus` reports `MERGEABLE` / `CLEAN`.
- [ ] Merge bottom-up, one PR at a time, re-verifying the next PR after each merge.
