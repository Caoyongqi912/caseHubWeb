import {
  AreaChartOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Badge, Divider, Progress, Space, theme, Typography } from 'antd';
import { FC, memo, useMemo } from 'react';
import { useHomePageStyles } from '../HomePageStyles';

const { Text } = Typography;
const { useToken } = theme;

interface TaskData {
  total_num: number;
  success_num: number;
  fail_num: number;
}

interface ComparisonCardProps {
  apiData?: TaskData;
  uiData?: TaskData;
  colors: {
    api: { primary: string; success: string; error: string };
    ui: { primary: string; success: string; error: string };
  };
}

const ComparisonCard: FC<ComparisonCardProps> = memo(
  ({ apiData, uiData, colors }) => {
    const styles = useHomePageStyles();
    const { token } = useToken();

    const apiSuccessRate = useMemo(
      () =>
        apiData?.total_num
          ? (apiData.success_num / apiData.total_num) * 100
          : 0,
      [apiData],
    );

    const uiSuccessRate = useMemo(
      () =>
        uiData?.total_num ? (uiData.success_num / uiData.total_num) * 100 : 0,
      [uiData],
    );

    const totalSuccess = useMemo(
      () => (apiData?.success_num || 0) + (uiData?.success_num || 0),
      [apiData, uiData],
    );

    const totalFail = useMemo(
      () => (apiData?.fail_num || 0) + (uiData?.fail_num || 0),
      [apiData, uiData],
    );

    return (
      <div style={styles.card()}>
        <div style={styles.cardHeader()}>
          <div style={styles.cardTitle()}>
            <div style={styles.cardTitleIcon(styles.colors.primary)}>
              <AreaChartOutlined
                style={{ color: styles.colors.primary, fontSize: 18 }}
              />
            </div>
            <Text strong style={{ fontSize: 16, color: styles.colors.text }}>
              构建成功率对比
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            本周数据
          </Text>
        </div>

        <div style={styles.cardBody()}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 32,
            }}
          >
            <div>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center">
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: colors.api.primary,
                    }}
                  />
                  <Text strong>API构建成功率</Text>
                </Space>
                <Progress
                  percent={apiSuccessRate}
                  strokeColor={colors.api.success}
                  trailColor={`${colors.api.error}30`}
                  strokeWidth={14}
                  format={(percent) => (
                    <Text
                      strong
                      style={{ color: colors.api.success, fontSize: 16 }}
                    >
                      {percent?.toFixed(1)}%
                    </Text>
                  )}
                />
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Space size={4}>
                    <CheckCircleOutlined
                      style={{ color: styles.colors.success }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {apiData?.success_num || 0} 成功
                    </Text>
                  </Space>
                  <Space size={4}>
                    <CloseCircleOutlined
                      style={{ color: styles.colors.error }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {apiData?.fail_num || 0} 失败
                    </Text>
                  </Space>
                </Space>
              </Space>
            </div>

            <div>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center">
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: colors.ui.primary,
                    }}
                  />
                  <Text strong>UI构建成功率</Text>
                </Space>
                <Progress
                  percent={uiSuccessRate}
                  strokeColor={colors.ui.success}
                  trailColor={`${colors.ui.error}30`}
                  strokeWidth={14}
                  format={(percent) => (
                    <Text
                      strong
                      style={{ color: colors.ui.success, fontSize: 16 }}
                    >
                      {percent?.toFixed(1)}%
                    </Text>
                  )}
                />
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Space size={4}>
                    <CheckCircleOutlined
                      style={{ color: styles.colors.success }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {uiData?.success_num || 0} 成功
                    </Text>
                  </Space>
                  <Space size={4}>
                    <CloseCircleOutlined
                      style={{ color: styles.colors.error }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {uiData?.fail_num || 0} 失败
                    </Text>
                  </Space>
                </Space>
              </Space>
            </div>
          </div>

          <Divider
            style={{ margin: '24px 0', borderColor: styles.colors.border }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space size={32}>
              <Badge
                count={totalSuccess}
                style={{ backgroundColor: styles.colors.success }}
                overflowCount={999}
              >
                <Space size={6}>
                  <CheckCircleOutlined
                    style={{ color: styles.colors.success }}
                  />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    总计成功
                  </Text>
                </Space>
              </Badge>
              <Badge
                count={totalFail}
                style={{ backgroundColor: styles.colors.error }}
                overflowCount={999}
              >
                <Space size={6}>
                  <CloseCircleOutlined style={{ color: styles.colors.error }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    总计失败
                  </Text>
                </Space>
              </Badge>
            </Space>

            <div
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                background: `${styles.colors.primary}10`,
                color: styles.colors.primary,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <BugOutlined />
              {new Date().toLocaleDateString()} 数据
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ComparisonCard.displayName = 'ComparisonCard';

export default ComparisonCard;
