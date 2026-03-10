import { IProject } from '@/api';
import { queryProject } from '@/api/base';
import EmptyProject from '@/components/LeftComponents/EmptyProject';
import ModuleTree from '@/components/LeftComponents/ModuleTree';
import ProjectSelect from '@/components/LeftComponents/ProjectSelect';
import { ProCard } from '@ant-design/pro-components';
import { Space, theme } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  borderRadius,
  responsive,
  shadows,
  spacing,
  styleHelpers,
} from './styles';

const { useToken } = theme;

interface SelfProps {
  currentProjectId?: number;
  moduleType: number;
  onProjectChange: (projectId: number | undefined) => void;
  onModuleChange: (moduleId: number) => void;
}

const Index: FC<SelfProps> = (props) => {
  const { currentProjectId, moduleType, onProjectChange, onModuleChange } =
    props;
  const [projects, setProjects] = useState<IProject[]>([]);
  const { token } = useToken();

  const styles = useMemo(
    () => ({
      container: {
        height: 'auto',
        width: '100%',
        borderRadius: borderRadius.xl,
        boxShadow: shadows.card,
        background: token.colorBgContainer,
        ...styleHelpers.transition(['box-shadow']),
        overflow: 'hidden',
        position: 'relative' as const,
      },
      body: {
        minHeight: '80vh',
        padding: spacing.md,
        [responsive.mobile]: {
          padding: spacing.sm,
        },
      },
      decorativeCircle: {
        position: 'absolute' as const,
        borderRadius: '50%',
        pointerEvents: 'none' as const,
      },
    }),
    [token],
  );

  useEffect(() => {
    queryProject().then(async ({ data }) => {
      if (data && data.length > 0) {
        setProjects(data);
        onProjectChange(data[0].id);
      }
    });
  }, []);

  return (
    <ProCard style={styles.container} bodyStyle={styles.body}>
      <div
        style={{
          ...styles.decorativeCircle,
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${token.colorPrimaryBg} 0%, transparent 70%)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          ...styles.decorativeCircle,
          bottom: '20%',
          left: -30,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${token.colorInfoBg} 0%, transparent 70%)`,
          opacity: 0.4,
        }}
      />

      {projects.length > 0 ? (
        <Space
          direction={'vertical'}
          size={spacing.md}
          style={{ width: '100%', position: 'relative', zIndex: 1 }}
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
          />
        </Space>
      ) : (
        <EmptyProject />
      )}
    </ProCard>
  );
};

export default Index;
