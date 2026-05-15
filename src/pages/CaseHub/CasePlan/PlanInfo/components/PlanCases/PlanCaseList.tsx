import { FC } from 'react';

interface PlanCaseListProps {
  /** 测试计划 ID */
  planId?: string;
  /** 当前选中的模块 ID，null 表示全部用例 */
  moduleId?: number | null;
}

/**
 * 计划用例列表组件
 * 展示指定目录下的用例列表
 */
const Index: FC<PlanCaseListProps> = ({ planId, moduleId }) => {
  return (
    <div>
      用例列表区域 - planId: {planId}, moduleId: {moduleId}
    </div>
  );
};

export default Index;
