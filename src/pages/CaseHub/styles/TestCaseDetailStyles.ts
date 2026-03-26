import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useTestCaseDetailStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const containerStyle = (statusConfig: { bg: string }): CSSProperties => ({
    minHeight: '100%',
    background: `
      radial-gradient(ellipse at 20% 0%, ${colors.primaryBg}40 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, ${statusConfig.bg}30 0%, transparent 50%),
      linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
    `,
    padding: spacing.lg,
  });

  const mainCardStyle = (): CSSProperties => ({
    borderRadius: borderRadius.xxl,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden' as const,
    boxShadow: shadows.xl,
    background: colors.bgContainer,
  });

  const heroStyle = (statusConfig: { bg: string }): CSSProperties => ({
    position: 'relative' as const,
    padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.xl}px`,
    background: `
      linear-gradient(135deg, ${colors.primary}08 0%, ${statusConfig.bg}20 50%, ${colors.infoBg}10 100%)
    `,
    borderBottom: `1px solid ${colors.borderSecondary}`,
  });

  const statusBadgeStyle = (statusConfig: {
    bg: string;
    border: string;
    text: string;
  }): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: borderRadius.round,
    background: statusConfig.bg,
    border: `1px solid ${statusConfig.border}`,
    color: statusConfig.text,
    fontWeight: 700,
    fontSize: 14,
    boxShadow: `0 4px 16px ${statusConfig.bg}40`,
  });

  const levelBadgeStyle = (levelConfig: {
    bg: string;
    border: string;
    text: string;
  }): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: borderRadius.lg,
    background: levelConfig.bg,
    border: `1px solid ${levelConfig.border}`,
    color: levelConfig.text,
    fontWeight: 600,
    fontSize: 13,
    boxShadow: `0 2px 8px ${levelConfig.bg}40`,
  });

  const typeBadgeStyle = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: borderRadius.lg,
    background: colors.infoBg,
    border: `1px solid ${colors.info}`,
    color: colors.info,
    fontWeight: 600,
    fontSize: 13,
  });

  const formSectionStyle = (): CSSProperties => ({
    padding: spacing.xl,
    background: colors.bgContainer,
  });

  const fieldLabelStyle = (): CSSProperties => ({
    color: colors.textSecondary,
    fontWeight: 500,
    fontSize: 13,
  });

  const avatarBoxStyle = (): CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 16px ${colors.primary}40`,
  });

  const uidTextStyle = (): CSSProperties => ({
    color: colors.primary,
    fontWeight: 600,
    fontSize: 14,
  });

  return {
    containerStyle,
    mainCardStyle,
    heroStyle,
    statusBadgeStyle,
    levelBadgeStyle,
    typeBadgeStyle,
    formSectionStyle,
    fieldLabelStyle,
    avatarBoxStyle,
    uidTextStyle,
  };
};
