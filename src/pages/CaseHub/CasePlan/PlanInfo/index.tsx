import { getPlanInfo } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Descriptions, Skeleton, Space, Tabs, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import PlanCases from './PlanCases';

const Index = () => {
  const { planId } = useParams<{ planId: string }>();
  const { token } = useCaseHubTheme();
  const [planInfo, setPlanInfo] = useState<ICasePlan>();
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status?: string) => {
    const statusMap: Record<string, string> = {
      进行中: token.colorInfo,
      已完成: token.colorSuccess,
      已暂停: token.colorWarning,
      已取消: token.colorError,
    };
    return statusMap[status || ''] || token.colorTextTertiary;
  };

  const renderPlanOverview = () => (
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
            color: getStatusColor(planInfo?.plan_status),
            background:
              planInfo?.plan_status === '已完成'
                ? token.colorSuccessBg
                : 'transparent',
            border: `1px solid ${getStatusColor(planInfo?.plan_status)}`,
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
          {planInfo?.plan_completion_rate ?? 0}%
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="备注" span={2}>
        {planInfo?.plan_mark || '-'}
      </Descriptions.Item>
    </Descriptions>
  );

  const renderRequirementPlaceholder = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: token.colorTextTertiary,
      }}
    >
      需求模块开发中...
    </div>
  );

  const PlanTiems = [
    {
      key: 'cases',
      label: '用例',
      children: <PlanCases planId={planId} />,
    },
    {
      key: 'requirement',
      label: '需求',
      children: renderRequirementPlaceholder(),
    },
    {
      key: 'overview',
      label: '概览',
      children: renderPlanOverview(),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <Skeleton active paragraph={{ rows: 6 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={false}
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <Tabs
        type="card"
        size="small"
        items={PlanTiems}
        defaultActiveKey={'cases'}
        style={{ height: '100%' }}
        // tabBarStyle={{ height: 'auto' }}
      />
    </PageContainer>
  );
};

export default Index;
