import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import type { CSSProperties } from 'react';

export const useModuleCaseSelectorStyles = () => {
  const { colors, spacing, borderRadius, shadows, animations } =
    useCaseHubTheme();

  const container = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: colors.bgLayout,
    overflow: 'hidden',
  });

  const headerBar = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    borderRadius: `${borderRadius.lg}px ${borderRadius.lg}px 0 0`,
  });

  const titleText = (): CSSProperties => ({
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: 0.2,
  });

  const libraryChip = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: borderRadius.round,
    background: colors.primaryBg,
    color: colors.primary,
    fontSize: 12,
    fontWeight: 500,
    border: `1px solid ${colors.primary}30`,
    cursor: 'pointer',
    transition: `all ${animations.base} ${animations.easeInOut}`,
  });

  const toolbarRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderBottom: `1px solid ${colors.borderSecondary}`,
  });

  const searchWrap = (): CSSProperties => ({
    flex: 1,
    minWidth: 0,
  });

  const toolbarRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    cursor: 'pointer',
    padding: `4px 8px`,
    borderRadius: borderRadius.sm,
    transition: `all ${animations.base} ${animations.easeInOut}`,
  });

  const body = (): CSSProperties => ({
    flex: 1,
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden',
    background: colors.bgContainer,
  });

  const leftPane = (): CSSProperties => ({
    width: '38%',
    minWidth: 280,
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${colors.borderSecondary}`,
    background: colors.bgContainer,
  });

  const rightPane = (): CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: colors.bgContainer,
  });

  const paneHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    background: colors.bgElevated,
    flexShrink: 0,
  });

  const paneTitle = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
  });

  const paneCount = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 400,
  });

  const paneBody = (): CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: `${spacing.xs}px 0`,
    minHeight: 0,
  });

  const treeWrap = (): CSSProperties => ({
    padding: `${spacing.xs}px ${spacing.sm}px`,
  });

  const caseRow = (isHover: boolean, isChecked: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `10px ${spacing.md}px`,
    cursor: 'pointer',
    background: isChecked
      ? colors.primaryBg
      : isHover
      ? colors.bgElevated
      : 'transparent',
    borderBottom: `1px solid ${colors.borderSecondary}`,
    transition: `all ${animations.fast} ${animations.easeInOut}`,
  });

  const caseName = (): CSSProperties => ({
    flex: 1,
    fontSize: 13,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  const emptyHint = (): CSSProperties => ({
    padding: `${spacing.xxl}px ${spacing.lg}px`,
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 13,
  });

  const footer = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px ${spacing.lg}px`,
    background: colors.bgContainer,
    borderTop: `1px solid ${colors.borderSecondary}`,
    flexShrink: 0,
  });

  const footerLeft = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: colors.textSecondary,
    fontSize: 13,
  });

  const footerRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const treeNodeTitle = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: colors.text,
    overflow: 'hidden',
  });

  const treeNodeBadge = (): CSSProperties => ({
    fontSize: 11,
    color: colors.textTertiary,
    background: colors.bgElevated,
    padding: '0 6px',
    borderRadius: borderRadius.round,
    border: `1px solid ${colors.borderSecondary}`,
    lineHeight: '16px',
  });

  return {
    container,
    headerBar,
    titleText,
    libraryChip,
    toolbarRow,
    searchWrap,
    toolbarRight,
    body,
    leftPane,
    rightPane,
    paneHeader,
    paneTitle,
    paneCount,
    paneBody,
    treeWrap,
    caseRow,
    caseName,
    emptyHint,
    footer,
    footerLeft,
    footerRight,
    treeNodeTitle,
    treeNodeBadge,
    shadows,
    colors,
    spacing,
    borderRadius,
    animations,
  };
};
