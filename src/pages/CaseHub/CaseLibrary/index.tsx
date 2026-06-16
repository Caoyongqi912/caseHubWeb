import LeftComponents from '@/components/LeftComponents';
import { ModuleEnum } from '@/utils/config';
import { useCallback, useState } from 'react';
import { Group, Panel } from 'react-resizable-panels';
import CaseDataTable from './CaseDataTable';

const Index = () => {
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<
    number | undefined
  >();
  /**
   * 模块目录树刷新计数
   * 每次上传/导入用例成功后将计数 +1，触发 LeftComponents / ModuleTree
   * 重新拉取目录（useEffect 依赖 reloadKey）。
   * 用计数而非 boolean 是为了在 useEffect 依赖比较中确保引用变化，
   * 避免 React 浅比较跳过更新。
   */
  const [moduleReloadKey, setModuleReloadKey] = useState<number>(0);

  const PerKey = 'TEST_CASE';

  const onProjectChange = (projectId: number | undefined) => {
    setCurrentProjectId(projectId);
  };

  const onModuleChange = (moduleId: number | undefined) => {
    setCurrentModuleId(moduleId);
  };

  /**
   * 上传/导入成功后由 CaseDataTable 内部（UploadCaseModal.onModuleRefresh）触发
   * 递增 reloadKey，通知左侧 ModuleTree 重新加载目录
   */
  const handleModuleRefresh = useCallback(() => {
    setModuleReloadKey((prev) => prev + 1);
  }, []);

  return (
    <div
      style={{
        height: '90vh',
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
            moduleType={ModuleEnum.CASE}
            currentProjectId={currentProjectId}
            onModuleChange={onModuleChange}
            onProjectChange={onProjectChange}
            // 触发左侧模块目录树刷新：上传/导入用例成功后递增
            reloadKey={moduleReloadKey}
          />
        </Panel>
        <Panel defaultSize={80} minSize={30} style={{ height: '100%' }}>
          <CaseDataTable
            perKey={PerKey}
            currentProjectId={currentProjectId}
            currentModuleId={currentModuleId}
            // 提交导入成功后，递增父级 reloadKey，联动刷新左侧目录
            onModuleRefresh={handleModuleRefresh}
          />
        </Panel>
      </Group>
    </div>
  );
};

export default Index;
