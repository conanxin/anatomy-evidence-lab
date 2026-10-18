# P9 design lock | Runtime Skill canary + documentary Jiégāo principle model

Status: design commitments **before** collecting any P9 runtime or historical-model test outcomes. This is a project audit lock, not a formal scientific preregistration. Date: 2026-10-18.

## Source-first candidate
Object is the **general jiégāo (桔槔) counterweight water-lifter**, not an identified excavated or extant machine. Sources:
- `SRC-ZZ-01`: [Zhuangzi, Outer Chapters, "Tian Di" (天地), CTP](https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel), passage with "後重前輕" and "其名為槔"; literary/narrative evidence, **not** an as-built drawing.
- `SRC-WZ-01`: [Wang Zhen Nong Shu, juan 18, irrigation, "Jiégāo"](https://zh.wikisource.org/zh-hans/王禎農書/卷十八), text (Wikisource, specific permalink [oldid 1142890](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890)). The passage describes the mechanism and quotes "引之則俯，舍之則仰"; it is a transmitted text, not a verified original Yuan-period scan.
- `SRC-WZ-NEG`: the following `辘轳` entry describes rotation of a spindle and differentiates it from jiégāo (up/down pivot action).

## Claim–source–assumption boundaries
- DOCUMENTED textual mechanism: counterweighted front/back arrangement; raising water; tilt/counter-tilt rather than a rotating windlass.
- INFERRED mechanical analogy: beam + pivot + bucket rope + counterweight placement interprets the wording and common mechanical principle; may not reproduce a specific design.
- ILLUSTRATIVE: beam length, pivot height, bucket weight, water load, color, materials, motion speed, force/torque coefficients and exact shapes; no source-supported numerical values available.
- UNKNOWN: historical dimensions, geometry ratios, actual chronology/provenance of an object, average throughput and archaeological identification.
- Use simple modern statics `T=g*(m_counter*l_counter - m_load*l_load)` only as a **teaching simplification**. Show the sign as idealized tendency; never assert measured force/efficiency or automatic fluid mechanics. Users changing hypothetical masses must not modify textual evidence.
- Ensure references distinguish Wang Zhen's quotation of the Zhuangzi passage from a second independent field measurement. Two transmitted sources are not two measurements.

## P9 local runtime eval acceptance
- Conduct a **read-only project-scope** Hermes Skill discovery check in a new isolated clone, never global installation or editing original dirty working tree.
- Conduct separate OpenClaw workspace-scoped discovery/diagnostic checks. Avoid changing user-level skill config or restarting gateways.
- One bounded prompt each that requests (a) primary source, (b) at least one UNKNOWN, and (c) a concrete model/test plan. Use explicit paths and output files to distinguish `SKILL_FOUND` from `AGENT_RESPONDED` and `FOLLOWED_PROCEDURE`. Capture actual exit status/duration; timeout or connection failure is an unresolved gate, not PASS.
- Do not presume local runtime loads file merely because it is present on disk. Never rely on apparent text similarity alone as evidence of Skill activation.

## P9 implementation / acceptance
- Pure `src/jiegao.js`, visual module/page, accessible controls, source panel and explicit illustrative parameters. Independent programmatic tests for statics signs, invalid inputs, source IDs, model immutability and visual part classification.
- Generate standalone `dist/jiegao.html`; Chromium desktop and 390px mobile smoke check if tools support it. Keep all B-tree tests and browser regressions green.
- Publish source/tests and true execution receipts on existing feature PR, do not merge or deploy to existing sites.
- Archive to the same Notion research page with source strengths, measured results and unresolved gates; no alleged manuscript facsimile, field measurement or effect study.
