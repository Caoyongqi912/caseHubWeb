import LeftComponents from '@/components/LeftComponents';
import InterfaceApiCaseTable from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceApiCase';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  return (
    <ProCard
      bordered={true}
      style={{ height: '100vh' }}
      bodyStyle={{ height: 'auto', padding: 0 }}
    >
      <Splitter>
        <Splitter.Panel
          collapsible={true}
          defaultSize="15%"
          min="10%"
          max="30%"
          style={{ height: '100vh' }}
        >
          <LeftComponents
            moduleType={ModuleEnum.API_CASE}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
            currentProjectId={currentProjectId}
          />
        </Splitter.Panel>

        <Splitter.Panel>
          <InterfaceApiCaseTable
            perKey={PerKey}
            currentModuleId={currentModuleId}
            currentProjectId={currentProjectId}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
