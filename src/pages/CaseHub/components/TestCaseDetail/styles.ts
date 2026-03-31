import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

export const useTestCaseDetailStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: `
      radial-gradient(ellipse at 0% 0%, ${colors.primaryBg}30 0%, transparent 50%),
      linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
    `,
    padding: spacing.lg,
  });

  const mainCard = (): CSSProperties => ({
    borderRadius: borderRadius.xxl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: shadows.lg,
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.lg}px ${spacing.xl}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const body = (): CSSProperties => ({
    padding: spacing.xl,
  });

  const sectionHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  });

  const sectionTitle = (): CSSProperties => ({
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: 0.5,
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
    background: colors.bgLayout,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.borderSecondary}`,
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.lg,
  });

  const formSubGrid = (): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  });

  return {
    container,
    mainCard,
    header,
    body,
    sectionHeader,
    sectionTitle,
    sectionDivider,
    infoItem,
    commonTag,
    reviewTag,
    formGrid,
    formSubGrid,
  };
};
