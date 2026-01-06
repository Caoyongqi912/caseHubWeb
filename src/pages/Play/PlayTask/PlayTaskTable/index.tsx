import {
  handelExecutePlayTask,
  insertPlayTask,
  pagePlayTask,
  removePlayTaskById,
  updatePlayTask,
} from '@/api/play/playTask';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { IUITask } from '@/pages/Play/componets/uiTypes';
import PlayTaskBasicInfoForm from '@/pages/Play/PlayTask/PlayTaskDetail/PlayTaskBasicInfoForm';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { useModel } from '@@/exports';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Divider, Form, message, Popconfirm, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, perKey } = props;
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [currentTaskId, setCurrentTaskId] = useState<number>();

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
    if (currentProjectId && currentModuleId) {
      form.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  const fetchPageUITaskTable = useCallback(
    async (params: any, sort: any) => {
      const { code, data } = await pagePlayTask({
        module_id: currentModuleId,
        module_type: ModuleEnum.UI_TASK,
        sort: sort,
        ...params,
      });
      return pageData(code, data);
    },
    [currentProjectId, currentModuleId],
  );

  const columns: ProColumns<IUITask>[] = [
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '12%',
      copyable: true,
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      width: '15%',

      render: (_: any, record: IUITask) => {
        return (
          <MyModal
            onFinish={saveTask}
            form={form}
            trigger={
              <a
                type={'primary'}
                onClick={() => {
                  form.setFieldsValue(record);
                  setCurrentTaskId(record.id);
                }}
              >
                {record.title}
              </a>
            }
          >
            <PlayTaskBasicInfoForm />
          </MyModal>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.UI_LEVEL_ENUM,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.RENDER_CASE_LEVEL[record.level].color}>
            {CONFIG.RENDER_CASE_LEVEL[record.level].text}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => {
        return (
          <Tag color={record.status === 'RUNNING' ? 'processing' : 'warning'}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: '用例数',
      valueType: 'text',
      dataIndex: 'play_case_num',
      hideInSearch: true,
      render: (text) => <Tag color={'blue'}> {text}</Tag>,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'select',
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => <Tag>{record.creatorName}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (_, record) => {
        return (
          <>
            <a
              onClick={() => {
                history.push(`/ui/task/detail/taskId=${record.id}`);
              }}
            >
              详情
            </a>
            <Divider type={'vertical'} />
            <a
              onClick={async () => {
                const { code, msg } = await handelExecutePlayTask({
                  taskId: record.id,
                });
                if (code === 0) {
                  message.success(msg);
                  actionRef.current?.reload();
                }
              }}
            >
              执行
            </a>
            {initialState?.currentUser?.id === record.creator ||
            initialState?.currentUser?.isAdmin ? (
              <Popconfirm
                title={'确认删除？'}
                okText={'确认'}
                cancelText={'点错了'}
                onConfirm={async () => {
                  await removePlayTaskById({ taskId: record.id }).then(() => {
                    actionRef.current?.reload();
                  });
                }}
              >
                <Divider type={'vertical'} />
                <a>删除</a>
              </Popconfirm>
            ) : null}
          </>
        );
      },
    },
  ];

  const saveTask = async (values: IUITask) => {
    if (currentTaskId) {
      const { code, msg } = await updatePlayTask({
        ...values,
        id: currentTaskId,
      });
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    } else {
      const { code, data } = await insertPlayTask(values);
      if (code === 0) {
        message.success('添加成功');
        actionRef.current?.reload();
      }
    }
    return true;
  };

  const AddTaskButton = (
    <MyModal
      onFinish={saveTask}
      form={form}
      trigger={
        <Button
          type={'primary'}
          onClick={() => {
            setCurrentTaskId(undefined);
          }}
        >
          添加任务
        </Button>
      }
    >
      <PlayTaskBasicInfoForm />
    </MyModal>
  );
  return (
    <MyProTable
      persistenceKey={perKey}
      columns={columns}
      rowKey={'id'}
      x={1000}
      request={fetchPageUITaskTable}
      actionRef={actionRef}
      toolBarRender={() => [AddTaskButton]}
    />
  );
};

export default Index;
