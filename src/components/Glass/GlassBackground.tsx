import React, { CSSProperties } from 'react';
import { useGlassStyles } from './useGlassStyles';

interface GlassBackgroundProps {
  children: React.ReactNode;
  showGlowOrbs?: boolean;
  glowOrbConfigs?: Array<{
    color: string;
    size: number;
    top: string;
    left: string;
    animationDuration: string;
  }>;
  contentStyle?: CSSProperties;
  extraAnimations?: string;
}

const GlassBackground: React.FC<GlassBackgroundProps> = ({
  children,
  showGlowOrbs = true,
  glowOrbConfigs = [
    {
      color: '#1890ff',
      size: 600,
      top: '-10%',
      left: '-10%',
      animationDuration: '8s',
    },
    {
      color: '#52c41a',
      size: 500,
      top: '60%',
      left: '70%',
      animationDuration: '10s',
    },
    {
      color: '#13c2c2',
      size: 400,
      top: '30%',
      left: '80%',
      animationDuration: '12s',
    },
  ],
  contentStyle,
  extraAnimations,
}) => {
  const styles = useGlassStyles();

  return (
    <div style={styles.container()}>
      <div style={styles.animatedBg()}>
        <div style={styles.gridOverlay()} />
        {showGlowOrbs &&
          glowOrbConfigs.map((config, index) => (
            <div
              key={index}
              style={styles.glowOrb(
                config.color,
                config.size,
                config.top,
                config.left,
                config.animationDuration,
              )}
            />
          ))}
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ${extraAnimations || ''}
      `}</style>
      <div>{children}</div>
    </div>
  );
};

export default GlassBackground;
