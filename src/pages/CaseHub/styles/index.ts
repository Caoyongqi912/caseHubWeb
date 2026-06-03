export { useChoiceSettingAreaStyles } from './ChoiceSettingAreaStyles';
export { useRequirementCaseCardStyles } from './RequirementCaseCardStyles';
export { default, useCaseHubTheme } from './useCaseHubTheme';

/**
 * @deprecated 用例等级颜色已迁至后端配置中心（ICaseEnumConfig.color）
 * 请改用 useCaseLevelColorMap() 获取
 * 该常量仅作为 P0-P3 兜底保留，admin 未配置时仍可用
 */
export const caseLevelColors: Record<
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

export const caseStatusColors: Record<
  number,
  { bg: string; border: string; text: string }
> = {
  0: {
    bg: 'rgba(140, 140, 140, 0.1)',
    border: 'rgba(140, 140, 140, 0.3)',
    text: '#8c8c8c',
  },
  1: {
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.3)',
    text: '#52c41a',
  },
  2: {
    bg: 'rgba(255, 77, 79, 0.1)',
    border: 'rgba(255, 77, 79, 0.3)',
    text: '#ff4d4f',
  },
};

export const requirementProcessColors: Record<
  number,
  { bg: string; border: string; text: string }
> = {
  1: {
    bg: 'rgba(255, 77, 79, 0.1)',
    border: 'rgba(255, 77, 79, 0.3)',
    text: '#ff4d4f',
  },
  2: {
    bg: 'rgba(250, 173, 20, 0.1)',
    border: 'rgba(250, 173, 20, 0.3)',
    text: '#faad14',
  },
  3: {
    bg: 'rgba(24, 144, 255, 0.1)',
    border: 'rgba(24, 144, 255, 0.3)',
    text: '#1890ff',
  },
  4: {
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.3)',
    text: '#52c41a',
  },
  5: {
    bg: 'rgba(114, 46, 209, 0.1)',
    border: 'rgba(114, 46, 209, 0.3)',
    text: '#722ed1',
  },
};
