import MyTabs from '@/components/MyTabs';
import { useParams } from '@umijs/max';
import PlanCases from './components/PlanCases';

const Index = () => {
  const { planId } = useParams<{ planId: string }>();

  const PlanTiems = [
    {
      key: 'cases',
      label: '用例',
      children: <PlanCases planId={planId} />,
    },
    {
      key: 'requiremnet',
      label: '需求',
      value: 'requirementDetail',
    },
    {
      label: '概览',
      key: 'overview',
    },
  ];

  return (
    <>
      <MyTabs items={PlanTiems} defaultActiveKey={'cases'} />
    </>
  );
};

export default Index;
