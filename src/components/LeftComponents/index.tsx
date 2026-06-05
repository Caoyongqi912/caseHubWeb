import { IProject } from '@/api';
import { queryProject } from '@/api/base';
import { useGlassStyles } from '@/components/Glass';
import EmptyProject from '@/components/LeftComponents/EmptyProject';
import ModuleTree from '@/components/LeftComponents/ModuleTree';
import ProjectSelect from '@/components/LeftComponents/ProjectSelect';
import { ProCard } from '@ant-design/pro-components';
import { Space } from 'antd';
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
}

const Index: FC<SelfProps> = (props) => {
  const {
    currentProjectId,
    moduleType,
    onProjectChange,
    onModuleChange,
    reloadKey,
  } = props;
  const styles = useGlassStyles();
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
    <ProCard
      style={{
        height: '100%',
        borderRadius: '12px',
        background: styles.colors.glass,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${styles.colors.glassBorder}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          padding: 12,
          flex: 1,
          overflow: 'auto',
        },
      }}
    >
      {projects.length > 0 ? (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <ProjectSelect
            projects={projects}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
          />
          <ModuleTree
            moduleType={moduleType}
            onModuleChange={onModuleChange}
            currentProjectId={currentProjectId}
            // 透传刷新触发器：reloadKey 变化时 ModuleTree 重新拉取目录
            reloadKey={reloadKey}
          />
        </Space>
      ) : (
        <EmptyProject />
      )}
    </ProCard>
  );
};

export default Index;
