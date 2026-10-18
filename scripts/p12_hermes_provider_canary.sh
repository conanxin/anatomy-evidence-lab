#!/usr/bin/env bash
# P12: deliberately isolated model baseline before explicit procedure prompt.
# Never trust/install global skills or alter the user's original dirty worktree.
set -u
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PROFILE_SOURCE=${HERMES_PROFILE_SOURCE:-"$HOME/.hermes"}
if ! command -v hermes >/dev/null; then echo 'HERMES_CLI=UNAVAILABLE'; exit 2; fi
PROFILE=$(mktemp -d /tmp/evidence-first-anatomy-p12-XXXXXX)
trap 'rm -f "$PROFILE/.env"; rm -rf "$PROFILE"' EXIT
mkdir -p "$PROFILE/skills"
[ -f "$PROFILE_SOURCE/config.yaml" ] && cp "$PROFILE_SOURCE/config.yaml" "$PROFILE/config.yaml"
[ -f "$PROFILE_SOURCE/.env" ] && ln -s "$PROFILE_SOURCE/.env" "$PROFILE/.env"
export HERMES_HOME="$PROFILE"
printf 'SOURCE_SHA='; git -C "$ROOT" rev-parse HEAD
printf 'START=%s\n' "$(date -Is)"
# No --skills none: that is not the contract for an empty skill selection.
begin=$(date +%s)
timeout -k 5s 90s hermes --in "$ROOT" -z 'Respond ONLY READY.' >"$PROFILE/base.out" 2>"$PROFILE/base.err"
base=$?
printf 'BASE_EXIT=%s BASE_SEC=%s BASE_BYTES=%s\n' "$base" "$(($(date +%s)-begin))" "$(wc -c <"$PROFILE/base.out")"
if [ "$base" -ne 0 ] || ! grep -Fxq 'READY' "$PROFILE/base.out"; then
  echo 'SKILL_TURN=NOT_RUN_BASELINE_NOT_READY'
  echo 'FINAL_GATE=BLOCKED_PROVIDER_OR_UNEXPECTED_OUTPUT'
  exit 0
fi
cp -a "$ROOT/skills/evidence-first-anatomy" "$PROFILE/skills/"
hermes skills list --source local >"$PROFILE/discovery.out" 2>"$PROFILE/discovery.err"
if ! grep -q 'evidence-first-anatomy' "$PROFILE/discovery.out";then
  echo 'SKILL_DISCOVERY=NOT_FOUND';echo 'FINAL_GATE=BLOCKED_DISCOVERY';exit 0
fi
echo 'SKILL_DISCOVERY=PASS'
begin=$(date +%s)
timeout -k 5s 150s hermes --in "$ROOT" --skills evidence-first-anatomy -z 'Use evidence-first-anatomy for 桔槔: cite specific source locators, identify DOCUMENTED, INFERRED, ILLUSTRATIVE, UNKNOWN, explicitly note historical dimensions unsupported, and name two falsifiable model tests. Answer concisely; do not modify files.' >"$PROFILE/skill.out" 2>"$PROFILE/skill.err"
skill=$?
printf 'SKILL_EXIT=%s SKILL_SEC=%s SKILL_OUTPUT_BYTES=%s\n' "$skill" "$(($(date +%s)-begin))" "$(wc -c <"$PROFILE/skill.out")"
for tag in DOCUMENTED INFERRED ILLUSTRATIVE UNKNOWN; do
  printf '%s=%s\n' "$tag" "$(grep -c "$tag" "$PROFILE/skill.out" || true)"
done
if [ "$skill" -eq 0 ] && [ -s "$PROFILE/skill.out" ];then
  echo 'SKILL_AGENT_ANSWER=RETURNED'
  echo 'RESPONSE_REVIEW=REQUIRES_HUMAN_SOURCE_CHECK'
else echo 'SKILL_AGENT_ANSWER=NOT_VERIFIED';fi
echo "END=$(date -Is)"
