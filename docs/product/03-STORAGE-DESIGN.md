# Storage Design

> Where Papyrus files live, how skills find them, and how the filesystem layer is kept separate from AI logic.

---

## The Problem

Claude Code skills are markdown prompt files. They have no runtime — they instruct Claude Code what to do using its native tools (`Bash`, `Read`, `Write`, `Glob`). This means a skill cannot `import envPaths from 'env-paths'` or run any TypeScript directly.

But journal paths differ by OS:

| OS | Journal directory |
|---|---|
| macOS | `~/Library/Application Support/papyrus/journals/` |
| Linux | `~/.local/share/papyrus/journals/` |
| Windows | `%LOCALAPPDATA%\papyrus\Data\journals\` |

If path logic lived inside skill prompts, every OS change would require updating every skill. That's the wrong layer.

---

## The Solution: Lib Scripts

All filesystem logic lives in `src/lib/`. Each module has a **CLI entry point** — when called directly, it prints JSON to stdout. Skills call these scripts via Claude Code's `Bash` tool and parse the output.

```
SKILL.md prompt
  → instructs Claude Code to run: npx tsx ../../src/lib/paths.ts
  → parses JSON output to get journalDir
  → reads journals using Claude Code's Read/Glob tools
  → does AI work
```

The prompt never contains a hardcoded path. If paths change, only `src/lib/paths.ts` changes. Skills stay the same.

---

## File Locations

### Journals

Written and read by both the CLI and skills. Location is OS-dependent, resolved by `src/lib/paths.ts` using the `env-paths` library — the same library the CLI uses.

```
macOS:   ~/Library/Application Support/papyrus/journals/YYYYMMDD.md
Linux:   ~/.local/share/papyrus/journals/YYYYMMDD.md
Windows: %LOCALAPPDATA%\papyrus\Data\journals\YYYYMMDD.md
```

File format — markdown with YAML frontmatter (existing CLI convention):

```markdown
---
date: "20260411"
hash: "abc123..."
createdAt: "2026-04-11T10:00:00.000Z"
updatedAt: "2026-04-11T10:00:00.000Z"
---

Journal content here.
```

### Career Profile

Written by `/papyrus-setup`, read by every other skill. Location is inside the OS config directory:

```
macOS:   ~/Library/Preferences/papyrus/profile.md
Linux:   ~/.config/papyrus/profile.md
Windows: %APPDATA%\papyrus\Config\profile.md
```

File format — markdown with YAML frontmatter:

```markdown
---
level: senior
goal: promotion
years_at_level: over_2
company_type: big_tech
domain: backend
staff_archetype: null
created_at: 2026-04-11
updated_at: 2026-04-11
---

# My Papyrus Profile

**Level:** Senior Engineer
**Goal:** Getting promoted to Staff
...
```

---

## The Lib Modules

### `src/lib/paths.ts`

Resolves OS-appropriate paths. The entry point for all other modules.

```bash
npx tsx src/lib/paths.ts
```

```json
{
  "dataDir": "/Users/you/Library/Application Support/papyrus",
  "configDir": "/Users/you/Library/Preferences/papyrus",
  "journalDir": "/Users/you/Library/Application Support/papyrus/journals",
  "profilePath": "/Users/you/Library/Preferences/papyrus/profile.md"
}
```

### `src/lib/journal.ts`

Read, write, and list journal entries.

```bash
# List all journals
npx tsx src/lib/journal.ts list

# Read a specific journal
npx tsx src/lib/journal.ts read 20260411

# Read journals in a date range
npx tsx src/lib/journal.ts range 20260101 20260411

# Write a journal entry
npx tsx src/lib/journal.ts write 20260411 "content here"
```

### `src/lib/profile.ts`

Read and write the career profile.

```bash
# Read the profile
npx tsx src/lib/profile.ts read

# Write/update the profile
npx tsx src/lib/profile.ts write '{"level":"senior","goal":"promotion",...}'
```

---

## How Skills Use Lib Scripts

Every skill follows the same preamble pattern:

```markdown
## Setup

First, resolve the journal directory:
  Run: npx tsx ../../src/lib/paths.ts
  Parse the JSON. Use `journalDir` for journal files, `profilePath` for the profile.

Then, load the user's profile:
  Run: npx tsx ../../src/lib/profile.ts read
  Parse the JSON. Use `level`, `goal`, `domain`, and `staff_archetype` to personalize responses.

If either command fails, tell the user to run /papyrus-setup first.
```

All subsequent logic in the skill operates on the resolved paths and parsed profile. No path is ever hardcoded in a skill prompt.

---

## CLI vs Plugin: Who Writes What

Both the CLI and skills read and write to the same files. The format is the contract — not the code.

| Operation | CLI | Plugin skill |
|---|---|---|
| Write journal | `papyrus add` (opens editor) | `/papyrus-journal` (guided conversation → `src/lib/journal.ts write`) |
| Read journal | `papyrus show` / TUI browser | `src/lib/journal.ts read` (called by skill) |
| Write profile | — | `/papyrus-setup` → `src/lib/profile.ts write` |
| Read profile | — | Every skill via `src/lib/profile.ts read` |
| Sync to cloud | `papyrus sync` | Not handled by plugin |

The CLI and plugin are independently useful. A user can use just the plugin (no CLI), just the CLI (no plugin), or both together.

---

## Runtime: `npx tsx` vs Compiled `dist/`

Skills call lib scripts via `npx tsx src/lib/module.ts`. This runs TypeScript directly without a build step.

**Why not compile to `dist/` and commit it?**

Committing generated files creates a class of bugs where `src/` and `dist/` drift out of sync. It also adds noise to every PR. `npx tsx` is the cleaner approach — one source of truth, no build artifacts in the repo.

**Tradeoff:** requires Node.js 18+ and `npx` on the user's machine. This is a safe assumption for the target audience (developers who use Claude Code).

**Future:** if startup time becomes an issue (tsx adds ~200ms), we can evaluate pre-bundling with esbuild into a single self-contained file per module. That would remove the tsx dependency while still keeping `dist/` out of the repo via a CDN or npm publish.

---

## Future: `@papyrus/core`

Currently, `src/lib/` in this repo and `packages/cli/src/lib/storage/` in the main repo contain similar logic. They share a convention (same paths, same file format) but not code.

When the duplication becomes painful — a bug fixed in one place needs fixing in the other — the right move is to extract `@papyrus/core` as a standalone npm package:

```
@papyrus/core
├── paths.ts      ← moved from papyrus-plugin/src/lib/
├── journal.ts    ← moved from papyrus-plugin/src/lib/
└── profile.ts    ← moved from papyrus-plugin/src/lib/

papyrus (CLI)          papyrus-plugin
└── @papyrus/core      └── @papyrus/core
    └── paths, journal,    └── paths, journal,
        profile                profile
```

At that point the CLI becomes a thin TUI layer on top of `@papyrus/core`, and the plugin's lib scripts become thin wrappers around the same package. Don't do this extraction until the duplication actually hurts — premature extraction locks you into an API contract before you know what the right API is.

---

*Last updated: April 2026*
