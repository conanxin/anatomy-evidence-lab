#!/usr/bin/env bash
# Runs only when explicitly invoked on the user's authorized WSL machine.
# Does not install a Skill globally, trust a project, change a live gateway or read a user's private databases.
set -u
project=${1:-"$HOME/projects/anatomy-p10-runtime-canary"}
if [[ ! -d "$project/.git" ]]; then echo 'MISSING_ISOLATED_CLONE'; exit 2; fi
if ! command -v hermes >/dev/null 2>&1; then echo 'HERMES_NOT_FOUND'; exit 3; fi
readonly tmp=$(mktemp -d /tmp/p11-hermes-XXXXXX)
cleanup(){ rm -f "$tmp/.env"; rm -rf "$tmp"; }
trap cleanup EXIT
mkdir -p "$tmp/skills"
if [[ ! -f "$project/skills/evidence-first-anatomy/SKILL.md" ]]; then echo 'P11_SKILL_FILE_MISSING'; exit 4; fi
cp -R "$project/skills/evidence-first-anatomy" "$tmp/skills/"
[[ -f "$HOME/.hermes/config.yaml" ]] && cp "$HOME/.hermes/config.yaml" "$tmp/config.yaml"
[[ -f "$HOME/.hermes/.env" ]] && ln -s "$HOME/.hermes/.env" "$tmp/.env"
export HERMES_HOME="$tmp"
cd "$project" || exit 5
printf 'SOURCE_SHA=%s\n' "$(git rev-parse HEAD)"
printf 'START=%s\n' "$(date -Iseconds)"
if timeout -s TERM -k 5s 30s hermes skills list --source local | grep -q 'evidence-first-anatomy'; then
  echo 'SKILL_DISCOVERY=PASS'
else
  echo 'SKILL_DISCOVERY=FAIL_OR_TIMEOUT'
fi
# Do NOT include provider output unfiltered in logs. The model should only return READY.
start=$(date +%s)
timeout -s TERM -k 5s 70s hermes --in "$project" -z 'Reply only READY. Do not use tools.' > "$tmp/no_skill.stdout" 2> "$tmp/no_skill.stderr"
base=$?
printf 'NO_SKILL_EXIT=%s DURATION_SEC=%s\n' "$base" "$(( $(date +%s)-start ))"
if [[ "$base" != 0 ]] || ! grep -q 'READY' "$tmp/no_skill.stdout"; then
  echo 'PROVIDER_BASELINE=NOT_READY; SKILL_PROMPT=SKIPPED'
  exit 0
fi
echo 'PROVIDER_BASELINE=PASS'
start=$(date +%s)
timeout -s TERM -k 5s 100s hermes --in "$project" --skills evidence-first-anatomy -z 'Use the preloaded evidence-first-anatomy Skill to explain jiégāo. Cite a specific Zhuangzi and Wang Zhen locator. Explicitly use DOCUMENTED, INFERRED, ILLUSTRATIVE, UNKNOWN, say dimensions are unknown, and name two falsifiable tests. Answer concisely without tools or modifying files.' > "$tmp/skill.stdout" 2> "$tmp/skill.stderr"
code=$?
printf 'SKILL_PROMPT_EXIT=%s DURATION_SEC=%s\n' "$code" "$(( $(date +%s)-start ))"
if [[ "$code" != 0 ]]; then echo 'SKILL_PROMPT=FAILED_OR_TIMEOUT';exit 0;fi
# This is an approximate machine check, NOT an independent proof of skill activation.
if grep -q 'DOCUMENTED' "$tmp/skill.stdout" && grep -q 'UNKNOWN' "$tmp/skill.stdout" && grep -q 'INFERRED' "$tmp/skill.stdout" && grep -q 'ILLUSTRATIVE' "$tmp/skill.stdout"; then
  echo 'FORMAT_TERMS_PRESENT=YES; HUMAN_EVAL_REQUIRED=YES'
else
  echo 'FORMAT_TERMS_PRESENT=NO; HUMAN_EVAL_REQUIRED=YES'
fi
printf 'END=%s\n' "$(date -Iseconds)"
