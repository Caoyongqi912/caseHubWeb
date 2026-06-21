import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import type { CSSProperties } from 'react';

/**
 * PlanOverview 样式表
 *
 * 视觉语言与 PlanCases（用例 Tab）保持一致：
 *  - 细发丝线分割（borderSecondary）代替"卡片盒子"边界
 *  - 大等宽数字（fontFamilyCode + tabular-nums）+ 小标签
 *  - 间距走 token 化的 spacing，色值走 antd token
 *  - hover 状态给出更显眼的边框颜色（colors.primary + alpha）
 *
 * 颜色锚点（用于等级 / 状态分布环图）：
 *  - P0 红 / P1 橙 / P2 蓝 / P3 紫 —— 与用例 Tab 的 LEVEL_COLORS 对齐
 *  - 通过 / 失败 / 阻塞 / 跳过 / 未执行 —— 走 antd success/error/warning/info + 中性灰
 */
const LEVEL_PALETTE: Record<string, string> = {
  P0: '#ff4d4f',
  P1: '#faad14',
  P2: '#1890ff',
  P3: '#722ed1',
};

/** 状态色板（顺序与后端 status value 1,2,3,4,0 一致） */
const STATUS_PALETTE: Record<string, string> = {
  通过: '#52c41a',
  失败: '#ff4d4f',
  阻塞: '#faad14',
  跳过: '#bfbfbf',
  未开始: '#d9d9d9',
  未知: '#8c8c8c',
};

export interface PlanOverviewStyles {
  /** 整个 Tab 容器：纵向布局 + 上下 padding，背景随主题 */
  container: CSSProperties;
  /** 顶部信息条（计划名称 + 状态 + 负责人 + 时间） */
  headerCard: CSSProperties;
  /** 图表卡（与 PlanCases 的 caseItem 视觉一致） */
  chartCard: CSSProperties;
  /** 图表卡头部 */
  chartHeader: CSSProperties;
  /** 图表卡标题 */
  chartTitle: CSSProperties;
  /** 图表容器（给固定高度，避免布局抖动） */
  chartBody: CSSProperties;
  /** 颜色锚点（暴露给调用方用于环图等） */
  levelPalette: Record<string, string>;
  statusPalette: Record<string, string>;
  /** Token，方便子组件直接读 */
  token: ReturnType<typeof useCaseHubTheme>['token'];
}

/**
 * 暴露所有样式 + 色板。
 * 注意：返回的 CSSProperties 不包含 hover 之类的伪类样式 —— 需要在元素上叠加。
 */
export const usePlanOverviewStyles = (): PlanOverviewStyles => {
  const { token, colors, spacing, borderRadius, shadows, animations } =
    useCaseHubTheme();

  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.lg,
      padding: `${spacing.md}px 0`,
      // parent PageContainer is height:100vh + overflow:hidden,
      // and the Tabs tabpane above this container has no definite height
      // (default height:auto), so 'height:100%' would collapse to content
      // size and overflowY:auto would never trigger. Bypass the chain and
      // use a viewport-based calc that matches the visible area between the
      // Tabs nav and the viewport bottom: 100vh - (PageContainer body
      // padding-top 24px + Tabs nav ~46px) = calc(100vh - 70px).
      height: 'calc(100vh - 70px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'transparent',
    },

    headerCard: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.lg,
      padding: `${spacing.md}px ${spacing.lg}px`,
      background: colors.bgContainer,
      border: `1px solid ${colors.borderSecondary}`,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      transition: `border-color ${animations.base} ${animations.easeInOut}`,
    },

    chartCard: {
      background: colors.bgContainer,
      border: `1px solid ${colors.borderSecondary}`,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: `border-color ${animations.base} ${animations.easeInOut}`,
    },

    chartHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.sm}px ${spacing.md}px`,
      borderBottom: `1px solid ${colors.borderSecondary}`,
    },

    chartTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: colors.text,
      letterSpacing: '0.02em',
    },

    chartBody: {
      // 固定高度避免饼图/柱图自身重排造成卡片抖动
      height: 260,
      padding: `${spacing.sm}px 0`,
    },

    levelPalette: LEVEL_PALETTE,
    statusPalette: STATUS_PALETTE,
    token,
  };
};
