import LeftComponents from '@/components/LeftComponents';
import SchedulerTable from '@/pages/Scheduler/SchedulerTable';
import { ModuleEnum } from '@/utils/config';
import { getSplitter, setSplitter } from '@/utils/token';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceTaskScheduler';
  const PerKeySplitter = 'InterfaceTaskScheduler:Splitter';
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
    <>
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
              moduleType={ModuleEnum.JOB}
              onProjectChange={onProjectChange}
              onModuleChange={onModuleChange}
              currentProjectId={currentProjectId}
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
            <SchedulerTable
              perKey={PerKey}
              currentModuleId={currentModuleId}
              currentProjectId={currentProjectId}
            />
          </Splitter.Panel>
        </Splitter>
      </ProCard>
    </>
  );
};

export default Index;
