# P11｜Hermes / OpenClaw 运行门槛及受限诊断（2026-10-18）

## 已知历史回执与实际情况

**P10已核验：** Hermes 在**隔离临时 profile**能够枚举 `evidence-first-anatomy` 为 `local / enabled`，但在限定100秒内执行真实桔槔问答退出 124，未产生回答。因此 `DISCOVERY=PASS`，`ANSWER=TIMEOUT`，`COMPLIANCE=UNVERIFIED`。此结果不会自动证明 provider 不可用；模型链路、代理、账户额度、工具初始化或其它步骤都可能导致等待。

**P10已核验：** OpenClaw 在隔离 workspace + Node v24.20.0 下 `skills list --json` 超时，曾出现 `slow SQLite transaction hold` 提示，但此提示不足以证明 SQLite 真的被哪个进程永久锁住；未执行更改数据库、删除 WAL、重启 gateway 的修复。

**P11 本轮尝试：** 已针对**相同隔离工作目录**向远程桌面发起带超时的 `Hermes no-skill` 基线脚本，并计划在基线有成功 READY 回答之后才执行 explicit skill 任务。调用没有收到确认执行的可信输出，本地远程设备随后显示离线。**因此不能断言该基线脚本已经运行，更不能报告 exit code 或推测 provider 根因。**

## 控制实验：现在准备但尚未执行的脚本

`bash scripts/p11_agent_runtime_canary.sh`：在个人电脑恢复连接后，可由用户或获授权的本地 Agent 在隔离 clone 中启动。逻辑是**最小无 Skill 问答 →（仅无 Skill 成功才）显式 Skill 问答**。限定总等待时间、记录结果代码、将错误标签与执行时间分开；不修改全局 Hermes profile 或 Project trust，也不启动/重启 OpenClaw gateway。该脚本不会自行在后台运行。

必须区分四个 Gate：

1. `FILE_PRESENT`：在项目 `.agents/skills/` 或隔离 profile 中找到 `SKILL.md`。
2. `DISCOVERY_PASS`：Hermes CLI 真正列出指定 Skill。
3. `BASELINE_PROVIDER_PASS`：同样配置条件下一个无 Skill 的模型短问答成功返回 READY。
4. `SKILL_PROMPT_PASS`：真实问答成功返回，并逐项满足来源标识、原叶未知、四档证据等级与两项可证伪测试。

如果没有第3项，不把第4项的失败归因于 Skill。不把“模型答了内容类似”当作加载证据；还要保存 preloaded skill 清单或明确调用的来源位置。

OpenClaw 先做只读检查：记录 Node 版本、隔离配置路径、命令实际 exit、SQLite 慢事务提示和进程状态；不要推断通用兼容失败。若 Node CLI 本身在 20–60秒超时，则 `SKILL_DISCOVERY=UNVERIFIED`，不得进一步向 live gateway 注入。

## 本阶段状态

```text
HERMES_ISOLATED_DISCOVERY=PASS_FROM_P10
HERMES_NO_SKILL_BASELINE=NOT_VERIFIED_P11_DEVICE_OFFLINE
HERMES_SKILL_ANSWER=TIMEOUT_124_FROM_P10
HERMES_PROCEDURE_EVAL=UNTESTED
OPENCLAW_DISCOVERY=TIMEOUT_124_FROM_P10
OPENCLAW_SQLITE_ROOT_CAUSE=UNKNOWN
OPENCLAW_AGENT_ANSWER=UNTESTED
GLOBAL_AGENT_CONFIG_CHANGED=NO_EVIDENCE_OF_CHANGE
ORIGINAL_LOCAL_HERMES_WORKTREE=NOT_MODIFIED_BY_P11
```

**验收边界：** GitHub Node/Chromium CI 只对文档/模型代码提供证据，不包含用户电脑的实际 Hermes/OpenClaw 推理。两项不能合并报告。
