import MyTabs from '@/components/MyTabs';
import InterApiHeaders from '@/pages/Httpx/InterfaceConfig/InterApiHeaders';
import InterApiMockConfig from '@/pages/Httpx/InterfaceConfig/InterApiMockConfig';

const Index = () => {
  const items = [
    {
      key: '2',
      label: `默认请求头`,
      children: <InterApiHeaders />,
    },
    {
      key: '3',
      label: `MOCK匹配`,
      children: <InterApiMockConfig />,
    },
  ];
  return <MyTabs tabPlacement={'top'} defaultActiveKey={'1'} items={items} />;
};

export default Index;
