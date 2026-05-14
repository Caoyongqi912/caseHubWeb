import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

/**
 * 用例详情组件样式 Hook
 * 提供统一的样式管理，确保组件外观一致性
 */
export const useTestCaseDetailStyles = () => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: colors.bgContainer, // 改为与 CaseSubSteps 一致的亮色背景
    padding: spacing.lg,
  });

  const mainCard = (): CSSProperties => ({
    borderRadius: borderRadius.xxl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: shadows.lg,
    background: colors.bgContainer, // 添加与 CaseSubSteps 一致的亮色背景
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.lg}px ${spacing.xl}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  });

  /** 头部左侧区域 - 创建者信息 */
  const headerLeft = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
  });

  /** 头部右侧区域 - 保存状态 */
  const headerRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const body = (): CSSProperties => ({
    padding: spacing.xl,
  });

  const sectionHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.border}`,
  });

  const sectionTitle = (): CSSProperties => ({
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: 0.5,
    whiteSpace: 'nowrap' as const,
  });

  const sectionDivider = (): CSSProperties => ({
    flex: 1,
    height: 1,
    background: `linear-gradient(90deg, ${colors.borderSecondary} 0%, transparent 100%)`,
  });

  const infoItem = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
  });

  const commonTag = (): CSSProperties => ({
    borderRadius: borderRadius.sm,
    fontSize: 11,
    margin: 0,
    background: `${colors.success}15`,
    borderColor: `${colors.success}30`,
    color: colors.success,
  });

  const reviewTag = (): CSSProperties => ({
    borderRadius: borderRadius.sm,
    fontSize: 11,
    margin: 0,
  });

  const formGrid = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.lg,
  });

  const formRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  });

  const emptySteps = (): CSSProperties => ({
    textAlign: 'center' as const,
    padding: `${token.paddingLG}px 0`,
    color: token.colorTextSecondary,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginBottom: token.marginMD,
  });

  return {
    container,
    mainCard,
    header,
    headerLeft,
    headerRight,
    body,
    sectionHeader,
    sectionTitle,
    sectionDivider,
    infoItem,
    commonTag,
    reviewTag,
    formGrid,
    formRow,
    emptySteps,
  };
};
