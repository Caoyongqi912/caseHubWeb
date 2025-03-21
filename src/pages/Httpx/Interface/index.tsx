import LeftComponents from '@/components/LeftComponents';
import GroupApiTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiTable';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import InterfaceApiTableNoModule from '@/pages/Httpx/Interface/InterfaceApiTableNoModule';
import InterfaceApiUpload from '@/pages/Httpx/Interface/InterfaceApiUpload';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceApi';
  const PerKeyNoPart = 'InterfaceApiNoPart';
  const PerGroupKey = 'InterfaceGroupApi';

  return (
    <ProCard
      bordered={true}
      style={{ height: 'auto' }}
      bodyStyle={{ height: 'auto', padding: 0 }}
    >
      <Splitter>
        <Splitter.Panel
          collapsible={true}
          defaultSize="20%"
          min="10%"
          max="30%"
          style={{ height: '100vh' }}
        >
          <LeftComponents
            moduleType={ModuleEnum.API}
            currentProjectId={currentProjectId}
            setCurrentProjectId={setCurrentProjectId}
            setCurrentModuleId={setCurrentModuleId}
          />
        </Splitter.Panel>
        <Splitter.Panel>
          <ProCard
            bodyStyle={{ padding: 0 }}
            tabs={{
              type: 'card',
            }}
          >
            <ProCard.TabPane key="api" tab="Common API">
              <InterfaceApiTable
                currentProjectId={currentProjectId}
                currentModuleId={currentModuleId}
                perKey={PerKey}
              />
            </ProCard.TabPane>
            <ProCard.TabPane key="case" tab="Group APIs">
              <GroupApiTable
                currentProjectId={currentProjectId}
                currentModuleId={currentModuleId}
                perKey={PerGroupKey}
              />
            </ProCard.TabPane>
            <ProCard.TabPane key="not_part_api" tab="No Part APIs">
              <InterfaceApiTableNoModule
                currentProjectId={currentProjectId}
                perKey={PerKeyNoPart}
              />
            </ProCard.TabPane>
            <ProCard.TabPane key="upload" tab="Upload API">
              <InterfaceApiUpload />
            </ProCard.TabPane>
          </ProCard>
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
