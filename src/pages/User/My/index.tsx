import MyTabs from '@/components/MyTabs';
import MyVars from '@/pages/User/My/MyVars';
import { ProCard } from '@ant-design/pro-components';

const Index = () => {
  const items = [
    {
      key: '1',
      label: `我的变量`,
      children: <MyVars />,
    },
  ];
  return (
    <ProCard>
      <MyTabs items={items} defaultActiveKey={'1'} tabPlacement={'top'} />
    </ProCard>
  );
};

export default Index;
