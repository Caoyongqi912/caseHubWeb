# Changelog: 测试用例 导出-编辑-导回 回路

> 配套 [PLAN.md](/Users/cyq/work/code/caseHubWeb/docs/.plans/260611-1125-test-case-export-import-roundtrip/PLAN.md) 实施记录.
> 每个 PR 一节,按时间倒序(最新在上). 改动落到两个仓库:
> - **case_auto_hub** (BE, FastAPI)
> - **caseHubWeb** (FE, Umi Max + React 18)

---

## PR-4 / PR-5 / PR-6 — FE 接入 (ExportCaseModal + ImportCaseModal 通用化)

**日期**: 2026-06-11
**仓库**: caseHubWeb
**状态**: PR-4/5/6 一起落地 (FE 互锁, 没法独立 ship)
**不影响**: 老的 UploadCaseModal / PlanCaseImportModal 保留兼容 (TODO: 等 E2E 后删)
**前置依赖**: PR-1/2/3 (BE 链路), 用户调整了 CaseDataTable 的 defaultPageSize

### 改动文件

| 文件 | 类型 | diff 行数 | 说明 |
|---|---|---|---|
| `src/api/case/testCase.ts` | 修改 | +129 | 新增 `exportCaseExcel` / `importRoundtripPreview` / `importRoundtripCommit` 三个圆桌 API |
| `src/pages/CaseHub/components/ExportCaseModal.tsx` | **新增** | 164 | scope 锁定导出弹窗, 自带 trigger 按钮 |
| `src/pages/CaseHub/components/ImportCaseModal.tsx` | **新增** | 492 | scope 锁定导入弹窗, 展示 scope_check + errors + warnings |
| `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx` | 修改 | +37/-5 | 工具栏加 ExportCaseModal + ImportCaseModal (老 UploadCaseModal 保留) |
| `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/index.tsx` | 修改 | +38 | 工具栏加 ExportCaseModal (plan scope), ImportCaseModal 替换老 PlanCaseImportModal 调用位 |

### 关键符号

- `src/api/case/testCase.ts`
  - `exportCaseExcel({scope_type, scope_id, project_id, case_ids?, include_steps?})` — GET 圆桌导出, 走 blob, 解析 Content-Disposition 拿文件名
  - `importRoundtripPreview(file, {scopeType, scopeId, projectId, mode?})` — 圆桌 preview, 走 multipart
  - `importRoundtripCommit({fileMd5, scopeType, scopeId, projectId})` — 圆桌 commit
- `src/pages/CaseHub/components/ExportCaseModal.tsx`
  - Props 联类型: `LibraryProps` (`scopeType: 'library'`) | `PlanProps` (`scopeType: 'plan'`), TS 联合类型编译期保证传对
  - `totalCount` 来自父组件 ProTable.onLoad 同步的 pageData.total
  - "仅导出当前选中" 选项只在 `selectedRowKeys.length > 0` 时显示
  - 0 用例时禁用确认按钮 + 提示 "无需导出"
- `src/pages/CaseHub/components/ImportCaseModal.tsx`
  - 上传 → preview → commit 三段式 UI
  - 顶部 `Alert` 按 scope 切文案: 库/计划
  - 预览卡片展示 4 个统计 (总/有效/错误/可提交) + scope_check 表格 + warnings/errors 明细
  - "可提交" 是 false 时不渲染提交按钮, 强制用户修正 Excel 重传
  - `afterClose` 自动清理 Redis 预览缓存, 不留垃圾
- `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx`
  - `handleTableLoad` 钩子同步 ProTable.total 给 exportTotal state
  - 工具栏顺序: ImportCaseModal (PR-5 新) → UploadCaseModal (legacy, TODO 删) → ExportCaseModal (PR-4) → 添加用例
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/index.tsx`
  - `handleBatchExport` 占位消息替换为 ExportCaseModal 自带 trigger
  - ImportCaseModal 走受控 (无 trigger), 由父组件 modal 按钮触发

### 用户体验要点

- **导出按钮**: scope 锁定, 文案自带 "用例库模块" / "测试计划" 区分
- **导入按钮**: 三段式, 用户能清晰看到 "解析 → 校验 → 确认" 每一步结果
- **错误展示**: 最多列 10 行, 超出 "还有 N 行", 不爆屏
- **缓存清理**: 弹窗关闭/取消时自动 `cancelImportCase` 清理 Redis 30min TTL 缓存

### 保留兼容 (老入口暂不删)

- `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` — 老的 9 列格式 + /upload 链路
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/PlanCaseImportModal.tsx` — 老的计划导入

原因: 老调用方 (其他业务/历史用户) 还在用 9 列老模板, 强删会断. 等 PR-6 的 E2E 跑通后, 在 PR-7 收尾时删.

### 烟雾测 (无自动化, 手工待办)

```
[CaseDataTable 工具栏]
- [ ] 选中 module 后 "导出" 按钮可见, 文案 "用例库模块下的 N 条用例"
- [ ] 取消 "包含子步骤" → xlsx 每个用例 1 行
- [ ] 选中 5 条 + 勾 "仅导出当前选中" → xlsx 正好 5 条
- [ ] 0 用例时 "导出" 按钮 disable, 弹窗内提交按钮 disable
- [ ] "导入" 弹窗: 上传 PR-1 导出的 xlsx → 展示 scope_check
- [ ] scope 不一致: 故意改 xlsx _meta scope_id → 弹窗显示 errors
- [ ] can_commit=false 时不显示 "确认导入" 按钮

[PlanCaseList 工具栏]
- [ ] 进入计划页, "导出" 按钮可见
- [ ] "导入" 弹窗: 顶部文案是计划版 (含 "排序" 提示)
- [ ] 改 Excel 排序列, 提交后 plan_case_association.order 按 Excel 重排

[静态] tsc --noEmit 在 4 个新文件零错 (项目整体有 node_modules 预存 pro-components 类型问题)
[路由] 老的 UploadCaseModal / PlanCaseImportModal 调用位全保留
[CaseDataTable] 保留用户改的 defaultPageSize=20
```

### 部署注意 ⚠️

1. **新文件位置**: `src/pages/CaseHub/components/` 是项目约定位置, 跟 `CaseLevelSelect` / `CaseTypeSelect` 等平级, Umi 会自动识别
2. **Modal 弹窗销毁**: ImportCaseModal 用 `destroyOnClose: true`, 关闭后组件卸载, 状态自动重置, 多次打开不串
3. **API 路径**: 三个新 API 都走 `request()` 拦截器, 跟现有 fetch 走同一套鉴权/异常处理
4. **Blob 下载**: ExportCaseModal 自己用 `URL.createObjectURL + a[download]` 触发, 不引新依赖; 跟老 `downloadCaseExcel` 同套模式
5. **CaseDataTable.tsx 是 user dirty**: 保留了用户的 defaultPageSize=20 改动, 没回滚

### 不在 PR-4/5/6 范围

- E2E 5 个场景自动化 (→ PR-6 自动化, 当前是手工清单)
- 删老 UploadCaseModal / PlanCaseImportModal (→ 等 E2E 跑通)
- README 链接 / 项目文档更新 (→ PR-7)

---
## PR-3 — BE `POST /api/hub/cases/import/commit` 端点 (入库, 事务, 乐观锁, 步骤全量覆盖, 排序)

**日期**: 2026-06-11
**仓库**: case_auto_hub
**状态**: 已落地, 烟雾测 34/34 通过
**不影响**: 现有 28 个路由、PR-1 export 链路、PR-2 preview 链路、`/upload` 老链路
**前置依赖**: PR-1 (导出) + PR-2 (preview + 缓存)

### 改动文件

| 文件 | 类型 | diff 行数 | 说明 |
|---|---|---|---|
| `app/service/roundtripCommitService.py` | **新增** | — | `RoundtripCommitService` + `CommitResult`, 10 步 commit 流程编排 |
| `app/mapper/test_case/testcaseMapper.py` | 修改 | +138 | 新增 `update_with_optimistic_lock` + `insert_with_steps` + `_coerce_case_row` 工具 |
| `app/mapper/test_case/testCaseStepMapper.py` | 修改 | +73 | 新增 `replace_case_steps` (DELETE + INSERT, FK 级联清 step_result) |
| `app/controller/test_case/test_case.py` | 修改 | +50 | 新增 `POST /import/commit` 路由, 加 `RoundtripCommitService` import |

### 关键符号

- `app/service/roundtripCommitService.py`
  - `class CommitResult(dict)` — 响应 dict, 字段: `updated` / `inserted` / `reordered` / `errors`
  - `class RoundtripCommitService` — 主流程编排
    - `async def commit() -> CommitResult` — 10 步流程, 整体一个 `TestCaseMapper.transaction()`
    - 内部: `_split_groups()` / `_check_optimistic_lock()` / `_build_ordered_ids()` / `_build_reorder_items()` / `_resolve_plan_root_module()`
  - 设计: 单事务锚点 (`TestCaseMapper.transaction()`), 乐观锁失败 / 整批错误 / 写库异常 → 整批回滚, 缓存不写 committed
- `app/mapper/test_case/testcaseMapper.py`
  - `_CASE_WRITABLE_FIELDS = (case_name, case_tag, case_setup, case_mark, case_level, case_type)` — 圆桌字段白名单
  - `def _coerce_case_row(row)` — 解析器 dict -> model 字段, 空白字符统一去, 空串 -> None
  - `async def update_with_optimistic_lock(session, case_id, fields, expected_update_time, user) -> int` — `UPDATE ... WHERE id=? AND update_time=?`, 0=冲突 1=成功
  - `async def insert_with_steps(session, case_fields, step_rows, project_id, module_id, user, is_common) -> int` — INSERT case + replace steps, 0 步骤合法
- `app/mapper/test_case/testCaseStepMapper.py`
  - `_STEP_WRITABLE_FIELDS = (action, expected_result, order)` — 步骤白名单
  - `def _coerce_step_row(row)` — 解析器 dict -> 步骤字段
  - `async def replace_case_steps(case_id, step_rows, user, session) -> int` — 全量覆盖, 0 步骤=全删, FK ON DELETE CASCADE 自动清 `case_sub_step_result`
- `app/controller/test_case/test_case.py`
  - `@router.post("/import/commit", description="...")` 路由
  - 路由函数 `import_commit(file_md5, scope_type, scope_id, project_id, user)` — 4 个 Form 字段
  - 错误处理: `ValueError` -> `CommonError`; 其他异常走默认

### 端到端契约 (前端 PR-4/5/6 留的接口)

```
POST /api/hub/cases/import/commit
  Content-Type: multipart/form-data (或 application/x-www-form-urlencoded)
  file_md5=<md5>             必填, 来自 /import/preview 响应
  scope_type=library|plan    必填
  scope_id=<int>             必填
  project_id=<int>           必填 (plan 场景下用于解析新 case 默认落库的 module)
  Authorization: Bearer ...  鉴权

成功响应 (200):
  {
    "code": 0,
    "data": {
      "updated": 2,        // 已知 case 字段+步骤落库条数
      "inserted": 1,       // 新增 case 条数
      "reordered": 3,      // plan 场景: 重排条数; library 场景: 0
      "errors": []         // 预留, 当前实现下整批回滚, 不会有局部 errors
    }
  }

错误 (整批回滚, 不写库):
  400 CommonError: 
    - 缓存不存在 / 已提交 / scope 不一致
    - 乐观锁失败 (data.conflicts 含冲突 case_id + expected/actual update_time)
    - 项目下没有任何 module (plan 场景新增 case 时)
```

### 10 步 commit 流程

```
1) 加载 Redis 预览缓存 (key: upload:case:{user_id}:{file_md5})
2) 校验: 缓存存在 + 未提交 + scope_type/scope_id 跟 form 一致
3) 按 (排序, 用例名称) 分组: known_groups (有 case_id) / new_groups (无 case_id)
   - 同 (sort, name) 多行 = 同一 case 的多步骤
4) 乐观锁前置检查: 一次 SELECT 拉所有 known case 的 update_time, 跟 Excel 比对
   - 任一冲突 → 整批回滚, 错误含 conflicts
5) known: 逐 case → update 字段 (乐观锁) + replace 步骤 (DELETE+INSERT, FK 级联)
6) new: 逐 case → insert case (is_common=True) + 步骤 (0 步骤合法)
7) plan 场景: 给 new case 关联到 plan (plan_module_id=None 走根 plan_module)
8) plan 场景: 1..N 重排, 展开为 N 条 (case_id, before_id, after_id) 调
   reorder_plan_cases_bulk
9) 缺失用例: 不动 (圆桌不删)
10) 标记 Redis committed (写在事务外, 失败不致命)
```

### 关键设计

- **单事务**: `TestCaseMapper.transaction()` 为锚点, 任何一步抛错都整批回滚, 不会留下半截数据
- **乐观锁**: `UPDATE ... WHERE id=? AND update_time=?`, affected=0 = 冲突. 比对的是字符串形式的 update_time ("YYYY-MM-DD HH:MM:SS"), 跟 model.map 的 strftime 一致
- **步骤全量覆盖**: `DELETE + INSERT`, 不调 `handleAddStepLine`. 0 步骤用例 = 全删不补. FK ON DELETE CASCADE 自动清掉 `case_sub_step_result` 关联
- **排序**: 复用现有 `reorder_plan_cases_bulk`, 用相邻 case_id 做 before/after 锚点 (跟前端拖拽同一套语义). `reordered` 数 = 实际发起的 items 数 (有幂等的, 实际生效由 mapper 内部判定)
- **不删**: 圆桌的明确设计, 缺失 case 不动, DB 不会少用例
- **缓存安全**: `mark_committed` 在事务外, 即使失败也不影响数据落库 (会出现"已落库但缓存未标 committed"的窗口, 重复 commit 会因 committed=True 拒绝)
- **plan 场景新 case 默认 module_id**: 解析项目根 module (parent_id IS NULL + module_type=CASE), 找不到兜底第一个 module, 再找不到抛错让用户先建目录
- **局部 import**: `_coerce_case_row` 在方法内 import, 避免 module 顶层触发 testcaseMapper 整链 (PR-3 烟雾测需要)

### 烟雾测 (无 DB, 34/34 通过)

```
[1]  _split_groups: 2 known + 1 new, 排序 (1,case1) (2,case2) (3,new case)  ✓ 6 项
[2]  _build_ordered_ids: [100, 101, 999]                                   ✓ 1 项
[3]  _build_reorder_items: 头/中/尾锚都对                                  ✓ 4 项
[4]  _coerce_case_row: 空白/null/正常 三种入参                            ✓ 5 项
[5]  编排 happy path (library, mock mapper):
     updated=2, inserted=1, reordered=0
     update 调 2 次, insert 1 次, replace_steps 2 次, plan_associate 0 次
     mark_committed 1 次                                                  ✓ 8 项
[6]  编排 plan 场景:
     reordered=3, bulk_reorder 调 1 次
     case_id 顺序 [100, 101, 999] 对应 items 顺序                          ✓ 4 项
[7]  乐观锁失败 (1 条冲突):
     抛错 + update 调 0 次 (整批回滚)                                     ✓ 2 项
[8]  scope 不一致 (form library vs cache plan):
     抛错, 错误含 "scope"                                                ✓ 2 项
[9]  缓存不存在 (get_preview=None): 抛错                                   ✓ 1 项
[10] 已提交 (committed=True): 抛错                                         ✓ 1 项

[静态] 4 个改动文件 ast.parse 全通过                                      ✓
[路由] 28 个 @router.* 全保留, 新增 /import/commit 在 /import/preview 之后  ✓
[向后] 老 /upload 链路不动, 圆桌新链路跟 preview 解耦                      ✓
```

### 已知限制 (后续 PR 处理)

- **plan 场景新 case 的 module_id**: 当前自动解析项目根 module, 理想是让前端传 plan 关联的源 module_id (更精确, 跨项目时不会跑偏). 等 PR-4/5/6 接 FE 时再加
- **异步 commit**: 500+ 行 commit 同步跑, 体感可能慢, 二期再上 Celery
- **冲突重试 UX**: 当前乐观锁失败直接整批回滚让用户重新导出, 后续可加 "我接受覆盖" 选项
- **commit 日志**: 整批一条 info 日志, 不展开到每条 case. 等真有用户反馈"哪条改了"再加细

### 部署注意 ⚠️

1. **新增 `app/service/roundtripCommitService.py`** — 跟 PR-1/2 同目录, 纯应用代码, 无新依赖
2. **新 mapper 方法**: 跟现有 mapper 风格一致 (staticmethod + session 参数), 不破坏调用方
3. **`case_sub_step_result` 级联清**: 步骤全量覆盖 = DELETE 旧步骤 → FK ON DELETE CASCADE 自动清 step_result. **数据库外键必须已配 ON DELETE CASCADE**, 跟现有 model 一致 (model 定义里有 `ondelete="cascade"`). 若历史数据有孤儿 step_result, 需提前清理
4. **Redis 缓存 key 复用**: 跟 PR-2 同款 `upload:case:{user_id}:{file_md5}`. 老 /upload 缓存 (不带 `committed` 字段) 跟新缓存结构不同, 但 key 前缀相同 — 实际不会冲突, 因为老 /upload 流程不写 `committed`, commit 端读到的会是旧结构导致 JSON parse 失败, 自然走 "缓存不存在" 错误, 用户重新走 preview 即可

### 不在 PR-3 范围 (留给后续 PR)

- 前端 `ImportCaseModal` / `ExportCaseModal` (→ PR-4, PR-5, PR-6)
- E2E 5 个场景 (→ PR-6)
- 任何形式的删除 (→ 永久不开放)
- 异步 commit (→ 二期)
- 冲突粒度 (→ 二期, 当前整批回滚)

---
## PR-2 — BE `POST /api/hub/cases/import/preview` 端点 (解析 + scope 校验)

**日期**: 2026-06-11
**仓库**: case_auto_hub
**状态**: 已落地, 烟雾测 36/36 通过
**不影响**: 现有 26 个路由、`/upload` / `/upload/commit` / `/upload/cancel`、导出链路 (PR-1)
**前置依赖**: PR-1 (导出 3-Sheet xlsx 协议)

### 改动文件

| 文件 | 类型 | diff 行数 | 说明 |
|---|---|---|---|
| `utils/roundtripReader.py` | **新增** | — | `RoundtripReader` + `RoundtripParseResult` + 14 列协议常量 |
| `app/service/uploadCacheService.py` | 修改 | +15/-7 | `save_preview()` 加 keyword-only 字段 (`valid_rows` / `meta` / `scope_check` / `warnings`), 向后兼容老调用 |
| `app/controller/test_case/test_case.py` | 修改 | +187/-15 | 新增 `POST /import/preview` 路由, 老 `/upload` 标记 `[DEPRECATED]` |

### 关键符号

- `utils/roundtripReader.py`
  - 常量: `EXPECTED_DATA_COLUMNS` (14 列, 跟 PR-1 `DATA_COLUMNS` 对齐)、`DATA_SHEET_NAME="用例数据"`、`META_SHEET_NAME="_meta"`、`SUPPORTED_META_VERSION=1`、`MAX_FILE_SIZE=10MB`
  - `class RoundtripReader(scope_type, scope_id, workers=4)` — 构造时锁定 scope, `async_read(file: UploadFile)` 异步入口
  - `class RoundtripParseResult` — dataclass, 字段: `file_md5` / `total_count` / `valid_count` / `invalid_count` / `errors` / `warnings` / `valid_rows` / `meta` / `scope_check`
  - 内部: `_read()` 同步主流程, `_read_meta()` 读 _meta, `_validate_row()` 行校验, `_check_sort_warnings()` 排序 warning, `_compute_scope_check()` 统计 known/new
  - 关键设计: 解析失败/缺表 不抛, 全部塞 `errors`; 任意 error → can_commit=false, 不写 Redis
- `app/service/uploadCacheService.py`
  - `save_preview()` 新增 keyword-only 形参: `valid_rows` / `meta` / `scope_check` / `warnings`, 全部 Optional, 默认 None → 老调用方无感
- `app/controller/test_case/test_case.py`
  - `@router.post("/import/preview", description="导出-编辑-导回 圆桌: 预览 (解析 + 校验 scope)")`
  - 路由函数 `import_preview(file, scope_type, scope_id, mode="mixed", user)`
  - 错误处理: 解析异常 → `Response.success({can_commit:false, errors:[...]})` 不抛; 其他异常 → `CommonError`

### 端到端契约 (前端 PR-4 留的接口)

```
POST /api/hub/cases/import/preview
  Content-Type: multipart/form-data
  file=<xlsx>                  必填
  scope_type=library|plan      必填
  scope_id=<module_id|plan_id> 必填
  mode=mixed|insert_only       可选, 默认 mixed (mixed 允许已知+新增, insert_only 拒已知)
  Authorization: Bearer ...    鉴权

成功响应 (200):
  {
    "code": 0,
    "data": {
      "file_md5": "abc123...",   // 任意 error 时为 null
      "total_count": 4,          // Excel 物理行数 (含空)
      "valid_count": 4,          // 通过校验的行数
      "invalid_count": 0,        // 错误行数
      "errors": [],              // [{row, errors:[{field, message}]}]
      "warnings": [],            // 排序跳号/重复等不阻断提示
      "scope_check": {
        "scope_type_matches": true,
        "scope_id_matches": true,
        "version_supported": true,
        "meta_scope_type": "library",
        "meta_scope_id": "100",
        "case_ids_in_excel_known": 3,   // distinct case_id 非空的组
        "case_ids_in_excel_new": 0,     // 全 case_id=None 的组
        "case_ids_at_export_total": 3,  // 导出时 case_ids 数量
        "case_ids_intersect_with_at_export": 3  // 命中导出的 known 数
      },
      "can_commit": true          // false 时 file_md5=null, 前端禁掉 "确认导入"
    }
  }

错误:
  400 CommonError: scope_type 非法 / mode 非法 / 鉴权失败
  注意: 解析失败不返 400, 返 can_commit=false 让前端展示错误明细
```

### 14 列协议 (与 PR-1 导出端对齐, 改了就破坏回路)

主表 Sheet `用例数据` 列顺序固定, 列名即协议:
`排序, 用例ID, UID, 用例名称, 用例等级, 用例类型, 用例标签, 所属分组, 前置条件, 备注, 步骤序号, 操作步骤, 预期结果, 更新时间`

必填列: `用例名称` (其余可空)

_meta Sheet 必含 5 字段: `scope_type` / `scope_id` / `case_ids_at_export` / `exported_at` / `version`

### 关键逻辑点

1. **scope 校验在解析主表之前完成** — 提前失败, 不浪费 14 列解析
2. **校验失败不抛, 全塞 errors** — 前端能拿到明细弹给用户
3. **can_commit 单一开关** — `len(errors)==0` 才允许 commit, file_md5 此时才有效
4. **Redis 缓存只在 can_commit=true 时写** — 老 preview 链路如果存在, 不会留下半截
5. **`mode=insert_only`** — 把含 case_id 的行强制转 error, 给"只能新增"场景留口 (虽然 SUMMARY 说不常用)
6. **解析器/Controller 解耦** — 解析是 sync, controller 包 async, 共享 `ThreadPoolHelper`

### 烟雾测 (无 DB, 36/36 通过)

```
[1]  正常 case (3 用例, 1/0/2 步)        ✓ 12 项 (含 0 步骤用例字段全 None)
[2]  scope_type 不一致                    ✓ 2 项
[3]  scope_id 不一致                      ✓ 1 项
[4]  version 不一致                       ✓ 1 项
[5]  排序跳号 + 重复                      ✓ 2 项
[6]  必填空 (用例名称)                    ✓ 3 项
[7]  缺主表 Sheet                         ✓ 2 项
[8]  缺 _meta Sheet                       ✓ 2 项
[9]  用例ID 非整数                        ✓ 2 项
[10] 中间空行 (编辑删除行)                ✓ 2 项
[11] 新增用例 (case_id 留空)              ✓ 3 项
[12] 步骤序号非整数                       ✓ 2 项
[13] 排序非整数                           ✓ 2 项

[静态] 3 个改动文件 ast.parse 全通过  ✓
[路由] 26 个 @router.* 全保留  ✓
[向后] 老 save_preview 调用方无影响  ✓
```

### 修复的真问题 (测时发现)

1. **`_validate_row` 三个 except 分支没占位 `parsed[...]`** — 整数字段解析失败时, 后面访问会 KeyError. 已加 `parsed["x"] = None` 在 except 块, 并加注释说明.
2. **`_compute_scope_check` 统计维度错误** — `known` 之前按行计 (一个 2 步骤用例 = 2), `new_` 条件漏掉了"新用例有步骤"的情况. 改为按 (排序, 用例名称) 分组, `known` 取 distinct case_id, `new` 取"全组 case_id=None"的组数. 加注释说明分组策略.

### 部署注意 ⚠️

1. **新增 `utils/roundtripReader.py`** — 跟 `utils/threadPool.py` 同级, 不需要任何额外依赖 (openpyxl/pandas 已在 PR-1 装好).
2. **上传限制 10MB** — `MAX_FILE_SIZE = 10 * 1024 * 1024`, 跟 PR-1 导出硬上限 10k 用例平衡. 超过直接 `ValueError` → 200 但 can_commit=false.
3. **缓存 key 不变** — 复用 PR-1 同款 `upload:case:{user_id}:{file_md5}` 前缀, 30 分钟 TTL. PR-3 commit 阶段直接按 file_md5 查, 不会跟老 /upload 缓存冲突 (老缓存不写 `valid_rows` / `meta`).

### 不在 PR-2 范围 (留给后续 PR)

- **入库** (→ PR-3: `POST /import/commit` — 10 步流程: 校验/乐观锁/步骤全量覆盖/排序 apply/落库/写 commit_log)
- 前端 `ImportPreviewModal` (→ PR-4)
- 任何形式的删除/移除 (→ 永久不开放, 见 SUMMARY)
- 计划关联字段写入 (→ PR-3 commit 时按 plan 中间表 commit 参数处理, 不依赖 Excel)
- 异步解析 (→ 二期, 当前 10MB / sync)

---
## PR-1 — BE `GET /api/hub/cases/export` 端点 (只读, 无破坏)

**日期**: 2026-06-11
**仓库**: case_auto_hub
**状态**: 已落地, 烟雾测通过
**不影响**: 现有 25 个路由、`/upload` / `/upload/commit` / `/upload/cancel`、导入解析链路

### 改动文件

| 文件 | 类型 | diff 行数 | 说明 |
|---|---|---|---|
| `app/service/exportCaseService.py` | **新增** | — | `ExportCaseService` + `_walk_paths` + `EXPORT_HARD_LIMIT=10_000` |
| `app/controller/test_case/test_case.py` | 修改 | +154 | 新增 `GET /export` 路由, 扩 imports (Query/StreamingResponse/CommonError/PlanCaseMapper/ExportCaseService/enums.ModuleEnum) |
| `app/mapper/test_case/testcaseMapper.py` | 修改 | +86 | 新增 `query_cases_for_export()` (拉 case+steps) 和 `build_module_path_map()` (module_id→路径) |
| `app/mapper/test_case/planCaseMapper.py` | 修改 | +74 | 新增 `query_plan_cases_for_export()` 和 `build_plan_module_path_map()` |
| `file/__init__.py` | 修改 | +32 | 暴露 `ExportGuideFile` 路径常量 |
| `file/编辑指引.txt` | **新增** | — | 9 条编辑规则(圆桌的"编辑指引" Sheet 来源) |
| `requirment.txt` | 修改 | +12 | `openpyxl==3.1.5` (字母序插入) |

### 关键符号

- `app/service/exportCaseService.py`
  - `class ExportCaseService` — 构造时收数据, `build_workbook() -> BytesIO` 一次性输出 3-Sheet
  - 常量: `SHEET_DATA="用例数据"` / `SHEET_GUIDE="编辑指引"` / `SHEET_META="_meta"` / `META_VERSION=1` / `EXPORT_HARD_LIMIT=10_000`
  - `DATA_COLUMNS`: 14 个 `(中文表头, dict 字段名)` 二元组 — **协议列, 改了就破坏 PR-2 解析**
  - `def _walk_paths(id_to_node, targets, max_depth=50)` — 内存回溯 parent_id 构造路径
- `app/mapper/test_case/testcaseMapper.py`
  - `TestCaseMapper.query_cases_for_export(project_id, module_id, case_ids=None)` — 拉用例+步骤, create_time desc
  - `TestCaseMapper.build_module_path_map(session, module_ids, project_id, module_type)` — module 路径
- `app/mapper/test_case/planCaseMapper.py`
  - `PlanCaseMapper.query_plan_cases_for_export(plan_id, case_ids=None)` — 拉用例+步骤+plan_order+plan_module_id, order asc
  - `PlanCaseMapper.build_plan_module_path_map(session, plan_id, plan_module_ids)` — plan_module 路径
- `app/controller/test_case/test_case.py`
  - `@router.get("/export", description="按 scope 导出用例为 Excel (导出-编辑-导回 圆桌)")`
  - 路由函数 `export_cases(scope_type, scope_id, project_id, case_ids, include_steps)`

### 端到端契约 (给前端 PR-4 留的接口)

```
GET /api/hub/cases/export
  ?scope_type=library|plan         必填
  &scope_id=<module_id 或 plan_id> 必填
  &project_id=<int>                必填 (plan 场景可传任意, library 用于 module 校验)
  &case_ids=100,101                可选, 逗号分隔; 空=范围内全量
  &include_steps=true              可选, 默认 true; false 则一个用例只占一行

响应:
  200 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Content-Disposition: attachment; filename=用例导出-{scope_type}{scope_id}-{YYYYMMDD-HHmmss}.xlsx

错误:
  CommonError(400): scope_type 非法 / case_ids 解析失败 / 范围内无用例 / 超过 10k 硬上限
  401: 鉴权失败
```

### xlsx 输出结构 (协议)

| Sheet | 状态 | 内容 |
|---|---|---|
| 1. `用例数据` | 可见 | 14 列表头 + N 行数据. 一个用例有 M 步 = M 行, `用例ID` 相同, `步骤序号` 1..M; 0 步骤 = 1 行, 步骤列全空 |
| 2. `编辑指引` | 可见 | 9 条规则(从 `file/编辑指引.txt` 读) |
| 3. `_meta` | **隐藏** | 5 行: `scope_type` / `scope_id` / `case_ids_at_export` / `exported_at` / `version=1` |

主表 14 列顺序: 排序, 用例ID, UID, 用例名称, 用例等级, 用例类型, 用例标签, 所属分组, 前置条件, 备注, 步骤序号, 操作步骤, 预期结果, 更新时间

### 烟雾测 (无 DB, 跑通)

```
[1] library scope, 3 用例 (1 step / 0 step / 2 steps):
    - 期望 1 header + 1+1+2 = 4 data rows × 14 cols  ✓
    - 所有 14 列字段映射 1:1 正确  ✓
    - _meta 隐藏, 5 字段全对 (case_ids_at_export="1,2,3")  ✓
    - 编辑指引 11 行, 头部 "# 编辑指引 (重要!请先读完)"  ✓

[2] plan scope:
    - include_steps=False → 1 header + 2 case = 3 rows  ✓
    - include_steps=True  → 1 header + 1 (case+1 step) + 1 (case+0 step) = 3 rows  ✓
    - group_path 用 plan_module_id 查表 (而非 module_id)  ✓

[3] 边界:
    - 0 用例: 不抛(空 list 是合法输入, controller 显式拦截)
    - 10001 用例: ValueError("导出量 10001 超过单次上限 10000...")
    - 非法 scope_type ("weird"): ValueError
    - 所有 catch 块在 controller 转 CommonError(400)

[4] 静态检查: 4 个改动文件全部 ast.parse 通过  ✓
[5] 现有路由: 25 个 @router.* 全部原样保留  ✓
```

### 部署注意 ⚠️

1. **`file/编辑指引.txt` 和 `file/__init__.py` 在 `.gitignore` 的 `file/` 范围内**(老模板 `用例模版.xlsx` 同样被 ignore), 部署流程需要单独带 `file/` 目录. 建议:
   - Docker: 加一行 `COPY file/ /app/file/`
   - 手动部署: `cp -r file/ <target>/file/`
2. **新增 `app/service/` 目录**: 老仓库没有 `app/service/test_case/` 子目录, 直接在 `app/service/` 根新增 `exportCaseService.py`. 跟 `uploadCacheService.py` 同级, 风格一致.
3. **新增 pip 依赖 `openpyxl==3.1.5`**: 容器 rebuild 时 `pip install -r requirment.txt` 会自动装.

### 不在 PR-1 范围 (留给后续 PR)

- 解析 / preview / commit 链路 (→ PR-2, PR-3)
- 前端 `ExportCaseModal` (→ PR-4)
- 任何形式的删除 / 移除 (→ 永久不开放, 见 SUMMARY)
- 计划关联字段 `is_review` / `first_status` / `second_status` / `bug_url` (→ 永久不导出, 见 SUMMARY)
- 异步导出 (→ 二期, 当前 10k 硬上限)
