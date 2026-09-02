#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# 1. Installs npm dependencies when node_modules is missing or stale, so
#    `npx vitest run` and `npm run build` work from the first turn.
# 2. Installs the Impeccable design skill (/impeccable) per-machine into
#    .claude/skills/, which .gitignore deliberately keeps out of the repo.
#    `npx impeccable install` cannot run here: its download host,
#    impeccable.style, is blocked by the remote egress policy. GitHub is
#    allowed, so the compiled plugin build is taken from the source repo.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# --- npm dependencies --------------------------------------------------------
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "session-start: installing npm dependencies"
  npm install --no-audit --no-fund
fi

# --- Impeccable skill --------------------------------------------------------
IMPECCABLE_REPO="https://github.com/pbakaus/impeccable.git"
SKILL_DIR=".claude/skills/impeccable"
AGENT_DIR="$HOME/.claude/agents"

if [ -f "$SKILL_DIR/SKILL.md" ]; then
  echo "session-start: impeccable already installed ($(grep -m1 '^version:' "$SKILL_DIR/SKILL.md"))"
else
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  if git clone --quiet --depth 1 "$IMPECCABLE_REPO" "$TMP/impeccable"; then
    mkdir -p .claude/skills "$AGENT_DIR"
    rm -rf "$SKILL_DIR"
    cp -R "$TMP/impeccable/plugin/skills/impeccable" "$SKILL_DIR"
    cp "$TMP/impeccable/plugin/agents/"impeccable-*.md "$AGENT_DIR/"
    echo "session-start: installed impeccable $(grep -m1 '^version:' "$SKILL_DIR/SKILL.md") from $IMPECCABLE_REPO"
  else
    # Never block the session over an optional skill.
    echo "session-start: WARNING could not clone $IMPECCABLE_REPO; /impeccable will be unavailable" >&2
  fi
fi
