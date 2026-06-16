import {
  borderRadius,
  spacing,
  styleHelpers,
  typography,
} from '@/components/LeftComponents/styles';
import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

export const useDynamicInfoStyles = () => {
  const { token, colors } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: 'transparent',
  });

  const card = (): CSSProperties => ({
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.md}px 0`,
    background: 'transparent',
    borderBottom: `1px solid ${colors.borderSecondary}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  });

  const headerIcon = (): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    background: colors.primaryBg,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...styleHelpers.transition(['background-color', 'color'], '150ms'),
  });

  const timelineItem = (index: number): CSSProperties => ({
    padding: `${spacing.md}px 0`,
    position: 'relative' as const,
    animation: `slideIn 300ms ease-out ${index * 50}ms both`,
  });

  const dot = (): CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primaryBg}`,
  });

  const contentCard = (): CSSProperties => ({
    marginLeft: spacing.lg,
    padding: `${spacing.sm}px 0`,
    background: 'transparent',
    position: 'relative' as const,
  });

  const metaRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  });

  const timeTag = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 16,
    padding: '0 5px',
    borderRadius: borderRadius.sm,
    background: `${colors.primary}14`,
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '16px',
  });

  const descriptionRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
  });

  const descriptionIcon = (): CSSProperties => ({
    width: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.6,
    color: colors.textTertiary,
  });

  const descriptionText = (): CSSProperties => ({
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 1.6,
  });

  const emptyState = (): CSSProperties => ({
    textAlign: 'center' as const,
    padding: spacing.xxxl,
    color: colors.textSecondary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const emptyIconWrap = (): CSSProperties => ({
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    background: colors.primaryBg,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  });

  const toggleButton = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    background: colors.primaryBg,
    border: 'none',
    fontSize: typography.fontSize.base,
    lineHeight: 1.5,
    ...styleHelpers.transition(
      ['background-color', 'box-shadow'],
      '200ms',
      'cubic-bezier(0.4, 0, 0.2, 1)',
    ),
  });

  return {
    container,
    card,
    header,
    headerIcon,
    timelineItem,
    dot,
    contentCard,
    metaRow,
    timeTag,
    descriptionRow,
    descriptionIcon,
    descriptionText,
    emptyState,
    emptyIconWrap,
    toggleButton,
  };
};
