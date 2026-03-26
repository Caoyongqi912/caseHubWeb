import LeftComponents from '@/components/LeftComponents';
import MyTabs from '@/components/MyTabs';
import CaseDataTable from '@/pages/CaseHub/CaseDataBase/CaseDataTable';
import RequirementTable from '@/pages/CaseHub/Requirement/RequirementTable';
import { useCaseHubIndexStyles, useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);
  const styles = useCaseHubIndexStyles();
  const { colors } = useCaseHubTheme();

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
      label: (
        <span style={{ fontWeight: 500, padding: '4px 12px' }}>需求表</span>
      ),
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
      label: (
        <span style={{ fontWeight: 500, padding: '4px 12px' }}>用例库</span>
      ),
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
      style={styles.containerStyle()}
      bodyStyle={{ minHeight: '100vh', padding: 0, overflow: 'hidden' }}
    >
      <style>{`
        .case-hub-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(ellipse at 20% 20%, ${colors.primaryBg}30 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, ${colors.infoBg}30 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>
      <div className="case-hub-background" />
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={styles.splitterStyle()}
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
