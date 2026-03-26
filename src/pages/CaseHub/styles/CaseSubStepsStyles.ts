import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useCaseSubStepsStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    position: 'relative',
    borderRadius: 20,
    background: `linear-gradient(145deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)`,
    border: `1px solid ${colors.border}20`,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  });

  const header = (): CSSProperties => ({
    padding: `${spacing.lg}px ${spacing.xl}px`,
    background: `linear-gradient(135deg, ${colors.primaryBg}30 0%, transparent 100%)`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const headerLeft = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  });

  const headerRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: 'auto',
    paddingLeft: spacing.lg,
    color: colors.textSecondary,
    fontSize: 12,
  });

  const stepCounter = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 18px',
    borderRadius: 12,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    boxShadow: `0 4px 16px ${colors.primary}35`,
  });

  const statusSwitch = (statusConfig: {
    bg: string;
    border: string;
    text: string;
  }): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    borderRadius: 20,
    background: statusConfig.bg,
    border: `1px solid ${statusConfig.border}`,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  });

  const statusText = (status: number): CSSProperties => {
    const isActive = status === 1 || status === 2;
    return {
      fontSize: 12,
      fontWeight: 600,
      color:
        status === 1
          ? '#22c55e'
          : status === 2
          ? '#ef4444'
          : colors.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    };
  };

  const body = (): CSSProperties => ({
    padding: spacing.xl,
  });

  const sectionTitle = (): CSSProperties =>
    ({
      fontSize: 13,
      fontWeight: 600,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: spacing.lg,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      '::before': {
        content: '""',
        width: 4,
        height: 16,
        borderRadius: 2,
        background: colors.primary,
      },
    } as CSSProperties);

  const textareaWrapper = (): CSSProperties => ({
    marginBottom: spacing.xl,
  });

  const textareaLabel = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
  });

  const textarea = (isFocused: boolean): CSSProperties => ({
    width: '100%',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: 12,
    border: `1px solid ${isFocused ? colors.primary : colors.border}`,
    background: isFocused ? `${colors.primary}03` : colors.bgContainer,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.text,
    resize: 'none',
    transition: 'all 200ms ease',
    outline: 'none',
    boxShadow: isFocused ? `0 0 0 3px ${colors.primary}15` : 'none',
    fontFamily: 'inherit',
  });

  const stepsContainer = (): CSSProperties => ({
    marginBottom: spacing.xl,
  });

  const stepRow = (isHovered: boolean, index: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '32px 40px 1fr 1fr 80px',
    gap: spacing.md,
    alignItems: 'start',
    padding: `${spacing.lg}px ${spacing.lg}px`,
    borderRadius: 12,
    background: isHovered
      ? `${colors.primary}04`
      : index % 2 === 0
      ? 'transparent'
      : `${colors.bgLayout}50`,
    border: `1px solid ${isHovered ? `${colors.primary}20` : 'transparent'}`,
    transition: 'all 200ms ease',
    marginBottom: spacing.sm,
    cursor: 'grab',
  });

  const stepNumber = (num: number): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    boxShadow: `0 2px 8px ${colors.primary}30`,
    flexShrink: 0,
  });

  const stepInput = (isFocused: boolean): CSSProperties => ({
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: 10,
    border: `1px solid ${isFocused ? colors.primary : colors.border}40`,
    background: colors.bgContainer,
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.text,
    resize: 'none',
    transition: 'all 200ms ease',
    outline: 'none',
    minHeight: 60,
    fontFamily: 'inherit',
    boxShadow: isFocused ? `0 0 0 2px ${colors.primary}15` : 'none',
  });

  const stepActions = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
  });

  const dragHandle = (isDragging: boolean): CSSProperties => ({
    width: 24,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDragging ? 'grabbing' : 'grab',
    color: colors.textTertiary,
    transition: 'opacity 200ms',
  });

  const addButton = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    padding: `${spacing.md}px`,
    borderRadius: 12,
    border: `2px dashed ${colors.border}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  });

  const saveIndicator = (status: number): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: '6px 12px',
    borderRadius: 8,
    background:
      status === 1
        ? `${colors.warning}10`
        : status === 2
        ? `${colors.success}10`
        : 'transparent',
    fontSize: 13,
    fontWeight: 500,
    color:
      status === 1
        ? colors.warning
        : status === 2
        ? colors.success
        : 'transparent',
    transition: 'all 300ms ease',
  });

  const emptyState = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: colors.textSecondary,
  });

  const footerAction = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: `${spacing.lg}px 0 0`,
    marginTop: spacing.lg,
    borderTop: `1px solid ${colors.borderSecondary}`,
  });

  const quickCreateBtn = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 24,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    boxShadow: `0 4px 16px ${colors.primary}35`,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  });

  return {
    container,
    header,
    headerLeft,
    headerRight,
    stepCounter,
    statusSwitch,
    statusText,
    body,
    sectionTitle,
    textareaWrapper,
    textareaLabel,
    textarea,
    stepsContainer,
    stepRow,
    stepNumber,
    stepInput,
    stepActions,
    dragHandle,
    addButton,
    saveIndicator,
    emptyState,
    footerAction,
    quickCreateBtn,
  };
};
