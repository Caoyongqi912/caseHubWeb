# TestCaseMindMap 测试用例脑图组件

基于 simple-mind-map 库开发的测试用例脑图编辑器，支持测试用例的结构化组织和管理。

## 功能特性

### 核心功能
- ✅ 节点创建：支持添加子节点、同级节点
- ✅ 节点编辑：完整的节点属性编辑（名称、ID、优先级、状态等）
- ✅ 节点删除：支持删除节点及其子节点
- ✅ 节点复制：支持节点复制功能
- ✅ 节点拖拽：通过 simple-mind-map 的 Drag 插件实现
- ✅ 层级调整：支持节点在树形结构中的移动

### 测试用例功能
- ✅ 测试用例ID管理
- ✅ 优先级设置（高/中/低）
- ✅ 状态管理（待执行/执行中/通过/失败）
- ✅ 前置条件编辑
- ✅ 测试步骤管理（支持多步骤）
- ✅ 预期结果编辑
- ✅ 标签系统

### 界面功能
- ✅ 节点搜索：支持按名称、ID、标签搜索
- ✅ 节点筛选：支持按状态、优先级筛选
- ✅ 视图控制：放大、缩小、重置视图
- ✅ 主题切换：支持多种主题
- ✅ 布局切换：支持多种布局方式
- ✅ 数据导出：支持导出为文本格式
- ✅ 数据保存：支持保存回调

## 使用方法

### 基础使用

```tsx
import TestCaseMindMap from '@/pages/DebuggerPage/TestCaseMindMap';

const App = () => {
  return (
    <TestCaseMindMap 
      height="80vh"
      onSave={(data) => {
        console.log('保存的数据:', data);
      }}
    />
  );
};
```

### 自定义初始数据

```tsx
import TestCaseMindMap from '@/pages/DebuggerPage/TestCaseMindMap';

const customData = {
  data: {
    uid: 'root',
    text: '我的测试用例',
    isRoot: true,
    expand: true,
  },
  children: [
    {
      data: {
        uid: 'test-1',
        text: '测试用例1',
        testCaseId: 'TC001',
        priority: 'high',
        status: 'pending',
        tags: ['功能测试'],
      },
    },
  ],
};

const App = () => {
  return (
    <TestCaseMindMap 
      initialData={customData}
      height="80vh"
    />
  );
};
```

### 数据结构说明

#### TestCaseNodeData
```typescript
interface TestCaseNodeData {
  uid: string;                    // 节点唯一标识
  text: string;                   // 节点文本
  expand?: boolean;                // 是否展开
  isRoot?: boolean;               // 是否为根节点
  layerIndex?: number;             // 层级索引
  customLeft?: number;             // 自定义X坐标
  customTop?: number;              // 自定义Y坐标
  children?: TestCaseNodeData[];   // 子节点
  
  // 测试用例特有属性
  testCaseId?: string;            // 测试用例ID (格式: TC001)
  testCaseName?: string;          // 测试用例名称
  preConditions?: string;         // 前置条件
  testSteps?: TestCaseStep[];      // 测试步骤
  expectedResult?: string;         // 预期结果
  priority?: 'high' | 'medium' | 'low';  // 优先级
  status?: 'pending' | 'running' | 'passed' | 'failed';  // 状态
  tags?: string[];               // 标签
}
```

#### TestCaseStep
```typescript
interface TestCaseStep {
  stepId: string;                // 步骤ID
  stepNumber: number;            // 步骤序号
  description: string;           // 步骤描述
  expectedResult: string;         // 预期结果
  actionType?: 'click' | 'input' | 'select' | 'wait' | 'assert';  // 操作类型
  targetElement?: string;         // 目标元素
  inputValue?: string;           // 输入值
}
```

## 操作说明

### 节点操作
1. **选择节点**：点击节点即可选中
2. **添加子节点**：选中节点后点击"子节点"按钮
3. **添加同级节点**：选中节点后点击"同级"按钮
4. **编辑节点**：选中节点后点击"编辑"按钮
5. **编辑测试步骤**：选中节点后点击"步骤"按钮
6. **复制节点**：选中节点后点击"复制"按钮
7. **删除节点**：选中节点后点击"删除"按钮

### 视图操作
- **放大**：点击"放大"按钮或使用鼠标滚轮
- **缩小**：点击"缩小"按钮或使用鼠标滚轮
- **重置**：点击"重置"按钮恢复默认视图
- **拖拽**：按住鼠标左键拖拽画布

### 搜索和筛选
- **搜索**：在搜索框输入关键词，按回车搜索
- **筛选状态**：选择状态下拉框进行筛选
- **筛选优先级**：选择优先级下拉框进行筛选
- **执行筛选**：点击"筛选"按钮应用筛选条件

### 主题和布局
- **切换主题**：点击"设置"按钮，选择"主题"子菜单
- **切换布局**：点击"设置"按钮，选择"布局"子菜单

## 工具函数

### generateUid
生成唯一的节点ID
```typescript
const uid = generateUid(); // 返回格式: node-1234567890-abc123def
```

### findNodeByUid
根据UID查找节点
```typescript
const node = findNodeByUid(data, 'node-1234567890-abc123def');
```

### updateNodeByUid
根据UID更新节点
```typescript
const updatedData = updateNodeByUid(data, 'node-1234567890-abc123def', {
  text: '新的文本',
  priority: 'high'
});
```

### deleteNodeByUid
根据UID删除节点
```typescript
const updatedData = deleteNodeByUid(data, 'node-1234567890-abc123def');
```

### addNodeToParent
添加节点到指定父节点
```typescript
const newNode = {
  uid: generateUid(),
  text: '新节点',
  expand: true,
};
const updatedData = addNodeToParent(data, 'parent-uid', newNode);
```

### searchNodes
搜索节点
```typescript
const results = searchNodes(data, '登录');
```

### filterNodesByStatus
按状态筛选节点
```typescript
const results = filterNodesByStatus(data, 'passed');
```

### filterNodesByPriority
按优先级筛选节点
```typescript
const results = filterNodesByPriority(data, 'high');
```

### formatTestCaseForExport
格式化测试用例用于导出
```typescript
const text = formatTestCaseForExport(data);
```

## 注意事项

1. **根节点保护**：根节点不能被删除
2. **ID格式**：测试用例ID格式应为 TC001、TC002 等
3. **数据验证**：节点数据会进行验证，确保必填字段不为空
4. **性能优化**：大型脑图建议使用性能模式
5. **类型安全**：所有组件都使用 TypeScript 编写，提供完整的类型定义

## 扩展开发

### 添加新的节点属性
1. 在 `types.ts` 中扩展 `TestCaseNodeData` 接口
2. 在 `index.tsx` 中添加相应的编辑字段
3. 更新 `utils.ts` 中的相关函数

### 添加新的操作类型
1. 在 `types.ts` 中扩展 `TestCaseStep` 的 `actionType` 类型
2. 在 `index.tsx` 的步骤编辑器中添加新的选项

### 自定义主题
可以通过修改 `constants.ts` 中的 `THEME_OPTIONS` 来添加自定义主题。

## 技术栈

- **React 17.x**：UI 框架
- **TypeScript**：类型安全
- **Ant Design 5.x**：UI 组件库
- **simple-mind-map**：脑图核心库
- **@icon-park/react**：图标库

## 许可证

MIT
