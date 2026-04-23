import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import InterfaceApiCaseTaskTable from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';

const Index = () => {
  const styles = useGlassStyles();

  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceTask';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <>
      <ProCard
        style={{
          marginBottom: 24,
          borderRadius: '16px',
          background: styles.colors.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${styles.colors.glassBorder}`,
          boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
        }}
        bodyStyle={{
          height: '100%',
          minHeight: '90vh',
          padding: 0,
          overflow: 'hidden',
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
      </ProCard>
    </>
  );
};

export default Index;
