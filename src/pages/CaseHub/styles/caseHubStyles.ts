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
export const caseLevelColors: CaseLevelColors = {
  P0: { bg: '#fff2f0', border: '#ffccc7', text: '#cf1322' },
  P1: { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' },
  P2: { bg: '#e6f7ff', border: '#91d5ff', text: '#096dd9' },
  P3: { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1' },
};

type CaseStatusColors = Record<
  number,
  { bg: string; border: string; text: string }
>;
export const caseStatusColors: CaseStatusColors = {
  0: { bg: '#f4f4f5', border: '#d9d9d9', text: '#595959' },
  1: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
  2: { bg: '#fff2f0', border: '#ffccc7', text: '#cf1322' },
};
type RequirementProcessColors = Record<
  number,
  { bg: string; border: string; text: string }
>;
export const requirementProcessColors: RequirementProcessColors = {
  1: { bg: '#fff0f0', border: '#ffb8b8', text: '#d4380d' },
  2: { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' },
  3: { bg: '#e6f7ff', border: '#91d5ff', text: '#096ddd' },
  4: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
  5: { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1' },
};

export default useCaseHubStyles;
