import { theme } from 'antd';

const { useToken } = theme;

export const useCaseHubTheme = () => {
  const { token } = useToken();

  const colors = {
    primary: token.colorPrimary,
    primaryBg: token.colorPrimaryBg,
    primaryHover: token.colorPrimaryHover,
    success: token.colorSuccess,
    successBg: token.colorSuccessBg,
    warning: token.colorWarning,
    warningBg: token.colorWarningBg,
    error: token.colorError,
    errorBg: token.colorErrorBg,
    info: token.colorInfo,
    infoBg: token.colorInfoBg,
    bgContainer: token.colorBgContainer,
    bgElevated: token.colorBgElevated,
    bgLayout: token.colorBgLayout,
    bgSpotlight: token.colorBgSpotlight,
    border: token.colorBorder,
    borderSecondary: token.colorBorderSecondary,
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    textTertiary: token.colorTextTertiary,
    textQuaternary: token.colorTextQuaternary,
  };

  const typography = {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontSizeHeading1: token.fontSizeHeading1,
    fontSizeHeading2: token.fontSizeHeading2,
    fontSizeHeading3: token.fontSizeHeading3,
    fontSizeHeading4: token.fontSizeHeading4,
    fontSizeHeading5: token.fontSizeHeading5,
    fontSizeSM: token.fontSizeSM,
    fontSizeLG: token.fontSizeLG,
    lineHeight: token.lineHeight,
    lineHeightHeading1: token.lineHeightHeading1,
    lineHeightHeading2: token.lineHeightHeading2,
    lineHeightHeading3: token.lineHeightHeading3,
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };

  const borderRadius = {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
    round: 9999,
  };

  const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    card: `0 2px 8px ${token.colorBgContainer}20`,
    cardHover: `0 8px 16px ${token.colorBgContainer}30`,
    drawer: `0 4px 12px rgba(0, 0, 0, 0.12)`,
  };

  const animations = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return {
    token,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
  };
};

export default useCaseHubTheme;
