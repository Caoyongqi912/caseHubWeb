import { IModuleEnum, IObjGet } from '@/api';
import {
  clearResultByTaskId,
  pagePlayTaskResult,
  removePlayTaskResultById,
} from '@/api/play/playTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IPlayTaskResult } from '@/pages/Play/componets/uiTypes';
import { IJob } from '@/pages/Project/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import {
  ClearOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  NumberOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  taskId?: string;
  job?: IJob;
}

const PlayTaskResultTable: FC<SelfProps> = ({ taskId, job }) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [selectProjectId, setSelectProjectId] = useState<number>();
  const [showSearch, setShowSearch] = useState(true);

  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  useEffect(() => {
    if (taskId) {
      setShowSearch(false);
    }
    queryProjectEnum(setProjectEnumMap).then();
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.UI_TASK,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);

  const fetchTaskData = useCallback(
    async (params: any, sort: any) => {
      const newParams = {
        ...params,
        ...sort,
        module_type: ModuleEnum.UI_TASK,
        task_id: taskId,
      };
      if (job) {
        newParams.startBy = 3;
        newParams.taskUid = job.job_task_id_list;
      }
      const { code, data } = await pagePlayTaskResult(newParams);
      return pageData(code, data);
    },
    [taskId],
  );

  const styles = useMemo(
    () => ({
      actionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
      primaryBtn: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
      },
      idTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        color: token.colorPrimary,
        border: `1px solid ${token.colorPrimaryBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      nameTag: {
        fontSize: 13,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      userTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 12,
        backgroundColor: token.colorWarningBg,
        color: token.colorWarningText,
        border: `1px solid ${token.colorWarningBorder}`,
      },
      timeTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 6,
        backgroundColor: token.colorInfoBg,
        color: token.colorInfo,
        border: `1px solid ${token.colorInfoBorder}`,
        fontFamily: 'monospace',
      },
      clearBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorErrorBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    const styleMap = {
      primary: styles.primaryBtn,
      danger: styles.dangerBtn,
    };

    return (
      <a
        onClick={onClick}
        style={{
          ...styles.actionBtn,
          ...styleMap[type],
        }}
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

  const columns: ProColumns<IPlayTaskResult>[] = [
    {
      title: '报告ID',
      dataIndex: 'uid',
      fixed: 'left',
      width: 120,
      render: (_, record) => (
        <span
          style={styles.idTag}
          onClick={() => {
            history.push(`/report/history/uiTask/detail/uid=${record.id}`);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = token.colorPrimary;
            e.currentTarget.style.color = token.colorWhite;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`;
            e.currentTarget.style.color = token.colorPrimary;
          }}
        >
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: { ...projectEnumMap },
      fieldProps: {
        onSelect: (value: number) => {
          setSelectProjectId(value);
        },
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Tag
          style={styles.nameTag}
          onClick={() => {
            history.push(`/ui/task/detail/taskId=${record.task_id}`);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = token.colorBgTextActive;
          }}
        >
          <FileTextOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.task_name}
        </Tag>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starter_name',
      width: 120,
      render: (_, record) => (
        <Tag style={styles.userTag}>
          <UserOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.starter_name}
        </Tag>
      ),
    },
    {
      title: '执行日期',
      dataIndex: 'run_day',
      valueType: 'dateRange',
      ellipsis: true,
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            run_day: [
              dayjs(value[0]).format('YYYY-MM-DD'),
              dayjs(value[1]).format('YYYY-MM-DD'),
            ],
          };
        },
      },
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: CONFIG.UI_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.UI_STATUS_ENUM[record.status]?.tag;
      },
    },
    {
      title: '运行结果',
      dataIndex: 'result',
      valueType: 'select',
      width: 100,
      valueEnum: CONFIG.UI_RESULT_ENUM,
      render: (_, record) => {
        return CONFIG.UI_RESULT_ENUM[record.result]?.tag;
      },
    },
    {
      title: '用时',
      dataIndex: 'total_usetime',
      hideInSearch: true,
      width: 120,
      render: (_, record) => (
        <Tag style={styles.timeTag}>
          <ClockCircleOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.total_usetime}
        </Tag>
      ),
    },
    {
      title: '执行时间',
      dataIndex: 'start_time',
      hideInSearch: true,
      width: 180,
      render: (_, record) => (
        <Text
          type="secondary"
          style={{ fontSize: 13, fontFamily: 'monospace' }}
        >
          <ScheduleOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.start_time}
        </Text>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              history.push(`/ui/report/detail/resultId=${record.id}`);
            }}
          />
          <Popconfirm
            title="确认删除？"
            description="删除后数据将无法恢复"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const { code, msg } = await removePlayTaskResultById({
                resultId: record.uid,
              });
              if (code === 0) {
                message.success(msg);
                actionRef.current?.reload();
              }
            }}
          >
            <ActionButton
              icon={<DeleteOutlined />}
              label="删除"
              type="danger"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const clearTaskResult = async () => {
    if (taskId) {
      const { code } = await clearResultByTaskId(taskId);
      if (code === 0) {
        actionRef.current?.reload();
      }
    }
  };

  return (
    <MyProTable
      toolBarRender={() => [
        <Button
          key="clear"
          hidden={showSearch}
          type="primary"
          danger
          style={styles.clearBtn}
          icon={<ClearOutlined />}
          onClick={clearTaskResult}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorErrorBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorErrorBg}`;
          }}
        >
          清空记录
        </Button>,
      ]}
      search={showSearch}
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      request={fetchTaskData}
      x={1000}
    />
  );
};

export default PlayTaskResultTable;
