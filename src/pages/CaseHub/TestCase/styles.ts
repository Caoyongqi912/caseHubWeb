import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../styles/useCaseHubTheme';

export const useTestCaseStyles = () => {
  const { colors, spacing } = useCaseHubTheme();

  const container = (
    isHovered: boolean,
    isSelected: boolean = false,
  ): CSSProperties => ({
    position: 'relative',
    borderRadius: 16,
    background: isSelected
      ? `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primaryBg} 100%)`
      : colors.bgContainer,
    transition: 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform:
      isHovered || isSelected
        ? 'translateY(-2px) scale(1.002)'
        : 'translateY(0) scale(1)',
    boxShadow:
      isHovered || isSelected
        ? `0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 2px ${colors.primary}30`
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    border: `1px solid ${
      isSelected
        ? colors.primary
        : isHovered
        ? `${colors.primary}40`
        : `${colors.border}20`
    }`,
    overflow: 'hidden',
  });

  const leftAccent = (
    isHovered: boolean,
    caseStatus: number,
    isSelected: boolean = false,
  ): CSSProperties => {
    let accentColor = colors.textSecondary;
    let glowColor = 'rgba(0,0,0,0.1)';

    if (caseStatus === 1) {
      accentColor = '#22c55e';
      glowColor = 'rgba(34, 197, 94, 0.3)';
    } else if (caseStatus === 2) {
      accentColor = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.3)';
    }

    return {
      position: 'absolute',
      left: 0,
      top: 8,
      bottom: 8,
      width: isSelected ? 4 : 3,
      borderRadius: '0 3px 3px 0',
      background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}80 100%)`,
      boxShadow: isHovered || isSelected ? `0 0 12px ${glowColor}` : 'none',
      opacity: isHovered || isSelected ? 1 : 0.7,
      transition: 'all 200ms',
    };
  };

  const inner = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing.md}px ${spacing.lg}px ${spacing.md}px ${spacing.xl}px`,
    gap: spacing.md,
    minHeight: 56,
  });

  const checkbox = (
    isSelected: boolean,
    isHovered: boolean,
  ): CSSProperties => ({
    opacity: isSelected ? 1 : isHovered ? 0.7 : 0.3,
    transition: 'opacity 200ms',
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
  });

  const caseIdTag = (): CSSProperties => ({
    padding: '3px 12px',
    borderRadius: 20,
    background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`,
    color: colors.primary,
    fontSize: 12,
    fontWeight: 600,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    letterSpacing: '0.02em',
    border: `1px solid ${colors.primary}20`,
  });

  const titleInputContainer = (): CSSProperties => ({
    flex: 1,
    minWidth: 0,
    position: 'relative',
  });

  const titleInput = (isFocused: boolean): CSSProperties => ({
    width: '100%',
    border: 'none',
    background: isFocused ? `${colors.primary}08` : 'transparent',
    fontSize: 15,
    fontWeight: 500,
    color: colors.text,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: 8,
    transition: 'all 200ms',
    outline: 'none',
  });

  const focusIndicator = (isFocused: boolean): CSSProperties => ({
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    borderRadius: 1,
    background: isFocused ? colors.primary : 'transparent',
    transition: 'all 200ms',
    transform: isFocused ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
  });

  const metaSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  });

  const statusTag = (
    statusConfig: { bg: string; text: string },
    caseStatus: number,
  ): CSSProperties => {
    let enhancedBg = statusConfig.bg;
    let enhancedText = statusConfig.text;

    if (caseStatus === 1) {
      enhancedBg = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      enhancedText = '#15803d';
    } else if (caseStatus === 2) {
      enhancedBg = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      enhancedText = '#b91c1c';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 20,
      background: enhancedBg,
      color: enhancedText,
      fontSize: 12,
      fontWeight: 600,
      border: 'none',
      boxShadow:
        caseStatus === 1
          ? '0 2px 8px rgba(34, 197, 94, 0.2)'
          : caseStatus === 2
          ? '0 2px 8px rgba(239, 68, 68, 0.2)'
          : 'none',
    };
  };

  const detailBtn = (isHovered: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    background: isHovered ? `${colors.primary}10` : 'transparent',
    color: colors.primary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 200ms',
    opacity: isHovered ? 1 : 0.5,
  });

  const moreBtn = (isHovered: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 10,
    background: isHovered ? `${colors.primary}08` : 'transparent',
    color: colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 200ms',
    opacity: isHovered ? 1 : 0.5,
  });

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
  };
};
