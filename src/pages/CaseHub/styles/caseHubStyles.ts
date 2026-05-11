import { theme } from 'antd';

const { useToken } = theme;

export interface CaseHubStyles {
  container: React.CSSProperties;
  card: React.CSSProperties;
  cardHoverable: React.CSSProperties;
  header: React.CSSProperties;
  body: React.CSSProperties;
  footer: React.CSSProperties;
  divider: React.CSSProperties;
  badge: React.CSSProperties;
  tag: React.CSSProperties;
  button: React.CSSProperties;
  link: React.CSSProperties;
  empty: React.CSSProperties;
  toolbar: React.CSSProperties;
  listItem: React.CSSProperties;
  searchForm: React.CSSProperties;
  statCard: React.CSSProperties;
}

export const useCaseHubStyles = (): CaseHubStyles => {
  const { token } = useToken();

  return {
    container: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 100%)`,
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    card: {
      borderRadius: 12,
      border: `1px solid ${token.colorBorder}`,
      boxShadow: `0 2px 8px ${token.colorBgContainer}20`,
      transition: `all 200ms ${token.motionEaseInOut}`,
    },
    cardHoverable: {
      borderRadius: 12,
      border: `1px solid ${token.colorBorder}`,
      boxShadow: `0 2px 8px ${token.colorBgContainer}20`,
      transition: `all 200ms ${token.motionEaseInOut}`,
      cursor: 'pointer',
      //@ts-ignore
      ':hover': {
        boxShadow: `0 8px 24px ${token.colorBgContainer}40`,
        transform: 'translateY(-2px)',
      },
    },
    header: {
      padding: `${token.paddingLG}px ${token.paddingLG}px ${token.paddingMD}px`,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, transparent 100%)`,
    },
    body: {
      padding: token.paddingLG,
    },
    footer: {
      padding: `${token.paddingMD}px ${token.paddingLG}px`,
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      background: token.colorBgContainer,
    },
    divider: {
      margin: `${token.marginMD}px 0`,
      borderColor: token.colorBorderSecondary,
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: token.fontSizeSM,
      fontWeight: 500,
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 6,
      fontSize: token.fontSizeSM,
      fontWeight: 500,
      transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: token.paddingSM,
      fontWeight: 500,
      borderRadius: token.borderRadiusLG,
      transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
    },
    link: {
      color: token.colorPrimary,
      cursor: 'pointer',
      transition: `color ${token.motionDurationFast} ${token.motionEaseInOut}`,
      //@ts-ignore
      ':hover': {
        color: token.colorPrimaryHover,
      },
    },
    empty: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',

      padding: token.paddingXL,
      color: token.colorTextSecondary,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: token.paddingSM,
      padding: `${token.paddingMD}px ${token.paddingLG}px`,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${token.paddingMD}px ${token.paddingLG}px`,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      transition: `background ${token.motionDurationFast} ${token.motionEaseInOut}`,
      //@ts-ignore
      ':hover': {
        background: token.colorBgContainer,
      },
    },
    searchForm: {
      display: 'flex',
      alignItems: 'center',
      gap: token.paddingMD,
      padding: token.paddingLG,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg}10 0%, transparent 100%)`,
      borderRadius: token.borderRadiusLG,
    },
    statCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: token.paddingLG,
      borderRadius: token.borderRadiusLG,
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorder}`,
      transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
    },
  };
};

type CaseLevelColors = Record<
  string,
  { bg: string; border: string; text: string }
>;

/**
 * 用例等级颜色配置
 * 使用 rgba 格式，确保在暗黑模式下也能正常显示
 */
export const caseLevelColors: CaseLevelColors = {
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

type CaseStatusColors = Record<
  number,
  { bg: string; border: string; text: string }
>;

/**
 * 用例状态颜色配置
 * 使用 rgba 格式，确保在暗黑模式下也能正常显示
 */
export const caseStatusColors: CaseStatusColors = {
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

type RequirementProcessColors = Record<
  number,
  { bg: string; border: string; text: string }
>;

/**
 * 需求进度颜色配置
 * 使用 rgba 格式，确保在暗黑模式下也能正常显示
 */
export const requirementProcessColors: RequirementProcessColors = {
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

export default useCaseHubStyles;
