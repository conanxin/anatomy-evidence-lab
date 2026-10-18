# P12｜Hermes 基线诊断：已证明基础模型可返回

日期：2026-10-19，北京时间；WSL Hermes v0.21.3，独立临时 `HERMES_HOME`，不修改真实用户的全局 Skill 配置、不动原本地脏工作树。

## 先纠正命令测试误差

首次最短问答用了 `hermes --skills none -z ...`，退出码 1，0 标准输出、48 字节 stderr。后来发现 `--skills none` 不一定是 CLI 认可的“禁用 Skill”语法，因此**不能**将这个测试称为 provider 失败。

修订后使用**空临时 `skills` 目录，命令不含任何 `--skills` 参数**，保留同一临时配置中的 provider 凭据读取能力，执行：

```bash
hermes --in /home/conanxin/projects/anatomy-p10-runtime-canary -z 'Respond ONLY READY.'
```

**真实 WSL 回执**（来自 Remote Desktop Commander 读回的 `anatomy_p12_provider_baseline_v2_result.txt`）：

```text
Hermes Agent v0.21.3
BASE_EXIT=0
OUT_BYTES=6
ERR_BYTES=0
STDOUT=READY
wall_clock=41.399s
```

结论：**短问答的当前 primary provider 至少有一次成功返回**。它不能保证所有长问答在 100秒以内完成，亦不能证明某 Skill 被加载。本轮无 Skill baseline 与此前的显式 Skill 超时互不抵消，后者仍需独立回执。

## 真实 Skill 回执（以实际结果为准）

P10 隔离 profile 中 `evidence-first-anatomy` 发现为 `local/enabled`；100 秒真实 Prompt 超时。P12 已对相同独立克隆再发起显式 Skill prompt，并在新的 135 秒窗口中限制运行：结论应由 `anatomy_p12_real_skill_result.txt` 中实际 `SKILL_EXIT`、输出长度、四类证据标记及两项测试判断。**在未取得日志之前，状态为 `PENDING`，不预先标 PASS。**

本项目附带 `scripts/p12_hermes_provider_canary.sh`，可复现“短问答基线→仅在基线成功后显式 Skill 问答”的门槛流程。CI 只做脚本语法检查，不调用私人模型或冒用真实运行时证明。

## OpenClaw 独立阻断

P10 隔离 `OPENCLAW_STATE_DIR` 运行时 `skills list --json` 60 秒 timeout=124，stderr 曾打印 `slow SQLite transaction hold`，Node v24.20.0。并未证明是模型服务、数据库锁、实际 Skill 还是 agent gateway 的单一根因；本阶段不重启或删除数据库文件。

验收层次：`HERMES_BASELINE_PROVIDER=PASS` / `HERMES_EXPLICIT_SKILL=SEPARATE_GATE` / `OPENCLAW_SKILL=UNVERIFIED`。

## P12 已完成的显式 Skill Agent 轮次（后补回执，2026-10-19 01:09）

WSL 同一隔离 clone 仍处于 P10 已提交 SHA `d4d881742dab2ba7d9e1f95536523c9c31896037`；加载的是**P10 Skill**，**尚非本阶段修改后的 Source-fidelity 规则**。在新临时 Hermes profile 内复制 Skill 到 `skills/evidence-first-anatomy`，
`hermes skills list --source local` 返回目标项（计数1），然后执行：

```bash
hermes --in /home/conanxin/projects/anatomy-p10-runtime-canary \
  --skills evidence-first-anatomy -z 'Use the evidence-first-anatomy skill for generic traditional 桔槔 ...'
```

远程回读的真实运行指标：

```text
START=2026-10-19T01:09:27+08:00
SKILL_DISCOVERY=1
SKILL_EXIT=0
SECONDS=29
OUTPUT_BYTES=1422
ERROR_BYTES=0
```

**结论 A（已经成立）**：`SKILL_DISCOVERY=PASS`；显式指定 Skill 后模型产生了真实回答，`AGENT_RESPONSE=PASS`（不等于 source compliance）；相同账号的无自定义 Skill 基线也已返回 READY。此前“模型本身不可用”的总括判断不成立。

**结论 B（重要反例）**：回答虽然出现 DOCUMENTED、INFERRED、ILLUSTRATIVE、UNKNOWN 和两项测试，但具体**历史文字有不忠实改写的现象**，例如模型凭记忆拼接了《庄子》人物行为、又为王祯卷十八增补了未在核查转录中出现的前后重量说法。第一项“3:1 力臂比例即提水体积 3×”的定量断言无合理前提；水量受到桶容量、行程、载荷和损耗制约，不能从力臂比直接推出。该轮终端只打印前 1200/1422 字节，因此第二项物理测试也不按完整证据进行审核。

**分门槛评估**：

| Gate | P12 observed |
|---|---|
| HERMES_BASELINE_NO_CUSTOM_SKILL | PASS (READY, 41.399s) |
| HERMES_EXPLICIT_SKILL_DISCOVERY | PASS |
| HERMES_EXPLICIT_AGENT_RESPONSE | PASS (exit 0, 29s, stdout 1422B) |
| FOUR_LABELS_PRESENT | PASS (visible portion) |
| ORIGINAL_DIMENSIONS_MARKED_UNKNOWN | PASS (visible portion) |
| EXACT_QUOTES_MATCH_LINKED_EDITIONS | FAIL / unaudited fabricated paraphrases |
| TORQUE_VOLUME_TEST_VALID | FAIL (3:1 volume inference unsupported) |
| FULL_SECOND_TEST | NOT_REVIEWABLE (log preview truncated) |
| OVERALL_SOURCE_FIDELITY | **FAIL / NOT_ACCEPTED** |

本阶段据此修改的 Skill 规则放入 `references/source-fidelity.md`，加入引用溯源和物理模型测试规范，以及一个待运行的 prompt-eval 反例。**更新后的 Skill 仅经过结构/静态测试，不能借 P10 旧 Skill 的真实回答宣称它已通过新 Agent 评测。**

OpenClaw 仍保持 P10 `TIMEOUT / SQLITE_SLOW_TRANSACTION_HINT`，未做可能扰动用户正在使用的 gateway 的修复。
