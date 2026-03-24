# ConditionContentInfo 组件类型列渲染优化

## 代码位置
`/Users/cyq/work/code/caseHubWeb/src/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayConditionContent/ConditionContentInfo.tsx#L132-154`

## 当前代码问题

```typescript
{
  title: '类型',
  dataIndex: 'is_common',
  render: () => {
    return (
      <Tag
        icon={<VisibilityIcon />}
        style={{
          background: visibilityConfig.bgColor,
          color: visibilityConfig.color,
          border: `1px solid ${visibilityConfig.borderColor}`,
          fontWeight: 500,
          fontSize: '12px',
          padding: '2px 8px',
          borderRadius: token.borderRadiusSM,
        }}
      >
        {visibilityConfig.label}
}
      </Tag>
    );
  },
}
,
```

### 存在问题

1. **性能问题**：每次渲染都创建新的 style 对象
2. **代码重复**：类似样式在多处硬编码
3. **组件复用**：Tag 渲染逻辑可独立

## 优化方案

### 方案一：提取常量子组件

创建 `VisibilityTag.tsx` 组件：

```typescript
import { Tag, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;

interface VisibilityTagProps {
  isCommon: boolean;
}

const VisibilityTag: FC<VisibilityTagProps> = ({ isCommon }) => {
  const config = useMemo(() => {
    return isCommon
      ? {
          label: '公共',
          color: '#059669',
          bgColor: '#d1fae5',
          borderColor: '#05966920',
          icon: GlobalOutlined,
        }
      : {
          label: '私有',
          color: '#dc2626',
          bgColor: '#fee2e2',
          borderColor: '#dc262620',
          icon: LockOutlined,
        };
  }, [isCommon]);

  return (
    <Tag
      icon={<config.icon />}
      style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        fontWeight: 500,
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '12px',
      }}
    >
      <Text style={{ fontSize: '11px', fontWeight: 500 }}>
        {config.label}
      </Text>
    </Tag>
  );
};

export default VisibilityTag;
```

### 方案二：在 ConditionContentInfo 中使用

```typescript
// 导入新组件
import VisibilityTag from './VisibilityTag';

// 修改列定义
{
  title: '类型',
  dataIndex: 'is_common',
  render: (_, record) => (
    <VisibilityTag isCommon={record.is_common} />
  ),
}
,
```

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/VisibilityTag.tsx` | 新增：可复用的标签组件 |
| `src/pages/Play/PlayCase/PlayCaseDetail/PlayCaseStepContents/contents/PlayConditionContent/ConditionContentInfo.tsx` | 修改：使用新组件 |

## 优化收益

1. **性能提升**：useMemo 缓存配置，避免重复创建
2. **代码复用**：Tag 组件可在其他地方复用
3. **可维护性**：样式集中管理，易于统一调整
4. **类型安全**：明确的 Props 接口
