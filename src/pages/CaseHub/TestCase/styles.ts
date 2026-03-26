import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../styles/useCaseHubTheme';

export const useTestCaseStyles = () => {
  const { colors, spacing } = useCaseHubTheme();

  const getStatusColors = (caseStatus: number) => {
    switch (caseStatus) {
      case 1:
        return {
          accent: '#22c55e',
          text: '#15803d',
          bg: 'rgba(34, 197, 94, 0.08)',
        };
      case 2:
        return {
          accent: '#ef4444',
          text: '#b91c1c',
          bg: 'rgba(239, 68, 68, 0.08)',
        };
      case 3:
        return {
          accent: '#f59e0b',
          text: '#b45309',
          bg: 'rgba(245, 158, 11, 0.08)',
        };
      default:
        return {
          accent: colors.textSecondary,
          text: colors.textSecondary,
          bg: 'transparent',
        };
    }
  };

  const container = (
    isHovered: boolean,
    isSelected: boolean = false,
  ): CSSProperties => ({
    position: 'relative',
    borderRadius: 10,
    background: colors.bgContainer,
    transition: 'all 150ms ease',
    transform: isHovered || isSelected ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow:
      isHovered || isSelected
        ? `0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px ${
            isSelected ? colors.primary : `${colors.border}60`
          }`
        : '0 1px 3px rgba(0, 0, 0, 0.03)',
    border: '1px solid transparent',
    overflow: 'hidden',
  });

  const leftAccent = (
    isHovered: boolean,
    caseStatus: number,
    isSelected: boolean = false,
  ): CSSProperties => {
    const statusColors = getStatusColors(caseStatus);

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: `linear-gradient(180deg, ${statusColors.accent} 0%, ${statusColors.accent}90 100%)`,
      boxShadow: `0 0 6px ${statusColors.accent}40`,
      opacity: caseStatus > 0 ? 1 : isHovered || isSelected ? 0.8 : 0.3,
      transition: 'all 150ms ease',
    };
  };

  const inner = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing.sm}px ${spacing.md}px ${spacing.sm}px ${spacing.lg}px`,
    gap: spacing.sm,
    minHeight: 44,
  });

  const checkbox = (
    isSelected: boolean,
    isHovered: boolean,
  ): CSSProperties => ({
    opacity: isSelected ? 1 : isHovered ? 0.7 : 0.3,
    transition: 'opacity 150ms',
  });

  const caseIdTag = (): CSSProperties => ({
    padding: '2px 8px',
    borderRadius: 10,
    background: `${colors.primary}10`,
    color: colors.primary,
    fontSize: 11,
    fontWeight: 600,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    letterSpacing: '0.02em',
    flexShrink: 0,
  });

  const titleInputContainer = (): CSSProperties => ({
    flex: 1,
    minWidth: 0,
    position: 'relative',
    marginLeft: spacing.lg,
  });

  const titleInput = (isFocused: boolean): CSSProperties => ({
    width: '100%',
    border: 'none',
    background: isFocused ? `${colors.primary}06` : 'transparent',
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
    padding: `${spacing.xs}px 0`,
    borderRadius: 6,
    transition: 'all 150ms',
    outline: 'none',
  });

  const focusIndicator = (isFocused: boolean): CSSProperties => ({
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    background: isFocused ? colors.primary : 'transparent',
    transition: 'all 150ms',
    transform: isFocused ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
  });

  const metaSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  });

  const statusTag = (
    _statusConfig: { bg: string; text: string },
    caseStatus: number,
  ): CSSProperties => {
    const statusColors = getStatusColors(caseStatus);

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 10,
      background: statusColors.bg,
      color: statusColors.text,
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid ${statusColors.accent}30`,
      transition: 'all 150ms',
      flexShrink: 0,
    };
  };

  const detailBtn = (isHovered: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    background: isHovered ? `${colors.primary}08` : 'transparent',
    color: colors.primary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms',
    opacity: isHovered ? 1 : 0.4,
    flexShrink: 0,
  });

  const moreBtn = (isHovered: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 8,
    background: isHovered ? `${colors.primary}06` : 'transparent',
    color: colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms',
    opacity: isHovered ? 1 : 0.4,
    flexShrink: 0,
  });

  const caseFlagTag = (
    type: 'common' | 'review-active' | 'review-pending',
  ): CSSProperties => {
    if (type === 'common') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 8,
        background: `${colors.warning}15`,
        color: colors.warning,
        fontSize: 10,
        fontWeight: 600,
        border: `1px solid ${colors.warning}30`,
        flexShrink: 0,
      };
    }
    if (type === 'review-active') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 8,
        background: `${colors.success}15`,
        color: colors.success,
        fontSize: 10,
        fontWeight: 600,
        border: `1px solid ${colors.success}30`,
        flexShrink: 0,
      };
    }
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 6px',
      borderRadius: 8,
      background: `${colors.textSecondary}10`,
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: 600,
      border: `1px solid ${colors.textSecondary}30`,
      flexShrink: 0,
    };
  };

  return {
    container,
    leftAccent,
    inner,
    checkbox,
    caseIdTag,
    titleInputContainer,
    titleInput,
    focusIndicator,
    metaSection,
    statusTag,
    detailBtn,
    moreBtn,
    caseFlagTag,
  };
};
