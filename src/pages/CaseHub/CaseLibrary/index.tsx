import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import CaseDataTable from './CaseDataTable';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<
    number | undefined
  >();
  const PerKey = 'TEST_CASE';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <div
      style={{
        height: '100%', // 🔥 改成 100%，不要用 100vh
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        padding: '12px',
        gap: '12px',
      }}
    >
      <Group
        orientation="horizontal"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Panel defaultSize={20} minSize={10} collapsible={true}>
          <LeftComponents
            moduleType={ModuleEnum.CASE}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30} style={{ height: '100%' }}>
          <CaseDataTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
          />
        </Panel>
      </Group>
    </div>
  );
};

export default Index;
