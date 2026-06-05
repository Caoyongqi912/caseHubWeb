/**
 * PlanReuirements 模块的样式 tokens
 *
 * 设计方向：Monochrome Editorial 黑白灰杂志感
 * - 完全去除暖棕色调，统一为黑 / 白 / 灰阶
 * - 文字 / 边框 / 卡片底色全部由 antd theme token 派生，自动跟随项目主题切换
 * - 暗色下反转为浅灰 / 白 / 深灰
 * - 强调色统一为「纯黑 / 纯白」的对比，靠 weight + 字距 + 留白制造层次
 *
 * 暗色判断：参考项目里其它模块的做法 — `token.colorBgContainer === '#141414'`。
 */
import { theme } from 'antd';
import { useMemo } from 'react';

const { useToken } = theme;

export const usePlanRequirementStyles = () => {
  const { token } = useToken();

  // 项目其它模块统一的暗色判定（PlanCaseImportModal 同款）
  const isDark = token.colorBgContainer === '#141414';

  // 灰阶 — 两套明暗版本
  const palette = useMemo(() => {
    if (isDark) {
      return {
        // 暗色文字层级（白 → 浅灰 → 深灰）
        ink: {
          900: '#ffffff', // 标题：纯白
          800: '#e8e8e8',
          700: '#c8c8c8',
          600: '#a8a8a8',
          500: '#888888',
          400: '#666666',
          300: '#444444',
          200: '#2a2a2a',
          100: '#1a1a1a',
        },
        // 暗色主色：纯白（暗背景下用白作主色）
        accent: {
          primary: '#ffffff',
          primarySoft: 'rgba(255, 255, 255, 0.08)',
          primaryBorder: 'rgba(255, 255, 255, 0.32)',
          primaryHover: '#e8e8e8',
        },
        // 暗色状态色：去饱和度，纯灰阶表达
        sage: {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.20)',
          text: '#d0d0d0',
        },
        amber: {
          bg: 'rgba(255, 255, 255, 0.10)',
          border: 'rgba(255, 255, 255, 0.24)',
          text: '#e8e8e8',
        },
        rust: {
          bg: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.28)',
          text: '#ffffff',
        },
        sky: {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.20)',
          text: '#d0d0d0',
        },
        plum: {
          bg: 'rgba(255, 255, 255, 0.10)',
          border: 'rgba(255, 255, 255, 0.24)',
          text: '#e8e8e8',
        },
      };
    }
    return {
      // 亮色文字层级（黑 → 浅灰）
      ink: {
        900: '#0a0a0a', // 标题：纯黑
        800: '#1f1f1f',
        700: '#3a3a3a',
        600: '#5a5a5a',
        500: '#7a7a7a',
        400: '#9a9a9a',
        300: '#b8b8b8',
        200: '#d4d4d4',
        100: '#ebebeb',
      },
      // 亮色主色：纯黑
      accent: {
        primary: '#0a0a0a',
        primarySoft: 'rgba(10, 10, 10, 0.04)',
        primaryBorder: 'rgba(10, 10, 10, 0.20)',
        primaryHover: '#1f1f1f',
      },
      // 亮色状态色：纯灰阶表达
      sage: {
        bg: 'rgba(10, 10, 10, 0.04)',
        border: 'rgba(10, 10, 10, 0.12)',
        text: '#3a3a3a',
      },
      amber: {
        bg: 'rgba(10, 10, 10, 0.06)',
        border: 'rgba(10, 10, 10, 0.16)',
        text: '#1f1f1f',
      },
      rust: {
        bg: 'rgba(10, 10, 10, 0.08)',
        border: 'rgba(10, 10, 10, 0.20)',
        text: '#0a0a0a',
      },
      sky: {
        bg: 'rgba(10, 10, 10, 0.04)',
        border: 'rgba(10, 10, 10, 0.12)',
        text: '#3a3a3a',
      },
      plum: {
        bg: 'rgba(10, 10, 10, 0.06)',
        border: 'rgba(10, 10, 10, 0.16)',
        text: '#1f1f1f',
      },
    };
  }, [isDark, token]);

  // 背景：纯灰渐变 + 极淡纸纹
  const surfaces = useMemo(
    () => ({
      canvas: isDark
        ? 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)'
        : 'linear-gradient(180deg, #fafafa 0%, #f3f3f3 100%)',
      paperNoise: isDark
        ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`
        : `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      // 卡片背景用 token，自动随主题切换
      card: token.colorBgContainer,
      // 卡片边框用 token 派生
      cardBorder: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(10, 10, 10, 0.08)',
      cardHoverBorder: isDark
        ? 'rgba(255, 255, 255, 0.24)'
        : 'rgba(10, 10, 10, 0.24)',
    }),
    [isDark, token],
  );

  // 阴影：去掉所有暖色，改为中性灰
  const shadows = useMemo(
    () =>
      isDark
        ? {
            card: '0 1px 2px rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.32)',
            cardHover:
              '0 4px 8px rgba(0, 0, 0, 0.48), 0 12px 32px rgba(0, 0, 0, 0.56)',
            header: '0 1px 0 rgba(255, 255, 255, 0.06)',
          }
        : {
            card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
            cardHover:
              '0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12)',
            header: '0 1px 0 rgba(0, 0, 0, 0.06)',
          },
    [isDark],
  );

  const spacing = useMemo(
    () => ({
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    }),
    [],
  );

  const radius = useMemo(
    () => ({
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      pill: 999,
    }),
    [],
  );

  // 字体：保持编辑感衬线 + 干净无衬线
  const fonts = useMemo(
    () => ({
      display: `'Fraunces', 'Source Han Serif SC', 'Songti SC', Georgia, serif`,
      body: `'DM Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`,
      mono: `'JetBrains Mono', 'SF Mono', Consolas, monospace`,
    }),
    [],
  );

  const motion = useMemo(
    () => ({
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '380ms cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    }),
    [],
  );

  return { palette, surfaces, shadows, spacing, radius, fonts, motion, isDark };
};

export type PlanRequirementStyles = ReturnType<typeof usePlanRequirementStyles>;
