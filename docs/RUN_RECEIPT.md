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
