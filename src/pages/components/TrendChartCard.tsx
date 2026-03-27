import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import { Divider, Space, Tag, theme, Typography } from 'antd';
import { FC, memo, useMemo } from 'react';
import { useHomePageStyles } from '../HomePageStyles';

const { Text } = Typography;
const { useToken } = theme;

interface TrendChartCardProps {
  title: string;
  data: any[];
  type?: 'line' | 'column';
  colors: { primary: string; success: string; error: string };
}

const TrendChartCard: FC<TrendChartCardProps> = memo(
  ({ title, data, type = 'line', colors }) => {
    const styles = useHomePageStyles();
    const { token } = useToken();

    const baseConfig = useMemo(
      () => ({
        data,
        xField: 'date',
        yField: 'num',
        seriesField: 'name',
        xAxis: {
          label: {
            style: {
              fill: styles.colors.textSecondary,
              fontSize: 11,
            },
          },
          grid: {
            line: {
              style: {
                stroke: styles.colors.border,
                lineWidth: 0.5,
              },
            },
          },
        },
        yAxis: {
          label: {
            style: {
              fill: styles.colors.textSecondary,
              fontSize: 11,
            },
          },
          grid: {
            line: {
              style: {
                stroke: styles.colors.border,
                lineWidth: 0.5,
                lineDash: [4, 4],
              },
            },
          },
        },
        legend: {
          position: 'top' as const,
          itemName: {
            style: {
              fill: styles.colors.text,
              fontSize: 12,
            },
          },
        },
        smooth: true,
        color: [colors.primary, colors.success, colors.error],
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1500,
          },
        },
      }),
      [data, colors, styles],
    );

    const lineConfig = useMemo(
      () => ({
        ...baseConfig,
        lineStyle: {
          lineWidth: 3,
        },
        point: {
          size: 5,
          shape: 'circle',
          style: {
            fill: '#fff',
            stroke: colors.primary,
            lineWidth: 2,
          },
        },
        areaStyle: {
          fillOpacity: 0.15,
          fill: `l(270) 0:${colors.primary}30 1:${colors.primary}00`,
        },
      }),
      [baseConfig, colors],
    );

    const columnConfig = useMemo(
      () => ({
        ...baseConfig,
        isStack: true,
        columnStyle: {
          radius: [6, 6, 0, 0],
        },
      }),
      [baseConfig],
    );

    return (
      <div style={styles.card()}>
        <div style={styles.cardHeader()}>
          <div style={styles.cardTitle()}>
            <div style={styles.cardTitleIcon(colors.primary)}>
              {type === 'line' ? (
                <LineChartOutlined
                  style={{ color: colors.primary, fontSize: 18 }}
                />
              ) : (
                <BarChartOutlined
                  style={{ color: colors.primary, fontSize: 18 }}
                />
              )}
            </div>
            <Text strong style={{ fontSize: 16, color: styles.colors.text }}>
              {title}
            </Text>
          </div>
          <Tag
            style={{
              borderRadius: 10,
              fontSize: 11,
              background: `${colors.primary}10`,
              color: colors.primary,
              border: 'none',
            }}
          >
            7天趋势
          </Tag>
        </div>

        <div style={styles.cardBody()}>
          <div style={styles.chartContainer()}>
            {type === 'line' ? (
              <Line {...lineConfig} />
            ) : (
              <Column {...columnConfig} />
            )}
          </div>

          <Divider
            style={{ margin: '20px 0', borderColor: styles.colors.border }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: styles.colors.border,
              borderRadius: 12,
            }}
          >
            <Space size={20}>
              {[
                { color: colors.primary, label: '任务数' },
                { color: colors.success, label: '成功' },
                { color: colors.error, label: '失败' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: item.color,
                      boxShadow: `0 2px 4px ${item.color}40`,
                    }}
                  />
                  <Text
                    style={{ fontSize: 12, color: styles.colors.textSecondary }}
                  >
                    {item.label}
                  </Text>
                </div>
              ))}
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              更新：
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        </div>
      </div>
    );
  },
);

TrendChartCard.displayName = 'TrendChartCard';

export default TrendChartCard;
