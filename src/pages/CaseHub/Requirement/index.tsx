/**
 * @file src/pages/CaseHub/Requirement/index.tsx
 * @description 需求管理页面（已弃用）
 * @deprecated 该页面暂时弃用，相关功能已迁移至其他模块
 * @author 维护者信息（如适用）
 *
 * ⚠️ 弃用说明：
 * - 本页面自 2026-06 起标记为弃用状态
 * - 如需恢复使用，请取消 routes.ts 中的注释配置
 * - 当前保留代码以备后续可能的功能恢复或重构参考
 */

import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import RequirementTable from './components/RequirementTable';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<number>();
  const PerKey = 'Requirement';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number | undefined) => {
    setCurrentModuleId(moduleId);
  };

  return (
    <div
      style={{
        height: '100%', // 🔥 改成 100%，不要用 100vh
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        padding: '12px',
        gap: '12px',
      }}
    >
      <Group
        orientation="horizontal"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Panel defaultSize={20} minSize={10} collapsible={true}>
          <LeftComponents
            moduleType={ModuleEnum.REQUIREMENT}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30}>
          <RequirementTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
          />
        </Panel>
      </Group>
    </div>
  );
};

export default Index;
