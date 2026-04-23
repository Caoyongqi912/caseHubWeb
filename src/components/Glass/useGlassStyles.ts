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
  footer: () => CSSProperties;
  footerText: () => CSSProperties;
  tagMono: () => CSSProperties;
  tagLabel: () => CSSProperties;
  tagSuccess: () => CSSProperties;
  tagWarning: () => CSSProperties;
  tagInfo: () => CSSProperties;
  addButton: () => CSSProperties;
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

  const tagMono = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 6,
    background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
    color: token.colorPrimary,
    border: `1px solid ${token.colorPrimaryBorder}`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
    letterSpacing: '0.5px',
  });

  const tagLabel = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 6,
    backgroundColor: token.colorBgTextActive,
    color: token.colorText,
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
  });

  const tagSuccess = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 12px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 12,
    backgroundColor: token.colorSuccessBg,
    color: token.colorSuccess,
    border: `1px solid ${token.colorSuccessBorder}`,
  });

  const tagWarning = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 12px',
    borderRadius: 16,
    background: `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorWarningBorder} 100%)`,
    color: token.colorWarningText,
    fontWeight: 500,
    fontSize: 12,
    border: `1px solid ${token.colorWarningBorder}`,
  });

  const tagInfo = (): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 12px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 12,
    backgroundColor: token.colorInfoBg,
    color: token.colorInfo,
    border: `1px solid ${token.colorInfoBorder}`,
  });

  const addButton = (): CSSProperties => ({
    height: 36,
    padding: '0 16px',
    borderRadius: 8,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  return {
    colors,
    container,
    animatedBg,
    gridOverlay,
    glowOrb,
    contentWrapper,
    glassCard,
    footer,
    footerText,
    tagMono,
    tagLabel,
    tagSuccess,
    tagWarning,
    tagInfo,
    addButton,
  };
};
