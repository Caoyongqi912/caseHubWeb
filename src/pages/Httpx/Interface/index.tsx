import LeftComponents from '@/components/LeftComponents';
import GroupApiTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiTable';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import InterfaceApiTableNoModule from '@/pages/Httpx/Interface/InterfaceApiTableNoModule';
import InterfaceApiUpload from '@/pages/Httpx/Interface/InterfaceApiUpload';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter, TabsProps } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceApi';
  const PerKeyNoPart = 'InterfaceApiNoPart';
  const PerGroupKey = 'InterfaceGroupApi';
  const PerKeySplitter = 'InterfaceApi:Splitter';
  const [sizes, setSizes] = useState<(number | string)[]>(['25%', '75%']);

  const TabItems: TabsProps['items'] = [
    {
      key: 'api',
      label: '单接口用例',
      children: (
        <InterfaceApiTable
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          perKey={PerKey}
        />
      ),
    },

    {
      key: 'group',
      label: 'Group API',
      children: (
        <GroupApiTable
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          perKey={PerGroupKey}
        />
      ),
    },
    {
      key: 'no part',
      label: 'No Part API',
      children: (
        <InterfaceApiTableNoModule
          currentProjectId={currentProjectId}
          perKey={PerKeyNoPart}
        />
      ),
    },
    {
      key: 'upload',
      label: 'Upload API',
      children: <InterfaceApiUpload />,
    },
  ];

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  useEffect(() => {
    const data = getSplitter(PerKeySplitter);
    if (data) {
      setSizes([data.left, data.right]);
    }
  }, []);
  return (
    <ProCard
      style={{ height: 'auto' }}
      bodyStyle={{
        height: '100%',
        minHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={{ width: '100%', height: '100%' }}
        layout="horizontal"
      >
        <Splitter.Panel
          resizable={true}
          collapsible={true}
          style={{ height: 'auto' }}
          size={sizes[0]}
          min={'0%'}
          max={'30%'}
        >
          <LeftComponents
            moduleType={ModuleEnum.API}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
          />
        </Splitter.Panel>
        <Splitter.Panel
          resizable={true}
          size={sizes[1]}
          style={{ overflow: 'auto' }}
        >
          <ProCard
            bodyStyle={{ padding: 0 }}
            tabs={{
              type: 'card',
              items: TabItems,
            }}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
