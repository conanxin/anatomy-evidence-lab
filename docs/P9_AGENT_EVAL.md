# P9 agent runtime / portability canary

This log is a separate acceptance dimension from `npm test` and from GitHub CI. A valid `SKILL.md` file and a copied local path **do not prove loading by an agent**.

## Staged procedure

1. [ ] Isolated WSL clone `~/projects/anatomy-p9-agent-canary` at a committed source SHA; copy the skill into **only this clone's** `.agents/skills/evidence-first-anatomy`.
2. [ ] Record `hermes skills list --source local` output and trust status. Do not mutate global trust or install user skills. Native runtime may refuse untrusted project skills; mark gate BLOCKED.
3. [ ] With a bounded timeout, run a single explicit Hermes prompt about the jiégāo source, list unknown dimensions and produce 2 expected programmatic tests. Confirm a response was returned and check the actual output, not just the process exit.
4. [ ] Check `openclaw skills` CLI with a supported Node version and workspace directory; if the skill cannot be discovered without global configuration, mark BLOCKED, not PASS.
5. [ ] Distinguish package discovery, explicit skill activation, executed response, and procedure compliance. Preserve sanitized command stdout, stderr, exit and execution time.

## Fixed minimal prompt

`Use the evidence-first-anatomy research procedure to explain 桔槔 from 《庄子·天地》 and 《王祯农书》卷十八. Return SRC_IDS and locators, identify DOCUMENTED/INFERRED/ILLUSTRATIVE/UNKNOWN claims, state what cannot be reconstructed, and name two falsifiable model tests. Do not claim any exact historical measurements.`

## Acceptance gates

| Gate | Acceptance |
|---|---|
| SKILL_FORMAT | `check-project.mjs --strict` passes |
| HERMES_LOCAL_DISCOVERY | CLI actually lists this project skill under isolated clone, if trusted |
| HERMES_AGENT_INVOKED | A real bounded prompt returns an answer |
| HERMES_PROCEDURE_COMPLIANCE | Returned answer includes genuine source locators, UNKNOWN and tests |
| OPENCLAW_DISCOVERY | CLI reports this skill available in the isolated context |
| OPENCLAW_AGENT_INVOKED | Real bounded prompt actually returns |
| HISTORICAL_MODEL | Unit+browser tests pass for schematic-only model |

**No agent benchmark scores or 'supported' claims are to be fabricated from a timed-out process.**
