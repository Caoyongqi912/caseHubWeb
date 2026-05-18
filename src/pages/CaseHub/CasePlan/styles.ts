import { useCaseHubTheme } from '@/pages/CaseHub/styles/useCaseHubTheme';
import type { CSSProperties } from 'react';

const STATUS_TAG_STYLES: Record<string, { color: string; bg: string }> = {
  进行中: { color: 'var(--ant-color-info)', bg: 'var(--ant-color-info-bg)' },
  已完成: {
    color: 'var(--ant-color-success)',
    bg: 'var(--ant-color-success-bg)',
  },
  已暂停: {
    color: 'var(--ant-color-warning)',
    bg: 'var(--ant-color-warning-bg)',
  },
  已取消: { color: 'var(--ant-color-error)', bg: 'var(--ant-color-error-bg)' },
};

const PHASE_TAG_COLORS: Record<string, string> = {
  规划: '#722ed1',
  设计: '#eb2f96',
  执行: '#13c2c2',
  验收: '#fa8c16',
};

export const useCasePlanStyles = () => {
  const { token, colors, spacing } = useCaseHubTheme();

  const pageContainer: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  };

  const mainLayout: CSSProperties = {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  };

  const leftPanel: CSSProperties = {
    width: 260,
    flexShrink: 0,
    borderRight: `1px solid ${colors.border}`,
    background: colors.bgContainer,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const leftPanelHeader: CSSProperties = {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
  };

  const leftPanelTitle: CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  };

  const leftPanelContent: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.sm,
  };

  const rightPanel: CSSProperties = {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: colors.bgLayout,
  };

  const rightPanelHeader: CSSProperties = {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.borderSecondary}`,
    background: colors.bgContainer,
  };

  const rightPanelContent: CSSProperties = {
    flex: 1,
    overflow: 'hidden',
  };

  const formModal: CSSProperties = {
    padding: 0,
  };

  const formSection: CSSProperties = {
    marginBottom: 20,
  };

  const sectionLabel: CSSProperties = {
    marginBottom: 8,
    color: token.colorTextSecondary,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const statusTag = (status: string): CSSProperties => {
    const style = STATUS_TAG_STYLES[status];
    return {
      color: style?.color || token.colorTextTertiary,
      background: style?.bg || 'transparent',
      border: 'none',
      fontWeight: 500,
    };
  };

  const phaseTag = (phase: string): CSSProperties => ({
    color: PHASE_TAG_COLORS[phase] || token.colorTextTertiary,
    borderColor: PHASE_TAG_COLORS[phase] || token.colorTextTertiary,
    background: 'transparent',
  });

  const planNameCell = (): CSSProperties => ({
    fontWeight: 500,
    color: colors.text,
  });

  const chargeNameCell = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: colors.text,
  });

  const chargeNameIcon = (): CSSProperties => ({
    color: colors.textSecondary,
  });

  const completionRateCell = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  });

  const completionRateText = (): CSSProperties => ({
    color: colors.textSecondary,
    fontSize: 12,
  });

  const planTimeCell = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  });

  const planTimeMain = (): CSSProperties => ({
    color: colors.text,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  });

  const planTimeIcon = (): CSSProperties => ({
    marginRight: 4,
    color: colors.textSecondary,
  });

  const planTimeSub = (): CSSProperties => ({
    color: colors.textTertiary,
    fontSize: 12,
  });

  const markCell = (): CSSProperties => ({
    color: colors.textTertiary,
  });

  const actionCell = (): CSSProperties => ({
    display: 'flex',
    gap: 8,
  });

  const editButton = (): CSSProperties => ({
    color: colors.primary,
  });

  return {
    pageContainer,
    mainLayout,
    leftPanel,
    leftPanelHeader,
    leftPanelTitle,
    leftPanelContent,
    rightPanel,
    rightPanelHeader,
    rightPanelContent,
    formModal,
    formSection,
    sectionLabel,
    statusTag,
    phaseTag,
    planNameCell,
    chargeNameCell,
    chargeNameIcon,
    completionRateCell,
    completionRateText,
    planTimeCell,
    planTimeMain,
    planTimeIcon,
    planTimeSub,
    markCell,
    actionCell,
    editButton,
  };
};

export default useCasePlanStyles;
