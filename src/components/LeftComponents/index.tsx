import { IModule, IProject } from '@/api';
import { queryProject } from '@/api/base';
import EmptyProject from '@/components/LeftComponents/EmptyProject';
import ModuleTree from '@/components/LeftComponents/ModuleTree';
import ProjectSelect from '@/components/LeftComponents/ProjectSelect';
import { theme } from 'antd';
import { FC, useEffect, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  moduleType: number;
  onProjectChange: (projectId: number | undefined) => void;
  onModuleChange: (moduleId: number | undefined) => void;
  /**
   * 模块目录树刷新触发器
   * 通常由父级传入一个递增的 number，每次变化时通知 ModuleTree 重新拉取目录
   * 用于在跨组件的写操作（用例上传/导入等）完成后联动刷新左侧目录
   * 不传则 ModuleTree 只在 currentProjectId/moduleType 变化时刷新（兼容历史用法）
   */
  reloadKey?: number;
  /** 透传到 ModuleTree: 树数据变更时回调,供右侧表格等消费方同步 */
  onModulesLoaded?: (modules: IModule[]) => void;
}

const { useToken } = theme;

const Index: FC<SelfProps> = (props) => {
  const {
    currentProjectId,
    moduleType,
    onProjectChange,
    onModuleChange,
    reloadKey,
    onModulesLoaded,
  } = props;
  const { token } = useToken();
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    let isMounted = true;
    queryProject().then(({ data }) => {
      if (isMounted && data && data.length > 0) {
        setProjects(data);
        onProjectChange(data[0].id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
      }}
    >
      {projects.length > 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '16px 12px',
            overflow: 'auto',
          }}
        >
          <ProjectSelect
            projects={projects}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
          />
          <ModuleTree
            moduleType={moduleType}
            onModuleChange={onModuleChange}
            currentProjectId={currentProjectId}
            reloadKey={reloadKey}
            onModulesLoaded={onModulesLoaded}
          />
        </div>
      ) : (
        <EmptyProject />
      )}
    </div>
  );
};

export default Index;
