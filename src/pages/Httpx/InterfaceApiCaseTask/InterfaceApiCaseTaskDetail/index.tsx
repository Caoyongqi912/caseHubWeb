import {
  executeTask,
  getApiTaskBaseDetail,
  updateApiTaskBaseInfo,
} from '@/api/inter/interTask';
import MyTabs from '@/components/MyTabs';
import AssociationApis from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationApis';
import AssociationCases from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationCases';
import InterfaceTaskBaseForm from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/InterfaceTaskBaseForm';
import RunConfig from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/RunConfig';
import InterfaceApiTaskResultTable from '@/pages/Httpx/InterfaceApiTaskResult/InterfaceApiTaskResultTable';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { useParams } from '@@/exports';
import {
  CloseOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  FloatButton,
  Form,
  message,
  Space,
  TabsProps,
  theme,
} from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const Index: FC = () => {
  const { taskId, projectId } = useParams<{
    taskId: string;
    projectId: string;
  }>();
  const { token } = theme.useToken();
  const [form] = Form.useForm<IInterfaceAPITask>();

  const [runningEnvId, setRunningEnvId] = useState<number>();
  const [runningOption, setRunningOption] = useState<string[]>([]);
  const [runningLoading, setRunningLoading] = useState(false);
  const [isRunConfigVisible, setIsRunConfigVisible] = useState(false);
  const [activeKey, setActiveKey] = useState('2');

  useEffect(() => {
    if (taskId) {
      getApiTaskBaseDetail(parseInt(taskId)).then(async ({ code, data }) => {
        if (code === 0) {
          form.setFieldsValue(data);
        }
      });
    }
  }, [taskId]);

  const onOptionChange = (value: string[]) => {
    setRunningOption(value);
  };

  const onEnvChange = (value: number) => {
    setRunningEnvId(value);
  };

  const runTask = async () => {
    if (!runningEnvId) {
      message.error('请选择环境');
      return;
    }
    if (runningOption.length == 0) {
      message.error('请选择用例执行模式');
      return;
    }
    setRunningLoading(true);
    if (taskId) {
      const { code, msg } = await executeTask({
        task_id: taskId,
        env_id: runningEnvId,
        options: runningOption,
      });
      if (code === 0) {
        setRunningLoading(false);
        message.success(msg);
        setIsRunConfigVisible(false);
        setActiveKey('3');
      }
    }
  };

  const updateBaseInfo = async () => {
    if (taskId) {
      const values = await form.validateFields();
      const { code, msg } = await updateApiTaskBaseInfo({
        ...values,
        id: parseInt(taskId),
      });
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
        height: '48px',
        borderRadius: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: '0 2px 12px rgba(102, 126, 234, 0.3)',
        fontSize: '15px',
        fontWeight: 600,
        width: '100%',
      }}
    >
      <Space>
        <PlayCircleOutlined style={{ fontSize: '18px' }} />
        <span style={{ fontWeight: 600 }}>开始运行</span>
      </Space>
    </Button>
  );

  const TabItem: TabsProps['items'] = useMemo(
    () => [
      {
        key: '0',
        label: '基本信息',
        children: (
          <ProCard
            extra={
              <Button type={'primary'} onClick={updateBaseInfo}>
                保存
              </Button>
            }
          >
            <ProForm submitter={false} form={form}>
              <InterfaceTaskBaseForm />
            </ProForm>
          </ProCard>
        ),
      },
      {
        key: '1',
        label: '关联接口用例',
        children: (
          <AssociationApis
            currentTaskId={taskId}
            currentProjectId={parseInt(projectId!)}
          />
        ),
      },
      {
        key: '2',
        label: '关联业务流',
        children: (
          <AssociationCases
            currentTaskId={taskId}
            currentProjectId={parseInt(projectId!)}
          />
        ),
      },
      {
        key: '3',
        label: '执行历史',
        children: <InterfaceApiTaskResultTable apiCaseTaskId={taskId} />,
      },
    ],
    [taskId, projectId, form],
  );

  return (
    <>
      <Drawer
        title={
          <Space>
            <ThunderboltOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontWeight: 600 }}>运行配置</span>
          </Space>
        }
        placement="right"
        width={400}
        open={isRunConfigVisible}
        onClose={() => setIsRunConfigVisible(false)}
        closable={true}
        closeIcon={<CloseOutlined />}
        styles={{
          body: { padding: 0 },
          header: {
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '16px 24px',
          },
        }}
        style={{
          background: token.colorBgContainer,
        }}
      >
        <RunConfig
          runArea={RUN}
          setRunningOption={onOptionChange}
          currentProjectId={projectId}
          onEnvChange={onEnvChange}
        />
      </Drawer>

      <div
        style={{
          height: '100vh',
          overflow: 'hidden',
          background: token.colorBgLayout,
          position: 'relative',
        }}
      >
        <ProCard
          style={{ height: '100%' }}
          bodyStyle={{ height: '100%', padding: 16, overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '0 16px',
            }}
          >
            <div style={{ flex: 1 }} />
            <Button
              type="primary"
              icon={<PlayCircleOutlined style={{ fontSize: 14 }} />}
              onClick={() => setIsRunConfigVisible(true)}
              style={{
                height: 32,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(102, 126, 234, 0.3)';
              }}
            >
              运行配置
            </Button>
          </div>
          <MyTabs defaultActiveKey={activeKey} items={TabItem} />
        </ProCard>

        <FloatButton.BackTop
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            right: 24,
            bottom: 24,
          }}
        />
      </div>
    </>
  );
};

export default Index;
