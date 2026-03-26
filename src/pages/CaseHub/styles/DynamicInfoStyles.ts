import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useDynamicInfoStyles = () => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();

  const containerStyle = (): CSSProperties => ({
    minHeight: '100%',
    background: `
      radial-gradient(ellipse at 0% 0%, ${colors.primaryBg}40 0%, transparent 50%),
      linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
    `,
    padding: spacing.lg,
  });

  const cardStyle = (): CSSProperties => ({
    borderRadius: borderRadius.xxl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: shadows.lg,
    background: colors.bgContainer,
  });

  const headerStyle = (): CSSProperties => ({
    padding: `${spacing.xl}px ${spacing.xl}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  });

  const headerIconStyle = (): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${colors.primary}40`,
  });

  const timelineItemStyle = (index: number): CSSProperties => ({
    padding: `${spacing.md}px 0`,
    position: 'relative' as const,
    animation: `slideIn 300ms ease-out ${index * 50}ms both`,
  });

  const avatarStyle = (index: number): CSSProperties => {
    const colorIndex = index % 3;
    const gradients = [
      { start: colors.primary, end: colors.primaryHover },
      { start: colors.warning, end: colors.warningHover || colors.warning },
      { start: colors.info, end: colors.infoHover || colors.info },
    ];
    return {
      width: 40,
      height: 40,
      borderRadius: borderRadius.round,
      background: `linear-gradient(135deg, ${gradients[colorIndex].start} 0%, ${gradients[colorIndex].end} 100%)`,
      boxShadow: `0 2px 8px ${gradients[colorIndex].start}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${colors.bgContainer}`,
    };
  };

  const dotStyle = (index: number): CSSProperties => {
    const isEven = index % 2 === 0;
    return {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${
        isEven ? colors.success : colors.primary
      } 0%, ${
        isEven
          ? colors.successHover || colors.success
          : colors.primaryHover || colors.primary
      } 100%)`,
      boxShadow: `0 0 0 4px ${isEven ? colors.successBg : colors.primaryBg}`,
    };
  };

  const contentCardStyle = (): CSSProperties => ({
    marginLeft: spacing.xl,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.xl,
    background: colors.bgLayout,
    border: `1px solid ${colors.borderSecondary}`,
    position: 'relative' as const,
    transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
  });

  const timeTagStyle = (): CSSProperties => ({
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

  const emptyStateStyle = (): CSSProperties => ({
    textAlign: 'center' as const,
    padding: spacing.xxxl,
    color: colors.textSecondary,
  });

  const toggleAreaStyle = (): CSSProperties => ({
    textAlign: 'center' as const,
    marginTop: spacing.lg,
    padding: `${spacing.md}px 0`,
    borderTop: `1px dashed ${colors.border}`,
  });

  const toggleTextStyle = (): CSSProperties => ({
    color: colors.primary,
    cursor: 'pointer',
    fontWeight: 600,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.round,
    transition: `all ${token.motionDurationFast}`,
    background: colors.primaryBg,
  });

  return {
    containerStyle,
    cardStyle,
    headerStyle,
    headerIconStyle,
    timelineItemStyle,
    avatarStyle,
    dotStyle,
    contentCardStyle,
    timeTagStyle,
    emptyStateStyle,
    toggleAreaStyle,
    toggleTextStyle,
  };
};
