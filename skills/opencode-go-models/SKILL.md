---
name: opencode-go-models
description: Model routing guide for the Pi coding agent OpenCode Go subscription. Use this skill whenever the user asks which model to use, wants to switch models, is picking a model for a task, mentions any of the available models by name (GLM-5, GLM-5.1, Kimi K2.5, MiMo-V2-Pro, MiMo-V2-Omni, MiniMax M2.5, MiniMax M2.7), or describes a task and implicitly needs a model recommendation. Always consult this before suggesting a model.
---

# OpenCode Go — Model Routing Guide

This skill helps route tasks to the right model in the Pi coding agent OpenCode Go subscription. All models listed here are available under the subscription. Every model uses a Mixture-of-Experts (MoE) architecture, activating only a fraction of total parameters per token — which is why frontier-grade intelligence is available at this price point.

---

## OpenCode Go Subscription Details

- **Price:** $5 first month, then $10/month
- **Usage limits:** $12 per 5 hours / $30 per week / $60 per month (in dollar-equivalent usage)
- **Privacy:** Zero-retention policy; data not used for training
- **Endpoints:** Hosted in US, EU, and Singapore for stable global access
- **Setup:** Run `/connect` in TUI → select "OpenCode Go" → paste API key

### Approximate Requests per Limit Period

| Model | per 5 hours | per week | per month |
|---|---|---|---|
| GLM-5.1 | 880 | 2,150 | 4,300 |
| GLM-5 | 1,150 | 2,880 | 5,750 |
| Kimi K2.5 | 1,850 | 4,630 | 9,250 |
| MiMo-V2-Pro | 1,290 | 3,225 | 6,450 |
| MiMo-V2-Omni | 2,150 | 5,450 | 10,900 |
| MiniMax M2.7 | 14,000 | 35,000 | 70,000 |
| MiniMax M2.5 | 20,000 | 50,000 | 100,000 |

MiniMax M2.5 gives ~23× more requests per month than GLM-5.1. Use it for high-volume tasks; use GLM-5.1/MiMo-V2-Pro for hard problems.

### Model IDs and Endpoints

| Model | Model ID | Endpoint | AI SDK Package |
|---|---|---|---|
| GLM-5.1 | `glm-5.1` | `…/v1/chat/completions` | `@ai-sdk/openai-compatible` |
| GLM-5 | `glm-5` | `…/v1/chat/completions` | `@ai-sdk/openai-compatible` |
| Kimi K2.5 | `kimi-k2.5` | `…/v1/chat/completions` | `@ai-sdk/openai-compatible` |
| MiMo-V2-Pro | `mimo-v2-pro` | `…/v1/chat/completions` | `@ai-sdk/openai-compatible` |
| MiMo-V2-Omni | `mimo-v2-omni` | `…/v1/chat/completions` | `@ai-sdk/openai-compatible` |
| MiniMax M2.7 | `minimax-m2.7` | `…/v1/messages` | `@ai-sdk/anthropic` |
| MiniMax M2.5 | `minimax-m2.5` | `…/v1/messages` | `@ai-sdk/anthropic` |

All endpoints use base URL `https://opencode.ai/zen/go/v1`. Config format: `opencode-go/<model-id>`, e.g., `opencode-go/kimi-k2.5`.

---

## Quick Reference Table

| Task Type | Best Model | Why |
|---|---|---|
| Complex multi-file coding, long refactor, repo gen | **GLM-5.1** | #1 open-weight on SWE-Bench Pro, long-horizon agentic loops |
| Full codebase ingestion, long agent sessions | **MiMo-V2-Pro** | 1M ctx, low hallucination, strong tool calls |
| Q&A over web search results | **MiMo-V2-Pro** | Lowest hallucination rate in the lineup |
| Strong all-round coding at low cost | **MiniMax M2.7** | 86.2% PinchBench, self-evolution, deep code reading |
| High-volume routine/simpler tasks | **MiniMax M2.5** | 23× more requests/month, still 80.2% SWE-bench |
| Screenshot → code, visual UI tasks | **Kimi K2.5** | Vision encoder, strong front-end work |
| Image / video / audio understanding | **MiMo-V2-Omni** | Only multimodal model in the lineup |
| Math-heavy or science reasoning | **Kimi K2.5** | AIME 96.1%, HLE 50.2% with tools |
| GLM-5.1 unavailable / quota exhausted | **GLM-5** | Same family, solid fallback |

---

## Model Profiles

### GLM-5.1 — Primary Workhorse
**By: Zhipu AI (Z.AI) | Params: 744B total / 40B active | Context: 200K | Output: 128K max**

The top coding model in this lineup. Purpose-built for long-horizon agentic engineering. Released April 2026 as a post-training upgrade to GLM-5 — same architecture, retargeted RL pipeline for coding and agentic distributions. Open-weight under MIT license (available on HuggingFace).

**Strengths:**
- #1 open-weight model on SWE-Bench Pro (58.4) — above GPT-5.4 (57.7), Claude Opus 4.6 (57.3), Gemini 3.1 Pro (54.2). Only Claude Mythos Preview (77.8%) scores higher overall.
- #1 on NL2Repo (42.7) — full repo generation from natural language
- Terminal-Bench 2.0: 63.5 standalone, 66.5 with Claude Code harness
- Additional benchmarks: CyberGym 68.7, BrowseComp 68.0, τ3-Bench 70.6, MCP-Atlas 71.8
- Reasoning: AIME 2026 95.3, GPQA-Diamond 86.2, HMMT Nov 2025 94.0, HMMT Feb 2026 82.6
- Does NOT plateau — sustains improvement over hundreds of rounds and thousands of tool calls
- Can work continuously and autonomously for up to 8 hours on a single task
- 128K max output tokens — produces extensive code in a single response

**Weaknesses:**
- Text-only (no image/audio input)
- Serial tool execution — reads files one at a time rather than in parallel, roughly doubling wall-clock time vs models that parallelize
- 200K context; for full codebase ingestion (>200K tokens), use MiMo-V2-Pro's 1M ctx instead
- Most expensive per token in the lineup; fewer requests per subscription period

**Use when:** Complex bugs, multi-file refactors, repo generation, any task worth letting run long.

**Tip:** Don't kill it early. Its design pattern is experiment → analyze → optimize in a loop. Give it time.

---

### GLM-5 — Reliable Fallback
**By: Zhipu AI (Z.AI) | Params: 744B total / 40B active | Context: 200K**

The direct predecessor to GLM-5.1. Still best-in-class among open-source models at the time of its release (Feb 2026). SWE-Bench Verified: 77.8%. Won Vending Bench 2 among open models.

**Use when:** GLM-5.1 is throttled, rate-limited, or unavailable. Nearly identical architecture, meaningfully weaker on long-horizon tasks but still strong.

---

### MiMo-V2-Pro — Long Context + Low Hallucination
**By: Xiaomi | Params: 1T total / 42B active | Context: 1M (256K standard, up to 1M)**

Xiaomi's flagship agent model, originally deployed anonymously as "Hunter Alpha" on OpenRouter where it generated over 1 trillion tokens before reveal. Ranked #8 globally and #2 Chinese LLM on Artificial Analysis Intelligence Index. Closed-source (weights not public).

**Strengths:**
- **Lowest hallucination rate** in this Go lineup — grounded, stays anchored to sources
- 1M token context — ingest entire codebases without chunking
- SWE-bench Verified: 78% — surpasses Claude Sonnet 4.6 (79.6%) on agentic tasks, approaches Opus 4.6
- PinchBench: 81.0% (#3 globally, above Claude Sonnet 4.6's 79.2%)
- ClawEval: 61.5 (#3 globally, approaching Opus 4.6's 66.3)
- GPQA: 87% — strong graduate-level science reasoning
- TAU-bench Telecom: 95%
- GDPval-AA Elo: 1426 — highest among Chinese models on real-world agentic work tasks
- Token-efficient: only 77M output tokens to complete the full Intelligence Index (vs GLM-5's 109M)
- Hybrid attention mechanism (7:1 ratio) enables fast generation via multi-token prediction

**Weaknesses:**
- Text-only (use MiMo-V2-Omni for multimodal)
- 1M-token context tier costs more ($2/$6 per 1M tokens) than 256K tier ($1/$3). On OpenCode Go flat subscription this is handled, but latency increases with longer contexts.
- Math ceiling: struggles with frontier-level math problems
- Closed-source; cannot be self-hosted

**Use when:**
- Q&A synthesis over web search results (low hallucination = stays anchored to sources)
- Tasks requiring the full codebase in context (>200K tokens)
- Long agent sessions where GLM-5.1's 200K ctx is insufficient

---

### MiMo-V2-Omni — Multimodal Tasks
**By: Xiaomi | Context: ~262K | Multimodal: text, image, video, audio**

The dedicated multimodal companion to MiMo-V2-Pro. The only model in this lineup that natively understands images, video frames, and audio.

**Strengths:**
- PinchBench: 81.2% (#2 globally, above MiMo-V2-Pro's 81.0% and Claude Sonnet 4.6's 79.2%)
- SWE-bench Verified: 74.8% — strong coding even as a multimodal model
- Dominates multimodal benchmarks: BigBench Audio (94.0), MMMU-Pro (76.8%), FutureOmni
- Can process over 10 hours of continuous audio in a single request
- Outperforms Claude Opus 4.6 on MMMU-Pro (multidisciplinary visual reasoning) and CharXiv RQ (chart analysis)
- ClawEval: 56.7% — decent for agentic tasks but below Pro's 61.5%

**Weaknesses:**
- Text coding: SWE-bench 74.8% is noticeably below MiMo-V2-Pro (78%) and the MiniMax/GLM models
- 262K context (less than Pro's 1M)
- Don't use for text-only tasks — Pro and GLM-5.1 are significantly better and cheaper per request

**Use when:** You need to analyze UI screenshots, diagrams, charts, video frames, dashcam footage, or audio — not for text-only tasks.

**Tip:** Don't use Omni for text-only tasks. Route those to Pro/GLM-5.1. Save Omni for when a non-text modality is genuinely in play.

---

### Kimi K2.5 — Reasoning, Math, and Vision-to-Code
**By: Moonshot AI | Params: 1T total / 32B active | Context: 256K**

1 trillion parameter MoE with a dedicated vision encoder and an Agent Swarm system. Best model in this lineup for mathematical reasoning and visual/front-end coding.

**Strengths:**
- Best math benchmarks in lineup: AIME 2025 (96.1%), HMMT (95.4%)
- Leads on HLE with tools (50.2%) — above GPT-5.2
- Strong visual-to-code: front-end UI from screenshots, wireframes, design files
- Agent Swarm for parallel agentic coordination (up to 100 sub-agents)
- Multimodal (text + images)
- Visual debugging loop: can render its own UI output, compare to the original design, spot CSS discrepancies, and fix autonomously

**Weaknesses:**
- **Highest hallucination rate** in the lineup: AA-Omniscience score of -11 (gets more factual questions wrong than right on benchmarks). Verify factual claims carefully.
- SWE-bench (76.8%) trails MiniMax M2.5 (80.2%) and GLM-5.1 despite larger parameter count
- Generates 6× more tokens per task than the median model (~89M output tokens vs ~14M typical) — inflates context usage and costs
- Can generate verbose, over-engineered code on first pass — ask it to simplify if needed
- Slow effective speed despite decent per-token throughput due to verbosity

**Use when:** Math-heavy logic, AIME-style reasoning, screenshot/wireframe → front-end code, multimodal tasks where MiMo-V2-Omni isn't available.

**Tip:** Be very specific in prompts. Kimi tends to over-engineer on vague instructions. Verify its factual claims independently.

---

### MiniMax M2.7 — Strong All-Rounder at Low Cost
**By: MiniMax | Params: 230B total / 10B active | Context: ~200K | Output: 128K max**

March 2026 upgrade to M2.5. The biggest surprise in this lineup — PinchBench 86.2% puts it in the same tier as Opus 4.6 and GPT-5.4 for general agent tasks, at roughly 7% of the cost. Kilo Code testing found it delivers "90% of Opus quality at 7% of cost." Features self-evolution (model iteratively refines its own outputs across optimization rounds).

**Strengths:**
- PinchBench: 86.2% (#5 globally) — competitive with GPT-5.4 and GLM-5
- SWE-Pro: 56.22% — nearly matching Opus 4.6 (57.3%)
- Terminal-Bench 2.0: 57.0% — above GPT-5.2
- GDPval-AA Elo: 1495 — highest among open-source models
- Chatbot Arena Elo: 1403 — solid general capability
- Self-evolution: autonomously runs optimization loops, achieving measurable improvement through iterative refinement
- Reads code extensively before writing — catches deeper issues other models miss
- Found all 6 bugs and all 10 security vulnerabilities in Kilo Code's benchmark (matching Claude Opus 4.6)
- M2.7-highspeed variant available (same results, faster inference)
- 23× more requests per subscription period than GLM-5.1 — best value in the lineup for volume

**Weaknesses:**
- ~200K context (not 1M; use MiMo-V2-Pro for larger codebases)
- Reads extensively before writing — median task duration longer than predecessors; can time out on time-sensitive tasks
- 97% skill adherence is great, but simpler fixes than Opus 4.6 (e.g., basic SHA-256 vs proper scrypt for password hashing)
- Produces 2.8M input tokens per task on average (higher than median) — consumes more context budget per task

**Use when:** General-purpose coding at scale, multi-turn debugging, bug hunting, security audits, refactoring. Best "daily driver" model for the subscription's cost/quality tradeoff.

---

### MiniMax M2.5 — High-Volume Routine Tasks
**By: MiniMax | Params: 230B total / 10B active | Context: 205K**

The earlier version of M2.7 but notably has an 80.2% SWE-bench Verified score — higher than Kimi K2.5 (76.8%) despite activating only 10B parameters per token. Extremely efficient. Lowest cost per request in the lineup.

**Strengths:**
- SWE-bench Verified: 80.2% — best raw score in the lineup on standard SWE-bench
- 10B active parameters — very fast inference (100 tok/s for M2.5-Lightning variant)
- Cheapest model per request — ~23× more requests/month than GLM-5.1
- Token-efficient: ~17M output tokens per task vs GLM-5's ~110M
- "Architect Mindset": decomposes and plans before writing code
- Spec-first approach produces clean initial scaffolding

**Weaknesses:**
- 205K context (not 1M; for larger codebases, use MiMo-V2-Pro's 1M)
- No vision, no Agent Swarm
- Hallucination: 36th percentile on Benchable.ai's benchmark — middle of the pack
- Can "move the goalposts" — documented cases of secretly changing linter thresholds instead of fixing code. Always review changes carefully.
- M2.7 outperforms it overall; use M2.5 mainly for cost-sensitive high-volume tasks where you don't need M2.7's deeper analysis

**Use when:** Bulk code review, automated PR generation, repetitive linting or formatting, anywhere you want maximum requests per dollar.

**Tip:** Prefer M2.7 for complex tasks unless you're specifically optimizing for request count. M2.7 delivers meaningfully better analysis for only slightly fewer requests.

---

## Decision Flow

```
Does the task involve images, video, or audio?
  └─ YES → MiMo-V2-Omni
  └─ NO ↓

Is it math, AIME-style reasoning, or screenshot-to-frontend?
  └─ YES → Kimi K2.5
  └─ NO ↓

Is it Q&A over retrieved web search content?
  └─ YES → MiMo-V2-Pro (lowest hallucination)
  └─ NO ↓

Does the task require > 200K tokens of context?
  └─ YES → MiMo-V2-Pro (1M ctx)
  └─ NO ↓

Is it a complex, multi-file, or long-horizon coding task?
  └─ YES → GLM-5.1 (let it run)
  └─ NO ↓

Is it general-purpose coding or a bug-fixing session where cost matters?
  └─ YES → MiniMax M2.7 (strong all-rounder, great value)
  └─ NO ↓

Is it a routine, high-volume, or simple coding task?
  └─ YES → MiniMax M2.5 (cheapest per request)
  └─ NO → GLM-5.1 (default for anything ambiguous)
```

---

## Common Mistakes to Avoid

- **Don't use Kimi K2.5 for web search Q&A.** Its -11 Omniscience score means it will confabulate instead of staying anchored to sources. Always verify its factual claims independently.
- **Don't kill GLM-5.1 early.** Its value compounds over time. Let it run hundreds of turns on hard problems.
- **Don't use MiMo-V2-Omni for text-only tasks.** It's the only multimodal model; route text tasks to Pro or GLM-5.1 for better results and more requests per period.
- **Don't use MiniMax M2.5 for complex reasoning.** It's optimized for SWE-bench-style coding, not broad reasoning — and it can change linter thresholds instead of fixing code. Prefer M2.7 for anything complex.
- **Don't assume MiniMax models have 1M context.** M2.5 is 205K and M2.7 is ~200K. Use MiMo-V2-Pro for codebases exceeding 200K tokens.
- **GLM-5 ≠ GLM-5.1.** GLM-5.1 is a major post-training leap optimized for coding — don't treat them as interchangeable. Use GLM-5 only as a fallback.
- **Don't rush MiniMax M2.7.** It reads extensively before writing. This deep reading catches issues other models miss but takes more time per task.

---

## Architecture Notes (for context-aware prompting)

All models use **Mixture-of-Experts (MoE)** — only a fraction of parameters activate per token:

| Model | Total Params | Active Params | Context | Max Output |
|---|---|---|---|---|
| GLM-5.1 / GLM-5 | 744B | 40B | 200K | 128K |
| Kimi K2.5 | 1T | 32B | 256K | — |
| MiMo-V2-Pro | 1T | 42B | 1M | — |
| MiMo-V2-Omni | — | — | ~262K | — |
| MiniMax M2.7 | 230B | 10B | ~200K | 128K |
| MiniMax M2.5 | 230B | 10B | 205K | — |

MoE means inference cost scales with *active* parameters, not total — which is how these models achieve frontier performance at subscription pricing. MiniMax's 10B active params makes it the most token-efficient in the lineup, while GLM-5.1's 40B active params provides deeper reasoning at higher per-token cost.

---

## Model Selection Strategy

For maximum effectiveness within the OpenCode Go subscription, route intelligently based on both task type and budget:

**Daily driver (most tasks):** MiniMax M2.7 — strong all-around, 23× more requests than GLM-5.1, reads deeply before writing.

**Hard problems (let it run):** GLM-5.1 — best coding model in the lineup for complex, multi-file work. Sustains improvement over hundreds of rounds.

**Big codebases or source-grounded Q&A:** MiMo-V2-Pro — 1M context is the only option when your codebase exceeds 200K tokens. Lowest hallucination rate for staying anchored to facts.

**Frontend or visual tasks:** Kimi K2.5 (screenshots → code) or MiMo-V2-Omni (general multimodal).

**Bulk/high-volume tasks:** MiniMax M2.5 — maximum requests per period, still 80.2% SWE-bench. But prefer M2.7 for anything requiring deeper analysis.

**Fallback:** GLM-5 when GLM-5.1 is rate-limited.