/**
 * @file pages/CaseHub/hooks/useCaseLevelColor.ts
 * @description 用例等级颜色样式 hook
 *
 * 颜色派生逻辑：
 * 从后端 ICaseEnumConfig.color 字段派生 bg / border / text 三件套样式
 *
 * 支持的颜色格式：
 * - antd 语义色：success / processing / error / warning / magenta / red /
 *   volcano / orange / gold / lime / green / cyan / blue / geekblue / purple
 *   → 通过 antd token 派生 bg/border/text
 * - hex 色值：#1677ff
 *   → bg 用 ${hex}1a，border 用 ${hex}66，text 用 hex
 */

import { theme } from 'antd';
import { useMemo } from 'react';
import { useCaseEnumConfig } from './useCaseEnumConfig';

export interface LevelColorStyle {
  bg: string;
  border: string;
  text: string;
}

/** 默认色（admin 未配置或颜色解析失败时使用） */
const FALLBACK_STYLE: LevelColorStyle = {
  bg: 'rgba(140, 140, 140, 0.1)',
  border: 'rgba(140, 140, 140, 0.3)',
  text: '#8c8c8c',
};

/**
 * antd 语义色 / Tag preset → token 字段名映射
 * 命中后用 token[colorKey] 提取主色，再用透明度后缀生成 bg / border
 */
const ANTD_PRESET_TO_TOKEN: Record<string, string> = {
  success: 'colorSuccess',
  processing: 'colorInfo',
  error: 'colorError',
  warning: 'colorWarning',
  magenta: 'colorError', // 无独立 magenta token，降级为 error
  red: 'colorError',
  volcano: 'colorError',
  orange: 'colorWarning',
  gold: 'colorWarning',
  lime: 'colorSuccess',
  green: 'colorSuccess',
  cyan: 'colorInfo',
  blue: 'colorInfo',
  geekblue: 'colorPrimary',
  purple: 'colorPrimary',
};

const isHex = (s: string) => /^#[0-9a-fA-F]{3,8}$/.test(s);
const isAntdPreset = (s: string) => s in ANTD_PRESET_TO_TOKEN;

/**
 * 从 ICaseEnumConfig.color 字符串派生 LevelColorStyle
 */
const deriveStyleFromColor = (
  color: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  token: Record<string, any>,
): LevelColorStyle => {
  if (!color || color === 'default') return FALLBACK_STYLE;

  // antd 语义色 → 通过 token 查实际色值
  if (isAntdPreset(color)) {
    const tk = token[ANTD_PRESET_TO_TOKEN[color]] || FALLBACK_STYLE.text;
    return {
      bg: `${tk}1a`,
      border: `${tk}66`,
      text: tk,
    };
  }

  // hex 色值 → 直接拼接透明度后缀
  if (isHex(color)) {
    return {
      bg: `${color}1a`,
      border: `${color}66`,
      text: color,
    };
  }

  return FALLBACK_STYLE;
};

/**
 * 用例等级颜色 map hook
 *
 * 返回 Map<levelValue, LevelColorStyle>
 * 适用于在 render 函数中按 record.case_level 做 O(1) 查找
 *
 * @example
 *   const levelColorMap = useCaseLevelColorMap();
 *   const colors = levelColorMap.get(record.case_level) || FALLBACK_STYLE;
 */
export const useCaseLevelColorMap = (): Map<string, LevelColorStyle> => {
  const { token } = theme.useToken();
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');

  return useMemo(() => {
    const map = new Map<string, LevelColorStyle>();

    for (const opt of levelOptions) {
      map.set(opt.value, deriveStyleFromColor(opt.color, token));
    }

    return map;
  }, [levelOptions, token]);
};
