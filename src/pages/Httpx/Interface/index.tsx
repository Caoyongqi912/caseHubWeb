import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import GroupApiTable from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiTable';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import InterfaceApiUpload from '@/pages/Httpx/Interface/InterfaceApiUpload';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
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
              moduleType={ModuleEnum.API}
              currentProjectId={currentProjectId}
              onProjectChange={onProjectChange}
              onModuleChange={onModuleChange}
            />
          </Panel>
          <Panel defaultSize={80} minSize={30}>
            <ProCard
              bodyStyle={{ padding: 0 }}
              tabs={{
                type: 'card',
                items: tabItems,
              }}
            />
          </Panel>
        </Group>
      </ProCard>
    </>
  );
};

export default Index;
