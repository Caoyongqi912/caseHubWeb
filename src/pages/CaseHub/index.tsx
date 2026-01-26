import LeftComponents from '@/components/LeftComponents';
import MyTabs from '@/components/MyTabs';
import CaseDataTable from '@/pages/CaseHub/CaseDataBase/CaseDataTable';
import RequirementTable from '@/pages/CaseHub/Requirement/RequirementTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);

  const PerKeyRequirement = 'Requirement';
  const PerKeyCaseDataSource = 'CaseDataSource';
  const PerKeySplitter = 'CaseHUB:Splitter';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  useEffect(() => {
    const data = getSplitter(PerKeySplitter);
    if (data) {
      setSizes([data.left, data.right]);
    }
  }, []);
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
  ];
  return (
    <ProCard
      bodyStyle={{
        minHeight: '100vh',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
      >
        <Splitter.Panel
          collapsible={true}
          size={sizes[0]}
          style={{ height: 'auto' }}
        >
          <LeftComponents
            moduleType={ModuleEnum.CASE}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Splitter.Panel>

        <Splitter.Panel
          size={sizes[1]}
          min={'60%'}
          style={{ height: 'auto', overflow: 'auto' }}
        >
          <MyTabs defaultActiveKey={'1'} items={items} tabPosition={'top'} />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
