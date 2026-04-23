import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import RequirementTable from './components/RequirementTable';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'Requirement';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <>
      <ProCard ghost={true}>
        <Group orientation="horizontal">
          <Panel defaultSize={20} minSize={10} collapsible={true}>
            <LeftComponents
              moduleType={ModuleEnum.REQUIREMENT}
              currentProjectId={currentProjectId}
              onModuleChange={onModuleChange}
              onProjectChange={onProjectChange}
            />
          </Panel>
          <Panel defaultSize={80} minSize={30}>
            <RequirementTable
              perKey={PerKey}
              currentProjectId={currentProjectId}
              currentModuleId={currentModuleId}
            />
          </Panel>
        </Group>
      </ProCard>
    </>
  );
};

export default Index;
