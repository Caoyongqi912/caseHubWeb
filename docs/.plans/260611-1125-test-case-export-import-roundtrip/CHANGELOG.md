# Changelog: 测试用例 导出-编辑-导回 回路

> 配套 [PLAN.md](/Users/cyq/work/code/caseHubWeb/docs/.plans/260611-1125-test-case-export-import-roundtrip/PLAN.md) 实施记录.
> 每个 PR 一节,按时间倒序(最新在上). 改动落到两个仓库:
> - **case_auto_hub** (BE, FastAPI)
> - **caseHubWeb** (FE, Umi Max + React 18)

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
