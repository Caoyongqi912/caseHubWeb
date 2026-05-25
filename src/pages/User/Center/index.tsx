import { ProCard } from '@ant-design/pro-components';
import { TabsProps } from 'antd';

import MyTabs from '@/components/MyTabs';
import SetPwd from '@/pages/User/Center/components/setPwd';
import UserInfo from '@/pages/User/Center/components/userInfo';

const Index = () => {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '修改密码',
      children: <SetPwd />,
    },
    {
      key: '2',
      label: '信息',
      children: <UserInfo />,
    },
  ];
  return (
    <>
      <ProCard variant="outlined" style={{ height: '100vh' }}>
        <MyTabs
          title={'用户中心'}
          tabPlacement={'left'}
          defaultActiveKey={'2'}
          items={items}
        />
      </ProCard>
    </>
  );
};

export default Index;
