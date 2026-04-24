import {
  executePlayTask,
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
import {
  DeleteOutlined,
  EyeOutlined,
  NumberOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Form,
  message,
  Popconfirm,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const taskStatusColorMap: Record<string, string> = {
  RUNNING: 'processing',
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'error',
  STOPPED: 'default',
};

const Index: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, perKey } = props;
  const { token } = theme.useToken();
  const [form] = Form.useForm<IUITask>();
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const [currentTaskId, setCurrentTaskId] = useState<number>();

  useEffect(() => {
    actionRef.current?.reload();
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

  const tagStyle = useMemo(
    () => ({
      borderRadius: 6,
      fontWeight: 500,
      padding: '4px 12px',
    }),
    [],
  );

  const primaryTagStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 6,
      fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
      fontSize: 12,
      fontWeight: 700,
      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
      color: token.colorPrimary,
      border: `1px solid ${token.colorPrimaryBorder}`,
      letterSpacing: '0.5px',
    }),
    [token],
  );

  const actionBtnStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: 500,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
    [],
  );

  const getActionBtnStyle = (type: string) => {
    const styleMap: Record<string, any> = {
      primary: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      success: {
        color: token.colorSuccess,
        backgroundColor: token.colorSuccessBg,
      },
      danger: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
      },
      warning: {
        color: token.colorWarning,
        backgroundColor: token.colorWarningBg,
      },
    };
    return { ...actionBtnStyle, ...styleMap[type] };
  };

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'success' | 'danger' | 'warning';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    return (
      <a
        onClick={onClick}
        style={getActionBtnStyle(type)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {icon}
        {label}
      </a>
    );
  };

  const columns: ProColumns<IUITask>[] = [
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 100,
      copyable: true,
      render: (_, record) => (
        <span style={primaryTagStyle}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (_, record) => (
        <MyModal
          form={form}
          onFinish={saveTask}
          trigger={
            <Tag
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '4px 12px',
                borderRadius: 6,
                backgroundColor: token.colorBgTextActive,
                color: token.colorText,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgTextActive;
              }}
              onClick={() => {
                form.setFieldsValue(record);
                setCurrentTaskId(record.id);
              }}
            >
              <ScheduleOutlined style={{ marginRight: 4, opacity: 0.6 }} />
              {record.title}
            </Tag>
          }
        >
          <PlayTaskBasicInfoForm />
        </MyModal>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      width: 100,
      valueEnum: CONFIG.UI_LEVEL_ENUM,
      render: (_, record) => (
        <Tag
          color={CONFIG.RENDER_CASE_LEVEL[record.level]?.color || 'default'}
          style={tagStyle}
        >
          {CONFIG.RENDER_CASE_LEVEL[record.level]?.text || '-'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => (
        <Tag
          color={taskStatusColorMap[record.status] || 'default'}
          style={tagStyle}
        >
          {record.status || '-'}
        </Tag>
      ),
    },
    {
      title: '用例数',
      valueType: 'text',
      dataIndex: 'play_case_num',
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <Tag
          style={{
            ...tagStyle,
            backgroundColor: token.colorInfoBg,
            color: token.colorInfo,
            border: `1px solid ${token.colorInfoBorder}`,
          }}
        >
          {record.play_case_num || 0}
        </Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'select',
      width: 120,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => (
        <Tag
          style={{
            fontSize: 12,
            padding: '2px 10px',
            borderRadius: 12,
            backgroundColor: token.colorWarningBg,
            color: token.colorWarningText,
            border: `1px solid ${token.colorWarningBorder}`,
          }}
        >
          {record.creatorName || '-'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'date',
      sorter: true,
      search: false,
      width: 160,
      render: (_, record) => (
        <Text
          type="secondary"
          style={{ fontSize: 13, fontFamily: 'monospace' }}
        >
          {record.create_time}
        </Text>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              history.push(`/ui/task/detail/taskId=${record.id}`);
            }}
          />
          <ActionButton
            icon={<PlayCircleOutlined />}
            label="执行"
            type="success"
            onClick={async () => {
              const { code, msg } = await executePlayTask({
                taskId: record.id,
              });
              if (code === 0) {
                message.success(msg);
                actionRef.current?.reload();
              }
            }}
          />
          {(initialState?.currentUser?.id === record.creator ||
            initialState?.currentUser?.isAdmin) && (
            <Popconfirm
              title="确认删除？"
              description="删除后数据将无法恢复"
              okText="确认删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                await removePlayTaskById({ taskId: record.id }).then(() => {
                  actionRef.current?.reload();
                });
              }}
            >
              <ActionButton
                icon={<DeleteOutlined />}
                label="删除"
                type="danger"
              />
            </Popconfirm>
          )}
        </Space>
      ),
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
      if (!currentModuleId || !currentProjectId) {
        message.error('缺少必要参数');
        return false;
      }
      const { code } = await insertPlayTask({
        ...values,
        module_id: currentModuleId,
        project_id: currentProjectId,
      });
      if (code === 0) {
        message.success('添加成功');
        actionRef.current?.reload();
      }
    }
    return true;
  };

  const AddTaskButton = (
    <>
      {currentModuleId && currentProjectId && (
        <MyModal
          onFinish={saveTask}
          trigger={
            <Button
              type="primary"
              style={{
                height: 36,
                borderRadius: 8,
                fontWeight: 500,
                boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentTaskId(undefined);
                form.resetFields();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
              }}
            >
              添加任务
            </Button>
          }
        >
          <PlayTaskBasicInfoForm />
        </MyModal>
      )}
    </>
  );

  return (
    <MyProTable
      persistenceKey={perKey}
      columns={columns}
      rowKey="id"
      request={fetchPageUITaskTable}
      actionRef={actionRef}
      toolBarRender={() => [AddTaskButton]}
    />
  );
};

export default Index;
