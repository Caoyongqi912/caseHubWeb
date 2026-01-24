import LeftComponents from '@/components/LeftComponents';
import MyTabs from '@/components/MyTabs';
import CaseDataTable from '@/pages/CaseHub/CaseDataBase/CaseDataTable';
import MindMap from '@/pages/CaseHub/MindMap';
import RequirementTable from '@/pages/CaseHub/Requirement/RequirementTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();

  const PerKeyRequirement = 'Requirement';
  const PerKeyCaseDataSource = 'CaseDataSource';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  const items = [
    {
      key: '1',
      label: '需求表',
      children: (
        <RequirementTable
          perKey={PerKeyRequirement}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
        />
      ),
    },
    {
      key: '2',
      label: '用例库',
      children: (
        <CaseDataTable
          perKey={PerKeyCaseDataSource}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
        />
      ),
    },
    {
      key: '3',
      label: '脑图',
      children: <MindMap />,
    },
  ];
  return (
    <ProCard
      style={{ height: '100vh' }}
      bodyStyle={{ padding: 0 }}
      bordered={false}
    >
      <Splitter>
        <Splitter.Panel
          collapsible={true}
          defaultSize="20%"
          min="10%"
          max="30%"
          style={{ height: '100vh' }}
        >
          <LeftComponents
            moduleType={ModuleEnum.CASE}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Splitter.Panel>
        <Splitter.Panel>
          <ProCard>
            <MyTabs defaultActiveKey={'1'} items={items} tabPosition={'top'} />
          </ProCard>
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
