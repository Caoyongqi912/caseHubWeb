import LeftComponents from '@/components/LeftComponents';
import PlayCommonStep from '@/pages/Play/PlayStep/PlayCommonStep';
import PlayStepGroupTable from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PlayStep = 'PlayStep';
  const PlayStepGroup = 'PlayStepGroup';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  const tabItems = [
    {
      key: 'common',
      label: (
        <span
          style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          步骤
        </span>
      ),
      children: (
        <PlayCommonStep
          currentModuleId={currentModuleId}
          currentProjectId={currentProjectId}
          perKey={PlayStep}
        />
      ),
    },
    {
      key: 'Group',
      label: (
        <span
          style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          步骤组
        </span>
      ),
      children: (
        <PlayStepGroupTable
          currentModuleId={currentModuleId}
          currentProjectId={currentProjectId}
          perKey={PlayStepGroup}
        />
      ),
    },
  ];

  return (
    <ProCard ghost={true}>
      <Group orientation="horizontal">
        <Panel defaultSize={20} minSize={10} collapsible={true}>
          <LeftComponents
            moduleType={ModuleEnum.UI_STEP}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30}>
          <ProCard
            style={{ width: '100%', height: '100%' }}
            bodyStyle={{ padding: 0 }}
            tabs={{
              type: 'card',
              items: tabItems,
            }}
          />
        </Panel>
      </Group>
    </ProCard>
  );
};

export default Index;
