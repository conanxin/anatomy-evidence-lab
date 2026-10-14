# Local Hermes handoff / 本地继续指令

Previous local task `CONANXIN_ANATOMY_POC_01_LOCAL_HERMES` was dispatched in WSL on 2026-10-12. The WSL worktree was at `/home/conanxin/projects/anatomy-evidence-lab`. A separate fallback implementation was authored and uploaded to a GitHub PR on 2026-10-15 when the remote device was not responding.

When local remote access returns, compare the previous unpublished worktree with this PR **without overwriting either version**. Recommended command (run in the WSL shell):

```bash
hermes --in /home/conanxin/projects/anatomy-evidence-lab -z 'TASK_ID=CONANXIN_ANATOMY_RECONCILE_P3. Read docs/LOCAL_HERMES_HANDOFF.md and GitHub PR in conanxin/anatomy-evidence-lab. Compare any local uncommitted Oct 12 prototype against the published branch; DO NOT reset, checkout or overwrite local uncommitted files. Produce a comparison of algorithms, tests and visual quality. If beneficial, use a NEW independent worktree to cherry-pick carefully and open a separate PR. Keep source/provenance notes, run npm test and npm run build, and report the real results. No changes to BOOK-ID-SEARCH or personal website.'
```

**Do not run the command from this file as part of CI.** It is an operator handoff, not automatic executable instruction. Local results require a fresh receipt.
