# Onboarding Profile Design

> Defines what we ask users during `/papyrus-setup`, why we ask it, how it's stored, and how it shapes every downstream skill behavior.

---

## Design Principles

**Minimal but sufficient.** Every question must directly change downstream behavior. If removing a question doesn't change how the journal or career skills behave, the question doesn't belong here.

**Conversational, not a form.** The setup skill is the user's first experience with Papyrus. It should feel like a smart colleague asking the right questions — not a signup form.

**Updatable.** Users get promoted. They change goals. They switch companies. The profile must be easy to update without losing journal history. The `/papyrus-setup` skill can be re-run at any time.

**Machine-readable.** Every other skill reads the profile file. The format must be unambiguous and parseable by an AI reading the file as context.

---

## The 6 Profile Questions

### Q1: Current Level

**Question asked:**
> What's your current level? You can use your company's exact title or a general equivalent.

**Options presented:**
```
1. Junior / early career  (0-2 years, L3/E3/SDE1 equivalent)
2. Mid-level              (L4/E4/SDE2 equivalent)
3. Senior                 (L5/E5/SDE3 equivalent)
4. Staff or above         (L6+/E6+/Principal equivalent)
```

**Why we ask:** Level is the single most important input. It determines which career dimensions get emphasized in journal prompts, what "good" looks like in coaching feedback, and which career output skills are most relevant. See `01-SWE-CAREER-DIMENSIONS.md` for the full dimension-weight matrix.

**Stored as:** `level: junior | mid | senior | staff`

---

### Q2: Career Goal

**Question asked:**
> What's your main focus right now?

**Options presented:**
```
1. Getting promoted to the next level
2. Preparing to switch companies
3. Growing at my current level (no urgency to promote)
4. Not sure yet
```

**Why we ask:** Goal shapes which dimensions to emphasize and which career output skills to surface. A user preparing to switch companies needs resume bullets and STAR stories now. A user on a promotion track needs to build an evidence trail over months. A user focused on growth at their current level needs a different kind of reflection.

**Stored as:** `goal: promotion | job_search | growth | unsure`

**How it changes behavior:**

| Goal | Journal emphasis | Career skills surfaced |
|---|---|---|
| Promotion | Scope expansion, multiplier, ownership evidence | `/papyrus-promote`, periodic scope check-ins |
| Job search | Impact metrics, STAR-ready stories, concrete outcomes | `/papyrus-resume`, `/papyrus-interview` |
| Growth | Learning velocity, skill depth, feedback loops | `/papyrus-coach`, weekly reflections |
| Unsure | Balanced across all dimensions | All skills available, no urgency framing |

---

### Q3: Time at Current Level

**Question asked:**
> How long have you been at your current level?

**Options presented:**
```
1. Less than 1 year
2. 1-2 years
3. More than 2 years
```

**Why we ask:** Time at level is an urgency signal, especially combined with a promotion goal. An engineer who has been senior for 3+ years and wants staff is in a different position than someone who just got promoted to senior. It also shapes how we frame early journal entries — someone new to their level needs to build foundations; someone overdue for promotion needs to document evidence strategically.

**Stored as:** `years_at_level: under_1 | one_to_two | over_2`

**Urgency signal:**
- `over_2` + `goal: promotion` → High urgency. Journal prompts probe harder on scope, multiplier, and ownership. Career skills surface earlier with stronger prompting.
- `under_1` + any goal → Foundation mode. Prompts focus on building habits and understanding expectations at the current level before pushing toward the next.

---

### Q4: Company Type

**Question asked:**
> What kind of company do you work at?

**Options presented:**
```
1. Big tech / large enterprise  (FAANG, Microsoft, etc.)
2. Mid-size tech company        (100-2000 engineers)
3. Startup                      (small team, fast pace)
4. Freelance / consulting / indie
```

**Why we ask:** "Scope" and "impact" mean very different things depending on company context. At a big tech company, cross-team collaboration means working with 3 other teams of 10 engineers each. At a startup, it means talking to the CEO and shipping something by Friday. The same journal entry reads differently, and career documents need to be framed appropriately.

**Stored as:** `company_type: big_tech | mid_size | startup | freelance`

**How it changes behavior:**

| Company type | Scope framing | Impact framing |
|---|---|---|
| Big tech | Org charts, cross-org alignment, internal platforms | System reliability, latency, cost at scale |
| Mid-size | Cross-functional teams, growing systems | Feature impact, team velocity, business metrics |
| Startup | Company-wide, wearing many hats | Direct business outcomes, speed to market |
| Freelance | Client relationships, project delivery | Client outcomes, deliverable quality |

---

### Q5: Technical Domain

**Question asked:**
> What's your primary technical focus?

**Options presented:**
```
1. Backend / distributed systems / APIs
2. Frontend / mobile / UI
3. Infrastructure / platform / DevOps / SRE
4. Machine learning / data engineering
5. Full-stack (no strong primary)
```

**Why we ask:** Domain shapes the technical follow-up questions in the journal. A backend engineer's "what technical decision did you make?" looks different from a frontend engineer's. An infrastructure engineer's "what did you own?" involves different evidence than an ML engineer's. This also shapes the framing of resume bullets and technical sections in career documents.

**Stored as:** `domain: backend | frontend | infra | ml | fullstack`

---

### Q6: Staff Archetype (Staff+ only)

**Asked only if Q1 answer is "Staff or above".**

**Question asked:**
> Which of these best describes how you operate?

**Options presented:**
```
1. Tech Lead    — focused on your team's delivery and technical quality
2. Architect    — setting long-term technical direction across systems
3. Solver       — tackling the hardest unsolved problems in the org
4. Right Hand   — partnering closely with engineering leadership on strategy
```

**Why we ask:** Staff engineers specialize. A Staff Architect and a Staff Tech Lead should be journaling and building career evidence very differently. Without knowing the archetype, coaching is too generic to be useful at this level. (Based on Will Larson's archetypes from staffeng.com, widely referenced across industry.)

**Stored as:** `staff_archetype: tech_lead | architect | solver | right_hand | null`

**How it changes behavior:**

| Archetype | Journal emphasis | What "scope" means |
|---|---|---|
| Tech Lead | Team delivery, technical quality, team development | The team's output and velocity |
| Architect | RFCs, design decisions, cross-system coherence | The technical future of multiple systems |
| Solver | Hard problems tackled, who benefited, how it unlocked teams | The blast radius of solved problems |
| Right Hand | Strategic decisions influenced, org health, leadership partnership | Executive-level decisions shaped |

---

## Profile File Format

Stored at: `~/.local/share/papyrus/profile.md`

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

**Level:** Senior Engineer (L5)
**Goal:** Getting promoted to Staff
**Time at level:** 2+ years
**Company:** Big tech
**Domain:** Backend / distributed systems

_Updated by /papyrus-setup. Re-run that skill anytime to update._
```

The YAML frontmatter is parsed by skills. The markdown body is human-readable confirmation. Both are written by `/papyrus-setup` after the conversation.

---

## How the Profile Shapes Downstream Skills

### `/papyrus-journal` — Daily guided entry

The profile is loaded at the start of every journal session. It determines:
- Which of the 5 anchors get more depth
- What follow-up questions are asked per anchor
- What language and framing is used

Example: "Who did you help?" at each level × goal:

| Level | Goal | Follow-up |
|---|---|---|
| Junior | Growth | "Did anyone help you get unblocked? Did you help a peer?" |
| Mid | Promotion | "Did you help a junior engineer? Did you unblock a teammate?" |
| Senior | Promotion | "Who did you mentor? Did you shape someone's technical decision?" |
| Senior | Job search | "Who did you help — and what was the concrete outcome? That's a story." |
| Staff (Tech Lead) | Growth | "How did you improve your team's ability to execute?" |
| Staff (Architect) | Promotion | "Which engineer did you develop? What direction did you give that multiplied their impact?" |

### `/papyrus-standup` — Daily standup notes

Uses profile to frame the standup in the right voice:
- Startup → short, punchy, outcome-focused
- Big tech → slightly more formal, system context included
- Senior+ → includes cross-team work and decisions, not just task completion

### `/papyrus-resume` — Resume bullet generation

Uses profile to:
- Select which dimensions to lead with (promotion-track senior → multiplier + scope; job-seeking junior → execution + delivery)
- Frame impact in context (big tech uses different metrics than startup)
- Prioritize domain-relevant technical evidence

### `/papyrus-promote` — Promotion document

Uses profile to:
- Structure the doc for the right level jump (mid→senior vs. senior→staff require completely different evidence)
- Flag gaps (e.g., senior engineer with promotion goal who has no mentorship journal entries after 4 weeks → surface this)
- Use the right language for company type (big tech → formal promo packet style; startup → impact narrative)

### `/papyrus-coach` — Career Q&A

Uses profile to ground all advice:
- Knows which dimensions the user is likely strong/weak in based on their journaling patterns
- Calibrates advice to their actual career context, not generic career platitudes

---

## Gap Detection

After 4 weeks of journal entries, Papyrus can compare the user's journal patterns against their profile to surface gaps. Examples:

| Profile | Observed journal pattern | Gap surfaced |
|---|---|---|
| Senior, promotion goal | No mentorship entries in 3 weeks | "You haven't mentioned mentoring recently — this is a key dimension for senior→staff. Is this intentional?" |
| Mid, promotion goal | Only execution entries, no cross-team | "Your entries are strong on delivery, but we're not seeing cross-team collaboration. Mid→senior promotion typically requires this." |
| Staff Architect, any goal | No RFC or design doc mentions in a month | "Staff Architects typically need to show technical direction-setting. Any design work worth capturing?" |

This closes the loop: the profile defines what "good" looks like, the journal captures what's actually happening, and the gap detection surfaces the delta.

---

## Updating the Profile

Users run `/papyrus-setup` again at any time. The skill:
1. Loads the existing profile
2. Shows the current values
3. Asks "What's changed?" (doesn't re-ask everything)
4. Updates only the changed fields
5. Preserves the `created_at` timestamp, updates `updated_at`

Common update triggers:
- Got promoted → update `level`, reset `years_at_level` to `under_1`
- Decided to look for a new job → update `goal` to `job_search`
- Changed companies → update `company_type`, possibly `domain`
- Realized staff archetype doesn't fit → update `staff_archetype`

---

*Last updated: April 2026*
