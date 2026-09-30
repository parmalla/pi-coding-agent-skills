# Pi Web Access — provider matrix

Installed by `scripts/install.sh`. The variable names below match
`web-search-keys.env`; the config field names match `web-search.json`.

## No key required

| Provider | Select with | Notes |
|---|---|---|
| Exa MCP | `provider: "exa"` | Zero-config default; shared free MCP rate limit (HTTP 429 when busy). Adding `EXA_API_KEY` switches to the direct API with your own credits. |
| Parallel MCP | `provider: "parallel-mcp"` | Keyless. Optional `PARALLEL_API_KEY` raises limits. Add to `fetchRouting` + `allowRemoteHostedProviders` for MCP `web_fetch`. |
| DuckDuckGo | `provider: "duckduckgo"` | Keyless HTML search, explicit-only. No reliable recency filter. |
| SearXNG | `searxngBaseUrl` | Self-hosted JSON API; tried first in `auto` when configured. |
| Crawl4AI | `crawl4aiBaseUrl` | Self-hosted extraction fallback; no search API. |
| Kimi Code Plan | `provider: "kimi"` | Run `/login kimi-coding` in Pi; no key configured here. |

## Free tier / free credits

| Provider | Config field | Env var | Free tier | Create key |
|---|---|---|---|---|
| Exa | `exaApiKey` | `EXA_API_KEY` | $10 credits/mo (≈2,500 searches) | https://dashboard.exa.ai/api-keys |
| Brave Search | `braveApiKey` | `BRAVE_API_KEY` | 2,000 queries/mo | https://api.search.brave.com/app/keys |
| Tavily | `tavilyApiKey` | `TAVILY_API_KEY` | 1,000 credits/mo | https://app.tavily.com/home |
| Jina | `jinaApiKey` | `JINA_API_KEY` | Free key, 500 RPM | https://jina.ai/api-dashboard/key-manager |
| Firecrawl | `firecrawlApiKey` | `FIRECRAWL_API_KEY` | 1,000 credits/mo | https://www.firecrawl.dev/app/api-keys |
| Google Gemini | `geminiApiKey` | `GEMINI_API_KEY` | Free tier | https://aistudio.google.com/apikey |
| TinyFish | `tinyfishApiKey` | `TINYFISH_API_KEY` | Credit-free Search+Fetch | https://agent.tinyfish.ai/api-keys |
| Search1API | `search1apiApiKey` | `SEARCH1API_KEY` | Free signup credits | https://dashboard.search1api.com |
| Searchinfinity | `searchinfinityApiKey` | `SEARCHINFINITY_API_KEY` | Monthly free quota | https://console.byteplus.com/search-infinity/api-key |
| Querit | `queritApiKey` | `QUERIT_API_KEY` | Free signup credits | https://www.querit.ai/en/dashboard/api-keys |
| SERPdive | `serpdiveApiKey` | `SERPDIVE_API_KEY` | `krill` model free (default) | https://serpdive.com/dashboard/keys |
| Serper | `serperApiKey` | `SERPER_API_KEY` | 2,500 signup credits | https://serper.dev/signup |
| SerpApi | `serpapiApiKey` | `SERPAPI_KEY` | 250 searches/mo | https://serpapi.com/users/sign_up?plan=free |
| SerpBase | `serpbaseApiKey` | `SERPBASE_API_KEY` | 100 signup searches | https://serpbase.dev/register |
| Serply | `serplyApiKey` | `SERPLY_API_KEY` | Free tier | https://serply.io/ |
| Valyu | `valyuApiKey` | `VALYU_API_KEY` | $10 credits ($20 work email) | https://platform.valyu.ai/ |
| Bright Data | `brightdataApiKey` + `brightdataSerpZone` | `BRIGHTDATA_API_KEY` | 5,000 credits/mo | https://brightdata.com/cp/setting/users (zones: https://brightdata.com/cp/zones) |
| Mistral | `mistralApiKey` | `MISTRAL_API_KEY` | Free mode | https://console.mistral.ai/api-keys |
| Ollama | `ollamaApiKey` | `OLLAMA_API_KEY` | Free web-search tier | https://ollama.com/settings/keys |
| XCrawl | `xcrawlApiKey` | `XCRAWL_API_KEY` | Free signup credits | https://dash.xcrawl.com/ |
| You.com | `youApiKey` | `YDC_API_KEY` | $100 trial credits | https://you.com/platform |
| Bocha | `bochaApiKey` | `BOCHA_API_KEY` | Free trial quota | https://open.bochaai.com/ |
| Parallel | `parallelApiKey` | `PARALLEL_API_KEY` | $5/mo credits (card) | https://platform.parallel.ai/ |
| Datalab | `datalabApiKey` | `DATALAB_API_KEY` | $10/mo credit (25 req/min) | https://www.datalab.to/app/apikeys |
| AnySearch | `anysearchApiKey` | `ANYSEARCH_API_KEY` | Anonymous works | https://anysearch.com/ (optional) |
| Serper | — | `TAVILY_API_KEY_1..20` | Tavily key pool (see below) | — |

### Tavily key pool

`TAVILY_API_KEY_1` through `TAVILY_API_KEY_20` are tried in order when Tavily
returns 401/402/403/429/432. `TAVILY_API_KEY_INDEX` picks the starting slot
(default 1). `TAVILY_API_KEY` remains the final fallback. Add extra `_N`
variables to the keys file if you maintain multiple free accounts.

## Paid or subscription

| Provider | Config field | Env var | Notes |
|---|---|---|---|
| OpenAI | `openaiApiKey` | `OPENAI_API_KEY` | Paid. Codex/ChatGPT login in Pi is used automatically when available. |
| Perplexity | `perplexityApiKey` | `PERPLEXITY_API_KEY` | Pay-as-you-go; Pro gives $5/mo credit. 10 req/min cap. |
| xAI (Grok) | `xaiApiKey` | `XAI_API_KEY` | SuperGrok / X Premium resolve through Pi's model registry, no key needed. |
| Kagi | `kagiApiKey` | `KAGI_API_KEY` | Paid Kagi plan required. |
| Z.ai | `zaiApiKey` | `ZAI_API_KEY` | GLM Coding Plan quota. |
| Baizhi | `baizhiApiKey` | `BAIZHI_API_KEY` | Commercial credits. |
| Cloudflare AI Gateway | `cloudflareApiKey` | `CLOUDFLARE_API_KEY` | Only when `geminiBaseUrl` points at `gateway.ai.cloudflare.com`. |

## Routing behavior in the shipped config

`searchRouting.providers` selects this fallback order:

```
exa → brave → tavily → jina → firecrawl → tinyfish → search1api →
searchinfinity → querit → serpdive → gemini → perplexity
```

`fallbackOn` covers `transient`, `quota`, `network`, `invalid-response`, and
`unsupported`, so a 429 from one provider moves to the next instead of failing
the search.

Explicit-only providers (Serper, SerpApi, SerpBase, Serply, Valyu, Bright Data,
Mistral, You.com, XCrawl, Baizhi, Z.ai, AnySearch, Serply, Parallel MCP,
DuckDuckGo, Kimi) never join `auto` or `provider: "all"`; call them with
`provider: "<name>"` or list them in `searchRouting.providers`.

## Verifying

```sh
# Which keys are filled in?
~/.config/pi/web-keys-status.sh        # path varies; installer prints it

# From a Pi session:
web_search({ query: "test", provider: "all" })
web_search({ query: "test", provider: "brave" })
```
