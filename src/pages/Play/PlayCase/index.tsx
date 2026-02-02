import LeftComponents from '@/components/LeftComponents';
import PlayCaseTable from '@/pages/Play/PlayCase/PlayCaseTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'PlayCase';
  const PerKeySplitter = ' PlayCase:Splitter';

  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);

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
  return (
    <ProCard
      style={{ height: 'auto' }}
      bodyStyle={{
        height: '100%',
        minHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Splitter
        onResize={(sizes: number[]) => {
          setSizes(sizes);
          setSplitter(PerKeySplitter, sizes[0], sizes[1]);
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
        layout="horizontal"
      >
        <Splitter.Panel
          resizable={true}
          collapsible={true}
          style={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          size={sizes[0]}
          min={0}
          max={600}
        >
          <LeftComponents
            moduleType={ModuleEnum.UI_CASE}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
            onModuleChange={onModuleChange}
          />
        </Splitter.Panel>
        <Splitter.Panel
          resizable={true}
          size={sizes[1]}
          style={{
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
          }}
        >
          <PlayCaseTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
