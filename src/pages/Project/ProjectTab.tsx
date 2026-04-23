import MyTabs from '@/components/MyTabs';
import Db from '@/pages/Project/Db';
import Env from '@/pages/Project/Env';
import GlobalVariables from '@/pages/Project/GlobalVariables';
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
      label: '变量',
      key: '4',
      children: <GlobalVariables projectId={projectId} />,
    },
  ];

  return <MyTabs defaultActiveKey={'2'} items={items} size="large" />;
};

export default ProjectTab;
