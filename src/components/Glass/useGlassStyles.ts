import { theme } from 'antd';
import { CSSProperties } from 'react';

const { useToken } = theme;

export interface GlassColors {
  primary: string;
  primaryLight: string;
  primaryGlow: string;
  success: string;
  successGlow: string;
  error: string;
  errorGlow: string;
  warning: string;
  warningGlow: string;
  info: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  bgContainer: string;
  bgLayout: string;
  bgElevated: string;
  glass: string;
  glassBorder: string;
  gradientPrimary: string;
  gradientSuccess: string;
  gradientBg: string;
}

export const useGlassStyles = (): {
  colors: GlassColors;
  container: () => CSSProperties;
  animatedBg: () => CSSProperties;
  gridOverlay: () => CSSProperties;
  glowOrb: (
    color: string,
    size: number,
    top: string,
    left: string,
    animationDuration: string,
  ) => CSSProperties;
  contentWrapper: () => CSSProperties;
  glassCard: () => CSSProperties;
  glassCardHover: () => CSSProperties;
  pageHeader: () => CSSProperties;
  pageTitle: () => CSSProperties;
  pageSubtitle: () => CSSProperties;
  pageActions: () => CSSProperties;
  footer: () => CSSProperties;
  footerText: () => CSSProperties;
} => {
  const { token } = useToken();
  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors: GlassColors = {
    primary: token.colorPrimary,
    primaryLight: `${token.colorPrimary}cc`,
    primaryGlow: `${token.colorPrimary}40`,
    success: token.colorSuccess,
    successGlow: `${token.colorSuccess}40`,
    error: token.colorError,
    errorGlow: `${token.colorError}40`,
    warning: token.colorWarning,
    warningGlow: `${token.colorWarning}40`,
    info: token.colorInfo,
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    textTertiary: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    border: token.colorBorder,
    borderLight: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    bgContainer: token.colorBgContainer,
    bgLayout: token.colorBgLayout,
    bgElevated: token.colorBgElevated,
    glass: isDark ? 'rgba(20, 20, 30, 0.75)' : 'rgba(255, 255, 255, 0.8)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    gradientPrimary: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorInfo} 100%)`,
    gradientSuccess: `linear-gradient(135deg, ${token.colorSuccess} 0%, #52c41a 100%)`,
    gradientBg: isDark
      ? 'linear-gradient(180deg, #0a0a14 0%, #0f0f1a 50%, #0a0a14 100%)'
      : `linear-gradient(180deg, ${token.colorBgLayout} 0%, #f0f5ff 50%, ${token.colorBgLayout} 100%)`,
  };

  const container = (): CSSProperties => ({
    minHeight: '100vh',
    background: colors.gradientBg,
    position: 'relative',
    overflow: 'hidden',
  });

  const animatedBg = (): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  });

  const gridOverlay = (): CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  });

  const glowOrb = (
    color: string,
    size: number,
    top: string,
    left: string,
    animationDuration: string,
  ): CSSProperties => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    top,
    left,
    filter: 'blur(60px)',
    opacity: 0.5,
    animation: `float ${animationDuration} ease-in-out infinite`,
  });

  const contentWrapper = (): CSSProperties => ({
    position: 'relative',
    zIndex: 1,
    padding: '32px 40px',
    maxWidth: 1800,
    margin: '0 auto',
  });

  const glassCard = (): CSSProperties => ({
    borderRadius: '16px',
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    boxShadow: `0 8px 32px ${colors.primaryGlow}20`,
    overflow: 'hidden',
  });

  const glassCardHover = (): CSSProperties => ({
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${colors.primaryGlow}`,
    borderColor: `${colors.primary}30`,
  });

  const pageHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  });

  const pageTitle = (): CSSProperties => ({
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  });

  const pageSubtitle = (): CSSProperties => ({
    fontSize: 14,
    color: colors.textSecondary,
    margin: '8px 0 0 0',
    letterSpacing: '0.5px',
  });

  const pageActions = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  });

  const footer = (): CSSProperties => ({
    marginTop: 32,
    padding: '24px 0',
    borderTop: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const footerText = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textTertiary,
  });

  return {
    colors,
    container,
    animatedBg,
    gridOverlay,
    glowOrb,
    contentWrapper,
    glassCard,
    glassCardHover,
    pageHeader,
    pageTitle,
    pageSubtitle,
    pageActions,
    footer,
    footerText,
  };
};
