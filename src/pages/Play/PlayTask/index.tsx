import LeftComponents from '@/components/LeftComponents';
import PlayTaskTable from '@/pages/Play/PlayTask/PlayTaskTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'PlayTask';
  const PerKeySplitter = ' PlayTask:Splitter';

  const [sizes, setSizes] = useState<(number | string)[]>(['20%', '80%']);
  useEffect(() => {
    const data = getSplitter(PerKeySplitter);
    if (data) {
      setSizes([data.left, data.right]);
    }
  }, []);
  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  return (
    <ProCard
      bordered={true}
      style={{ height: '100vh' }}
      bodyStyle={{ height: 'auto', padding: 0 }}
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
          collapsible={true}
          resizable={true}
          style={{
            height: '100%',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          size={sizes[0]}
          min={0}
          max={600}
        >
          <LeftComponents
            moduleType={ModuleEnum.UI_TASK}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Splitter.Panel>
        <Splitter.Panel
          collapsible={true}
          resizable={true}
          size={sizes[1]}
          style={{
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
          }}
        >
          <PlayTaskTable
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
