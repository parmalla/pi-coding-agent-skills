---
name: pi-web-access
description: Set up, key, and troubleshoot the pi-web-access extension (web_search, fetch_content, source_check) on any machine. Use when the user wants to enable web search providers, add API keys, fix "no API key configured" or Exa MCP 429 rate-limit errors, reproduce the multi-provider web-search.json setup, or check which provider keys are present.
---

# Pi Web Access Setup

Reproducible, keys-in-one-file configuration for the `pi-web-access` extension.

## Install

From a clone of this repo (or a machine where `~/.pi/agent/skills` is symlinked
to `skills/`):

```sh
skills/pi-web-access/scripts/install.sh
```

The installer is idempotent and:

1. Resolves the config dir exactly like the extension does
   (`PI_CODING_AGENT_DIR` → existing XDG/legacy → `$XDG_CONFIG_HOME/pi` →
   `~/.pi/agent`).
2. Copies `get-web-key.sh` and `web-keys-status.sh` into that dir.
3. Creates `web-search-keys.env` from the template **only if it does not exist**
   (never overwrites existing keys).
4. Renders `web-search.json` from the template with absolute helper paths,
   backing up any existing file to `web-search.json.bak`.

It prints the resolved paths. No shell-profile changes are needed: keys are
resolved through `!command` credential sources, so the setup works whether Pi is
launched from a terminal, a window-manager keybind, or systemd.

## Add keys

1. Open the keys file the installer printed, typically
   `~/.config/pi/web-search-keys.env`.
2. Paste each key next to its variable. Every variable has the signup URL and
   free-tier limit in the comment above it.
3. Check coverage:

   ```sh
   ~/.config/pi/web-keys-status.sh
   ```

4. Restart Pi once so it loads the new `web-search.json`. After that, editing
   keys takes effect immediately (resolved per request).

## How it works

- `web-search.json` stores `"<provider>ApiKey": "!<config-dir>/get-web-key.sh <ENV_VAR>"`.
- `get-web-key.sh` sources `web-search-keys.env` and prints one value.
- An empty variable makes the provider report unavailable and fail closed —
  no empty credentials are ever sent.
- Secrets never appear in `web-search.json`, so that file is safe to copy to
  another machine. Only `web-search-keys.env` is secret.

## Recommended first keys

These have real free tiers and drive the `auto`/routing chain. The full matrix —
every provider, config field, env var, free tier, and signup link — is in
[reference/providers.md](reference/providers.md).

| Provider | Free tier | Create |
|---|---|---|
| Exa | $10 credits/mo (≈2,500 searches) | https://dashboard.exa.ai/api-keys |
| Brave Search | 2,000 queries/mo | https://api.search.brave.com/app/keys |
| Tavily | 1,000 credits/mo | https://app.tavily.com/home |
| Jina | Free key, 500 RPM | https://jina.ai/api-dashboard/key-manager |
| Firecrawl | 1,000 credits/mo | https://www.firecrawl.dev/app/api-keys |
| Gemini | Free tier | https://aistudio.google.com/apikey |

Filling `EXA_API_KEY` alone resolves the common default-mode failure where the
shared Exa MCP endpoint returns HTTP 429.

## Keyless alternatives

No key is needed for Exa MCP (default), Parallel MCP, DuckDuckGo, self-hosted
SearXNG/Crawl4AI, or Kimi Code Plan (`/login kimi-coding`). These are
explicit-only or zero-config and are documented in the reference.

## Troubleshooting

- **Provider still reports unavailable after adding a key:** confirm the
  variable has no stray quotes/whitespace and that
  `~/.config/pi/get-web-key.sh <ENV_VAR>` prints the value.
- **`command-empty` / `command-failed`:** the keys file is missing or the
  variable is blank; the helper intentionally prints nothing.
- **Bright Data unavailable:** `brightdataSerpZone` must name a zone of type
  `serp`; adding the token alone is not enough.
- **Config not picked up:** restart Pi once; verify the path the installer
  printed matches what Pi uses (`PI_CODING_AGENT_DIR` / `XDG_CONFIG_HOME`).
