import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import type { CSSProperties } from 'react';

const LEVEL_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  P0: {
    bg: 'rgba(255, 77, 79, 0.1)',
    border: 'rgba(255, 77, 79, 0.3)',
    text: '#ff4d4f',
  },
  P1: {
    bg: 'rgba(250, 173, 20, 0.1)',
    border: 'rgba(250, 173, 20, 0.3)',
    text: '#faad14',
  },
  P2: {
    bg: 'rgba(24, 144, 255, 0.1)',
    border: 'rgba(24, 144, 255, 0.3)',
    text: '#1890ff',
  },
  P3: {
    bg: 'rgba(114, 46, 209, 0.1)',
    border: 'rgba(114, 46, 209, 0.3)',
    text: '#722ed1',
  },
};

const ACTION_BTN_CONFIG = {
  review: {
    active: {
      bgKey: 'successBg' as const,
      colorKey: 'success' as const,
      borderKey: 'success' as const,
    },
    inactive: {
      bgKey: 'transparent' as const,
      colorKey: 'textTertiary' as const,
      borderKey: 'border' as const,
    },
  },
  pass: {
    active: {
      bgKey: 'successBg' as const,
      colorKey: 'success' as const,
      borderKey: 'success' as const,
    },
    inactive: {
      bgKey: 'transparent' as const,
      colorKey: 'textTertiary' as const,
      borderKey: 'border' as const,
    },
  },
  fail: {
    active: {
      bgKey: 'errorBg' as const,
      colorKey: 'error' as const,
      borderKey: 'error' as const,
    },
    inactive: {
      bgKey: 'transparent' as const,
      colorKey: 'textTertiary' as const,
      borderKey: 'border' as const,
    },
  },
} as const;

const STATUS_ACCENT_MAP: Record<number, string> = {
  1: 'success',
  2: 'error',
};

export const usePlanCaseListStyles = () => {
  const { colors, spacing, borderRadius, shadows, animations } =
    useCaseHubTheme();

  const container = (): CSSProperties => ({
    height: '100%',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    background: colors.bgLayout,
  });

  const headerBar = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderBottom: `1px solid ${colors.border}`,
    flexShrink: 0,
  });

  const headerActions = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const listContainer = (): CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.md}px ${spacing.lg}px`,
  });

  const caseItemWrapper = (
    isHovered: boolean,
    isExpanded: boolean,
  ): CSSProperties => ({
    position: 'relative',
    marginBottom: spacing.xs,
    borderRadius: borderRadius.lg,
    background: colors.bgContainer,
    border: `1px solid ${
      isHovered || isExpanded ? `${colors.primary}40` : colors.border
    }`,
    boxShadow: isHovered
      ? shadows.cardHover
      : isExpanded
      ? `0 2px 8px ${colors.primary}15`
      : shadows.sm,
    transition: `all ${animations.base} ${animations.easeInOut}`,
    overflow: 'hidden',
  });

  const caseItemInner = (): CSSProperties => ({
    padding: `${spacing.sm}px ${spacing.md}px`,
  });

  const caseItemHeaderRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    cursor: 'pointer',
  });

  const caseItemMetaRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingLeft: 32,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
    borderTop: `1px dashed ${colors.borderSecondary}`,
    marginTop: spacing.xs,
  });

  const metaLeftSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.textTertiary,
    fontSize: 12,
  });

  const metaRightSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const expandIcon = (isExpanded: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    background: isExpanded ? colors.primaryBg : 'transparent',
    color: isExpanded ? colors.primary : colors.textTertiary,
    transition: `all ${animations.fast} ${animations.easeInOut}`,
    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
    flexShrink: 0,
    cursor: 'pointer',
  });

  const caseName = (): CSSProperties => ({
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    lineHeight: '22px',
  });

  const levelTag = (level: string): CSSProperties => {
    const c = LEVEL_COLORS[level] || LEVEL_COLORS.P2;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: borderRadius.round,
      background: c.bg,
      color: c.text,
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid ${c.border}`,
      flexShrink: 0,
    };
  };

  const actionBtn = (
    type: 'review' | 'pass' | 'fail',
    isActive: boolean,
  ): CSSProperties => {
    const cfg = ACTION_BTN_CONFIG[type];
    const resolved = isActive ? cfg.active : cfg.inactive;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: borderRadius.md,
      background:
        resolved.bgKey === 'transparent'
          ? 'transparent'
          : (colors as Record<string, string>)[resolved.bgKey],
      color: (colors as Record<string, string>)[resolved.colorKey],
      fontSize: 12,
      fontWeight: 500,
      border: `1px solid ${
        (colors as Record<string, string>)[resolved.borderKey]
      }40`,
      cursor: 'pointer',
      transition: `all ${animations.fast} ${animations.easeInOut}`,
      flexShrink: 0,
      lineHeight: '20px',
    };
  };

  const iconBtn = (isVisible: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    background: isVisible ? `${colors.primary}08` : 'transparent',
    color: isVisible ? colors.primary : colors.textTertiary,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${animations.fast} ${animations.easeInOut}`,
    opacity: isVisible ? 1 : 0.45,
    flexShrink: 0,
  });

  const moreBtn = (isVisible: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    background: isVisible ? `${colors.text}06` : 'transparent',
    color: colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${animations.fast} ${animations.easeInOut}`,
    opacity: isVisible ? 1 : 0.35,
    flexShrink: 0,
  });

  const stepsContainer = (isExpanded: boolean): CSSProperties => ({
    maxHeight: isExpanded ? 'none' : 0,
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: `all ${animations.slow} ${animations.easeInOut}`,
    background: colors.bgLayout,
  });

  const emptyState = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: colors.textTertiary,
    gap: spacing.md,
  });

  const filterBar = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const leftAccent = (
    isHovered: boolean,
    caseStatus?: number,
  ): CSSProperties => {
    const accentKey = STATUS_ACCENT_MAP[caseStatus || 0];
    const accent = accentKey
      ? (colors as Record<string, string>)[accentKey]
      : colors.border;
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: `linear-gradient(180deg, ${accent} 0%, ${accent}90 100%)`,
      opacity: caseStatus && caseStatus > 0 ? 1 : isHovered ? 0.6 : 0.3,
      transition: `all ${animations.fast} ${animations.easeInOut}`,
      borderRadius: `${borderRadius.lg}px 0 0 ${borderRadius.lg}px`,
    };
  };

  return {
    container,
    headerBar,
    headerActions,
    listContainer,
    caseItemWrapper,
    caseItemInner,
    caseItemHeaderRow,
    caseItemMetaRow,
    metaLeftSection,
    metaRightSection,
    expandIcon,
    caseName,
    levelTag,
    actionBtn,
    iconBtn,
    moreBtn,
    stepsContainer,
    emptyState,
    filterBar,
    leftAccent,
  };
};
