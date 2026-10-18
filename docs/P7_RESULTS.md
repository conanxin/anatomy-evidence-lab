# P7 Results | Frozen finite-grid sensitivity analysis

> **Result status: COMPUTED, synthetic-only.** Design committed first: [P7 design lock](https://github.com/conanxin/anatomy-evidence-lab/blob/33f35b83a93ec9ae5e821e8c5e2aec522d369e35/docs/P7_DESIGN_LOCK.md). Exact design SHA-256: `c5cb93affc356a030b3b84d125dafda908b3b5635474408c8330120c4e9f7fb6`.

## Primary endpoint

Tradeoffs: **111/288 (38.54%)**. This is the proportion **within these 288 correlated synthetic scenarios only**. There is no sampling-based confidence interval, inference to production databases, speed, disk I/O, nor user learning effect. The original P6 42-key reversal was a hand-selected teaching counterexample and **is not counted as an independent unit here**.

## Exhaustive paired categories

| Category | Cases | Share |
|---|---:|---:|
| t2-dominates | 13 | 4.51% |
| t3-dominates | 152 | 52.78% |
| tradeoff | 111 | 38.54% |
| identical | 12 | 4.17% |

## By number of inserted keys

| Group | t=2 dominates | t=3 dominates | Tradeoff | Identical | Total |
|---|---:|---:|---:|---:|---:|
| 12 | 4 | 51 | 15 | 2 | 72 |
| 25 | 3 | 34 | 25 | 10 | 72 |
| 42 | 2 | 37 | 33 | 0 | 72 |
| 80 | 4 | 30 | 38 | 0 | 72 |

## By insertion order

| Group | t=2 dominates | t=3 dominates | Tradeoff | Identical | Total |
|---|---:|---:|---:|---:|---:|
| ascending | 0 | 52 | 44 | 0 | 96 |
| descending | 4 | 48 | 44 | 0 | 96 |
| shuffled | 9 | 52 | 23 | 12 | 96 |

## By search result

| Group | t=2 dominates | t=3 dominates | Tradeoff | Identical | Total |
|---|---:|---:|---:|---:|---:|
| hit | 11 | 77 | 50 | 6 | 144 |
| miss | 2 | 75 | 61 | 6 | 144 |


## Interpretation and possible sources of error

- **Pareto dominates** means no worse on both model-count metrics and strictly better on at least one. **Tradeoff** means fewer visits but more key comparisons, or the reverse; either candidate could score lower when fictional weights change. **Identical** means both raw metrics exactly match.
- Different seeds within each n share a deterministic mechanism; six probes from the same tree share nodes. Treat cells as correlated, not independent samples. Therefore percentages by category are descriptive of a **designed finite grid**, not statistical estimates of a broader population.
- A degree-3 B-tree can be shallower while producing more comparisons within a node. It is invalid to call these counts measured storage I/O or wall clock speed. NIST defines a B-tree as a balanced multiway search tree [NIST DADS](https://xlinux.nist.gov/dads/HTML/btree.html).
- 42-key P6 intentionally selected reversal is retained as a pedagogical example; P7 includes all 288 preregistered queries and does not discard inconvenient results.
- The browser heatmap uses 4×4 **hypothetical** positive integer weight pairs (1,2,5,10). No lab trial or participant responses were collected.

## Reproduction

`npm run analysis:p7` writes the machine-readable `artifacts/p7-sensitivity.json`, 288-row `artifacts/p7-sensitivity.csv`, and this markdown. The JSON includes the design lock commit, SHA-256 of input-generating sources, protocol and 16 keysets. No timestamps or fabricated human subjects appear in the deterministic record.

**Evaluation:** `STUDY_STATUS=NO_PARTICIPANT_DATA`. Both study arm previews are implementation kits, not a deployed randomized trial.
