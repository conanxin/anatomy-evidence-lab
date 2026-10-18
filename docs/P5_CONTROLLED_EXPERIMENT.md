# P5 — 可修改假设的对照模型 / Controlled B-tree Assumption Experiment

Status: **LOCAL_VERIFIED**, GitHub CI of P5 commit: **pending at document creation**. This is a pedagogical experiment, not a database benchmark.

## Research question

When exactly the same 25 safe integer keys are inserted in the **same original order**, how do the structure and individual search trace of a minimum-degree `t=2` tree differ from those of a `t=3` tree?

The controllable variable is the **minimum degree `t`**. It is not an experimental manipulation of disk latency, cache size, index implementation or concurrency. The B-tree uses the common min-degree convention `maxKeys=2t-1`, `maxChildren=2t`, distinct from NIST DADS' maximum-children order `m` terminology. The two models use identical key sequence, query, insertion routine and validation code.

Sources:
- [NIST DADS — B-tree](https://xlinux.nist.gov/dads/HTML/btree.html), definition of balanced multiway search tree; source describes `order m`, not this exact code.
- [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/), `prov:Entity`, `prov:Activity`, `prov:Agent` and relationships. We use a *subset of the vocabulary*, not an RDF reasoning/ontology conformance claim.

## Fixed sample case: lookup 24

| Metric | t=2 | t=3 |
| --- | ---: | ---: |
| Input keys | 25 | 25 |
| Total B-tree nodes | 14 | 9 |
| Root-to-leaf tree levels | 3 | 3 |
| Search node visits | 2 | 3 |
| Comparisons with keys | 4 | 6 |
| Search result | Found | Found |

**Counterexample to simplistic visual intuition:** A tree with fewer total nodes can require *more* node visits for a particular key and insertion sequence. This does not imply that `t=2` is generally faster than `t=3`, or that any of these steps equal storage I/O, throughput, wall-clock latency or real DB cost.

You can interactively change `t` and query integers, insert new unique integers into the *shared* insertion sequence, and use the comparison evidence panel to inspect source/assumption/model/visual/test mappings. Selecting `t=3` rebuilds geometry rather than merely relabeling `t=2` data. All model versions derive from the identical current list of keys and last confirmed query.

### Deterministic comparison contract

- `src/comparison.js::createComparison(keys,query)` reconstructs both trees using `fromKeys`, validates them and counts real `visit`, `compare`, `descend` steps emitted by `searchTrace`.
- The same function returns `stats`, `visitedNodeIds`, `scenarioId` and differences; tests assert no discrepancy between the trace, reported counters and result.
- `scenarioId` is a non-cryptographic 32-bit hash of the input/order/query/degree and intended only as an ephemeral UI label. Hash collisions are possible. Never treat it as forensic evidence.
- `scripts/export_provenance.mjs` generates real SHA-256 of **canonical input JSON**, records execution time, actor, code revision (or `UNPINNED`) and two generated model entities in a PROV-O-influenced JSON-LD document. It records the export's actual timestamp, not fictitious dates for earlier research activities.
- JSON-LD export is not a proof of the correctness or trustworthiness of the algorithm, and it has not been checked by a full RDF/OWL validator.

## Local reproduction

```bash
npm test
npm run build
npm run test:browser  # Python Playwright + Chromium required
npm run export:provenance
```

The portable generated HTML is `dist/index.html`; JSON-LD output is `artifacts/comparison-run.jsonld`. Compare `t=2` and `t=3` using the cards or the degree selector. Search 24, search 25 (miss), insert 25, then search 25 again to observe both models agree. Reset restores the original input sequence and `t=2`.

## Gates and limits

- `SEMANTIC`: tree invariants, identical datasets and hit/miss agreement across degrees.
- `VIEW`: model selection changes both structural geometry and reflected comparison counts.
- `EVIDENCE`: event/parameter links contain separately typed evidence and explicit model-specific assumptions.
- `PROVENANCE`: SHA-256 is actually computed for input; code revision is marked `UNPINNED` when Git metadata is unavailable.
- `BROWSER`: 1366 and 390 pixel viewport assertions; Playwright `page.set_content` uses a generated self-contained HTML because the current sandbox disallows file/local navigation. Not a hosting or screen-reader study.
- `LEARNING`: Does a reader understand why fewer total nodes does not guarantee fewer visits for one search? **NOT TESTED** with actual participants.

## Next experiment

**P6 — contestable source-to-claim interpretation:** let a reader edit an explicit *cost assumption* (e.g. relative cost of visiting a node versus comparing a key) and recalculate a transparent model score while preserving original step counts. Run a small learning evaluation against a non-interactive textual explanation, then consider a standalone hosted demo only after a separate public-URL check.
