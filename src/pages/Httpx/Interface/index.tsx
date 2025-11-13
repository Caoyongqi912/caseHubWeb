import LeftComponents from '@/components/LeftComponents';
import GroupApiTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiTable';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import InterfaceApiTableNoModule from '@/pages/Httpx/Interface/InterfaceApiTableNoModule';
import InterfaceApiUpload from '@/pages/Httpx/Interface/InterfaceApiUpload';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Splitter, TabsProps } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceApi';
  const PerKeyNoPart = 'InterfaceApiNoPart';
  const PerGroupKey = 'InterfaceGroupApi';

  const TabItems: TabsProps['items'] = [
    {
      key: 'api',
      label: 'Common API',
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

  return (
    <ProCard
      bordered={true}
      style={{ height: 'auto' }}
      bodyStyle={{ height: 'auto', padding: 0 }}
    >
      <Splitter layout="horizontal">
        <Splitter.Panel
          collapsible={true}
          defaultSize="15%"
          min="10%"
          max="30%"
          style={{ height: '100vh' }}
        >
          <Splitter layout="vertical">
            <Splitter.Panel>
              <LeftComponents
                moduleType={ModuleEnum.API}
                currentProjectId={currentProjectId}
                onProjectChange={onProjectChange}
                onModuleChange={onModuleChange}
              />
            </Splitter.Panel>
            <Splitter.Panel>
              <ProCard title="视图"></ProCard>
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel>
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
