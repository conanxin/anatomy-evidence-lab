# P9 run receipt | 2026-10-18

## Source and executable deliverables

- Base: published P8 open PR #2 commit `050a0cffffb108112b45fd49eb7fc15d1363eab2`.
- Pre-analysis P9 historical / runtime design lock: public GitHub commit `4124e58e1f6b4b9308ed50656b658739dafd554c`.
- HTML deliverable: `dist/jiegao.html` (self-contained, 16,538 bytes in local build).
- Evidence: `docs/P9_HISTORICAL_JIEGAO.md`, plus `JG_SOURCES`, `JG_CLAIMS` and `JG_PARTS` in pure model.
- Historical gate: GENERAL_PRINCIPLE_SCHEMATIC_ONLY; measured reconstruction NOT_VERIFIED.

## Executed in an independent, isolated analysis environment

| Command / check | Result | Scope |
|---|---|---|
| `npm test` | **PASS: 146/146**, 0 fail, 0 skipped | P1–P8 baseline + P9 ideal statics and evidence invariants |
| `npm run build` | **PASS** | Original 3 HTML pages + new standalone `dist/jiegao.html` |
| `npm run check:skill` | **PASS**, 0 structural errors | Package structure, **not** actual runtime activation |
| `CHROMIUM_PATH=/usr/bin/chromium python3 scripts/browser_smoke.py` | **PASS: 55** | P3–P6 regression in Chromium |
| `CHROMIUM_PATH=/usr/bin/chromium python3 scripts/browser_sensitivity.py` | **PASS: 56** | P7 regression |
| `CHROMIUM_PATH=/usr/bin/chromium python3 scripts/browser_robustness.py` | **PASS: 48** | P8 regression |
| `CHROMIUM_PATH=/usr/bin/chromium python3 scripts/browser_jiegao.py` | **PASS: 29** | P9 desktop 1366px / mobile 390px including click/keyboard/source |
| Total browser assertions | **188 PASSED** in the final complete sweep | 55+56+48+29; checks, not distinct human tests |

**Observed transient failure**: An earlier invocation of P3–P6 `browser_smoke.py` failed at the `FOUND` status assertion in one run. Rerunning that same script against unchanged compiled output passed all 55 checks; the failure mechanism was not isolated. Mark the regression suite as locally green on final sweep but record this potential timing flake for CI monitoring.

## Cross-agent runtime gates (separate)

- Local Windows + WSL host `DESKTOP-3A8N7VN` was reachable; original Hermes working tree remains untouched.
- Isolated project clone `~/projects/anatomy-p9-agent-canary` was created at design commit `4124e58` and the Skill copied to **only that clone's** `.agents/skills` (reported exit `0`).
- Local Hermes Skill listing and OpenClaw discovery: **PENDING OUTPUT**, initially affected by unreliable remote tool response. **No actual Hermes/OpenClaw prompt compliance pass is claimed here.**
- No changes to global Hermes/OpenClaw configuration, project trust, original worktree or deployed website.

## What these tests cannot establish

This is a modern conceptual lever model from transmitted Chinese texts, not an archaeological reconstruction. There are no sourced measurements for exact historical arm lengths, masses, materials, shape or daily throughput. Literary accounts are not mechanical field measurements. `tau = mgL·cos(theta)` is a static approximation with invented inputs; pressing Release is an explanatory state change, not a dynamics integrator.

## Remote CI

CI state is **PENDING until the GitHub Actions run for the actual P9 commit is queried and checked**. Do not cite a prior P8 success as proof of P9 CI. PR #2 remains open; this task does not merge it.
