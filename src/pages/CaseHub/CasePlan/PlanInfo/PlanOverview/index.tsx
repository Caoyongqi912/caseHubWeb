/**
 * PlanOverview · 测试计划概览 Tab
 *
 * 设计取向
 *  - 与 PlanCases（用例 Tab）保持同一视觉语言：发丝线分割 + 大等宽数字 + 卡片化图表
 *  - 9 个核心指标分 3 组呈现（用例 / 缺陷 / 需求），避免「全平铺 9 个」的稀疏感
 *  - 4 张图表卡 2×2 排布：一/二轮状态分布、等级分布、完成率进度、最近缺陷
 *
 * 数据来源
 *  - planInfo     ← GET /api/hub/plan/info（基础信息）
 *  - overview     ← GET /api/hub/plan/overview（一/二轮统计、需求、缺陷）
 *  - statistics   ← GET /api/hub/plan/statistics（按状态/等级聚合）
 *
 * 加载策略
 *  - 三个接口互不依赖，并行触发
 *  - 单接口失败不影响其他两张卡片的展示
 *  - 父组件 (PlanInfo) 切换 tab 时不重置本地状态，便于「用例 → 概览」无闪烁
 */
import {
  getPlanInfo,
  getPlanOverview,
  getPlanStatistics,
  IPlanOverview,
  IPlanStatistics,
} from '@/api/case/caseplan';
import { ICasePlan } from '@/pages/CaseHub/types';
import { Skeleton } from 'antd';

import { useCallback, useEffect, useState } from 'react';
import BugListPanel from './components/BugListPanel';
import ChartCard from './components/ChartCard';
import CompletionRateChart from './components/CompletionRateChart';
import LevelDistributionChart from './components/LevelDistributionChart';
import MetricsBoard from './components/MetricsBoard';
import PlanHeader from './components/PlanHeader';
import StatusDistributionChart from './components/StatusDistributionChart';
import { usePlanOverviewStyles } from './styles';

interface PlanOverviewProps {
  planId?: string;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ planId }) => {
  const styles = usePlanOverviewStyles();
  // 三个数据源 + 一个时间筛选
  const [planInfo, setPlanInfo] = useState<ICasePlan>();
  const [overview, setOverview] = useState<IPlanOverview>();
  const [statistics, setStatistics] = useState<IPlanStatistics>();
  // loadingXxx：分接口控制，单个失败不阻塞其他卡片
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingStatistics, setLoadingStatistics] = useState(true);
  // 时间筛选 —— 后端目前不支持按时间聚合，UI 上保留入口给后续接入

  /** 拉取 planInfo（基础信息） */
  const fetchPlanInfo = useCallback(() => {
    if (!planId) return;
    setLoadingInfo(true);
    getPlanInfo(Number(planId))
      .then(({ code, data }) => {
        if (code === 0) setPlanInfo(data);
      })
      .finally(() => setLoadingInfo(false));
  }, [planId]);

  /** 拉取概览统计（用例 / 缺陷 / 需求） */
  const fetchOverview = useCallback(() => {
    if (!planId) return;
    setLoadingOverview(true);
    getPlanOverview(Number(planId))
      .then(({ code, data }) => {
        if (code === 0) setOverview(data);
      })
      .finally(() => setLoadingOverview(false));
  }, [planId]);

  /** 拉取按状态/等级聚合的统计（图表数据） */
  const fetchStatistics = useCallback(() => {
    if (!planId) return;
    setLoadingStatistics(true);
    getPlanStatistics(Number(planId))
      .then(({ code, data }) => {
        if (code === 0) setStatistics(data);
      })
      .finally(() => setLoadingStatistics(false));
  }, [planId]);

  /** 三个接口互不依赖，并行触发；任一失败不影响其他 */
  useEffect(() => {
    fetchPlanInfo();
    fetchOverview();
    fetchStatistics();
  }, [fetchPlanInfo, fetchOverview, fetchStatistics]);

  /** 右上角刷新：仅刷新统计数据，不动 planInfo（避免姓名/时间被重置） */
  const handleRefresh = useCallback(() => {
    fetchOverview();
    fetchStatistics();
  }, [fetchOverview, fetchStatistics]);

  // 任何一张主卡片还在 loading —— 用全页骨架占位，避免数据从 0 → 实数的闪烁
  const isInitialLoading = loadingInfo && loadingOverview && loadingStatistics;
  if (isInitialLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div style={styles.container}>
      {/* 头部信息条 */}
      <PlanHeader
        planInfo={planInfo}
        loading={loadingInfo}
        onRefresh={handleRefresh}
      />

      {/* 顶部 9 指标面板 */}
      <MetricsBoard overview={overview} loading={loadingOverview} />

      {/* 图表区 2×2：状态分布 / 等级分布 / 完成率 / 最近缺陷 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        <ChartCard
          title={
            <span>
              用例执行结果分布
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: styles.token.colorTextTertiary,
                  fontFamily: styles.token.fontFamilyCode,
                  fontWeight: 400,
                }}
              >
                一轮 / 二轮
              </span>
            </span>
          }
        >
          <StatusDistributionChart
            firstStatusMap={statistics?.case_by_first_status || {}}
            secondStatusMap={statistics?.case_by_second_status || {}}
          />
        </ChartCard>

        <ChartCard
          title={
            <span>
              用例按等级分布
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: styles.token.colorTextTertiary,
                  fontFamily: styles.token.fontFamilyCode,
                  fontWeight: 400,
                }}
              >
                P0 / P1 / P2 / P3
              </span>
            </span>
          }
        >
          <LevelDistributionChart levelMap={statistics?.case_by_level || {}} />
        </ChartCard>

        <ChartCard
          title={
            <span>
              一轮 / 二轮完成率
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: styles.token.colorTextTertiary,
                  fontFamily: styles.token.fontFamilyCode,
                  fontWeight: 400,
                }}
              >
                通过 / 失败 / 未执行
              </span>
            </span>
          }
        >
          <CompletionRateChart
            first={
              overview?.first_round || {
                passed: 0,
                failed: 0,
                not_executed: 0,
                completion_rate: 0,
              }
            }
            second={
              overview?.second_round || {
                passed: 0,
                failed: 0,
                not_executed: 0,
                completion_rate: 0,
              }
            }
          />
        </ChartCard>

        <ChartCard
          title={
            <span>
              最近缺陷
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  color: styles.token.colorTextTertiary,
                  fontFamily: styles.token.fontFamilyCode,
                  fontWeight: 400,
                }}
              >
                {overview?.bug_list?.length
                  ? `共 ${overview.bug_list.length} 条`
                  : '0 条'}
              </span>
            </span>
          }
        >
          <BugListPanel
            bugList={overview?.bug_list || []}
            bugTotal={overview?.bug_total || 0}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default PlanOverview;
