# Handoff: M1/M2 统一导入 — 接力给下一个 AI

> **会话状态**: 上一个会话（ID `019eb5f2-4e38-74d2-b8a4-116f1371a40a`）挂了。
> **当前位置**: 4 步实施中的 Step 4 (FE modal M1/M2 分支) 已落盘但未校验。
> **接手时间**: 2026-06-12 16:30

## 0. 关键路径 / 仓库

| 仓库 | 路径 | 角色 |
|---|---|---|
| FE 前端 | `/Users/cyq/work/code/caseHubWeb` | Umi + TS, 跑 `yarn start` 启 8000 |
| BE 后端 | `/Users/cyq/work/code/case_auto_hub` | FastAPI, 跑 `venv/bin/python` + uvicorn |
| 计划文档 | `docs/.plans/260612-1430-m1-m2-unified-import-modal/PLAN.md` | 4 步全流程, 必读 |
| 本文档 | `docs/.plans/260612-1430-m1-m2-unified-import-modal/HANDOFF.md` | 你正在看 |

> 两个仓库**都未 commit**当前进度, 都是 uncommitted / untracked 状态。
> **接手后第一件事**: 用 `git status` 看清现状, 别瞎动已改文件。

## 1. 已经干了什么

### 1.1 BE 仓库 `case_auto_hub` (4 处改动, 3 处新增)

| 文件 | 状态 | 改了啥 |
|---|---|---|
| `app/service/m2ImportService.py` | **新增 (未跟踪)** | M2 commit 主服务, ~310 行, 含 `_parse_steps_from_m2` / `_extract_case_update_payload` / `_build_new_test_case` / `M2ImportService.commit` |
| `app/mapper/test_case/caseDynamicMapper.py` | **已修改 (+54)** | 末尾加 `M2CaseDynamicWriter.write_case_dynamic(cr, case_id, description, session, plan_id=None)` |
| `app/schema/hub/testCaseSchema.py` | **已修改 (+25)** | 加 `ImportCommitSchema` / `ImportCancelSchema` |
| `app/controller/test_case/test_case.py` | **已修改 (+60, 修集成 bug)** | 加 `/import/commit` + `/import/cancel` 路由; **关键**: M1 和 M2 的 `save_preview` 调用都补了 `template_type=` 参数 |
| `app/service/uploadCacheService.py` | **已修改 (+7, 修集成 bug)** | `save_preview` 加 `template_type: Optional[Literal["M1","M2"]] = None` 参数, 写进 `cache_data` |
| `tests/test_m1_m2_upload.py` | **新增 (未跟踪)** | 25 个单测, 全部 PASS |
| `docs/` | **未跟踪 (待清理)** | 旧 `260611-1100` brainstorm + `260611-1125` 计划残留, **建议直接删除** |

**集成 bug 修复史 (重要!)**:
- Step 1 (commit `97aa761`) 把 `template_type` 写进了 `UploadPreviewResult` 响应, 但**没**写进 Redis 缓存。
- Step 3 的 `M2ImportService.commit` 用 `preview.get("template_type") != "M2"` 做防御性校验。
- 结果: M2 commit 会**永远**撞上 `"本端点仅处理 M2 导回, 当前缓存 template_type=None"` 报错。
- 修法: `save_preview` 收 `template_type` 参数, 写进 cache; 两个调用点 (M1 / M2) 显式传。
- 验证: 新增 3 个 cache 集成测试 (`test_save_preview_stores_template_type_m1/m2/default`), 全过。

**BE 全部单测**: `venv/bin/python -m pytest tests/test_m1_m2_upload.py tests/test_pr3_step1.py -v`
→ **36 passed, 5 warnings** (只 0.99s)

### 1.2 FE 仓库 `caseHubWeb` (1 处新增 API, 1 处改 modal, 清理 3 处)

| 文件 | 状态 | 改了啥 |
|---|---|---|
| `src/api/case/testCase.ts` | **已修改 (+64)** | 加 `TemplateType` 类型, `uploadPreviewCase` 响应加 `template_type` / `warnings` / `preview_data`; 新增 `importCommitCase` (走 `/import/commit`) + `cancelImportCaseM2` (走 `/import/cancel`) |
| `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` | **已修改 (+~140)** | **Step 4 主体**: import 加 `importCommitCase`/`cancelImportCaseM2`/`Tag`; `ValidateResult` 加 `template_type`/`warnings`/`preview_data`; 加 `isM2` 派生; `handleFileChange` 抽新字段; `handleRemoveFile` cancel 分支; `handleConfirmImport` commit + toast 分支; M1 显示原 on_duplicate, M2 隐藏并显示 M2 Tag + 导回协议 Alert + warnings 段 |
| `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/PlanCaseImportModal.tsx` | **已修改 (-15)** | 清理: 删了"预览阶段未通过校验, 后端未写入 Redis 预览缓存"以及"将导入 N 条..."的冗余 Alert |
| `docs/.brainstorms/260611-1100-.../SUMMARY.md` | **已删除** | 旧文档 |
| `docs/.plans/260611-1125-.../CHANGELOG.md` | **已删除** | 旧文档 |
| `docs/.plans/260611-1125-.../PLAN.md` | **已删除** | 旧文档 |
| `docs/.plans/260612-1430-m1-m2-unified-import-modal/PLAN.md` | **新增 (未跟踪)** | 当前 4 步计划 |
| `docs/.plans/260612-1430-m1-m2-unified-import-modal/HANDOFF.md` | **新增 (未跟踪)** | 你正在看这个 |

**FE tsc 校验**: `node_modules/.bin/tsc --noEmit -p .`
→ 过滤 `node_modules` 后 **0 错** (Step 2 时验证过; **Step 4 改完没重跑**, 见下一步)

## 2. 接下来要干什么 (按顺序)

### 第 1 件事: 校验 FE Step 4 编译

```bash
cd /Users/cyq/work/code/caseHubWeb
node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -v "node_modules"
```

预期: **0 错**。如果出错, 80% 是 modal 里类型注解或 `Tag` 没引对。

### 第 2 件事: 重跑 BE 测试确认仍过

```bash
cd /Users/cyq/work/code/case_auto_hub
venv/bin/python -m pytest tests/test_m1_m2_upload.py tests/test_pr3_step1.py -v
```

预期: **36 passed**。

### 第 3 件事 (重要): 删掉两边未跟踪的旧 docs

```bash
# FE 仓库
cd /Users/cyq/work/code/caseHubWeb
git status  # docs/.brainstorms/... 和 docs/.plans/260611-.../ 应该已经在 deleted 状态 (已删)
# 实际是已删, git 状态会显示 "deleted: ...". 不用动, 等 commit 时一起 stage.

# BE 仓库
cd /Users/cyq/work/code/case_auto_hub
ls docs/  # 这里有 docs/.brainstorms/260611-1100-... 和 docs/.plans/260611-1125-.../
# 这俩是旧 plan + brainstorm, 跟当前 PR 无关, 直接 rm 掉
rm -rf docs/
```

### 第 4 件事: 手动 E2E (Plan 验收清单)

按 `PLAN.md` 的 "端到端" 段 (库场景 [1]-[7]) 跑:
- 启 BE: `cd /Users/cyq/work/code/case_auto_hub && venv/bin/uvicorn main:app --reload`
- 启 FE: `cd /Users/cyq/work/code/caseHubWeb && yarn start`
- 进 `/cases/caseHub` 页
- 验收: 工具栏**只 1 个"上传"按钮** (不出现"导入(支持同步)")
- 拖 M1 模板 → 走 on_duplicate 老逻辑
- 拖 PR-1 导出的 M2 文件 → 显示 M2 Tag + 导回协议 Alert, 隐藏 on_duplicate
- M1 toast: "成功导入 N 条, 跳过重复 M 条"
- M2 toast: "已修改 N 条, 新增 M 条"

### 第 5 件事: commit + push

```bash
# BE 先
cd /Users/cyq/work/code/case_auto_hub
git add -A
git commit -m "feat(roundtrip): PR-3 Step 3 - M2 导回 commit + 修 Step 1 缓存 template_type 漏存"
git push origin master

# FE 后
cd /Users/cyq/work/code/caseHubWeb
git add -A
git commit -m "feat(roundtrip): PR-3 Step 2+4 - FE API 扩展 + UploadCaseModal M1/M2 自适应"
git push origin master
```

> 用户的命名约定: 看 `git log` 最近几条都是 `feat(roundtrip): ...` / `fix(roundtrip): ...` / `refactor(PlanModule): ...` 这种 conventional commit 格式。

## 3. 关键设计点回顾 (避免踩坑)

### M1 vs M2 协议

| 项 | M1 (老 9 列模板) | M2 (PR-1 导回, 10 列 + _meta) |
|---|---|---|
| 触发 | 下载的空白模版, 无 `_meta` sheet | `POST /export` 导出的, 有 `_meta` sheet |
| FE UI | on_duplicate ProFormRadio (skip/create) | M2 Tag + Alert, **隐藏** on_duplicate |
| Commit 端点 | `POST /hub/cases/upload/commit` | `POST /hub/cases/import/commit` |
| Cancel 端点 | `POST /hub/cases/upload/cancel` | `POST /hub/cases/import/cancel` |
| 响应字段 | `imported_count` / `skipped_count` | `inserted` / `updated` / `dynamic_count` |
| on_duplicate | 生效 | **无视** (按 case_id 同步) |
| case_dynamic 审计 | 不写 | 每次 UPDATE 写 1 条 |
| 删行 | 无操作 (M1 不带 case_id, 不存在) | 无操作 (DB 不删) |

### 单事务边界 (M2 commit)

`M2ImportService.commit` 用 `async with TestCaseMapper.transaction() as session:` 锚点。
- known (有 case_id): 一次 SELECT 拿所有 old, 逐 case UPDATE + DELETE+INSERT steps + INSERT case_dynamic
- new (无 case_id): 走 `find_group_path` 解析 group_path → 失败整批回滚 → INSERT case + steps
- 标记 Redis committed 在事务**外**, 失败不影响 DB 落库

### Step 4 modal 分支核心代码片段

```tsx
const isM2 = validateResult?.template_type === 'M2';

// cancel 分支
if (isM2) {
  await cancelImportCaseM2(validateResult.file_md5);
} else {
  await cancelImportCase(validateResult.file_md5);
}

// commit 分支 + toast
if (isM2) {
  const r = await importCommitCase({ file_md5, project_id });
  message.success(`已修改 ${r.data.updated} 条, 新增 ${r.data.inserted} 条`);
} else {
  const r = await commitImportCase({ file_md5, project_id, is_common: true, on_duplicate });
  message.success(skippedCount > 0
    ? `成功导入 ${imported} 条, 跳过重复 ${skipped} 条`
    : `成功导入数据 ${imported} 条`);
}
```

## 4. 还没做的 (Plan 范围外 / 二期)

- **计划 (test plan) 端 M2 导入** — Plan 明确说不在范围, 留作下一 PR
- **老 M1 路径 30 天无调用后清理** — 建个工单跟踪, 不在本 PR 做
- **README / 项目文档更新** — Plan 列在"不在范围"
- **删除用例** — 永久不做
- **异步 commit / Celery** — 二期

## 5. 接手时的快速诊断

```bash
# 1. 看两边 git 状态
cd /Users/cyq/work/code/caseHubWeb && git status
cd /Users/cyq/work/code/case_auto_hub && git status

# 2. BE 单测 (应该 36 过)
cd /Users/cyq/work/code/case_auto_hub && venv/bin/python -m pytest tests/test_m1_m2_upload.py tests/test_pr3_step1.py -v --no-header | tail -5

# 3. FE 类型检查 (应该 0 错, 排除 node_modules)
cd /Users/cyq/work/code/caseHubWeb && node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -v "node_modules" | wc -l  # 应该是 0
```

如果以上都对得上, 就可以开始 E2E 了。

## 6. 不要做的事

1. **不要重命名/重构** 已有函数, 命名都是经过评审的 (`_upload_m1_path` / `_upload_m2_path` / `M2ImportService` / `M2CaseDynamicWriter` 等)
2. **不要新建** "导入(支持同步)" 按钮 — Plan A 拍板只 1 个老"上传"按钮
3. **不要新建** `ImportCaseModal.tsx` — Plan A 拍板老 modal 内部自适应
4. **不要把** `template_type` 校验从 `M2ImportService.commit` 拿掉 — 这是防御性, 防止 M1 缓存误走 /import/commit
5. **不要碰** `case_auto_hub` 老 `/upload` M1 路径逻辑, 行为不变
6. **不要动** `docs/.plans/260612-1430-m1-m2-unified-import-modal/PLAN.md`, 那是已经定稿的计划

## 7. 联系上下文

- 用户在 `cyq` 账号下工作
- 时区 Asia/Shanghai
- 当前日期 2026-06-12
- 用户偏好: 中文回复, conventional commit, 简洁不过度解释

— 接力完成, 下一个 AI 上场
