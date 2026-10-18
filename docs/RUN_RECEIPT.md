# Execution receipt — 2026-10-15 (UTC+08)

## Scope and provenance

`CONANXIN_ANATOMY_P3_OPEN_SOURCE_FALLBACK`, independently recreated in the ChatGPT sandbox because the authorized local Windows/WSL desktop connection stopped responding. This **is not** the same file tree as the 2026-10-12 Hermes WSL worktree. Prior Hermes results and this run are kept separate.

| Check | Environment / method | Result |
| --- | --- | --- |
| Node environment | Node v22.16.0, npm 10.9.2 | OBSERVED |
| Unit tests | `npm test`; native Node test runner | **34 PASS / 0 FAIL / 0 SKIP** |
| Static build | `npm run build` | **PASS**, `dist/index.html` = 31,242 bytes |
| Browser interaction | `npm run test:browser`, Playwright Python 3.13.5, Chromium 144.0.7559.96, built HTML loaded with `page.set_content` | **15 PASS** (1366px and 390px) |
| Browser errors | Playwright `pageerror` collector | **0 detected** |
| Mobile root/scroll | 390px viewport, root centered, horizontally scrollable cabinet | PASS |
| Visual review | Saved desktop and mobile screenshots inspected manually | PASS at inspected states |
| GitHub Actions CI | Executes `npm test` + `npm run build` on Node 22 | Pending real remote run at the time this file was authored |
| Local Hermes reconnection | Device was online in saved metadata, but remote tool calls did not return | BLOCKED / NOT VERIFIED |

Standalone HTML SHA-256: `9afc1119636b224373e23c108503ef1c587caf4a0d7784ef5b96b4731ae6b092`.

**Browser method caveat**: the test runner environment blocked browser navigation to both `127.0.0.1` and `file://` with `ERR_BLOCKED_BY_ADMINISTRATOR`; hence `Playwright.page.set_content` was used to exercise the **exact generated self-contained HTML** inside Chromium. This proves DOM/JS interactions, not that external hosting, headers, downloads or remote GitHub Pages work. The test result is not called an actual remote hosting verification.

## What passed

The unit tests cover: correct insert/search, hit/miss, duplicate no-op, safe integer validation, min-degree bounds, key ordering/ranges, equal leaf depth, valid child counts, deterministic stress cases, trace references and decisions, serialized trace, planar layout, bilingual readout and SVG highlight projections. Browser checks cover UI startup, drawer rendering, found/miss state, insert-and-search, language switch, reset, zero JS runtime exceptions and scrollability at 390px.

## Explicitly excluded

No physical mechanical accuracy claim, historical reconstruction claim, full color-contrast audit, assistive-technology user study, Internet deployment, BOOK-ID-SEARCH integration, browser-specific tests beyond headless Chromium, or comparison against the original unpublished Hermes screenshot.

## Related research

- Notion: https://app.notion.com/p/3f734a28189a81699161dd858772aed5
- GitHub issue: https://github.com/conanxin/anatomy-evidence-lab/issues/1
- Upstream Anatomy pin from 2026-10-12 local Git: `689dcf966e63d92be10a5d593c6e19e10acd4422`

---

# P4 / Evidence Graph verification — 2026-10-18

This section is an independent local container test of a new revision; it is not the historic 2026-10-12 Hermes branch. A separate untouched Windows/WSL worktree has been inspected for reconciliation.

| Gate | Method | Observed result |
| --- | --- | --- |
| Evidence graph validation | `node --test tests/evidence.test.mjs` (included in `npm test`) | 13 new checks passed |
| Unit suite | `npm test`, Node 22.16.0 | **47 passed / 0 failed / 0 skipped** |
| Static build | `npm run build` | **PASS**, 46,155-byte standalone HTML |
| Browser smoke | `CHROMIUM_PATH=/usr/bin/chromium python scripts/browser_smoke.py` | **23 passed / 0 failed**, Chromium at 1366 px and 390 px; validates source cards, keyboard rail, clickable card, bilingual outcome, reduced-motion, reset and search consistency |
| Artifact digest | `sha256sum dist/index.html` | `c1787e2c4a96d940e491965ad61f9a9528f849bf3d266bed3257497befceed94` |
| GitHub Actions P4 | CI will run after this revision is pushed | **PENDING AT TIME OF LOCAL RECEIPT**; check PR's current commit / checks |

**Limitations:** The browser test directly executes the self-contained HTML via Playwright `page.set_content`, not by navigating to a deployed public URL. It verifies interactions but is not a full screen-reader accessibility audit, and it does not prove effectiveness for teaching real learners. The W3C PROV-O comparison is conceptual; RDF export is not implemented.

**Source tracking:** NIST definition is evidence for the general balanced multiway tree, not validation of the custom B-tree code or rendering. The synthetic degree convention, filing-cabinet analogy, and omitted database concerns remain explicitly labeled assumptions.

---

# P5 / Controlled assumption experiment — 2026-10-18 (initial local receipt)

**Build origin:** independent, isolated ChatGPT container copy of the published P4 branch; the preserved WSL Hermes source tree was not overwritten. P5 GitHub commit and CI are **pending** at time this initial receipt was written. The PR remains unmerged.

| Gate | Actual command or method | Result |
| --- | --- | --- |
| Node | `node -v` | `v22.16.0` |
| Unit | `npm test` | **69 PASS / 0 FAIL / 0 SKIP** |
| Build | `npm run build` | **PASS**, 59,942 byte standalone HTML |
| Browser | `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` | **37 PASS**, Chromium 144, 1366px and 390px |
| Source and parameter | `tests/evidence.test.mjs`, `tests/comparison.test.mjs` | **PASS** |
| SHA-256 export | `npm run export:provenance` | **PASS**; SHA-256 `a91733d14361ba1aaeab302b519e786efdb5ce2fe6aaaa62f43d65f26b9347fb` for default case |
| Actual Git revision | This copy was exported from a ZIP without `.git` | **UNPINNED** in local JSON-LD (GitHub CI runs with pinned commit) |
| Remote CI | New P5 GitHub Actions | PENDING at writing |
| Human learning trial | No recruited participants | NOT TESTED |
| Existing website | Not deployed to existing site | NOT DEPLOYED |

**Observed result for query 24**: t=2: 14 total nodes / 3 levels / 2 visits / 4 comparisons; t=3: 9 total nodes / 3 levels / 3 visits / 6 comparisons. These are exact counts for the chosen input and code, not disk I/O or relative runtime performance. The browser smoke uses Playwright `page.set_content` with the built, self-contained HTML, not public URL navigation.

**Additional syntax/graph check:** Local Python `rdflib.Graph.parse(..., format='json-ld')` successfully expanded the actual CLI-produced JSON-LD into 31 RDF triples: 1 `prov:Activity`, 3 `prov:Entity` (one input + two model outputs) and 1 `prov:Agent`. This verifies a usable minimal RDF graph, **not** SHACL validation, full PROV-O ontology conformance or trustworthy source claims.

## P6｜2026-10-18 本地独立复验（GitHub CI 另查）

- Source basis: P5 GitHub branch head `5f1274d39667723894f9da6709cf1a7a4fec4248`。P6 在该源码的独立复制目录中实现，不覆盖用户 WSL 中未提交的 Hermes 旧版。
- `node --version`: v22.16.0。
- `npm test`: **96 PASS, 0 FAIL, 0 SKIP**。新测项包括成本优劣反转、旧数据集的不可反转、相同权重持平、原始 B-tree/trace 不变、输入参数拒绝、匿名答卷评分、零参与者状态、输入与成本假设分离的溯源哈希。
- `npm run build`: **PASS**，自包含 `dist/index.html` (86,249 bytes)。
- `npm run export:provenance`: **PASS**（P5 输入/运行记录）；`npm run export:cost`: **PASS**（P6 假设分离记录）。
- `artifacts/cost-run.jsonld`：经 Python rdflib 成功解析，**31 RDF 三元组**；此项只证明可解析，不证明全套 PROV-O/OWL 语义一致性。
- `CHROMIUM_PATH=/usr/bin/chromium python3 scripts/browser_smoke.py`: **55 PASS**（1366px + 390px；包括反例切换、权重反转/持平、原情景 ID 不变、成本来源卡、理解度自测、语言/重置及 P5 兼容）。第一次尝试由于 Playwright 默认浏览器未安装而失败；指定本机 Chromium 后成功，未伪造 PASS。
- 实际参与者：**0**；不存在 A/B 学习效果结果。
- GitHub PR/CI: **PENDING_REMOTE_CHECK_AT_TIME_OF_THIS_LOCAL_RUN**（后续以真实 GitHub 执行记录为准）。

## P7 | 2026-10-18 deterministic sensitivity + two preview arms (local execution)

**Origin**: isolated P6 ZIP copy, not the user's preserved local Hermes WSL worktree. Public preregistration first committed to GitHub at `33f35b83a93ec9ae5e821e8c5e2aec522d369e35` before running the new P7 scan.

| Gate | Actual execution | Outcome |
|---|---|---|
| Node | `node --version` | `v22.16.0` |
| Old + new tests | `npm test` | **113 PASS / 0 FAIL / 0 SKIP** |
| Locked finite-grid scan | `npm run analysis:p7` | **288 paired synthetic cases**, 111 tradeoffs (38.54% of locked finite grid), 288 rows in JSON+CSV |
| Build | `npm run build` | **PASS**; 108,227-byte self-contained `dist/index.html`, plus 2 distinct study-arm previews |
| Baseline browser regression | `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` | **55 PASS**, 1366px + 390px |
| P7 browser + arm isolation | `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:p7` | **56 PASS**, 1366px + 390px and static/interactive arm previews |
| JSON / CSV identity | `sha256sum artifacts/p7-sensitivity.{json,csv}` | JSON `36c38c6510a3a24b12e25fa492f8f62cad9333c32e22f6e47ec23cf2dd510317`; CSV `091cebf90ee681ee97501361b47e019df3f7d932dfccc42316e7820869ad3b6b` |
| Main self-contained HTML identity | `sha256sum dist/index.html` | `4aeb37ef463b7fbbc8f6a38ae59fccb80828075359e9b472b7d79670be89ab52` |
| P7 new human participation | No participants enrolled / randomized | **NO_PARTICIPANT_DATA; effectiveness NOT EVALUATED** |
| GitHub Actions on new commit | Pending at time of this local receipt | **PENDING**; confirm on GitHub separately |
| Live site / PR merge | Not performed | **NOT DEPLOYED; NOT MERGED** |

**Test correction record**: initial P7 test asserted that identical weights (5,5) cause a tie in a case with dv=-1 and dk=+2; this assertion was mistaken. The actual equality condition is `node_weight=2*comparison_weight`. Test corrected to (2,1) without changing the algorithm or preregistration. The full suite rerun passed. This is a test expectation fix, not an inconvenient result removed.

**No sampling claim**: the 288 scenarios are a complete enumeration of *chosen* deterministic seeds/sizes/orders/probes with correlated rows, not independent random workloads. No p-values, confidence intervals, real hardware metrics or human effectiveness are inferred.

---

## P8 execution receipt — 2026-10-18 (independent analysis environment)

**Status:** `LOCAL_P8_PASS / REMOTE_CI_PENDING / AGENT_RUNTIME_LOADING_UNTESTED` at the time this section was authored. The eventual GitHub CI status must be checked for the exact P8 commit; do not copy this local result into a claim of remote success.

- **Public design lock commit before analysis:** `df2dbc3ed06c320e1c0ed7693f6cd0e4f96cdede`; the locked rules remain in `docs/P8_DESIGN_LOCK.md`.
- **Environment:** Node.js `v22.16.0`, Python `3.13.5`, Chromium `144.0.7559.96` via `CHROMIUM_PATH=/usr/bin/chromium`; Linux execution container, not the user's original WSL / Hermes process.
- **`npm test`:** 130 PASS, 0 FAIL, 0 SKIP, exit 0. New P8 oracle/robustness/Skill structural tests contribute 17 cases above P7's 113.
- **`npm run build`:** PASS; produces `dist/index.html`, `dist/study-static.html`, `dist/study-interactive.html`; each standalone HTML is 127246 bytes. No server/site deployment.
- **`npm run check:skill`:** PASS structure+reference checks. NOT proof of Hermes / OpenClaw loading. Packaged eval prompts are NOT executed agent evaluations.
- **`npm run analysis:p7`:** PASS; P7 fixed baseline retained unchanged; 288 records as previously verified.
- **`npm run analysis:p8`:** PASS; 864 paired query rows with independent trace oracle; 336 tradeoff, 447 `t3-dominates`, 51 `t2-dominates`, 30 identical. Rank control 288/288 matched with zero metric mismatches.
- **Byte-for-byte repeat:** repeated `npm run analysis:p8` with SHA-256 of JSON/CSV/result-report checked unchanged (three sha256sum checks PASS).
- **Browser previous regression:** `python scripts/browser_smoke.py` with Chromium: **55/55**.
- **Browser P7 regression:** `python scripts/browser_sensitivity.py`: **56/56**.
- **Browser new P8:** `python scripts/browser_robustness.py`: **48/48**; desktop viewport 1366 px, mobile 390 px, both preregistered-study previews hidden from P8 exposure, without observed JS page errors.
- **Browser total:** 159 counted assertions across three separately executed scripts; do not add this to Node test count as if all were the same testing family.
- **P8 stable JSON file SHA-256:** `e8a13a7a97e7d05cf5221e90d8bad9b8a794a7910c987f77368f07b460ac61c0`.
- **P8 CSV SHA-256:** `8d5d0a32688b101d99711cd592ce5de61e93e81db5fcc26fd512af36bc52dbfd`.
- **Canonical results payload SHA-256:** `8b6b1d40f1a41a42b6d49e9638b62c6712fdbc9433696724325ad9ab1676091a`, over `JSON.stringify({protocol,summary,rows})`, not over JSON file bytes.
- **Learning trial:** `NO_PARTICIPANT_DATA`; no allocation, consent, collected surveys or learning effect. Static/interactive study previews unchanged.
- **Historical object:** `SOURCE_GAP / SCHEMATIC_ONLY`; no dated or dimensioned actual waterwheel reconstruction supplied.
- **Production/site:** `NOT_DEPLOYED`; unrelated projects untouched, original local Hermes worktree unchanged.

The 864 cells are 3-fold related spacing transformations of 288 rank/order/probe designs. They are **not** 864 independent draws from a target statistical population. Reported proportions are descriptive for this deliberately designed synthetic experiment and are not empirical database performance rates. Correctness of `searchTrace` is cross-checked with an independently written tree traversal, but construction still uses the same B-tree engine.
