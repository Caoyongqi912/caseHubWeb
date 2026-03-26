import { CSSProperties } from 'react';
import { useCaseHubTheme } from './useCaseHubTheme';

export const useCaseHubIndexStyles = () => {
  const { colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  const containerStyle = (): CSSProperties => ({
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.bgLayout} 0%, ${colors.bgContainer} 50%, ${colors.bgContainer} 100%)`,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  });

  const splitterStyle = (): CSSProperties => ({
    borderRadius: borderRadius.xl,
    boxShadow: shadows.card,
    overflow: 'hidden' as const,
  });

  return {
    containerStyle,
    splitterStyle,
  };
};
