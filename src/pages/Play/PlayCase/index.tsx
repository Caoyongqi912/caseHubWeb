import LeftComponents from '@/components/LeftComponents';
import PlayCaseTable from '@/pages/Play/PlayCase/PlayCaseTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'PlayCase';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <ProCard ghost={true}>
      <Group orientation="horizontal">
        <Panel defaultSize={20} minSize={10} collapsible={true}>
          <LeftComponents
            moduleType={ModuleEnum.UI_CASE}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30}>
          <PlayCaseTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
          />
        </Panel>
      </Group>
    </ProCard>
  );
};

export default Index;
