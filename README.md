# Anatomy Evidence Lab / 可探索知识机械

[English](#english) · [中文](#中文) · [Research notes](docs/PROVENANCE.md)

![CI](https://github.com/conanxin/anatomy-evidence-lab/actions/workflows/test.yml/badge.svg)

An **evidence-first B-tree archive machine**: a real, deterministic multiway search tree powers a filing-cabinet SVG explanation. Every drawer highlight, key comparison, and bilingual status line is derived from the same structured algorithm trace. A small research POC inspired by [Anatomy](https://github.com/wheresryan22/anatomy), not a rebranded copy of the original figure library.

## 中文

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
src/app.js          Accessible controls and SVG renderer
scripts/build.mjs   Static packaging into dist/
scripts/serve.mjs   Local-only static preview server
tests/*.test.mjs    Deterministic model, view and provenance graph tests
scripts/browser_smoke.py  Playwright + Chromium smoke test (also CI)
docs/PROVENANCE.md  Source pin, assumptions and evidentiary boundaries
docs/RUN_RECEIPT.md  Verified results and untested boundaries
docs/LOCAL_HERMES_HANDOFF.md  Command for resuming on local Hermes
```

**Publication gate:** a passing unit suite proves only the coded invariants, not a scientific or historical truth claim. The visual/browser gate and source trace must also be reviewed before claiming a complete interactive explanation.

## P4 / Evidence graph (English)

The new **Evidence Graph** panel attaches each trace event to a typed claim, primary source, declared assumptions, executable model code, visual mapping and reproducible tests. Click a drawer, card or rail to inspect its mapping; a dedicated control returns to the live search trace. This is an auditable *teaching model*, not a claim that a real database has been reverse engineered. The provenance graph is intentionally a small custom schema rather than a W3C PROV-O implementation. Details: [docs/EVIDENCE_GRAPH.md](docs/EVIDENCE_GRAPH.md).
