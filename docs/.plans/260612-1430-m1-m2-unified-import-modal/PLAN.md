# Plan: M1/M2 统一导入 (单 PR, BE + FE, 拆 4 步) — Plan A 修订

> Created: 2026-06-12 14:30 (初版, 含"新按钮+新 modal"双入口)
> Revised: 2026-06-12 15:30 (**Plan A**: 1 按钮 + 1 老 modal 内部 M1/M2 自适应, 不加新按钮 / 不加新 modal)
> 范围: `case_auto_hub` (BE, FastAPI) + `caseHubWeb` (FE, Umi)
> 来源: 之前 PR-1 export + PR-2 preview 链路已落地 (commit `f2eb602`), PR-3 Step 1 (commit `97aa761`) 已落地
> 状态: 实施中
> 替代: 之前回退的 PR-2 (file_mode/blank path 那一版) + 本次初版"新 modal"方案

## 背景 (回顾)

- **PR-1 (export)**: BE 已落地. `POST /export` 返 3-Sheet xlsx (`用例数据` + `编辑指引` + 隐藏 `_meta`), 10 列主表 + `用例ID` 放最后
- **PR-2 (preview)**: BE 已落地. `POST /import/preview` 走 `utils/roundtripReader.py` 解析 + scope 校验
- **PR-3 Step 1 (M1/M2 自适应)**: BE 已落地 (commit `97aa761`). `POST /upload` 探测 `_meta` sheet 决定走 M1/M2, 响应带 `template_type: "M1"|"M2"` + `warnings` + `preview_data`
- **缺失**:
  - BE: `POST /import/commit` (M2 真正的落库, 按 `用例ID` 同步 UPDATE/INSERT + 写 `case_dynamic`)
  - FE: 老 `UploadCaseModal` 内部 M1/M2 自适应 (1 个按钮 + 1 个 modal, 内部按 `template_type` 分支)

## 用户需求 (已拍板, Plan A)

- **M1** (下载空白模板, 填了再传):
  - 没有 `用例ID` 列, 全 INSERT
  - **保留** 相同用例处理: `(project_id, module_id, case_name)` 三元组与已有用例一致时, 按 `on_duplicate` 决定 `skip` (计入 skipped) 或 `create` (允许同名同分组多条并存, 默认)
  - 用户即使手填了 `用例ID` 列也**忽略** (M1 模板没这列, 走的是 aioFileReader 老格式)
- **M2** (导出后改完再传回):
  - `用例ID` 命中 → UPDATE 字段 + 步骤全量覆盖
  - `用例ID` 空 → INSERT
  - **无视** `on_duplicate` 参数, 纯按 case_id 同步, 名字冲突不跳过
  - 删行 = 不删
- **M2 审计**: 每次 UPDATE 写 1 条 `case_dynamic` 记录
- **目录校验** + **必填校验** 仍跑 (M1/M2 都要)
- **响应信息**: 后端给前端 "新增多少用例" + "跳过多少" (M1) / "更新多少用例" + "新增多少" (M2)

## Modal 设计 (用户已定, Plan A)

### 入口策略 — 1 按钮 + 1 modal

**核心原则**:
- 工具栏**只 1 个"上传"按钮**, 调老的 `UploadCaseModal` 组件
- 同一个 modal 内部按 `template_type` 自动分支
- **不加**新按钮, **不建**新 modal

> 用户原话: "我之前需求不是。仍使用这个 上传的按钮么 — modal 也是一个"

### 老 `UploadCaseModal` 内部 M1/M2 自适应 (2 行布局不变)

**行 1**: `[下载用例导入模板]` 按钮 → 调 `downloadCaseExcel` 拿 M1 空白模板 (老逻辑, 不变)
**行 2**: `Upload.Dragger` 拖入文件 accept=".xlsx,.xls"

**禁止**:
- 顶部 "圆桌" 之类的术语 Alert
- 范围锁定块 (不在用户面前暴露 scope)
- 文件来源说明 (不写"如果是导出请选…")

**自适应分支 (按 `template_type` 字段)**:

| 分支 | 触发条件 | UI 变化 | commit 走哪 |
|---|---|---|---|
| **M1** | 响应 `template_type="M1"` | 显示 "相同用例处理" ProFormRadio (skip / create); 校验结果 4 列 (总/有效/无效/通过率) | `commitImportCase` (老 `/upload/commit`) |
| **M2** | 响应 `template_type="M2"` | **隐藏** "相同用例处理" 整块; 显示 `<Alert type="info">` "导回协议: 按 用例ID 同步, 无视重复检查"; 校验结果保留 + 警告折叠 | `importCommitCase` (新 `/import/commit`) |

**M1 commit 后**: `message.success("成功导入 N 条, 跳过重复 M 条")` (老逻辑, 不变)
**M2 commit 后**: `message.success("已修改 N 条, 新增 M 条")` (新)

**取消 / 关闭**:
- M1 关闭 → 调 `cancelImportCase(file_md5)` 走 `/upload/cancel`
- M2 关闭 → 调 `cancelImportCaseM2(file_md5)` 走 `/import/cancel`
- 防止 Redis 30min TTL 内的垃圾缓存

**交互流程** (1 个 modal 内):
1. 用户拖入文件
2. BE `/upload` 自适应 → 返回 `template_type` + 校验结果
3. modal 按 `template_type` 决定 UI 分支 + 提交走哪个 API
4. 提交后按分支 toast
5. 关闭: 清 Redis 缓存, 重置状态

## 实施步骤 (BE / FE 交替, 4 步)

> **节奏**: 每步 BE → FE 配对完成一个"功能点", 中间停下来手动调试. 不允许一口气把 4 步全跑完. 每个"功能点"完成后你应该能用手工 / curl / 浏览器 跑通一个最小可观察的端到端.

### 功能点拆分

| 步 | 类型 | 功能点 | 调试信号 |
|---|---|---|---|
| 1 | BE | **M1/M2 自适应** (✅ commit `97aa761`) — `/upload` 探测 `_meta` 决定走 M1/M2, 响应加 `template_type` | curl 测 2 种文件, 看到正确的 `template_type` |
| 2 | FE | **API 类型扩展** — `uploadPreviewCase` 响应加 `template_type` 类型, 老 `UploadCaseModal` 不动 (未 commit) | tsc 0 错, 浏览器老 modal 仍能用 |
| 3 | BE | **M2 落库** — 新 `/import/commit` 端点 + `M2ImportService` + `write_case_dynamic`; 加 smoke 单测 | curl 测 happy / 必填失败 / 整批回滚 |
| 4 | FE | **老 modal 内部 M1/M2 自适应** — 改 `UploadCaseModal.tsx`, 按 `template_type` 分支; CaseDataTable 工具栏**不动** (只用 1 个老按钮) | 浏览器拖 M1/M2 文件, 看 2 种 toast |

### 步骤依赖图

```
Step 1 (BE 自适应) ✅   ←→ Step 2 (FE API 扩展) [未 commit, 已实现]
                              ↓
Step 3 (BE commit + 单测) ←→ Step 4 (FE 老 modal 内部 M1/M2 自适应)
```

---

### Step 1: BE - `/upload` 自适应 M1/M2 (✅ commit `97aa761`)

| 项 | 内容 |
|---|---|
| **范围** | 端点 `POST /upload` 探测 `_meta` sheet 存在性, 决定走 `aioFileReader` (M1) 还是 `RoundtripReader` (M2); 响应 schema 加 `template_type` 字段 |
| **改动文件** | `app/controller/test_case/test_case.py` (line 534 upload_cases 改写), `app/schema/hub/testCaseSchema.py` (UploadPreviewResult 加 `template_type: Literal["M1", "M2"] = "M1"`) |
| **完成信号** | BE `POST /upload` 返 `{template_type: "M1"\|"M2", ...}`, 不再有 `template_type` 缺失的场景 |
| **验证方法** | curl 上传 M1 模板 (无 `_meta` sheet) → 返 `template_type="M1"`; curl 上传 PR-1 导出的 M2 文件 (有 `_meta`) → 返 `template_type="M2"`; 老的 `UploadCaseModal` 仍能工作 (`template_type="M1"` 透明兼容) |
| **单测** | `tests/test_pr3_step1.py` 14 个 case 全绿 (E2E 跑过真实 PR-1 导出文件) |

---

### Step 2: FE - API 类型扩展 (未 commit, 已实现)

| 项 | 内容 |
|---|---|
| **范围** | 扩展 `src/api/case/testCase.ts`: `uploadPreviewCase` 响应类型加 `template_type: TemplateType` + `warnings` + `preview_data`; 加 `importCommitCase` (M2 走 `/import/commit`, Step 3 完成后激活) + `cancelImportCaseM2` (M2 走 `/import/cancel`); 老 `UploadCaseModal` **不动** |
| **改动文件** | `src/api/case/testCase.ts` (改 + 增, ~70 行) |
| **完成信号** | TypeScript 类型完整, 老 modal 调用 `uploadPreviewCase` 拿到的响应类型有 `template_type` |
| **验证方法** | `npx tsc --noEmit -p .` 退出码 0; 浏览器硬刷, 老的"上传"按钮 (UploadCaseModal) 仍能上传 M1 模板 |
| **回退成本** | 极低 (只动一个文件) |

**→ 调通后停, 用户确认 OK, 再走 Step 3**

---

### Step 3: BE - `/import/commit` M2 落库 + smoke 单测

| 项 | 内容 |
|---|---|
| **范围** | 新增 `POST /import/commit` 端点 + 新 service `M2ImportService` + `CaseDynamicMapper.write_case_dynamic` 方法; 单事务: 拆 known/new → UPDATE 字段+步骤+case_dynamic / INSERT → 不删. 加 smoke 单测覆盖 happy / 必填失败 / 目录不存在 / case_id 不存在 / 跨 scope 防御 / 删行无操作 / on_duplicate 行为 |
| **改动文件** | `app/service/m2ImportService.py` (新, ~150 行), `app/controller/test_case/test_case.py` (新增 import_commit 路由, ~40 行), `app/mapper/test_case/caseDynamicMapper.py` (新方法 write_case_dynamic, ~30 行), `tests/test_m1_m2_upload.py` (新, ~80 行) |
| **完成信号** | curl 调 `/import/commit` 能完成 M2 落库, 写 `case_dynamic` 表, 单事务回滚正常; 单测 8+ 个 case 全绿 |
| **验证方法** | (a) mock 一个 M2 preview 缓存 (file_md5 已知), 调 `/import/commit` → DB 增量符合预期; 故意构造 1 行必填空 → 整批回滚; case_id 不存在 → 整批回滚; (b) `cd case_auto_hub && python -m pytest tests/ -v` 退出码 0 |
| **依赖** | Step 1 (template_type 字段) |
| **回退成本** | 中 (新增 1 个 service + 1 个端点 + 1 个 mapper 方法, 但都可独立删除) |

**→ 调通后停, 用户确认 OK, 再走 Step 4**

---

### Step 4: FE - 老 `UploadCaseModal` 内部 M1/M2 自适应 (Plan A 核心)

| 项 | 内容 |
|---|---|
| **范围** | (a) 改 `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx`: 内部按 `validateResult.template_type` 分支. M1 保留原 UI (4 列 Statistic + on_duplicate ProFormRadio + 走 `commitImportCase`); M2 隐藏 on_duplicate, 加 M2 Tag + Alert 提示, 走 `importCommitCase`. cancel 也分支: M1 走 `cancelImportCase`, M2 走 `cancelImportCaseM2`. (b) `CaseDataTable.tsx` 工具栏**不动** (只用 1 个老"上传"按钮). (c) 不创建 `ImportCaseModal` |
| **改动文件** | `src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx` (改, ~80 行) |
| **完成信号** | 用例库页面工具栏**只有 1 个"上传"按钮** (跟之前一样); 点开 modal 拖 M1 文件 → 显示 on_duplicate 选项 + 4 列 Statistic; 拖 M2 文件 → 隐藏 on_duplicate + M2 Alert 提示; 提交后 M1 toast "成功导入 N 条, 跳过重复 M 条", M2 toast "已修改 N 条, 新增 M 条" |
| **验证方法** | `npm start` (or 8000 端口) → 浏览器进 `/cases/caseHub` → 看工具栏 1 个按钮 → 点开 → 拖 M1 模板 (3 行) → 走老 /upload/commit 流程 → 关 modal → 拖 PR-1 导出的 M2 文件 → 走新 /import/commit → 提交后看 case_dynamic 表新增 |
| **依赖** | Step 2 (FE API 已有 template_type 类型), Step 3 (BE /import/commit 工作) |
| **回退成本** | 极低 (只动 1 个 modal 组件, 工具栏不动) |

**→ 调通后停, 用户做 E2E 手工验收清单 (见下面"端到端"段)**

---

### 执行节奏建议

| 阶段 | 步骤 | 估计耗时 |
|---|---|---|
| **第 1 天** | Step 2 (验) + Step 3 | FE 类型扩展验证 + BE commit + 单测, 半天写完 + 半天自测 |
| **第 2 天** | Step 4 | FE 老 modal 内部 M1/M2 自适应, 半天写完 + 半天 E2E |

每完成一步停下, 你自己跑一遍"验证方法"段确认 OK, 再走下一步. **不要憋一口气全干完**.

## 关键设计点

### 1. 后端自适应 (M1/M2 自动判别) — Step 1 已落地

**位置**: `POST /upload` (app/controller/test_case/test_case.py:534)

**判别规则**: 解析文件后看是否有隐藏 `_meta` Sheet:
- 有 → M2 流程 (用 `utils/roundtripReader.RoundtripReader` 解析)
- 无 → M1 流程 (用 `utils/aioFileReader.AsyncFilesReader` 解析, 现有逻辑)

**优势**:
- FE 端只调一个 `POST /upload`, 不需要分支判别
- 老 `UploadCaseModal` 调用方零改动 (它走的就是 M1)
- M2 路径通过响应里 `template_type` 字段触发 FE 切换 UI / API

**响应新增字段** (Step 1 已加):
```json
{
  "template_type": "M1" | "M2",   // 新增
  "file_md5": "...",
  "total_count": N,
  "valid_count": N,
  "invalid_count": N,
  "errors": [...],
  "warnings": [...],
  "can_commit": bool
}
```

### 2. M2 入库 (新端点 `POST /import/commit`) — Step 3 工作

**位置**: 新增 `app/controller/test_case/test_case.py` 紧邻 `/upload/commit`

**输入**:
- `file_md5`: preview 阶段返的指纹
- `project_id`
- `module_id` (可选, new case 默认 module 兜底, 默认走 `_meta` 里的 scope)

**流程** (4 步, 单事务):
```
1) 加载 Redis 预览缓存 (key 复用 preview 写入的)
2) 按 (用例ID) 拆: known (非空) / new (空)
3) known: 逐 case → SELECT 拿 old → diff_dict 渲染 description → UPDATE 字段 + 步骤全量覆盖 (DELETE+INSERT) + 写 1 条 case_dynamic
4) new: 逐 case → INSERT case + 步骤 (0 步骤合法)
5) 删行: 无操作
6) 标记 Redis committed
```

**输出**:
```json
{
  "inserted": N,      // 新增条数
  "updated": N,       // 更新条数 (含 step)
  "dynamic_count": N  // case_dynamic 写入条数
}
```

### 3. 复用既有组件 (不重写)

- `utils/roundtripReader.py` — M2 解析器 (PR-2 已落地, **不动**)
- `utils/aioFileReader.py` — M1 解析器 (**不动**)
- `app/mapper/test_case/caseDynamicMapper.py` — `update_plan_case_dynamic` 已有, **扩展 `write_case_dynamic(case_id, plan_id, description, user_id)`**
- `app/mapper/test_case/caseDynamicMapper.py::CaseDynamicRenderer.diff_dict` — 现成的字段差异渲染, **直接调**
- `app/service/uploadCacheService.py` — preview 缓存存 `valid_rows` / `meta` / `scope_check` / `warnings`, **结构不动**, commit 阶段直接读
- `app/service/exportCaseService.py` — M2 写文件逻辑, **不动** (PR-1)
- `app/mapper/test_case/testCaseStepMapper.replace_case_steps()` — 步骤全量覆盖, **直接调**

### 4. FE 状态机 (M1/M2 分支) — Step 4 改 `UploadCaseModal`

```
                                  ┌─→ M1_BRANCH ─┐
IDLE                              │              │
  ↓ (点开 modal)                  │              │
OPEN (拖入文件)                   │              │
  ↓ 调 uploadPreviewCase          │              │
UPLOADING                         │              │
  ↓ 200 OK                        │              │
PREVIEWED (拿到 template_type)    │              │
  ↓                                │              │
  ├─ template_type === "M1"       │              │
  │   ├─ 展示原 4 列 Statistic    │              │
  │   ├─ 显示 on_duplicate 选项   │              │
  │   ├─ COMMITTING → 调 commitImportCase (老 /upload/commit) │
  │   └─ DONE: toast "成功导入 N 条, 跳过重复 M 条"        │
  │                                │              │
  └─ template_type === "M2"       │              │
      ├─ 展示 4 列 Statistic       │              │
      ├─ 隐藏 on_duplicate         │              │
      ├─ 显示 M2 Alert 提示        │              │
      ├─ COMMITTING → 调 importCommitCase (新 /import/commit) │
      └─ DONE: toast "已修改 N 条, 新增 M 条"     │
                                                │
任意阶段 4xx/5xx → ERROR (toast + 保留 modal 状态, 让用户修文件重传)
```

**分支原则**:
- M1 走老 API, 老错误格式, 走老 `cancelImportCase` (清理 `/upload/cancel`)
- M2 走新 API, 新错误格式 (含 scope_check), 走新 `cancelImportCaseM2` (清理 `/import/cancel`)
- 两个分支互不影响, 任何一方失败另一方仍可用
- 工具栏**只有 1 个"上传"按钮**, 同一个 modal 内部按 `template_type` 自动分支

## 任务分解

### BE 改动 (3 个新文件, 1 个改, +~200 行)

**`app/service/m2ImportService.py`** (新, ~150 行):
- `class M2ImportService`:
  - `async def commit(file_md5, project_id, module_id, user) -> CommitResult`
  - `_split_known_new()` — 按 `用例ID` 拆
  - `_apply_known()` — UPDATE case + replace steps + 写 case_dynamic
  - `_apply_new()` — INSERT case + steps
  - 单事务锚点 (`TestCaseMapper.transaction()`)
  - 不删除 (删行无操作)

**`app/controller/test_case/test_case.py`** (改, +40 行):
- 新增 `import_commit` 路由 (`/import/commit`):
  - 输入: `file_md5`, `project_id`, `module_id?`
  - 走新 service `M2ImportService` (见下)
  - 调 mapper 写 `test_case` + `test_case_step` + `case_dynamic`
- 复用 `RoundtripReader` 的解析结果 (从 Redis 缓存拿, 不重解析)

**`app/mapper/test_case/caseDynamicMapper.py`** (改, +30 行):
- 新增 `async def write_case_dynamic(case_id, plan_id, description, user_id) -> int`
  - 简单 INSERT `case_dynamic` 表
  - 复用现有 `CaseDynamicRenderer.diff_dict(old, new)` 渲染 description

**`tests/test_m1_m2_upload.py`** (新, ~80 行):
- 8+ 个单测覆盖 M2 commit 行为 (见 "验收" 段)

### FE 改动 (1 个改文件, 0 个新文件, +~80 行)

> Plan A 核心: **不改工具栏**, 只改老 modal 内部逻辑

**`src/api/case/testCase.ts`** (已扩展, ~70 行):
- `uploadPreviewCase` 响应类型加 `template_type: TemplateType` + `warnings` + `preview_data`
- `commitImportCase` (M1 走 `/upload/commit`, **不动**): 函数签名保留 `on_duplicate?: 'skip' | 'create'`, 行为不变
- 新增 `importCommitCase(data)` API (M2 走 `/import/commit`):
  - 函数签名: `{ file_md5, project_id, module_id? }` (没有 `on_duplicate`)
- 新增 `cancelImportCaseM2(file_md5)` API (M2 走 `/import/cancel`):
  - 命名加 M2 后缀, 避免跟老 M1 的 `cancelImportCase` 撞

**`src/pages/CaseHub/CaseLibrary/components/UploadCaseModal.tsx`** (Step 4 改, +~80 行):
- 内部按 `validateResult.template_type` 分支
- M1 路径: 保留原 4 列 Statistic + on_duplicate ProFormRadio + 走 `commitImportCase` + `cancelImportCase`
- M2 路径: 隐藏 on_duplicate 整块 + 显示 `<Tag color="blue">M2</Tag>` + `<Alert type="info">` 提示 + 走 `importCommitCase` + `cancelImportCaseM2`
- 不创建 `ImportCaseModal`
- 不改 `CaseDataTable.tsx` (工具栏**不动**)

## 端点契约

### `POST /upload` (Step 1 已扩展, 不破坏)

> **META_VERSION 处理说明**: 本端点 BE 自适应只看 `_meta` sheet **是否存在** 来判 M1/M2, **不读** `_meta.version` 字段. 这样绕开了 `exportCaseService.META_VERSION=2` 与 `roundtripReader.SUPPORTED_META_VERSION=2` 的版本校验. PR-1 导出的 2 版本 M2 文件可正常 preview + commit.

```
请求 (multipart/form-data):
  file=<xlsx>                必填
  project_id=<int>           必填

响应 (200):
  {
    "code": 0,
    "data": {
      "template_type": "M1" | "M2",   ← Step 1 新增
      "file_md5": "...",
      "total_count": N,
      "valid_count": N,
      "invalid_count": N,
      "errors": [{ "row": N, "errors": [{ "field": "...", "message": "..." }] }],
      "warnings": [{ "row": N, "message": "..." }],   ← Step 1 新增
      "preview_data": [...],                            ← Step 1 新增
      "can_commit": bool
    }
  }

错误 (400 CommonError):
  - 鉴权失败
  - 文件超 10MB
  - 解析彻底失败 (格式非 xlsx)
```

**向后兼容**: 老 `UploadCaseModal` 调这个端点仍然能拿到 M1 响应, 字段都兼容 (只是多了 `template_type="M1"`).

**M1 vs M2 路径** (BE 路由层判别, 透明):
- `template_type="M1"`: 走 `AsyncFilesReader` (老 9 列) + 现有目录校验 → preview 缓存结构同老 /upload
- `template_type="M2"`: 走 `RoundtripReader` (新 10 列) + scope 校验 → preview 缓存结构同 /import/preview
- FE 端后续 commit 时按 `template_type` 选 `commitImportCase` (M1) 或 `importCommitCase` (M2)

### `POST /import/commit` (新, **M2 专用**, Step 3 实现)

```
请求 (application/json):
  {
    "file_md5": "...",
    "project_id": 1,
    "module_id": 63       // 可选, new case 默认 module 兜底
  }
  // 注意: 没有 on_duplicate 参数. M2 走 case_id 同步, 名字冲突不跳过.
  // 即使 Excel 里某行 (用例ID=已存在, case_name=和 DB 重复) 也会按 case_id UPDATE.
```

**M1 走另一个端点**: `/upload/commit` (已存在, 不动), 走 `on_duplicate: skip | create` 老逻辑.

响应 (200):
```json
{
  "code": 0,
  "data": {
    "inserted": 3,        // 新增条数
    "updated": 5,         // 更新条数
    "dynamic_count": 5    // case_dynamic 写入条数
  }
}
```

错误 (400 CommonError):
  - 缓存不存在 / 已提交
  - 事务内写库失败 (整批回滚, 不写库)
  - 缓存 template_type != "M2" (提示走 /upload/commit)

## 实现要点

### BE (Step 3 写)

1. **M2 解析复用**: `/import/preview` 内的 `RoundtripReader.async_read` 逻辑**已经独立**在 `utils/roundtripReader.py` 里, 直接复用即可. 不重解析.

2. **M2 case_id 反向**: 解析阶段不做, 落库阶段一次性 `SELECT * FROM test_case WHERE id IN (...)` 拿到 `old` dicts, 走 `CaseDynamicRenderer.diff_dict(old, new)` 渲染 description

3. **步骤全量覆盖**: `app/mapper/test_case/testCaseStepMapper.replace_case_steps()` 现有 (历史代码), 直接调

4. **单事务**: `async with TestCaseMapper.transaction() as session:` 锚点, 失败整批回滚

5. **case_dynamic 写入**:
   ```python
   for case_id, old_dict, new_dict in known_cases:
       desc = CaseDynamicRenderer.diff_dict(old_dict, new_dict)
       await CaseDynamicMapper.write_case_dynamic(
           case_id=case_id, plan_id=None,
           description=desc, user_id=user.id,
       )
   ```
   - `plan_id=None` 表示"用例自身变更" (按现有 model 约定)

6. **不删除**: 删行无操作 (DB 中对应 case 不动)

### FE (Step 4 改)

1. **trigger 位置**: `CaseDataTable.tsx` 工具栏的"上传"按钮**不动**, 仍调 `UploadCaseModal`
2. **`UploadCaseModal` 内部按 `template_type` 分支**:
   ```ts
   const isM2 = validateResult.template_type === 'M2';
   ```

3. **M2 UI 隐藏 on_duplicate**:
   ```tsx
   {!isM2 && (
     <>
       <Divider />
       <ProFormRadio.Group name="on_duplicate" ... />
     </>
   )}
   {isM2 && (
     <Alert type="info" message="导回协议: 按 用例ID 同步, 无视重复检查" />
   )}
   ```

4. **M2 UI 加 M2 Tag**:
   ```tsx
   <Tag color="blue">M2</Tag>
   ```

5. **commit 分支**:
   ```ts
   if (isM2) {
     response = await importCommitCase({
       file_md5: validateResult.file_md5,
       project_id: currentProjectId,
     });
     // toast: "已修改 N 条, 新增 M 条"
   } else {
     response = await commitImportCase({ ..., on_duplicate });
     // toast: "成功导入 N 条, 跳过重复 M 条"
   }
   ```

6. **cancel 分支**:
   ```ts
   if (isM2) {
     await cancelImportCaseM2(validateResult.file_md5);
   } else {
     await cancelImportCase(validateResult.file_md5);
   }
   ```

7. **错误兜底**: 全局拦截器 (requestErrorConfig.ts Blob 4xx 处理) 已经能拿到 `msg`, toast 直接显示

## 验收

### 单元/烟雾测 (Step 3 必跑, Step 4 选跑)

**BE** (`tests/test_m1_m2_upload.py`, 8+ 个 case):
```
[1] /upload 探测 _meta: 3-Sheet 文件 → template_type=M2, valid_count=3
[2] /upload 探测 _meta: 1-Sheet 文件 (下载模板) → template_type=M1
[3] /upload 探测 _meta: 损坏的 xlsx → 400, file_md5=null
[4] /import/commit happy path: 2 known + 1 new → inserted=1, updated=2, dynamic_count=2
[5] /import/commit 单事务: 1 行必填空 → 全部回滚, errors 含该行
[6] /import/commit 删行: Excel 5 行, DB 8 条 → DB 仍 8 条 (不删)
[7] /import/commit case_id 不存在 (DB 删过) → 整批回滚, errors 含 "该用例已删除"
[8] /import/commit 目录不存在: 1 行 所属分组 改坏 → 整批回滚
[9] /import/commit M1 缓存走 /import/commit → 拒绝 (缓存里 template_type 校验)
[10] /upload M1 路径 on_duplicate=create: 1 行与 DB 同名同分组 → 仍 INSERT (允许并存)
[11] /upload M1 路径 on_duplicate=skip: 1 行与 DB 同名同分组 → 跳过 (skipped_count++)
[12] /upload M1 路径 on_duplicate=create + 名字冲突: skipped_count=0, imported_count=N
[13] /import/commit M2 路径忽略 on_duplicate: 即使传 on_duplicate=skip, case_id 命中仍 UPDATE
[14] 静态: 4 个改动文件 ast.parse 通过
[15] 路由: 现有 30 个 @router.* 全部保留
```

**FE** (Step 4 手测):
```
[1] 硬刷 → 工具栏**只有 1 个"上传"按钮** (没有"导入(支持同步)"按钮)
[2] 下载模板 → 浏览器下载 "用例模板.xlsx" (M1 空白模板, 无 _meta)
[3] 拖入 M1 模板 (有 3 行数据) → 展示 stats (总数/有效/无效/通过率), 显示 on_duplicate 选项
[4] 拖入 M2 导出文件 → 展示 stats, **隐藏 on_duplicate**, 显示 M2 Tag + Alert 提示
[5] 拖入有错误的 xlsx → 展示错误列表 (前 10 行)
[6] 错误 11+ 条 → 展示前 10 + "还有 N 条"
[7] 提交按钮可点 → M1 走 commitImportCase → toast "成功导入 N 条, 跳过重复 M 条"
[8] 提交按钮可点 → M2 走 importCommitCase → toast "已修改 N 条, 新增 M 条"
[9] 关闭 modal → 调对应 cancelImportCase(M1) / cancelImportCaseM2(M2) → 缓存清空
[10] 模态 顶部无"圆桌"等术语
[11] tsc --noEmit 0 错
```

### 端到端 (库场景)

```
[1] 库场景 M2 happy: 选 module=63, 导出 3 条 → 改 1 条 + 加 1 条 + 删 1 条 → 传回
    期望: updated=1, inserted=1, DB 仍是 3 条 (删 1 条无效)
[2] 库场景 M1: 下载模板, 手填 2 条 → 传回
    期望: inserted=2 (template_type=M1, case_id 忽略)
[3] 库场景 错误: 导出 3 条 → 改 1 条 所属分组 写错路径 → 传回
    期望: 整批回滚, 提示"目录不存在", DB 不变
[4] 库场景 必填: 导出 3 条 → 改 1 条 用例名称 清空 → 传回
    期望: 整批回滚, 提示"用例名称必填"
[5] case_dynamic: 导出 3 条 → 改 1 条 用例等级 P1→P2 → 传回
    期望: case_dynamic 表新增 1 条, description 含"用例等级: P1 → P2"
[6] 跨 scope 防御 (M2): 导出于 module=63, 传回到 module=64 → preview 阶段拒绝
    期望: errors 含 "范围不匹配", 不写缓存
[7] 工具栏验收: 浏览器进 /cases/caseHub, 工具栏**只 1 个"上传"按钮**, 跟 Plan A 一致
```

## 部署注意

### Pre-existing dirty (用户已修复, **本次不重做**, 保留即可)

| 文件 | 修改内容 | 用途 |
|---|---|---|
| `app/schema/hub/testCaseSchema.py` | `UploadPreviewResult.file_md5: str` → `Optional[str]` | 校验失败时 `file_md5=null` (Redis 缓存不写入). 需求: 失败时让用户重传附件, 不留半截缓存 |
| `file/用例模版.xlsx` (二进制) | 删除 row 3 的 demo 数据行 | 强制用户上传前删除 demo 行, 避免被当成 INSERT 假数据. 需求: 模板可视化更干净 |

### 本 PR 新增/改动

1. **`utils/roundtripReader.py` 不动**: PR-2 落地的解析器, 复用即可
2. **`utils/aioFileReader.py` 不动**: M1 解析的核心
3. **`app/service/uploadCacheService.py` 不动**: preview 缓存结构兼容, commit 阶段直接读
4. **`case_dynamic` 表已存在**: `app/model/caseHub/case_step_dynamic.py` 已建, 不需 migration
5. **`CaseDynamicMapper.update_plan_case_dynamic` 复用**: 现有的 plan 关联变更走这个, 用例自身变更走新加的 `write_case_dynamic`
6. **`UploadCaseModal` 不删**: M1/M2 共用同一个 modal, 内部按 `template_type` 分支
7. **不创建 `ImportCaseModal`**: 工具栏**只 1 个"上传"按钮**, 同一个 modal 内部自适应
8. **`CaseDataTable.tsx` 工具栏不动**: 跟 Step 1/2 保持一致
9. **新增 `app/service/m2ImportService.py`**: 跟 `uploadCacheService.py` 同目录, 无新依赖
10. **新增 `tests/test_m1_m2_upload.py`**: 8+ 个 case 覆盖 M2 commit 行为
11. **新增 pip 依赖**: 无 (openpyxl / sqlalchemy / asyncmy 都已装)

### 清理判定 (老组件何时可以删)

| 组件 | 判定信号 | 删的时机 |
|---|---|---|
| `commitImportCase` (FE) + `/upload/commit` (BE) | M1 老 on_duplicate 流程 30 天无调用 | 下一 PR 删 (建议建个 `M1_ON_DUPLICATE_DEPRECATION` 工单跟踪) |
| `/import/preview` (BE) | BE 日志 30 天内无调用 (因 `/upload` M2 路径已覆盖 preview) | 单独 PR 删 (同时清理 controller 路由 + 前端如果有调用方) |
| `roundtripReader.py` (BE) | `/import/preview` 删除后无其他调用方 | 同步删 (但 `M2ImportService` 仍依赖其 `detect_template_type` 静态方法, 注意保留) |
| `aioFileReader.py` (BE) | **永不删**, M1 解析的核心, 老的 `/upload` M1 路径仍要走 | 永久保留 |
| `uploadCacheService.py` (BE) | **永不删**, 缓存基础设施 | 永久保留 |
| `exportCaseService.py` (BE) | **永不删**, M2 导出链路 | 永久保留 |
| `caseStepDynamic.py` model | **永不删**, `case_dynamic` 表结构 | 永久保留 |
| `UploadCaseModal.tsx` (FE) | **永不删**, M1/M2 入口共用, 是产品上唯一的上传入口 | 永久保留 |
| `CaseDataTable.tsx` 工具栏 | **永不删**, 唯一入口 | 永久保留 |

**判定原则**: 任何"保留"标注的组件, 都是因为 **新 PR 还在用 / 没找到替代品**; 任何"待删"标注的, 都是 **新 PR 已经覆盖其功能, 等老路径无流量** 后可清.

## 不在范围

- 计划 (test plan) 端导入 — 暂不做, 留作下一 PR (M2 流程在 plan 端要处理 `plan_case_association` 关联 + order 重排, 复杂度大)
- 删除用例 — 永久不开放 (删行 = 无操作)
- 异步 commit / Celery — 二期
- 乐观锁显式比 (走 DB 事务自然失败重试)
- 圆桌术语 — 禁止出现在用户可见文案 / API 命名 / 注释
- 老的 "圆桌" 命名 (export 端 `export_cases` 函数内的中文注释) — 暂不清理, 等 E2E 后再统一 rename
- 新建 `ImportCaseModal.tsx` — **不做**, Plan A 拍板老 modal 内部自适应
- 新建"导入(支持同步)"按钮 — **不做**, 工具栏只 1 个"上传"按钮
- README / 项目文档更新 — 下一 PR
