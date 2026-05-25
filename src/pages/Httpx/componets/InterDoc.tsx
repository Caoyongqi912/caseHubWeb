import FuncScriptDesc from '@/pages/Httpx/componets/funcScriptDesc';
import { FunctionOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Tabs } from 'antd';

const InterDoc = () => {
  return (
    <ProCard styles={{ body: { padding: 0 } }}>
      <Tabs
        defaultActiveKey="1"
        size={'small'}
        tabPlacement={'start'}
        items={[
          {
            key: '1',
            label: '内置Func',
            icon: <FunctionOutlined />,
            children: <FuncScriptDesc />,
          },
        ]}
      />
    </ProCard>
  );
};

export default InterDoc;
