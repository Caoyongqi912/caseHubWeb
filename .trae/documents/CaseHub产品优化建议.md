# CaseHub 用例执行功能详细方案

## 一、功能概述

用例执行是测试管理系统的核心功能，用于记录测试人员对用例的执行过程和结果。

### 1.1 核心价值
- **可追溯**：记录谁在什么时间执行了什么用例
- **有证据**：执行结果有截图/日志作为佐证
- **可统计**：通过率、执行进度等数据自动计算

### 1.2 现状对比

| 现状 | 目标 |
|------|------|
| 只能手动切换用例状态 | 执行时自动记录状态变更 |
| 无执行过程记录 | 完整记录执行人、时间、结果 |
| 无证据留存 | 支持截图/附件上传 |
| 状态修改无记录 | 每次状态变更都留痕 |

---

## 二、功能清单

### 2.1 执行记录（核心）
| 功能 | 描述 |
|------|------|
| 执行历史 | 查看用例的所有执行记录 |
| 执行详情 | 查看某次执行的完整信息 |
| 执行统计 | 按人/时间/需求的执行统计 |

### 2.2 快速执行
| 功能 | 描述 |
|------|------|
| 状态切换 | 点击快速标记通过/失败 |
| 执行弹窗 | 填写执行信息后标记结果 |
| 批量执行 | 选择多个用例一次性执行 |

### 2.3 证据管理
| 功能 | 描述 |
|------|------|
| 截图上传 | 执行失败时上传截图 |
| 日志上传 | 上传执行日志文件 |
| 附件预览 | 查看已上传的证据 |

### 2.4 执行统计
| 功能 | 描述 |
|------|------|
| 个人进度 | 展示个人待执行/已完成用例 |
| 需求进度 | 需求下用例的执行进度 |
| 通过率报表 | 各维度通过率统计 |

---

## 三、数据结构设计

### 3.1 新增表：case_execution

```sql
CREATE TABLE case_execution (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  case_id BIGINT NOT NULL COMMENT '用例ID',
  requirement_id BIGINT COMMENT '需求ID',
  executor_id BIGINT NOT NULL COMMENT '执行人ID',
  executor_name VARCHAR(50) NOT NULL COMMENT '执行人名称',

  -- 执行信息
  result TINYINT NOT NULL COMMENT '执行结果: 1-通过 2-失败 3-阻塞',
  execute_time DATETIME NOT NULL COMMENT '执行时间',
  duration INT COMMENT '执行耗时(秒)',

  -- 证据
  evidence_type TINYINT DEFAULT 0 COMMENT '证据类型: 0-无 1-截图 2-日志 3-截图+日志',
  evidence_urls JSON COMMENT '证据文件URL列表',

  -- 备注
  remark TEXT COMMENT '执行备注',

  -- 审计字段
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_case_id (case_id),
  INDEX idx_requirement_id (requirement_id),
  INDEX idx_executor_id (executor_id),
  INDEX idx_execute_time (execute_time)
) COMMENT '用例执行记录表';
```

### 3.2 更新表：test_case（新增字段）

```sql
ALTER TABLE test_case ADD COLUMN last_executor_id BIGINT COMMENT '最后执行人ID';
ALTER TABLE test_case ADD COLUMN last_execute_time DATETIME COMMENT '最后执行时间';
ALTER TABLE test_case ADD COLUMN execute_count INT DEFAULT 0 COMMENT '被执行次数';
```

### 3.3 TypeScript 类型定义

```typescript
// 执行结果枚举
type ExecutionResult = 1 | 2 | 3; // 1-通过 2-失败 3-阻塞

// 证据类型
type EvidenceType = 0 | 1 | 2 | 3; // 0-无 1-截图 2-日志 3-截图+日志

// 执行记录
interface ICaseExecution {
  id: number;
  case_id: number;
  requirement_id?: number;
  executor_id: number;
  executor_name: string;
  result: ExecutionResult;
  execute_time: string;
  duration?: number;
  evidence_type: EvidenceType;
  evidence_urls?: string[];
  remark?: string;
  create_time: string;
}

// 执行统计
interface IExecutionStats {
  total: number;           // 总数
  passed: number;          // 通过数
  failed: number;          // 失败数
  blocked: number;         // 阻塞数
  passRate: number;        // 通过率
  executeCount: number;     // 执行次数
  lastExecutor?: string;   // 最后执行人
  lastExecuteTime?: string; // 最后执行时间
}

// 批量执行请求
interface IBatchExecution {
  case_ids: number[];
  result: ExecutionResult;
  remark?: string;
  evidence_urls?: string[];
}

// 用例执行历史（带用例信息）
interface ICaseExecutionWithCase extends ICaseExecution {
  case_name: string;
  case_level: string;
  case_tag?: string;
  requirement_name?: string;
}
```

---

## 四、API 设计

### 4.1 执行记录相关

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/case/execution/record` | POST | 记录一次执行 |
| `/api/case/execution/records` | GET | 获取用例执行记录列表 |
| `/api/case/execution/{id}` | GET | 获取执行详情 |
| `/api/case/execution/batch` | POST | 批量执行 |
| `/api/case/execution/stats` | GET | 获取执行统计 |

### 4.2 接口详情

#### 4.2.1 记录执行
```
POST /api/case/execution/record

Request:
{
  case_id: number;
  requirement_id?: number;
  result: 1 | 2 | 3;  // 通过/失败/阻塞
  duration?: number;    // 耗时(秒)
  evidence_type?: 0 | 1 | 2 | 3;
  evidence_urls?: string[];
  remark?: string;
}

Response:
{
  code: 0;
  msg: string;
  data: {
    id: number;
    case_status: number; // 更新后的用例状态
  }
}
```

#### 4.2.2 获取执行记录
```
GET /api/case/execution/records?case_id=1&page=1&page_size=20

Response:
{
  code: 0;
  data: {
    list: ICaseExecution[];
    total: number;
    page: number;
    page_size: number;
  }
}
```

#### 4.2.3 批量执行
```
POST /api/case/execution/batch

Request:
{
  case_ids: number[];
  requirement_id?: number;
  result: 1 | 2 | 3;
  remark?: string;
}

Response:
{
  code: 0;
  msg: string;
  data: {
    success_count: number;
    failed_count: number;
  }
}
```

#### 4.2.4 获取执行统计
```
GET /api/case/execution/stats?requirement_id=1

Response:
{
  code: 0;
  data: {
    total: 100,
    passed: 80,
    failed: 15,
    blocked: 5,
    pass_rate: 80.0,
    execute_count: 200,
    last_executor: "张三",
    last_execute_time: "2024-01-15 10:30:00"
  }
}
```

---

## 五、UI 设计

### 5.1 用例卡片增加执行信息

**位置**：用例卡片右下角

```
┌─────────────────────────────────────────────────────┐
│ ☐ P-001  用例名称                        [通过] ✓  │
│                                    🔵 张三 · 10分钟前 │
└─────────────────────────────────────────────────────┘
```

### 5.2 执行弹窗

**触发方式**：
1. 点击用例状态标签
2. 点击"执行"按钮

**弹窗内容**：
```
┌─────────────────────────────────────────────┐
│ 执行用例：张三的测试用例                      │
├─────────────────────────────────────────────┤
│                                             │
│ 执行结果：                                   │
│ ○ 通过  ○ 失败  ○ 阻塞                       │
│                                             │
│ 执行时间：[2024-01-15 10:30:00    ] 📅       │
│                                             │
│ 执行耗时：[  120  ] 秒                        │
│                                             │
│ 证据上传：                                   │
│ [选择文件] 或拖拽文件到此处                   │
│ 已上传：screenshot_001.png, error.log        │
│                                             │
│ 备注：                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ 输入执行备注...                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│                    [取消]    [确认执行]        │
└─────────────────────────────────────────────┘
```

### 5.3 执行历史面板

**位置**：用例详情抽屉/页面

```
┌─────────────────────────────────────────────┐
│ 执行历史                              刷新 ↻ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ 通过  │ 张三  │ 2024-01-15 10:30    │ │
│ │          │       │ 耗时: 120秒        │ │
│ │ [查看截图]                              │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ ✗ 失败  │ 李四  │ 2024-01-14 15:20    │ │
│ │          │       │ 耗时: 60秒         │ │
│ │ [查看截图] [查看日志]                   │ │
│ │ 备注：接口返回数据格式错误               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              < 1 2 3 4 5 >                  │
└─────────────────────────────────────────────┘
```

### 5.4 需求执行进度

**位置**：需求详情页

```
┌─────────────────────────────────────────────┐
│ 执行进度                                    │
├─────────────────────────────────────────────┤
│  ████████████████████░░░░░░░  80/100       │
│                                             │
│  ✓ 通过: 60 (75%)  ████████████            │
│  ✗ 失败: 15 (18.7%) ███                   │
│  ◐ 阻塞: 5 (6.3%)  █                      │
│                                             │
│  总执行次数: 200  最后执行: 张三 10分钟前     │
│                                             │
│  [查看详情]  [导出报告]                      │
└─────────────────────────────────────────────┘
```

### 5.5 批量执行工具栏

**位置**：选中用例后显示的工具栏

```
已选 5 个用例
┌────────────────────────────────────────────────────┐
│ [✓ 全部通过] [✗ 全部失败] [◐ 全部阻塞] │ 备注 [...] │
└────────────────────────────────────────────────────┘
```

---

## 六、组件设计

### 6.1 新增组件

| 组件 | 描述 |
|------|------|
| `ExecutionModal` | 执行弹窗组件 |
| `ExecutionHistory` | 执行历史列表组件 |
| `ExecutionStats` | 执行统计展示组件 |
| `ExecutionProgress` | 需求执行进度组件 |
| `EvidenceUploader` | 证据上传组件 |
| `BatchExecutionBar` | 批量执行工具栏组件 |

### 6.2 组件目录结构

```
src/pages/CaseHub/
├── Execution/
│   ├── ExecutionModal.tsx      # 执行弹窗
│   ├── ExecutionHistory.tsx     # 执行历史
│   ├── ExecutionStats.tsx       # 执行统计
│   ├── ExecutionProgress.tsx    # 执行进度
│   ├── EvidenceUploader.tsx     # 证据上传
│   ├── BatchExecutionBar.tsx   # 批量工具栏
│   └── styles.ts               # 样式文件
```

---

## 七、实施计划

### 阶段一：基础执行功能（预计 2 天）

| 任务 | 工作内容 |
|------|----------|
| 数据库 | 新增 case_execution 表 |
| API | 实现执行记录 CRUD 接口 |
| 前端 | ExecutionModal 执行弹窗 |
| 前端 | 用例卡片显示最后执行人/时间 |
| 前端 | 执行后更新用例状态 |

### 阶段二：证据与历史（预计 2 天）

| 任务 | 工作内容 |
|------|----------|
| 前端 | EvidenceUploader 组件 |
| 前端 | ExecutionHistory 执行历史面板 |
| 前端 | 截图/日志预览功能 |
| API | 文件上传接口 |

### 阶段三：批量与统计（预计 2 天）

| 任务 | 工作内容 |
|------|----------|
| 前端 | BatchExecutionBar 批量工具栏 |
| 前端 | ExecutionStats 统计组件 |
| 前端 | ExecutionProgress 需求进度 |
| API | 批量执行接口 |
| API | 统计接口 |

### 阶段四：优化与完善（预计 1 天）

| 任务 | 工作内容 |
|------|----------|
| 优化 | 加载状态优化 |
| 优化 | 错误处理 |
| 测试 | 全流程测试 |
| 文档 | 使用文档编写 |

---

## 八、技术要点

### 8.1 状态联动
- 执行成功后自动更新 `test_case.case_status`
- 执行成功后更新 `last_executor_id`, `last_execute_time`, `execute_count`

### 8.2 权限控制
- 只有执行人可以看到自己的执行记录
- 用例创建者可查看所有执行记录
- 管理员可查看所有执行记录

### 8.3 文件上传
- 使用已有的文件上传服务
- 限制文件大小和格式（图片：jpg/png/log，日志：txt/log）

### 8.4 性能考虑
- 执行记录分页查询
- 统计使用缓存/定时更新
- 大数据量时使用虚拟滚动

---

## 九、验收标准

### 功能验收
- [ ] 可以记录单次执行
- [ ] 可以查看执行历史
- [ ] 可以上传截图/日志
- [ ] 可以批量执行
- [ ] 用例状态自动更新
- [ ] 需求执行进度正确计算

### UI验收
- [ ] 执行弹窗交互流畅
- [ ] 历史记录清晰可读
- [ ] 状态切换有视觉反馈
- [ ] 批量操作有确认提示
