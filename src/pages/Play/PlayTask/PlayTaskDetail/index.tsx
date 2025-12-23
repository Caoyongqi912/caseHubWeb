import { handelExecutePlayTask } from '@/api/play/playTask';
import MyTabs from '@/components/MyTabs';
import PlayTaskResultTable from '@/pages/Play/PlayResult/PlayTaskResultTable';
import AssociationUICases from '@/pages/Play/PlayTask/PlayTaskDetail/AssociationUICases';
import { useParams } from '@@/exports';
import { PlayCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, message, Space } from 'antd';
import { useState } from 'react';

const Index = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [runningLoading, setRunningLoading] = useState(false);

  const TabItem = [
    {
      key: '1',
      label: '关联用例',
      children: <AssociationUICases currentTaskId={taskId} />,
    },
    {
      key: '3',
      label: '运行结果',
      children: <PlayTaskResultTable taskId={taskId} />,
    },
  ];

  const runTask = async () => {
    if (taskId) {
      const { code, msg } = await handelExecutePlayTask({ taskId: taskId });
      if (code === 0) {
        message.success(msg);
      }
    }
  };
  const RUN = (
    <Button
      type="primary"
      size="large"
      onClick={runTask}
      loading={runningLoading}
      style={{
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        border: 'none',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        fontSize: '16px',
        fontWeight: 600,
      }}
    >
      <Space>
        <PlayCircleOutlined style={{ fontSize: '18px' }} />
        <span style={{ fontWeight: 600 }}>开始运行</span>
      </Space>
    </Button>
  );
  return (
    <>
      <ProCard bodyStyle={{ minHeight: '100vh', padding: '10px' }}>
        <MyTabs
          defaultActiveKey={'1'}
          items={TabItem}
          tabBarExtraContent={RUN}
        />
      </ProCard>
    </>
  );
};

export default Index;
