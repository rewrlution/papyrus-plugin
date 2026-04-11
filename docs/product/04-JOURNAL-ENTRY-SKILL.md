# Journal Entry Skill Design

> Design document for `/papyrus-journal` — the guided daily journal entry skill.
> This is the most important skill in the plugin. Without consistent journal entries, no career output skill has data to work with.

---

## Purpose

The journal entry skill replaces the blank page. Instead of opening an editor and staring at it, the user has a short conversation with Claude. Claude asks the right questions, the user answers in their own words, and Claude saves a structured entry to disk.

The goal is not a detailed record of every minute. The goal is enough signal for the AI career skills to generate accurate, specific documents months later.

---

## The 5 Anchors

Every journal session is structured around 5 anchors. These are consistent at every level — what changes is the follow-up depth, not the question itself.

| Anchor | Career dimensions captured | Opening question |
|---|---|---|
| **1. Work** | Scope, Delivery | "What did you work on today?" |
| **2. Ownership** | Ownership, Accountability | "What did you drive or own — not just contribute to?" |
| **3. Help** | Multiplier Effect | "Did you help anyone, or did someone help you?" |
| **4. Decisions** | Judgment, Technical Execution | "Did you make any decisions or tradeoffs today?" |
| **5. Collaboration** | Cross-functional Collaboration | "Did you interact with anyone outside your immediate team?" |

These map directly to the 7 career dimensions in `01-SWE-CAREER-DIMENSIONS.md`. Resume bullets, promotion packets, and interview stories are built by searching journal entries for evidence across these dimensions.

---

## Conversation Format

The skill runs as a conversation, not a form. Claude asks one anchor at a time, follows up if the answer suggests more depth, and moves on when the user is done.

**Opening:**
```
What did you work on today?
```

Not: "Please answer the following 5 questions." The opening should feel like a colleague asking, not a survey starting.

**Follow-up logic:**
- If the answer is specific → probe for impact ("What was the outcome?")
- If the answer is vague → ask for one concrete detail ("What was the trickiest part?")
- If the user says "nothing" or "not much" → accept it, move on. Don't force.
- If the user gives a rich answer → don't ask a follow-up. They already gave enough.

**Skipping anchors:**
Not every anchor has an answer every day. A heads-down coding day may have nothing for anchors 3 and 5. That's fine — the skill moves on and notes internally which anchors were skipped. Patterns of skipped anchors feed into gap detection (see `02-ONBOARDING-PROFILE.md`).

**Session length target:**
5-8 conversational turns. Should feel like 2-3 minutes, not a performance review.

---

## How Level Shapes Follow-ups

The anchor questions are identical at every level. The follow-up questions differ based on the user's profile.

### Anchor 1: Work

| Level | Follow-up if answer is brief |
|---|---|
| Junior | "What was the trickiest part? What did you learn from it?" |
| Mid | "Did you own that end-to-end, or were you one contributor?" |
| Senior | "What was the business or user impact?" |
| Staff | "Which teams or systems did this touch beyond your own?" |

### Anchor 2: Ownership

| Level | How to probe |
|---|---|
| Junior | Skip or ask lightly: "Was there anything you felt fully responsible for?" |
| Mid | "Did you make the final call on anything, or were you executing someone else's direction?" |
| Senior | "Did you define the scope of this, or was it handed to you?" |
| Staff | "What outcomes are you on the hook for that nobody else is tracking?" |

### Anchor 3: Help (Multiplier)

| Level | Follow-up framing |
|---|---|
| Junior | "Did anyone help you get unblocked today? Did you help a teammate with anything?" |
| Mid | "Did you unblock a junior? Give a code review that changed someone's approach?" |
| Senior | "Did you mentor someone? Did you shape a technical decision someone else was making?" |
| Staff (Tech Lead) | "How did you improve your team's ability to execute today?" |
| Staff (Architect) | "Which engineer did you develop? What direction did you give that multiplied their impact?" |
| Staff (Solver) | "Did you unblock a team — not just a person?" |

### Anchor 4: Decisions

| Level | Follow-up framing |
|---|---|
| Junior | "Did you choose between two approaches? What made you pick one over the other?" |
| Mid | "What tradeoffs did you weigh? Did you make the call yourself or with someone?" |
| Senior | "What did you choose NOT to do, and why? What are the long-term implications?" |
| Staff | "What criteria did you set for this decision that others could reuse?" |

### Anchor 5: Collaboration

| Level | Follow-up framing |
|---|---|
| Junior | Light: "Did you talk to anyone in a different team or function today?" |
| Mid | "Did you manage any cross-team dependencies today?" |
| Senior | "Did you influence a decision you didn't have formal authority over?" |
| Staff | "Did you align anyone — across teams, or with leadership — on direction?" |

---

## Goal Shapes Emphasis

The user's `goal` from their profile changes which anchors get extra attention:

| Goal | Extra emphasis |
|---|---|
| `promotion` | Ownership and Multiplier — these are the two dimensions most engineers underinvest in before promotion |
| `job_search` | Work and Decisions — needs concrete, metric-rich outcomes for resume bullets and STAR stories |
| `growth` | Work and Help — learning velocity and peer collaboration |
| `unsure` | Balanced across all 5 anchors |

The skill doesn't announce this — it just naturally probes harder on the relevant anchors.

---

## Output: The Journal File

After the conversation, Claude saves a structured markdown file. The file format matches what the CLI writes — same frontmatter schema, same directory.

**File location:** `{journalDir}/YYYYMMDD.md` (resolved via `src/lib/paths.ts`)

**Format:**

```markdown
---
date: "20260411"
hash: "abc123..."
createdAt: "2026-04-11T10:00:00.000Z"
updatedAt: "2026-04-11T10:00:00.000Z"
---

## What I worked on
Fixed a gnarly auth bug — tokens weren't being invalidated on logout.
Missing Redis DEL call in the signout handler. Also kicked off the API
redesign discussion with the team.

## What I owned
Drove the auth fix end-to-end: diagnosis, fix, deploy, monitoring.
Wrote the postmortem.

## Who I helped
Pair programmed with Alice on the API redesign for ~2 hours. She was
stuck on the schema design — helped her think through the tradeoffs
between normalization and query performance.

## Decisions made
Chose soft deletes for session tokens to preserve audit trail. Tradeoff:
slightly higher storage, much better debugging.

## Cross-team / collaboration
Had a direct conversation with the PM about definition-of-done needing
to be agreed before sprint starts — scope keeps shifting mid-sprint.
```

**Rules for saving:**
- Sections with no content are omitted entirely (not written as empty headers)
- Claude synthesizes the conversation into prose — it does not paste a raw transcript
- The prose should sound like the user wrote it, not like an AI summary
- Each section should be 1-4 sentences. Not a bullet list. Not an essay.
- If the user already has an entry for today, Claude asks: "You already have an entry for today — want to add to it or replace it?"

---

## Closing the Session

After saving, Claude confirms and gives one forward-looking nudge:

```
✓ Saved to journals/20260411.md

You mentioned a tricky auth bug — if you write a few more entries like
this, that's strong material for an interview story. The "what broke,
why, and how you fixed it" structure is exactly what interviewers want.
```

The nudge should be:
- Specific to what the user actually wrote (not generic)
- Forward-looking (connects today's entry to a future career use)
- Short — one or two sentences maximum

Not every session needs a nudge. Skip it if the entry is thin or routine.

---

## Edge Cases

### User has nothing to write
Some days are meeting-heavy or blocked. The skill should acknowledge this:

```
Claude: What did you work on today?
User:   Honestly, just meetings all day. Nothing to show for it.

Claude: That's worth capturing. What were the meetings about?
        Decisions made in meetings count — and patterns of heavy meeting
        load can show up in career coaching later.
```

Even a thin entry is better than no entry.

### User wants to write freely
Some users will prefer to type a brain dump rather than answer questions:

```
User: /papyrus-journal
      [pastes three paragraphs of notes]

Claude: Got it — let me structure that for you before saving.
        [saves structured version]
        Does this look right? I can adjust any section.
```

The skill should accept free-form input and structure it, not insist on the Q&A format.

### Existing entry for today
If `readJournal(today)` returns an existing entry:

```
Claude: You already have an entry for today (saved at 09:14).
        Want to add to it, or start fresh?
```

Adding appends new content to the existing sections. Starting fresh overwrites.

### Profile not found
If `profileExists()` returns false:

```
Claude: It looks like you haven't run /papyrus-setup yet.
        The journal skill works best when it knows your career stage.
        Run /papyrus-setup first (takes 2 minutes), then come back here.
```

---

## What This Is Not

- **Not a mood tracker.** We don't ask "how are you feeling?" The focus is career-relevant evidence.
- **Not a time tracker.** We don't ask how long things took or log hours.
- **Not a todo list.** We don't ask what's planned for tomorrow. That belongs in a standup, not a journal.
- **Not a performance review.** The tone should be casual and quick, not formal and exhaustive.

---

*Last updated: April 2026*
