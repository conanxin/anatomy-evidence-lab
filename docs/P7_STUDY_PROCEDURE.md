# P7 | Learning media comparison — reproducible pilot materials, not a completed trial

**Status:** `MATERIALS_IMPLEMENTED / NO_PARTICIPANT_DATA / NOT_LAUNCHED` (2026-10-18). No recruited people, measured learning effects, p-values or randomized assignments are claimed.

## Actual separate previews

`npm run build` produces three self-contained HTML files under `dist/`:

- `index.html`: independent study/demo kit with **both** text and interactive model. This is **not** an experimental arm.
- `study-static.html`: **STATIC** preview. Only a fixed written explanation, the identical five P6 comprehension questions, and the same duration instructions are visible. The SVG, buttons, cost sliders and P7 analysis are hidden.
- `study-interactive.html`: **INTERACTIVE** preview. Search machine, explicit comparison and adjustable fictional costs are visible; the static explanation sheet and P7 analysis are hidden. The same five question IDs/options/order/answer key and duration instructions apply.

Both arm previews have the explicit `data-study-status="preview-only"` attribute. They neither collect nor send answers, user/device details, time spent, IP addresses or participant IDs. Browser checks verify the intended visibility, the same question bank and no JavaScript errors. Providing two links or hiding elements in a shared DOM is a **minimum exposure prototype**; it is not a blinded study, nor proof that the arms have equivalent reading difficulty.

## Proposed study design (future, requires human enrollment and authorization)

- **Question:** Does interacting with a model of the same factual B-tree relationships change comprehension on the frozen five-item quiz compared with a static document?
- **Pilot size:** aim for 24 consenting adults (12 per arm); this is a *feasibility target*, **not** a power-based sample size for detecting effects.
- **Allocation:** only after actual enrollment, use balanced blocks of 4 and a recorded seed. Do **not** assign hypothetical participants or synthesize responses while developing software.
- **Exposure:** suggest 5 minutes for each arm; exact delivery device, facilitator script, start/end controls and reading instructions must be fixed before recruiting. No in-app duration measurement exists yet.
- **Outcome:** primary descriptive *complete-case* total (0–5), mean and median by arm. Secondary: correctness per item, invitations/enrollments/completions, attrition/incomplete and delivery failures. Do not claim superiority from a convenience pilot. There are no completed observations yet.
- **Missingness:** retain the enrolled denominators and incompletes separately. The existing `aggregateStudy` intentionally **rejects** incomplete questionnaires: future collection must record withdrawals and incompletes independently; don't silently drop and present full enrollment as analyzed.
- **Repeated answers:** one unique pseudonymous ID per person; no repeat submissions in the analysis unless a revision policy is frozen in advance. Programmatic duplicate IDs throw an error.
- **Privacy:** store only explicitly submitted, pseudonymous records in local files when authorized. Do not automatically transmit quiz answers or upload raw responses to a public repository.
- **Reporting:** explicitly separate post-hoc narrative insights from the frozen primary endpoint, show group n and distribution, do not report unsupported inferential confidence intervals or causality.

## Frozen question bank

Both arms reference precisely the **same** [`src/learning.js`](../src/learning.js), five IDs: `Q-BASELINE`, `Q-NODE-WEIGHT`, `Q-KEY-WEIGHT`, `Q-IMMUTABLE`, `Q-REALITY`. Their content predates P7. The P7 sensitivity matrix is **not** part of the learning intervention to prevent contaminating the earlier frozen items.

## Practical reporting guidance

The [TIDieR checklist](https://www.equator-network.org/reporting-guidelines/tidier/) motivates giving replicable material/procedure descriptions, not a claim of adhering to formal clinical-trial standards. In this personal pilot context, accurate disclosure of who was approached, what people saw, duration, allocation and missing data matters more than formal significance testing.

## Readiness

- Study arm pages: **yes, browser preview tested**.
- Same five questions: **yes, shared source and browser verified**.
- Participant enrollment, consent, allocation and outcome records: **not started**.
- Claim that interactive media improves comprehension: **NOT EVALUATED**.
