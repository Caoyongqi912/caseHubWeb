import { getPlanModules } from '@/api/case/caseplan';
import { IPlanModule } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import PlanCaseList from './PlanCaseList';
import PlanModule from './PlanModule';

interface Props {
  planId?: string;
}

const Index: FC<Props> = ({ planId }) => {
  const [planModules, setPlanModules] = useState<IPlanModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const handleModuleSelect = useCallback((moduleId: number | null) => {
    setSelectedModuleId(moduleId);
  }, []);

  const fetchPlanModules = useCallback(() => {
    if (!planId) return;
    getPlanModules(Number(planId)).then(({ code, data }) => {
      if (code === 0) setPlanModules(data || []);
    });
  }, [planId]);

  useEffect(() => {
    fetchPlanModules();
  }, [fetchPlanModules]);

  return (
    <ProCard
      variant="outlined"
      styles={{
        body: {
          height: 'calc(100vh - 150px)',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
        },
      }}
    >
      <Splitter style={{ flex: 1, minHeight: 0, height: '100%' }}>
        <Splitter.Panel
          defaultSize="20%"
          max="20%"
          resizable={false}
          collapsible={{ start: true, end: true, showCollapsibleIcon: true }}
        >
          <PlanModule
            planModules={planModules}
            planId={planId}
            onModulesChange={fetchPlanModules}
            onSelect={handleModuleSelect}
          />
        </Splitter.Panel>
        <Splitter.Panel
          style={{ height: '100%' }}
          collapsible={{ start: true, end: true, showCollapsibleIcon: true }}
        >
          <PlanCaseList
            planId={planId}
            moduleId={selectedModuleId}
            planModules={planModules}
            onModulesRefresh={fetchPlanModules}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
