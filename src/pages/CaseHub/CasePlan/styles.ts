/**
 * CasePlan · 排版与状态字典
 *
 * 设计取向:Editorial Ledger —— 所有色值经 antd theme token 解析,
 * 跟随 light/realDark 主题自动切换;本文件不持有任何硬编码颜色。
 */

/** 状态印章:颜色键对应 antd theme token */
export const STATUS_SEAL: Record<string, { colorKey: string; label: string }> =
  {
    进行中: { colorKey: 'colorPrimary', label: 'In Progress' },
    已完成: { colorKey: 'colorSuccess', label: 'Completed' },
    已暂停: { colorKey: 'colorWarning', label: 'Paused' },
    已取消: { colorKey: 'colorError', label: 'Canceled' },
  };

/** 执行阶段:颜色键对应 antd 调色板 token */
export const PHASE_DOT: Record<string, string> = {
  规划: 'colorPrimary',
  设计: 'magenta',
  执行: 'cyan',
  验收: 'orange',
};

/** 解析颜色键 → 实际色值;未识别键降级为 colorTextTertiary */
export const resolveColor = (token: any, key: string): string => {
  if (key === 'magenta') return token.colorMagenta || '#eb2f96';
  if (key === 'cyan') return token.colorCyan || '#13c2c2';
  if (key === 'orange') return token.colorOrange || '#fa8c16';
  return token[key] || token.colorTextTertiary;
};

/** 状态下拉选项(用于搜索) */
export const STATUS_OPTIONS = {
  进行中: { text: '进行中' },
  已完成: { text: '已完成' },
  已暂停: { text: '已暂停' },
  已取消: { text: '已取消' },
};

/** 执行阶段下拉选项(用于搜索) */
export const PHASE_OPTIONS = {
  规划: { text: '规划' },
  设计: { text: '设计' },
  执行: { text: '执行' },
  验收: { text: '验收' },
};
export default {
  STATUS_SEAL,
  STATUS_OPTIONS,
  PHASE_DOT,
  PHASE_OPTIONS,
  resolveColor,
};
