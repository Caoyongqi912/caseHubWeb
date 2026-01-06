import {
  fetchCurrentTaskData,
  fetchWeekData,
  fetchWeekTaskData,
} from '@/api/base/statistics';
import {
  ApiOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DashboardOutlined,
  FallOutlined,
  LineChartOutlined,
  RiseOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { ProCard } from '@ant-design/pro-components';
import {
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
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

// 数据卡片组件
const MetricCard = ({
  title,
  value,
  growth,
  icon,
  color,
  suffix,
  description,
}: any) => {
  const { token } = useToken();

  return (
    <ProCard
      bordered
      style={{
        borderRadius: 16,
        border: `1px solid ${color}20`,
        height: '100%',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
      hoverable
    >
      {/* 装饰性背景元素 */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `${color}10`,
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Space align="center" style={{ marginBottom: token.marginSM }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: token.borderRadius,
              background: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
            }}
          >
            {icon}
          </div>
          <Text style={{ fontSize: 14, color: token.colorTextSecondary }}>
            {title}
          </Text>
        </Space>

        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: token.marginXS,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: token.colorTextHeading,
                lineHeight: 1,
              }}
            >
              {value}
            </Text>
            {suffix && (
              <Text style={{ fontSize: 14, color: token.colorTextSecondary }}>
                {suffix}
              </Text>
            )}
          </div>

          {growth !== undefined && (
            <Space size={4}>
              {growth > 0 ? (
                <RiseOutlined style={{ color: token.green6, fontSize: 12 }} />
              ) : (
                <FallOutlined style={{ color: token.red6, fontSize: 12 }} />
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: growth > 0 ? token.green6 : token.red6,
                  fontWeight: 500,
                }}
              >
                {Math.abs(growth)}%
                <Text
                  style={{ color: token.colorTextSecondary, marginLeft: 4 }}
                >
                  较上周
                </Text>
              </Text>
            </Space>
          )}

          {description && (
            <Text
              type="secondary"
              style={{ fontSize: 12, marginTop: token.marginXS }}
            >
              {description}
            </Text>
          )}
        </Space>
      </div>
    </ProCard>
  );
};

// 构建状态卡片
const BuildStatusCard = ({ title, data, type = 'API', colors }: any) => {
  const { token } = useToken();
  const total = data?.total_num || 0;
  const success = data?.success_num || 0;
  const fail = data?.fail_num || 0;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  return (
    <ProCard
      bordered={false}
      style={{
        borderRadius: 16,
        height: '100%',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space align="center">
          <div
            style={{
              width: 6,
              height: 20,
              background: colors.primary,
              borderRadius: token.borderRadiusSM,
            }}
          />
          <Text strong style={{ fontSize: 16, color: token.colorTextHeading }}>
            {title}今日构建
          </Text>
          {data?.date && (
            <Tag color="default" style={{ marginLeft: 'auto' }}>
              {data.date}
            </Tag>
          )}
        </Space>

        <div style={{ padding: `${token.paddingSM}px 0` }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%' }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `${colors.warning}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${colors.warning}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: colors.warning,
                    }}
                  >
                    {total}
                  </Text>
                </div>
                <Text type="secondary">总共</Text>
              </Space>
            </Col>

            <Col span={8}>
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%' }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `${colors.success}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${colors.success}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: colors.success,
                    }}
                  >
                    {success}
                  </Text>
                </div>
                <Text type="secondary">成功</Text>
              </Space>
            </Col>

            <Col span={8}>
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%' }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `${colors.error}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${colors.error}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: colors.error,
                    }}
                  >
                    {fail}
                  </Text>
                </div>
                <Text type="secondary">失败</Text>
              </Space>
            </Col>
          </Row>
        </div>

        <div>
          <Space
            style={{
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: token.marginXS,
            }}
          >
            <Text type="secondary">成功率</Text>
            <Text strong>{successRate.toFixed(1)}%</Text>
          </Space>
          <Progress
            percent={successRate}
            strokeColor={colors.success}
            trailColor={colors.error}
            size="small"
            showInfo={false}
          />
        </div>

        <Divider style={{ margin: `${token.marginXS}px 0` }} />

        <div style={{ height: 200 }}>
          <Pie
            data={[
              { type: '成功', value: success },
              { type: '失败', value: fail },
            ]}
            angleField="value"
            colorField="type"
            radius={0.8}
            innerRadius={0.6}
            color={[colors.success, colors.error]}
            label={{
              type: 'inner',
              offset: '-50%',
              content: '{value}',
              style: {
                fill: token.colorWhite,
                fontSize: 14,
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              },
            }}
            interactions={[{ type: 'element-active' }]}
            statistic={{
              title: false,
              content: {
                style: {
                  fontSize: '16px',
                  color: token.colorText,
                  fontWeight: 500,
                },
                content: `${total}`,
              },
            }}
          />
        </div>
      </Space>
    </ProCard>
  );
};

// 趋势图表卡片
const TrendChartCard = ({
  title,
  data,
  type = 'line',
  colors,
  height = 300,
}: any) => {
  const { token } = useToken();

  const lineConfig = {
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
        formatter: (v: string) => `${v}`,
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
      position: 'top',
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
      size: 4,
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
        duration: 2000,
      },
    },
    areaStyle:
      type === 'line'
        ? {
            fillOpacity: 0.1,
            fill: `l(270) 0:${colors.primary}20 1:${colors.primary}00`,
          }
        : undefined,
  };

  const columnConfig = {
    ...lineConfig,
    isStack: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  return (
    <Card
      bordered={false}
      style={{
        background: token.colorBgContainer,
        borderRadius: 16,
        height: '100%',
      }}
      bodyStyle={{ padding: token.paddingLG, height: '100%' }}
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ width: '100%', height: '100%' }}
      >
        <Space align="center">
          {type === 'line' ? <LineChartOutlined /> : <BarChartOutlined />}
          <Text strong style={{ fontSize: 16, color: token.colorTextHeading }}>
            {title}
          </Text>
          <Tag color="processing" style={{ marginLeft: 'auto' }}>
            7天趋势
          </Tag>
        </Space>

        <div style={{ flex: 1 }}>
          {type === 'line' ? (
            // @ts-ignore
            <Line {...lineConfig} />
          ) : (
            // @ts-ignore
            <Column {...columnConfig} />
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${token.paddingXS}px ${token.padding}px`,
            background: token.colorFillTertiary,
            borderRadius: token.borderRadiusSM,
          }}
        >
          <Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.primary,
                }}
              />
              <Text style={{ fontSize: 12 }}>任务数</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.success,
                }}
              />
              <Text style={{ fontSize: 12 }}>成功</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.error,
                }}
              />
              <Text style={{ fontSize: 12 }}>失败</Text>
            </div>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            数据更新：今天 09:00
          </Text>
        </div>
      </Space>
    </Card>
  );
};

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
  const [currentApiTaskData, setCurrentApiTaskData] = useState<any>();
  const [currentUiTaskData, setCurrentUiTaskData] = useState<any>();
  const [responsive, setResponsive] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchCurrentTaskData(),
      fetchWeekData(),
      fetchWeekTaskData(),
    ]).then(([currentRes, weekRes, weekTaskRes]) => {
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
    });
  }, []);

  // 颜色主题配置
  const themeColors = {
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
  };

  // 统计指标配置
  const metrics = [
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
  ];

  // 构建数据配置
  const buildStats = [
    {
      type: 'API',
      title: 'API',
      data: currentApiTaskData,
      weekData: apiWeekTaskData,
      colors: themeColors.api,
      icon: <ApiOutlined />,
    },
    {
      type: 'UI',
      title: 'UI',
      data: currentUiTaskData,
      weekData: uiWeekTaskData,
      colors: themeColors.ui,
      icon: <DashboardOutlined />,
    },
  ];

  return (
    <div
      style={{
        padding: token.paddingLG,
        // background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        minHeight: '100vh',
      }}
    >
      <RcResizeObserver
        onResize={(offset) => {
          setResponsive(offset.width < 992);
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* 头部标题区域 */}
          <Space
            direction="vertical"
            size="middle"
            style={{ width: '100%', marginBottom: token.marginLG }}
          >
            <Space align="center">
              <div
                style={{
                  width: 4,
                  height: 24,
                  background: token.colorPrimary,
                  borderRadius: token.borderRadiusSM,
                  marginRight: token.marginSM,
                }}
              />
              <Title
                level={3}
                style={{ margin: 0, color: token.colorTextHeading }}
              >
                测试数据统计中心
              </Title>
            </Space>
            <Text type="secondary" style={{ fontSize: 14 }}>
              实时监控测试任务执行情况，洞察质量趋势
            </Text>
          </Space>

          {/* 核心指标卡片区域 */}
          <div style={{ marginBottom: token.marginLG }}>
            <Row gutter={[16, 16]}>
              {metrics.map((metric) => (
                <Col key={metric.key} xs={24} sm={12} md={6}>
                  <MetricCard {...metric} />
                </Col>
              ))}
            </Row>
          </div>

          {/* 主要数据展示区域 */}
          <Row gutter={[20, 20]}>
            {/* API构建状态 */}
            <Col xs={24} lg={12}>
              <BuildStatusCard
                title="API构建 · "
                data={currentApiTaskData}
                colors={themeColors.api}
              />
            </Col>

            {/* UI构建状态 */}
            <Col xs={24} lg={12}>
              <BuildStatusCard
                title="UI构建 · "
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
                  borderRadius: 16,
                }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Space align="center">
                    <AreaChartOutlined
                      style={{ color: token.colorPrimary, fontSize: 18 }}
                    />
                    <Text strong style={{ fontSize: 16 }}>
                      构建成功率对比
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 'auto' }}
                    >
                      本周数据
                    </Text>
                  </Space>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <div style={{ padding: token.padding }}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Text strong>API构建成功率</Text>
                          <Progress
                            percent={
                              currentApiTaskData?.total_num
                                ? (currentApiTaskData.success_num /
                                    currentApiTaskData.total_num) *
                                  100
                                : 0
                            }
                            strokeColor={themeColors.api.success}
                            trailColor={themeColors.api.error}
                            strokeWidth={12}
                            format={(percent) => `${percent?.toFixed(1)}%`}
                          />
                          <Space
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {currentApiTaskData?.success_num || 0} 成功
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {currentApiTaskData?.fail_num || 0} 失败
                            </Text>
                          </Space>
                        </Space>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div style={{ padding: token.padding }}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Text strong>UI构建成功率</Text>
                          <Progress
                            percent={
                              currentUiTaskData?.total_num
                                ? (currentUiTaskData.success_num /
                                    currentUiTaskData.total_num) *
                                  100
                                : 0
                            }
                            strokeColor={themeColors.ui.success}
                            trailColor={themeColors.ui.error}
                            strokeWidth={12}
                            format={(percent) => `${percent?.toFixed(1)}%`}
                          />
                          <Space
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {currentUiTaskData?.success_num || 0} 成功
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {currentUiTaskData?.fail_num || 0} 失败
                            </Text>
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
                      paddingTop: token.paddingSM,
                    }}
                  >
                    <Space size="large">
                      <Space size={4}>
                        <CheckCircleOutlined style={{ color: token.green6 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          总计成功：
                          {(currentApiTaskData?.success_num || 0) +
                            (currentUiTaskData?.success_num || 0)}
                        </Text>
                      </Space>
                      <Space size={4}>
                        <CloseCircleOutlined style={{ color: token.red6 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          总计失败：
                          {(currentApiTaskData?.fail_num || 0) +
                            (currentUiTaskData?.fail_num || 0)}
                        </Text>
                      </Space>
                    </Space>

                    <Tag color="processing" icon={<BugOutlined />}>
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
              marginTop: token.marginLG,
              padding: token.padding,
              textAlign: 'center',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              数据每30分钟自动更新 • 最后更新时间：
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        </div>
      </RcResizeObserver>
    </div>
  );
}
