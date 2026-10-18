# Evidence-first model and visual audit protocol v0.1

## Minimum trace record

```json
{
  "claim_id":"CLAIM-001",
  "text":"A B-tree's leaves have the same depth",
  "source":{"uri":"https://xlinux.nist.gov/dads/HTML/btree.html","locator":"definition","status":"DOCUMENTED"},
  "assumption":{"id":"ASSUMPTION-001","text":"minimum degree t=2; synthetic integers"},
  "model":{"module":"src/btree.js","invariant":"validateTree().leafDepth"},
  "visual":{"element":"SVG drawer levels","evidence_status":"ILLUSTRATIVE"},
  "test":{"path":"tests/btree.test.mjs","execution":"PENDING until run"}
}
```

Source support for a general B-tree property is not a source supporting the appearance of a wood or brass filing cabinet. Link strengths are **claim-specific**. If a scanned manuscript only supplies a single projection, do not infer hidden dimensions or motion without separate evidence.

## Gate states

| Gate | PASS means | NOT_TESTED means |
|---|---|---|
| SOURCE | Exact primary or competent secondary source has been consulted and claim/locator recorded | Unchecked URL/title |
| SEMANTIC | Pure invariants and an independent reference oracle passed | Only a convincing rendered image |
| VISUAL | Actual DOM/browser interactions and mobile layout observed | Unit tests without a browser |
| PROVENANCE | Generated records include model input, source, assumptions, version and validation receipt | A URL in a footer alone |
| EDUCATION | Human understanding evaluated under a stated protocol | A visually pleasant interaction |

## Checklist for algorithms

- Fix deterministic input and exact version of algorithm, define t/order conventions where applicable.
- Test boundary cases and counterexamples, and reject invalid models rather than silently render.
- Compare generated trace to independent traversal/oracle, then derive the readout/highlight from one trace.
- Preserve input/output and explicit *fictional* weights separately. For repeated synthetic cases, report the exact finite design and correlation; no causal or empirical prevalence claims.

## Checklist for historic/fieldwork research

- Object identity, museum/site inventory/catalog number and photograph/drawing locator are recorded.
- Date/material/dimensions carry source IDs or are explicitly estimated with uncertainty.
- Motion/transmission is marked attested or hypothetical; no automated "original color" or exact restoration without evidence.
- Every model part shows its confidence state, and the exhibit links to at least one possible disconfirming observation or unresolved alternative.
- If evidence is insufficient, deliver a schematic of *general principle*, not a reconstruction of an identified artifact.

## Agent interoperability boundary

The file/package structure follows Agent Skills conventions. Hermes documentation supports discovery from a git project's `.agents/skills/` or `.hermes/skills/` **after trust**. OpenClaw supports user/workspace skill locations but should be verified under the particular installation. Our source directory `skills/evidence-first-anatomy/` is a distributable project artifact, **not** an activated skill in any particular agent. Runtime loading is a separate acceptance test.
