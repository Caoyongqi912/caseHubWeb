# Brainstorm: 测试用例 导出-编辑-导回 回路(用例库 + 测试计划)

> Created: 2026-06-11 11:00
> Last updated: 2026-06-11 11:10 (Open Questions 决议 + 设计瘦身)
> 项目: caseHubWeb (FE) + case_auto_hub (FastAPI BE)
> 范围: 公共用例库 (Case Library) + 测试计划 (Case Plan)
> 不在范围: 需求-用例(需求模块即将下线)

## Context

当前 caseHubWeb 的导入/导出能力只覆盖 "下载空模板 + 全新增" 单向:

- 后端 `GET /api/hub/cases/downloadCaseDemo` 返回 `file/用例模版.xlsx` 这个**静态空模板**;前端 `downloadCaseExcel` 只是透传
- 后端 `POST /api/hub/cases/upload` 解析 Excel 入 Redis 预览缓存,`/upload/commit` 走 `TestCaseMapper.insert_upload_case`,**仅 insert,不 update**
- 前端 `UploadCaseModal`(用例库) 和 `PlanCaseImportModal`(计划) 共用同一份 "只新增" 流程

业务侧需要的能力闭环:
1. 在 Web 表格里 **看到/筛选出一批用例**
2. 导出为 Excel(带当前数据 + 子步骤)
3. 在 Excel 里:改字段 / 改子步骤 / 增删行
4. 把 Excel 上传回去,系统按 Excel 行序重排数据库,改的归位、增的插入到正确位置
5. 计划场景下还要保持 **执行顺序**

后端已有的 "锚点重排" 能力(`bulk_reorder_plan_case` 的 `before_id` / `after_id` 机制)与"两步预览 + 提交" 链路(`upload` → `upload/commit`)都可以复用,只缺**导出端点** 和 **commit 阶段的 update + order 分支**。

## Goals

- 闭环:任意一次"导出 → 编辑 → 导回"在不改后端数据契约的前提下可往返
- 排序保留:
  - 计划场景的 `order` 列必须**显式落库**,按 Excel 行序 1..N 重排
  - 用例库场景不强求 `order`(用例库无硬顺序)
- 改/增合一:同一份 Excel 既能改已有用例,也能新增用例;用户不需要选模式
- **不删原则**:圆桌导入不删除用例、不移除关联。`case_id` 存在 → update;`case_id` 为空 → insert;Excel 中不存在的 case → 维持原样
- **不查重原则**:圆桌插入不检查 `(分组, case_name)` 是否重复;插入什么就是什么
- 子步骤"完全覆盖":用 `(case_id, 步骤序号)` upsert,序号不再出现 = 步骤删除;序号新增 = 步骤新增
- 与现有 `handleAddStepLine` 解耦:Excel 里 0 步骤 = 用例 0 步骤,后端不自动建默认步骤行
- 乐观锁:用 `update_time` 防"导回时别人已经改过" 的覆盖
- 体验统一:用例库 / 计划 共用同一份 `ExportCaseModal` + 升级版 `ImportCaseModal`,只换 `scope` 参数
- 编辑安全:Excel 自带 `编辑指引` Sheet,告知用户哪些列/页不要动

## Non-Goals

- 需求-用例回路:`Requirement` / `RequirementCaseAssociation` / `PlanRequirementAssociation` / `IRequirement` / `reorderTestCase` 即将下线,本设计不涉及
- 步骤自动初始化:不调用 `handleAddStepLine`,不创建占位步骤
- 任何形式的"删除"操作(无论是删 case 本体,还是移除 plan/case 关联):本设计圆桌**不删除任何东西**
- "缺失用例整组替换" / `missing_action`:不在范围(用户明确反对)
- `on_duplicate: skip | create`:不在范围(用户明确反对,新 case 直接插入)
- 计划特有字段(关联级 `is_review` / `first_status` / `second_status` / `bug_url`):不导出、不在 Excel 中编辑;这些字段仍可走计划页面独立流程修改
- Excel 公式、跨表引用、宏:导出文件不写公式,纯值
- 异步导出(>10k 行分批 + 邮件通知):首版同步导出即可,留作后续优化
- 国际化多语言:导出文案用中文固定(和现有 `用例模板.xlsx` 一致)
- 权限细分:沿用现有 `Authentication()` 登录校验,不做 "仅 admin 可导出" 这种细粒度;后续如需要再加

## Chosen Approach

### 1. Excel 文件结构(3 个 Sheet)

**Sheet 1: `用例数据`(主表,可见)**

固定列顺序如下(列名即表头,**加粗 + 冻结首行**):

| # | 列名 | 类型 | 说明 |
|---|---|---|---|
| 1 | `排序` | 整数 | **显式 order**,从 1 递增,后端以这一列为准,不用物理行号 |
| 2 | `用例ID` | 整数 | 空 = 新增;非空 = 按 id 走 update |
| 3 | `UID` | 字符串 | 给肉眼识别"这是同一条",仅展示用,不参与定位 |
| 4 | `用例名称` | 字符串 | 必填 |
| 5 | `用例等级` | 枚举 | `P0/P1/P2/P3` (从 `useCaseEnumConfig('CASE_LEVEL')`) |
| 6 | `用例类型` | 整数 | 从 `useCaseEnumConfig('CASE_TYPE')`) |
| 7 | `用例标签` | 字符串 | 多标签 `,` 分隔,沿用现有导入规则 |
| 8 | `所属分组` | 字符串 | 路径式,例如 `登录/账号/邮箱登录`;library scope 解析为 `module`,plan scope 解析为 `plan_module` |
| 9 | `前置条件` | 字符串 | `case_setup` |
| 10 | `备注` | 字符串 | `case_mark` |
| 11 | `步骤序号` | 整数 | 同一 `用例ID` 下从 1 开始;0/空 = 该行无步骤;一个用例多步 = 多个 Excel 行,`用例ID` 相同,`步骤序号` 递增 |
| 12 | `操作步骤` | 字符串 | `action` |
| 13 | `预期结果` | 字符串 | `expected_result` |
| 14 | `更新时间` | 时间 | **乐观锁**;导出时写入当前 DB 时间,导回时不匹配则报"该用例已被他人修改" |

**Sheet 2: `编辑指引`(可见,作为用户说明书)**

固定文案,首版内容:

```
# 编辑指引 (重要!请先读完)

1. 不要删除 / 重排 / 重命名 任何 Sheet
2. 不要修改 _meta Sheet 的内容(它是隐藏的,如果看到也别动)
3. 不要修改 "用例ID" 列(新增行留空即可)
4. 不要修改 "更新时间" 列(它是乐观锁,后端用来检测冲突)
5. 可以放心修改的列:用例名称 / 等级 / 类型 / 标签 / 所属分组 / 前置条件 / 备注 / 操作步骤 / 预期结果
6. 一个用例有多步时,保持 "用例ID" 相同,复制多行,"步骤序号" 1, 2, 3... 递增
7. 新增用例:"用例ID" 留空,填其他列即可
8. 删除用例:不要在 Excel 里删行;本圆桌不删除任何用例。如果需要"从计划中移出某条",请走计划页面的"移出" 功能
9. 排序列由系统管理:可以手动调换顺序,只要保证 1..N 连续即可;后端会做 normalize
```

**Sheet 3: `_meta`(隐藏,系统信息)**

| 键 | 值 | 用途 |
|---|---|---|
| `scope_type` | `library` \| `plan` | 父级类型;上传时强校验必须与导入弹窗选择的一致 |
| `scope_id` | `module_id` \| `plan_id` | 父级 ID;上传时强校验必须与导入弹窗选择的一致 |
| `case_ids_at_export` | `100,101,102` | 导出时的用例 ID 集合;**信息性**,不再强校验,仅供前端比对做提示 |
| `exported_at` | `2026-06-11 10:55:00` | 导出时间 |
| `version` | `1` | 文件格式版本,后续不兼容时递增 |

### 2. 端点设计(后端,FastAPI)

全部走 `/api/hub/cases/...` 前缀,**与现有路由并列**,不替换:

| 方法 | 路径 | 用途 | 复用点 |
|---|---|---|---|
| GET | `/api/hub/cases/export` | 按 scope 导出 xlsx | 新增;基于 `AsyncFilesReader` 反向 |
| POST | `/api/hub/cases/import/preview` | 解析 Excel 入预览缓存(支持 update) | 复用 `upload` 解析逻辑,加 `mode=mixed` |
| POST | `/api/hub/cases/import/commit` | 提交入库,执行 insert/update + 排序 | 复用 `upload/commit`,加 `apply_order` / `scope` |
| POST | `/api/hub/cases/import/cancel` | 取消预览 | 等价 `upload/cancel`,可合二为一 |

**`/export` 入参**:
```
GET /api/hub/cases/export?scope_type=plan&scope_id=123
                  &case_ids=100,101   # 可选;不传 = 全量
                  &include_steps=1     # 默认 1
```
响应:`FileResponse`,`media_type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,文件名 `用例导出-plan123-20260611-105500.xlsx`。

**`/import/preview` 入参**(`multipart/form-data`):
```
file: 二进制
project_id: 必填
scope_type: library | plan
scope_id: 对应 module_id 或 plan_id
mode: mixed(默认) | insert_only
```

**`/import/preview` 响应**:
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
    "case_ids_at_export_intersect_with_excel": 45
  }
}
```

**`/import/commit` 入参**:
```json
{
  "file_md5": "...",
  "project_id": 1,
  "scope_type": "plan",
  "scope_id": 123,
  "apply_order": true
}
```

> 注:本设计无 `missing_action`、无 `on_duplicate_new`。圆桌永远 keep + 永远 insert。`apply_order` 永远传 `true`(前端不暴露开关)。

### 3. 后端执行流程(`/import/commit` 内部)

```
1. 读 Redis 预览缓存 -> 解析后的行 rows[]
2. scope 校验: Excel _meta.scope_type / scope_id 必须与请求参数一致,否则 400
3. 按 case_id 拆分:
   known_rows   = rows[case_id != null]
   new_rows     = rows[case_id == null]
4. 乐观锁 (仅 known_rows):
   逐行 SELECT update_time; 与 Excel 中记录的 update_time 不一致 -> 整笔回滚,逐行报错
5. 步骤处理(完全覆盖):
   同一 case_id 下,按 (步骤序号) upsert;
     - Excel 中出现的 (case_id, 步骤序号)  → upsert (action / expected_result)
     - Excel 中"该 case_id 下未出现的步骤序号"  → DELETE
     (级联 case_sub_step_result 由 FK ondelete=cascade 自动处理)
     - 步骤序号为空 → 该行不创建步骤(只更新/创建用例头)
     - 0 步骤用例 → 不创建任何步骤行
6. 字段更新 (known_rows): UPDATE test_case SET ... WHERE id=? AND update_time=?
7. 新增入库 (new_rows): 调用现有 TestCaseMapper.insert_upload_case 路径,
   project_id / module_id / plan_module_id 由 scope 决定
8. 排序 (apply_order=true):
   a. 收集 Excel 中所有 case_id(已知 + 新建后拿到的 id),按 排序 列 1..N 重新编号
   b. 计划场景: 调用 bulk_reorder_plan_case(为 N 条 items 构造 before_id / after_id 锚点)
      或自实现 N 条 UPDATE ... CASE 一次回写
   c. 用例库场景: order 字段在 test_case 上不存在,跳过
   d. 日志: 对每个重排的 case 记录
      log.info(f"[export-import] case {case_id} reordered: order {old} -> {new} in {scope_type}:{scope_id}")
9. 缺失用例: 无操作(圆桌不删,范围内的其他 case 维持原状)
10. 提交: 整批单事务;任一乐观锁失败/必填校验失败 → 整体回滚
11. 返回 { updated, inserted, reordered }
```

### 4. 前端入口设计

**`ExportCaseModal`**(新建,scope 通用):
- 入参: `scope_type` (library | plan) + `scope_id` + 现有筛选条件
- 步骤:
  1. 范围确认:显示 "将导出计划 X 下的 50 条用例(按执行序)" 或 "用例库模块 Y 下的 120 条"
  2. 可选项:是否包含子步骤(默认勾选,大文件时可关)
  3. 调 `/export` -> 浏览器下载
- 复用现有 `downloadCaseExcel` 模式,新增 `exportCaseExcel(scope_type, scope_id, case_ids?, include_steps)`

**`ImportCaseModal`**(从现有 `UploadCaseModal` / `PlanCaseImportModal` 收敛):
- 入参: `scope_type` + `scope_id` + `project_id` (透传给后端)
- 步骤:
  1. 上传文件 -> `/import/preview`
  2. 展示 `scope_check` + 行级 errors
  3. 配置项(简化后只剩一个):
     - 顶部提示文字: "本圆桌不删除任何用例, 不查重, 不修改计划关联字段; 改的归位, 增的插入"
  4. 提交 -> `/import/commit` -> 成功后刷新表格 + 左侧目录树

**`CaseDataTable`(用例库)工具栏**:
- 在现有 `UploadCaseModal` 触发按钮旁,新增 **"导出"** 按钮(下载图标),打开 `ExportCaseModal(scope_type=library)`
- 批量选中条 `BatchActionBar` 暂不显示导出(避免选中条覆盖当前模块全量)

**`PlanCaseList`(计划)工具栏**:
- 同上,新增 **"导出"** 按钮(打开 `ExportCaseModal(scope_type=plan)`)
- 现有 `PlanCaseImportModal` 用 `ImportCaseModal(scope_type=plan)` 替换

### 5. 数据契约关键点

- `update_time` 在 Excel 里格式化为 `YYYY-MM-DD HH:MM:SS`(和 `BaseModel.map()` 一致)
- `order` 整型,1..N;后端 `normalize`:若 Excel 中有跳号/重复,后端按出现顺序压缩为 1..N 连续;preview 阶段给警告但不阻止
- `用例ID` 列:导出时填整数;上传时空 = 新增;非空 = update;后端校验必须是当前 project 下存在的 case,否则预览阶段报错
- `所属分组`:沿用现有 `UploadModuleResolver` / `UploadPlanModuleResolver` 的路径式解析;library 走 `module` 表,plan 走 `plan_module` 表
- 步骤行:`步骤序号` 为空 = 该行**不创建步骤**(只更新/创建用例头);`操作步骤` 与 `预期结果` 都为空时 preview 给警告(避免误存空步骤)
- 不在 Excel 中出现的步骤序号 = 删除该步骤(完全覆盖原则)
- 计划关联字段(`is_review` / `first_status` / `second_status` / `bug_url`):本圆桌**完全不碰**,由计划页面独立操作

### 6. 错误处理

| 错误 | 表现 | 处理 |
|---|---|---|
| 乐观锁失败 | 整批回滚 | 弹窗显示冲突 case_id 列表 + 提示"请重新导出后再编辑" |
| `_meta.scope_type` / `scope_id` 与当前不一致 | preview 拒绝 | 弹窗报错 "该文件导出于 plan:123,与当前选中的 plan:456 不一致" |
| `_meta` 缺失 / `version` 不匹配 | preview 拒绝 | 弹窗报错 "文件格式不兼容,请重新导出" |
| `排序` 列有跳号/重复 | preview 警告 | 不阻止 commit,后端 normalize 成 1..N 连续 |
| 步骤行内 `操作步骤` 与 `预期结果` 都为空 | preview 警告 | 不阻止,导入为空步骤 |
| Excel 文件超过 10MB | 拒绝 | 提示用户用筛选缩小范围 |

## Alternatives Considered

- **B. 两张独立模板(新增 / 更新)**
  - 优:语义清晰,后端不用做 mode 分流
  - 劣:用户实际工作流经常混用(改几条 + 加几条),被迫分两次;UI 多一层选择
  - **未选**:用户体验重于后端简洁,且 `mode=mixed` 已经在分块流程里把成本消化了

- **C. 不导出当前列表,只支持"下载模板 + 全部新建"**
  - 优:零开发
  - 劣:完全不沾"改用例信息" 的需求
  - **未选**:不解决用户问题

- **D. 整组替换(commit 时先 DELETE 范围内全部关联,再按 Excel 重建)**
  - 优:语义最简
  - 劣:丢失历史(执行结果、bug_url);用户改 1 条就触发 100 条重写
  - **未选**:风险太大;且与用户"不删除" 原则冲突

- **E. `missing_action: keep | remove` 让用户选**
  - 优:灵活
  - 劣:用户明确反对 "通过 Excel 上传删除用例";`remove` 路径无人用,徒增 UI/接口面
  - **未选**:砍掉,只保留 `keep`

- **F. `on_duplicate: skip | create` 让用户选**
  - 优:沿用现有导入流程
  - 劣:圆桌插入不查重更直接(用户"同样的名字导入如果没有任何修改,意味着这条 case 不动")
  - **未选**:砍掉,圆桌插入直接 insert

- **G. 隐式行号(用 Excel 物理行号当 order)**
  - 优:少一列
  - 劣:用户重排 Excel 列就崩;无法给"步骤序号"列预留位置感
  - **未选**:`排序` 列是 1px 的成本,换 100% 的稳定性

- **H. 子步骤 JSON 单 cell 编码**
  - 优:技术最简
  - 劣:非技术同学编辑体验差;Excel 里无法用现有数据校验 / 下拉
  - **未选**:多行展开 + 序号列更友好

- **I. 把计划关联字段(`is_review` / 状态 / `bug_url`)放进 Excel**
  - 优:Excel 里能改一切
  - 劣:用户明确指出 "导出的字段只有 case 的字段;与 plan 的中间字段不导出"
  - **未选**:砍掉,这些字段继续走计划页面独立流程

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 用户手动改 `排序` 列导致混乱 | preview 警告"排序有跳号/重复";commit 时 normalize 成 1..N 连续;主表头加注"此列由系统管理,谨慎修改" |
| 导出文件被多人编辑后并发导回 | `update_time` 乐观锁;冲突时整批回滚 + 列出冲突 case_id |
| 大列表(>5k 条)导出/上传性能 | 首版同步;Excel 单 sheet 上限约 1M 行,实际 5k 没问题;>10k 留作二期异步任务 |
| 用户改了 `_meta` 隐藏页 | 后端对 `_meta` 做严格 schema 校验,版本不匹配直接拒绝;Excel 默认隐藏但用户能 unhide,所以校验必要 |
| 步骤行内"全空"被误存 | preview 警告;后端落库时若 `action` 与 `expected_result` 双空,跳过该步骤行(不创建空行) |
| 计划的 `bug_url` / 状态字段本来是 export 范围,被砍掉后用户找不到修改入口 | 不在本设计范围;计划页面里这些字段的独立编辑入口应该保留(走 `planCaseAssociation` 现有 update 接口) |
| `所属分组` 路径在 plan 场景下被误用为 module 路径 | 解析阶段沿用现有 `UploadPlanModuleResolver` vs `UploadModuleResolver` 分流,scope_type 决定走哪一支 |
| 前端工具栏 "导出" 与现有 "导入" 视觉割裂 | 复用 ProTable `toolbar` 配置,导出/导入按钮用同一图标家族 + 同样 secondary 风格 |
| 计划 `order` 重排后对 step_result 引用影响不明 | commit 阶段对每个重排的 case 记 `log.info`(见 §3 步骤 8d);FK 实际只跟 `step_id` 走、不跟 `order`,理论上无影响;以日志做线上观察,不写硬回归 |
| 用户期望"删除" 行为但圆桌不提供 | `编辑指引` Sheet 明确写"删除用例请走计划页面的'移出' 功能";前端导入弹窗顶部也提示一次 |

## Open Questions (已决议)

| 议题 | 决议 |
|---|---|
| `missing_action=remove` 是否需要二次确认弹窗? | **不引入 `missing_action`**;圆桌不删除任何东西,无需确认 |
| 计划的 `bug_url` / 状态列首版只读? | **不导出、不进 Excel**;只导出 TestCase 本体字段;计划关联字段由计划页面独立修改 |
| `case_name` 在 Excel 内是否允许重复(同分组下)? | **不做重复检查**;圆桌插入不查重,直接 insert |
| 用例库场景的 `apply_order` 开关是否保留? | **不展示**;`apply_order` 永远 `true`,library scope 自动忽略 |
| 导出时是否默认包含 `creator` / `creatorName` / `updater` / `updaterName`? | **不包含**;commit 时由后端自然记录 `updater` / `update_time` |
| 是否在导出时附一个"编辑指引" Sheet? | **附**,且放在第二个 Sheet(可见),内容见 §1 |
| 计划的 `order` 在重新排后,旧 `order` 上如果有 step_result 引用会不会错位? | **加 commit 日志**(`log.info`),线上观察,不写硬回归 |

## Next Step Recommendation

建议接下来走 `write-plan`,把本 SUMMARY 拆成可执行任务,大致分这几块:

1. **后端基础**:`/export` 端点 + openpyxl 生成 3-Sheet xlsx(用例数据 + 编辑指引 + 隐藏 `_meta`),含子步骤多行展开
2. **后端 commit 升级**:`/import/preview` 加 `scope` / `mode=mixed` + `_meta` 校验;`/import/commit` 加 `apply_order` + 乐观锁 + 步骤全量覆盖 + 排序日志
3. **后端锚点重排**:commit 排序时调用现有 `bulk_reorder_plan_case` 或自实现 N 条 `UPDATE ... CASE` 一次回写
4. **前端 `ExportCaseModal`**:范围确认 + 调 `/export` 下载(对接 `downloadCaseExcel` 模式,新增 `exportCaseExcel`)
5. **前端 `ImportCaseModal` 收敛**:合并 `UploadCaseModal` / `PlanCaseImportModal`,加 `scope` 参数;顶部文案改写,去除 `on_duplicate` / `missing_action` UI
6. **工具栏接入**:`CaseDataTable` 和 `PlanCaseList` 工具栏新增 "导出" 按钮;导入按钮统一走 `ImportCaseModal`
7. **E2E 联调**:
   - 库场景:导 → 改 → 导回(不改 order),验证字段回写
   - 库场景:导 → 删几行 → 导回,验证 `keep` 不删 + 不报错
   - 计划场景:导 → 改 → 插 2 行 → 导回,验证 `order` 落库为 1,2,3,4,5
   - 计划场景:导 → 删 3 行 → 导回,验证缺失的 3 条仍在计划中(原 order 不变)
   - 计划场景:另一个人中途改了 `case_name`,验证乐观锁拦截
   - 跨 scope 防御:把 plan:123 的导出上传到 plan:456,验证 preview 拒绝
8. **文档/指引**:编辑指引 Sheet 写入(见 §1),README 增补导入导出段落

预估:后端 1.5–2 人日,前端 1.5–2 人日,联调 0.5 人日。
