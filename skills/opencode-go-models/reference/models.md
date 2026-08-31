# OpenCode Go — Model Catalog Reference

> **Auto-generated snapshot** from official sources. Last updated: 2026-08-31
> - API endpoint: `https://opencode.ai/zen/go/v1/models`
> - Docs: `https://opencode.ai/docs/go/`
> - Unofficial tracker: `https://julien.cloud/opencode-go-models/`

## Active / Documented Models

These models appear in the official OpenCode Go documentation and are recommended for general use.

| Model | Model ID | Context | Input $/1M | Output $/1M | Cache Read | Req/5h | Req/Month | Notes |
|---|---|---|---|---|---|---|---|---|
| **GLM-5.3-Flash** | `glm-5.3-flash` | 1M | $0.15 | $0.50 | $0.03 | 1,580 | 7,900 | 2× usage promo for limited time |
| **GLM-5.3** | `glm-5.3` | 1M | $1.40 | $4.40 | $0.26 | 220 | 1,080 | Open-weight |
| **GLM-5.2** | `glm-5.2` | 1M | $1.40 | $4.40 | $0.26 | 880 | 4,300 | Open-weight |
| **GLM-5.1** | `glm-5.1` | 203K | $1.40 | $4.40 | $0.26 | 880 | 4,300 | Open-weight |
| **GPT 5.6 Luna** | `gpt-5.6-luna` | 1M | $0.20 | $1.20 | $0.02 | 2,050 | 10,250 | — |
| **Kimi K3** | `kimi-k3` | 1M | $3.00 | $15.00 | $0.30 | 110 | 490 | Open-weight |
| **Kimi K2.7 Code** | `kimi-k2.7-code` | 262K | $0.95 | $4.00 | $0.19 | 1,350 | 6,750 | Open-weight |
| **Kimi K2.6** | `kimi-k2.6` | 262K | $0.95 | $4.00 | $0.16 | 1,150 | 5,750 | Open-weight |
| **LongCat-2.0** | `longcat-2.0` | 1M | $0.30 | $1.20 | $0.006 | 11,400 | 57,200 | — |
| **MiMo-V2.5** | `mimo-v2.5` | 1M | $0.14 | $0.28 | $0.0028 | 30,100 | 150,400 | Open-weight |
| **MiMo-V2.5-Pro** | `mimo-v2.5-pro` | 1M | $0.435 | $0.87 | $0.0036 | 3,250 | 16,300 | Open-weight |
| **MiniMax M3** | `minimax-m3` | 1M | $0.30 | $1.20 | $0.06 | 3,200 | 16,000 | Open-weight |
| **MiniMax M2.7** | `minimax-m2.7` | 205K | $0.30 | $1.20 | $0.06 | 3,400 | 17,000 | Open-weight |
| **Qwen3.8 Max** | `qwen3.8-max` | 1M | $2.00 | $6.00 | $0.25 | 160 | 810 | — |
| **Qwen3.8 Flash** | `qwen3.8-flash` | 1M | $0.15 | $0.47 | $0.02 | 5,400 | 27,000 | — |
| **Qwen3.7 Max** | `qwen3.7-max` | 1M | $2.50 | $7.50 | $0.50 | 340 | 1,690 | — |
| **Qwen3.7 Plus** | `qwen3.7-plus` | 1M | $0.40 | $1.60 | $0.04 | 4,300 | 21,600 | — |
| **Qwen3.6 Plus** | `qwen3.6-plus` | 1M | $0.50 | $3.00 | $0.05 | 3,300 | 16,300 | — |
| **DeepSeek V4 Pro** | `deepseek-v4-pro` | 1M | $0.66 | $1.98 | $0.02 | 1,050 | 5,200 | Open-weight; peak/off-peak pricing |
| **DeepSeek V4 Flash** | `deepseek-v4-flash` | 1M | $0.22 | $0.66 | $0.007 | 7,600 | 37,800 | Open-weight; peak/off-peak pricing |
| **DeepSeek V4 Flash Vision Exp** | `deepseek-v4-flash-vision-exp` | 1M | $0.22 | $0.66 | $0.007 | 3,800 | 18,900 | Vision support |
| **Hy4 preview** | `hy4-preview` | 1M | $0.83 | $2.50 | $0.04 | — | — | Open-weight |
| **Hy3** | `hy3` | 256K | $0.14 | $0.58 | $0.04 | — | — | Open-weight |

## Catalog / Undocumented Models

These models appear in the API metadata but are **not listed in the official docs**. They may be usable depending on your subscription.

| Model | Model ID | Status | Notes |
|---|---|---|---|
| Grok 4.6 | `grok-4.6` | active | 500K ctx; $2/$6 per 1M; 30-day retention |
| GPT 5.6 Luna | `gpt-5.6-luna` | active | 1M ctx; $0.20/$1.20 per 1M; 30-day retention |
| Muse Spark 1.2 Contributor | `muse-spark-1.2-contributor` | active | 1M ctx; $0.10/$0.20 per 1M; **training opt-in**; limited regions |

## Deprecated Models

These models are marked deprecated and may be removed. Use the replacements listed in the current catalog.

| Model | Model ID | Replacement | Deprecated |
|---|---|---|---|
| GLM-5 | `glm-5` | GLM-5.1 / GLM-5.2 / GLM-5.3 | 2026-08-31 |
| Kimi K2.5 | `kimi-k2.5` | Kimi K2.6 / K2.7 Code / K3 | 2026-08-31 |
| MiniMax M2.5 | `minimax-m2.5` | MiniMax M2.7 / M3 | 2026-08-31 |
| MiMo V2 Pro | `mimo-v2-pro` | MiMo-V2.5-Pro | 2026-03-18 |
| MiMo V2 Omni | `mimo-v2-omni` | MiMo-V2.5 | 2026-03-18 |
| Qwen3.5 Plus | `qwen3.5-plus` | Qwen3.6 Plus / Qwen3.7-Max | 2026-02-16 |
| Grok 4.5 | `grok-4.5` | Grok 4.6 | 2026-07-08 |

## Subscription Limits (all models)

| Period | Dollar Limit |
|---|---|
| 5 hours | $12 |
| Weekly | $30 |
| Monthly | $60 |

Actual request counts depend on per-model token pricing. Cheaper models (e.g., MiMo-V2.5, Muse Spark) allow far more requests than expensive ones (e.g., Kimi K3, Grok 4.6).

## Privacy / Data Retention

| Model | Training Use | Data Retention |
|---|---|---|
| GLM family | Not used | 0 days |
| Kimi family | Not used | 0 days |
| MiMo family | Not used | 0 days |
| MiniMax family | Not used | 0 days |
| Qwen family | Not used | 0 days |
| DeepSeek V4 family | Not used | 0 days* (ZDR renewed monthly) |
| Hy family | Not used | 0 days |
| LongCat-2.0 | Not used | 0 days |
| Grok 4.6 | Not used | 30 days (ZDR disables stateful APIs) |
| GPT 5.6 Luna | Not used | 30 days (abuse monitoring logs) |
| Muse Spark 1.2 Contributor | **Yes** | Not ZDR — opt-in training tier |

## How to Refresh This Reference

1. Run the fetch script:
   ```bash
   ./scripts/fetch-models.sh reference
   ```
2. Visit `https://opencode.ai/docs/go/` for updated request estimates and pricing.
3. Update this file with any new models, price changes, or deprecations.
4. Update `SKILL.md` frontmatter if new model names are added.
