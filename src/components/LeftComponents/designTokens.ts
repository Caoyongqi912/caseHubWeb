/**
 * 设计令牌 - 统一管理 LeftComponents 的设计变量
 * 确保视觉一致性和可维护性
 */

// 色彩系统 - 符合 WCAG 2.1 AA 级对比度标准
export const colors = {
  // 主色调
  primary: {
    50: '#e6f4ff',
    100: '#bae0ff',
    200: '#91caff',
    300: '#69b1ff',
    400: '#4096ff',
    500: '#1677ff', // 主色
    600: '#0958d9',
    700: '#003eb3',
    800: '#002c8c',
    900: '#001d66',
  },

  // 辅助色
  secondary: {
    50: '#f9f0ff',
    100: '#efdbff',
    200: '#d3adf7',
    300: '#b37feb',
    400: '#9254de',
    500: '#722ed1', // 辅助色
    600: '#531dab',
    700: '#391085',
    800: '#22075e',
    900: '#120338',
  },

  // 成功色
  success: {
    50: '#f6ffed',
    100: '#d9f7be',
    200: '#b7eb8f',
    300: '#95de64',
    400: '#73d13d',
    500: '#52c41a', // 成功色
    600: '#389e0d',
    700: '#237804',
    800: '#135200',
    900: '#092b00',
  },

  // 警告色
  warning: {
    50: '#fffbe6',
    100: '#fff1b8',
    200: '#ffe58f',
    300: '#ffd666',
    400: '#ffc53d',
    500: '#faad14', // 警告色
    600: '#d48806',
    700: '#ad6800',
    800: '#874d00',
    900: '#613400',
  },

  // 错误色
  error: {
    50: '#fff1f0',
    100: '#ffccc7',
    200: '#ffa39e',
    300: '#ff7875',
    400: '#ff4d4f',
    500: '#f5222d', // 错误色
    600: '#cf1322',
    700: '#a8071a',
    800: '#820014',
    900: '#5c0011',
  },

  // 中性色 - 用于文本、边框、背景
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e8e8e8',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1f1f1f',
    1000: '#000000',
  },

  // 功能色
  functional: {
    link: '#1677ff',
    linkHover: '#4096ff',
    linkActive: '#0958d9',
    disabled: '#d9d9d9',
    disabledText: '#bfbfbf',
    border: '#d9d9d9',
    borderLight: '#f0f0f0',
    divider: '#f0f0f0',
    background: '#ffffff',
    backgroundLight: '#fafafa',
    backgroundDark: '#f5f5f5',
    mask: 'rgba(0, 0, 0, 0.45)',
  },
};

// 间距系统 - 8px 基准
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 圆角系统
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  round: 9999,
};

// 阴影系统 - 增强视觉层次
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',

  // 特殊阴影 - 用于卡片和悬浮效果
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.10)',
  dropdown:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};

// 字体系统
export const typography = {
  fontFamily: {
    base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  },

  fontSize: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// 过渡动画
export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },

  // 预设动画
  default: 'all 200ms ease-in-out',
  fast: 'all 150ms ease-in-out',
  slow: 'all 300ms ease-in-out',
};

// Z-index 层级
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// 组件特定样式
export const components = {
  // 项目选择卡片
  projectCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: colors.functional.borderLight,
    borderLeftColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadow: shadows.card,
    shadowHover: shadows.cardHover,
  },

  // 模块树
  moduleTree: {
    itemHeight: 32,
    itemPadding: spacing.sm,
    itemBorderRadius: borderRadius.md,
    selectedBg: colors.primary[50],
    selectedColor: colors.primary[600],
    hoverBg: colors.neutral[50],
    iconSize: 16,
  },

  // 搜索框
  searchInput: {
    height: 36,
    borderRadius: borderRadius.md,
    padding: `${spacing.sm}px ${spacing.md}px`,
  },

  // 按钮
  button: {
    height: {
      small: 24,
      default: 32,
      large: 40,
    },
    borderRadius: borderRadius.md,
    padding: {
      small: `0 ${spacing.sm}px`,
      default: `0 ${spacing.lg}px`,
      large: `0 ${spacing.xl}px`,
    },
  },
};

// 导出便捷的样式生成函数
export const styleHelpers = {
  // 生成卡片样式
  card: (variant: 'default' | 'bordered' | 'elevated' = 'default') => ({
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[0],
    ...(variant === 'bordered' && {
      border: `1px solid ${colors.functional.borderLight}`,
    }),
    ...(variant === 'elevated' && {
      boxShadow: shadows.card,
    }),
  }),

  // 生成过渡效果
  transition: (properties: string[] = ['all']) => ({
    transition: properties
      .map(
        (prop) =>
          `${prop} ${transitions.duration.base} ${transitions.timing.easeInOut}`,
      )
      .join(', '),
  }),

  // 生成文本截断样式
  truncate: (lines: number = 1) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
  }),
};
