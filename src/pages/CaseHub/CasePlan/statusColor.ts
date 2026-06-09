/**
 * statusColor · 计划状态颜色解析
 *
 * 配置中心保存的 color 字段可能是：
 *   1. antd 预设名（success / processing / error / warning / default /
 *      magenta / red / volcano / orange / gold / lime / green / cyan / blue /
 *      geekblue / purple）→ 映射到 antd theme token
 *   2. token key（如 colorPrimary / colorTextTertiary）→ 直接取 token
 *   3. 任意 hex / rgb → 原样返回
 *
 * 未识别 / 未传值 → 降级为 colorTextTertiary，保证 StatusSeal 一定有颜色
 */

const PRESET_TO_TOKEN: Record<string, string> = {
  success: 'colorSuccess',
  error: 'colorError',
  warning: 'colorWarning',
  processing: 'colorPrimary',
  default: 'colorTextTertiary',
  magenta: 'colorMagenta',
  red: 'colorRed',
  volcano: 'colorVolcano',
  orange: 'colorOrange',
  gold: 'colorGold',
  lime: 'colorLime',
  green: 'colorGreen',
  cyan: 'colorCyan',
  blue: 'colorBlue',
  geekblue: 'colorGeekblue',
  purple: 'colorPurple',
};

/** 解析配置保存的 color 字段为 antd theme token 可用的实际色值 */
export const resolveStatusColor = (token: any, colorKey?: string): string => {
  if (!colorKey) return token.colorTextTertiary;
  // hex / rgb / hsl / 命名色 —— 原样
  if (
    colorKey.startsWith('#') ||
    colorKey.startsWith('rgb') ||
    colorKey.startsWith('hsl')
  ) {
    return colorKey;
  }
  // antd token key —— 直接取
  if (colorKey.startsWith('color') && token[colorKey]) {
    return token[colorKey];
  }
  // antd 预设名 —— 映射
  const tokenKey = PRESET_TO_TOKEN[colorKey];
  if (tokenKey && token[tokenKey]) return token[tokenKey];
  // 兜底：尝试作为 token key 取
  if (token[colorKey]) return token[colorKey];
  return token.colorTextTertiary;
};
