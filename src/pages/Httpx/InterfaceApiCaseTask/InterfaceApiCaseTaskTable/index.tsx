import { IModuleEnum } from '@/api';
import {
  getNextTaskRunTime,
  pageApiTask,
  removeApiTaskBaseInfo,
  setApiTaskAuto,
  updateApiTaskBaseInfo,
} from '@/api/inter/interTask';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { useModel } from '@@/exports';
import {
  DashOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Dropdown,
  Form,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Tag,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [currentTaskId, setCurrentTaskId] = useState<number>();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  const [copyProjectId, setCopyProjectId] = useState<number>();

  // 根据当前项目ID获取环境和用例部分
  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(
        copyProjectId,
        ModuleEnum.API_TASK,
        setModuleEnum,
      ).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchPageTasks = useCallback(
    async (params: any, sort: any) => {
      const { code, data } = await pageApiTask({
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API_TASK,
        sort: sort,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const setTaskAuto = async (auto: boolean, taskId: number) => {
    const { code } = await setApiTaskAuto({ is_auto: auto, taskId: taskId });
    if (code === 0) {
      message.success(auto ? '已开启任务' : '已暂暂停任务');
      actionRef.current?.reload();
    }
  };
  const taskColumns: ProColumns<IInterfaceAPITask>[] = [
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '10%',
      copyable: true,
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '业务用例数',
      dataIndex: 'total_cases_num',
      key: 'total_cases_num',
      hideInSearch: true,
      render: (text) => {
        return <Tag color={'green'}>{text}</Tag>;
      },
    },
    {
      title: 'API数',
      dataIndex: 'total_apis_num',
      key: 'total_apis_num',
      hideInSearch: true,
      render: (text) => {
        return <Tag color={'green'}>{text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (text) => {
        return <Tag color={'warning'}>{text}</Tag>;
      },
    },
    {
      title: '自动执行',
      dataIndex: 'is_auto',
      key: 'is_auto',
      hideInSearch: true,
      valueType: 'switch',
      render: (_, record) => (
        <Switch
          value={record.is_auto}
          onChange={async (checked) => {
            return await setTaskAuto(checked, record.id);
          }}
        />
      ),
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      render: (_, record) => {
        return <Tag color={'blue'}>{record.level}</Tag>;
      },
    },

    {
      title: '创建人',
      dataIndex: 'creatorName',
      render: (_, record) => {
        return <Tag>{record.creatorName}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _) => {
        return [
          <a
            onClick={async () => {
              const { code, data } = await getNextTaskRunTime(record.uid);
              if (code === 0) {
                message.success(data);
              }
            }}
          >
            下次运行时间
          </a>,
          <a
            onClick={() => {
              history.push(`/interface/task/detail/taskId=${record.id}`);
            }}
          >
            详情
          </a>,
          <Dropdown
            menu={{
              items: [
                {
                  key: '2',
                  label: '移动至',
                  icon: <DeliveredProcedureOutlined />,
                  onClick: () => {
                    setCurrentTaskId(record.id);
                    setOpenModal(true);
                  },
                },

                {
                  type: 'divider',
                },
                {
                  key: '3',
                  icon: <DeleteOutlined />,
                  label: (
                    <Popconfirm
                      title={'确认删除？'}
                      okText={'确认'}
                      cancelText={'点错了'}
                      onConfirm={async () => {
                        const { code, msg } = await removeApiTaskBaseInfo(
                          record.id,
                        );
                        if (code === 0) {
                          message.success(msg);
                          actionRef.current?.reload();
                        }
                      }}
                    >
                      <Divider type={'vertical'} />
                      <a>删除</a>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <DashOutlined />
              </Space>
            </a>
          </Dropdown>,
        ];
      },
    },
  ];
  return (
    <>
      <Modal
        open={openModal}
        onOk={async () => {
          const values = await form.validateFields();
          const { code, msg } = await updateApiTaskBaseInfo({
            id: currentTaskId,
            ...values,
          });
          if (code === 0) {
            message.success(msg);
            actionRef.current?.reload();
            form.resetFields();
            setOpenModal(false);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={'移动'}
      >
        <ProForm submitter={false} form={form}>
          <ProFormSelect
            width={'md'}
            options={projects}
            label={'项目'}
            name={'project_id'}
            required={true}
            onChange={(value) => {
              setCopyProjectId(value as number);
            }}
          />
          <ProFormTreeSelect
            required
            name="module_id"
            label="模块"
            rules={[{ required: true, message: '所属模块必选' }]}
            fieldProps={{
              treeData: moduleEnum,
              fieldNames: {
                label: 'title',
              },
              filterTreeNode: true,
            }}
            width={'md'}
          />
        </ProForm>
      </Modal>
      <MyProTable
        persistenceKey={perKey}
        columns={taskColumns}
        rowKey={'id'}
        x={1500}
        actionRef={actionRef}
        request={fetchPageTasks}
        toolBarRender={() => [
          <Button
            type={'primary'}
            onClick={() => {
              history.push(
                `/interface/task/detail/projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
          >
            添加
          </Button>,
        ]}
      />
    </>
  );
};
export default Index;
