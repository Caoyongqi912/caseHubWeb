import {
  fetchCurrentTaskData,
  fetchWeekData,
  fetchWeekTaskData,
} from '@/api/base/statistics';
import {
  ApiOutlined,
  AreaChartOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  LineChartOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { ProCard } from '@ant-design/pro-components';
import {
  Badge,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface IStatisticsWeek {
  apis: number;
  api_task: number;
  api_task_growth: number;
  apis_growth: number;
  uis: number;
  uis_growth: number;
  ui_task: number;
  ui_task_growth: number;
}

interface TaskData {
  total_num: number;
  success_num: number;
  fail_num: number;
  date?: string;
}

// 使用 React.memo 优化 MetricCard 组件
const MetricCard = React.memo(
  ({
    title,
    value,
    growth,
    icon,
    color,
    suffix,
    description,
    index,
  }: {
    title: string;
    value: number;
    growth?: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
    description?: string;
    index: number;
  }) => {
    const { token } = useToken();
    const isPositive = growth !== undefined && growth > 0;
    const isNegative = growth !== undefined && growth < 0;

    return (
      <ProCard
        bordered={false}
        style={{
          borderRadius: 20,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${color}08 100%)`,
          border: `1px solid ${color}15`,
          boxShadow: `0 4px 20px ${color}10, 0 1px 3px rgba(0,0,0,0.05)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        hoverable
        bodyStyle={{ padding: '24px' }}
      >
        {/* 装饰性背景元素 */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 24,
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              {icon}
            </div>
            <div>
              <Text
                style={{
                  fontSize: 13,
                  color: token.colorTextSecondary,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Text>
              {description && (
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorTextTertiary,
                    display: 'block',
                  }}
                >
                  {description}
                </Text>
              )}
            </div>
          </Space>

          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: token.colorTextHeading,
                  lineHeight: 1.2,
                  letterSpacing: '-1px',
                }}
              >
                {value.toLocaleString()}
              </Text>
              {suffix && (
                <Text
                  style={{
                    fontSize: 14,
                    color: token.colorTextSecondary,
                    fontWeight: 500,
                  }}
                >
                  {suffix}
                </Text>
              )}
            </div>

            {growth !== undefined && (
              <Space size={6}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: isPositive
                      ? `${token.green6}15`
                      : isNegative
                      ? `${token.red6}15`
                      : `${token.colorTextSecondary}10`,
                  }}
                >
                  {isPositive ? (
                    <ArrowUpOutlined
                      style={{ color: token.green6, fontSize: 12 }}
                    />
                  ) : isNegative ? (
                    <ArrowDownOutlined
                      style={{ color: token.red6, fontSize: 12 }}
                    />
                  ) : (
                    <LineChartOutlined
                      style={{ color: token.colorTextSecondary, fontSize: 12 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      color: isPositive
                        ? token.green6
                        : isNegative
                        ? token.red6
                        : token.colorTextSecondary,
                      fontWeight: 600,
                    }}
                  >
                    {Math.abs(growth)}%
                  </Text>
                </div>
                <Text style={{ color: token.colorTextTertiary, fontSize: 12 }}>
                  较上周
                </Text>
              </Space>
            )}
          </Space>
        </div>
      </ProCard>
    );
  },
);

MetricCard.displayName = 'MetricCard';

// 构建状态卡片优化
const BuildStatusCard = React.memo(
  ({
    title,
    data,
    colors,
  }: {
    title: string;
    data?: TaskData;
    colors: {
      primary: string;
      success: string;
      error: string;
      warning: string;
    };
  }) => {
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

    return (
      <ProCard
        bordered={false}
        style={{
          borderRadius: 20,
          height: '100%',
          background: token.colorBgContainer,
          boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)`,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space
            align="center"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Space align="center">
              <div
                style={{
                  width: 4,
                  height: 20,
                  background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                  borderRadius: 2,
                }}
              />
              <Text
                strong
                style={{ fontSize: 16, color: token.colorTextHeading }}
              >
                {title}今日构建
              </Text>
            </Space>
            {data?.date && (
              <Tag color="default" style={{ fontSize: 12, borderRadius: 10 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {data.date}
              </Tag>
            )}
          </Space>

          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Tooltip title="总构建数">
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.warning}20 0%, ${colors.warning}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `3px solid ${colors.warning}40`,
                        margin: '0 auto 8px',
                        boxShadow: `0 4px 12px ${colors.warning}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: colors.warning,
                        }}
                      >
                        {total}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      总共
                    </Text>
                  </div>
                </Tooltip>
              </Col>

              <Col span={8}>
                <Tooltip title="成功构建数">
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `3px solid ${colors.success}40`,
                        margin: '0 auto 8px',
                        boxShadow: `0 4px 12px ${colors.success}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: colors.success,
                        }}
                      >
                        {success}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      成功
                    </Text>
                  </div>
                </Tooltip>
              </Col>

              <Col span={8}>
                <Tooltip title="失败构建数">
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.error}20 0%, ${colors.error}10 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `3px solid ${colors.error}40`,
                        margin: '0 auto 8px',
                        boxShadow: `0 4px 12px ${colors.error}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: colors.error,
                        }}
                      >
                        {fail}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      失败
                    </Text>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>

          <div>
            <Space
              style={{
                width: '100%',
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
            </Space>
            <Progress
              percent={successRate}
              strokeColor={{
                '0%': colors.success,
                '100%': colors.success,
              }}
              trailColor={colors.error + '30'}
              size={[10, 10]}
              showInfo={false}
            />
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ height: 220 }}>
            <Pie
              data={pieData}
              angleField="value"
              colorField="type"
              radius={0.85}
              innerRadius={0.65}
              color={[colors.success, colors.error]}
              label={{
                type: 'inner',
                offset: '-50%',
                content: '{value}',
                style: {
                  fill: token.colorWhite,
                  fontSize: 14,
                  fontWeight: 'bold',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                },
              }}
              interactions={[{ type: 'element-active' }]}
              statistic={{
                title: {
                  style: {
                    fontSize: '14px',
                    color: token.colorTextSecondary,
                    fontWeight: 400,
                  },
                  content: '总构建',
                },
                content: {
                  style: {
                    fontSize: '28px',
                    color: token.colorTextHeading,
                    fontWeight: 700,
                  },
                  content: `${total}`,
                },
              }}
            />
          </div>
        </Space>
      </ProCard>
    );
  },
);

BuildStatusCard.displayName = 'BuildStatusCard';

// 趋势图表卡片优化
const TrendChartCard = React.memo(
  ({
    title,
    data,
    type = 'line',
    colors,
  }: {
    title: string;
    data: any[];
    type?: 'line' | 'column';
    colors: { primary: string; success: string; error: string };
  }) => {
    const { token } = useToken();

    const chartConfig = useMemo(
      () => ({
        data,
        xField: 'date',
        yField: 'num',
        seriesField: 'name',
        xAxis: {
          label: {
            style: {
              fill: token.colorTextSecondary,
              fontSize: 11,
            },
          },
          grid: {
            line: {
              style: {
                stroke: token.colorBorderSecondary,
                lineWidth: 0.5,
              },
            },
          },
        },
        yAxis: {
          label: {
            style: {
              fill: token.colorTextSecondary,
              fontSize: 11,
            },
          },
          grid: {
            line: {
              style: {
                stroke: token.colorBorderSecondary,
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
              fill: token.colorText,
              fontSize: 12,
            },
          },
        },
        smooth: true,
        color: [colors.primary, colors.success, colors.error],
        lineStyle: {
          lineWidth: 3,
        },
        point: {
          size: 5,
          shape: 'circle',
          style: {
            fill: token.colorWhite,
            stroke: colors.primary,
            lineWidth: 2,
          },
        },
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1500,
          },
        },
        areaStyle:
          type === 'line'
            ? {
                fillOpacity: 0.15,
                fill: `l(270) 0:${colors.primary}30 1:${colors.primary}00`,
              }
            : undefined,
      }),
      [data, colors, token, type],
    );

    const columnConfig = useMemo(
      () => ({
        ...chartConfig,
        isStack: true,
        columnStyle: {
          radius: [6, 6, 0, 0],
        },
      }),
      [chartConfig],
    );

    return (
      <Card
        bordered={false}
        style={{
          background: token.colorBgContainer,
          borderRadius: 20,
          height: '100%',
          boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)`,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: 24, height: '100%' }}
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%', height: '100%' }}
        >
          <Space
            align="center"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Space align="center">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}08 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
              <Text
                strong
                style={{ fontSize: 16, color: token.colorTextHeading }}
              >
                {title}
              </Text>
            </Space>
            <Tag color="processing" style={{ borderRadius: 10, fontSize: 11 }}>
              7天趋势
            </Tag>
          </Space>

          <div style={{ flex: 1, minHeight: 280 }}>
            {type === 'line' ? (
              <Line {...chartConfig} />
            ) : (
              <Column {...columnConfig} />
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: token.colorFillQuaternary,
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
                    style={{ fontSize: 12, color: token.colorTextSecondary }}
                  >
                    {item.label}
                  </Text>
                </div>
              ))}
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              数据更新：今天 09:00
            </Text>
          </div>
        </Space>
      </Card>
    );
  },
);

TrendChartCard.displayName = 'TrendChartCard';

// 主组件
export default function StatisticsDashboard() {
  const { token } = useToken();
  const [weekData, setWeekData] = useState<IStatisticsWeek>({
    apis: 0,
    api_task: 0,
    api_task_growth: 0,
    apis_growth: 0,
    uis: 0,
    uis_growth: 0,
    ui_task: 0,
    ui_task_growth: 0,
  });
  const [apiWeekTaskData, setApiWeekTaskData] = useState<any[]>([]);
  const [uiWeekTaskData, setUiWeekTaskData] = useState<any[]>([]);
  const [currentApiTaskData, setCurrentApiTaskData] = useState<TaskData>();
  const [currentUiTaskData, setCurrentUiTaskData] = useState<TaskData>();
  const [responsive, setResponsive] = useState(false);
  const [loading, setLoading] = useState(true);

  // 使用 useCallback 优化数据获取
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentRes, weekRes, weekTaskRes] = await Promise.all([
        fetchCurrentTaskData(),
        fetchWeekData(),
        fetchWeekTaskData(),
      ]);

      if (currentRes.code === 0) {
        setCurrentApiTaskData(currentRes.data.api_task);
        setCurrentUiTaskData(currentRes.data.ui_task);
      }
      if (weekRes.code === 0) {
        setWeekData(weekRes.data as IStatisticsWeek);
      }
      if (weekTaskRes.code === 0) {
        setApiWeekTaskData(weekTaskRes.data.api_tasks);
        setUiWeekTaskData(weekTaskRes.data.ui_tasks);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 使用 useMemo 优化颜色主题配置
  const themeColors = useMemo(
    () => ({
      api: {
        primary: token.geekblue6,
        success: token.green6,
        error: token.red6,
        warning: token.orange6,
      },
      ui: {
        primary: token.cyan6,
        success: token.green6,
        error: token.red6,
        warning: token.orange6,
      },
      metrics: {
        apiCase: token.blue6,
        apiTask: token.geekblue6,
        uiCase: token.cyan6,
        uiTask: token.green6,
      },
    }),
    [token],
  );

  // 使用 useMemo 优化统计指标配置
  const metrics = useMemo(
    () => [
      {
        key: 'apis',
        title: 'API Case',
        value: weekData.apis,
        growth: weekData.apis_growth,
        color: themeColors.metrics.apiCase,
        icon: <ApiOutlined />,
        description: '接口测试用例',
      },
      {
        key: 'api_task',
        title: 'API Task',
        value: weekData.api_task,
        growth: weekData.api_task_growth,
        color: themeColors.metrics.apiTask,
        icon: <ThunderboltOutlined />,
        description: '接口测试任务',
      },
      {
        key: 'uis',
        title: 'UI Case',
        value: weekData.uis,
        growth: weekData.uis_growth,
        color: themeColors.metrics.uiCase,
        icon: <CodeOutlined />,
        description: 'UI测试用例',
      },
      {
        key: 'ui_task',
        title: 'UI Task',
        value: weekData.ui_task,
        growth: weekData.ui_task_growth,
        color: themeColors.metrics.uiTask,
        icon: <RocketOutlined />,
        description: 'UI测试任务',
      },
    ],
    [weekData, themeColors],
  );

  // 计算统计数据
  const totalSuccess = useMemo(
    () =>
      (currentApiTaskData?.success_num || 0) +
      (currentUiTaskData?.success_num || 0),
    [currentApiTaskData, currentUiTaskData],
  );

  const totalFail = useMemo(
    () =>
      (currentApiTaskData?.fail_num || 0) + (currentUiTaskData?.fail_num || 0),
    [currentApiTaskData, currentUiTaskData],
  );

  const apiSuccessRate = useMemo(
    () =>
      currentApiTaskData?.total_num
        ? (currentApiTaskData.success_num / currentApiTaskData.total_num) * 100
        : 0,
    [currentApiTaskData],
  );

  const uiSuccessRate = useMemo(
    () =>
      currentUiTaskData?.total_num
        ? (currentUiTaskData.success_num / currentUiTaskData.total_num) * 100
        : 0,
    [currentUiTaskData],
  );

  return (
    <div
      style={{
        padding: responsive ? 16 : 32,
        background: `linear-gradient(135deg, ${token.colorBgLayout} 0%, ${token.colorPrimary}05 100%)`,
        minHeight: '100vh',
      }}
    >
      <RcResizeObserver
        onResize={(offset) => {
          setResponsive(offset.width < 992);
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          {/* 头部标题区域 */}
          <div style={{ marginBottom: 32 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space align="center">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${token.colorPrimary}40`,
                  }}
                >
                  <TrophyOutlined style={{ color: 'white', fontSize: 24 }} />
                </div>
                <div>
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      color: token.colorTextHeading,
                      fontSize: 28,
                      fontWeight: 700,
                    }}
                  >
                    测试数据统计中心
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    实时监控测试任务执行情况，洞察质量趋势
                  </Text>
                </div>
              </Space>
            </Space>
          </div>

          {/* 核心指标卡片区域 */}
          <div style={{ marginBottom: 32 }}>
            <Row gutter={[20, 20]}>
              {metrics.map((metric, index) => (
                <Col key={metric.key} xs={24} sm={12} md={6}>
                  <MetricCard {...metric} index={index} />
                </Col>
              ))}
            </Row>
          </div>

          {/* 主要数据展示区域 */}
          <Row gutter={[24, 24]}>
            {/* API构建状态 */}
            <Col xs={24} lg={12}>
              <BuildStatusCard
                title="API"
                data={currentApiTaskData}
                colors={themeColors.api}
              />
            </Col>

            {/* UI构建状态 */}
            <Col xs={24} lg={12}>
              <BuildStatusCard
                title="UI"
                data={currentUiTaskData}
                colors={themeColors.ui}
              />
            </Col>

            {/* API趋势图表 */}
            <Col xs={24} lg={12}>
              <TrendChartCard
                title="API任务趋势"
                data={apiWeekTaskData}
                type="line"
                colors={themeColors.api}
              />
            </Col>

            {/* UI趋势图表 */}
            <Col xs={24} lg={12}>
              <TrendChartCard
                title="UI任务趋势"
                data={uiWeekTaskData}
                type="line"
                colors={themeColors.ui}
              />
            </Col>

            {/* 对比分析区域 */}
            <Col span={24}>
              <Card
                bordered={false}
                style={{
                  background: token.colorBgContainer,
                  borderRadius: 20,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)`,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Space
                    align="center"
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space align="center">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimary}08 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AreaChartOutlined
                          style={{ color: token.colorPrimary, fontSize: 18 }}
                        />
                      </div>
                      <Text strong style={{ fontSize: 16 }}>
                        构建成功率对比
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      本周数据
                    </Text>
                  </Space>

                  <Row gutter={[32, 24]}>
                    <Col xs={24} md={12}>
                      <div style={{ padding: '16px 0' }}>
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
                                background: themeColors.api.primary,
                              }}
                            />
                            <Text strong>API构建成功率</Text>
                          </Space>
                          <Progress
                            percent={apiSuccessRate}
                            strokeColor={{
                              '0%': themeColors.api.success,
                              '100%': themeColors.api.success,
                            }}
                            trailColor={themeColors.api.error + '30'}
                            strokeWidth={14}
                            format={(percent) => (
                              <Text
                                strong
                                style={{
                                  color: themeColors.api.success,
                                  fontSize: 16,
                                }}
                              >
                                {percent?.toFixed(1)}%
                              </Text>
                            )}
                          />
                          <Space
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Space size={4}>
                              <CheckCircleOutlined
                                style={{ color: token.green6, fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {currentApiTaskData?.success_num || 0} 成功
                              </Text>
                            </Space>
                            <Space size={4}>
                              <CloseCircleOutlined
                                style={{ color: token.red6, fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {currentApiTaskData?.fail_num || 0} 失败
                              </Text>
                            </Space>
                          </Space>
                        </Space>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div style={{ padding: '16px 0' }}>
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
                                background: themeColors.ui.primary,
                              }}
                            />
                            <Text strong>UI构建成功率</Text>
                          </Space>
                          <Progress
                            percent={uiSuccessRate}
                            strokeColor={{
                              '0%': themeColors.ui.success,
                              '100%': themeColors.ui.success,
                            }}
                            trailColor={themeColors.ui.error + '30'}
                            strokeWidth={14}
                            format={(percent) => (
                              <Text
                                strong
                                style={{
                                  color: themeColors.ui.success,
                                  fontSize: 16,
                                }}
                              >
                                {percent?.toFixed(1)}%
                              </Text>
                            )}
                          />
                          <Space
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Space size={4}>
                              <CheckCircleOutlined
                                style={{ color: token.green6, fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {currentUiTaskData?.success_num || 0} 成功
                              </Text>
                            </Space>
                            <Space size={4}>
                              <CloseCircleOutlined
                                style={{ color: token.red6, fontSize: 12 }}
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {currentUiTaskData?.fail_num || 0} 失败
                              </Text>
                            </Space>
                          </Space>
                        </Space>
                      </div>
                    </Col>
                  </Row>

                  <Divider style={{ margin: 0 }} />

                  {/* 底部状态栏 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 8,
                    }}
                  >
                    <Space size={32}>
                      <Badge
                        count={totalSuccess}
                        style={{ backgroundColor: token.green6 }}
                        overflowCount={999}
                      >
                        <Space size={6}>
                          <CheckCircleOutlined
                            style={{ color: token.green6 }}
                          />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            总计成功
                          </Text>
                        </Space>
                      </Badge>
                      <Badge
                        count={totalFail}
                        style={{ backgroundColor: token.red6 }}
                        overflowCount={999}
                      >
                        <Space size={6}>
                          <CloseCircleOutlined style={{ color: token.red6 }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            总计失败
                          </Text>
                        </Space>
                      </Badge>
                    </Space>

                    <Tag
                      color="processing"
                      icon={<BugOutlined />}
                      style={{ borderRadius: 10, padding: '4px 12px' }}
                    >
                      {new Date().toLocaleDateString()} 数据
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 页脚说明 */}
          <div
            style={{
              marginTop: 32,
              padding: '20px 24px',
              textAlign: 'center',
              background: token.colorBgContainer,
              borderRadius: 16,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                数据每30分钟自动更新 • 最后更新时间：
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                CaseHub © 2026
              </Text>
            </Space>
          </div>
        </div>
      </RcResizeObserver>
    </div>
  );
}
