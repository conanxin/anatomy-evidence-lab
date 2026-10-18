# P4 Evidence Graph / 可解释机制的证据关系

## Scope / What is proven?

**This is a typed, inspectable *explanation graph*—not a proof of real-world database internals.** The B-tree source supports a balanced multiway search-tree idea; the UI represents that idea through a synthetic filing-cabinet metaphor. It does **not** make source texts, model assumptions, drawings and algorithm tests interchangeable.

Starting point: [NIST B-tree definition](https://xlinux.nist.gov/dads/HTML/btree.html). The implementation chooses minimum degree `t=2`. NIST's `order m` and the minimum-degree convention are not identical terminology, so `t=2` is tagged as a modeling assumption, not attributed verbatim to NIST.

## Graph contract

All entity IDs are stable. `src/evidence.js` is the single authoring location. Every trace event maps to an array of typed records:

| Class | Example ID | Meaning | Verification boundary |
| --- | --- | --- | --- |
| `claim` | `C-COMPARE` | A claim the interaction attempts to explain | Needs modeling evidence and scope |
| `source` | `S-NIST` | A link to the primary definition | Does not verify animation or database code |
| `assumption` | `A-DEGREE`, `A-SCOPE` | Explicit choice or omission | Not disguised as a sourced fact |
| `model` | `M-TRACE` | Executable search logic | Consistency can be unit tested |
| `visual` | `V-CARD`, `V-RAIL` | Mechanism-to-image mapping | Metaphor, not historical machinery |
| `test` | `T-BTREE`, `T-PROOF` | Reproducible acceptance code | Only covers named invariants |

Relationships are **not** all `is proven by`. They are typed associations: `claim is contextualized by source`, `claim is operationalized through model`, `model is illustrated by visual`, `procedure is checked by test`, and `claim is limited by assumption`. The six-type chain intentionally avoids labeling an analogy as empirical evidence. This vocabulary is a small project-specific scheme, **not** a formal RDF/PROV-O export.

### W3C PROV-O alignment (research only)

[W3C PROV-O](https://www.w3.org/TR/prov-o/) provides `prov:Entity`, `prov:Activity`, `prov:Agent`, and relationships such as `prov:wasDerivedFrom` and `prov:used` for interoperable provenance. A future export could represent source documents, model versions and rendered diagrams as `Entity`, test runs/build executions as `Activity`, and responsible authors or agents as `Agent`. **The current linked-card UI is not a W3C PROV conformant implementation**, and source support must not be mislabeled as a derivation without a genuine transformation. 

## UI behavior

1. Run a search, then advance to a `visit`, `compare`, `descend`, `found`, or `miss` step.
2. The **03 / EVIDENCE GRAPH** section names the corresponding `C-*` claim, primary reference, constraints, code, visual mapping and tests.
3. Click or keyboard-activate a **drawer**, **numbered card** or **rail** to inspect that component's general explanation. The selected part is labeled independently from the current trace.
4. Select **Return to current step** to resume the trace-based evidence chain.
5. Language switching updates presentation strings only. IDs and relationships do not change.
6. Source and tests link to inspectable pages; build output is one self-contained HTML file.

## Semantics, no-claims, and open gaps

- `SOURCE_SUPPORTED`: evidence supports a **general** definition, not necessarily every literal of a chosen implementation.
- `MODEL_TESTED`: source+code+unit tests check specific program behavior. Passing these tests does not establish real-time database performance or external truth.
- `SYNTHETIC` and `OUT_OF_SCOPE`: visuals and omitted aspects are intentionally invented or excluded.
- `AUTOMATED_TEST`: local and CI results must be recorded separately with commit SHA. A test file's existence is not a test-pass receipt.

**Not yet implemented**: bibliography page-number locators, export to RDF/PROV-O, versioned claim changes, independently adjudicated competing hypotheses, direct evidence-card editing, studies of whether the interaction improves learning. In particular, we have not verified any BOOK-ID-SEARCH data structure. Future research on historic structures must attach per-part primary measurements or clearly mark inference.

## Verification

- `npm test`: validates every `STEP_EVIDENCE` mapping; unknown/missing/duplicate IDs, unsafe URLs and missing evidence kinds are rejected.
- `npm run build`: embeds graph records and code in offline HTML.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: checks 1366px + 390px, click on a numbered card, keyboard activation of a rail, source links, bilingual claim, search success/miss, reset and reduced-motion behavior.
- GitHub Actions runs **test** and **browser** jobs. CI pass requires actual GitHub results, not just the YAML existing.
