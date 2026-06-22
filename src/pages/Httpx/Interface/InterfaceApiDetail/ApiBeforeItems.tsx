import MyTabs from '@/components/MyTabs';
import InterBeforeParams from '@/pages/Httpx/componets/InterBeforeParams';
import InterBeforeSql from '@/pages/Httpx/componets/InterBeforeSQL';
import InterScript from '@/pages/Httpx/componets/InterScript';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import {
  CodeOutlined,
  PythonOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { FormInstance, TabsProps } from 'antd';
import { FC } from 'react';

interface ISelfProps {
  interApiForm: FormInstance<IInterfaceAPI>;
}

const ApiBeforeItems: FC<ISelfProps> = (props) => {
  const { interApiForm } = props;
  const TabItems: TabsProps['items'] = [
    {
      key: '1',
      label: '设置变量',
      icon: <UnorderedListOutlined />,
      children: <InterBeforeParams form={interApiForm} />,
    },
    {
      key: '2',
      label: '添加脚本',
      icon: <PythonOutlined />,
      children: <InterScript form={interApiForm} />,
    },
    {
      key: '3',
      label: '添加SQL',
      icon: <CodeOutlined />,
      children: <InterBeforeSql form={interApiForm} />,
    },
  ];
  return (
    <ProCard style={{ marginTop: 10 }} styles={{ body: { padding: 0 } }}>
      <MyTabs defaultActiveKey={'1'} tabPlacement={'left'} items={TabItems} />
    </ProCard>
  );
};

export default ApiBeforeItems;
