import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useCaseInfoStyles = () => {
  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const cardStyle = (): CSSProperties => ({
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 2px 8px ${colors.bgContainer}20`,
    overflow: 'hidden' as const,
  });

  const collapseExpandIcon = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    background: isActive ? colors.primary : colors.primaryBg,
    transition: 'all 200ms ease',
  });

  const groupedCaseLabel = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    fontWeight: 600,
    fontSize: 14,
  });

  const groupTitle = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.text,
  });

  const groupCount = (): CSSProperties => ({
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 500,
  });

  const ungroupedContainer = (): CSSProperties => ({
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    background: colors.bgContainer,
  });

  const scrollIndicator = (): CSSProperties => ({
    position: 'sticky',
    bottom: 0,
    background: `linear-gradient(transparent, ${colors.bgLayout})`,
    height: spacing.xxxl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    borderTop: `1px solid ${colors.borderSecondary}`,
    marginTop: spacing.md,
  });

  const innerCardStyle = (): CSSProperties => ({
    borderRadius: borderRadius.xl,
    margin: spacing.sm,
    minHeight: '70vh',
  });

  return {
    cardStyle,
    collapseExpandIcon,
    groupedCaseLabel,
    groupTitle,
    groupCount,
    ungroupedContainer,
    scrollIndicator,
    innerCardStyle,
  };
};
