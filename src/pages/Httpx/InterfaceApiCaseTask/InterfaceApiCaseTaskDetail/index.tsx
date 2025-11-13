import {
  executeTask,
  getApiTaskBaseDetail,
  insertApiTask,
  updateApiTaskBaseInfo,
} from '@/api/inter/interTask';
import MyTabs from '@/components/MyTabs';
import AssociationApis from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationApis';
import AssociationCases from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationCases';
import InterfaceTaskBaseForm from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/InterfaceTaskBaseForm';
import InterfaceApiTaskResultTable from '@/pages/Httpx/InterfaceApiTaskResult/InterfaceApiTaskResultTable';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { useParams } from '@@/exports';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { Button, FloatButton, Form, message } from 'antd';
import { FC, useEffect, useState } from 'react';
import { history } from 'umi';

const Index = () => {
  const { taskId, projectId, moduleId } = useParams<{
    taskId: string;
    projectId: string;
    moduleId: string;
  }>();
  const [taskForm] = Form.useForm<IInterfaceAPITask>();
  const [currentStatus, setCurrentStatus] = useState(1);
  const [editTsk, setEditTask] = useState<number>(0);

  const [currentProjectId, setCurrentProjectId] = useState<number>();

  useEffect(() => {
    if (projectId && moduleId) {
      taskForm.setFieldsValue({
        project_id: parseInt(projectId),
        module_id: parseInt(moduleId),
      });
    }
    if (projectId) {
      setCurrentProjectId(parseInt(projectId));
    }
  }, [moduleId, projectId]);

  useEffect(() => {
    if (taskId) {
      getApiTaskBaseDetail(taskId).then(async ({ code, data }) => {
        if (code === 0) {
          taskForm.setFieldsValue(data);
          setCurrentProjectId(data.project_id);
        }
      });
    } else {
      setCurrentStatus(2);
    }
  }, [editTsk]);

  const refresh = () => {
    setEditTask(editTsk + 1);
  };
  const saveTaskBase = async () => {
    await taskForm.validateFields();
    const values = await taskForm.getFieldsValue(true);
    if (taskId) {
      //回显
      const { code, msg } = await updateApiTaskBaseInfo(values);
      if (code === 0) {
        setCurrentStatus(1);
        message.success(msg);
      }
    } else {
      //新增
      const { code, data } = await insertApiTask(values);
      if (code === 0) {
        history.push(`/interface/task/detail/taskId=${data.id}`);
        message.success('添加成功');
      }
    }
  };

  const runTask = async () => {
    if (taskId) {
      const { code, msg } = await executeTask(taskId);
      if (code === 0) {
        message.success(msg);
      }
    }
  };
  const DetailExtra: FC<{ currentStatus: number }> = ({ currentStatus }) => {
    switch (currentStatus) {
      case 1:
        return (
          <div style={{ display: 'flex' }}>
            <Button onClick={runTask}>Run</Button>
            <Button
              type={'primary'}
              style={{ marginLeft: 10 }}
              onClick={() => setCurrentStatus(3)}
            >
              Edit
            </Button>
          </div>
        );
      case 2:
        return (
          <Button onClick={saveTaskBase} type={'primary'}>
            Save
          </Button>
        );
      case 3:
        return (
          <>
            <Button onClick={saveTaskBase} type={'primary'}>
              Save
            </Button>
            <Button
              style={{ marginLeft: 5 }}
              onClick={() => setCurrentStatus(1)}
            >
              Cancel
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const TabItem = [
    {
      key: '1',
      label: '关联接口',
      children: (
        <AssociationApis
          currentTaskId={taskId}
          currentProjectId={currentProjectId}
        />
      ),
    },
    {
      key: '2',
      label: '关联用例',
      children: (
        <AssociationCases
          currentTaskId={taskId}
          reload={refresh}
          currentProjectId={currentProjectId}
        />
      ),
    },
  ];

  return (
    <ProCard split={'horizontal'}>
      <ProCard
        boxShadow
        headerBordered
        subTitle={''}
        title={'项目基本信息'}
        extra={<DetailExtra currentStatus={currentStatus} />}
      >
        <ProForm
          layout={'horizontal'}
          disabled={currentStatus === 1}
          form={taskForm}
          submitter={false}
        >
          <InterfaceTaskBaseForm />
        </ProForm>
      </ProCard>
      {taskId ? (
        <>
          <ProCard
            title={'关联接口与用例'}
            headerBordered
            boxShadow
            style={{ marginTop: 20, padding: 0 }}
          >
            <MyTabs defaultActiveKey={'2'} items={TabItem} />
          </ProCard>
          <ProCard
            title={'调试历史'}
            headerBordered
            boxShadow
            style={{ marginTop: 20 }}
          >
            <InterfaceApiTaskResultTable apiCaseTaskId={taskId} />
          </ProCard>
        </>
      ) : null}

      <FloatButton.BackTop />
    </ProCard>
  );
};

export default Index;
