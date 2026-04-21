import {
  fetchCurrentTaskData,
  fetchWeekData,
  fetchWeekTaskData,
} from '@/api/base/statistics';
import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  CodeOutlined,
  CrownOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import {
  Card,
  DatePicker,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHomePageStyles } from './HomePageStyles';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

type DateType = 'today' | 'week' | 'month' | 'custom';

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

interface TrendDataItem {
  date: string;
  num: number;
  name: string;
}

interface TableRecord {
  id: string;
  name: string;
  type: 'API' | 'UI';
  total: number;
  success: number;
  fail: number;
  successRate: number;
  duration: string;
  createTime: string;
}

const StatisticsDashboard: React.FC = () => {
  const styles = useHomePageStyles();
  const [loading, setLoading] = useState(true);
  const [dateType, setDateType] = useState<DateType>('week');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
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
  const [apiWeekTaskData, setApiWeekTaskData] = useState<TrendDataItem[]>([]);
  const [uiWeekTaskData, setUiWeekTaskData] = useState<TrendDataItem[]>([]);
  const [currentApiTaskData, setCurrentApiTaskData] = useState<TaskData>();
  const [currentUiTaskData, setCurrentUiTaskData] = useState<TaskData>();
  const [tableType, setTableType] = useState<'all' | 'api' | 'ui'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
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

  const handleDateTypeChange = (type: DateType) => {
    setDateType(type);
    if (type !== 'custom') {
      setDateRange(null);
    }
    fetchData();
  };

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
    if (dates) {
      setDateType('custom');
    }
    fetchData();
  };

  const totalExecutions = useMemo(() => {
    const api = currentApiTaskData?.total_num || 0;
    const ui = currentUiTaskData?.total_num || 0;
    return api + ui;
  }, [currentApiTaskData, currentUiTaskData]);

  const totalSuccess = useMemo(() => {
    const api = currentApiTaskData?.success_num || 0;
    const ui = currentUiTaskData?.success_num || 0;
    return api + ui;
  }, [currentApiTaskData, currentUiTaskData]);

  const totalFail = useMemo(() => {
    const api = currentApiTaskData?.fail_num || 0;
    const ui = currentUiTaskData?.fail_num || 0;
    return api + ui;
  }, [currentApiTaskData, currentUiTaskData]);

  const overallSuccessRate = useMemo(() => {
    if (totalExecutions === 0) return 0;
    return (totalSuccess / totalExecutions) * 100;
  }, [totalExecutions, totalSuccess]);

  const avgDuration = useMemo(() => {
    return '2.5s';
  }, []);

  const tableData: TableRecord[] = useMemo(() => {
    const records: TableRecord[] = [];
    if (currentApiTaskData) {
      records.push({
        id: 'api-1',
        name: 'API 测试任务',
        type: 'API',
        total: currentApiTaskData.total_num,
        success: currentApiTaskData.success_num,
        fail: currentApiTaskData.fail_num,
        successRate:
          currentApiTaskData.total_num > 0
            ? (currentApiTaskData.success_num / currentApiTaskData.total_num) *
              100
            : 0,
        duration: '1.8s',
        createTime: new Date().toLocaleDateString(),
      });
    }
    if (currentUiTaskData) {
      records.push({
        id: 'ui-1',
        name: 'UI 测试任务',
        type: 'UI',
        total: currentUiTaskData.total_num,
        success: currentUiTaskData.success_num,
        fail: currentUiTaskData.fail_num,
        successRate:
          currentUiTaskData.total_num > 0
            ? (currentUiTaskData.success_num / currentUiTaskData.total_num) *
              100
            : 0,
        duration: '12.3s',
        createTime: new Date().toLocaleDateString(),
      });
    }
    return records;
  }, [currentApiTaskData, currentUiTaskData]);

  const filteredTableData = useMemo(() => {
    if (tableType === 'all') return tableData;
    return tableData.filter((item) => item.type === tableType.toUpperCase());
  }, [tableData, tableType]);

  const lineConfig = useMemo(
    () => ({
      data: [...apiWeekTaskData, ...uiWeekTaskData],
      xField: 'date',
      yField: 'num',
      seriesField: 'name',
      smooth: true,
      animation: {
        appear: {
          animation: 'wave-in',
          duration: 1500,
        },
      },
      legend: {
        position: 'top' as const,
      },
      xAxis: {
        label: {
          style: {
            fill: styles.colors.textSecondary,
          },
        },
        line: {
          style: {
            stroke: styles.colors.border,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fill: styles.colors.textSecondary,
          },
        },
        grid: {
          line: {
            style: {
              stroke: styles.colors.borderLight,
              lineDash: [4, 4],
            },
          },
        },
      },
      color: [styles.colors.primary, '#13c2c2'],
      line: {
        style: {
          lineWidth: 3,
        },
      },
      point: {
        size: 5,
        shape: 'circle',
        style: {
          fill: '#fff',
          stroke: styles.colors.primary,
          lineWidth: 2,
        },
      },
      area: {
        style: {
          fillOpacity: 0.15,
          fill: `l(270) 0:${styles.colors.primary}40 1:${styles.colors.primary}00`,
        },
      },
    }),
    [apiWeekTaskData, uiWeekTaskData, styles],
  );

  const columnConfig = useMemo(
    () => ({
      data: weekData
        ? [
            { type: 'API Case', value: weekData.apis },
            { type: 'API Task', value: weekData.api_task },
            { type: 'UI Case', value: weekData.uis },
            { type: 'UI Task', value: weekData.ui_task },
          ]
        : [],
      xField: 'type',
      yField: 'value',
      color: styles.colors.primary,
      animation: {
        appear: {
          animation: 'wave-in',
          duration: 1500,
        },
      },
      columnStyle: {
        radius: [8, 8, 0, 0],
      },
      columnBackground: {
        style: {
          fill: `${styles.colors.primary}15`,
          radius: [8, 8, 0, 0],
        },
      },
      xAxis: {
        label: {
          style: {
            fill: styles.colors.textSecondary,
            fontSize: 12,
          },
        },
        line: {
          style: {
            stroke: styles.colors.border,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fill: styles.colors.textSecondary,
          },
        },
        grid: {
          line: {
            style: {
              stroke: styles.colors.borderLight,
              lineDash: [4, 4],
            },
          },
        },
      },
    }),
    [weekData, styles],
  );

  const pieData = useMemo(
    () => [
      { type: '成功', value: totalSuccess },
      { type: '失败', value: totalFail },
    ],
    [totalSuccess, totalFail],
  );

  const pieConfig = useMemo(
    () => ({
      data: pieData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.9,
      innerRadius: 0.65,
      color: [styles.colors.success, styles.colors.error],
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          fill: '#fff',
          fontSize: 14,
          fontWeight: 'bold',
          shadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
      statistic: {
        title: {
          style: {
            fontSize: '14px',
            color: styles.colors.textSecondary,
          },
          content: '总构建',
        },
        content: {
          style: {
            fontSize: '28px',
            color: styles.colors.text,
            fontWeight: 700,
          },
          content: `${totalExecutions}`,
        },
      },
      legend: {
        position: 'top' as const,
      },
      interactions: [{ type: 'element-active' }],
      animation: {
        appear: {
          animation: 'fade-in',
          duration: 1200,
        },
      },
    }),
    [pieData, styles, totalExecutions],
  );

  const tableColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TableRecord) => (
        <Space>
          {record.type === 'API' ? (
            <ApiOutlined style={{ color: styles.colors.primary }} />
          ) : (
            <CodeOutlined style={{ color: '#13c2c2' }} />
          )}
          {text}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'API' | 'UI') => (
        <Tag color={type === 'API' ? 'blue' : 'cyan'}>{type}</Tag>
      ),
    },
    {
      title: '总数',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: TableRecord, b: TableRecord) => a.total - b.total,
    },
    {
      title: '成功',
      dataIndex: 'success',
      key: 'success',
      render: (val: number) => (
        <Text style={{ color: styles.colors.success }}>{val}</Text>
      ),
      sorter: (a: TableRecord, b: TableRecord) => a.success - b.success,
    },
    {
      title: '失败',
      dataIndex: 'fail',
      key: 'fail',
      render: (val: number) => (
        <Text style={{ color: styles.colors.error }}>{val}</Text>
      ),
      sorter: (a: TableRecord, b: TableRecord) => a.fail - b.fail,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Text
          style={{
            color:
              rate >= 80
                ? styles.colors.success
                : rate >= 50
                ? styles.colors.warning
                : styles.colors.error,
            fontWeight: 600,
          }}
        >
          {rate.toFixed(1)}%
        </Text>
      ),
      sorter: (a: TableRecord, b: TableRecord) => a.successRate - b.successRate,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  const dateTypeOptions = [
    { label: '今日', value: 'today' },
    { label: '本周', value: 'week' },
    { label: '本月', value: 'month' },
  ];

  const statsCards = [
    {
      title: '执行总量',
      value: totalExecutions.toLocaleString(),
      icon: (
        <ThunderboltOutlined
          style={{ fontSize: 24, color: styles.colors.primary }}
        />
      ),
      color: styles.colors.primary,
      trend: '+12.5%',
      isPositive: true,
      description: '较上周期',
    },
    {
      title: '完成率',
      value: `${overallSuccessRate.toFixed(1)}%`,
      icon: (
        <SafetyCertificateOutlined
          style={{ fontSize: 24, color: styles.colors.success }}
        />
      ),
      color: styles.colors.success,
      trend: '+5.2%',
      isPositive: true,
      description: '任务完成',
    },
    {
      title: '成功率',
      value:
        totalExecutions > 0
          ? `${((totalSuccess / totalExecutions) * 100).toFixed(1)}%`
          : '0%',
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      color: '#13c2c2',
      trend: '-2.1%',
      isPositive: false,
      description: '本周数据',
    },
    {
      title: '平均耗时',
      value: avgDuration,
      icon: (
        <ClockCircleOutlined
          style={{ fontSize: 24, color: styles.colors.warning }}
        />
      ),
      color: styles.colors.warning,
      trend: '-8.3%',
      isPositive: true,
      description: '平均执行时间',
    },
  ];

  return (
    <div style={styles.container()}>
      <div style={styles.animatedBg()}>
        <div style={styles.gridOverlay()} />
        <div
          style={styles.glowOrb(
            styles.colors.primary,
            600,
            '-10%',
            '-10%',
            '8s',
          )}
        />
        <div
          style={styles.glowOrb(
            styles.colors.success,
            500,
            '60%',
            '70%',
            '10s',
          )}
        />
        <div style={styles.glowOrb('#13c2c2', 400, '30%', '80%', '12s')} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .stats-card {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .stats-card:nth-child(1) { animation-delay: 0.1s; }
        .stats-card:nth-child(2) { animation-delay: 0.2s; }
        .stats-card:nth-child(3) { animation-delay: 0.3s; }
        .stats-card:nth-child(4) { animation-delay: 0.4s; }
        .chart-card {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .chart-card:nth-child(1) { animation-delay: 0.3s; }
        .chart-card:nth-child(2) { animation-delay: 0.4s; }
        .chart-card:nth-child(3) { animation-delay: 0.5s; }
      `}</style>

      <Spin spinning={loading} tip="加载中...">
        <div style={styles.contentWrapper()}>
          <div style={styles.headerSection()}>
            <div style={styles.headerLeft()}>
              <div style={styles.logoContainer()}>
                <div style={styles.logoIcon()}>
                  <div style={styles.logoIconInner()}>
                    <TrophyOutlined
                      style={{ fontSize: 26, color: styles.colors.primary }}
                    />
                  </div>
                </div>
                <Title level={3} style={styles.headerTitle()}>
                  测试数据统计中心
                </Title>
              </div>
              <Text style={styles.headerSubtitle()}>
                实时监控测试任务执行情况，洞察质量趋势
              </Text>
            </div>
            <div style={styles.headerRight()}>
              <Select
                value={dateType}
                onChange={handleDateTypeChange}
                options={dateTypeOptions}
                style={{ width: 110 }}
                popupMatchSelectWidth={false}
              />
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={dateType !== 'custom'}
              />
            </div>
          </div>

          <div style={styles.statsGrid()}>
            {statsCards.map((stat, index) => (
              <Card
                key={index}
                className="stats-card"
                style={styles.statsCard()}
                styles={{ body: { padding: 0 } }}
                hoverable
              >
                <div style={styles.statsCardGlow(stat.color)} />
                <div style={styles.statsCardContent()}>
                  <div style={styles.statsCardHeader()}>
                    <div style={styles.statsIconWrapper(stat.color)}>
                      {stat.icon}
                    </div>
                    <div style={styles.statsTrend(stat.isPositive)}>
                      {stat.trend}
                    </div>
                  </div>
                  <Text style={styles.statsValue()}>{stat.value}</Text>
                  <Text style={styles.statsLabel()}>{stat.title}</Text>
                  <Text style={styles.statsDescription()}>
                    {stat.description}
                  </Text>
                </div>
              </Card>
            ))}
          </div>

          <div style={styles.chartsGrid()}>
            <Card
              className="chart-card"
              title={
                <div style={styles.cardTitle()}>
                  <div style={styles.cardTitleIcon(styles.colors.primary)}>
                    <LineChartOutlined
                      style={{ fontSize: 16, color: styles.colors.primary }}
                    />
                  </div>
                  <span>任务趋势</span>
                </div>
              }
              extra={<Tag color="blue">7天数据</Tag>}
              style={styles.card()}
              headStyle={styles.cardHeader()}
              bodyStyle={styles.cardBody()}
            >
              <div style={styles.chartContainer()}>
                <Line {...lineConfig} />
              </div>
            </Card>

            <Card
              className="chart-card"
              title={
                <div style={styles.cardTitle()}>
                  <div style={styles.cardTitleIcon(styles.colors.success)}>
                    <TrophyOutlined
                      style={{ fontSize: 16, color: styles.colors.success }}
                    />
                  </div>
                  <span>任务分布</span>
                </div>
              }
              extra={<Tag color="green">实时</Tag>}
              style={styles.card()}
              headStyle={styles.cardHeader()}
              bodyStyle={styles.cardBody()}
            >
              <div style={styles.chartContainer()}>
                <Pie {...pieConfig} />
              </div>
            </Card>
          </div>

          <Card
            className="chart-card"
            title={
              <div style={styles.cardTitle()}>
                <div style={styles.cardTitleIcon('#13c2c2')}>
                  <CrownOutlined style={{ fontSize: 16, color: '#13c2c2' }} />
                </div>
                <span>数据概览</span>
              </div>
            }
            extra={
              <Space>
                <span
                  style={{ color: styles.colors.textSecondary, fontSize: 12 }}
                >
                  API | UI 分布对比
                </span>
              </Space>
            }
            style={styles.card()}
            headStyle={styles.cardHeader()}
            bodyStyle={styles.cardBody()}
          >
            <div style={styles.chartContainer()}>
              <Column {...columnConfig} />
            </div>
          </Card>

          <Card
            style={{ ...styles.tableCard(), marginTop: 24 }}
            headStyle={styles.cardHeader()}
            bodyStyle={{ padding: 0 }}
            title={
              <div style={styles.cardTitle()}>
                <div style={styles.cardTitleIcon(styles.colors.primary)}>
                  <CloudServerOutlined
                    style={{ fontSize: 16, color: styles.colors.primary }}
                  />
                </div>
                <span>数据明细</span>
              </div>
            }
            tabList={[
              { key: 'all', tab: '全部' },
              { key: 'api', tab: 'API' },
              { key: 'ui', tab: 'UI' },
            ]}
            activeTabKey={tableType}
            onTabChange={(key) => setTableType(key as 'all' | 'api' | 'ui')}
          >
            <div style={{ padding: '16px 24px' }}>
              <Table
                dataSource={filteredTableData}
                columns={tableColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条`,
                }}
                size="middle"
              />
            </div>
          </Card>

          <div style={styles.footer()}>
            <Text style={styles.footerText()}>
              CaseHub 测试数据统计中心 • 数据每 30 分钟自动更新
            </Text>
            <Text style={styles.footerText()}>
              © {new Date().getFullYear()} CaseHub
            </Text>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default StatisticsDashboard;
