# 毛玻璃 + 光晕效果组件化指南

## 一、核心组件

### 1. Glass 组件库位置
```
src/components/Glass/
├── index.ts              # 导出入口
├── useGlassStyles.ts     # 样式 hook
└── GlassBackground.tsx   # 背景组件
```

### 2. 组件说明

#### `useGlassStyles` - 样式 Hook
```tsx
import { useGlassStyles } from '@/components/Glass';

const MyPage: React.FC = () => {
  const styles = useGlassStyles();
  // styles.colors - 所有颜色变量
  // styles.glassCard() - 毛玻璃卡片样式
  // ...其他样式方法
};
```

**可用样式方法：**

| 方法 | 用途 |
|------|------|
| `colors` | 所有颜色变量（primary, glass, gradientBg 等） |
| `container()` | 页面容器（渐变背景 + relative 定位） |
| `animatedBg()` | 动画背景容器（fixed 定位） |
| `gridOverlay()` | 60px 网格线 |
| `glowOrb(...)` | 浮动光球（需传入颜色、尺寸、位置、动画时长） |
| `contentWrapper()` | 内容区域（padding + maxWidth） |
| `glassCard()` | 毛玻璃卡片样式 |
| `glassCardHover()` | 卡片 hover 效果 |
| `pageHeader()` | 页面头部布局 |
| `pageTitle()` | 页面标题 |
| `pageSubtitle()` | 页面副标题 |
| `pageActions()` | 操作按钮区域 |
| `footer()` / `footerText()` | 底部样式 |

**colors 对象属性：**

| 属性 | 说明 |
|------|------|
| `primary` | 主色（来自 antd token） |
| `primaryGlow` | 主色发光效果（40% 透明度） |
| `success` | 成功色 |
| `error` | 错误色 |
| `glass` | 毛玻璃背景（深色/浅色自动适配） |
| `glassBorder` | 毛玻璃边框 |
| `gradientBg` | 页面渐变背景 |
| `gradientPrimary` | 主色渐变 |

#### `GlassBackground` - 背景组件
```tsx
import { GlassBackground } from '@/components/Glass';

const MyPage: React.FC = () => (
  <GlassBackground
    showGlowOrbs={true}  // 是否显示光球
    glowOrbConfigs={[  // 自定义光球配置
      { color: '#1890ff', size: 600, top: '-10%', left: '-10%', animationDuration: '8s' },
    ]}
    contentStyle={{ padding: '48px 56px' }}  // 自定义内容区域样式
    extraAnimations={`
      .my-animation {
        animation: slideUp 0.5s ease-out forwards;
      }
    `}  // 额外的 CSS 动画
  >
    {/* 页面内容 */}
  </GlassBackground>
);
```

**Props：**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 页面内容 |
| `showGlowOrbs` | `boolean` | `true` | 是否显示浮动光球 |
| `glowOrbConfigs` | `Array` | 默认3个光球 | 光球配置数组 |
| `contentStyle` | `CSSProperties` | - | 自定义内容区域样式 |
| `extraAnimations` | `string` | - | 额外的 CSS 动画（注入到 style 标签） |

#### `MyProTable` - 表格组件（已修改）
```tsx
import MyProTable from '@/components/Table/MyProTable';

// 透明背景（让父级毛玻璃透出）
<MyProTable
  cardStyle={{
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
  }}
/>

// 独立毛玻璃效果
<MyProTable
  cardStyle={{
    borderRadius: '16px',
    background: styles.colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${styles.colors.glassBorder}`,
    boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
  }}
/>
```

---

## 二、页面层级结构

### 独立页面（有完整背景）
```
PageComponent
└── GlassBackground                    # 提供背景层
    └── div(style={styles.contentWrapper()})
        └── ProCard(styles={styles.glassCard()})  # 毛玻璃卡片
            └── ...页面内容
```

### 子页面（嵌入在父页面中）
```
ParentPage
└── GlassBackground                    # 背景层在父页面
    └── div(style={styles.contentWrapper()})
        └── ProCard
            └── MyTabs / 子组件区域

ChildPage（子组件，不放 GlassBackground）
└── MyProTable(cardStyle={{ background: 'transparent', ... }})
    └── ...内容
```

---

## 三、常见问题

### Q1: 为什么样式没有变化？

**A:** 检查以下几点：
1. 子组件是否设置了透明背景 `background: 'transparent'`
2. 子组件是否被外层非透明元素遮挡
3. ProTable 等组件是否有默认背景覆盖

### Q2: 如何让表格背景透明？

**A:** 使用 `cardStyle` 设置透明：
```tsx
<MyProTable
  cardStyle={{
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
  }}
/>
```

### Q3: 如何在不同层级使用毛玻璃效果？

**方案 A - 父级提供背景（推荐）：**
```tsx
// 父组件
<GlassBackground>
  <ProCard style={styles.glassCard()}>
    <MyTabs items={[...]} />
  </ProCard>
</GlassBackground>

// 子组件
<MyProTable cardStyle={{ background: 'transparent', border: 'none' }} />
```

**方案 B - 各自独立：**
```tsx
// 每个页面都有自己的背景
<GlassBackground>
  <MyProTable cardStyle={styles.glassCard()} />
</GlassBackground>
```

---

## 四、对其他组件进行相同优化的步骤

### 步骤 1: 导入组件
```tsx
import { GlassBackground, useGlassStyles } from '@/components/Glass';
import MyProTable from '@/components/Table/MyProTable';
```

### 步骤 2: 确定页面类型

**独立页面**（如 `/pages/Scheduler/index.tsx`）：
- 使用 `GlassBackground` 包裹整个页面
- 页面内容放在 `div(style={styles.contentWrapper()})` 中

**子页面**（如 `/pages/Scheduler/Job/index.tsx`，被其他页面嵌入）：
- 不使用 `GlassBackground`
- 直接使用 `useGlassStyles` 获取颜色
- 子组件背景设为透明，让父级毛玻璃透出

### 步骤 3: 应用样式

**独立页面：**
```tsx
const MyPage: React.FC = () => {
  const styles = useGlassStyles();

  return (
    <GlassBackground>
      <ProCard
        style={{
          ...styles.glassCard(),
          marginBottom: 24,
        }}
        bodyStyle={{
          padding: 24,
          background: 'transparent',
        }}
      >
        {/* 页面内容 */}
      </ProCard>
    </GlassBackground>
  );
};
```

**子页面（使用 MyProTable）：**
```tsx
const MyChildPage: React.FC = () => {
  const styles = useGlassStyles();

  return (
    <MyProTable
      cardStyle={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      // ...其他 props
    />
  );
};
```

**子页面（使用自定义内容）：**
```tsx
const MyChildPage: React.FC = () => {
  const styles = useGlassStyles();

  return (
    <div
      style={{
        borderRadius: '16px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      {/* 子页面内容 */}
    </div>
  );
};
```

### 步骤 4: 按钮样式统一
```tsx
<Button
  type="primary"
  style={{
    borderRadius: '8px',
    background: styles.colors.gradientPrimary,
    border: 'none',
    boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
  }}
>
  操作按钮
</Button>
```

---

## 五、样式变量参考

```tsx
// 毛玻璃卡片
{
  borderRadius: '16px',
  background: styles.colors.glass,           // 半透明背景
  backdropFilter: 'blur(20px)',                // 磨砂效果
  border: `1px solid ${styles.colors.glassBorder}`,
  boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
}

// 渐变按钮
{
  borderRadius: '8px',
  background: styles.colors.gradientPrimary,
  border: 'none',
  boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
}

// 页面背景
{
  background: styles.colors.gradientBg,  // 深色：深蓝渐变 | 浅色：浅蓝渐变
}
```

---

## 六、文件修改记录

| 日期 | 文件 | 变更 |
|------|------|------|
| - | `src/components/Glass/index.ts` | 新增导出入口 |
| - | `src/components/Glass/useGlassStyles.ts` | 新增样式 hook |
| - | `src/components/Glass/GlassBackground.tsx` | 新增背景组件 |
| - | `src/components/Table/MyProTable.tsx` | 新增 `cardStyle` / `cardClassName` props，表格背景透明化 |
| - | `src/pages/Project/ProjectTab.tsx` | 使用 `GlassBackground` |
| - | `src/pages/Project/Db/index.tsx` | 使用 `useGlassStyles` + `cardStyle={{ background: 'transparent' }}` |
| - | `src/pages/Project/Env/index.tsx` | 同上 |
| - | `src/pages/Project/GlobalVariables.tsx` | 同上 |
| - | `src/pages/Project/Aps/index.tsx` | 同上 |
