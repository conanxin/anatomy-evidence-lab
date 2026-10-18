# P7 design lock | deterministic B-tree sensitivity and learning pilot

**Stage:** P7, design registered in GitHub **before generating P7 results**. Commit timestamp is the public audit trail. This is an internal prespecified analysis plan, not registry-based formal preregistration. Design changes after this commit must be documented as deviations, not quietly overwritten.

## Purpose and limits

Ask how often, on a **finite synthetic fixed design**, minimum degree t=2 or t=3 dominates the other, ties on both metrics, or presents a genuine node-visit versus key-comparison tradeoff. Do not infer rates among real database workloads, runtimes, memory accesses or users. NIST background: https://xlinux.nist.gov/dads/HTML/btree.html

## Locked finite design (all cross-products; 288 queries)

- Tree sizes `n=[12,25,42,80]`.
- Seeds `s=[7,19,37,101]`.
- Insertion orders `ascending`, `descending`, `shuffled`.
- Six probes per distinct (n,seed,order): `hit-min`, `hit-median`, `hit-max`, `miss-below`, `miss-between`, `miss-above`.
- Generate a source pool of `8*n` unique even integers `[2,4,...,16*n]`. Shuffle it once using Fisher-Yates and xorshift32 with initial uint32 seed `s ^ Math.imul(n,0x9e3779b1)`; take first n and then sort. Each seed/size defines the **same key set for all insertion orders and both t values**.
- xorshift32 recurrence: `x ^= x << 13; x ^= x >>> 17; x ^= x << 5`, each operation on uint32; `random=(x>>>0)/2**32`. Fisher-Yates: for `i=len-1...1`, swap `i` with `floor(random*(i+1))`.
- Ascending and descending insertion orders use sorted unique selected keys. `shuffled` applies a fresh independent seeded Fisher-Yates to sorted selected keys with initial seed `s ^ Math.imul(n,0x85ebca6b) ^ 0x51ed`.
- Probe keys derive from sorted selected keys: min, index floor(n/2), max; min−1, selected median+1, max+1. Since the source pool contains even integers, all three misses are absent. Fixed enumeration: **sizes × seeds × orders × probes** (4×4×3×6=288); 144 hits and 144 misses. These are correlated design cells, **not independent participant-like samples**.
- Insert these keys in exactly the selected order into the existing project `fromKeys(keys,t)` with t=2 and t=3; verify `validateTree` and `searchTrace` and count `visit` / `compare` steps. A result mismatch across t values is a hard test failure.

## Analysis decisions (locked before results)

Per query, let `dv=visits(t3)-visits(t2)`, `dk=compares(t3)-compares(t2)`.

1. `identical`: dv=0 and dk=0.
2. `tradeoff`: dv and dk have opposite strict signs (dv×dk<0).
3. `t2-dominates`: dv>=0, dk>=0 and at least one >0 (Pareto dominance; **does not require both strict**).
4. `t3-dominates`: dv<=0, dk<=0 and at least one <0.
All categories are mutually exclusive and exhaustive; report four integer counts summing to 288. Primary endpoint is the observed synthetic-grid **tradeoff proportion** (`count(tradeoff)/288`). Report counts by n (72 each), insertion order (96 each), and hit/miss (144 each), without confidence intervals/p-values/generalization.

Hypothetical weighted score only: `score=w_node*visits+w_key*comparisons`, `w_node,w_key ∈ [1,2,5,10]`, full 4×4 heatmap for an inspectable selected case. Cell indicates lower score t2, t3, or exact tie; score is a **fictional teaching unit, not milliseconds, disk I/O or measured performance**. Never change traces when weights vary.

## Provenance/output

Ship versioned `scripts/run_sensitivity.mjs` producing `artifacts/p7-sensitivity.json`, `artifacts/p7-sensitivity.csv` and human-readable `docs/P7_RESULTS.md` (generated from results, no manual transcriptions). Include 288 result rows, scope, exact protocol hash and source SHA/ref, counts by subgroup, and a selected tradeoff example. Deterministic output excludes timestamps; provenance run timestamp can be separate and must be genuine. Stable hashes identify payloads; do not mislabel quick UI fingerprints as SHA-256. Include tests against known cases, repeat determinism, all-case reconciliation, classification boundary, and conditional sensitivity.

## Learning pilot prespecification (separate, not performed here)

**Status: NO REAL PARTICIPANTS; NO LEARNING-EFFECT ESTIMATE.**

- Build two independently accessible condition pages: STATIC receives only evidence-equivalent written explanation, INTERACTIVE receives the machine. Both see **identical five frozen P6 quiz questions** and allowed responses, same 5-minute exposure instructions and no answer feedback before submission.
- Treat current existing P6 one-page combined interface only as a self-practice kit; do not present it as a blinded A/B trial.
- Proposed future pilot: 24 consenting adults (12/condition) as a **feasibility target**, not power justification. Randomize real enrolled participants with prespecified balanced block size 4 and a documented reproducible allocation seed before seeing outcomes; no real allocation / recruitment in this P7 coding task.
- Primary descriptive outcome: complete quiz total correct (0–5) with denominator of complete respondents per group. Secondary: item counts, consent→completion feasibility, and questionnaire completeness. Keep number assigned and incomplete visible; do not silently discard and claim a learning improvement. No efficacy hypothesis tests or superiority claim from a small convenience pilot.
- Only pseudonymous, voluntarily supplied responses; never auto-collect device or user details, and do not publish raw answers. `NO_PARTICIPANT_DATA` when no genuine input. Test examples are fixtures, never participant data. Any later change to exposures or items requires documented protocol versioning.

## P7 release criteria

Unit tests and build PASS; browser checks desktop+390px PASS; CI PASS on exact commit; GitHub PR remains unmerged; Notion archive updated with measured counts and study status. Maintain the separate local Hermes working tree untouched.
