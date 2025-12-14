import LeftComponents from '@/components/LeftComponents';
import SchedulerTable from '@/pages/Httpx/Scheduler/SchedulerTable';
import { ModuleEnum } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { useState } from 'react';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'InterfaceTaskScheduler';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number) => {
    setCurrentModuleId(moduleId);
  };
  return (
    <>
      <ProCard
        bordered={true}
        style={{ height: 'auto' }}
        bodyStyle={{ height: 'auto', padding: 0 }}
      >
        <Splitter>
          <Splitter.Panel
            collapsible={true}
            defaultSize="15%"
            min="10%"
            max="30%"
            style={{ height: 'auto' }}
          >
            <LeftComponents
              moduleType={ModuleEnum.JOB}
              onProjectChange={onProjectChange}
              onModuleChange={onModuleChange}
              currentProjectId={currentProjectId}
            />
          </Splitter.Panel>
          <Splitter.Panel>
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
