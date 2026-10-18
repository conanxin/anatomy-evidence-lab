# Provenance / 证据来源与模型边界

## Research origin

- Author project: [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy), upstream `HEAD` observed by prior local Git session on 2026-10-12: `689dcf966e63d92be10a5d593c6e19e10acd4422`.
- Prior [Notion research](https://app.notion.com/p/3f734a28189a81699161dd858772aed5): P1/P2 analysis, criteria for evidence-first visual explanation.
- Algorithm source: [NIST DADS B-tree](https://xlinux.nist.gov/dads/HTML/btree.html). The implemented minimum-degree split algorithm follows standard textbook conventions; the precise meaning of “order” varies between conventions.
- Intellectual context: [Bret Victor — Explorable Explanations](https://worrydream.com/ExplorableExplanations/). Separating mutable model assumptions from cited facts is our research extension, not a claim that the original Anatomy package implements it.

## Three-layer truth boundaries

1. **Algorithm**: `t=2`, 1–3 keys per nonempty node; `keys+1` children at internal nodes; all leaves at identical depth; insert/search and structured trace. Unit tests check these invariants, but the model omits deletion, B+ leaves, disk IO, concurrency and cache eviction.
2. **Representation**: drawers, cards, rails, animation/state readout. These are a metaphor, *not* reconstructed machinery. `src/scene.js` derives both projected highlight state and readout semantics from the same trace, while the browser applies that state.
3. **Evidence**: the source of B-tree definitions is cited. Synthetic data and rendering parameters are clearly labeled. No assertion that BOOK-ID-SEARCH or any other project uses this specific internal structure.

## Relationship to upstream

This repository contains an independently authored pedagogical implementation and minimal SVG cabinet renderer. **The 2026-10-12 local Hermes agent wrote a separate initial prototype that passed 17 Node tests but was not pushed before remote access failed.** This branch is an independently recreated, publishable fallback authored on 2026-10-15; no claim is made that these files were copied from the disconnected computer or that Hermes authored this exact version.

## Evidence status

| Claim | Evidence | Status |
| --- | --- | --- |
| B-tree balancing and search contract | NIST + checked JS invariants | Source-based + locally tested |
| Browser illustration expresses trace | Pure view projection tests and browser smoke (when executed) | See `RUN_RECEIPT.md` |
| Visual design follows original Anatomy principles | Official Anatomy project; independent design | ANALYSIS / adaptation |
| Specific database internals match the machine | No code audit of BOOK-ID-SEARCH | NOT CLAIMED |
| Upstream author's geometry audit results | Author's own report | AUTHOR_REPORTED only |

## P4: typed claim → source → assumption → model → visual → test chains

Read [EVIDENCE_GRAPH.md](EVIDENCE_GRAPH.md) and [`src/evidence.js`](../src/evidence.js). The chain is deliberately a **research annotation**, not a statement that visual components have been independently verified by NIST. It makes model assumptions and omitted areas visible, rather than hiding them in a footnote. The conceptual extension is informed by [W3C PROV-O](https://www.w3.org/TR/prov-o/), but no PROV-O/RDF compliance is claimed.

## Upstream review — 2026-10-18

Original Anatomy upstream has released [Anatomy 1.1](https://github.com/wheresryan22/anatomy/releases/tag/v1.1.0). This introduces optional community-gallery publication, geometry audit changes, reduced-motion handling updates, and expanded available agents. It does **not** make this project an upstream official illustration and has no bearing on our custom B-tree correctness guarantee. The P0 upstream pin remains a historical reference; no silent upstream upgrade has been performed.


## P5 | Variable degree, input identity and Activity provenance (2026-10-18)

Source: [NIST B-tree](https://xlinux.nist.gov/dads/HTML/btree.html) defines the balanced multiway tree but uses maximum-child order `m`; this teaching code defines *minimum degree* `t` and enforces the associated bounds. The model deliberately varies `t=2,3` with identical 25 input integers and insertion order. **No real database performance evidence is claimed.**

A deterministic `BT-<degree>-<8 hex>` label is only a UI scenario marker and is **not** collision-resistant. Actual input integrity is represented by SHA-256 in a separate exported JSON-LD `prov:Entity` with its input ordering, linked to the actual export `prov:Activity` and the code-runner `prov:Agent`; generated cases link back via `prov:wasGeneratedBy` and `prov:wasDerivedFrom`. [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/) is a vocabulary reference; OWL inference, SHACL validation and comprehensive W3C provenance conformance are outside P5. In exports without available Git revision metadata, `lab:codeRevision` must explicitly equal `UNPINNED`.

No URL in the evidence graph is taken as proof of the specific SVG geometry: NIST is a source for the general concept, tests verify the local code, and the mechanical cabinet is an illustrative assumption.
