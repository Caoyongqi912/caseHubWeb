import { CSSProperties } from 'react';
import { useCaseHubTheme } from '../../styles/useCaseHubTheme';

export const useCaseSubStepsStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const container = (): CSSProperties => ({
    minHeight: '100%',
    background: colors.bgContainer,
  });

  const header = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.lg}px ${spacing.xl}px`,
    borderBottom: `1px solid ${colors.border}`,
    background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)`,
  });

  const headerLeft = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  });

  const stepCounter = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
  });

  const statusSwitch = (statusConfig: {
    bg: string;
    border: string;
    text: string;
  }): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: borderRadius.lg,
    background: statusConfig.bg,
    border: `1px solid ${statusConfig.border}`,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const statusText = (status: number): CSSProperties => ({
    fontSize: 12,
    fontWeight: 600,
    color:
      status === 1
        ? '#22c55e'
        : status === 2
        ? '#ef4444'
        : colors.textSecondary,
  });

  const headerRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
  });

  const saveIndicator = (status: number): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: borderRadius.md,
    background: status === 1 ? `${colors.warning}10` : `${colors.success}10`,
    color: status === 1 ? colors.warning : colors.success,
    fontSize: 12,
    fontWeight: 500,
  });

  const body = (): CSSProperties => ({
    padding: spacing.xl,
  });

  const textareaWrapper = (): CSSProperties => ({
    marginBottom: spacing.lg,
  });

  const textareaLabel = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
  });

  const textarea = (focused: boolean): CSSProperties => ({
    width: '100%',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${focused ? colors.primary : colors.border}`,
    background: focused ? `${colors.primary}02` : colors.bgLayout,
    fontSize: 13,
    lineHeight: 1.6,
    resize: 'none' as const,
    transition: 'all 150ms ease',
    outline: 'none',
    color: colors.text,
  });

  const sectionTitle = (): CSSProperties => ({
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  });

  const stepsContainer = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  });

  const stepRow = (isHovered: boolean, index: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '24px 32px 1fr 1fr auto',
    gap: spacing.md,
    alignItems: 'start',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.lg,
    background: isHovered ? `${colors.primary}04` : colors.bgLayout,
    border: `1px solid ${
      isHovered ? `${colors.primary}20` : colors.borderSecondary
    }`,
    transition: 'all 150ms ease',
    animation: `slideIn 200ms ease-out ${index * 30}ms both`,
  });

  const dragHandle = (isDragging: boolean): CSSProperties => ({
    cursor: 'grab',
    color: isDragging ? colors.primary : colors.textSecondary,
    transition: 'all 150ms ease',
  });

  const stepNumber = (num: number): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: borderRadius.round,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    boxShadow: `0 2px 6px ${colors.primary}30`,
  });

  const stepInput = (focused: boolean): CSSProperties => ({
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: borderRadius.md,
    border: `1px solid ${focused ? colors.primary : colors.borderSecondary}`,
    background: focused ? `${colors.primary}02` : colors.bgContainer,
    fontSize: 13,
    lineHeight: 1.5,
    resize: 'none' as const,
    transition: 'all 150ms ease',
    outline: 'none',
    color: colors.text,
    minHeight: 60,
  });

  const stepActions = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.xs,
  });

  const addButton = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    padding: `${spacing.md}px`,
    borderRadius: borderRadius.lg,
    border: `1px dashed ${colors.border}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const footerAction = (): CSSProperties => ({
    marginTop: spacing.lg,
    display: 'flex',
    justifyContent: 'flex-end',
  });

  const quickCreateBtn = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: `${colors.primary}08`,
    border: `1px solid ${colors.primary}20`,
    color: colors.primary,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  return {
    container,
    header,
    headerLeft,
    stepCounter,
    statusSwitch,
    statusText,
    headerRight,
    saveIndicator,
    body,
    textareaWrapper,
    textareaLabel,
    textarea,
    sectionTitle,
    stepsContainer,
    stepRow,
    dragHandle,
    stepNumber,
    stepInput,
    stepActions,
    addButton,
    footerAction,
    quickCreateBtn,
  };
};
