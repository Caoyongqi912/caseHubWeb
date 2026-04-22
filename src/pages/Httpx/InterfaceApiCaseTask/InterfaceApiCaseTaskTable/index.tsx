import { IModuleEnum } from '@/api';
import {
  insertApiTask,
  pageApiTask,
  removeApiTaskBaseInfo,
  updateApiTaskBaseInfo,
} from '@/api/inter/interTask';
import { useGlassStyles } from '@/components/Glass';
import MyDrawer from '@/components/MyDrawer';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import InterfaceTaskBaseForm from '@/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/InterfaceTaskBaseForm';
import InterfaceApiTaskResultTable from '@/pages/Httpx/InterfaceApiTaskResult/InterfaceApiTaskResultTable';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { useModel } from '@@/exports';
import {
  DeleteOutlined,
  DeliveredProcedureOutlined,
  EyeOutlined,
  HistoryOutlined,
  MoreOutlined,
  NumberOutlined,
  PlusOutlined,
  ScheduleOutlined,
  UserOutlined,
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
  Dropdown,
  Form,
  message,
  Modal,
  Popconfirm,
  Space,
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
  const styles = useGlassStyles();
  const actionRef = useRef<ActionType>();
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [currentTaskId, setCurrentTaskId] = useState<number>();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [taskForm] = Form.useForm<IInterfaceAPITask>();
  const [openHistory, setOpenHistory] = useState(false);

  useEffect(() => {
    actionRef.current?.reload();
    if (currentProjectId && currentModuleId) {
      taskForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(
        copyProjectId,
        ModuleEnum.API_TASK,
        setModuleEnum,
      ).then();
    }
  }, [copyProjectId]);

  const fetchPageTasks = useCallback(
    async (params: any, sort: any) => {
      if (!currentModuleId) {
        return;
      }
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

  const saveTaskBase = async (values: IInterfaceAPITask) => {
    const { code, data } = await insertApiTask(values);
    if (code === 0) {
      history.push(
        `/interface/task/detail/taskId=${data.id}&projectId=${data.project_id}`,
      );
      message.success('添加成功');
      actionRef.current?.reload();
    }
    return true;
  };

  const tagBaseStyle = {
    borderRadius: 6,
    fontSize: 12,
    padding: '4px 12px',
    fontWeight: 600,
  };

  const addBtnStyle = {
    height: 36,
    borderRadius: 8,
    fontWeight: 500,
    background: styles.colors.gradientPrimary,
    border: 'none',
    boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
  };

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => (
    <a
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        color: type === 'primary' ? styles.colors.primary : styles.colors.error,
        backgroundColor:
          type === 'primary'
            ? `${styles.colors.primary}15`
            : `${styles.colors.error}15`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </a>
  );

  const taskColumns: ProColumns<IInterfaceAPITask>[] = [
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 120,
      copyable: true,
      render: (_, record) => (
        <Tag
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            background: `${styles.colors.primary}15`,
            color: styles.colors.primary,
            border: `1px solid ${styles.colors.primary}30`,
          }}
        >
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </Tag>
      ),
    },
    {
      title: '名称',
      dataIndex: 'interface_task_title',
      key: 'interface_task_title',
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <Tag style={{ borderRadius: 6, fontSize: 13, padding: '4px 12px' }}>
          <ScheduleOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interface_task_title}
        </Tag>
      ),
    },
    {
      title: '业务用例数',
      dataIndex: 'interface_task_total_cases_num',
      key: 'interface_task_total_cases_num',
      hideInSearch: true,
      width: 120,
      render: (_, record) => (
        <Tag style={{ borderRadius: 6, fontWeight: 500, padding: '4px 12px' }}>
          {record.interface_task_total_cases_num || 0}
        </Tag>
      ),
    },
    {
      title: 'API数',
      dataIndex: 'interface_task_total_apis_num',
      key: 'interface_task_total_apis_num',
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <Tag style={tagBaseStyle}>
          {record.interface_task_total_apis_num || 0}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'interface_task_status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (text) => <Tag color={'warning'}>{text}</Tag>,
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: 100,
      render: (_, record) => {
        const levelConfig = CONFIG.API_LEVEL_ENUM[record.interface_task_level];
        return (
          <Tag
            color={levelConfig?.status === 'Success' ? 'success' : 'processing'}
            style={tagBaseStyle}
          >
            {record.interface_task_level}
          </Tag>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'select',
      width: 120,
      renderFormItem: () => <UserSelect />,
      render: (_, record) => (
        <Tag style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}>
          <UserOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.creatorName}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            onClick={() => {
              history.push(
                `/interface/task/detail/taskId=${record.id}&projectId=${record.project_id}`,
              );
            }}
          />
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
                { type: 'divider' },
                {
                  key: '4',
                  icon: <HistoryOutlined />,
                  label: '执行历史',
                  onClick: () => {
                    setCurrentTaskId(record.id);
                    setOpenHistory(true);
                  },
                },
                {
                  key: '3',
                  icon: <DeleteOutlined />,
                  danger: true,
                  label: (
                    <Popconfirm
                      title="确认删除？"
                      description="删除后数据将无法恢复"
                      okText="确认删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        const { code, msg } = await removeApiTaskBaseInfo(
                          record.id,
                        );
                        if (code === 0) {
                          message.success(msg || '删除成功');
                          actionRef.current?.reload();
                        }
                      }}
                    >
                      <a style={{ color: styles.colors.error }}>删除</a>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <MoreOutlined />
              </Space>
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <MyDrawer
        name={'任务详情'}
        width={'85%'}
        open={openHistory}
        setOpen={setOpenHistory}
      >
        <InterfaceApiTaskResultTable apiCaseTaskId={currentTaskId} />
      </MyDrawer>
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
        title={<span style={{ fontWeight: 600 }}>移动任务</span>}
      >
        <ProForm submitter={false} form={form}>
          <ProFormSelect
            width="md"
            options={projects}
            label="项目"
            name="project_id"
            required
            onChange={(value) => setCopyProjectId(value as number)}
          />
          <ProFormTreeSelect
            required
            name="module_id"
            label="模块"
            rules={[{ required: true, message: '所属模块必选' }]}
            fieldProps={{
              treeData: moduleEnum,
              fieldNames: { label: 'title' },
              filterTreeNode: true,
            }}
            width="md"
          />
        </ProForm>
      </Modal>

      <MyProTable
        persistenceKey={perKey}
        columns={taskColumns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchPageTasks}
        toolBarRender={() => [
          <MyModal
            key="add"
            form={taskForm}
            title="添加任务"
            onFinish={saveTaskBase}
            trigger={
              <Button
                hidden={currentModuleId === undefined}
                type="primary"
                style={addBtnStyle}
                icon={<PlusOutlined />}
                onClick={() => setCurrentTaskId(undefined)}
              >
                添加任务
              </Button>
            }
          >
            <InterfaceTaskBaseForm />
          </MyModal>,
        ]}
      />
    </>
  );
};

export default Index;
