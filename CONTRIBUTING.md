# Contributing to papyrus-plugin

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
git clone https://github.com/your-org/papyrus-plugin
cd papyrus-plugin
pnpm install
```

## Project Structure

```
papyrus-plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (name, version, author)
├── skills/                   # Claude Code skill definitions
│   ├── papyrus-setup/
│   │   └── SKILL.md
│   ├── papyrus-journal/
│   │   └── SKILL.md
│   └── ...
├── src/
│   └── lib/                  # TypeScript — all filesystem logic lives here
│       ├── paths.ts          # OS-aware path resolution
│       ├── journal.ts        # Journal read/write/list
│       └── profile.ts        # Career profile read/write
├── tests/
│   └── lib/                  # Vitest tests (mirror of src/lib/)
└── docs/
    └── product/              # Design documents — read before writing new skills
```

## Commands

```bash
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm typecheck      # Type-check without building
pnpm build          # Compile src/ → dist/
pnpm dev            # Build in watch mode
```

## Testing Skills Locally

Use `--plugin-dir` to load the plugin from your local checkout without installing it:

```bash
claude --plugin-dir /path/to/papyrus-plugin
```

Inside the session, invoke skills with the `papyrus:` namespace prefix:

```
/papyrus:papyrus-setup
/papyrus:papyrus-journal
```

Other useful session commands:

```
/help               # See all loaded skills and verify the plugin name
/plugin validate    # Validate plugin.json and skill frontmatter
/reload-plugins     # Reload after editing SKILL.md or plugin.json
```

### Gotchas

**1. The skill prefix comes from `plugin.json`, not the directory name.**
The prefix is the `"name"` field in `.claude-plugin/plugin.json` — `"papyrus"` here. So skills are `/papyrus:papyrus-setup`, not `/papyrus-plugin:papyrus-setup`.

**2. `node_modules` must be present before skills can run.**
Skills call `${CLAUDE_PLUGIN_ROOT}/node_modules/.bin/tsx` to execute lib scripts. `pnpm install` must be run at least once.

**3. `${CLAUDE_PLUGIN_ROOT}` resolves to the path passed via `--plugin-dir`.**
It's always an absolute path set at skill execution time. Never hardcode paths in skill files — always use this variable.

**4. Skills cannot be unit-tested in isolation.**
There is no way to run a `SKILL.md` directly or mock Claude's execution. Use `pnpm test` for all lib logic. Use a real Claude Code session for skill flow testing.

**5. Edits to `SKILL.md` require `/reload-plugins` to take effect mid-session.**

## Architecture

`src/lib/` is the single source of truth for all filesystem operations. Skills are thin prompts — they call lib scripts and handle the AI/coaching layer only. No path logic or file I/O lives in skill prompts.

Skills call lib scripts via Bash:

```bash
${CLAUDE_PLUGIN_ROOT}/node_modules/.bin/tsx ${CLAUDE_PLUGIN_ROOT}/src/lib/profile.ts read
```

Each lib module also has a CLI entry point for debugging:

```bash
npx tsx src/lib/paths.ts          # Print OS-resolved paths as JSON
npx tsx src/lib/profile.ts read   # Print current profile as JSON
npx tsx src/lib/journal.ts list   # List all journal entries as JSON
```

## Adding a Lib Module

1. Create `src/lib/your-module.ts`
2. Add a CLI entry point at the bottom (follow the pattern in `paths.ts`)
3. Add tests in `tests/lib/your-module.test.ts`
4. Run `pnpm test` to verify

## Writing a New Skill

1. Read the relevant design doc in `docs/product/` first
2. Create `skills/papyrus-your-skill/SKILL.md`
3. Start with the standard preamble — check profile exists, read profile, resolve paths
4. Reference lib scripts using `${CLAUDE_PLUGIN_ROOT}/node_modules/.bin/tsx ${CLAUDE_PLUGIN_ROOT}/src/lib/module.ts`
5. Test manually with `claude --plugin-dir .`

## Design Docs

Read these before writing new skills or lib modules:

| Doc | What it covers |
|---|---|
| `docs/product/01-SWE-CAREER-DIMENSIONS.md` | The career framework — 7 dimensions, level weights, staff archetypes |
| `docs/product/02-ONBOARDING-PROFILE.md` | What we ask users at setup and why each field matters |
| `docs/product/03-STORAGE-DESIGN.md` | Where files live per OS and how skills find them |
| `docs/product/04-JOURNAL-ENTRY-SKILL.md` | Full design spec for the journal skill |
