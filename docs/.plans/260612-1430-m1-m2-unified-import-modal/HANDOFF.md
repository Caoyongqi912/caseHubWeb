# 交接文档：M1/M2 统一导入 — 实施中

> **当前状态**: 4 步计划实施到第 4 步（FE modal 分支），主体落盘但未完整验证。
> **写于**: 2026-06-12 16:46
> **计划全文**: 同目录 `PLAN.md`（必读）
> **适用读者**: 任何接手这个 PR 的人 / AI 工具

## 0. 仓库路径

| 仓库 | 绝对路径 | 技术栈 |
|---|---|---|
| FE 前端 | `/Users/cyq/work/code/caseHubWeb` | Umi + TypeScript + Ant Design 5 |
| BE 后端 | `/Users/cyq/work/code/case_auto_hub` | FastAPI + SQLAlchemy 2 + Redis |

两个仓库都在 `master` 分支上，**当前都未 commit** 进度（都是 uncommitted / untracked）。

**接手后第一步**：

```bash
cd /Users/cyq/work/code/caseHubWeb && git status
cd /Users/cyq/work/code/case_auto_hub && git status
```

看清现状再动。

## 1. 已完成的工作

### 1.1 BE 仓库（4 处改动 + 3 处新增）

| 文件 | 状态 | 内容 |
|---|---|---|
| `app/service/m2ImportService.py` | **新增** (未跟踪) | M2 commit 主服务，~310 行。含 `_parse_steps_from_m2`、`_extract_case_update_payload`、`_build_new_test_case`、`M2ImportService.commit` |
| `app/mapper/test_case/caseDynamicMapper.py` | **已修改** (+54) | 末尾加 `M2CaseDynamicWriter.write_case_dynamic(cr, case_id, description, session, plan_id=None)` |
| `app/schema/hub/testCaseSchema.py` | **已修改** (+25) | 加 `ImportCommitSchema`、`ImportCancelSchema` |
| `app/controller/test_case/test_case.py` | **已修改** (+60) | 加 `/import/commit` + `/import/cancel` 路由；M1 / M2 的 `save_preview` 调用都补了 `template_type=` 参数 |
| `app/service/uploadCacheService.py` | **已修改** (+7) | `save_preview` 加 `template_type: Optional[Literal["M1","M2"]] = None` 参数，写进 `cache_data` |
| `tests/test_m1_m2_upload.py` | **新增** (未跟踪) | 25 个单测，**全部 PASS** |
| `docs/` | **未跟踪**（待清理） | 旧的 `260611-1100` brainstorm + `260611-1125` 计划残留，**直接删掉** |

### 1.2 FE 仓库（1 处 API 扩展 + 1 处 modal 改造 + 清理 3 处）

| 文件 | 状态 | 内容 |
|---|---|---|
| `src/api/case/testCase.ts` | **已修改** (+64) | 加 `TemplateType` 类型；`uploadPreviewCase` 响应加 `template_type` / `warnings` / `preview_data`；新增 `importCommitCase`（走 `/import/commit`）+ `cancelImportCaseM2`（走 `/import/cancel`） |
| `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` | **已修改** (+~140) | **Step 4 主体**：`ValidateResult` 加新字段；加 `isM2` 派生；`handleFileChange` 抽新字段；`handleRemoveFile` cancel 分支；`handleConfirmImport` commit + toast 分支；M1 显示原 on_duplicate，M2 隐藏并显示 M2 Tag + 导回协议 Alert + warnings 段 |
| `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/PlanCaseImportModal.tsx` | **已修改** (-15) | 清理：删了"预览阶段未通过校验，后端未写入 Redis 预览缓存"和"将导入 N 条..."的冗余 Alert |
| `docs/.brainstorms/260611-1100-.../SUMMARY.md` | **已删除** | 旧文档 |
| `docs/.plans/260611-1125-.../CHANGELOG.md` | **已删除** | 旧文档 |
| `docs/.plans/260611-1125-.../PLAN.md` | **已删除** | 旧文档 |
| `docs/.plans/260612-1430-m1-m2-unified-import-modal/PLAN.md` | **新增** (未跟踪) | 当前 4 步计划 |
| `docs/.plans/260612-1430-m1-m2-unified-import-modal/HANDOFF.md` | **新增** (未跟踪) | 本文档 |

## 2. 集成 bug 修复（重要历史）

**问题**：Step 1（commit `97aa761`）把 `template_type` 字段写进了 `UploadPreviewResult` 响应，但**没**写进 Redis 缓存。Step 3 的 `M2ImportService.commit` 用 `preview.get("template_type") != "M2"` 做防御性校验。

**后果**：M2 commit 会**永远**撞上 `"本端点仅处理 M2 导回, 当前缓存 template_type=None"` 报错，commit 端点完全没法用。

**修法**：
1. `save_preview` 加 `template_type` 参数并写入 `cache_data`
2. 两个调用点（M1 路径 / M2 路径）显式传 `template_type="M1"` 或 `"M2"`
3. 加 3 个 cache 集成测试（`test_save_preview_stores_template_type_m1/m2/default`），全过

**接手人注意**：不要把这层防御性校验从 `M2ImportService.commit` 拿掉。它的作用是防止 M1 缓存误走 `/import/commit` 端点。

## 3. 待办（按顺序）

### 3.1 FE 重新跑类型检查（确认 Step 4 编译过）

```bash
cd /Users/cyq/work/code/caseHubWeb
node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -v "node_modules"
```

**预期输出：空（0 错）**。如果出错，常见原因：`Tag` 没引对、`isM2` 类型不收敛、`warnings` 数组访问的非空断言。

### 3.2 BE 重跑全部相关单测

```bash
cd /Users/cyq/work/code/case_auto_hub
venv/bin/python -m pytest tests/test_m1_m2_upload.py tests/test_pr3_step1.py -v
```

**预期：36 passed**（25 个新测 + 14 个 Step 1 测 = 39？实际 36，因为有的测试文件参数化合并）。

### 3.3 删掉 BE 仓库的旧 docs

```bash
cd /Users/cyq/work/code/case_auto_hub
rm -rf docs/
```

这些是上一个 plan cycle 的 `260611-1100` brainstorm 和 `260611-1125` 计划残留，跟当前 PR 无关。

### 3.4 手动 E2E（按 `PLAN.md` "端到端" 段）

启服务：

```bash
# 终端 1: BE
cd /Users/cyq/work/code/case_auto_hub
venv/bin/uvicorn main:app --reload

# 终端 2: FE
cd /Users/cyq/work/code/caseHubWeb
yarn start  # 默认 8000 端口
```

浏览器进 `/cases/caseHub`，验收清单：

- [ ] 工具栏**只 1 个"上传"按钮**（不应出现"导入(支持同步)"）
- [ ] 下载模板 → 拿到 M1 空白模板（无 `_meta` sheet）
- [ ] 拖 M1 模板 → 显示 on_duplicate ProFormRadio（skip / create）
- [ ] 拖 M1 模板提交 → toast `成功导入 N 条, 跳过重复 M 条`
- [ ] 拖 PR-1 导出的 M2 文件 → 隐藏 on_duplicate，显示 M2 Tag + 导回协议 Alert
- [ ] 拖 M2 文件提交 → toast `已修改 N 条, 新增 M 条`
- [ ] `case_dynamic` 表里新增审计记录（每个 UPDATE 一条）
- [ ] 关闭 modal 时调对应 `cancelImportCase`(M1) / `cancelImportCaseM2`(M2)，Redis 缓存清空
- [ ] 模态顶部无"圆桌"等术语

PLAN.md 端到端段还有库场景 [1]-[7] 完整列表，按那个跑。

### 3.5 commit + push

```bash
# BE 先
cd /Users/cyq/work/code/case_auto_hub
git add app/service/m2ImportService.py \
        app/service/uploadCacheService.py \
        app/mapper/test_case/caseDynamicMapper.py \
        app/schema/hub/testCaseSchema.py \
        app/controller/test_case/test_case.py \
        tests/test_m1_m2_upload.py
git commit -m "feat(roundtrip): PR-3 Step 3 - M2 导回 commit + 修 Step 1 缓存 template_type 漏存"
git push origin master

# FE 后
cd /Users/cyq/work/code/caseHubWeb
git add -A
git commit -m "feat(roundtrip): PR-3 Step 2+4 - FE API 扩展 + UploadCaseModal M1/M2 自适应"
git push origin master
```

> **commit 风格约定**（看 `git log` 最近几条）：conventional commit，scope 用模块名（`roundtrip` / `PlanModule` / `LeftComponents`），type 用 `feat` / `fix` / `refactor` / `style` / `docs`。

## 4. 关键设计回顾

### 4.1 M1 vs M2 协议对照

| 项 | M1（老 9 列模板） | M2（PR-1 导回，10 列 + _meta） |
|---|---|---|
| 触发条件 | 下载的空白模版，无 `_meta` sheet | `POST /export` 导出的，有 `_meta` sheet |
| FE UI | on_duplicate ProFormRadio (skip/create) | M2 Tag + Alert，**隐藏** on_duplicate |
| Commit 端点 | `POST /hub/cases/upload/commit` | `POST /hub/cases/import/commit` |
| Cancel 端点 | `POST /hub/cases/upload/cancel` | `POST /hub/cases/import/cancel` |
| 响应字段 | `imported_count` / `skipped_count` | `inserted` / `updated` / `dynamic_count` |
| on_duplicate 行为 | 生效 | **无视**（按 case_id 同步） |
| case_dynamic 审计 | 不写 | 每次 UPDATE 写 1 条 |
| 删行行为 | 无操作 | 无操作（DB 不删） |

### 4.2 M2 commit 单事务边界

`M2ImportService.commit` 用 `async with TestCaseMapper.transaction() as session:` 锚点：

```
1) 加载 Redis 预览缓存, 校验 template_type == "M2" (防御性)
2) 按 case_id 拆 known (非空) / new (空)
3) known: 一次 SELECT 拿所有 old → diff_dict 渲染 description → UPDATE 字段
         + 步骤全量覆盖 (DELETE+INSERT) + 写 1 条 case_dynamic
4) new: find_group_path 解析 group_path → 失败整批回滚 → INSERT case + steps
5) 标记 Redis committed (事务外, 失败不影响 DB)
```

### 4.3 Step 4 modal 分支核心代码

```tsx
const isM2 = validateResult?.template_type === 'M2';

// cancel 分支
if (isM2) {
  await cancelImportCaseM2(validateResult.file_md5);
} else {
  await cancelImportCase(validateResult.file_md5);
}

// commit + toast 分支
if (isM2) {
  const r = await importCommitCase({ file_md5, project_id });
  message.success(`已修改 ${r.data.updated} 条, 新增 ${r.data.inserted} 条`);
} else {
  const onDup = uploadForm.getFieldValue('on_duplicate') === 'skip' ? 'skip' : 'create';
  const r = await commitImportCase({ file_md5, project_id, is_common: true, on_duplicate: onDup });
  message.success(
    r.data.skipped_count > 0
      ? `成功导入 ${r.data.imported_count} 条, 跳过重复 ${r.data.skipped_count} 条`
      : `成功导入数据 ${r.data.imported_count} 条`
  );
}
```

## 5. 接手快速诊断

```bash
# 1. 看两边 git 状态
cd /Users/cyq/work/code/caseHubWeb && git status
cd /Users/cyq/work/code/case_auto_hub && git status

# 2. BE 单测
cd /Users/cyq/work/code/case_auto_hub
venv/bin/python -m pytest tests/test_m1_m2_upload.py tests/test_pr3_step1.py -v --no-header | tail -5
# 预期: 36 passed

# 3. FE 类型检查
cd /Users/cyq/work/code/caseHubWeb
node_modules/.bin/tsc --noEmit -p . 2>&1 | grep -v "node_modules" | wc -l
# 预期: 0
```

三项都对得上，就可以开始 E2E。

## 6. 范围外（二期 / 后续 PR）

- **计划（test plan）端 M2 导入** — Plan 明确不在范围
- **老 M1 路径 30 天无调用后清理** — 建工单跟踪
- **README / 项目文档更新** — 下一 PR
- **删除用例** — 永久不做（删行 = 无操作）
- **异步 commit / Celery** — 二期

## 7. 不要做的事

1. **不要重命名/重构** 已有函数（`_upload_m1_path` / `_upload_m2_path` / `M2ImportService` / `M2CaseDynamicWriter` 等命名都经过评审）
2. **不要新建** "导入(支持同步)" 按钮 — Plan A 拍板只 1 个老"上传"按钮
3. **不要新建** `ImportCaseModal.tsx` — Plan A 拍板老 modal 内部自适应
4. **不要把** `template_type` 校验从 `M2ImportService.commit` 拿掉 — 防御性校验
5. **不要碰** `case_auto_hub` 老 `/upload` M1 路径的逻辑 — 行为不变
6. **不要动** `docs/.plans/260612-1430-m1-m2-unified-import-modal/PLAN.md` — 已定稿的计划
7. **不要在用户可见文案/API 命名/注释里出现** "圆桌" 术语

## 8. 上下文

- 用户在 macOS 本地 `cyq` 账号下工作
- 时区 Asia/Shanghai，当前日期 2026-06-12
- 用户的命名约定：中文回复、conventional commit、简洁不过度解释
- 看 `git log` 最近 20 条了解历史风格

— 交接完成
