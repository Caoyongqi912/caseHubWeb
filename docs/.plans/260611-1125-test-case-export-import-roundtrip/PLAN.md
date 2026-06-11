# Plan: 测试用例 导出-编辑-导回 回路 (v2 修正版)

> Created: 2026-06-11 11:25 (v1, 5-PR 拆分, 已废弃)
> Rewritten: 2026-06-11 (v2, 简化, 4 PR)
> Source: [brainstorm SUMMARY v2](/Users/cyq/work/code/caseHubWeb/docs/.brainstorms/260611-1100-test-case-export-import-roundtrip/SUMMARY.md)
> 状态: 待启动
> 范围: case_auto_hub (BE) + caseHubWeb (FE)
> 不在范围: 需求-用例回路 (即将下线)

## Overview (v1 → v2)

**v1**：导出做了一份 14 列的"圆桌专用"模板（`排序` + `用例ID` + `UID` + 步骤序号列 + 更新时间），跟现有 `用例模版.xlsx` (9 列) 不一致。用户撤回，理由：心智负担大、跟上传对不上。

**v2**：导出**复用上传模板**的 9 列结构，只在**最后一列**多塞一个 `用例ID` 做回写定位。其他上一版加的列（`UID` / `排序` / `步骤序号` / `更新时间` / `_meta` Sheet / 编辑指引 Sheet / 隐藏 Sheet / 版本号）全部砍掉。模板的解析器直接复用现有 `utils/aioFileReader.FIELD_MAPPING`，反向序列化器也照着它的 `【n】` 解析做。

**整个链路 4 个 PR**：

| PR | 仓库 | 内容 | 依赖 |
|---|---|---|---|
| **PR-1** | case_auto_hub (BE) | 重写 `POST /api/hub/cases/export`：10 列同构模板、label 不是 value、`\|` 分隔、同 cell 多步; case_ids 走 body | — |
| **PR-2** | case_auto_hub (BE) | 新增 `POST /api/hub/cases/import/preview`：复用 `aioFileReader` 解析、加 `scope_type/scope_id/project_id`、行级 errors | PR-1 |
| **PR-3** | case_auto_hub (BE) | 新增 `POST /api/hub/cases/import/commit`：INSERT/UPDATE + 步骤全量覆盖 + 计划 order 重排 | PR-2 |
| **PR-4** | caseHubWeb (FE) | 新增 `ExportCaseModal` + `ImportCaseModal`（scope 通用），工具栏接入 | PR-3 |

预估：BE 1.5 人日 (3 PR)，FE 1 人日 (1 PR)，联调 0.5 人日。

---

## 关键设计点（继承 SUMMARY v3）

### 文件结构：**两个 Sheet，1 显 1 隐**
- **Sheet 1 `用例数据`**: 以 `file/用例模版.xlsx` 为基底生成, **前 2 行结构**与下载模板一致 (行 1 标题引导 / 行 2 标头), **行 3 起就是真实数据** (原模板 row 3 的 demo 行已 `delete_rows(3, 1)` 删除)
- **Sheet 2 `_meta` (隐藏)**: 5 行元信息 (`scope_type` / `scope_id` / `case_ids_at_export` / `exported_at` / `version=2`), 导回时做跨 scope 防御 + 变更检测
- 下载模板 `file/用例模版.xlsx` **不动**, `downloadCaseDemo` 接口照旧返原文件

### 10 列（`用例ID` 放最后）

| # | 列名 | 来源 |
|---|---|---|
| 1 | `标题*` | `case_name` |
| 2 | `所属分组` | `group_path`（`\|` 分隔） |
| 3 | `前置条件` | `case_setup` |
| 4 | `步骤描述*` | `steps[].action`（同 cell 拼 `【1】xxx\n【2】xxx`） |
| 5 | `预期结果*` | `steps[].expected_result`（同上） |
| 6 | `标签` | `case_tag` |
| 7 | `用例等级*` | `case_level`（**label**，如 `P1`） |
| 8 | `用例类型` | `case_type`（**label**，如 `功能用例`） |
| 9 | `备注` | `case_mark` |
| 10 | **`用例ID`**（最后一列） | `test_case.id` |

### 不导出的字段
`UID` / `排序` / `步骤序号` / `更新时间` / `is_review` / `first_status` / `second_status` / `bug_url` / `creator` / `updater` / `create_time` / `update_time`

### 导入规则
- `用例ID` 留空 → INSERT
- `用例ID` 填值, DB 存在 → UPDATE (字段 + 步骤全量覆盖)
- `用例ID` 填值, DB 不存在 → 报错该行
- Excel 缺行 → DB 保留 (不删)

### 计划场景的 order
**物理行号就是 order**，无 `order` 列。Commit 时按 Excel 行号重排 `plan_case_association.order` (1, 2, 3, ...)。

---

## 任务分解

### PR-1: BE — 重写 `POST /api/hub/cases/export` 端点

**目标**：替换现有的 v1 export 实现（14 列、3-Sheet），改成 v2 设计（10 列、单 Sheet、与上传模板同构）。

**仓库**：`case_auto_hub`

**改动文件**：
- `app/service/exportCaseService.py` — **重写 (v3)**
  - `build_workbook()` 改为 `load_workbook(file/用例模版.xlsx)`, **复用模板的字体/样式/3 行结构**
  - row 1 替换为新标题 + 5 条编辑引导 (覆盖原 A1 单元格的 "导入模板" 标题)
  - row 2 在 J 列补 "用例ID" 标头
  - row 3 demo 行删除 (`ws.delete_rows(3, 1)`), 真实数据从 row 3 写起, 与 aioFileReader 默认 `header_row+1` 数据起点对齐
  - **加回** `_write_meta_sheet()`: 隐藏 `_meta` Sheet, 5 行 (scope_type / scope_id / case_ids_at_export / exported_at / version=2)
  - `DATA_COLUMNS` 10 列, `用例ID` 放最后
  - 步骤拼装用 `format_steps_cell` (utils.stepCellFormatter)
  - 路径分隔符 `/` → `|`, 枚举用 `label_map.get(value, value)` 翻译
- `utils/stepCellFormatter.py` — **新增**, `format_steps_cell(steps, field)` 拼步骤到单 cell
- `utils/caseEnumResolver.py` — 新增 `load_case_enum_label_map()`: 返回 `{value: label}` 反向映射
- `app/controller/test_case/test_case.py` — `export_cases` 路由: 去掉 `include_steps` 参数、加 `load_case_enum_label_map()` 调用、把 `label_map` 传进 service
- `app/mapper/test_case/testcaseMapper.py` — `query_cases_for_export()` 加 `recursive: bool = True` + 与 `case_ids` 互斥:
  - `case_ids` 非空 → 白名单, 不限 module_id (PR-3 commit 端按 `_meta` 做 scope 防御)
  - `recursive=True` + `case_ids` 空 → `module_id` + 子 module 整子树 (CTE `moduleMapper.get_subtree_ids`)
  - `recursive=False` + `case_ids` 空 → 精确 `module_id` (旧行为, 兼容)
  默认 `recursive=True` 对应"选目录 = 整个子树" 的用户直觉. `build_module_path_map()` 不变.
- `app/mapper/test_case/planCaseMapper.py` — `query_plan_cases_for_export()` 加 `plan_module_id` / `recursive`:
  - `case_ids` 非空 → 白名单, 限当前 plan 内
  - `plan_module_id` 有值 + `recursive=True` → `plan_module_id` + 子 plan_module 整子树 (新 helper `get_plan_module_subtree_ids`, CTE 在 `plan_id` 内递归)
  - `plan_module_id` 有值 + `recursive=False` → 精确 `plan_module_id`
  - `plan_module_id=None` → 拉整个 plan (旧默认, controller 当前走这个)
  controller 暂不传 `plan_module_id`, 但 mapper 已 ready, 后续做"计划内目录导出" 入口时直接接上. `build_plan_module_path_map()` 不变.
- `file/__init__.py` — `TestCaseDemoFile` 保留 (v3 用作基底)
- `file/用例模版.xlsx` — **不动** (v3 复用, 不修改)

**端点契约**（POST + body, 与 v1 不兼容, 这是有意的）：
```
POST /api/hub/cases/export
  ?scope_type=library|plan         必填
  &scope_id=<module_id 或 plan_id> 必填
  &project_id=<int>                必填
  body (application/json):         可选
    {"case_ids": [100, 101]}         留空 = 范围内全量

200 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename*=UTF-8''<urlencoded>用例导出-{scope_type}{scope_id}-{YYYYMMDD-HHmmss}.xlsx

400 CommonError: scope_type 非法 / case_ids 解析失败 / 范围内无用例 / 超过 10k 硬上限
401: 鉴权失败
```

**实现要点**：
- **基底复用**：`openpyxl.load_workbook(TestCaseDemoFile)` 直接打开 `file/用例模版.xlsx`, 字体 (Calibri 12) / 列宽 / 标头不走样
- **行替换**：A1 cell 用 `_EXPORT_GUIDE` 常量 (5 条规则 + 标题) 整体覆盖; 模板原本"导入模板"那串 Tips 不沿用
- **增量列**：J2 = "用例ID" 覆盖模板原占位 "备注" (圆桌导出独有的协议列, 解析端按此识别 INSERT vs UPDATE)
- **真实数据**：从 row 3 起 1 用例 1 行, 步骤走 `format_steps_cell` 拼同 cell
- **隐藏 `_meta`**: `wb.create_sheet("_meta")` + `sheet.sheet_state = "hidden"`, 5 行 key/value, 列宽 A=24 B=60
- **路径分隔符**: `_walk_paths` 走 `"|".join(...)`, 与上传模板对齐
- **枚举 label**: `label_map.get(value, value)` 翻译, 缺 key 时回退原 value

**验收**：
- [ ] 命中 3 用例 (1 步 / 0 步 / 2 步) 的 fixture
  - 期望 1 标题行 + 1 标头行 + 3 data rows = 5 行 (demo 行已删, 不算入)
  - 步骤描述列 cell 内容: `"输入账号"` / `""` / `"【1】填手机号\n【2】填验证码"`
  - 步骤描述列 cell 换行符是 `\n` (不是 `\\n`)
- [ ] sheet 列表: `["用例数据", "_meta"]` (2 个 Sheet, `_meta` 隐藏)
- [ ] `_meta` 5 字段全对: `scope_type` / `scope_id` / `case_ids_at_export` / `exported_at` / `version=2`
- [ ] 枚举列用 label: DB `case_level="P1"` → Excel 写 `P1`; DB `case_type="GN"` → Excel 写 `功能用例`
- [ ] 路径列用 `|` 分隔: DB `module_id=5` 对应 `A/B/C` → Excel 写 `A|B|C`
- [ ] 列顺序正确: `用例ID` 在第 10 列 (最后一列)
- [ ] 模板 `file/用例模版.xlsx` 不被破坏 (导出后 hash 不变)
- [ ] 字体沿用模板 (Calibri 12), 标头不加粗 (与模板一致)
- [ ] 静态检查: 5 个改动文件 `ast.parse` 全过
- [ ] 路由: 现有 28+ 个 `@router.*` 全部原样保留
- [ ] 烟雾测: plan scope / library scope / case_ids 过滤 各跑一次

---

### PR-2: BE — 新增 `POST /api/hub/cases/import/preview` 端点

**目标**：重写 `roundtripReader` 适配 PR-1 的 10 列同构协议 + **保留** `_meta` 校验做跨 scope 防御 / 变更检测 / 版本号。**所有重活都在 PR-2 做**，PR-3 commit 阶段只走纯 `case_id` 驱动的写入。

**仓库**：`case_auto_hub`

**改动文件**：
- `utils/roundtripReader.py` — **重写**
  - `EXPECTED_DATA_COLUMNS` 改成 10 列（跟 PR-1 `exportCaseService.DATA_COLUMNS` 对齐）:
    `["标题*", "所属分组", "前置条件", "步骤描述*", "预期结果*", "标签", "用例等级*", "用例类型", "备注", "用例ID"]`
  - `SUPPORTED_META_VERSION = 2`（PR-1 export 写出去就是 2，跟老 v1 文件的 version=1 严格区分）
  - **保留并升级** `_read_meta()` / `_validate_meta()` / `META_SHEET_NAME`：读隐藏 Sheet `_meta`，比对 `scope_type` / `scope_id` / `version`，并用 `case_ids_at_export` 兜底"导回时 case 已被删" 场景
  - 步骤解析：调 `utils/stepCellFormatter.parse_steps_cell()` 把 cell 文本拆成步骤列表（`【1】xxx\n【2】yyy` → 列表），跳号 normalize 成 1..N 并打 warning
  - 路径反向：cell 里 `A|B|C` → `_split_group_path` 拆 → `find_group_path` 找 module_id（硬门禁，不存在 = 报错）
  - 枚举反向：cell 里 `P1` / `功能用例` → `caseEnumResolver` 的 `level_map` / `type_map` 查回 value；查不到 = 报错
  - `用例ID` 反向：整数 → 查 DB `test_case.id`；不存在 = 报错"该用例已被删除"
  - **DB scope 校验挪到 PR-2 做**（早期 fail 体验好）：用刚加的 `recursive` + `case_ids` 互斥 mapper
    - library: 已知 case 的 `module_id` 必须在 `scope_id` 子树内（`recursive=True`）
    - plan: 已知 case 的 `plan_case_association` 必须关联到 `plan_id`
    - 不在 scope 内 = 报错"该用例已不在当前范围"（防止"导出后被人挪走" 的脏数据）
  - 数据行起点 `data_row_base = 3`（row 1 = 标题 / row 2 = 表头 / row 3 = 第一条数据）
  - 列名匹配走"宽松匹配"（去掉 `*` + 空白）跟 aioFileReader 对齐；列名缺失 → 整批 reject
- `utils/stepCellFormatter.py` — **追加** `parse_steps_cell(cell_text) -> List[{"order": int, "action": str, "expected_result": str}]`
  - 与 `format_steps_cell` 对称；规则 0 步 / 1 步 / N 步跟 export 一致
  - 跳号 → normalize 后 warnings 报"原编号 X/Y 已重排"
- `app/service/uploadCacheService.py` — **`save_preview()` 接口不变**（`meta` / `scope_check` / `warnings` 字段**继续写**，PR-2 这边写啥 PR-3 那边读啥）
- `app/controller/test_case/test_case.py` — 现有 `/import/preview` 路由补 `mode=insert_only` 入参:
  - `mode="mixed"`（默认）：UPDATE + INSERT 混合
  - `mode="insert_only"`：含 `用例ID` 的行视为错误（前端在"纯新增" 场景下强制）
  - 解析异常 → 返 `Response.success({can_commit:false, ...})` 不抛；其他 → `CommonError`

**端点契约**（multipart, 跟 v1 一致）：
```
POST /api/hub/cases/import/preview (multipart/form-data)
  file=<xlsx>                  必填
  scope_type=library|plan      必填
  scope_id=<int>               必填
  project_id=<int>             必填
  mode=mixed|insert_only       默认 mixed

200 OK
  {
    "code": 0,
    "data": {
      "file_md5": "abc123...",
      "total_count": 4,
      "valid_count": 3,
      "invalid_count": 1,
      "errors": [
        {"row": 5, "errors": [{"field": "用例ID", "message": "..."}]}
      ],
      "warnings": [
        {"row": 3, "message": "步骤序号不连续, 已 normalize 为 1..N"}
      ],
      "meta": {                     // 透传 _meta Sheet, PR-3 commit 时可二次校验
        "scope_type": "library",
        "scope_id": "46",
        "case_ids_at_export": "4038,4080,4091",
        "exported_at": "2026-06-11T17:00:00",
        "version": "2"
      },
      "scope_check": {              // PR-2 一次性算好, PR-3 直接读
        "scope_type_matches": true,
        "scope_id_matches": true,
        "version_supported": true,
        "case_ids_in_excel_known": 3,
        "case_ids_in_excel_new": 1,
        "case_ids_at_export_total": 3,
        "case_ids_intersect_with_at_export": 3
      },
      "can_commit": false
    }
  }

400 CommonError: scope_type 非法 / 鉴权失败
注意: 解析失败不返 400, 返 can_commit=false 让前端展示错误明细
```

**实现要点**：
- **解析顺序**：先 `_read_meta` → 校验 `_meta`（`scope_type` / `scope_id` / `version`）→ 校验 `case_ids_at_export` → 解析主表 → 逐行反向解析（steps / path / enum / case_id / scope）
- **`_meta` 校验失败提前 return**：scope 不匹配 / version 不对，直接 `errors[0] = {...}` 不浪费后续解析
- **`case_ids_at_export` 比对**：从 `_meta.case_ids_at_export` 拿逗号分隔 ID 列表，校验 Excel 里所有 `case_id`（非空）都包含在内；漏一个 = 报错"该 case 不属于本次导出范围"（防止混入别处导出的 case）
- **步骤 cell 解析**：`parse_steps_cell` 单测覆盖 0/1/N 步 + 跳号 + 末尾空步
- **路径反向硬门禁**：library 路径不在 project_id 内 = reject 该行；plan 路径不在 plan_id 内 = reject 该行
- **DB scope 校验**：library 调 `TestCaseMapper.query_cases_for_export(project_id, scope_id, case_ids=known_ids, recursive=True)` 一次性拿 subtree，回查每个 `case_id` 的 `module_id` 是不是在结果集内；plan 调 `PlanCaseMapper.query_plan_cases_for_export(plan_id, case_ids=known_ids)` 拿关联，回查关联的 `plan_id` 一致
- **warnings 不阻断**：步骤跳号 / 字段名跟 DB 不一致 / 某些列空着 — 都进 warnings
- **每行 errors 累积**：单个行可以有多个 field-level error，前端按 `errors[row].errors[]` 展开

**验收**：
- [ ] 正常 3 用例 (1/0/2 步) → valid=3, invalid=0, can_commit=true
- [ ] 列名缺失 1 列 → invalid=3, can_commit=false, 错误含 "缺必填列"
- [ ] `用例ID` 填了不存在的值 → 该行 errors
- [ ] `所属分组` 路径不存在 → 该行 errors（library / plan 硬门禁）
- [ ] `用例等级` 填了不存在的 label → 该行 errors
- [ ] 步骤 cell `【1】xxx\n【3】zzz` (跳号) → warnings 不阻断, commit 阶段按 1..N 落库
- [ ] 文件 > 10MB → can_commit=false
- [ ] `_meta` 缺失 / version=1 (老 v1 文件) → 整批拒绝, 错误含"协议版本不兼容"
- [ ] `_meta.scope_type` 与 form 不一致 → 整批拒绝, 错误含"文件导出于 X:Y, 与当前范围不一致"
- [ ] Excel 里 `case_id` 不在 `_meta.case_ids_at_export` → 该行 errors"不属于本次导出范围"
- [ ] 已知 case 当前 `module_id` 已不在 scope 子树内 → 该行 errors"该用例已不在当前范围"
- [ ] `mode=insert_only` + 含 `用例ID` 的行 → 该行 errors, can_commit=false
- [ ] 静态：4 个改动文件 (`utils/roundtripReader.py` / `utils/stepCellFormatter.py` / `app/controller/test_case/test_case.py` / `app/service/uploadCacheService.py`) `ast.parse` 全过
- [ ] 路由：现有路由全部原样保留

---

### PR-3: BE — 新增 `POST /api/hub/cases/import/commit` 端点

**目标**：重写 v1 的 `roundtripCommitService`, 去掉乐观锁 (走 DB 事务). `_meta` 校验 / `case_ids_at_export` 比对 / known case scope 校验都在 PR-2 一次性算好了, PR-3 **直接信任** preview 缓存里的 `scope_check` / `meta` / 已反向解析过的字段值, 走纯 `case_id` 驱动的写入。

**仓库**：`case_auto_hub`

**改动文件**：
- `app/service/roundtripCommitService.py` — **重写**
  - 砍掉 `_check_optimistic_lock()`（不在 Excel 里放 `update_time` 列了, 走 DB 事务隔离）
  - **不再做** `_meta` 校验 / `case_ids_at_export` 比对（PR-2 preview 阶段已经做完, 缓存里 `scope_check.version_supported` / `scope_check.case_ids_intersect_with_at_export` 都是已经算好的 bool, 直接读)
  - **不再做** known case 的 scope DB 校验（PR-2 已经用 mapper 校验过, 写入了 preview 行的 `scope_validated=true`)
  - 流程：加载 preview 缓存 → 校验 `can_commit=true` → 按 (用例ID) 分 known / new → 逐 case 走 update_or_insert → 步骤全量覆盖 → 计划 order 重排
  - 计划 order：直接按 Excel 物理行号（header 之后第 1 行 = order 1）展开成 `before_id / after_id` 锚点
- `app/mapper/test_case/testcaseMapper.py` — `update_with_optimistic_lock()` 砍掉（v2 不用了），改回基础 `update_case()`
- `app/mapper/test_case/testCaseStepMapper.py` — `replace_case_steps()` **保留**（v2 仍走全量覆盖）
- `app/controller/test_case/test_case.py` — 新增 `@router.post("/import/commit")` 路由

**端点契约**：
```
POST /api/hub/cases/import/commit (multipart/form-data)
  file_md5=<md5>                 必填
  scope_type=library|plan        必填
  scope_id=<int>                 必填
  project_id=<int>               必填

200 OK
  {
    "code": 0,
    "data": {
      "updated": 2,
      "inserted": 1,
      "reordered": 3,            // plan scope 才有意义
      "errors": []
    }
  }

400 CommonError: file_md5 缓存不存在 / can_commit=false 时拒绝
```

**10 步 commit 流程**：
```
1) 加载 Redis 预览缓存
2) 校验: 缓存存在 + can_commit=true + scope_check.version_supported=true
3) 按 case_id 拆分: known (有 id) / new (id 为空)
4) known: 逐 case → update 字段 (走 update_case) + replace 步骤 (DELETE+INSERT)
5) new: 逐 case → insert case (is_common=True) + 步骤 (0 步骤合法)
6) plan 场景: 给 new case 关联到 plan (plan_module_id 走兜底)
7) plan 场景: 按 Excel 物理行号 1..N 重排 (调 reorder_plan_cases_bulk)
8) 缺失用例: 无操作 (圆桌不删)
9) 提交: 整批单事务;任一必填校验失败 → 整批回滚
10) 返回 { updated, inserted, reordered }
```

**实现要点**：
- **单事务**：`TestCaseMapper.transaction()` 为锚点
- **无乐观锁**：依赖 DB 事务隔离 + 整批回滚
- **步骤全量覆盖**：`DELETE + INSERT`，FK ON DELETE CASCADE 自动清 `case_sub_step_result`
- **排序**：物理行号直接映射成 `order = 1, 2, ...`，调现有 `reorder_plan_cases_bulk`
- **0 步骤合法**：步骤 cell 都空 = 不创建任何步骤行
- **缓存安全**：`mark_committed` 在事务外

**验收**：
- [ ] happy path (library, 2 known + 1 new)：updated=2, inserted=1, reordered=0
- [ ] happy path (plan, 3 known + 1 new)：updated=3, inserted=1, reordered=4
- [ ] 整批回滚：1 行 `所属分组` 不存在 → 全部不动, errors 含该行
- [ ] 步骤 cell `【1】\n【3】` (跳号) → commit 时 normalize 成 `【1】, 【2】`
- [ ] 缓存不存在 → 报错
- [ ] 静态：4 个改动文件 `ast.parse` 全过
- [ ] 路由：现有 28 个 `@router.*` 全部原样保留

---

### PR-4: FE — `ExportCaseModal` + `ImportCaseModal` + 工具栏接入

**目标**：scope 通用的导出 / 导入 modal，工具栏接入。

**仓库**：`caseHubWeb`

**改动文件**：
- `src/api/case/testCase.ts` — 新增 `exportCaseExcel` / `importRoundtripPreview` / `importRoundtripCommit` 三个 API
- `src/pages/CaseHub/components/ExportCaseModal.tsx`(**新**) — scope 锁定导出弹窗
- `src/pages/CaseHub/components/ImportCaseModal.tsx`(**新**) — scope 锁定导入弹窗
- `src/pages/CaseHub/CaseLibrary/CaseDataTable.tsx` — 工具栏加 ExportCaseModal + ImportCaseModal (老 `UploadCaseModal` 保留)
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/index.tsx` — 工具栏加 ExportCaseModal, ImportCaseModal 替换老 `PlanCaseImportModal` 调用位

**关键符号**：
- `exportCaseExcel({scope_type, scope_id, project_id, case_ids?})` — GET 圆桌导出
- `importRoundtripPreview(file, {scopeType, scopeId, projectId})` — preview, multipart
- `importRoundtripCommit({fileMd5, scopeType, scopeId, projectId})` — commit
- `ExportCaseModal` Props: 联合类型 `LibraryProps` / `PlanProps`
- `ImportCaseModal` Props: 同上

**用户体验**：
- 导出按钮: scope 锁定, 文案自带 "用例库模块" / "测试计划" 区分
- 导入按钮: 三段式 (上传 → preview → commit), 用户能清晰看到每一步结果
- 错误展示: 最多列 10 行, 超出 "还有 N 行", 不爆屏
- 缓存清理: 弹窗关闭/取消时自动 `cancelImportCase`

**保留兼容 (老入口暂不删)**:
- `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` — 老的 9 列格式 + /upload 链路
- `src/pages/CaseHub/CasePlan/PlanInfo/PlanCases/PlanCaseList/components/PlanCaseImportModal.tsx` — 老的计划导入

**E2E 联调 (PR-4 收尾时跑)**:
- [ ] 库场景: 导 → 改 → 导回, 验证字段回写
- [ ] 库场景: 导 → 删几行 → 导回, 验证 keep 不删
- [ ] 库场景: 导 → 改 1 条 `所属分组` → 导回, 验证 module_id 改对
- [ ] 库场景: 导 → 改 1 条 `用例等级` 标签 (`P1` → `P2`) → 导回, 验证 level 落库正确
- [ ] 库场景: 导 → 加 1 行 `用例ID` 留空 → 导回, 验证 INSERT
- [ ] 计划场景: 导 → 拖几行调换顺序 → 导回, 验证 order 落库为 1..N
- [ ] 计划场景: 导 → 删 3 行 → 导回, 验证缺失的 3 条仍在计划中
- [ ] 跨 scope 防御: 把 plan:123 的导出上传到 plan:456, 验证 preview 拒绝 (PR-2 `_meta` 校验 + known case scope 校验两道防线)
- [ ] 步骤多行 cell: 导 1 用例 (3 步) → 1 行 Excel → cell 内 `【1】xxx\n【2】yyy\n【3】zzz` → 导回 → 步骤 3 行

**不在 PR-4 范围**:
- 删老 `UploadCaseModal` / `PlanCaseImportModal` (→ 等 E2E 跑通)
- README / 项目文档更新 (→ PR-5)

---

## 部署注意

1. **`file/用例模版.xlsx` 复用而非修改**：v2 直接 `load_workbook` 这个文件做基底, row 1 标题在内存里替换, 模板本身字节不变. 部署时确认 `file/用例模版.xlsx` 已就位 (跟 v1 一样在 `.gitignore` 的 `file/` 范围内, Docker `COPY file/ /app/file/`)
2. **`_meta` Sheet 用 openpyxl 创建 + 隐藏 (PR-1 export 写出去, PR-2 preview 读回来)**: `wb.create_sheet("_meta")` + `sheet.sheet_state = "hidden"`, 列宽 A=24 B=60
3. **`_meta.version = 2` 严格区分老文件 (PR-1 写 / PR-2 读两端都要对齐)**:
   - PR-1 写出去: `_meta.version = "2"`, 跟下载模板 (无 `_meta` Sheet, 也无 version 概念) 互不影响
   - PR-2 读进来: `SUPPORTED_META_VERSION = 2`, 老 v1 (version=1) 文件直接整批 reject. 未来 v3 升级时改这个常量
4. **`utils/stepCellFormatter.py` 双向 (PR-1 + PR-2 公共依赖)**:
   - `format_steps_cell(steps, field)` — 导出端把步骤列表拼到单 cell
   - `parse_steps_cell(cell_text) -> List[dict]` — PR-2 解析端把 cell 拆回步骤列表
5. **`utils/roundtripReader.py` 行为变化 (PR-2)**：v1 已经把 `_meta` 校验逻辑写进去了, PR-2 改成基于 10 列的新协议, 老的 import 调用方会失败; 但前端 PR-4 才会发, 所以 BE 单独 ship 也不会破
6. **Redis 缓存结构 (PR-2 写 / PR-3 读)**: `save_preview` 继续存 `valid_rows` / `meta` / `scope_check` / `warnings`, 字段含义跟 PR-2 解析输出 1:1 对齐, PR-3 commit 直接读不重算. PR-2 算好的 `scope_check.version_supported` / `scope_check.case_ids_intersect_with_at_export` 等 bool 在 PR-3 直接信任
7. **乐观锁依赖 DB 事务 (PR-3)**：v2 不在 Excel 里带 `update_time`, commit 走 DB 事务隔离 + 整批回滚; 并发场景下两个用户同时改同一行, 后提交的人看到"该行未生效"
8. **PR-2 解析的 `data_row_base = 3`**：跟 PR-1 写出去的 row 结构 (row 1 = 标题 / row 2 = 表头 / row 3 起 = data) 对齐. 跟 aioFileReader 默认 `header_row+1=3` 数据起点一致
9. **DB scope 校验挪到 PR-2**: PR-2 已知 case 的 scope 校验用刚加的 `recursive` + `case_ids` 互斥 mapper (library 走 `query_cases_for_export` 子树, plan 走 `query_plan_cases_for_export` 白名单), 一次性算完; PR-3 不再重做

## 整体范围

### 做
- BE：3 个新端点（`/export` 重写, `/import/preview` 新, `/import/commit` 新）+ 1 个共享工具（`stepCellFormatter`, 双向 format/parse）+ 1 个枚举 label 加载
- BE：删除 v1 残留（`编辑指引.txt` + `编辑指引` Sheet 写盘逻辑, `update_with_optimistic_lock`）。`_meta` Sheet **保留并升级**到 version=2
- FE：1 对 scope 通用 modal + 工具栏接入

### 不做
- 任何形式的删除（删 case 本体 / 移除 plan 关联 / 缺失用例整组替换）
- `编辑指引` Sheet（v3 改用 row 1 标题引导, 不再单独 Sheet）
- 异步导出 / 异步 commit（>10k 用例留作二期）
- 计划关联字段（`is_review` / `first_status` / `second_status` / `bug_url`）的 Excel 化
- `on_duplicate: skip | create` 复杂选项（圆桌直接 insert）
- 乐观锁显式比（依赖 DB 事务）
- 跨 scope 防御靠前端传参强校验（PR-2 已经在 preview 阶段做掉 `_meta` + DB scope 两道防线, PR-3 信任 preview）
