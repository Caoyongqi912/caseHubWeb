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
import { PlayCircleOutlined } from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { Button, FloatButton, Form, message, Space, Splitter } from 'antd';
import { debounce } from 'lodash';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useEffect, useState } from 'react';

const Index = () => {
  const { taskId, projectId } = useParams<{
    taskId: string;
    projectId: string;
  }>();
  const [form] = Form.useForm<IInterfaceAPITask>();

  const [runningEnvId, setRunningEnvId] = useState<number>();
  const [runningOption, setRunningOption] = useState<string[]>([]);
  const [defaultSize, setDefaultSize] = useState('80%');
  const [runningLoading, setRunningLoading] = useState(false);
  const handleResize = useCallback(
    debounce(({ width }) => {
      console.log('=====', width);
      const breakpoints = [
        { max: 768, size: '80%' }, // 平板及以下
        { max: 1024, size: '80%' }, // 小笔记本
        { max: 1440, size: '83%' }, // 普通显示器
        { max: 1920, size: '88%' }, // 1K显示器
        { max: 2560, size: '90%' }, // 2K显示器
        { max: Infinity, size: '95%' }, // 4K+显示器
      ];

      const breakpoint = breakpoints.find((bp) => width <= bp.max);
      console.log(breakpoint?.size);
      setDefaultSize(breakpoint?.size || '80%');
    }, 100),
    [],
  );

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
  const TabItem = [
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
      label: '关联API用例',
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
  ];

  const RUN = (
    <Button
      type="primary"
      size="large"
      onClick={runTask}
      loading={runningLoading}
      style={{
        height: '48px',
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
      <RcResizeObserver onResize={handleResize}>
        <ProCard
          style={{ height: '100%' }}
          bodyStyle={{
            height: '100%',
            padding: 0,
            minHeight: '90vh',
            overflow: 'hidden',
          }}
        >
          <Splitter
            style={{
              height: '100%',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Splitter.Panel resizable={false} size={defaultSize} max="100%">
              <MyTabs defaultActiveKey={'2'} items={TabItem} />
            </Splitter.Panel>
            <Splitter.Panel resizable={false}>
              <RunConfig
                runArea={RUN}
                setRunningOption={onOptionChange}
                currentProjectId={projectId}
                onEnvChange={onEnvChange}
              />
            </Splitter.Panel>
          </Splitter>
        </ProCard>

        <FloatButton.BackTop />
      </RcResizeObserver>
    </>
  );
};

export default Index;
