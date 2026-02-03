import MyTabs from '@/components/MyTabs';
import Db from '@/pages/Project/Db';
import Env from '@/pages/Project/Env';
import GlobalVariables from '@/pages/Project/GlobalVariables';
import {
  DatabaseOutlined,
  EnvironmentOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { useParams } from 'umi';

/**
 * 项目详情Tab页面组件
 * 用于展示项目的数据库配置、环境配置、推送配置和全局变量
 */
const ProjectTab = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const items = [
    {
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <DatabaseOutlined style={{ fontSize: '16px' }} />
          <span>数据库配置</span>
        </span>
      ),
      key: '1',
      children: <Db projectId={projectId} />,
    },
    {
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '16px' }} />
          <span>环境配置</span>
        </span>
      ),
      key: '2',
      children: <Env projectId={projectId} />,
    },
    {
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <KeyOutlined style={{ fontSize: '16px' }} />
          <span>全局变量</span>
        </span>
      ),
      key: '4',
      children: <GlobalVariables projectId={projectId} />,
    },
  ];

  return (
    <ProCard
      style={{
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
        border: '1px solid #f0f0f0',
      }}
      bodyStyle={{
        padding: 0,
        borderRadius: '8px',
      }}
      headStyle={{
        borderBottom: '1px solid #f0f0f0',
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
    </ProCard>
  );
};

export default ProjectTab;
