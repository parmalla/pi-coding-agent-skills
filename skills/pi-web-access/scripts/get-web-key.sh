#!/bin/sh
# Resolve one pi-web-access provider credential from the local keys file.
#
# This is used as a trusted `!command` credential source in web-search.json:
#
#   "braveApiKey": "!/path/to/get-web-key.sh BRAVE_API_KEY"
#
# It prints the value with no trailing newline. When the variable is unset or
# empty it prints nothing and exits 0, so an unfilled provider fails closed
# (provider reported unavailable) instead of sending an empty credential.
#
# The keys file defaults to `web-search-keys.env` next to this script. Override
# with PI_WEB_SEARCH_KEYS=/path/to/file if you keep it elsewhere.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
KEYS_FILE="${PI_WEB_SEARCH_KEYS:-$SCRIPT_DIR/web-search-keys.env}"
[ -f "$KEYS_FILE" ] || exit 0

# shellcheck disable=SC1090
. "$KEYS_FILE"

name="${1:-}"
[ -n "$name" ] || exit 0

eval "value=\${$name-}"
[ -n "${value:-}" ] || exit 0

printf '%s' "$value"
