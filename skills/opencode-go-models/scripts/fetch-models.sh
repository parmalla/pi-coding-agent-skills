#!/usr/bin/env bash
# fetch-models.sh — Fetch latest OpenCode Go model data from official sources
# Usage: ./fetch-models.sh [output-dir]
# Fetches:
#   1. https://opencode.ai/zen/go/v1/models  (canonical catalog — unauthenticated)
#   2. https://opencode.ai/docs/go/          (pricing, request estimates, privacy)
# Output: models-api.json + raw docs HTML, plus a summary to stdout.

set -euo pipefail

OUTDIR="${1:-.}"
mkdir -p "$OUTDIR"

API_URL="https://opencode.ai/zen/go/v1/models"
DOCS_URL="https://opencode.ai/docs/go/"

echo "==> Fetching model catalog from $API_URL ..."
curl -fsSL "$API_URL" -o "$OUTDIR/models-api.json"
echo "    Saved: $OUTDIR/models-api.json"

echo ""
echo "==> Fetching docs page from $DOCS_URL ..."
# Save raw HTML for offline inspection; ignore failure (docs may be behind CDN)
if curl -fsSL "$DOCS_URL" -o "$OUTDIR/go-docs.html" 2>/dev/null; then
  echo "    Saved: $OUTDIR/go-docs.html"
else
  echo "    Warning: could not fetch docs page (network issue), continuing..."
fi

echo ""
echo "==> Available model IDs (sorted):"
if command -v jq >/dev/null 2>&1; then
  jq -r '.data[].id' "$OUTDIR/models-api.json" | sort | sed 's/^/  - /'
  COUNT=$(jq '.data | length' "$OUTDIR/models-api.json")
  echo ""
  echo "Total: $COUNT models in catalog"
else
  cat "$OUTDIR/models-api.json"
fi

echo ""
echo "==> Snapshot timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""
echo "Next steps:"
echo "  1. Compare with reference/models.md snapshot (pricing & request estimates)."
echo "  2. If models were added/removed, update SKILL.md frontmatter description."
echo "  3. Update reference/models.md pricing tables from the docs page."
echo "  4. Source of truth for routing decisions: live API + docs page above."
