import { getPlanInfo, getPlanModules } from '@/api/case/caseplan';
import { useGlassStyles } from '@/components/Glass';
import { ICasePlan, IPlanModule } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Splitter } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import PlanCaseList from './PlanCaseList';
import PlanModule from './PlanModule';

interface Props {
  /** 测试计划 ID */
  planId?: string;
}

/**
 * 计划用例主容器组件
 * 左侧展示目录树，右侧展示用例列表
 */
const Index: FC<Props> = ({ planId }) => {
  const styles = useGlassStyles();
  /** 计划详情数据 */
  const [planInfo, setPlanInfo] = useState<ICasePlan>();
  /** 计划模块列表 */
  const [planModules, setPlanModules] = useState<IPlanModule[]>([]);
  /** 当前选中的模块 ID */
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  /** 获取计划模块列表 */
  const fetchPlanModules = useCallback(() => {
    if (!planId) return;
    getPlanModules(Number(planId)).then(({ code, data }) => {
      if (code === 0) {
        setPlanModules(data || []);
      }
    });
  }, [planId]);

  /** 初始化数据 */
  useEffect(() => {
    if (!planId) {
      return;
    }
    getPlanInfo(Number(planId)).then(({ code, data }) => {
      if (code === 0) {
        setPlanInfo(data);
      }
    });
    fetchPlanModules();
  }, [planId, fetchPlanModules]);

  /** 处理模块选中变化 */
  const handleModuleSelect = useCallback((moduleId: number | null) => {
    setSelectedModuleId(moduleId);
  }, []);

  return (
    <ProCard
      bordered
      bodyStyle={{
        height: '100%',
        minHeight: '90vh',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Splitter style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Splitter.Panel
          defaultSize={'20%'}
          max={'20%'}
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
          collapsible={{ start: true, end: true, showCollapsibleIcon: true }}
        >
          <PlanCaseList planId={planId} moduleId={selectedModuleId} />
        </Splitter.Panel>
      </Splitter>
    </ProCard>
  );
};

export default Index;
