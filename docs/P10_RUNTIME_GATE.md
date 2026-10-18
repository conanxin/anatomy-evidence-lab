# P10 独立运行时实测（2026-10-18）
基线 PR #2 `d4d881742dab2ba7d9e1f95536523c9c31896037`，原本地 Hermes 脏工作树保持不动。
- 本地 Hermes Agent v0.21.3：未受信任项目的 `hermes skills list --source local` 没列出目标。独立建立临时 HERMES_HOME，复制目标 Skill 至临时 profile 的 skills 目录，复测出现 **evidence-first-anatomy | local | local | enabled**，退出码0。这验证的是**隔离 profile 的 Skill 索引发现**，不证明原 profile 已加载。
- 在上述隔离配置下，以 `--skills evidence-first-anatomy -z` 提交桔槔来源与UNKNOWN、两项测试的固定问答，100秒超时退出124，**没有可验收的模型回答**。因此激活后的操作行为/遵守规范=UNVERIFIED。
- OpenClaw v2026.9.4，Node v24.20.0：独立 OPENCLAW_STATE_DIR/CONFIG_PATH/WORKSPACE_DIR 中放入合法 skills/evidence-first-anatomy/SKILL.md，执行 `openclaw skills list --json` 60秒超时124、stdout 0字节，stderr 包含 `slow SQLite transaction hold`；慢事务提示不是根因的证明。未执行真实 OpenClaw Agent 问答。
- **互不混淆的门槛**：文件存在≠CLI发现≠Agent回答≠规则遵守。Hermes隔离发现PASS；Hermes问答TIMEOUT；OpenClaw发现TIMEOUT；两者行为符合性NOT_EVALUATED。
- 临时 Hermes profile和密钥环境链接在测试后清理；不重启活跃网关、不修改全局信任、不分享密钥。
下一步最小诊断：先证实实际 Hermes provider/gateway能答复单词，再跑 Skill 固定Prompt；OpenClaw先定位隔离状态的 SQLite 慢事务/网关连接与超时位置，不对活跃实例进行数据库修复。
