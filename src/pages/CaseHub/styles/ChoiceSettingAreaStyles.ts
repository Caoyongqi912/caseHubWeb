import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useChoiceSettingAreaStyles = () => {
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg}50 0%, ${colors.bgContainer} 100%)`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`,
    gap: spacing.md,
    flexWrap: 'wrap',
  });

  const selectionInfo = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  });

  const countBadge = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs}px ${spacing.md}px`,
    background: `${colors.primary}10`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.primary}20`,
  });

  const countValue = (): CSSProperties => ({
    fontWeight: 700,
    fontSize: 14,
    color: colors.primary,
  });

  const countLabel = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textSecondary,
  });

  const actionGroup = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  });

  const actionBtn = (
    variant: 'default' | 'success' | 'error' | 'warning',
  ): CSSProperties => {
    const variantColors = {
      default: { color: colors.primary, bg: `${colors.primary}08` },
      success: { color: colors.success, bg: `${colors.success}10` },
      error: { color: colors.error, bg: `${colors.error}10` },
      warning: { color: colors.success, bg: `${colors.success}10` },
    };
    const vc = variantColors[variant];
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs}px ${spacing.sm}px`,
      borderRadius: borderRadius.md,
      background: vc.bg,
      color: vc.color,
      fontSize: 12,
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    };
  };

  const divider = (): CSSProperties => ({
    width: 1,
    height: 20,
    background: colors.border,
    margin: `0 ${spacing.xs}px`,
  });

  const linkText = (color: string): CSSProperties => ({
    fontSize: 12,
    fontWeight: 500,
    color: color,
    cursor: 'pointer',
    transition: 'color 150ms ease',
  });

  return {
    container,
    selectionInfo,
    countBadge,
    countValue,
    countLabel,
    actionGroup,
    actionBtn,
    divider,
    linkText,
  };
};
