# Anatomy Evidence Lab / 可探索知识机械

[English](#english) · [中文](#中文) · [Research notes](docs/PROVENANCE.md)

![CI](https://github.com/conanxin/anatomy-evidence-lab/actions/workflows/test.yml/badge.svg)

An **evidence-first B-tree archive machine**: a real, deterministic multiway search tree powers a filing-cabinet SVG explanation. Every drawer highlight, key comparison, and bilingual status line is derived from the same structured algorithm trace. A small research POC inspired by [Anatomy](https://github.com/wheresryan22/anatomy), not a rebranded copy of the original figure library.

## 中文

### P6：可质疑的成本假设与理解度自测（2026-10-18）

- 新增 **成本模型假设滑块**，分别给“访问节点”和“比较键”分配虚构分值；修改权重不会更改 B-tree、搜索轨迹、真实计数或输入摘要。分值**不是毫秒、磁盘 I/O 或 BOOK-ID-SEARCH 实测性能**。
- 两个可选样本：P5 **25 键常规数据**（查询 24，t=2 同时拥有较少访问与比较，正权重无法反转）和 P6 **42 键特意选取的权衡反例**（查询 7，t=2: 4 访问/5 比较，t=3: 3 访问/6 比较）。反例中权重 `5:1` 使 t=3 分值更低，而 `1:5` 使 t=2 更低，相等权重产生并列。此为**教学模型内的可反驳结论，不推广为数据库性能排序**。
- 增加成本假设的 Claim → Source → Assumption → Model → Visual → Test 证据关联及真实输入/轨迹/权重/输出分开的 JSON-LD 运行记录；不声称完整 PROV-O 一致性。
- 新增静态说明材料与**相同的五道客观理解题**的自测工具，页面不收集参与者信息。**未开展真实 A/B 研究，没有教学效果比较结果。** 将来可用匿名真实回答运行 `npm run score:study -- /path/to/responses.json` 生成描述性统计。
- [成本反例分析与方法边界](docs/P6_CONTESTABLE_COST.md) · [学习对照研究协议（未实施）](docs/P6_STUDY_PROTOCOL.md) · [`src/cost-model.js`](src/cost-model.js) · [测试](tests/cost-model.test.mjs)。
- P6 命令：`npm test && npm run build && npm run export:cost`。浏览器检查另行执行 `npm run test:browser`（需要 Chromium + Playwright）。CI 的真实状态必须按相应 commit 检查，不能由本地通过推断。

### P5：可修改假设的双模型对照（2026-10-18）

- 使用**完全相同的插入顺序和整数集合**，按 `t=2` / `t=3` 重建两棵 B-tree；在页面选择最小度数、查找整数、插入新卡片，结构与结果同步重算。
- 对照卡直接显示节点总数、树高、查找访问节点数、键比较次数和所访问的节点 ID；模型状态与视觉源于同一 `searchTrace`。
- 固定案例（查询 `24`）：t=2 有 14 个节点、访问 2 个节点、比较 4 次；t=3 有 9 个节点、访问 3 个节点、比较 6 次。这说明**总节点更少并不保证某次查询访问更少节点**，也不能推断真实磁盘 I/O/延迟。
- 新增 [对照实验研究说明](docs/P5_CONTROLLED_EXPERIMENT.md)、`src/comparison.js` 和 `tests/comparison.test.mjs`。
- `npm run export:provenance` 生成 SHA-256 标识输入、带实际执行时间/执行者/代码版本的 PROV-O 术语 JSON-LD（尚未声明 RDF/OWL 全标准一致性）。浏览器情景编号则明确不是加密摘要。
- CI 额外验证运行记录可导出；浏览器回归覆盖桌面与手机的参数切换、查找、证据卡和插入一致性。

### P4：交互式证据图谱

- 点选档案抽屉、数字卡片或连接通道，可以追踪到关联的 **Claim → Source → Assumption → Model → Visual → Test**。
- 同一组声明同时区分 **来源支持**、**已测试的程序逻辑** 与 **人为设定的演示假设**；不会把 B-tree 教学隐喻说成 BOOK-ID-SEARCH 的实际索引。
- `src/evidence.js` 公开所有证据记录和事件映射；`tests/evidence.test.mjs` 验证来源完整性和引用关系。
- CI 增加 Chromium 真实交互检验，维护桌面与手机两类截图。证据定义与约束详见 [P4 EVIDENCE GRAPH](docs/EVIDENCE_GRAPH.md)。

### 核心内容

- 可运行的最小度数 `t=2` B-tree 插入及检索；25 个合成整数样本、多层节点。
- 轴测档案柜界面：抽屉=树节点，卡片=键，黄铜导轨=子节点关系；可搜索、插入、逐步执行、自动播放、重置和切换语言。
- 键盘：输入框按 Enter 检索，非输入焦点使用 `←` / `→` 分步、空格播放或暂停。
- 用 `validateTree` 检查键范围、节点容量、子节点数、所有叶子同深度和实际 `size`。
- 同一个 `searchTrace` 驱动文本解释和 SVG 高亮；模型、状态投影分离，方便单元测试。
- 未集成 BOOK-ID-SEARCH：**本模型只是通用算法的教学示意，不能据此推断任何特定数据库的真实实现。**

### 运行

```bash
npm test
npm run build
npm run preview
npm run export:provenance  # optional run provenance JSON-LD
# open http://127.0.0.1:4317
```

Node.js 22+，零运行时 npm 依赖。`dist/index.html` 是可直接双击打开的离线 HTML，GitHub Actions 自动构建并上传静态预览 artifact；合并前只在 PR 中检查，不自动部署到现有网站。

### 研究与证据

[NIST DADS: B-tree](https://xlinux.nist.gov/dads/HTML/btree.html) 是公开定义来源。这里采用常见的最小度数 `t` 约定：除空根外每非根节点 `[t-1, 2t-1]` 个键，每内部节点子节点数 `keys+1`，叶子处于同一深度。

核心限制：不模拟删除、磁盘页/IO、并发、缓存、B+ tree，也不把视觉隐喻当作史实证据。详见 [PROVENANCE](docs/PROVENANCE.md) 与 [运行回执](docs/RUN_RECEIPT.md)。

## English

### Getting started

```bash
npm test
npm run build
npm run preview
# Optional: pip install playwright; npm run test:browser
```

A lightweight, auditable B-tree visual explanation. No build toolchain or third-party runtime dependencies. Node 22+ is required for tests and preview. The project separates **algorithm truth** (`src/btree.js`), **view semantics** (`src/scene.js`), and **browser representation** (`src/app.js`). Sources and synthetic assumptions are visible in the interface.

### Project layout

```text
index.html          Browser UI and evidence disclosure
styles.css          Responsive mechanical illustration style
src/btree.js        Pure B-tree algorithms, trace, invariants and layout
src/scene.js        Pure readout/highlight projections
src/evidence.js     Typed claim/source/assumption/model/visual/test graph
src/comparison.js   Both B-tree models, visited-node counters, deterministic labels
src/app.js          Accessible controls and SVG renderer
scripts/build.mjs   Static packaging into dist/
scripts/serve.mjs   Local-only static preview server
scripts/export_provenance.mjs  Input SHA-256 and actual export activity JSON-LD
tests/*.test.mjs    Deterministic model, view and provenance graph tests
scripts/browser_smoke.py  Playwright + Chromium smoke test (also CI)
docs/PROVENANCE.md  Source pin, assumptions and evidentiary boundaries
docs/P5_CONTROLLED_EXPERIMENT.md  Controlled degree comparison and research result
docs/RUN_RECEIPT.md  Verified results and untested boundaries
docs/LOCAL_HERMES_HANDOFF.md  Command for resuming on local Hermes
```

**Publication gate:** a passing unit suite proves only the coded invariants, not a scientific or historical truth claim. The visual/browser gate and source trace must also be reviewed before claiming a complete interactive explanation.

## P4 / Evidence graph (English)

The new **Evidence Graph** panel attaches each trace event to a typed claim, primary source, declared assumptions, executable model code, visual mapping and reproducible tests. Click a drawer, card or rail to inspect its mapping; a dedicated control returns to the live search trace. This is an auditable *teaching model*, not a claim that a real database has been reverse engineered. The provenance graph is intentionally a small custom schema rather than a W3C PROV-O implementation. Details: [docs/EVIDENCE_GRAPH.md](docs/EVIDENCE_GRAPH.md).

## P5 / Change an assumption (English)

The interface can rebuild an interactive archive machine for the *same insertion sequence* with degree `t=2` or `t=3`. The controlled comparison counts actual in-model node visits, key comparisons and tree levels. A reproducible counterexample for key 24 shows fewer total nodes under `t=3`, yet more node visits than under `t=2`. This does not imply a performance benchmark of any database. See [controlled experiment and provenance](docs/P5_CONTROLLED_EXPERIMENT.md).

## P7 | Full finite-grid sensitivity audit (2026-10-18)

The P6 42-key tradeoff was chosen specifically to demonstrate a reversibility claim; it cannot estimate prevalence. P7 therefore **committed its design before calculating results**: [P7 design lock](docs/P7_DESIGN_LOCK.md), commit `33f35b83a93ec9ae5e821e8c5e2aec522d369e35`.

The fixed cross-product contains **288 deterministic paired synthetic B-tree searches** (sizes 12/25/42/80 × four seeds × three insertion orders × six queries). The pure algorithm counts node visits and key comparisons for t=2/t=3, classifies Pareto dominance/tradeoff/identical, and presents a 4×4 hypothetical-weight sensitivity heatmap. Data cells from one tree are correlated; these results do not generalize to real-world databases or measure time/disk I/O.

```bash
npm test                  # semantic + P7 grid tests
npm run analysis:p7       # export 288-row JSON, CSV, and generated docs/P7_RESULTS.md
npm run build             # dist/index.html plus both separate study previews
npm run test:browser:p7   # optional, requires Python Playwright + Chromium
npm run preview
```

- [`docs/P7_RESULTS.md`](docs/P7_RESULTS.md) — generated counts and restrictions.
- [`artifacts/p7-sensitivity.json`](artifacts/p7-sensitivity.json) and [`artifacts/p7-sensitivity.csv`](artifacts/p7-sensitivity.csv) — all 288 cases, source/input hashes in JSON.
- [`docs/P7_STUDY_PROCEDURE.md`](docs/P7_STUDY_PROCEDURE.md) — **unlaunched** two-arm learning pilot materials; `dist/study-static.html` vs `dist/study-interactive.html` use the same five questions. No participants are fabricated or auto-recorded.

**Notion archive:** [Anatomy P1–P7](https://app.notion.com/p/3f734a28189a81699161dd858772aed5). Original local Hermes WSL worktree remains separate and untouched.


## P8 | Rank-invariance robustness and portable Evidence-first Anatomy Skill

P8's [public design lock](docs/P8_DESIGN_LOCK.md) was committed as `df2dbc3ed06c320e1c0ed7693f6cd0e4f96cdede` **before its new results were generated**. It tests 864 correlated synthetic paired searches: 3 sizes × 4 seeds × 3 strictly increasing value-spacing maps × 4 insertion orders × 6 query probes. The spacing maps are intentional **rank-preserving negative controls**, not independent workload samples. In this implementation, 288/288 rank-equivalent groups have identical node-visit and comparison metrics; query-order and insertion-order composition can change the observed tradeoff rate. These are descriptive proportions on a finite generated grid, not empirical performance estimates.

```bash
npm test                  # B-tree + independent oracle + P7/P8 regression tests
npm run analysis:p8       # deterministic JSON/CSV + generated result report
npm run check:skill       # verify skill package and reference project files
npm run build             # self-contained HTML for offline exploration
npm run preview           # local webpage (port indicated by server)
```

The UI has a P8 panel with a query mix selector, insertion-order comparison and 3 rank-preserving key-spacing variants. All data is generated from the actual JS B-tree implementation. The output is also in `artifacts/p8-robustness.json` and `.csv`, with a SHA-256 digest of the canonical payload for repeatability. Neither the UI score nor any key comparison counts are wall-clock latency or I/O.

### Portable Skill — packaged but not globally installed

`skills/evidence-first-anatomy/SKILL.md` contains a cross-agent Agent Skills-formatted procedure: primary sources → explicit model assumptions → deterministic algorithm → physical analogy → evidence links → independent semantic / browser test → provenance receipt. Supporting references, structural checker and *unexecuted evaluation scenarios* are included. A file structure check is not a Hermes/OpenClaw runtime integration test.

For **Hermes**, the [documented project-local skill folders](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) are `<git-project>/.agents/skills` or `.hermes/skills`; copy the skill folder there in a separate checkout, then follow the Hermes project-trust prompt before running. For **OpenClaw**, use the configured workspace skills folder and inspect actual CLI loading in your own profile. This repository **does not install or trust** either runtime automatically, to preserve local agent configuration.

The [historical mechanical-object gate](docs/P8_HISTORICAL_OBJECT_GATE.md) is currently only a source-validation checklist, NOT a reconstruction of a named waterwheel or site. No human learning data have been collected. Existing P7 study previews remain unused test materials.

## P9 · Documentary Jiégāo (桔槔) / Agent portability canary

Run `npm run build` and open `dist/jiegao.html` to inspect a source-linked, interactive **teaching schematic** of a counterweight water-lifter. The texts in [《庄子·天地》](https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel) and [《王祯农书》卷十八](https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890) support the general up/down counterweight principle, **not exact historical geometry or measured efficiency**. All lengths/masses in the figure are invented demonstration parameters. See [evidence dossier](docs/P9_HISTORICAL_JIEGAO.md) and [agent eval gate](docs/P9_AGENT_EVAL.md).

`npm test` includes torque, documentary IDs and uncertainty checks; `npm run test:browser:p9` checks the actual standalone HTML in desktop and mobile Chromium (requires Playwright/Chromium). Agent runtime loading must be tested separately; copying a Skill directory does not prove either Hermes or OpenClaw actually invoked it.


## P10 | Historical source atlas and Agent canary

Run `npm run build` and open `dist/source-atlas.html` to review 7 source records, **zero verified original folios**. Run `npm run export:source-atlas` for structured evidence. See [P10 source research](docs/P10_SOURCE_AUDIT.md) and [runtime gates](docs/P10_RUNTIME_GATE.md). Hermes temporary profile discovery passed, but actual prompt timed out; OpenClaw inventory also timed out. These are not completed cross-Agent benchmarks.
