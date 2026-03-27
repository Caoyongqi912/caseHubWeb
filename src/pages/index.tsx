import {
  fetchCurrentTaskData,
  fetchWeekData,
  fetchWeekTaskData,
} from '@/api/base/statistics';
import {
  ApiOutlined,
  CodeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
import RcResizeObserver from 'rc-resize-observer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BuildStatusCard from './components/BuildStatusCard';
import ComparisonCard from './components/ComparisonCard';
import MetricCard from './components/MetricCard';
import TrendChartCard from './components/TrendChartCard';
import { useHomePageStyles } from './HomePageStyles';

const { Text, Title } = Typography;

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

const StatisticsDashboard: React.FC = () => {
  const styles = useHomePageStyles();
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

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const themeColors = useMemo(
    () => ({
      api: {
        primary: '#2f54eb',
        success: '#52c41a',
        error: '#ff4d4f',
        warning: '#faad14',
      },
      ui: {
        primary: '#13c2c2',
        success: '#52c41a',
        error: '#ff4d4f',
        warning: '#faad14',
      },
      metrics: {
        apiCase: '#1890ff',
        apiTask: '#2f54eb',
        uiCase: '#13c2c2',
        uiTask: '#52c41a',
      },
    }),
    [],
  );

  const metrics = useMemo(
    () => [
      {
        key: 'apis',
        title: 'API Case',
        value: weekData.apis,
        growth: weekData.apis_growth,
        color: themeColors.metrics.apiCase,
        icon: <ApiOutlined style={{ color: '#fff', fontSize: 24 }} />,
        description: '接口测试用例',
      },
      {
        key: 'api_task',
        title: 'API Task',
        value: weekData.api_task,
        growth: weekData.api_task_growth,
        color: themeColors.metrics.apiTask,
        icon: <ThunderboltOutlined style={{ color: '#fff', fontSize: 24 }} />,
        description: '接口测试任务',
      },
      {
        key: 'uis',
        title: 'UI Case',
        value: weekData.uis,
        growth: weekData.uis_growth,
        color: themeColors.metrics.uiCase,
        icon: <CodeOutlined style={{ color: '#fff', fontSize: 24 }} />,
        description: 'UI测试用例',
      },
      {
        key: 'ui_task',
        title: 'UI Task',
        value: weekData.ui_task,
        growth: weekData.ui_task_growth,
        color: themeColors.metrics.uiTask,
        icon: <RocketOutlined style={{ color: '#fff', fontSize: 24 }} />,
        description: 'UI测试任务',
      },
    ],
    [weekData, themeColors],
  );

  const gridStyle = useMemo(() => {
    if (responsive) {
      return {
        metricGrid: {
          ...styles.metricsGrid(),
          ...styles.responsiveStyles.metricsGrid,
        },
        mainGrid: { ...styles.mainGrid(), ...styles.responsiveStyles.mainGrid },
        contentWrapper: {
          ...styles.contentWrapper(),
          ...styles.responsiveStyles.contentWrapper,
        },
      };
    }
    return {
      metricGrid: styles.metricsGrid(),
      mainGrid: styles.mainGrid(),
      contentWrapper: styles.contentWrapper(),
    };
  }, [responsive, styles]);

  return (
    <div style={styles.container()}>
      <div style={styles.animatedBackground()} />
      <div style={styles.gridOverlay()} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes logoRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <RcResizeObserver
        onResize={(offset) => {
          setResponsive(offset.width < 992);
        }}
      >
        <div style={gridStyle.contentWrapper}>
          <div style={styles.header()}>
            <div style={styles.headerLeft()}>
              <div style={styles.logoContainer()}>
                <div style={styles.logoGlow()} />
                <div style={styles.logoOuter()}>
                  <div style={styles.logoInner()}>
                    <TrophyOutlined
                      style={{ color: styles.colors.primary, fontSize: 26 }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Title level={3} style={styles.headerTitle()}>
                  测试数据统计中心
                </Title>
                <Text style={styles.headerSubtitle()}>
                  实时监控测试任务执行情况，洞察质量趋势
                </Text>
              </div>
            </div>
          </div>

          <div style={gridStyle.metricGrid}>
            {metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                title={metric.title}
                value={metric.value}
                growth={metric.growth}
                color={metric.color}
                icon={metric.icon}
                description={metric.description}
              />
            ))}
          </div>

          <div style={gridStyle.mainGrid}>
            <BuildStatusCard
              title="API"
              data={currentApiTaskData}
              colors={themeColors.api}
            />
            <BuildStatusCard
              title="UI"
              data={currentUiTaskData}
              colors={themeColors.ui}
            />
          </div>

          <div style={gridStyle.mainGrid}>
            <TrendChartCard
              title="API任务趋势"
              data={apiWeekTaskData}
              type="line"
              colors={themeColors.api}
            />
            <TrendChartCard
              title="UI任务趋势"
              data={uiWeekTaskData}
              type="line"
              colors={themeColors.ui}
            />
          </div>

          <ComparisonCard
            apiData={currentApiTaskData}
            uiData={currentUiTaskData}
            colors={{ api: themeColors.api, ui: themeColors.ui }}
          />

          <div style={styles.footer()}>
            <Text style={styles.footerText()}>
              数据每30分钟自动更新 • 最后更新时间：
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: styles.colors.textSecondary,
                display: 'block',
                marginTop: 4,
              }}
            >
              CaseHub © 2026
            </Text>
          </div>
        </div>
      </RcResizeObserver>
    </div>
  );
};

export default StatisticsDashboard;
