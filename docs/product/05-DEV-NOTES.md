# Dev Notes

> Running Q&A log — things that came up during development, gotchas, and answers to "wait, why does it work this way?"
> For product design decisions, see the numbered docs in this folder. This file is for dev-level notes and reminders.

---

## Why does every skill read the profile on every invocation?

Each skill runs independently — there's no shared process or in-memory state between them. The profile is what makes skills personalized: it tells `/papyrus-journal` whether to probe at staff depth or junior depth, tells `/papyrus-standup` how to frame output, and so on. Without reading it upfront, every skill would behave generically.

The read is a single local file read (`~/Library/Preferences/papyrus/profile.md`), so performance is not a concern. The cost is negligible.

---
