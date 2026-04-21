import { theme } from 'antd';
import { CSSProperties } from 'react';

const { useToken } = theme;

export const useHomePageStyles = () => {
  const { token } = useToken();
  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
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
    padding: '48px 56px',
    maxWidth: 1800,
    margin: '0 auto',
  });

  const headerSection = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 48,
    flexWrap: 'wrap',
    gap: 24,
  });

  const headerLeft = (): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  });

  const logoContainer = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  });

  const logoIcon = (): CSSProperties => ({
    width: 56,
    height: 56,
    borderRadius: 16,
    background: colors.gradientPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 32px ${colors.primaryGlow}`,
    position: 'relative',
    overflow: 'hidden',
  });

  const logoIconInner = (): CSSProperties => ({
    position: 'absolute',
    inset: 2,
    borderRadius: 14,
    background: isDark ? '#0a0a14' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const headerTitle = (): CSSProperties => ({
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  });

  const headerSubtitle = (): CSSProperties => ({
    fontSize: 15,
    color: colors.textSecondary,
    margin: 0,
    letterSpacing: '0.5px',
  });

  const headerRight = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  });

  const statsGrid = (): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    marginBottom: 32,
  });

  const statsCard = (): CSSProperties => ({
    borderRadius: 20,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const statsCardGlow = (color: string): CSSProperties => ({
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
    pointerEvents: 'none',
  });

  const statsCardContent = (): CSSProperties => ({
    position: 'relative',
    zIndex: 1,
    padding: 28,
  });

  const statsCardHeader = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  });

  const statsIconWrapper = (color: string): CSSProperties => ({
    width: 52,
    height: 52,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const statsTrend = (isPositive: boolean): CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    background: isPositive ? `${colors.success}15` : `${colors.error}15`,
    color: isPositive ? colors.success : colors.error,
  });

  const statsValue = (): CSSProperties => ({
    fontSize: 40,
    fontWeight: 800,
    color: colors.text,
    lineHeight: 1,
    marginBottom: 8,
    letterSpacing: '-2px',
  });

  const statsLabel = (): CSSProperties => ({
    fontSize: 14,
    color: colors.textSecondary,
    margin: 0,
  });

  const statsDescription = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textTertiary,
    margin: '8px 0 0 0',
  });

  const chartsGrid = (): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    marginBottom: 32,
  });

  const card = (): CSSProperties => ({
    borderRadius: 20,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  });

  const cardHover = (): CSSProperties => ({
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 60px ${colors.primaryGlow}`,
    borderColor: `${colors.primary}30`,
  });

  const cardHeader = (): CSSProperties => ({
    padding: '24px 28px',
    borderBottom: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'transparent',
  });

  const cardTitle = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  });

  const cardTitleIcon = (color: string): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const cardBody = (): CSSProperties => ({
    padding: 28,
  });

  const chartContainer = (): CSSProperties => ({
    height: 320,
    width: '100%',
  });

  const tableCard = (): CSSProperties => ({
    borderRadius: 20,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    overflow: 'hidden',
  });

  const filterRow = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  });

  const footer = (): CSSProperties => ({
    marginTop: 48,
    padding: '32px 0',
    borderTop: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const footerText = (): CSSProperties => ({
    fontSize: 13,
    color: colors.textTertiary,
  });

  const responsiveStyles = {
    statsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    chartsGrid: {
      gridTemplateColumns: '1fr',
    },
    contentWrapper: {
      padding: '24px 20px',
    },
  };

  return {
    colors,
    container,
    animatedBg,
    gridOverlay,
    glowOrb,
    contentWrapper,
    headerSection,
    headerLeft,
    logoContainer,
    logoIcon,
    logoIconInner,
    headerTitle,
    headerSubtitle,
    headerRight,
    statsGrid,
    statsCard,
    statsCardGlow,
    statsCardContent,
    statsCardHeader,
    statsIconWrapper,
    statsTrend,
    statsValue,
    statsLabel,
    statsDescription,
    chartsGrid,
    card,
    cardHover,
    cardHeader,
    cardTitle,
    cardTitleIcon,
    cardBody,
    chartContainer,
    tableCard,
    filterRow,
    footer,
    footerText,
    responsiveStyles,
  };
};
