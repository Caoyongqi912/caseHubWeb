import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

export const useDynamicInfoStyles = () => {
  const { token, colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: `
      radial-gradient(ellipse at 0% 0%, ${colors.primaryBg}40 0%, transparent 50%),
      linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
    `,
    padding: spacing.lg,
  });

  const card = (): CSSProperties => ({
    borderRadius: borderRadius.xxl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: shadows.lg,
    background: colors.bgContainer,
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.xl}px ${spacing.xl}px`,
    background: `
      linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)
    `,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  });

  const headerIcon = (): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${colors.primary}40`,
  });

  const timelineItem = (index: number): CSSProperties => ({
    padding: `${spacing.md}px 0`,
    position: 'relative' as const,
    animation: `slideIn 300ms ease-out ${index * 50}ms both`,
  });

  const avatar = (index: number): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    background: `linear-gradient(135deg, ${
      index % 3 === 0
        ? colors.primary
        : index % 3 === 1
        ? colors.warning
        : colors.info
    } 0%, ${
      index % 3 === 0
        ? colors.primaryHover
        : index % 3 === 1
        ? colors.warningHover
        : colors.infoHover
    } 100%)`,
    boxShadow: `0 2px 8px ${
      index % 3 === 0
        ? colors.primary
        : index % 3 === 1
        ? colors.warning
        : colors.info
    }40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.bgContainer}`,
  });

  const dot = (index: number): CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${
      index % 2 === 0 ? colors.success : colors.primary
    } 0%, ${index % 2 === 0 ? colors.successHover : colors.primaryHover} 100%)`,
    boxShadow: `0 0 0 4px ${
      index % 2 === 0 ? colors.successBg : colors.primaryBg
    }`,
  });

  const contentCard = (): CSSProperties => ({
    marginLeft: spacing.xl,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.xl,
    background: colors.bgLayout,
    border: `1px solid ${colors.borderSecondary}`,
    position: 'relative' as const,
    transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
  });

  const timeTag = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: borderRadius.round,
    background: colors.bgContainer,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: 500,
  });

  const emptyState = (): CSSProperties => ({
    textAlign: 'center' as const,
    padding: spacing.xxxl,
    color: colors.textSecondary,
  });

  const toggleButton = (): CSSProperties => ({
    color: colors.primary,
    cursor: 'pointer',
    fontWeight: 600,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.round,
    transition: `all ${token.motionDurationFast}`,
    background: colors.primaryBg,
  });

  return {
    container,
    card,
    header,
    headerIcon,
    timelineItem,
    avatar,
    dot,
    contentCard,
    timeTag,
    emptyState,
    toggleButton,
  };
};
