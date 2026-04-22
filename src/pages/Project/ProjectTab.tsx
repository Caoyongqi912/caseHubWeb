import { GlassBackground, useGlassStyles } from '@/components/Glass';
import MyTabs from '@/components/MyTabs';
import Db from '@/pages/Project/Db';
import Env from '@/pages/Project/Env';
import GlobalVariables from '@/pages/Project/GlobalVariables';
import ProjectUser from '@/pages/Project/ProjectUser';
import { ProCard } from '@ant-design/pro-components';
import { useParams } from 'umi';

const ProjectTab = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const styles = useGlassStyles();

  const items = [
    {
      label: 'DB',
      key: '1',
      children: <Db projectId={projectId} />,
    },
    {
      label: '环境',
      key: '2',
      children: <Env projectId={projectId} />,
    },
    {
      label: '成员',
      key: '3',
      children: <ProjectUser projectId={projectId} />,
    },
    {
      label: '变量',
      key: '4',
      children: <GlobalVariables projectId={projectId} />,
    },
  ];

  return (
    <GlassBackground
      glowOrbConfigs={[
        {
          color: styles.colors.primary,
          size: 500,
          top: '-5%',
          left: '-5%',
          animationDuration: '8s',
        },
        {
          color: styles.colors.success,
          size: 400,
          top: '65%',
          left: '75%',
          animationDuration: '10s',
        },
        {
          color: '#13c2c2',
          size: 350,
          top: '35%',
          left: '85%',
          animationDuration: '12s',
        },
      ]}
    >
      <ProCard
        style={{
          width: '100%',
          borderRadius: '16px',
          background: styles.colors.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${styles.colors.glassBorder}`,
          boxShadow: `0 8px 32px ${styles.colors.primaryGlow}20`,
        }}
        bodyStyle={{
          padding: 0,
          background: 'transparent',
          borderRadius: '16px',
        }}
      >
        <MyTabs
          defaultActiveKey={'3'}
          items={items}
          size="middle"
          style={{
            borderRadius: '16px',
          }}
        />
      </ProCard>
    </GlassBackground>
  );
};

export default ProjectTab;
