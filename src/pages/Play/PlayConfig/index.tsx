import Locator from '@/pages/Play/PlayConfig/Locator';
import UIMethodConfig from '@/pages/Play/PlayConfig/UIMethodConfig';
import { ProCard } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [tag, setTag] = useState('0');

  const items = [
    {
      key: '0',
      label: `步骤选择器`,
      children: <Locator />,
    },
    {
      key: '1',
      label: `步骤方法`,
      children: <UIMethodConfig />,
    },
  ];
  return (
    <ProCard style={{ height: 'auto' }}>
      <Tabs
        tabPosition={'top'}
        type={'card'}
        defaultValue={tag}
        size={'large'}
        onChange={setTag}
        style={{ marginTop: '20px' }}
        items={items}
      />
    </ProCard>
  );
};

export default Index;
