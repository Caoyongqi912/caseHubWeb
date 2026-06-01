import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Tabs } from 'antd';
import PlanCases from './PlanCases';
import PlanOverview from './PlanOverview';

const Index = () => {
  const { planId } = useParams<{ planId: string }>();
  const { token } = useCaseHubTheme();

  /** 需求模块占位 */
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
      // PlanCases 自管理 planInfo（通过 props 接收可选值），此处不强制要求 planInfo 已加载
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
        items={PlanTiems}
        defaultActiveKey={'cases'}
        style={{ height: '100%' }}
      />
    </PageContainer>
  );
};

export default Index;
