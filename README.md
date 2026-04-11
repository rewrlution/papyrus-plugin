# papyrus-plugin

> Claude Code plugin for Papyrus — AI-powered career coaching from your developer journals.

## What This Is

Papyrus helps software engineers capture their daily work and turn it into career documents — standup notes, resume bullets, promotion packets, and interview stories. This plugin brings those skills into Claude Code.

Skills read journal files from your local filesystem. Your journals never leave your machine unless you opt into sync.

## Install

```bash
/plugin install papyrus
```

Then run the setup skill once to configure your profile:

```
/papyrus-setup
```

## Skills

| Skill | What it does |
|---|---|
| `/papyrus-setup` | One-time onboarding — collects career profile, detects journal location |
| `/papyrus-journal` | Guided daily journal entry via conversation |
| `/papyrus-standup` | Generates standup notes from yesterday's journal |
| `/papyrus-resume` | Generates resume bullets from a date range |
| `/papyrus-promote` | Generates a promotion document from your journal history |
| `/papyrus-interview` | Finds STAR-format interview stories from your journals |
| `/papyrus-coach` | Open-ended career Q&A grounded in your journal history |

## Requirements

- [Claude Code](https://claude.ai/code)
- Node.js 18+
- [Papyrus CLI](https://github.com/your-org/papyrus) (optional — for TUI browser and sync)

---

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
git clone https://github.com/your-org/papyrus-plugin
cd papyrus-plugin
pnpm install
```

### Project Structure

```
papyrus-plugin/
├── src/
│   └── lib/              # TypeScript source — core logic
│       ├── paths.ts      # OS-aware path resolution
│       ├── journal.ts    # Journal read/write
│       └── profile.ts    # Career profile read/write
├── tests/
│   └── lib/              # Vitest tests (mirror of src/lib/)
├── skills/               # Claude Code skill definitions
│   ├── papyrus-setup/
│   │   └── SKILL.md
│   ├── papyrus-journal/
│   │   └── SKILL.md
│   └── ...
├── docs/
│   └── product/          # Product strategy documents
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── package.json
```

### Commands

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type-check without building
pnpm typecheck

# Build src/ → dist/
pnpm build

# Build in watch mode
pnpm dev
```

### Running a lib script directly

Each `src/lib/*.ts` file has a CLI entry point. When called directly it prints its output as JSON — useful for debugging and for skills to call via Bash.

```bash
# Print resolved paths for the current OS
npx tsx src/lib/paths.ts

# Output (macOS example):
# {
#   "dataDir": "/Users/you/Library/Application Support/papyrus",
#   "configDir": "/Users/you/Library/Preferences/papyrus",
#   "journalDir": "/Users/you/Library/Application Support/papyrus/journals",
#   "profilePath": "/Users/you/Library/Preferences/papyrus/profile.md"
# }
```

### How Skills Call Lib Scripts

Skills are markdown prompt files (`SKILL.md`). They instruct Claude Code to run lib scripts via its `Bash` tool:

```markdown
Run the following command to find the journal directory:
  npx tsx ../../src/lib/paths.ts

Parse the JSON output and use `journalDir` to locate journal files.
```

The lib scripts handle all filesystem logic. The skill prompt handles all AI/coaching logic. They're fully decoupled.

### Adding a New Lib Module

1. Create `src/lib/your-module.ts`
2. Add a CLI entry point at the bottom (see `paths.ts` for the pattern)
3. Add tests in `tests/lib/your-module.test.ts`
4. Run `pnpm test` to verify

### Writing a Skill

1. Create `skills/papyrus-your-skill/SKILL.md`
2. Start the skill with the standard preamble (read profile, resolve paths)
3. Reference lib scripts via `npx tsx ../../src/lib/module.ts`
4. See existing skills for examples

### Testing Skills Manually

Open Claude Code in the plugin directory and invoke the skill:

```
/papyrus-setup
```

Claude Code will load the skill from the local `skills/` directory.

---

## Architecture

See `docs/product/` for full design rationale. Key decisions:

- **`src/lib/`** is the source of truth for all filesystem operations. No path logic lives in skill prompts.
- **Skills are thin prompts** — they call lib scripts and handle the AI layer only.
- **`npx tsx`** runs TypeScript directly — no committed build artifacts, no manual compile step for users.
- **Same lib used by the CLI** — as the project matures, `src/lib/` will be extracted to a shared `@papyrus/core` package that both this plugin and the CLI depend on.

## Contributing

See `docs/product/` for the product strategy before contributing. The core design docs are:

- `01-SWE-CAREER-DIMENSIONS.md` — the career framework all skills are grounded in
- `02-ONBOARDING-PROFILE.md` — what we ask users and why
- `03-STORAGE-DESIGN.md` — where files live and how skills find them
