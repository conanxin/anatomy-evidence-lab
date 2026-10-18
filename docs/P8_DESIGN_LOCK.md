# P8 design lock | rank-invariance, insertion-order robustness and lookup-mix sensitivity

**Status:** PRE-ANALYSIS DESIGN. Publish this document as a separate GitHub commit **before** producing P8 outcome data. This is a project-internal precommitted protocol, not a registered scientific study or real workload sampling.

## Motivation and fixed baseline

P7's 288 synthetic comparisons are left untouched. The hypothesis under examination is that an algorithm which only compares order relations must be invariant to any strictly increasing relabeling of keys, while changing insertion order or the distribution of queries may materially change the observed tradeoff rate. Data spacing does not necessarily equal workload diversity. Target only the given degree-2 and degree-3 in-memory pedagogical B-tree; its counts are not real latency, I/O, or device benchmarks.

## Locked deterministic P8 finite grid

- Sizes: `n=[25,42,80]`; seeds: `s=[7,19,37,101]`.
- Spacing maps: `baseline-even`, `clustered-gap`, `expanding-gap`.
- Insert orders: `ascending`, `descending`, `shuffled`, `bursty`.
- Six probes: `hit-min`, `hit-median`, `hit-max`, `miss-below`, `miss-between`, `miss-above`.
- Cartesian product: **3×4×3×4×6=864 paired query rows**, 432 hits and 432 misses. These are correlated deterministic synthetic design cells, not independent random observations.

### Key generation

For every `(n,s)`, obtain P7's deterministic ascending key set by calling `p7Dataset(n,s,'ascending')` (all even, unique). For each selected spacing, transform the i-th ascending value `k_i` as follows:

1. `baseline-even`: `v_i = k_i`.
2. `clustered-gap`: `v_i = k_i + 300*floor(3*i/n)` (3 rank bands and two large gaps).
3. `expanding-gap`: `v_i = k_i*k_i` (strictly increasing safe integer values).

These are **strictly increasing order-preserving transforms of the exact same rank dataset**, a deliberate negative control. They are not three independent populations. No floating-point precision loss or duplicate allowed.

### Insertion order

Use the transformed ascending list `v`:

- `ascending`: natural order;
- `descending`: reverse order;
- `shuffled`: take P7's `p7Dataset(n,s,'shuffled')` **permutation of the base keys**, and map each key by ascending rank to its transformed counterpart; preserves a single seeded relative insertion permutation across spacing maps;
- `bursty`: partition the ascending transformed keys into consecutive blocks of **five**; insert even-indexed blocks (0,2,4,...) in original order, then odd-indexed blocks (1,3,5,...) in original order; within each block insert keys ascending. No randomness in this order beyond initial key selection.

### Query probes

For transformed sorted keys: `hit-min` = first; `hit-median` = index `floor(n/2)`; `hit-max` = last; `miss-below` = min−1; `miss-between` = median+1; `miss-above` = max+1. All three misses must be verified absent (all transformed keys even). These preserve the same relative rank/slot and hit/miss status across spacing maps. Evaluate exactly the same probe against degree-2 and degree-3 trees with the **same transformed insertion sequence**.

## Outcomes and independent oracle

For each case calculate the true trace's number of `visit` and `compare` steps, using existing `searchTrace` and `validateTree`. Verify an **independent tree-walker oracle** that does not call `searchTrace`: traverse the node keys directly; count each node visited and every examined key, identify the final outcome, and independently check membership using `new Set(insertedKeys).has(query)`. Mismatch on tree status, node-visit count, key-comparison count, membership, or leaf-depth invariant is a hard failure.

Let `dv=visits(t3)-visits(t2)` and `dk=compares(t3)-compares(t2)`. Reuse exactly P7's four-category classifier (`t2-dominates`, `t3-dominates`, `tradeoff`, `identical`) and enforce category counts sum to 864. Report raw counts by spacing, insertion order, tree size, hit/miss. **Primary robustness audit** is the number of mismatches in (dv,dk,category) across the 3 spacing maps for identical (n,s,order,probe). Hypothesized invariance, not an inference about real data.

Report two distinct estimands: (a) fixed-grid raw tradeoff proportion 864 denominators, and (b) generator-aware 288 unique **rank/order/probe designs** (collapse the deliberate spacing replicates). Neither is an unbiased real-world rate.

### Explicit query-mix sensitivity (reweight only)

For the ordered probes above use weights:
- `balanced = [1,1,1,1,1,1]`;
- `hit-heavy = [3,3,3,1,1,1]`;
- `miss-heavy = [1,1,1,3,3,3]`;
- `edge-heavy = [3,1,3,3,1,3]`.

These weights change only denominators and numerators of descriptive summaries, never rebuild trees or change a stored query trace. Compute weighted tradeoff frequencies separately by insertion order and overall. Do not call these real user workloads or infer uncertainty intervals.

## Reproducible outputs

Produce `scripts/run_robustness.mjs`, `src/robustness.js`, `artifacts/p8-robustness.json`, `artifacts/p8-robustness.csv`, and `docs/P8_RESULTS.md`, deterministic without timestamps; use real SHA-256 digest of the canonical results. Update CI to execute P7 baseline and P8 robustness independently, verify 864 rows and output artifacts. Add unit tests for generator bounds, independent oracle, 4 classifier edges, spacing invariance, reproducible run, weighted denominators and P7 nonregression.

## Skill package and compatibility gate

Create `skills/evidence-first-anatomy/SKILL.md` with required lowercase `name` + `description` YAML frontmatter, `references/protocol.md`, `scripts/check-project.mjs`, and `evals/evals.json`. Use an agent-agnostic file layout; the checklist should explicitly route source → assumption → pure model → interactive rendering → independent model and browser tests → provenance → staged publication. Verify manifest syntax and examples in local Node tests. A compatible file layout **does not** establish successful runtime loading in Hermes or OpenClaw. For Hermes, use project-local `.agents/skills/` or project `.hermes/skills/` after trust; for OpenClaw check its configured skill directory and profile. No global installation or configuration mutation in this stage.

## Historical mechanism feasibility (design-only)

Use an example such as a traditional waterwheel **without** producing a historically specific restoration. Create a `source-first` feasibility rubric: dated, identified drawings or field measurements; geometry only from documented dimensions, any invented shape labeled ILLUSTRATIVE; source-specific interpretation versus hypothesis; no claims of original color/function absent evidence; at least one falsifying observation. Outcome is a checklist, NOT a sourced historical reconstruction.

## Gates and exclusions

No new human-participant study; frozen P7 study kit remains `NO_PARTICIPANT_DATA`. Do not change existing BOOK-ID-SEARCH or the site, do not modify or reset local Hermes worktree, do not merge PR #2 without separate permission. All percentages are descriptive for the finite **synthetic** grid. If any metric changes after locking this plan, record the deviation and reason in P8 Results and Git commit history.