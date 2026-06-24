import {
  borderRadius,
  spacing,
  styleHelpers,
  typography,
} from '@/components/LeftComponents/styles';
import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

/**
 * 将主题色转换为指定透明度的 rgba 字符串
 * 兼容 hex / rgb / rgba 三种常见格式，确保在自定义主题下也能正确显示发光效果
 * @param color - 主题色值
 * @param alpha - 透明度，0 ~ 1
 * @returns rgba 颜色字符串
 */
const toRgba = (color: string, alpha: number): string => {
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\(([^)]+)\)/, (_, values: string) => {
      const parts = values.split(',').map((s) => s.trim());
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    });
  }
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  let hex = color.replace('#', '');
  // 处理 #fff 这类简写 hex
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length !== 6) return color;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const useDynamicInfoStyles = () => {
  const { colors } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: 'transparent',
    position: 'relative',
  });

  const card = (): CSSProperties => ({
    background: colors.bgContainer,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xxl,
    boxShadow: `0 8px 32px ${toRgba(
      colors.primary,
      0.08,
    )}, 0 2px 8px rgba(0, 0, 0, 0.04)`,
    overflow: 'hidden',
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.lg}px ${spacing.xl}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgElevated} 60%, ${colors.bgContainer} 100%)`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  });

  const headerIcon = (): CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    background: `radial-gradient(circle at 30% 30%, ${toRgba(
      colors.primary,
      0.3,
    )}, ${colors.primaryBg})`,
    border: `1px solid ${toRgba(colors.primary, 0.4)}`,
    boxShadow: `0 0 20px ${toRgba(colors.primary, 0.3)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
    position: 'relative',
  });

  const headerTitle = (): CSSProperties => ({
    margin: 0,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    fontSize: typography.fontSize.lg,
    letterSpacing: '0.5px',
  });

  const headerCount = (): CSSProperties => ({
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  });

  const headerBadge = (): CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    background: colors.primaryBg,
    border: `1px solid ${toRgba(colors.primary, 0.3)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const body = (): CSSProperties => ({
    padding: `${spacing.xl}px`,
    position: 'relative',
  });

  const timeline = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  });

  const timelineRow = (index: number): CSSProperties => ({
    display: 'flex',
    gap: spacing.lg,
    animation: `slideInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) ${
      index * 60
    }ms both`,
  });

  const timelineLeft = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 24,
    flexShrink: 0,
  });

  const node = (): CSSProperties => ({
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, ${colors.primary}, ${colors.primaryHover})`,
    boxShadow: `0 0 0 4px ${colors.primaryBg}, 0 0 16px ${colors.primary}`,
    position: 'relative',
    zIndex: 2,
  });

  const connector = (): CSSProperties => ({
    flex: 1,
    width: 2,
    minHeight: 32,
    background: `linear-gradient(to bottom, ${toRgba(colors.primary, 0.6)}, ${
      colors.borderSecondary
    })`,
    marginTop: spacing.sm,
  });

  const recordCard = (): CSSProperties => ({
    flex: 1,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.xl,
    background: colors.bgElevated,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 2px 8px ${toRgba(
      colors.primary,
      0.08,
    )}, inset 0 1px 0 ${toRgba(colors.primary, 0.1)}`,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
    ...styleHelpers.transition(
      ['transform', 'border-color', 'box-shadow'],
      '200ms',
      'cubic-bezier(0.4, 0, 0.2, 1)',
    ),
  });

  const recordCardHover = (): CSSProperties => ({
    transform: 'translateY(-2px)',
    borderColor: toRgba(colors.primary, 0.6),
    boxShadow: `0 8px 24px ${toRgba(
      colors.primary,
      0.15,
    )}, inset 0 1px 0 ${toRgba(colors.primary, 0.2)}`,
  });

  const recordShimmer = (): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, transparent, ${toRgba(
      colors.primary,
      0.4,
    )}, transparent)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2.5s linear infinite',
    opacity: 0.6,
  });

  const recordHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  });

  const userName = (): CSSProperties => ({
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    fontSize: typography.fontSize.base,
  });

  const timeTag = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: borderRadius.sm,
    background: toRgba(colors.primary, 0.14),
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontVariantNumeric: 'tabular-nums',
  });

  const recordBody = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
  });

  const recordIcon = (): CSSProperties => ({
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    background: toRgba(colors.primary, 0.14),
    color: colors.primary,
    flexShrink: 0,
    marginTop: 2,
  });

  const recordDescription = (): CSSProperties => ({
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 1.7,
    fontSize: typography.fontSize.base,
    wordBreak: 'break-word',
  });

  const emptyState = (): CSSProperties => ({
    textAlign: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: colors.textSecondary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  });

  const emptyIconWrap = (): CSSProperties => ({
    width: 72,
    height: 72,
    borderRadius: borderRadius.round,
    background: `radial-gradient(circle at 30% 30%, ${toRgba(
      colors.primary,
      0.2,
    )}, ${colors.primaryBg})`,
    border: `1px solid ${toRgba(colors.primary, 0.3)}`,
    boxShadow: `0 0 30px ${toRgba(colors.primary, 0.2)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
    marginBottom: spacing.md,
  });

  const toggleArea = (): CSSProperties => ({
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTop: `1px dashed ${colors.borderSecondary}`,
  });

  const toggleButton = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    padding: `${spacing.sm}px ${spacing.xl}px`,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    background: toRgba(colors.primary, 0.1),
    border: `1px solid ${toRgba(colors.primary, 0.4)}`,
    fontSize: typography.fontSize.base,
    lineHeight: 1.5,
    ...styleHelpers.transition(
      ['background-color', 'border-color', 'box-shadow'],
      '200ms',
      'cubic-bezier(0.4, 0, 0.2, 1)',
    ),
  });

  const toggleButtonHover = (): CSSProperties => ({
    background: toRgba(colors.primary, 0.2),
    borderColor: colors.primary,
    boxShadow: `0 0 16px ${toRgba(colors.primary, 0.3)}`,
  });

  return {
    container,
    card,
    header,
    headerIcon,
    headerTitle,
    headerCount,
    headerBadge,
    body,
    timeline,
    timelineRow,
    timelineLeft,
    node,
    connector,
    recordCard,
    recordCardHover,
    recordShimmer,
    recordHeader,
    userName,
    timeTag,
    recordBody,
    recordIcon,
    recordDescription,
    emptyState,
    emptyIconWrap,
    toggleArea,
    toggleButton,
    toggleButtonHover,
  };
};
