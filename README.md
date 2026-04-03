

Outcome-based pay often disadvantages workers when outcomes fail for reasons outside their control. Proof of Effort separates quality of work from success of outcome. The AI evaluates the worker's process — did they follow best practices, make good decisions, document their work? A surgeon who did everything right but lost the patient still gets a high Effort score. Rewards professional quality independent of luck.

### Description

Proof of Effort is an outcome-independent professional quality rating system. In traditional employment and gig contracts, workers are penalised when outcomes fail due to factors entirely outside their control — market shifts, client decisions, external dependencies. This contract separates **quality of process** from **quality of outcome**. A worker submits their work log, decisions made, methodology followed, and deliverables produced. An Intelligent Contract evaluates whether the worker demonstrated professional best practices, sound decision-making, clear documentation, and industry-standard processes. The resulting "Effort Score" is an immutable professional credential, stored on-chain. Clients still pay based on outcomes if they choose, but the Effort Score provides an honest, AI-verified record of professional quality. A surgeon who followed every protocol but lost a patient still earns a high Effort Score. A developer whose feature was cancelled by the client still has a record of clean code and good engineering process.

**Core Problem Solved:** Outcome-based pay creates perverse incentives and disadvantages skilled professionals when bad luck intervenes. This contract creates a fair, verifiable signal of professional quality that compounds over time into a trustless professional reputation.

---

### How It Works

1. **Engagement Setup** — A client and worker agree on an engagement. The client calls `create_engagement()` with the role description, expected deliverables, professional standards reference (e.g. "Software Engineering: Clean code, documented functions, test coverage > 80%"), and compensation structure.
2. **Worker Accepts** — The worker calls `accept_engagement()`. The engagement is active.
3. **Work Period** — During the engagement, the worker optionally calls `log_progress()` to submit interim work notes (stored on-chain as evidence).
4. **Worker Submits** — At completion, the worker calls `submit_work()` with: process documentation, decisions made and rationale, deliverables link/hash, self-assessment, and any relevant context about external factors that affected outcome.
5. **Client Response** — The client calls `submit_outcome_assessment()` with the actual outcome result and their assessment of what went well/poorly. Critically, outcome and process are stored separately.
6. **AI Evaluation** — The Intelligent Contract evaluates the worker's submission against the professional standards defined at the start. It scores: Process Quality (was methodology sound?), Decision Quality (were judgement calls reasonable?), Documentation Quality (is work understandable?), Professionalism (communication, timeliness). Returns a composite Effort Score 0–100.
7. **Score Minted** — The Effort Score is stored permanently against the worker's wallet address, alongside the engagement type, date, and client (pseudonymously). The worker's cumulative Effort Profile is publicly readable.
8. **Dispute Window** — Either party can call `dispute_score()` within 48 hours with written justification. The AI re-evaluates with the new context. Score is final after dispute window.

---

### Frontend Architecture

| Route | Page Name | Purpose |
|---|---|---|
| `/` | Landing | Explain Proof of Effort concept, hero score display, recent verified workers |
| `/profile/[wallet]` | Professional Profile | Worker's full Effort history — all engagements, scores, timeline, specialisation tags |
| `/engagements` | Engagement Dashboard | Active and past engagements (filtered by role: client or worker) |
| `/engagements/new` | Create Engagement | Client-side form: role description, standards reference, compensation terms |
| `/engagements/[id]` | Engagement Detail | Timeline: created → accepted → in progress → submitted → evaluated. All logs. |
| `/engagements/[id]/submit` | Submit Work | Worker's submission form: process docs, decisions, deliverables, self-assessment |
| `/engagements/[id]/evaluate` | Evaluation View | Live AI scoring animation, score breakdown, rationale, dispute button |
| `/engagements/[id]/dispute` | Dispute Form | Both parties can submit dispute justification within 48-hour window |
| `/leaderboard` | Top Effort Scores | Public leaderboard by category (dev / design / legal / medical / etc.) |
| `/verify/[wallet]` | Score Verification | Public-facing page — share this URL to prove your Effort Score to third parties |

---



---

### Write Methods Table

| Method | Inputs | Character Limits | Returns | When to Call |
|---|---|---|---|---|
| `create_engagement` | `role_description: str`, `standards_reference: str`, `worker_address: str`, `compensation: int` | role: 500, standards: 1000 | `engagement_id: str` | Client creates an engagement |
| `accept_engagement` | `engagement_id: str` | — | `success: bool` | Worker accepts after reviewing terms |
| `log_progress` | `engagement_id: str`, `progress_note: str` | 1000 chars | `log_id: str` | Worker optionally logs mid-engagement updates |
| `submit_work` | `engagement_id: str`, `process_docs: str`, `decisions: str`, `deliverables_hash: str`, `self_assessment: str`, `external_factors: str` | process_docs: 3000, decisions: 2000, self_assessment: 1000, external_factors: 500 | `submission_id: str` | Worker submits final work |
| `submit_outcome_assessment` | `engagement_id: str`, `outcome_result: str`, `outcome_notes: str` | outcome_notes: 1000 | `success: bool` | Client submits outcome info |
| `dispute_score` | `engagement_id: str`, `justification: str` | 2000 chars | `dispute_id: str` | Either party within 48-hour window |
| `resolve_dispute` | `dispute_id: str` | — | `new_score: int` | Called after re-evaluation completes |

---

### View Methods Table

| Method | Inputs | Output | When to Use |
|---|---|---|---|
| `get_engagement` | `engagement_id: str` | Full engagement object | Engagement detail page |
| `get_worker_engagements` | `wallet_address: str` | List of all engagements | Profile page, dashboard |
| `get_effort_score` | `engagement_id: str` | `{composite: int, process: int, decision: int, docs: int, professionalism: int, rationale: str}` | Score reveal page |
| `get_average_effort_score` | `wallet_address: str` | `avg_score: float` | Profile header |
| `get_engagement_count` | `wallet_address: str` | `count: int` | Profile header |
| `get_leaderboard` | `category: str`, `limit: int` | List of top wallets with scores | Leaderboard page |
| `get_dispute_status` | `dispute_id: str` | Dispute object with status | Dispute tracking page |
| `is_within_dispute_window` | `engagement_id: str` | `bool` | Show/hide dispute button |

---

### Complete Frontend Flow Diagram

```
Client visits /engagements/new
      |
[Fill: role description + standards + worker address + compensation]
      |
[Sign create_engagement Tx] --> engagement_id returned
      |
Email/notify worker off-chain (or on-chain event)
      |
Worker visits /engagements/[id]
      |
[Reviews terms] --> [Sign accept_engagement Tx]
      |
Work period begins
      |
[Optional: Worker logs progress via log_progress()]
      |
Work complete
      |
Worker visits /engagements/[id]/submit
      |
[Fill: process docs / decisions / deliverables / self-assessment]
      |
[Sign submit_work Tx]
      |
Client visits /engagements/[id]
      |
[Fills outcome assessment] --> [Sign submit_outcome_assessment Tx]
      |
AI Evaluation triggers (non-deterministic)
      |
[/engagements/[id]/evaluate -- polling PENDING]
      |
Evaluation completes
      |
[Score Gauge animates: 0 --> Final Score]
[Sub-scores appear]
[Rationale types out]
      |
Dispute window opens (48 hours)
      |
      +-- [Dispute filed?] --> [/engagements/[id]/dispute]
      |         |                      |
      |         Yes              [Submit justification]
      |                               |
      |                         [Re-evaluation]
      |                               |
      |                         [Updated score]
      |
Score finalised --> Stored on wallet's Effort Profile
      |
[/profile/[wallet]] -- permanently viewable, shareable
```

---

### How Users Use the Contract — Realistic User Journey

**Carlos is a freelance UX designer. He takes on a project to redesign a fintech app.**

1. The client, FinCo, creates the engagement: role = "UX Designer," standards = "User research required, wireframes documented, design rationale written, handoff files complete," compensation = 2000 USDC.
2. Carlos accepts. He begins work.
3. Week 2, he logs a progress note: "Completed user research with 8 interviews. Key insight: users want one-tap transfers above all else. Pivoting IA accordingly."
4. At the end of week 4, FinCo's product strategy changes. The entire fintech product is shelved — not Carlos's fault. Carlos submits his work: 40-page research report, annotated wireframes, 3 tested prototypes, handoff Figma file, and external factors: "Product cancelled by leadership due to regulatory shift."
5. FinCo submits outcome assessment: "Product discontinued. Carlos's deliverables were not implemented."
6. AI evaluates. 32 minutes later, Carlos's score appears: Process Quality 38/40, Decision Quality 31/35, Documentation 24/25, Professionalism 19/20. Composite: **89/100.**
7. The page explicitly states: "Outcome: Project Discontinued — Effort Score: 89/100 — Professional quality independently verified."
8. Carlos shares his `/verify/0xCarlos` link in his next job application. The hiring company sees 7 past engagements with an average Effort Score of 84/100 — a trustless professional reference.




this is the contract address deployed on studionet: 0xb93bF5c746592b4670b534CF66D7453Ac47d5Ed4
