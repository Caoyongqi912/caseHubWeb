import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Tabs } from 'antd';
import PlanCases from './PlanCases';
import PlanMindMap from './PlanMindMap';
import PlanOverview from './PlanOverview';
import PlanReuirements from './PlanReuirements';

const Index = () => {
  const { planId } = useParams<{ planId: string }>();

  const PlanItems = [
    {
      key: 'cases',
      label: '用例',
      // PlanCases 自管理 planInfo（通过 props 接收可选值），此处不强制要求 planInfo 已加载
      children: <PlanCases planId={planId} />,
    },
    {
      key: 'mind',
      label: '脑图',
      // PlanMindMap 自管理 planInfo / planModules 加载，脑图节点变更后会回调刷新模块树
      children: <PlanMindMap planId={planId} />,
    },
    {
      key: 'requirement',
      label: '需求',
      children: <PlanReuirements planId={planId} />,
    },
    {
      key: 'overview',
      label: '概览',
      // PlanOverview 内部自管理 getPlanInfo loading，切换到此 Tab 时再加载
      children: <PlanOverview planId={planId} />,
    },
  ];

  return (
    <PageContainer
      title={false}
      header={{
        breadcrumb: {
          items: [],
        },
      }}
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <Tabs
        type="card"
        size="small"
        items={PlanItems}
        defaultActiveKey={'cases'}
        style={{ height: '100%' }}
      />
    </PageContainer>
  );
};

export default Index;
