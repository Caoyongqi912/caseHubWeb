# PlayStepDetail 组件 save 逻辑优化方案

## 问题分析

当前 `PlayStepDetail` 组件的 `save` 函数包含复杂的业务逻辑，根据不同的调用场景执行不同的保存操作：

| 场景 | 传入参数 | 保存操作 |
|------|---------|---------|
| 更新步骤 | `values.id` 存在 | `updatePlayStep` |
| 用例私有步骤 | `play_case_id` | `insertPlayCaseStep` |
| 组私有步骤 | `play_group_id` | `insertPlayGroupStep` |
| 公共步骤 | 无上述参数 | `savePlayStep` |

**当前父组件调用情况：**

1. **PlayCaseDetail/index.tsx** - 传入 `play_case_id`
2. **PlayCommonStep/index.tsx** - 传入 `step_detail`（编辑公共步骤）
3. **PlayStepContent.tsx** - 传入 `play_step_id`（查看/编辑步骤）
4. **PlayStepGroupDetail.tsx** - 传入 `play_group_id`

## 优化方案

采用 **受控组件 + ref 暴露方法** 的模式，将保存逻辑上移到父组件。

### 架构变更

```
┌─────────────────────────────────────────────────────────────┐
│                       父组件                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. 定义 saveHandler 函数（包含具体保存逻辑）            ││
│  │  2. 通过 ref 调用子组件的 validateAndGetValues()        ││
│  │  3. 执行对应的 API 调用                                  ││
│  │  4. 处理 loading 状态和回调                              ││
│  └─────────────────────────────────────────────────────────┘│
│                           ↓ ref                             │
├─────────────────────────────────────────────────────────────┤
│                     PlayStepDetail                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. 使用 useImperativeHandle 暴露方法                   ││
│  │     - validateAndGetValues(): 验证并返回表单数据        ││
│  │     - resetFields(): 重置表单                           ││
│  │  2. 移除内部 save 逻辑                                   ││
│  │  3. 移除 loading 状态（由父组件管理）                    ││
│  │  4. 保留表单渲染和联动逻辑                               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 具体实现步骤

#### 步骤 1：修改 PlayStepDetail 组件

**1.1 新增类型定义**

```typescript
export interface PlayStepDetailRef {
  validateAndGetValues: () => Promise<IPlayStepDetail>;
  resetFields: () => void;
  setFieldsValue: (values: Partial<IPlayStepDetail>) => void;
}
```

**1.2 修改 Props 接口**

```typescript
interface Props {
  play_step_id?: number;
  step_detail?: IPlayStepDetail;
  currentProjectId?: number;
  currentModuleId?: number;
  // 移除: play_case_id, play_group_id, callback
}
```

**1.3 使用 forwardRef + useImperativeHandle**

```typescript
const PlayStepDetail = forwardRef<PlayStepDetailRef, Props>((props, ref) => {
  // ... 现有逻辑

  useImperativeHandle(ref, () => ({
    validateAndGetValues: async () => {
      await stepForm.validateFields();
      return stepForm.getFieldsValue(true);
    },
    resetFields: () => {
      stepForm.resetFields();
    },
    setFieldsValue: (values) => {
      stepForm.setFieldsValue(values);
    },
  }));

  // 移除 save 函数、loading 状态、onFetchFinish
  // 移除保存按钮（由父组件控制）
});
```

#### 步骤 2：创建自定义 Hook 封装保存逻辑

创建 `usePlayStepSave.ts`：

```typescript
interface UsePlayStepSaveOptions {
  play_case_id?: number;
  play_group_id?: number;
  onSuccess?: () => void;
}

export const usePlayStepSave = (options: UsePlayStepSaveOptions) => {
  const { play_case_id, play_group_id, onSuccess } = options;
  const [loading, setLoading] = useState(false);

  const save = async (values: IPlayStepDetail) => {
    setLoading(true);
    try {
      let response;
      
      if (values.id) {
        response = await updatePlayStep(values);
      } else if (play_case_id) {
        response = await insertPlayCaseStep({
          ...values,
          case_id: play_case_id,
          is_common: false,
        });
      } else if (play_group_id) {
        response = await insertPlayGroupStep({
          ...values,
          group_id: play_group_id,
          is_common: false,
        });
      } else {
        response = await savePlayStep({
          ...values,
          is_common: true,
        });
      }

      if (response.code === 0) {
        message.success(response.msg);
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return { save, loading };
};
```

#### 步骤 3：修改各父组件

**3.1 PlayCaseDetail/index.tsx 示例**

```typescript
const stepRef = useRef<PlayStepDetailRef>(null);
const { save, loading } = usePlayStepSave({
  play_case_id: parseInt(caseId),
  onSuccess: handelRefresh,
});

const handleSave = async () => {
  const values = await stepRef.current?.validateAndGetValues();
  if (values) {
    await save(values);
  }
};

// JSX
<MyDrawer
  footer={
    <Button type="primary" loading={loading} onClick={handleSave}>
      保存
    </Button>
  }
>
  <PlayStepDetail
    ref={stepRef}
    currentProjectId={parseInt(projectId!)}
    currentModuleId={parseInt(moduleId!)}
  />
</MyDrawer>
```

### 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/pages/Play/PlayStep/PlayStepDetail.tsx` | 重构：使用 forwardRef，移除 save 逻辑 |
| `src/pages/Play/PlayStep/hooks/usePlayStepSave.ts` | 新增：保存逻辑 Hook |
| `src/pages/Play/PlayCase/PlayCaseDetail/index.tsx` | 修改：使用 ref 调用保存 |
| `src/pages/Play/PlayStep/PlayCommonStep/index.tsx` | 修改：使用 ref 调用保存 |
| `src/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayStepContent.tsx` | 修改：使用 ref 调用保存 |
| `src/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupDetail.tsx` | 修改：使用 ref 调用保存 |

### 优点

1. **单一职责**：子组件只负责表单渲染和验证
2. **灵活扩展**：父组件可以自定义保存逻辑
3. **代码复用**：通过 Hook 复用保存逻辑
4. **易于测试**：表单验证和业务逻辑分离
5. **向后兼容**：逐步迁移，不影响现有功能
