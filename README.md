# papyrus-plugin

> Claude Code plugin for Papyrus — AI-powered career coaching from your developer journals.

Papyrus helps software engineers capture their daily work and turn it into career documents — standup notes, resume bullets, promotion packets, and interview stories. Skills read journal files from your local filesystem. Your journals never leave your machine unless you opt into sync.

## Install

```bash
/plugin install papyrus
```

Then run setup once to configure your career profile:

```
/papyrus:papyrus-setup
```

## Skills

| Skill | What it does |
|---|---|
| `/papyrus:papyrus-setup` | One-time onboarding — collects career profile, detects journal location |
| `/papyrus:papyrus-journal` | Guided daily journal entry via conversation |
| `/papyrus:papyrus-standup` | Generates standup notes from yesterday's journal |
| `/papyrus:papyrus-resume` | Generates resume bullets from a date range |
| `/papyrus:papyrus-promote` | Generates a promotion document from your journal history |
| `/papyrus:papyrus-interview` | Finds STAR-format interview stories from your journals |
| `/papyrus:papyrus-coach` | Open-ended career Q&A grounded in your journal history |

## Requirements

- [Claude Code](https://claude.ai/code)
- Node.js 18+
- [Papyrus CLI](https://github.com/your-org/papyrus) (optional — for TUI browser and sync)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development guide.

Quick reference:

```bash
git clone https://github.com/your-org/papyrus-plugin
cd papyrus-plugin
pnpm install
pnpm test
```

Read `docs/product/` before writing new skills — the design docs explain the career framework, profile schema, and storage decisions that all skills must follow.
