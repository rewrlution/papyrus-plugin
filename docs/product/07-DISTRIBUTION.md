# Distribution & Release Pipeline

> Covers how the plugin is compiled, released, and distributed to users via the Claude Code marketplace.

---

## The problem

Skills need to call TypeScript lib scripts at runtime. Three options were considered:

| Option | Who compiles | When | Tradeoff |
|---|---|---|---|
| `npx tsx` (current) | npx, at runtime | Every skill invocation | Works, but depends on npx/network; compiles on every call |
| Commit `dist/` | Developer, manually | Before each commit | Noisy diffs, easy to forget to rebuild, dist drifts from src |
| CI builds `dist/` | CI pipeline | On release | Clean source repo, reliable artifact, requires release pipeline |

## Decision

**CI builds `dist/` on release.** Source-only commits, compiled output in the release artifact.

- Developers write and commit TypeScript only — `dist/` stays in `.gitignore`
- On release, CI compiles `src/lib/` → `dist/lib/` and publishes the artifact
- Users install from the release artifact, which already contains `dist/`
- Skills call `node ${CLAUDE_PLUGIN_ROOT}/dist/lib/module.js` — no tsx, no npx, just Node.js

**In the meantime (pre-pipeline):** skills use `npx tsx` as a stopgap. This works fine for development and early testing. Update skills to use `node dist/lib/module.js` once the pipeline is in place.

---

## Target: Claude Code Marketplace

The end goal is publishing to the Claude Code plugin marketplace so users can install with:

```
/plugin install papyrus
```

The release pipeline needs to produce an artifact that satisfies whatever the marketplace expects — likely a tagged GitHub release or a published package.

**Open questions to resolve when setting up the pipeline:**
- What format does the Claude Code marketplace require? (GitHub release? npm package? Direct repo?)
- Does the marketplace run `npm install` on the plugin, or does the artifact need to be self-contained?
- What's the review/approval process for marketplace submission?

---

## Planned Pipeline (GitHub Actions)

On push to a release tag (`v*`):

1. Install dependencies (`pnpm install`)
2. Run tests (`pnpm test`) — block release if any fail
3. Typecheck (`pnpm typecheck`) — block release if errors
4. Build (`pnpm build`) — compile `src/lib/` → `dist/lib/`
5. Package the release artifact (source + dist, no node_modules)
6. Publish to Claude Code marketplace (mechanism TBD)

---

## What to do before setting up the pipeline

- [ ] Understand the Claude Code marketplace submission requirements
- [ ] Decide on versioning strategy (semver, tags)
- [ ] Update all skills to use `node ${CLAUDE_PLUGIN_ROOT}/dist/lib/module.js` once dist/ is reliably built by CI
- [ ] Add a pre-commit check or CI step that catches dist/src drift during development
