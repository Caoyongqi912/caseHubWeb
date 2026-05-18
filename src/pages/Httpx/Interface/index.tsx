import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import PageContentWrapper from '@/components/PageContent/PageContentWrapper';
import GroupApiTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiTable';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import InterfaceApiUpload from '@/pages/Httpx/Interface/InterfaceApiUpload';
import { ModuleEnum } from '@/utils/config';
import { Tabs, TabsProps } from 'antd';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';

const Index = () => {
  const styles = useGlassStyles();

  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceApi';
  const PerGroupKey = 'InterfaceGroupApi';

  const tabItems: TabsProps['items'] = [
    {
      key: 'api',
      label: '单接口用例',
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
      label: '用例组',
      children: (
        <GroupApiTable
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          perKey={PerGroupKey}
        />
      ),
    },
    {
      key: 'upload',
      label: '批量上传',
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
    <PageContentWrapper title={false}>
      <div
        style={{
          height: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            marginBottom: 16,
            borderRadius: '16px',
            background: styles.colors.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${styles.colors.glassBorder}`,
            boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
            overflow: 'hidden',
          }}
        >
          <Group orientation="horizontal" style={{ height: '100%' }}>
            <Panel
              defaultSize={20}
              minSize={10}
              collapsible={true}
              style={{ height: '100%' }}
            >
              <LeftComponents
                moduleType={ModuleEnum.API}
                currentProjectId={currentProjectId}
                onProjectChange={onProjectChange}
                onModuleChange={onModuleChange}
              />
            </Panel>
            <Panel defaultSize={80} minSize={30} style={{ height: '100%' }}>
              <div style={{ height: '100%' }}>
                <Tabs type="card" items={tabItems} defaultActiveKey="api" />
              </div>
            </Panel>
          </Group>
        </div>
      </div>
    </PageContentWrapper>
  );
};

export default Index;
