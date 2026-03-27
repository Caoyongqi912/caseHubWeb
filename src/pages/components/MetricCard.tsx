import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { theme, Typography } from 'antd';
import React, { FC, memo, useState } from 'react';
import { useHomePageStyles } from '../HomePageStyles';

const { Text } = Typography;
const { useToken } = theme;

interface MetricCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const MetricCard: FC<MetricCardProps> = memo(
  ({ title, value, growth, icon, color, description }) => {
    const styles = useHomePageStyles();
    const { token } = useToken();
    const [isHovered, setIsHovered] = useState(false);

    const isPositive = growth !== undefined && growth > 0;
    const isNegative = growth !== undefined && growth < 0;
    const growthColor = isPositive
      ? token.green6
      : isNegative
      ? token.red6
      : token.colorTextSecondary;

    return (
      <div
        style={{
          ...styles.metricCard(),
          transform: isHovered
            ? 'translateY(-8px) scale(1.02)'
            : 'translateY(0) scale(1)',
          boxShadow: isHovered
            ? `0 20px 60px ${color}30, 0 0 0 1px ${color}30`
            : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            ...styles.metricCardGlow(color),
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          }}
        />

        <div style={styles.metricIconWrapper(color)}>{icon}</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Text style={styles.metricLabel()}>{title}</Text>
          {description && (
            <Text
              style={{
                fontSize: 11,
                color: styles.colors.textSecondary,
                display: 'block',
                marginTop: 2,
              }}
            >
              {description}
            </Text>
          )}

          <div style={{ marginTop: 12 }}>
            <Text style={styles.metricValue()}>{value.toLocaleString()}</Text>
          </div>

          {growth !== undefined && (
            <div style={styles.metricGrowth(isPositive)}>
              {isPositive ? (
                <ArrowUpOutlined style={{ fontSize: 12 }} />
              ) : isNegative ? (
                <ArrowDownOutlined style={{ fontSize: 12 }} />
              ) : (
                <MinusOutlined style={{ fontSize: 12 }} />
              )}
              <span>{Math.abs(growth)}%</span>
              <span
                style={{ color: styles.colors.textSecondary, fontWeight: 400 }}
              >
                较上周
              </span>
            </div>
          )}
        </div>

        <style>{`
          @keyframes metricFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    );
  },
);

MetricCard.displayName = 'MetricCard';

export default MetricCard;
