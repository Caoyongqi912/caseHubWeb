import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useCaseStatsBarStyles = () => {
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xl,
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`,
    flexWrap: 'wrap',
  });

  const progressSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 200,
  });

  const progressBarContainer = (): CSSProperties => ({
    flex: 1,
    height: 8,
    background: `${colors.border}40`,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  });

  const progressBarFill = (passRate: number): CSSProperties => ({
    height: '100%',
    width: `${passRate}%`,
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${
      colors.primaryHover || colors.primary
    } 100%)`,
    borderRadius: borderRadius.sm,
    transition: 'width 300ms ease',
  });

  const statItem = (color: string): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: 13,
    fontWeight: 500,
    color: colors.text,
  });

  const statDot = (color: string): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
  });

  const statValue = (): CSSProperties => ({
    fontWeight: 700,
    fontSize: 14,
  });

  const statPercent = (): CSSProperties => ({
    color: colors.textSecondary,
    fontSize: 12,
  });

  const divider = (): CSSProperties => ({
    width: 1,
    height: 24,
    background: colors.border,
  });

  const summaryText = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  });

  return {
    container,
    progressSection,
    progressBarContainer,
    progressBarFill,
    statItem,
    statDot,
    statValue,
    statPercent,
    divider,
    summaryText,
  };
};
