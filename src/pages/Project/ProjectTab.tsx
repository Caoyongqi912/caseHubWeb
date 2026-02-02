import MyTabs from '@/components/MyTabs';
import Db from '@/pages/Project/Db';
import Env from '@/pages/Project/Env';
import GlobalVariables from '@/pages/Project/GlobalVariables';
import Push from '@/pages/Project/Push';
import { Card } from 'antd';
import { useParams } from 'umi';

const ProjectTab = () => {
  const { projectId } = useParams<{ projectId: string }>();

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
      label: '推送',
      key: '3',
      children: <Push projectId={projectId} />,
    },
    {
      label: '变量',
      key: '4',
      children: <GlobalVariables projectId={projectId} />,
    },
  ];

  return (
    <Card
      style={{
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
      }}
      bodyStyle={{
        padding: 0,
        borderRadius: '8px',
      }}
    >
      <MyTabs
        defaultActiveKey={'2'}
        items={items}
        size="middle"
        style={{
          borderRadius: '8px',
        }}
      />
    </Card>
  );
};

export default ProjectTab;
