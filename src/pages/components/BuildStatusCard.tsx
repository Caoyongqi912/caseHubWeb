import { ClockCircleOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Divider, Progress, Tag, theme, Typography } from 'antd';
import { FC, memo, useMemo } from 'react';
import { useHomePageStyles } from '../HomePageStyles';

const { Text } = Typography;
const { useToken } = theme;

interface TaskData {
  total_num: number;
  success_num: number;
  fail_num: number;
  date?: string;
}

interface BuildStatusCardProps {
  title: string;
  data?: TaskData;
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
}

const BuildStatusCard: FC<BuildStatusCardProps> = memo(
  ({ title, data, colors }) => {
    const styles = useHomePageStyles();
    const { token } = useToken();

    const total = data?.total_num || 0;
    const success = data?.success_num || 0;
    const fail = data?.fail_num || 0;
    const successRate = useMemo(
      () => (total > 0 ? (success / total) * 100 : 0),
      [total, success],
    );

    const pieData = useMemo(
      () => [
        { type: '成功', value: success },
        { type: '失败', value: fail },
      ],
      [success, fail],
    );

    const pieConfig = useMemo(
      () => ({
        data: pieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.85,
        innerRadius: 0.65,
        color: [colors.success, colors.error],
        label: {
          type: 'inner',
          offset: '-50%',
          content: '{value}',
          style: {
            fill: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          },
        },
        interactions: [{ type: 'element-active' }],
        statistic: {
          title: {
            style: {
              fontSize: '14px',
              color: styles.colors.textSecondary,
              fontWeight: 400,
            },
            content: '总构建',
          },
          content: {
            style: {
              fontSize: '28px',
              color: styles.colors.text,
              fontWeight: 700,
            },
            content: `${total}`,
          },
        },
      }),
      [pieData, colors, styles, total],
    );

    return (
      <div style={styles.card()}>
        <div style={styles.cardHeader()}>
          <div style={styles.cardTitle()}>
            <div style={styles.cardTitleIcon(colors.primary)}>
              <div
                style={{
                  width: 4,
                  height: 18,
                  background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                  borderRadius: 2,
                }}
              />
            </div>
            <Text strong style={{ fontSize: 16, color: styles.colors.text }}>
              {title} 今日构建
            </Text>
          </div>
          {data?.date && (
            <Tag
              style={{
                fontSize: 12,
                borderRadius: 10,
                background: styles.colors.border,
                border: 'none',
                color: styles.colors.textSecondary,
              }}
            >
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {data.date}
            </Tag>
          )}
        </div>

        <div style={styles.cardBody()}>
          <div style={styles.statsRow()}>
            <div>
              <div style={styles.statCircle(colors.warning)}>
                <Text style={{ ...styles.statValue(), color: colors.warning }}>
                  {total}
                </Text>
              </div>
              <Text style={styles.statLabel()}>总共</Text>
            </div>
            <div>
              <div style={styles.statCircle(colors.success)}>
                <Text style={{ ...styles.statValue(), color: colors.success }}>
                  {success}
                </Text>
              </div>
              <Text style={styles.statLabel()}>成功</Text>
            </div>
            <div>
              <div style={styles.statCircle(colors.error)}>
                <Text style={{ ...styles.statValue(), color: colors.error }}>
                  {fail}
                </Text>
              </div>
              <Text style={styles.statLabel()}>失败</Text>
            </div>
          </div>

          <div style={{ padding: '16px 0' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                成功率
              </Text>
              <Text strong style={{ fontSize: 16, color: colors.success }}>
                {successRate.toFixed(1)}%
              </Text>
            </div>
            <Progress
              percent={successRate}
              strokeColor={colors.success}
              trailColor={`${colors.error}30`}
              strokeWidth={8}
              showInfo={false}
              style={{ borderRadius: 4 }}
            />
          </div>

          <Divider
            style={{ margin: '20px 0', borderColor: styles.colors.border }}
          />

          <div style={{ height: 200 }}>
            <Pie {...pieConfig} />
          </div>
        </div>
      </div>
    );
  },
);

BuildStatusCard.displayName = 'BuildStatusCard';

export default BuildStatusCard;
