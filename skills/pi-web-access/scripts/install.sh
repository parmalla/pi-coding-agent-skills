#!/bin/sh
# Idempotently install the pi-web-access multi-provider configuration.
#
#   skills/pi-web-access/scripts/install.sh
#
# What it does:
#   1. Resolves the pi-web-access config dir exactly like the extension does.
#   2. Installs get-web-key.sh + web-keys-status.sh into that dir.
#   3. Creates web-search-keys.env from the template if it does not exist
#      (never overwrites an existing keys file).
#   4. Renders web-search.json from the template with absolute helper paths,
#      backing up any existing file to web-search.json.bak first.
#
# Safe to re-run. Secrets live only in web-search-keys.env, which is never
# written by this script after the first run.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SKILL_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

# Mirror pi-web-access utils.ts getWebSearchConfigDir():
#   PI_CODING_AGENT_DIR > existing XDG/legacy > XDG_CONFIG_HOME/pi > ~/.pi/agent
resolve_config_dir() {
  if [ -n "${PI_CODING_AGENT_DIR:-}" ]; then
    printf '%s' "$PI_CODING_AGENT_DIR"
    return
  fi
  if [ -n "${XDG_CONFIG_HOME:-}" ]; then
    xdg="$XDG_CONFIG_HOME/pi"
    [ -f "$xdg/web-search.json" ] && { printf '%s' "$xdg"; return; }
    legacy="$HOME/.pi"
    [ -f "$legacy/web-search.json" ] && { printf '%s' "$legacy"; return; }
    printf '%s' "$xdg"
    return
  fi
  agent="$HOME/.pi/agent"
  [ -f "$agent/web-search.json" ] && { printf '%s' "$agent"; return; }
  legacy="$HOME/.pi"
  [ -f "$legacy/web-search.json" ] && { printf '%s' "$legacy"; return; }
  printf '%s' "$agent"
}

CONFIG_DIR=$(resolve_config_dir)
mkdir -p "$CONFIG_DIR"

cp "$SCRIPT_DIR/get-web-key.sh" "$CONFIG_DIR/get-web-key.sh"
cp "$SCRIPT_DIR/web-keys-status.sh" "$CONFIG_DIR/web-keys-status.sh"
chmod 700 "$CONFIG_DIR/get-web-key.sh" "$CONFIG_DIR/web-keys-status.sh"

KEYS_CREATED=0
if [ ! -f "$CONFIG_DIR/web-search-keys.env" ]; then
  cp "$SKILL_DIR/assets/web-search-keys.env.template" "$CONFIG_DIR/web-search-keys.env"
  KEYS_CREATED=1
fi
chmod 600 "$CONFIG_DIR/web-search-keys.env"

if [ -f "$CONFIG_DIR/web-search.json" ]; then
  cp -p "$CONFIG_DIR/web-search.json" "$CONFIG_DIR/web-search.json.bak"
fi
sed "s|__PI_WEB_ACCESS_DIR__|$CONFIG_DIR|g" \
  "$SKILL_DIR/assets/web-search.json.template" > "$CONFIG_DIR/web-search.json"
chmod 600 "$CONFIG_DIR/web-search.json"

echo "pi-web-access installed"
echo "  config dir : $CONFIG_DIR"
echo "  config     : $CONFIG_DIR/web-search.json"
echo "  keys file  : $CONFIG_DIR/web-search-keys.env"
echo "  helper     : $CONFIG_DIR/get-web-key.sh"
echo
if [ "$KEYS_CREATED" -eq 1 ]; then
  echo "The keys file is new and empty. Add keys, then check with:"
else
  echo "Existing keys file kept. Check with:"
fi
echo "  $CONFIG_DIR/web-keys-status.sh"
echo
echo "Restart pi once so it loads web-search.json, then test:"
echo "  web_search({ query: \"test\", provider: \"all\" })"
echo
echo "Full provider list + signup links: $SKILL_DIR/reference/providers.md"
