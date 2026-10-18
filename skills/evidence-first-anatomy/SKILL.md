---
name: evidence-first-anatomy
description: Build evidence-traceable interactive explanations from documented mechanisms or algorithms. Use when converting an abstract concept, historical mechanical source, or research model into a testable SVG/HTML explorable figure while preserving source, assumption, model and test provenance.
license: MIT
---

# Evidence-first Anatomy

Turn a complex concept into an **inspectable interactive mechanism** while keeping source facts, modeling assumptions, geometry, motion and verification separate. This is a reusable research procedure, NOT a claim that an attractive picture proves real-world mechanics or history.

## Trigger and deliverables

Use when asked to **explain** an algorithm or historical mechanical principle interactively, create an evidence-backed digital fieldwork exhibit, or audit whether a diagram's motions match its underlying model. Provide a standalone HTML/SVG or equivalent code, tests, a provenance record and a status gate. For prose-only answers and unspecified visual artifacts, use normal research workflow instead.

## Workflow

1. **Source before structure.** Read a primary definition, measurement, artifact record or original drawing. Record URL/catalog locator, date, the precise claim it can and cannot support. Mark missing evidence `UNKNOWN`.
2. **Freeze known versus invented.** Give each statement and visual part an evidence state: `DOCUMENTED`, `INFERRED`, `ILLUSTRATIVE`, or `UNKNOWN`. Do not silently turn an illustrative shape into historically established geometry.
3. **Create the independent semantic model.** Write a deterministic pure state model first; specify inputs, invariants, transitions, edge cases and explicit simplifying assumptions. With an algorithm, identify one independent oracle or reference behavior; with machinery, identify dimensional / kinematic constraints from sources.
4. **Map explanation to object.** Select the smallest useful physical analogy. List parts and map each action/readout to semantic fields. The **object** should explain, not merely decorate a flowchart.
5. **Build a lightweight executable figure.** Prefer SVG and a static HTML for simple scenes; only use WebGL/3D when a specific causal mechanism requires it. Keep keyboard controls, reduced-motion preference, 390px rendering and a static explanation of the result.
6. **Attach evidence.** Connect claim → source → assumption → model field → visual component → test. Show viewers which elements are synthetic. Keep exact source links accessible rather than fabricated citations.
7. **Prove what can be proved.** Execute model invariants, independent oracle checks and DOM/browser smoke tests. Compare measured test output against the displayed readouts. Tests are not evidence that the user actually learned the concept.
8. **Publish responsibly.** Deliver source, run commands, test receipts, known limits, and a clear gate: `VERIFIED_MODEL`, `VISUAL_TESTED`, `SOURCE_CHECKED`, `HISTORICAL_UNCERTAINTY`, `LEARNING_NOT_EVALUATED`. Only claim PASS for gates actually run. Do not modify unrelated sites or merge PRs unless asked.

## Constraints

- A decorative image is not a semantic simulation. Never make display text and animation depend on separate scripted truths.
- Keep empirical measurements separate from explicitly hypothetical cost scores or synthetic query frequencies.
- State when a programmatic source/geometry test cannot verify the real historical object.
- Do not use inaccessible links as if they prove a claim. Record source locator or use `SOURCE_MISSING`.
- Never invent participants, usage data, CI statuses or screenshots. Keep precommitted designs intact; describe later deviations.
- If a user provides a computer or repository, avoid overwriting an uncommitted worktree; use an independent branch/worktree.
- Do not install this skill in a global agent profile or change an agent's configuration without user approval.

## References and evaluation

- [Evidence and model protocol](references/protocol.md): typed link schema, validation gates, historical-object threshold and browser checks.
- [Documentary jiégāo case](../../docs/P9_HISTORICAL_JIEGAO.md): a transmitted-text water-lifter with explicitly hypothetical dimensions and idealized torque; the linked P9 tests are an example, not proof of an as-built historical artifact.
- [Eval prompts](evals/evals.json): sample requirements and failure traps (not model-run results).
- `node skills/evidence-first-anatomy/scripts/check-project.mjs`: structural package checker; use `--strict` only against this reference implementation. This is not proof that an installed agent automatically loaded the Skill.
- [Anatomy upstream](https://github.com/wheresryan22/anatomy) / [NIST B-tree](https://xlinux.nist.gov/dads/HTML/btree.html) / [Agent Skills format](https://agentskills.io/specification).
