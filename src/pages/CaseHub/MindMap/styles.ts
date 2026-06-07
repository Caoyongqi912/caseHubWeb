/**
 * MindMap · 设计 token
 *
 * 设计方向:Atlas Manuscript —— 把"脑图"做成一本可翻阅的图谱册。
 * - 完全由 antd theme token 派生，跟随 light / realDark 自动切换
 * - 与 CasePlan 的 "Editorial Ledger" 同源：黑白灰阶 + 发丝线 + 印刷感字号
 * - "无根"：根节点视觉上不可见，结构仍由 mind-elixir 维护
 * - 节点=索引卡：根分组用 № 编号，子节点用 · 引导符
 */
import { theme } from 'antd';
import { useMemo } from 'react';

const { useToken } = theme;

/**
 * 脑图视觉 token —— 把 antd 通用 token 翻译成 mind-elixir 用的 cssVar
 * 同时把 "暗色判定" 收敛到这一处
 */
export const useMindMapStyles = () => {
  const { token } = useToken();

  // 复用项目里其它模块的暗色判定（PlanReuirements / PlanCaseImportModal 同款）
  const isDark = token.colorBgContainer === '#141414';

  /** 灰阶（ink 体系）：亮色=黑阶，暗色=白阶 */
  const ink = useMemo(() => {
    if (isDark) {
      return {
        900: '#ffffff',
        800: '#f0f0f0',
        700: '#d8d8d8',
        600: '#b8b8b8',
        500: '#909090',
        400: '#6a6a6a',
        300: '#4a4a4a',
        200: '#2e2e2e',
        100: '#1f1f1f',
        50: '#181818',
      };
    }
    return {
      900: '#0a0a0a',
      800: '#1f1f1f',
      700: '#3a3a3a',
      600: '#5a5a5a',
      500: '#7a7a7a',
      400: '#9a9a9a',
      300: '#b8b8b8',
      200: '#d4d4d4',
      100: '#ebebeb',
      50: '#f5f5f0',
    };
  }, [isDark]);

  /** 纸面（atlas backdrop）：亮色=米黄纸，暗色=深灰纸 */
  const paper = useMemo(
    () => ({
      // 节点卡底色
      card: isDark ? ink[100] : '#ffffff',
      // 画布底色（米黄/深灰）
      canvas: isDark ? ink[50] : '#fbfaf6',
      // 网格发丝色
      grid: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(10, 10, 10, 0.05)',
      // hover / 选中态轻底
      hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 10, 10, 0.04)',
      selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.06)',
      // 主色（亮色用纯黑，暗色用纯白）
      primary: isDark ? ink[900] : ink[900],
      primarySoft: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,10,0.04)',
    }),
    [isDark, ink],
  );

  /** 字号体系：顶层 / 子层 / 编号 / 标注 */
  const fontSize = useMemo(
    () => ({
      root: 0, // 根节点不可见
      t1: 15, // 一级（顶级）节点
      t2: 13, // 二级
      t3: 12, // 三级及以下
      meta: 10, // № 编号、tag
      micro: 9, // 编辑提示
    }),
    [],
  );

  /** spacing —— 4 / 8 / 12 / 16 / 20 / 24 / 32 */
  const spacing = useMemo(
    () => ({
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    }),
    [],
  );

  /** 阴影 */
  const shadows = useMemo(
    () => ({
      card: isDark
        ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.5)'
        : '0 1px 0 rgba(10,10,10,0.02) inset, 0 1px 2px rgba(10,10,10,0.04)',
      cardHover: isDark
        ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 4px 8px rgba(0,0,0,0.5)'
        : '0 1px 0 rgba(10,10,10,0.04) inset, 0 6px 14px rgba(10,10,10,0.08)',
      selected: isDark
        ? '0 0 0 1px rgba(255,255,255,0.4) inset'
        : '0 0 0 1px rgba(10,10,10,0.85) inset',
    }),
    [isDark],
  );

  /** mind-elixir 用的 cssVar 派生对象 —— 注入后所有节点走这套 token */
  const mindCssVar = useMemo(
    () => ({
      // 画布
      '--bgcolor': paper.canvas,
      '--color': ink[800],
      // 主分支：发丝线
      '--main-color': ink[800],
      '--main-bgcolor': paper.card,
      '--main-bgcolor-transparent': isDark
        ? 'rgba(31, 31, 31, 0.92)'
        : 'rgba(255, 255, 255, 0.92)',
      '--main-border': `1px solid ${ink[200]}`,
      '--main-radius': '4px',
      // 根节点（中心主题）= 黑底白字 or 白底黑字，跟随主题
      // 这两个是之前 bug 的元凶：设成 transparent 导致根看不见
      '--root-color': isDark ? ink[50] : '#ffffff',
      '--root-bgcolor': isDark ? ink[800] : ink[900],
      '--root-border-color': 'transparent',
      '--root-radius': '4px',
      // 面板（context menu / tips）
      '--panel-color': ink[800],
      '--panel-bgcolor': paper.card,
      '--panel-border-color': ink[200],
      // 选中态
      '--selected': isDark ? '#ffffff' : '#0a0a0a',
      '--accent-color': isDark ? '#ffffff' : '#0a0a0a',
      // 间距（紧凑一些）
      '--map-padding': '40px',
      '--node-gap-x': '20px',
      '--node-gap-y': '4px',
      '--main-gap-x': '32px',
      '--main-gap-y': '8px',
      '--topic-padding': '4px 10px',
    }),
    [paper, ink, isDark],
  );

  /** 注入到容器 / 全局的额外样式：隐藏根、画布加网格、节点卡样式 */
  const containerCss = useMemo(
    () => `
    /* —— 根节点（中心主题）= 略大于子节点,但仍走 ink[900] 底色（已被 cssVar 设好）
       这里只补字号和字距，不要覆盖 background/color，那两个让 mind-elixir 的 cssVar 说了算 */
    .map-container me-root > me-tpc {
      font-size: ${
        fontSize.t1 + 2
      }px !important;        /* 17px，比子节点略大 */
      font-weight: 500 !important;
      letter-spacing: 0.005em !important;
      padding: 10px 20px !important;
      max-width: none !important;
      cursor: pointer !important;
    }
    /* —— 画布：米黄纸 + 极淡的网格（atlas graph paper） */
    .map-container {
      background-image:
        linear-gradient(${paper.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${paper.grid} 1px, transparent 1px) !important;
      background-size: 24px 24px !important;
      background-position: -1px -1px !important;
    }
    /* —— 普通节点：发丝边 + 字号编辑感 */
    .map-container me-parent me-tpc {
      font-size: ${fontSize.t2}px !important;
      border-radius: 4px !important;
      border: 1px solid ${ink[200]} !important;
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      padding: 4px 12px !important;
      line-height: 1.4 !important;
      letter-spacing: 0.01em !important;
      transition: background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease !important;
      box-shadow: ${shadows.card} !important;
    }
    .map-container me-parent me-tpc:hover {
      background: ${paper.hover} !important;
      border-color: ${ink[400]} !important;
      transform: translateY(-1px) !important;
      box-shadow: ${shadows.cardHover} !important;
    }
    /* —— 一级（顶级）节点：略大、№ 风格（用 me-parent 的 data-depth 标识会有兼容问题，
       这里改用 main-gap-x 的视觉间距 + 子节点缩进对齐来表达层级） */
    .map-container me-main > me-wrapper > me-parent > me-tpc {
      font-size: ${fontSize.t1}px !important;
      font-weight: 500 !important;
      padding: 6px 14px !important;
      letter-spacing: 0.005em !important;
    }
    /* —— 选中态：虚线 outline（手稿勾选感） */
    .map-container .selected {
      outline: 1px dashed ${isDark ? '#ffffff' : '#0a0a0a'} !important;
      outline-offset: 2px !important;
    }
    /* —— 编辑输入框：与节点同款 */
    .map-container #input-box {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border: 1px solid ${ink[400]} !important;
      border-radius: 4px !important;
      box-shadow: ${shadows.cardHover} !important;
      padding: 4px 10px !important;
    }
    /* —— tag chips */
    .map-container .tags span {
      background: ${paper.primarySoft} !important;
      color: ${ink[700]} !important;
      border: 1px solid ${ink[200]} !important;
      border-radius: 2px !important;
      font-size: 10px !important;
      letter-spacing: 0.04em !important;
    }
    /* —— tips 浮层 */
    .map-container .tips {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border: 1px solid ${ink[200]} !important;
      border-radius: 4px !important;
      box-shadow: ${shadows.cardHover} !important;
      font-weight: 500 !important;
      letter-spacing: 0.04em !important;
      text-transform: uppercase;
      font-size: 10px !important;
    }
    /* —— 工具条：右上角浮层，跟随 antd 主题 */
    .mind-elixir-toolbar {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border: 1px solid ${ink[200]} !important;
      border-radius: 6px !important;
      box-shadow: ${shadows.card} !important;
      padding: 8px !important;
    }
    /* —— 右键菜单 */
    .map-container .context-menu .menu-list {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border: 1px solid ${ink[200]} !important;
      box-shadow: ${shadows.cardHover} !important;
      border-radius: 4px !important;
      overflow: hidden !important;
    }
    .map-container .context-menu .menu-list li {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border-bottom: 1px solid ${ink[200]} !important;
    }
    .map-container .context-menu .menu-list li:hover {
      background: ${paper.hover} !important;
      filter: none !important;
    }
    .map-container .context-menu .key {
      background: ${paper.primarySoft} !important;
      color: ${ink[700]} !important;
      border: 1px solid ${ink[200]} !important;
    }
    /* —— svg-label（连接线标签） */
    .map-container .svg-label {
      background: ${paper.card} !important;
      color: ${ink[800]} !important;
      border: 1px solid ${ink[200]} !important;
      border-radius: 3px !important;
      font-size: 11px !important;
      padding: 2px 6px !important;
    }
    /* —— 拖拽幽灵 */
    .map-container .mind-elixir-ghost {
      background: ${paper.card} !important;
      border: 1px dashed ${ink[600]} !important;
      color: ${ink[800]} !important;
      border-radius: 4px !important;
    }
    /* —— 选区 */
    .map-container .selection-area {
      background: ${
        isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.06)'
      } !important;
      border: 1px dashed ${ink[600]} !important;
    }
    `,
    [paper, ink, fontSize, shadows, isDark, token.fontFamilyCode],
  );

  return {
    isDark,
    ink,
    paper,
    fontSize,
    spacing,
    shadows,
    mindCssVar,
    containerCss,
  };
};

export default useMindMapStyles;
