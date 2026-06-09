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
import { Descriptions, Skeleton, Space, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface PlanOverviewProps {
  planId?: string;
}

/**
 * 颜色解析：根据配置中心定义的 status -> color 解析为实际色值
 * 状态列表为空时降级到 FALLBACK（与列表页保持一致）
 */

/**
 * 计划概览组件
 * 独立管理 getPlanInfo 的请求与 loading，
 * 不再阻塞 PlanInfo 的 Tab 容器渲染。
 */
const PlanOverview: React.FC<PlanOverviewProps> = ({ planId }) => {
  const { token } = useCaseHubTheme();
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

  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  // 计划状态枚举（来自配置中心 PLAN_STATUS） —— 配置为空时颜色降级为文本色
  const { options: planStatusOptions } = useCaseEnumConfig('PLAN_STATUS');
  const statusColorMap: Record<string, string> = {};
  for (const s of planStatusOptions) {
    statusColorMap[s.value] = resolveStatusColor(token, s.color);
  }
  const statusColor =
    statusColorMap[planInfo?.plan_status || ''] || token.colorTextTertiary;

  return (
    <Descriptions bordered column={2} size="small">
      <Descriptions.Item label="计划名称" span={2}>
        {planInfo?.plan_name || '-'}
      </Descriptions.Item>
      <Descriptions.Item label="负责人">
        <Space>
          <UserOutlined style={{ color: token.colorTextSecondary }} />
          {planInfo?.charge_name || '-'}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag
          style={{
            color: statusColor,
            background: 'transparent',
            border: `1px solid ${statusColor}`,
          }}
        >
          {planInfo?.plan_status || '-'}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="开始时间">
        <Space>
          <CalendarOutlined style={{ color: token.colorTextSecondary }} />
          {planInfo?.plan_start_time || '-'}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="结束时间">
        <Space>
          <CalendarOutlined style={{ color: token.colorTextSecondary }} />
          {planInfo?.plan_end_time || '-'}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="执行阶段">
        {planInfo?.plan_phase || '-'}
      </Descriptions.Item>
      <Descriptions.Item label="完成率">
        <Space>
          <CheckCircleOutlined style={{ color: token.colorSuccess }} />
          {planInfo?.completion_rate ?? 0}%
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="备注" span={2}>
        {planInfo?.plan_mark || '-'}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default PlanOverview;
