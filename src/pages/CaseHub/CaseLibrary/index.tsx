import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import CaseDataTable from './CaseDataTable';

const Index = () => {
  const styles = useGlassStyles();
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
    <PageContainer
      title={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 8px)',
        overflow: 'hidden',
        padding: 0,
        marginBottom: 24,
        borderRadius: '16px',
        background: styles.colors.glass,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${styles.colors.glassBorder}`,
      }}
    >
      <Group orientation="horizontal">
        <Panel defaultSize={20} minSize={10} collapsible={true}>
          <LeftComponents
            moduleType={ModuleEnum.CASE}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30} style={{ height: '100' }}>
          <CaseDataTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
          />
        </Panel>
      </Group>
    </PageContainer>
  );
};

export default Index;
