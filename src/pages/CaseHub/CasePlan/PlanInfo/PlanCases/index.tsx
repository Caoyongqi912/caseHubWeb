import { getPlanInfo, getPlanModules } from '@/api/case/caseplan';
import { ICasePlan, IPlanModule } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import PlanCaseList from './PlanCaseList';
import PlanModule from './PlanModule';

interface Props {
  planId?: string;
  planInfo?: ICasePlan;
}

const Index: FC<Props> = ({ planId, planInfo: planInfoProp }) => {
  const [planModules, setPlanModules] = useState<IPlanModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  /**
   * 自管理 planInfo: 父组件 (PlanInfo/index.tsx) 没传 planInfo 下来, 这里自己 load.
   * planInfo.project_id 会被 PlanCaseList -> PlanCaseImportModal 透传,
   * 用于预览阶段"用例库分组"硬门禁校验. 没拿到 planInfo 时, 上传/导入按钮
   * 在 PlanCaseList 里直接隐藏, 避免把无效 project_id 传给后端.
   */
  const [planInfo, setPlanInfo] = useState<ICasePlan | undefined>(planInfoProp);

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

  /**
   * 加载 plan 详情, 拿 project_id.
   * props 上的 planInfo 优先 (父组件可能已经拿好), 否则自己 fetch.
   * planId 变化时重新拉.
   */
  useEffect(() => {
    if (planInfoProp) {
      setPlanInfo(planInfoProp);
      return;
    }
    if (!planId) {
      setPlanInfo(undefined);
      return;
    }
    let cancelled = false;
    getPlanInfo(Number(planId))
      .then(({ code, data }) => {
        if (cancelled) return;
        if (code === 0 && data) {
          setPlanInfo(data);
        } else {
          setPlanInfo(undefined);
        }
      })
      .catch(() => {
        if (!cancelled) setPlanInfo(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [planId, planInfoProp]);

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
            planInfo={planInfo}
            onModulesRefresh={fetchPlanModules}
          />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
