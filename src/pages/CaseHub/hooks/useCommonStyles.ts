import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { useMemo } from 'react';

/**
 * 公共样式Hook
 * 提取重复的样式定义，统一样式管理
 */

/**
 * Drawer样式Hook
 * 统一的Drawer样式定义，避免在多个组件中重复定义
 */
export const useDrawerStyles = () => {
  const { colors, spacing, token } = useCaseHubTheme();

  return useMemo(
    () => ({
      header: {
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${token.paddingLG}px ${token.paddingXL}px`,
        fontWeight: 600,
      },
      body: {
        padding: spacing.lg,
        background: colors.bgContainer,
      },
    }),
    [colors, spacing, token],
  );
};

/**
 * 卡片样式Hook
 * 统一的卡片样式定义
 */
export const useCardStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  return useMemo(
    () => ({
      container: (isHovered: boolean, isSelected: boolean) => ({
        position: 'relative' as const,
        marginBottom: spacing.sm,
        background: colors.bgContainer,
        borderRadius: borderRadius.lg,
        border: `1px solid ${isSelected ? colors.primary : colors.border}`,
        boxShadow: isHovered ? shadows.cardHover : shadows.card,
        transition: `all 0.2s ease`,
        overflow: 'hidden',
      }),
      header: {
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.bgElevated,
      },
      body: {
        padding: spacing.lg,
      },
    }),
    [colors, spacing, borderRadius, shadows],
  );
};

/**
 * 按钮样式Hook
 * 统一的按钮样式定义
 */
export const useButtonStyles = () => {
  const { colors, borderRadius } = useCaseHubTheme();

  return useMemo(
    () => ({
      primary: {
        borderRadius: borderRadius.md,
        fontWeight: 500,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${
          colors.primaryHover || colors.primary
        } 100%)`,
        border: 'none',
      },
      default: {
        borderRadius: borderRadius.md,
        fontWeight: 500,
      },
      danger: {
        borderRadius: borderRadius.md,
        fontWeight: 500,
      },
    }),
    [colors, borderRadius],
  );
};

/**
 * 标签样式Hook
 * 统一的标签样式定义
 */
export const useTagStyles = () => {
  const { colors, borderRadius } = useCaseHubTheme();

  return useMemo(
    () => ({
      default: {
        borderRadius: borderRadius.md,
        fontWeight: 500,
        margin: 0,
      },
      primary: {
        background: colors.primaryBg,
        borderColor: colors.primary,
        color: colors.primary,
        borderRadius: borderRadius.md,
        fontWeight: 500,
        margin: 0,
      },
      success: {
        background: colors.successBg,
        borderColor: colors.success,
        color: colors.success,
        borderRadius: borderRadius.md,
        fontWeight: 500,
        margin: 0,
      },
      error: {
        background: colors.errorBg,
        borderColor: colors.error,
        color: colors.error,
        borderRadius: borderRadius.md,
        fontWeight: 500,
        margin: 0,
      },
      warning: {
        background: colors.warningBg,
        borderColor: colors.warning,
        color: colors.warning,
        borderRadius: borderRadius.md,
        fontWeight: 500,
        margin: 0,
      },
    }),
    [colors, borderRadius],
  );
};

/**
 * 表格样式Hook
 * 统一的表格样式定义
 */
export const useTableStyles = () => {
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  return useMemo(
    () => ({
      header: {
        background: colors.bgElevated,
        borderBottom: `1px solid ${colors.border}`,
      },
      row: (isHovered: boolean) => ({
        background: isHovered ? colors.bgSpotlight : colors.bgContainer,
        transition: 'background 0.2s ease',
      }),
      cell: {
        padding: `${spacing.md}px ${spacing.lg}px`,
      },
    }),
    [colors, spacing, borderRadius],
  );
};
