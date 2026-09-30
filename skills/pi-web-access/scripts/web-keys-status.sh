#!/bin/sh
# Report which pi-web-access provider keys are filled in.
#
#   ~/.config/pi/web-keys-status.sh
#
# Reads web-search-keys.env next to this script (override with PI_WEB_SEARCH_KEYS).
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
KEYS_FILE="${PI_WEB_SEARCH_KEYS:-$SCRIPT_DIR/web-search-keys.env}"
if [ ! -f "$KEYS_FILE" ]; then
  echo "No keys file at $KEYS_FILE"
  exit 1
fi

# shellcheck disable=SC1090
. "$KEYS_FILE"

printf '%-24s %s\n' "VARIABLE" "STATUS"
printf '%-24s %s\n' "------------------------" "------"
for name in \
  EXA_API_KEY BRAVE_API_KEY TAVILY_API_KEY JINA_API_KEY FIRECRAWL_API_KEY \
  GEMINI_API_KEY TINYFISH_API_KEY SEARCH1API_KEY SEARCHINFINITY_API_KEY \
  QUERIT_API_KEY SERPDIVE_API_KEY SERPER_API_KEY SERPAPI_KEY SERPBASE_API_KEY \
  SERPLY_API_KEY VALYU_API_KEY BRIGHTDATA_API_KEY MISTRAL_API_KEY \
  OLLAMA_API_KEY XCRAWL_API_KEY YDC_API_KEY BOCHA_API_KEY PARALLEL_API_KEY \
  PERPLEXITY_API_KEY DATALAB_API_KEY ANYSEARCH_API_KEY OPENAI_API_KEY \
  XAI_API_KEY KAGI_API_KEY ZAI_API_KEY BAIZHI_API_KEY
do
  eval "value=\${$name-}"
  if [ -n "${value:-}" ]; then
    printf '%-24s %s\n' "$name" "set"
  else
    printf '%-24s %s\n' "$name" "-"
  fi
done
