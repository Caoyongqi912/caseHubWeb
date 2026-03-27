import { theme } from 'antd';
import { CSSProperties } from 'react';

const { useToken } = theme;

export const useHomePageStyles = () => {
  const { token } = useToken();
  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    primary: token.colorPrimary,
    primaryGlow: `${token.colorPrimary}60`,
    secondary: token.colorInfo,
    accent: '#00f5d4',
    accentAlt: '#7b2cbf',
    success: token.colorSuccess,
    error: token.colorError,
    warning: token.colorWarning,
    surface: isDark ? 'rgba(20, 20, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    surfaceHover: isDark
      ? 'rgba(30, 30, 45, 0.9)'
      : 'rgba(255, 255, 255, 0.95)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    gradient1: `linear-gradient(135deg, ${token.colorPrimary} 0%, #7b2cbf 50%, #00f5d4 100%)`,
    gradient2: `linear-gradient(135deg, #00f5d4 0%, ${token.colorPrimary} 100%)`,
    gradient3: `linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorPrimary} 100%)`,
  };

  const container = (): CSSProperties => ({
    minHeight: '100vh',
    background: isDark
      ? 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)'
      : `linear-gradient(180deg, ${token.colorBgLayout} 0%, #f0f5ff 50%, ${token.colorBgLayout} 100%)`,
    position: 'relative',
    overflow: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  });

  const animatedBackground = (): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 100% 100% at 20% -30%, ${colors.primary}15 0%, transparent 50%),
      radial-gradient(ellipse 80% 80% at 80% 120%, ${colors.accent}10 0%, transparent 50%),
      radial-gradient(ellipse 60% 60% at 50% 50%, ${colors.accentAlt}08 0%, transparent 60%)
    `,
    pointerEvents: 'none',
  });

  const gridOverlay = (): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
    backgroundSize: '80px 80px',
    pointerEvents: 'none',
  });

  const contentWrapper = (): CSSProperties => ({
    position: 'relative',
    zIndex: 1,
    padding: '32px 40px',
    maxWidth: 1680,
    margin: '0 auto',
  });

  const header = (): CSSProperties => ({
    marginBottom: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const headerLeft = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  });

  const logoContainer = (): CSSProperties => ({
    position: 'relative',
    width: 64,
    height: 64,
  });

  const logoOuter = (): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 64,
    borderRadius: 20,
    background: colors.gradient1,
    padding: 2,
    animation: 'logoRotate 8s linear infinite',
  });

  const logoInner = (): CSSProperties => ({
    width: '100%',
    height: '100%',
    borderRadius: 18,
    background: isDark ? '#0a0a0f' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const logoGlow = (): CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
    animation: 'pulse 3s ease-in-out infinite',
    pointerEvents: 'none',
  });

  const headerTitle = (): CSSProperties => ({
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
    background: colors.gradient1,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
  });

  const headerSubtitle = (): CSSProperties => ({
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: 500,
  });

  const metricsGrid = (): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    marginBottom: 40,
  });

  const metricCard = (): CSSProperties => ({
    position: 'relative',
    background: colors.surface,
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 28,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  });

  const metricCardGlow = (color: string): CSSProperties => ({
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
    pointerEvents: 'none',
    transition: 'all 0.4s ease',
  });

  const metricIconWrapper = (color: string): CSSProperties => ({
    width: 56,
    height: 56,
    borderRadius: 16,
    background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 32px ${color}40`,
    marginBottom: 20,
  });

  const metricValue = (): CSSProperties => ({
    fontSize: 42,
    fontWeight: 800,
    color: colors.text,
    lineHeight: 1,
    letterSpacing: '-2px',
  });

  const metricLabel = (): CSSProperties => ({
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 600,
    marginTop: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  });

  const metricGrowth = (isPositive: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    padding: '6px 14px',
    borderRadius: 12,
    background: isPositive ? `${colors.success}15` : `${colors.error}15`,
    fontSize: 13,
    fontWeight: 600,
    color: isPositive ? colors.success : colors.error,
  });

  const mainGrid = (): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    marginBottom: 24,
  });

  const card = (): CSSProperties => ({
    background: colors.surface,
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  });

  const cardHeader = (): CSSProperties => ({
    padding: '24px 28px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const cardTitle = (): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  });

  const cardTitleIcon = (color: string): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const cardBody = (): CSSProperties => ({
    padding: 28,
  });

  const statsRow = (): CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: '24px 0',
    gap: 16,
  });

  const statCircle = (color: string): CSSProperties => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
    border: `3px solid ${color}40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    boxShadow: `0 8px 24px ${color}20`,
    transition: 'all 0.3s ease',
  });

  const statValue = (): CSSProperties => ({
    fontSize: 26,
    fontWeight: 700,
  });

  const statLabel = (): CSSProperties => ({
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: 500,
  });

  const chartContainer = (): CSSProperties => ({
    height: 300,
    marginTop: 20,
  });

  const footer = (): CSSProperties => ({
    marginTop: 40,
    padding: '24px 32px',
    background: colors.surface,
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
  });

  const footerText = (): CSSProperties => ({
    fontSize: 13,
    color: colors.textSecondary,
  });

  const responsiveStyles = {
    metricsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    mainGrid: {
      gridTemplateColumns: '1fr',
    },
    contentWrapper: {
      padding: '20px 16px',
    },
  };

  return {
    colors,
    container,
    animatedBackground,
    gridOverlay,
    contentWrapper,
    header,
    headerLeft,
    logoContainer,
    logoOuter,
    logoInner,
    logoGlow,
    headerTitle,
    headerSubtitle,
    metricsGrid,
    metricCard,
    metricCardGlow,
    metricIconWrapper,
    metricValue,
    metricLabel,
    metricGrowth,
    mainGrid,
    card,
    cardHeader,
    cardTitle,
    cardTitleIcon,
    cardBody,
    statsRow,
    statCircle,
    statValue,
    statLabel,
    chartContainer,
    footer,
    footerText,
    responsiveStyles,
  };
};
