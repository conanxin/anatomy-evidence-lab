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
