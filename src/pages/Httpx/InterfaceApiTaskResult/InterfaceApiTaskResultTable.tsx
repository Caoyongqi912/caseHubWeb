import { IModuleEnum, IObjGet } from '@/api';
import { removeAllTaskResults } from '@/api/inter/interCase';
import {
  pageInterTaskResult,
  removeInterTaskResultDetail,
} from '@/api/inter/interTask';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceTaskResult } from '@/pages/Httpx/types';
import { IJob } from '@/pages/Project/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import {
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, theme } from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SelfProps {
  apiCaseTaskId?: number | string;
  job?: IJob;
}

const InterfaceApiTaskResultTable: FC<SelfProps> = ({ apiCaseTaskId, job }) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [showSearch, setShowSearch] = useState(true);
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectProjectId, setSelectProjectId] = useState<number>();

  useEffect(() => {
    if (apiCaseTaskId) {
      setShowSearch(false);
    } else {
      queryProjectEnum(setProjectEnumMap).then();
    }
  }, [apiCaseTaskId]);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(
        selectProjectId,
        ModuleEnum.API_TASK,
        setModuleEnum,
      ).then();
    }
  }, [selectProjectId]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        taskId: apiCaseTaskId,
        sort: { ...sort },
      };
      if (job) {
        searchData.startBy = 3;
        searchData.taskUid = job.job_task_id_list;
      }
      const { code, data } = await pageInterTaskResult(searchData);
      return pageData(code, data);
    },
    [apiCaseTaskId, job],
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
      },
      nameTag: {
        fontSize: 13,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        border: 'none',
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

  const columns: ProColumns<IInterfaceTaskResult>[] = [
    {
      title: '所属项目',
      dataIndex: 'interfaceProjectId',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      fieldProps: {
        onSelect: (value: number) => {
          setSelectProjectId(value);
        },
      },
    },
    {
      title: '所属模块',
      dataIndex: 'interfaceModuleId',
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
      title: '任务结果ID',
      dataIndex: 'uid',
      width: 120,
      fixed: 'left',
      render: (_, record) => <span style={styles.idTag}>{record.uid}</span>,
    },
    {
      title: '任务名',
      dataIndex: 'taskName',
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>{record.taskName}</Tag>
      ),
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      valueType: 'select',
      sorter: true,
      width: 100,
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag
          color={record.result === 'SUCCESS' ? 'success' : 'error'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {record.result === 'SUCCESS' ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.result}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      hideInSearch: true,
      hideInTable: showSearch,
      dataIndex: 'progress',
      width: 150,
      valueType: (item) => ({
        type: 'progress',
        status: item.status !== 'OVER' ? 'active' : 'success',
      }),
    },
    {
      title: '执行时间',
      dataIndex: 'runDay',
      key: 'runDay',
      valueType: 'dateRange',
      sorter: true,
      width: 180,
      render: (_, record) => (
        <Tag style={styles.timeTag}>{record.start_time}</Tag>
      ),
    },
    {
      title: '用时',
      dataIndex: 'totalUseTime',
      key: 'totalUseTime',
      valueType: 'time',
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
            backgroundColor: token.colorInfoBg,
            color: token.colorInfo,
            border: `1px solid ${token.colorInfoBorder}`,
          }}
        >
          {record.totalUseTime}
        </Tag>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starterName',
      key: 'starterName',
      width: 120,
      render: (_, record) => (
        <Tag style={styles.userTag}>{record.starterName}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        RUNNING: { text: '运行中', status: 'Processing' },
        OVER: { text: '完成', status: 'Success' },
      },
      render: (_, record) => (
        <Tag
          color={record.status === 'RUNNING' ? 'processing' : 'success'}
          style={{ borderRadius: 6, fontWeight: 500, padding: '4px 12px' }}
        >
          {record.status === 'RUNNING' ? '运行中' : '完成'}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'OVER' ? (
            <>
              <ActionButton
                icon={<EyeOutlined />}
                label="详情"
                type="primary"
                onClick={() => {
                  window.open(
                    `/interface/task/report/detail/resultId=${record.id}`,
                    '_blank',
                  );
                }}
              />
              <Popconfirm
                title="确认删除？"
                description="删除后数据将无法恢复"
                okText="确认删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  const { code, msg } = await removeInterTaskResultDetail(
                    record.id,
                  );
                  if (code === 0) {
                    message.success(msg || '删除成功');
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
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  const removeTaskResults = async () => {
    if (apiCaseTaskId) {
      const { code, msg } = await removeAllTaskResults(apiCaseTaskId);
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    }
  };

  const RemoveAllButton = (
    <>
      {!showSearch ? (
        <Button
          type="primary"
          danger
          style={styles.clearBtn}
          icon={<ClearOutlined />}
          onClick={removeTaskResults}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorErrorBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorErrorBg}`;
          }}
        >
          Remove All
        </Button>
      ) : null}
    </>
  );

  return (
    <MyProTable
      rowKey="uid"
      actionRef={actionRef}
      request={fetchResults}
      search={showSearch}
      toolBarRender={() => [RemoveAllButton]}
      pagination={{
        showQuickJumper: true,
        defaultPageSize: job ? 10 : 6,
        showSizeChanger: true,
      }}
      x={1000}
      columns={columns}
    />
  );
};

export default InterfaceApiTaskResultTable;
