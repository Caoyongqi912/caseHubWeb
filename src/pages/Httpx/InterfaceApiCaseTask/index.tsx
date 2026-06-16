import LeftComponents from '@/components/LeftComponents';
import InterfaceApiCaseTaskTable from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskTable';
import { ModuleEnum } from '@/utils/config';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceTask';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number | undefined) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <>
      <div
        style={{
          height: '90vh',
          overflow: 'hidden',
          display: 'flex',
          padding: '12px',
          gap: '12px',
        }}
      >
        <Group orientation="horizontal">
          <Panel defaultSize={20} minSize={10} collapsible={true}>
            <LeftComponents
              moduleType={ModuleEnum.API_TASK}
              currentProjectId={currentProjectId}
              onProjectChange={onProjectChange}
              onModuleChange={onModuleChange}
            />
          </Panel>
          <Panel defaultSize={80} minSize={30}>
            <InterfaceApiCaseTaskTable
              currentModuleId={currentModuleId}
              currentProjectId={currentProjectId}
              perKey={PerKey}
            />
          </Panel>
        </Group>
      </div>
    </>
  );
};

export default Index;
