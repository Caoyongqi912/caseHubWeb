import { useGlassStyles } from '@/components/Glass';
import LeftComponents from '@/components/LeftComponents';
import PageContentWrapper from '@/components/PageContent/PageContentWrapper';
import InterfaceApiTable from '@/pages/Httpx/Interface/InterfaceApiTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import GroupApiTable from './interfaceApiGroup/GroupApiTable';
import InterfaceApiUpload from './InterfaceApiUpload';

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
        <div
          key={'api'}
          style={{
            height: '100%',
            display: 'block',
          }}
        >
          <InterfaceApiTable
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
            perKey={PerKey}
          />
        </div>
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
    <PageContentWrapper
      title={false}
      style={{
        height: '100%', // 🔥 改成 100%，不要用 100vh
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        padding: '12px',
        gap: '12px',
      }}
    >
      {/* 拖拽面板：全屏填满 */}
      <Group
        orientation="horizontal"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* 左侧面板 */}
        <Panel
          defaultSize={20}
          minSize={10}
          collapsible
          style={{ height: '100%' }}
        >
          <LeftComponents
            moduleType={ModuleEnum.API}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
          />
        </Panel>

        {/* 右侧面板 */}
        <Panel defaultSize={80} minSize={30} style={{ height: '100%' }}>
          {/* Tabs 头部 */}
          <ProCard
            tabs={{ type: 'card', items: tabItems, defaultActiveKey: 'api' }}
          />
        </Panel>
      </Group>
    </PageContentWrapper>
  );
};

export default Index;
