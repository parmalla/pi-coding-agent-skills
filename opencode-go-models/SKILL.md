---
name: opencode-go-models
description: Model routing guide for the Pi coding agent OpenCode Go subscription. Use this skill whenever the user asks which model to use, wants to switch models, is picking a model for a task, mentions any of the available models by name (GLM-5, GLM-5.1, Kimi K2.5, MiMo-V2-Pro, MiMo-V2-Omni, MiniMax M2.5, MiniMax M2.7), or describes a task and implicitly needs a model recommendation. Always consult this before suggesting a model.
---

# OpenCode Go — Model Routing Guide

This skill helps route tasks to the right model in the Pi coding agent OpenCode Go subscription. All models listed here are available under the subscription. Every model uses a Mixture-of-Experts (MoE) architecture, activating only a fraction of total parameters per token — which is why frontier-grade intelligence is available at this price point.

---

## Quick Reference Table

| Task Type | Best Model | Why |
|---|---|---|
| Complex multi-file coding, long refactor, repo gen | **GLM-5.1** | #1 SWE-Bench Pro, long-horizon agentic loops |
| Full codebase ingestion, long agent sessions | **MiMo-V2-Pro** | 1M ctx, low hallucination, strong tool calls |
| Q&A over web search results | **MiMo-V2-Pro** | Lowest hallucination rate in the lineup |
| Multi-turn agent workflows, bug fixing | **MiniMax M2.7** | Strong rate limits, great context handling |
| High-volume routine/simpler tasks | **MiniMax M2.5** | Cheapest, still 80.2% SWE-bench |
| Screenshot → code, visual UI tasks | **Kimi K2.5** | Vision encoder, strong front-end work |
| Image / video / audio understanding | **MiMo-V2-Omni** | Only multimodal model in the lineup |
| Math-heavy or science reasoning | **Kimi K2.5** | AIME 96.1%, HLE 50.2% with tools |
| GLM-5.1 unavailable / quota exhausted | **GLM-5** | Same family, solid fallback |

---

## Model Profiles

### GLM-5.1 — Primary Workhorse
**By: Zhipu AI (Z.AI) | Params: 744B total / 40B active | Context: 205K**

The top coding model in this lineup. Purpose-built for long-horizon agentic engineering.

**Strengths:**
- #1 globally on SWE-Bench Pro (58.4) — above GPT-5.4, Claude Opus 4.6, Gemini 3.1 Pro
- #3 on Code Arena (1530 Elo) — highest open-weight model ever on that leaderboard
- Best-in-class on NL2Repo (full repo generation from natural language) and Terminal-Bench 2.0
- Does NOT plateau — sustains improvement over hundreds of rounds and thousands of tool calls
- Can work continuously and autonomously for up to 8 hours on a single task

**Weaknesses:**
- Text-only (no image/audio input)
- Requires 205K ctx; for full codebase ingestion use MiMo-V2-Pro's 1M ctx instead

**Use when:** Complex bugs, multi-file refactors, repo generation, any task worth letting run long.

**Tip:** Don't kill it early. Its design pattern is experiment → analyze → optimize in a loop. Give it time.

---

### GLM-5 — Reliable Fallback
**By: Zhipu AI (Z.AI) | Params: 744B total / 40B active | Context: 205K**

The direct predecessor to GLM-5.1. Still best-in-class among open-source models at the time of its release (Feb 2026). SWE-Bench Verified: 77.8%.

**Use when:** GLM-5.1 is throttled, rate-limited, or unavailable. Nearly identical architecture, meaningfully weaker on long-horizon tasks but still strong.

---

### MiMo-V2-Pro — Long Context + Low Hallucination
**By: Xiaomi | Params: 1T total / 42B active | Context: 1M tokens**

Xiaomi's flagship agent model, originally deployed anonymously as "Hunter Alpha" on OpenRouter where it generated over 1 trillion tokens before reveal. Ranked #8 globally and #2 Chinese LLM on Artificial Analysis Intelligence Index.

**Strengths:**
- **Lowest hallucination rate** in this lineup: +5 AA-Omniscience (vs Kimi K2.5's -8, GLM-5's +2)
- 1M token context — ingest entire codebases without chunking
- Coding ability surpasses Claude Sonnet 4.6; agent performance approaching Opus 4.6
- ClawEval 61.5 (vs Opus 4.6's 66.3) — strongest agentic benchmark in this lineup after GLM-5.1
- GDPval-AA Elo: 1426 — highest among Chinese models on real-world agentic work tasks
- Token-efficient: only 77M output tokens to complete the full Intelligence Index (vs GLM-5's 109M)

**Weaknesses:**
- Text-only (use MiMo-V2-Omni for multimodal)
- 1M-token context tier costs more than 256K tier

**Use when:**
- Q&A synthesis over web search results (low hallucination = stays anchored to sources)
- Tasks requiring the full codebase in context
- Long agent sessions where GLM-5.1's 205K ctx is insufficient

---

### MiMo-V2-Omni — Multimodal Tasks
**By: Xiaomi | Multimodal: text, image, video, audio**

The dedicated multimodal companion to MiMo-V2-Pro. The only model in this lineup that natively understands images, video frames, and audio.

**Strengths:**
- Dominates multimodal benchmarks: BigBench Audio (94.0), MMMU-Pro, FutureOmni
- Can process over 10 hours of continuous audio in a single request
- Outperforms Claude Opus 4.6 on MMMU-Pro (multidisciplinary visual reasoning) and CharXiv RQ (chart analysis)

**Use when:** You need to analyze UI screenshots, diagrams, charts, video frames, dashcam footage, or audio — not for text-only tasks.

**Tip:** Don't use Omni for text-only tasks. Route those to Pro/GLM-5.1. Save Omni for when a non-text modality is genuinely in play.

---

### Kimi K2.5 — Reasoning, Math, and Vision-to-Code
**By: Moonshot AI | Params: 1T total / 32B active | Context: 256K**

1 trillion parameter MoE with a dedicated vision encoder and an Agent Swarm system. Best model in this lineup for mathematical reasoning and visual/front-end coding.

**Strengths:**
- Best math benchmarks: AIME 2025 (96.1%), HMMT (95.4%)
- Leads on HLE with tools (50.2%) — above GPT-5.2
- Strong visual-to-code: front-end UI from screenshots, wireframes, design files
- Agent Swarm for parallel agentic coordination
- Multimodal (text + images)

**Weaknesses:**
- Highest hallucination rate: AA-Omniscience score of -8 (gets more factual questions wrong than right)
- SWE-bench (76.8%) trails MiniMax M2.5 (80.2%) and GLM-5.1 despite larger parameter count
- Can generate verbose, over-engineered code on first pass — ask it to simplify if needed
- Slower response time than Kimi alternatives

**Use when:** Math-heavy logic, AIME-style reasoning, screenshot/wireframe → front-end code, multimodal tasks where MiMo-V2-Omni isn't available.

**Tip:** Be very specific in prompts. Kimi tends to over-engineer on vague instructions.

---

### MiniMax M2.7 — Cost-Efficient Agent Workflows
**By: MiniMax | Params: 230B total / 10B active | Context: 1M**

March 2026 upgrade to M2.5. Strong SWE-bench, generous rate limits, and 1M context at the lowest price in the lineup.

**Strengths:**
- Vals Index: 59.58% — strong and improving
- 1M token context
- Best rate limits for multi-turn workflows
- Handles multi-step agent conversations well across 10+ turns
- Significantly cheaper than other frontier models

**Use when:** Multi-turn debugging sessions, code review loops, bug-fixing pipelines, any agent workflow where you want to run many turns without hitting limits.

---

### MiniMax M2.5 — High-Volume Routine Tasks
**By: MiniMax | Params: 230B total / 10B active | Context: 1M**

The earlier version of M2.7 but notably has a 80.2% SWE-bench Verified score — higher than Kimi K2.5 (76.8%) despite activating only 10B parameters per token. Extremely efficient.

**Strengths:**
- SWE-bench Verified: 80.2% — best in the lineup by raw score
- 10B active parameters — very fast inference
- Cheapest model in the lineup
- 1M context

**Weaknesses:**
- No vision, no agentic extras
- M2.7 scores higher overall; use M2.5 mainly for cost-sensitive high-volume tasks

**Use when:** Bulk code review, automated PR generation, repetitive linting or formatting tasks, anywhere you want to run many calls cheaply.

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

Does the task require > 205K tokens of context?
  └─ YES → MiMo-V2-Pro (1M ctx)
  └─ NO ↓

Is it a complex, multi-file, or long-horizon coding task?
  └─ YES → GLM-5.1 (let it run)
  └─ NO ↓

Is it a multi-turn agent workflow or bug-fixing session?
  └─ YES → MiniMax M2.7
  └─ NO ↓

Is it a routine, high-volume, or simple coding task?
  └─ YES → MiniMax M2.5
  └─ NO → GLM-5.1 (default for anything ambiguous)
```

---

## Common Mistakes to Avoid

- **Don't use Kimi K2.5 for web search Q&A.** Its -8 Omniscience score means it will confabulate instead of staying anchored to sources.
- **Don't kill GLM-5.1 early.** Its value compounds over time. Let it run hundreds of turns on hard problems.
- **Don't use MiMo-V2-Omni for text-only tasks.** It's the only multimodal model; don't waste it on things the other models handle better.
- **Don't use MiniMax M2.5 for complex reasoning.** It's optimized for SWE-bench-style coding, not broad reasoning.
- **GLM-5 ≠ GLM-5.1.** GLM-5.1 is a major leap — don't treat them as interchangeable. Use GLM-5 only as a fallback.

---

## Architecture Notes (for context-aware prompting)

All models use **Mixture-of-Experts (MoE)** — only a fraction of parameters activate per token:

| Model | Total Params | Active Params | Context |
|---|---|---|---|
| GLM-5.1 / GLM-5 | 744B | 40B | 205K |
| Kimi K2.5 | 1T | 32B | 256K |
| MiMo-V2-Pro | 1T | 42B | 1M |
| MiniMax M2.5/M2.7 | 230B | 10B | 1M |

MoE means inference cost scales with *active* parameters, not total — which is how these models achieve frontier performance at subscription pricing.
