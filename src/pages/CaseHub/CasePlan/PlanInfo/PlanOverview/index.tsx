/**
 * @file PlanOverview/index.tsx
 * @description 计划概览页
 *
 * 设计要点：
 * 1. 所有 Hook 调用必须放在组件顶部、任何条件 return 之前 —— 遵守 React Hooks 规则
 * 2. 视觉风格与 PlanInfo Tabs (type="card") 保持一致：干净、扁平、信息层级清晰
 * 3. 状态标签使用配置中心的颜色映射，与列表页保持统一
 * 4. 完成率用 Progress 直观展示，替代纯文本百分比
 */

import { getPlanInfo } from '@/api/case/caseplan';
import { resolveStatusColor } from '@/pages/CaseHub/CasePlan/statusColor';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Progress, Skeleton, Space, Tag } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PlanOverviewProps {
  planId?: string;
}

/**
 * 计划概览组件
 * 独立管理 getPlanInfo 的请求与 loading，切换到此 Tab 时再加载
 */
const PlanOverview: React.FC<PlanOverviewProps> = ({ planId }) => {
  const { token } = useCaseHubTheme();

  // ===== Hook 区（必须在任何条件 return 之前调用）=====
  // 计划状态枚举（来自配置中心 PLAN_STATUS）—— 配置为空时颜色降级为文本色
  const { options: planStatusOptions } = useCaseEnumConfig('PLAN_STATUS');

  const [planInfo, setPlanInfo] = useState<ICasePlan>();
  const [loading, setLoading] = useState(true);

  /** 获取计划详情 */
  const fetchPlanInfo = useCallback(() => {
    if (!planId) return;
    setLoading(true);
    getPlanInfo(Number(planId))
      .then(({ code, data }) => {
        if (code === 0) setPlanInfo(data);
      })
      .finally(() => setLoading(false));
  }, [planId]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  // ===== 派生数据（loading 之后计算，但 Hooks 已经调用完毕）=====

  /** 状态颜色映射表：value -> 解析后的实际色值 */
  const statusColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of planStatusOptions) {
      map[s.value] = resolveStatusColor(token, s.color);
    }
    return map;
  }, [planStatusOptions, token]);

  const statusColor =
    statusColorMap[planInfo?.plan_status || ''] || token.colorTextTertiary;

  // ===== Loading 态 =====

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // ===== 渲染：概览卡片布局 =====

  return (
    <div
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── 顶部标题区：计划名称 + 状态 ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: token.colorText,
            letterSpacing: 0.3,
            lineHeight: 1.3,
          }}
        >
          {planInfo?.plan_name || '-'}
        </h2>

        <Tag
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: '2px 12px',
            borderRadius: 4,
            color: statusColor,
            background: `${statusColor}12`,
            border: `1px solid ${statusColor}40`,
          }}
        >
          {planInfo?.plan_status || '-'}
        </Tag>
      </div>

      {/* ── 分隔线 ── */}
      <div
        style={{
          height: 1,
          background: token.colorBorderSecondary,
        }}
      />

      {/* ── 关键信息网格 ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <InfoCard
          icon={<UserOutlined />}
          iconColor={token.colorPrimary}
          label="负责人"
          value={planInfo?.charge_name || '-'}
          token={token}
        />
        <InfoCard
          icon={<CalendarOutlined />}
          iconColor={token.colorInfo}
          label="开始时间"
          value={planInfo?.plan_start_time || '-'}
          token={token}
        />
        <InfoCard
          icon={<CalendarOutlined />}
          iconColor={token.colorWarning}
          label="结束时间"
          value={planInfo?.plan_end_time || '-'}
          token={token}
        />
        <InfoCard
          icon={<CheckCircleOutlined />}
          iconColor={token.colorSuccess}
          label="执行阶段"
          value={planInfo?.plan_phase || '-'}
          token={token}
        />
      </div>

      {/* ── 完成率 + 进度 ── */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 8,
          background: token.colorBgLayout,
          border: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: token.colorText,
            }}
          >
            完成进度
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: token.colorPrimary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {planInfo?.completion_rate ?? 0}%
          </span>
        </div>
        <Progress
          percent={planInfo?.completion_rate ?? 0}
          strokeColor={token.colorPrimary}
          trailColor={token.colorBorderSecondary}
          size={['100%', 8]}
          showInfo={false}
        />
      </div>

      {/* ── 备注 ── */}
      {planInfo?.plan_mark && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 8,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: token.colorTextSecondary,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            备注
          </div>
          <div
            style={{
              fontSize: 13,
              color: token.colorText,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {planInfo.plan_mark}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
 * 信息卡片子组件
 * ============================================================ */

interface InfoCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  token: any;
}

/** 概览信息卡片：图标 + 标签 + 值 */
const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  token,
}) => (
  <div
    style={{
      padding: '16px 20px',
      borderRadius: 8,
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'box-shadow 0.2s ease',
    }}
  >
    <Space size={8} align="center">
      <span style={{ color: iconColor, fontSize: 16 }}>{icon}</span>
      <span
        style={{
          fontSize: 12,
          color: token.colorTextSecondary,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </Space>
    <div
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: token.colorText,
        lineHeight: 1.3,
        wordBreak: 'break-all',
      }}
    >
      {value}
    </div>
  </div>
);

export default PlanOverview;
