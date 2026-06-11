# Brainstorm: 测试用例 导出-编辑-导回 回路 (修正版)

> Created: 2026-06-11 11:00 (v1)
> Rewritten: 2026-06-11 (v2, 重新设计 — 导出于上传模板对齐)
> 项目: caseHubWeb (FE) + case_auto_hub (FastAPI BE)
> 范围: 公共用例库 (Case Library) + 测试计划 (Case Plan)
> 不在范围: 需求-用例(即将下线)

## 修正原因 (v1 → v2)

v1 设计了一个 14 列的圆桌模板 (排序 + 用例ID + UID + 步骤序号 + 更新时间)，跟现有 `用例模版.xlsx` (9 列) 不一致。用户在导出后**没法直接用现成的上传流程二次导入**，UX 割裂。

v2 把导出跟上传**做成同构模板**，唯一的差别是多一列 `用例ID`（放最后一列）做回写定位。导出 = 填充数据的 `用例模版.xlsx`，上传 = 沿用 `用例模版.xlsx` 走老链路。

## 设计

### 1. 文件结构

**两个 Sheet, 1 显 1 隐**：
- **Sheet 1 `用例数据`**: 以 `file/用例模版.xlsx` 为基底生成, **前 2 行结构**与下载模板一致 (行 1 标题引导 / 行 2 标头), **行 3 起就是真实数据** (原模板 row 3 的 demo 行已 `delete_rows(3, 1)` 删除)
- **Sheet 2 `_meta` (隐藏)**: 5 行元信息 (`scope_type` / `scope_id` / `case_ids_at_export` / `exported_at` / `version=2`), 导回时做跨 scope 防御 + 变更检测
- 下载模板 `file/用例模版.xlsx` **不动**, `downloadCaseDemo` 接口照旧返原文件

### 2. 列（10 列固定，跟上传模板同构，`用例ID` 放最后）

| # | 列名 | 来源 | 备注 |
|---|---|---|---|
| 1 | `标题*` | `case_name` | 必填 |
| 2 | `所属分组` | `group_path` | **`|` 分隔，例 `AA|aa|a1`**（和上传一致）|
| 3 | `前置条件` | `case_setup` | |
| 4 | `步骤描述*` | `steps[].action` | **多步同 cell 拼 `【1】xxx\n【2】yyy\n【3】zzz`**（和上传一致）|
| 5 | `预期结果*` | `steps[].expected_result` | **同上** |
| 6 | `标签` | `case_tag` | |
| 7 | `用例等级*` | `case_level` | **写 `case_config` 的 label（`P1`）**，不是 value。导回时按 label 查回 value 入库 |
| 8 | `用例类型` | `case_type` | **写 label（`功能用例`）**，不是 value。导回时按 label 查回 value 入库 |
| 9 | `备注` | `case_mark` | |
| 10 | **`用例ID`** | `test_case.id` | **新位置：最后一列**。空 = INSERT；非空 = UPDATE |

加粗 + 冻结首行（和现有 `用例模版.xlsx` 一致）。

### 3. 导出规则

- **library scope**：范围内 case，按当前 ProTable 排序输出
- **plan scope**：范围内 case，按 `plan_case_association.order` 升序（与执行序一致）
- **步骤拼装**：
  - 0 步：`步骤描述` / `预期结果` 两 cell 都空
  - 1 步：单条不加 `【1】` 前缀（保持现有模板风格）
  - N 步：每步前加 `【1】`、`【2】`...，步骤间 `\n` 换行
- **`所属分组` 路径**：
  - library 走 `module` 表，按 `parent_id` 回溯拼出 `A|B|C`
  - plan 走 `plan_module` 表，同上
- **枚举值**：用 `case_config.label`（例 `P1` / `功能用例`），不用 `case_config.value`（例 `P1` / `GN`）
- **`用例ID` 永远填值**（library / plan 都填）

### 4. 导入规则

```
用例ID 留空                  → INSERT 新用例
用例ID 填值, DB 中存在        → UPDATE 该用例 (字段 + 步骤全量覆盖)
用例ID 填值, DB 中不存在      → 报错, 该行无效 (该 case 已被删除)
Excel 中某行被删              → DB 中对应 case 不动 (圆桌不删)
```

字段更新白名单（圆桌可改）：`case_name` / `case_setup` / `case_mark` / `case_level` / `case_type` / `case_tag` / `module_id`(library) / `plan_module_id`(plan)。
**不可改**：`id` / `uid` / `create_time` / `update_time` / `creator` / 计划关联字段 (`is_review` / `first_status` / `second_status` / `bug_url`)。

步骤行：
- 同一 `用例ID` 下，cell 里 `【n】` 编号**连续从 1 开始** → 视为有效步骤，按 cell 内编号 upsert
- 0 步骤用例 = 两 cell 都空 → 不创建任何步骤行
- 步骤行**全量覆盖**：cell 中未出现的步骤序号 = 删除

### 5. 计划场景的"顺序"

**物理行号就是顺序**，**无 `order` 列**。Commit 阶段按 Excel 行号（header 之后第 1 行 = order 1，第 2 行 = order 2...）重排 `plan_case_association.order`：

```
Excel 第 2 行  → plan_case_association.order = 1
Excel 第 3 行  → order = 2
...
```

### 6. 不导出的字段

- `UID` — 砍
- `排序` — 砍（物理行号就是 order）
- `步骤序号` — 砍（多步已拼到同 cell）
- `更新时间` — 砍（很多空，且不是用户关心的）
- `is_review` / `first_status` / `second_status` / `bug_url` — 砍（计划关联字段，不在用例本体）
- `creator` / `updater` / `create_time` / `update_time` — 都不导

### 7. 端点

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/api/hub/cases/export?scope_type=&scope_id=&project_id=`, body `{"case_ids":[]}` | xlsx 下载 |
| POST | `/api/hub/cases/import/preview` (multipart) | 解析 + 校验，返回 file_md5 |
| POST | `/api/hub/cases/import/commit` (multipart) | 落库：INSERT/UPDATE + 步骤覆盖 + 顺序重排 |
| POST | `/api/hub/cases/import/cancel` (file_md5) | 取消预览，清理 Redis 缓存 |

### 8. 前端

- **`ExportCaseModal`**(scope 通用)：范围确认 + 选项（仅当前选中 / 全量） + 调 `/export` 下载
- **`ImportCaseModal`**(scope 通用)：上传 → preview → commit 三段式；兼容老 `UploadCaseModal` / `PlanCaseImportModal` 调用位
- **`CaseDataTable` (用例库) 工具栏**：在导入按钮旁加"导出"按钮（下载图标）
- **`PlanCaseList` (计划) 工具栏**：同上
- 老 `UploadCaseModal` / `PlanCaseImportModal` **保留兼容**，等 E2E 跑通后再删

### 9. 关键设计点

- **不删**：圆桌不删任何东西；Excel 中缺行 = DB 保留
- **不查重**：(module_id, case_name) 不查重，圆桌 INSERT 直接 insert
- **步骤全量覆盖**：用 `(case_id, 步骤序号)` upsert；cell 中未出现的序号 = 删
- **0 步骤合法**：两 cell 空 = 不创建任何步骤行；不调 `handleAddStepLine`
- **乐观锁**：复用 DB 现有的 `update_time` 字段（不在 Excel 里出现，导回时不显式比，靠 DB 事务 + `WHERE id=?` 自然失败重试）
- **不引入新协议**：列名 = 解析 key，跟上传模板 `aioFileReader.FIELD_MAPPING` 一致；解析器直接复用
- **大文件**：单次导出 ≤ 10k 用例（与 v1 一致）；上传 ≤ 10MB

### 10. 错误处理

| 错误 | 表现 | 处理 |
|---|---|---|
| 列名不匹配 / 缺必填列 | preview 拒绝 | 弹窗报错"文件格式不兼容，请重新导出" |
| `用例ID` 填了非整数 | preview 拒绝该行 | 行级 errors |
| `用例ID` 填了但 DB 不存在 | preview 拒绝该行 | 行级 errors "该用例已被删除" |
| `所属分组` 路径不存在 | preview 拒绝该行 | 沿用 `find_group_path` 硬门禁 |
| `用例等级` / `用例类型` label 找不到对应 value | preview 拒绝该行 | 行级 errors "枚举值非法" |
| 步骤 cell 里 `【n】` 编号不连续 | preview 警告 | 不阻断，commit 时按出现顺序 normalize 成 1..N |
| Excel 文件超过 10MB | preview 拒绝 | 提示缩小范围 |

### 11. 范围 / 不在范围

#### 做
- BE：`/export` 端点（重写，输出 10 列同构模板）
- BE：`/import/preview` 端点（**重写** `roundtripReader` 为 10 列同构协议 + **保留** `_meta` 校验做跨 scope 防御 / 变更检测 / version=2, **所有重活在 PR-2 一次性做完** 让 PR-3 走纯写入）
- BE：`/import/commit` 端点（重写 `roundtripCommitService`, 去掉乐观锁, 信任 PR-2 preview 缓存里的 `scope_check` / `meta` / 已反向解析的字段值, 走纯 `case_id` 驱动的写入)
- BE：`/import/cancel` 端点
- FE：`ExportCaseModal` + `ImportCaseModal`
- FE：工具栏接入

#### 不做
- 任何形式的删除
- 编辑指引 Sheet（v3 把编辑引导写到 row 1, 不再单独 Sheet）
- 异步导出 / 异步 commit
- 计划关联字段（`is_review` / `first_status` / `second_status` / `bug_url`）的 Excel 化
- `on_duplicate: skip | create` 复杂选项
- 下载模板 `file/用例模版.xlsx` 改动 (v3 完全不动)

#### 跟 v2 差异
- **加回 `_meta` Sheet (隐藏)**: 跨 scope 防御、变更检测、版本号
- **用 `file/用例模版.xlsx` 做基底**: 复用其字体/样式/3 行结构, 不再 openpyxl 凭空搭
- **row 1 是标题 + 编辑引导** (不再单独 Sheet), 引导是 5 条规则, 从用户立场写
- **demo 行已删**: `ws.delete_rows(3, 1)` 删除原模板 row 3 的 demo 数据. 导出代表真实用例, 留 demo 会被 PR-2 误读成 INSERT 假数据. 删完后真实数据从 row 3 写起, 与 aioFileReader 默认 `header_row+1=3` 的数据起点对齐
- **协议版本号 = 2** (与下载模板的 N/A 区分)

## 端到端契约（待落地）

### POST /api/hub/cases/export

```
POST /api/hub/cases/export
  ?scope_type=library|plan         必填
  &scope_id=<module_id 或 plan_id> 必填
  &project_id=<int>                必填
  body (application/json):         可选
    {"case_ids": [100, 101]}         留空 = 范围内全量

200 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename*=UTF-8''<urlencoded>用例导出-{scope_type}{scope_id}-{YYYYMMDD-HHmmss}.xlsx

错误:
  400 CommonError: scope_type 非法 / 范围内无用例 / 超过 10k 硬上限
  401: 鉴权失败
```

**为什么 POST + body 不是 GET + query**:
5000 条 case_id * 平均 8 位 ≈ 40K 起步, 拼到 query 容易被网关/反代 URL 长度限制截断
(常见阈值 8K~16K). 改 POST + body 是规范做法, scope 三必填仍走 query 保留"定位范围"语义.

### POST /api/hub/cases/import/preview

```
POST /api/hub/cases/import/preview (multipart/form-data)
  file=<xlsx>                       必填
  scope_type=library|plan           必填
  scope_id=<int>                    必填
  project_id=<int>                  必填

200 OK
  {
    "code": 0,
    "data": {
      "file_md5": "abc123...",
      "total_count": 4,
      "valid_count": 3,
      "invalid_count": 1,
      "errors": [
        {"row": 5, "errors": [{"field": "用例ID", "message": "该用例已被删除"}]}
      ],
      "warnings": [
        {"row": 3, "message": "步骤序号不连续, 已 normalize 为 1..N"}
      ],
      "can_commit": false
    }
  }
```

### POST /api/hub/cases/import/commit

```
POST /api/hub/cases/import/commit (multipart/form-data)
  file_md5=<md5>                    必填
  scope_type=library|plan           必填
  scope_id=<int>                    必填
  project_id=<int>                  必填

200 OK
  {
    "code": 0,
    "data": {
      "updated": 2,
      "inserted": 1,
      "reordered": 3,           // plan scope 才有意义
      "errors": []
    }
  }

400 CommonError: file_md5 缓存不存在 / can_commit=false
```

## Alternatives Considered (本次修正后保留)

- **B. 沿用 v1 14 列模板**：用户拒绝，理由"导出和上传两份模板心智负担大"
- **C. 不导出当前数据，只支持"下载模板 + 全部新建"**：用户拒绝，理由"看不到现状改不了"

## Open Questions (已全部决议)

| 议题 | 决议 |
|---|---|
| 用例ID 留空是 INSERT 还是只 UPDATE？ | INSERT（自然衔接上传模板的语义） |
| plan 场景的 order 怎么体现？ | 物理行号就是 order，无 `order` 列 |
| plan 关联字段 (`is_review` / 状态 / `bug_url`) 要不要带？ | 全部不带 |
| 枚举值用 label 还是 value？ | label (`P1` / `功能用例`)，不是 value (`P1` / `GN`) |
| 路径分隔符？ | `\|`（与上传一致） |
| 多步怎么放？ | 同 cell 换行 + `【n】` 前缀（与上传一致） |
| 模板要几列？ | 10 列，跟上传模板同构，多一列 `用例ID` 放最后 |
| 模板要不要 `_meta` / 编辑指引 / 隐藏 Sheet？ | 全部不要，单 Sheet |
| 乐观锁怎么办？ | 不在 Excel 里显式比；走 DB 事务 + `WHERE id=?` 自然失败 |
