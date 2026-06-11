# Plan: 测试用例 导出-编辑-导回 回路(用例库 + 测试计划)

> Created: 2026-06-11 11:25
> Source: [brainstorm SUMMARY](/Users/cyq/work/code/caseHubWeb/docs/.brainstorms/260611-1100-test-case-export-import-roundtrip/SUMMARY.md)
> 状态: 待启动
> 范围: case_auto_hub (BE) + caseHubWeb (FE)
> 不在范围: 需求-用例回路(需求模块即将下线)

## Overview

把现在"下载空模板 + 全新增" 的单向导入,升级为"按当前列表导出 → Excel 编辑 → 导回时按行序改/增" 的完整回路。覆盖公共用例库与测试计划两个父级 scope,共用同一套后端解析 / 校验 / 提交链路与同一对前端 modal。**不删除任何用例、不查重、不导出 plan 关联字段**。计划场景下 `order` 按 Excel 显式落库。

## 架构要点

**后端**:在 `case_auto_hub` 现有 `test_case.py` 路由文件里**并列**新增 4 个端点,不动现有 `upload` / `upload/commit` / `upload/cancel`,新老链路共存到 v2 切换期结束。xlsx 生成复用 `AsyncFilesReader` 的解析反向(单元格映射表),步骤全量覆盖用 `(test_case_id, order)` upsert,排序复用现有 `bulk_reorder_plan_case` 的 `before_id / after_id` 锚点语义。

**前端**:在 `caseHubWeb` 收敛 `UploadCaseModal`(库) 和 `PlanCaseImportModal`(计划) 为一个 `ImportCaseModal`,新增 `ExportCaseModal`。两个 modal 都接受 `scope_type + scope_id + project_id` 三个 prop,UI 内部按 scope 切换文案/可选字段。两个 scope 的工具栏各加一个"导出" 按钮。

**数据契约**:3-Sheet xlsx = 主表(`用例数据`,14 列) + 可见 `编辑指引` + 隐藏 `_meta` (scope 校验位)。主表首列 `排序` 是显式 order,后端以它为准。

## 不在范围(从 SUMMARY 继承,再次强调)

- 任何形式的"删除"(删 case 本体 / 移除 plan 关联 / 缺失用例整组替换)
- `missing_action: keep | remove`(本设计无此参数)
- `on_duplicate: skip | create`(圆桌插入不查重)
- 计划关联字段(关联级 `is_review` / `first_status` / `second_status` / `bug_url`)进 Excel
- 异步导出 / 公式 / 宏 / 国际化 / 细粒度权限
- 需求-用例回路(下线路径)

## 任务分解

任务按"可独立 ship 的 PR" 切分。每个 PR 完成后,应能在不破坏现有功能的前提下合并。**所有 PR 都跑后端现有单测 + 前端 `umi-test`,不许出现回归**。

---

### PR-1: 后端 — 新增 `GET /api/hub/cases/export` 端点(只读,无破坏)

**目标**:在不修改任何现有逻辑的前提下,新增按 scope 导出 xlsx 的端点。完成后,前端可以 curl 拉文件下来。

**仓库**: `case_auto_hub`

**关键文件**:
- `app/controller/test_case/test_case.py` — 新增 `@router.get("/export")`
- `app/schema/hub/testCaseSchema.py` — 新增 `ExportCaseQuery` schema
- `app/service/exportCaseService.py`(**新**) — `openpyxl` 生成 xlsx,3 个 Sheet
- `app/mapper/test_case/testcaseMapper.py` — 新增 `query_cases_for_export(scope_type, scope_id, case_ids?, include_steps)` 拉数据
- `file/编辑指引.txt`(**新**) — 写入"编辑指引" Sheet 的固定文案(便于维护)
- `utils/aioFileReader.py` — **不修改**,只参照其 `case_to_dict` 字段映射反向

**端点契约**:
```
GET /api/hub/cases/export?scope_type=plan&scope_id=123
                  &case_ids=100,101
                  &include_steps=1
响应: FileResponse (xlsx)
文件名: 用例导出-{scope_type}{scope_id}-{YYYYMMDD-HHmmss}.xlsx
```

**`ExportCaseQuery` 字段**:
- `scope_type: Literal['library', 'plan']`
- `scope_id: int`
- `case_ids: Optional[List[int]]` (不传 = 全量)
- `include_steps: bool = True`

**实现要点**:
- 权限:沿用 `Authentication()`
- `scope_type=library` → 走 `module_id + project_id`,`is_common=true`,按 `create_time desc` 拉
- `scope_type=plan` → 走 `plan_case_association` 关联,按 `order asc` 拉
- `include_steps=True` 时,把 `case_sub_steps` 按 `order` 展开多行;否则一个用例只占一行(`步骤序号` 等列留空)
- `_meta` Sheet 隐藏;`编辑指引` Sheet 可见;主表冻结首行 + 首列加粗
- 子步骤来源:`TestCaseStep.to_dict()`(已有)

**验收**:
- [ ] 命中 5 条用例 / 2 个步骤的 fixture,导出的 xlsx 用 openpyxl 二次读取,数据 1:1 一致
- [ ] `_meta` 隐藏、scope_type/scope_id 正确
- [ ] `编辑指引` 可见,9 条规则一条不漏
- [ ] `排序` 列从 1..N 连续
- [ ] `case_ids=100,101` 过滤生效,只导出指定 case
- [ ] `include_steps=0` 时一个用例只占一行
- [ ] 单测:`test_export_xlsx_basic` / `test_export_xlsx_with_steps` / `test_export_xlsx_scope_check` 全过

**估算**: 0.5–1 人日

**风险**: openpyxl 大文件(>5k 行)内存 — 首版可接受,>10k 留二期异步。

---

### PR-2: 后端 — 升级 `POST /api/hub/cases/upload` 为 `POST /api/hub/cases/import/preview`(兼容老入口)

**目标**:在不破坏现有 `upload` 调用方的前提下,让 preview 端点支持 `scope` + `mode=mixed` + 解析 14 列结构 + 隐藏 `_meta` 校验。

**仓库**: `case_auto_hub`

**关键文件**:
- `app/controller/test_case/test_case.py` — 新增 `@router.post("/import/preview")`,**老 `/upload` 路由保留**(标 `@deprecated` 注释,留 1 个 deprecation 期)
- `app/schema/hub/testCaseSchema.py` — 新增 `ImportPreviewSchema`
- `app/service/uploadCacheService.py` — 扩展 `preview_data` 携带 `scope_type` / `scope_id` / `case_ids_at_export` / `Excel 中识别到的 case_id 集合`
- `utils/aioFileReader.py` — `async_read_excel_for_case` 加 `mode='mixed'` 分支,识别 `用例ID` 列,有 = update 候选,空 = insert 候选
- 解析器:把 14 列映射到 dict 字段;空 `用例ID` → `_meta.case_ids_at_export` 比对(警告,不阻断)

**`ImportPreviewSchema` 字段**:
- `file: UploadFile`
- `project_id: int`
- `scope_type: Literal['library', 'plan']`
- `scope_id: int`
- `mode: Literal['mixed', 'insert_only'] = 'mixed'`

**响应**(在现有 `upload` 响应基础上加 `scope_check`):
```json
{
  "file_md5": "...",
  "total_count": 50,
  "valid_count": 48,
  "invalid_count": 2,
  "can_commit": false,
  "errors": [...],
  "scope_check": {
    "scope_type_matches": true,
    "scope_id_matches": true,
    "case_ids_in_excel": 45,
    "case_ids_known": 45,
    "case_ids_new": 3,
    "case_ids_at_export_intersect_with_excel": 45,
    "case_ids_at_export_only_warning": false
  }
}
```

**实现要点**:
- `scope_type` / `scope_id` 与 `_meta` 不一致 → 整体拒绝(`can_commit: false`,errors 含原因)
- `_meta.version != 1` → 拒绝
- `_meta` 缺失 → 拒绝(老模板不能用)
- 解析阶段就把"`操作步骤` 与 `预期结果` 都为空" 标 warning(不阻断)
- "排序" 列跳号/重复 → warning(不阻断,后端 normalize)
- `mode='insert_only'` 时,所有 `用例ID` 非空的行 → error(可以上传但没法用 insert-only 模式)

**验收**:
- [ ] 现有 `/upload` 调用方零修改,功能不变
- [ ] 新 `/import/preview` 在以下场景返回正确:
  - scope_type/scope_id 不一致 → can_commit=false
  - 排序跳号 → can_commit=true + warning
  - mode=insert_only 时混入用例ID → can_commit=false
  - 14 列全空行 → invalid_count 准确
- [ ] 解析性能:500 行 Excel < 2s
- [ ] 单测:`test_import_preview_scope_check` / `test_import_preview_insert_only` / `test_import_preview_meta_missing` 全过

**估算**: 1 人日

**风险**: 老 `upload` 行为要 100% 保留 — 用同一份解析器共享代码 + 完整回归单测。

---

### PR-3: 后端 — 新增 `POST /api/hub/cases/import/commit`(update + 排序 + 步骤全量覆盖)

**目标**:实现 SUMMARY §3 的 10 步 commit 流程。完成后,完整的"导出 → 编辑 → 导回" 回路在后端跑通。

**仓库**: `case_auto_hub`

**关键文件**:
- `app/controller/test_case/test_case.py` — 新增 `@router.post("/import/commit")`
- `app/schema/hub/testCaseSchema.py` — 新增 `ImportCommitSchema`
- `app/service/uploadCacheService.py` — 扩展 commit 阶段读取 `scope_type` / `scope_id` / `mode`
- `app/mapper/test_case/testcaseMapper.py` — 新增 `update_case_with_steps(case_id, payload, expected_update_time)` 实现乐观锁 + 步骤全量覆盖
- `app/mapper/test_case/testcaseMapper.py` — 新增 `normalize_plan_order(plan_id, ordered_case_ids)` 实现 1..N 重排(优先复用 `bulk_reorder_plan_case` 锚点语义)
- `app/mapper/test_case/planCaseMapper.py` — 新增 `reorder_plan_cases_by_ordered_ids(plan_id, case_ids: list[int])` 把"重排" 展开为 N 条 `before_id / after_id` items

**`ImportCommitSchema` 字段**:
```json
{
  "file_md5": "...",
  "project_id": 1,
  "scope_type": "plan",
  "scope_id": 123,
  "apply_order": true
}
```

**实现细节**:
- 步骤 4 乐观锁:逐行 `SELECT update_time FROM test_case WHERE id=?`,与 Excel 比对,失败 → 整批回滚
- 步骤 5 步骤全量覆盖:
  ```python
  for case_id, group in rows.groupby('case_id', if present):
      existing_step_ids = select(id from case_sub_step where test_case_id=case_id)
      new_step_orders   = {row['步骤序号'] for row in group if row['步骤序号']}
      # 序号不再出现的步骤 → DELETE (级联 case_sub_step_result)
      delete_step_ids = [sid for (sid, order) in existing_step_ids if order not in new_step_orders]
      # (case_id, 步骤序号) upsert
      for row in group:
          if not row['步骤序号']:
              continue  # 步骤序号为空 → 不创建
          upsert(case_sub_step, test_case_id=case_id, order=row['步骤序号'],
                 action=row['操作步骤'], expected_result=row['预期结果'])
  ```
  - **不调用** `handleAddStepLine` — 0 步骤用例保持 0 步骤
- 步骤 6 字段更新:`UPDATE test_case SET ... WHERE id=? AND update_time=?`,affected=0 则判冲突
- 步骤 7 新增入库:复用 `insert_upload_case(cases, project_id, module_id, requirement_id, user, is_common, on_duplicate)`,**`on_duplicate` 强制 'create'**(本设计不查重)
- 步骤 8 排序:
  - `apply_order=True` 且 `scope_type=plan`:用 `reorder_plan_cases_by_ordered_ids` 把"Excel 1..N 的 case_id 序列" 展开为 N 条 `{case_id, before_id=前一个, after_id=后一个}` items,调用 `bulk_reorder_plan_case`
  - `apply_order=True` 且 `scope_type=library`:**跳过**(无 order 字段)
  - **日志**:对每个重排的 case 记 `log.info(f"[export-import] case {case_id} reordered: {old} -> {new} in {scope_type}:{scope_id}")`
- 步骤 9 缺失用例:**无操作**(本设计不删)
- 步骤 10 整批单事务
- 响应:`{ updated: int, inserted: int, reordered: int, errors: [...] }`

**验收**:
- [ ] 库场景 commit:改 3 条字段 → DB 字段回写,`update_time` 推到最新
- [ ] 库场景 commit:加 2 条 → DB 新增,`case_id` 分配
- [ ] 库场景 commit:删 3 行 → 缺失的 3 条**仍然存在**,DB 无变化
- [ ] 计划场景 commit:order 列 1,2,3,4,5 → plan_case_association.order 1,2,3,4,5
- [ ] 计划场景 commit:用例 100 步骤从 [1,2,3] 改为 [1,3] → step_id 1 还在(可能 upsert),步骤 2 被 DELETE(级联清掉 step_result)
- [ ] 乐观锁失败:中途有人改了 case_name → commit 整笔回滚,errors 列出冲突 case_id
- [ ] 跨 scope 防御:把 plan:123 的文件 commit 到 plan:456 → 400
- [ ] 单测 7 个场景全过

**估算**: 1 人日

**风险**: 乐观锁 + 整批事务对长事务敏感 — 500 行 commit 应 < 5s;>1000 行留二期优化。

---

### PR-4: 前端 — 新增 `ExportCaseModal` + 用例库工具栏接入

**目标**:用户能在用例库页点"导出" 按钮,弹出 modal 确认范围,下载 xlsx。

**仓库**: `caseHubWeb`

**关键文件**:
- `src/api/case/testCase.ts` — 新增 `exportCaseExcel(scope_type, scope_id, case_ids?, include_steps?)`,复用 `downloadCaseExcel` 的 blob/filename 解析模式
- `src/pages/CaseHub/CaseLibrary/components/ExportCaseModal.tsx`(**新**) — ModalForm,scope 固定 library
- `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx` — `toolbar` 加 "导出" 按钮,点击打开 `ExportCaseModal`,传入 `currentProjectId` + `currentModuleId`

**`ExportCaseModal` 行为**:
- 范围确认:展示 "将导出用例库模块 Y 下的 120 条用例(按创建时间倒序)"
- 复选:"包含子步骤" (默认勾选)
- 复选:"仅导出当前选中" (仅在 `selectedRowKeys.length > 0` 时显示,默认 false)
- 确认 → 调 `exportCaseExcel('library', moduleId, case_ids?)` → 浏览器下载 → 弹窗关闭

**验收**:
- [ ] 用例库页右上角 "导出" 按钮可见(图标统一用 `<DownloadOutlined />`)
- [ ] 点击后 modal 打开,显示当前模块用例数量(从 `pageData.total` 拿)
- [ ] 确认后浏览器下载 xlsx,文件名格式 `用例导出-library{moduleId}-{时间戳}.xlsx`
- [ ] 选中 5 条后勾 "仅导出当前选中" → xlsx 正好 5 条
- [ ] 取消勾 "包含子步骤" → xlsx 每个用例 1 行,步骤列全空
- [ ] 没选模块时按钮 disabled + tooltip 提示

**估算**: 0.5 人日

**风险**: 大模块(>5k)导出时机身体感 — 加 `message.loading('正在生成 Excel...')` 即可,首版不异步。

---

### PR-5: 前端 — 收敛 `UploadCaseModal` + `PlanCaseImportModal` 为 `ImportCaseModal`

**目标**:把"只新增" 的导入弹窗统一成一个 `scope` 感知的弹窗,支持新圆桌。同时去掉 `on_duplicate` / `missing_action` UI(本设计不需要)。

**仓库**: `caseHubWeb`

**关键文件**:
- `src/pages/CaseHub/components/ImportCaseModal.tsx`(**新**) — 接受 `scope_type` / `scope_id` / `project_id` / `title` props
- `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` — **删除**(改为调用 `ImportCaseModal(scope_type='library')`)
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/PlanCaseImportModal.tsx` — **删除**(改为调用 `ImportCaseModal(scope_type='plan')`)
- `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx` — 改用新 modal
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/*.tsx` — 改用新 modal
- `src/api/case/testCase.ts` — `uploadPreviewCase` / `commitImportCase` 加 `scope_type` / `scope_id` / `mode` 参数;`cancelImportCase` 不变

**`ImportCaseModal` 行为**:
- 顶部提示(根据 scope):
  - library:"本圆桌不删除任何用例、不查重;改的归位,增的插入"
  - plan:同上 + "排序将按 Excel '排序' 列重排执行顺序"
- 上传 → 调 `/api/hub/cases/import/preview` (后端 PR-2)
- 展示:`scope_check` 概览(known/new/intersect)+ `errors` 列表
- 单一配置项(根据 scope):
  - library:无(直接提交)
  - plan:无(顺序总是按 Excel)
- 提交 → 调 `/api/hub/cases/import/commit` (后端 PR-3)→ 成功后 `onSuccess` 回调

**验收**:
- [ ] 用例库导入弹窗:upload → preview → commit 链路通
- [ ] 计划导入弹窗:upload → preview → commit 链路通
- [ ] 老的"下载模板" 按钮保留(走 `downloadCaseExcel` 不变)
- [ ] 老的"重复处理 skip/create" 选项**消失**
- [ ] 老的"取消/确认" 按钮行为保留
- [ ] 现有 `UploadCaseModal` / `PlanCaseImportModal` 单元测试如果存在,迁移/补齐

**估算**: 1 人日

**风险**: 这两个 modal 各自有自身特殊处理(计划侧有 `plan_module_id` 解析,库侧没有) — 收敛时**不要直接 copy-paste**,要明确"哪些是 scope 共有,哪些是 scope 独有"。

---

### PR-6: 前端 — 计划页工具栏"导出" 按钮接入 + E2E 联调

**目标**:计划页能点"导出" 拉出当前计划所有用例;同时跑完 SUMMARY §Next Step 7 的 5 个 E2E 场景。

**仓库**: `caseHubWeb`

**关键文件**:
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/ExportCaseModal.tsx`(**新**) — 或者复用 PR-4 的 `ExportCaseModal`,传 `scope_type='plan'`
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/index.tsx` — 工具栏加 "导出" 按钮
- `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx` — 工具栏 "导入" 按钮文案微调(原"上传" → "导入" ,更贴切)

**E2E 场景**(用 Playwright 或人工):
- [ ] 库场景 1:导出 → 改 1 条字段 → 导入 → 字段回写
- [ ] 库场景 2:导出 → 删 3 行 → 导入 → 缺失 3 条**仍然存在**(数据库原状)
- [ ] 计划场景 1:导出 → 改 2 步 → 插入 2 条新用例 → 导入 → 顺序 1,2,3,4,5 落库
- [ ] 计划场景 2:导出 → 删 3 行 → 导入 → 缺失 3 条仍在计划中
- [ ] 计划场景 3:导出 → 另一个人把某条 `case_name` 改成 X → 导入 → 乐观锁拦截,弹窗列冲突 case_id
- [ ] 跨 scope:把 plan:123 的导出上传到 plan:456 → preview 拒绝,errors 显示 scope 不匹配

**验收**:
- [ ] 计划页 "导出" 按钮可见、可点
- [ ] 6 个 E2E 场景全过(测试报告归档)
- [ ] 联调截图/录屏存到 `docs/.plans/260611-1125-test-case-export-import-roundtrip/e2e-screenshots/`

**估算**: 0.5–1 人日(含 E2E 跑通)

---

### PR-7: 文档收尾(可选,也可与 PR-6 合并)

**目标**:把 SUMMARY + PLAN 链接暴露到项目 README,编辑指引 Sheet 写入到位。

**仓库**: `caseHubWeb` + `case_auto_hub`

**关键文件**:
- `caseHubWeb/README.md` — 新增 "## 导入 / 导出" 段落,链接到 SUMMARY + PLAN
- `case_auto_hub/README.md` — 同上
- `case_auto_hub/file/编辑指引.txt` — 内容由 PR-1 创建,本 PR 不再改动

**验收**:
- [ ] 两个 README 都有"导入/导出" 段落
- [ ] 段落里有"不要删除/重排列、不要改 ID、不要改 _meta" 的引用

**估算**: 0.25 人日

---

## 任务依赖图

```
PR-1 (BE export)         ─┐
PR-2 (BE preview 升级)   ─┼─→ PR-3 (BE commit) ─┐
                          │                       │
                          │   ┌───────────────────┘
                          │   │
PR-4 (FE ExportCase)  ────┘   │  (PR-4 不依赖 PR-3,但 PR-6 依赖 PR-3)
                              │
                              ↓
                          PR-5 (FE ImportCase 收敛)
                              ↓
                          PR-6 (FE 计划页接入 + E2E)
                              ↓
                          PR-7 (文档)
```

**关键路径**: PR-1 → PR-3 → PR-5 → PR-6(2.5–4 人日)
**并行机会**: PR-4 可以与 PR-2/3 并行做(只读端点,无相互阻塞)

## 工时估算(总)

| 阶段 | 估算 |
|---|---|
| PR-1 BE export | 0.5–1 人日 |
| PR-2 BE preview 升级 | 1 人日 |
| PR-3 BE commit | 1 人日 |
| PR-4 FE ExportCase + 库工具栏 | 0.5 人日 |
| PR-5 FE ImportCase 收敛 | 1 人日 |
| PR-6 FE 计划接入 + E2E | 0.5–1 人日 |
| PR-7 文档 | 0.25 人日 |
| **合计** | **4.75–6.75 人日**(约 1.5 周单人) |

## 风险与缓解(从 SUMMARY 继承,实施时复核)

| 风险 | 缓解 |
|---|---|
| `排序` 列用户误编辑 | preview 警告;commit normalize;主表头加注 |
| 乐观锁冲突 | 整批回滚 + 列出冲突 case_id |
| 大列表(>5k)性能 | 首版同步,>10k 留异步 |
| `_meta` 用户改 | 后端严格 schema 校验 |
| 步骤行"全空"误存 | preview 警告;后端双空跳过 |
| 计划关联字段入口丢失 | 计划页面保留独立编辑入口(走现有 update 接口) |
| `所属分组` 路径串 scope | 复用 `UploadPlanModuleResolver` / `UploadModuleResolver` 分流 |
| 前端工具栏"导出/导入" 视觉割裂 | 同一图标家族 + secondary 风格 |
| 计划 order 重排对 step_result 影响不明 | commit 阶段 `log.info` 线上观察,不写硬回归 |
| 用户期望"删除" 行为 | 编辑指引 Sheet + 弹窗顶部提示"不删除" |

## Open Questions(实施中需要再确认)

1. **`include_steps=False` 时,排序列还写不写?** — 倾向**写**,后端不知道用户是否打算改步骤(导回时如果新增步骤,`排序` 列空会断链)。需要 PR-1 实施时确认
2. **计划的 `bug_url` 字段,如果用户强烈反馈"需要批量改"**,走哪条路? — 走"计划页面新增批量编辑弹窗",不进 Excel
3. **`步骤序号` 列在 0 步骤场景下,后端到底要不要自动给个 `1` 占位**? — 倾向**不要**(用户已明确不自动建步骤)。但需要 PR-3 实施时在 `_meta` 给个 `has_steps_at_import` 标记便于统计
4. **异步导出(>10k 行)什么时候上**? — 二期,触发条件:用户实际反馈有性能问题
5. **导出文件是否压缩(`.xlsx.gz`)?** — 倾向**不压**,Excel 本身是 zip 格式,再压收益小且增加前端解压逻辑

## 验收标准(整体)

- [ ] 7 个 PR 全部合并,单测 / 集成测试全过
- [ ] 6 个 E2E 场景全过(库改/库缺、计划改插/计划缺/计划冲突、跨 scope 防御)
- [ ] `case_auto_hub` 现有 `upload` / `upload/commit` / `upload/cancel` 行为**完全不变**(老调用方零回归)
- [ ] 用例库 / 计划 两个工具栏的"导出" + "导入" 视觉风格一致
- [ ] `_meta` 校验:`scope_type` / `scope_id` 不匹配 → 400;`version` 不匹配 → 400
- [ ] 排序日志:每次重排在 `logs/` 留下可 grep 的 `[export-import]` 行
- [ ] README 两个仓库都补了"导入/导出" 段落

## 不做的事(强调)

- 任何"删除" 路径
- `missing_action: remove`
- `on_duplicate: skip | create`
- 计划关联字段进 Excel
- 异步导出(首版)
- 公式 / 宏 / 国际化 / 细粒度权限
