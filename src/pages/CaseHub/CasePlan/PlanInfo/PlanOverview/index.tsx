import { getPlanInfo } from '@/api/case/caseplan';
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
 * 根据状态获取对应颜色
 * 提到模块作用域，避免每次渲染重建对象
 */
const getStatusColor = (status: string | undefined, token: any) => {
  const statusMap: Record<string, string> = {
    进行中: token.colorInfo,
    已完成: token.colorSuccess,
    已暂停: token.colorWarning,
    已取消: token.colorError,
  };
  return statusMap[status || ''] || token.colorTextTertiary;
};

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

  const statusColor = getStatusColor(planInfo?.plan_status, token);

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
            background:
              planInfo?.plan_status === '已完成'
                ? token.colorSuccessBg
                : 'transparent',
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
