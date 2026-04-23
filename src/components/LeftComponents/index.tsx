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
  onModuleChange: (moduleId: number) => void;
}

const Index: FC<SelfProps> = (props) => {
  const { currentProjectId, moduleType, onProjectChange, onModuleChange } =
    props;
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
      }}
      bodyStyle={{
        padding: 12,
        height: '100%',
        overflow: 'auto',
      }}
    >
      {projects.length > 0 ? (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <ProjectSelect
            projects={projects}
            currentProjectId={currentProjectId}
            onProjectChange={onProjectChange}
          />
          <ModuleTree
            moduleType={moduleType}
            onModuleChange={onModuleChange}
            currentProjectId={currentProjectId}
          />
        </Space>
      ) : (
        <EmptyProject />
      )}
    </ProCard>
  );
};

export default Index;
