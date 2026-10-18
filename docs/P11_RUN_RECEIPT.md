# P11｜独立运行回执（2026-10-18）

**环境：** 与 P10 隔离容器一致的 Node.js `v22.16.0` 与本地 Python Playwright／系统 Chromium 环境。P11 文件在独立工作副本 `/mnt/data/anatomy-p11-work/anatomy-evidence-lab` 修改；用户 Windows/WSL 中 Hermes 的原有工作树未被本轮覆盖。以下仅报告这份代码副本的实际执行结果。

| Check | Actually executed | Result |
|---|---|---|
| Model/unit | `npm test` | `158/158 PASS`, `0 FAIL`, `0 SKIPPED` |
| Standalone HTML | `npm run build` | `PASS`, P11 `dist/source-atlas-p11.html` **9,959 bytes**；同时生成既有页面 |
| Structured artifact | `npm run export:source-atlas:p11` | `PASS`, 4新增资源、P10 7资源、`verifiedOriginalFolio=0` |
| P11 browser | `python scripts/browser_p11_atlas.py` | `16/16 PASS`（1366px 与 390px） |
| Runtime script syntax | `bash -n scripts/p11_agent_runtime_canary.sh` | PASS（只核对 shell 语法，**未执行 Agent 问答**） |
| Existing four/five browser suites | 本地 P11 当前未重复执行 | `NOT_RETESTED_LOCALLY`; GitHub CI will run if configured correctly |
| GitHub test & browser CI | this local receipt cannot establish a remote result | `PENDING_REMOTE_VERIFICATION` |
| Hermes no-Skill provider baseline | Attempted remote launch, no verified output; device subsequently disconnected | `NOT_VERIFIED` (no fabricated exit code) |
| Hermes explicit Skill turn | P10 exit 124 timeout; not rerun successfully in P11 | `NOT_VERIFIED` |
| OpenClaw discovery | P10 timeout 124 and SQLite slow transaction message | `NOT_VERIFIED`; root cause unknown |
| Historical original jiégāo folio | Browsed whole-volume edition records; exact folio not visually verified | `0 VERIFIED` |

**Do not combine the 158 Node checks and 16 browser checks into a single benchmark population**, and do not treat CI PASS as a local provider evaluation. A verified original folio requires volume, stable original image, PDF index and printed leaf identification, not just a file at Wikimedia Commons.

Current GitHub PR and issue references:
- [PR #2](https://github.com/conanxin/anatomy-evidence-lab/pull/2)
- [Issue #7 P11](https://github.com/conanxin/anatomy-evidence-lab/issues/7)
- [Notion research](https://app.notion.com/p/3f734a28189a81699161dd858772aed5)
