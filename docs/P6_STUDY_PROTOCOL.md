# P6｜Static Explanation vs Interactive Model: Comprehension Study Protocol (not yet run)

**Status**: protocol and scoring code prepared. **Zero real participants. No findings about learning improvement.**

## Testable question

Does a user who explores a correct, inspectable B-tree figure answer objective questions about model assumptions and counterexamples more accurately than a user given the **same factual statements** as a static sheet?

## Proposed A/B design (requires future actual recruitment)

1. Recruit consenting participants and record an anonymous pseudonym, without names or sensitive details. Avoid sharing raw responses publicly by default.
2. Randomize participants to `static` versus `interactive` condition (not self-selection). Give both groups the same task, duration (e.g. 5 minutes), input data, answer options, and question wording; only the learning medium differs.
3. The **static** group sees the full, equivalent text in the page's *static control material* panel, **without** the interactive UI; the **interactive** group gets the figure and cost sliders, **without** the static answer sheet. The current all-in-one page is an experiment **kit**, not a valid blinded A/B study by itself.
4. Present all five questions in **the same sequence**, with the same scoring key and no immediate feedback until submission. Score 1 for correct, 0 otherwise; total 0–5.
5. Pre-register the sample size and primary comparison before recruitment. Report sample size, missing data, median/mean, item-level correctness, and limitations. Do not assert causality from a convenience sample.
6. Before examining any results, decide how missing data and repeat attempts will be handled. The basic CLI rejects incomplete questionnaires rather than silently excluding them.

## Identical objective questions

| ID | Question (summarized) | Correct |
|---|---|---|
| Q-BASELINE | Baseline 25-key query 24: which t makes fewer node visits? | t=2 |
| Q-NODE-WEIGHT | Counterexample query 7: weights (5,1), lower score? | t=3 |
| Q-KEY-WEIGHT | Counterexample query 7: weights (1,5), lower score? | t=2 |
| Q-IMMUTABLE | Does changing only weights change B-tree structure/search trace? | No |
| Q-REALITY | Do the fictional teaching points equal measured hardware latency? | No |

Exact bilingual wording and options are version-controlled in [`src/learning.js`](../src/learning.js). The page includes a **self-check only**; it does not collect, persist or transmit submissions. Synthetic data in unit tests are explicitly fixtures, not research participants.

## Privacy-preserving descriptive summarization

For a future collection of valid, actual responses supplied as local JSON, run:

```bash
npm run score:study -- path/to/real-pseudonymous-responses.json
```

Schema: one array item per participant: `{ "participantId": "random-opaque-id", "condition": "static", "answers": { "Q-BASELINE": "t2", ... } }`. Allowed condition: `static` or `interactive`. Aggregation emits only sample sizes, mean scores, per-item counts and a non-causal caution, **not IDs or raw responses**, to `artifacts/study-summary.json`. The command does **not** synthesize mock participants when the input file is missing. For empty input, results are `NO_PARTICIPANT_DATA` with `null` outcome estimates, not invented 0% scores.

## Limits

The present interface exposes the static sheet and interactive model together; that is **not** an A/B presentation. Users practicing inside it are not enrolled in a study. No randomization, time-on-task instrumentation, retention follow-up, or actual participant response dataset is included. A learning-benefit claim remains `NOT_EVALUATED`.
