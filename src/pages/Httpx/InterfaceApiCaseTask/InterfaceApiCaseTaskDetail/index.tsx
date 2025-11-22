import { executeTask } from '@/api/inter/interTask';
import MyTabs from '@/components/MyTabs';
import AssociationApis from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationApis';
import AssociationCases from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationCases';
import RunConfig from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/RunConfig';
import { useParams } from '@@/exports';
import { PlayCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, FloatButton, message, Space, Splitter } from 'antd';
import { debounce } from 'lodash';
import RcResizeObserver from 'rc-resize-observer';
import { useCallback, useState } from 'react';

const Index = () => {
  const { taskId, projectId } = useParams<{
    taskId: string;
    projectId: string;
  }>();

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

  const TabItem = [
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
        <ProCard bodyStyle={{ height: '100%', padding: '10px' }}>
          <>
            <ProCard
              style={{ height: '100%' }}
              bodyStyle={{
                height: '100%',
                padding: '10px',
                minHeight: '100vh',
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
          </>

          <FloatButton.BackTop />
        </ProCard>
        {/*<ProCard*/}
        {/*  title={'调试历史'}*/}
        {/*  headerBordered*/}
        {/*  boxShadow*/}
        {/*  style={{ marginTop: 20 }}*/}
        {/*>*/}
        {/*  <InterfaceApiTaskResultTable apiCaseTaskId={taskId} />*/}
        {/*</ProCard>*/}
      </RcResizeObserver>
    </>
  );
};

export default Index;
