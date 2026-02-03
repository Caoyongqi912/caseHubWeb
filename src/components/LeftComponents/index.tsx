import { IProject } from '@/api';
import { queryProject } from '@/api/base';
import EmptyProject from '@/components/LeftComponents/EmptyProject';
import ModuleTree from '@/components/LeftComponents/ModuleTree';
import ProjectSelect from '@/components/LeftComponents/ProjectSelect';
import { ProCard } from '@ant-design/pro-components';
import { Space, theme } from 'antd';
import { FC, useEffect, useState } from 'react';
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

  useEffect(() => {
    queryProject().then(async ({ data }) => {
      if (data && data.length > 0) {
        setProjects(data);
        onProjectChange(data[0].id);
      }
    });
  }, []);

  return (
    <ProCard
      style={{
        height: 'auto',
        width: '100%',
        borderRadius: borderRadius.xl,
        boxShadow: shadows.card,
        background: token.colorBgContainer,
        ...styleHelpers.transition(['box-shadow']),
      }}
      bodyStyle={{
        minHeight: '80vh',
        padding: spacing.md,
        [responsive.mobile]: {
          padding: spacing.sm,
        },
      }}
    >
      {projects.length > 0 ? (
        <Space
          direction={'vertical'}
          size={spacing.md}
          style={{ width: '100%' }}
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
