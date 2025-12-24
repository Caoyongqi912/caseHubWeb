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
        style={{ height: 'auto' }}
        bodyStyle={{
          height: 'auto',
          minHeight: '100vh',
          padding: '16px',
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
              moduleType={ModuleEnum.JOB}
              onProjectChange={onProjectChange}
              onModuleChange={onModuleChange}
              currentProjectId={currentProjectId}
            />
          </Splitter.Panel>
          <Splitter.Panel size={sizes[1]} min={'60%'}>
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
