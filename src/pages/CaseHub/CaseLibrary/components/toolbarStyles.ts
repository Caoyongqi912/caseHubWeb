import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CSSProperties } from 'react';

/**
 * 用例库工具栏 "soft" 次要按钮样式
 *
 * 背景用主色 8% 透明、边框用主色 30% 透明、文字用主色，
 * 与 primary 实心主按钮形成清晰的视觉层次：
 *   添加用例 (primary 实心) > 上传 / 导出 (soft 浅色) > 默认 outlined
 *
 * 颜色用 hex + alpha 拼接（CSS Color Module Level 4），
 * 主题色为 hex 时直接拼接 08 / 30 等两位 alpha 即可。
 */
export const useSoftButtonStyle = (): CSSProperties => {
  const { colors } = useCaseHubTheme();
  return {
    background: `${colors.primary}08`,
    borderColor: `${colors.primary}30`,
    color: colors.primary,
  };
};
