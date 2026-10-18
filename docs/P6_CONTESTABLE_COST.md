# P6｜可质疑的成本模型 / Contestable Hypothetical Cost Model

**Task** `ANATOMY_EVIDENCE_LAB_P6` · **Date** 2026-10-18 · **Status** locally implemented and unit/browser tested; GitHub CI and Notion status maintained separately.

## Research question

Can the preference between two **real programmatically generated B-tree search paths** change when the researcher changes only the **declared evaluation assumptions**, without altering underlying observations?

This is an experiment about *model contestability*, not proof that changing the B-tree degree changes actual runtime by a specific amount.

### Three epistemic layers

1. **Observed in the teaching implementation**: sorted insertion sequence, `t`, actual tree structure, visited-node events, compared-key events, hit/miss.
2. **Assumed by the researcher**: fictional nonnegative weights `w_node` and `w_comparison` (each is a teaching score coefficient, not hardware data).
3. **Derived, contestable evaluation**: `score = w_node * visits + w_comparison * keyComparisons`. Lower is preferred *only within this stated toy score*.

The score has **no physical units**. In particular, `visited node ≠ physical disk I/O`, and no observed latency, device model, concurrency, buffering, or production database is measured. This is not an explanation of BOOK-ID-SEARCH internals.

## Findings (exact deterministic cases)

### P5 unchanged baseline: 25 fixed synthetic keys, query 24

| Degree | Nodes visited | Keys compared | Found | Score (w=5,1) |
|:--|--:|--:|:--|--:|
| t=2 | 2 | 4 | yes | 14 |
| t=3 | 3 | 6 | yes | 21 |

Both counted metrics favor `t=2`. No positive weights can make `t=3` have lower score **for this query and this exact input**. This is a *dominance* case; score reversal would be fabricated here.

### P6 deliberately selected counterexample: 42 fixed synthetic keys, query 7

The full insertion order is committed as `TRADEOFF_KEYS` in [`src/cost-model.js`](../src/cost-model.js). It was deliberately discovered using a seeded search to find opposite metric deltas. **It is not a random population sample or external benchmark.** The query `7` is absent from both trees.

| Degree | Levels | Visits | Comparisons | Found |
|:--|--:|--:|--:|:--|
| t=2 | 4 | 4 | 5 | no |
| t=3 | 3 | 3 | 6 | no |

For this input:

- `score(t=2) = 4 × w_node + 5 × w_comparison`
- `score(t=3) = 3 × w_node + 6 × w_comparison`
- `Δ = score(t=3) − score(t=2) = w_comparison − w_node`

| Assumption | t=2 score | t=3 score | Lower hypothetical score |
|:--|--:|--:|:--|
| Visits expensive (`w_node=5`, `w_comp=1`) | 25 | 21 | t=3 |
| Comparisons expensive (`w_node=1`, `w_comp=5`) | 29 | 33 | t=2 |
| Equal positive weights (`1`,`1`) | 9 | 9 | Tie |

**What this demonstrates**: conclusions of a publicly specified evaluation can reverse when an assumption changes, while the trace, dataset and observed counts remain invariant. It does **not** establish a causal effect on actual speed.

## Implementation + validity gates

- [`src/btree.js`](../src/btree.js): the sole source of truth for insertion, lookup and trace events; unchanged since P5.
- [`src/comparison.js`](../src/comparison.js): two actual B-tree cases built from exactly the same sequence and lookup; unchanged since P5.
- [`src/cost-model.js`](../src/cost-model.js): pure cost evaluation, validation, counterexample dataset and weight presets. Never modifies `comparison` input.
- [`src/evidence.js`](../src/evidence.js): dedicated `cost` claim/assumption/model/visual/test references. NIST supports B-tree *concepts*, **not our invented score**.
- [`tests/cost-model.test.mjs`](../tests/cost-model.test.mjs): dominance, reversal, tie, formulas, invalid values, trace immutability.
- [`scripts/export_cost_run.mjs`](../scripts/export_cost_run.mjs): timestamped PROV-inspired JSON-LD; links input SHA-256, traced metrics SHA-256, assumption SHA-256, derived output SHA-256 and executing actor to one explicit activity. Changes in weight leave the first two hashes identical.
- [`scripts/browser_smoke.py`](../scripts/browser_smoke.py): 1366px/390px checks of input selection, sliders, reversal/tie, references, language, reset, unrelated P5 behavior.

**Provenance scope**: we checked RDF parseability of the JSON-LD export, not full PROV-O/OWL semantic conformance. [W3C PROV-O](https://www.w3.org/TR/prov-o/) inspires typed Entity–Activity–Agent relationships; the `lab:` properties and activity schema are project-specific.

## Methodological risks and next questions

- **Selection bias**: the 42-key case was selected specifically because metrics conflict. The UI shows it as a counterexample, never a representative benchmark. Any frequency claim would require a preregistered data sampling protocol.
- **Metric mismatch**: even measured key comparisons and visited logical nodes do not quantify cache behavior, page size, I/O scheduling, CPU branch prediction, or actual response times.
- **Cognitive framing**: the visible preference can be an artefact of chosen weights. Give users equal access to sources, assumptions, and alternative scenarios to avoid misrepresenting outputs as facts.
- **Only local mechanism**: external validity to real databases and real learning outcomes remains untested. Next consider sensitivity maps across many datasets and measured hardware experiments, with separate evidence chains.

**Sources**: [NIST DADS: B-tree](https://xlinux.nist.gov/dads/HTML/btree.html); [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/); [Bret Victor, Explorable Explanations](https://worrydream.com/ExplorableExplanations/). These external sources **do not** independently verify our specific 42-key example; source code and deterministic tests do.
