# P12｜真实执行回执（2026-10-19）

本轮在独立临时工作区构建并运行源码，不修改本地 Hermes 原始项目工作树，不更新现有生产网站。GitHub 远程构建成功与否须以**对应本阶段新提交**的 Actions 执行结果为准。

| Check | Actual result / boundary |
|---|---|
| P11 baseline | existing 158 Node tests PASS (prior published) |
| P12 model + source+ Skill rule checks | `npm test` **165 PASS / 0 FAIL / 0 SKIPPED** (162 including P12 source gates, plus 3 fidelity rule tests) |
| P12 static build | `npm run build` PASS, `dist/source-atlas-p12.html` generated |
| P12 source registry | `npm run export:source-atlas:p12` PASS: 3 new witnesses, 14 total, 0 original folios verified |
| P12 Chromium desktop/mobile | `python scripts/browser_p12_atlas.py` PASS **16/16** (1366px, 390px) |
| Skill static structure | `npm run check:skill` PASS; does not mean post-change agent was tested |
| Agent baseline | **Hermes READY**: no custom skill, exit 0, 41.399s, 0 stderr bytes |
| Explicit Skill response (pre-P12 Skill) | **RETURNED**: exit 0, 29s, 1422B; **SOURCE_FIDELITY=FAIL**; test quality issues described in P12_RUNTIME_TRIAGE.md |
| OpenClaw | No new correct runtime check; P10 timeout/SQLite slow transaction hint remains |
| Ming printed folio | **0 verified**; scan repository/version witnesses located, PDF bytes/page/printed leaf/crop still missing |
| Updated P12 Skill runtime | NOT TESTED; evals are specifications only |
| Live deployment / PR merge | NOT PERFORMED |

**Historical evidence caution:** a new institutional catalogue reference and a digitized-volume file are not the same as identifying a precise original figure. Do not back-fill source SHA or figure folio with invented data.
