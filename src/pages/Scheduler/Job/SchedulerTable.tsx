import { page_aps_job, remove_aps_job } from '@/api/base/aps';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import InterfaceApiTaskResultTable from '@/pages/Httpx/InterfaceApiTaskResult/InterfaceApiTaskResultTable';
import PlayTaskResultTable from '@/pages/Play/PlayResult/PlayTaskResultTable';
import { IJob } from '@/pages/Project/types';
import JobDrawerForm from '@/pages/Scheduler/Job/JobDrawerForm';
import JobParams from '@/pages/Scheduler/Job/TableField/JobParams';
import Notify from '@/pages/Scheduler/Job/TableField/Notify';
import TasksFiled from '@/pages/Scheduler/Job/TableField/TasksFiled';
import TriggerType from '@/pages/Scheduler/Job/TableField/TriggerType';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  ApiOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  PlusOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, theme, Typography } from 'antd';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const { useToken } = theme;
const { Text } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const SchedulerTable: FC<SelfProps> = (props) => {
  const { token } = useToken();
  const actionRef = useRef<ActionType>();
  const { currentProjectId, currentModuleId, perKey } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<IJob>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [openTaskHistory, setOpenTaskHistory] = useState(false);

  const styles = useMemo(
    () => ({
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        fontSize: 13,
        fontWeight: 500,
        border: 'none',
      },
      typeTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 12,
      },
      envTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
      },
      userTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: 16,
        background: `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorWarningBorder} 100%)`,
        color: token.colorWarningText,
        fontWeight: 500,
        fontSize: 12,
        border: `1px solid ${token.colorWarningBorder}`,
      },
      addBtn: {
        height: 36,
        padding: '0 16px',
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  const ActionButton: FC<{
    label: string;
    type?: 'primary' | 'success' | 'danger' | 'warning';
    onClick?: () => void;
  }> = ({ label, type = 'primary', onClick }) => {
    const colors = useMemo(
      () => ({
        primary: { color: token.colorPrimary, bg: token.colorPrimaryBg },
        success: { color: token.colorSuccess, bg: token.colorSuccessBg },
        danger: { color: token.colorError, bg: token.colorErrorBg },
        warning: { color: token.colorWarning, bg: token.colorWarningBg },
      }),
      [token],
    );

    return (
      <span
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          color: colors[type].color,
          backgroundColor: colors[type].bg,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${colors[type].bg}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {label}
      </span>
    );
  };

  const columns: ProColumns<IJob>[] = [
    {
      title: '任务ID',
      dataIndex: 'uid',
      copyable: true,
      fixed: 'left',
      width: '10%',
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 11 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '任务名称',
      dataIndex: 'job_name',
      ellipsis: true,
      fixed: 'left',
      width: '12%',
      render: (_, record) => (
        <span style={styles.nameTag}>
          <ScheduleOutlined
            style={{ fontSize: 12, color: token.colorPrimary }}
          />
          {record.job_name}
        </span>
      ),
    },
    {
      title: '任务类型',
      dataIndex: 'job_type',
      width: '8%',
      valueEnum: {
        1: { text: 'API' },
        2: { text: 'UI' },
      },
      render: (_, record) => {
        const isApi = record.job_type === 1;
        return (
          <span
            style={{
              ...styles.typeTag,
              backgroundColor: isApi ? token.colorInfoBg : token.colorSuccessBg,
              border: `1px solid ${
                isApi ? token.colorInfoBorder : token.colorSuccessBorder
              }`,
              color: isApi ? token.colorInfoText : token.colorSuccessText,
            }}
          >
            {isApi ? (
              <ApiOutlined style={{ fontSize: 11 }} />
            ) : (
              <DesktopOutlined style={{ fontSize: 11 }} />
            )}
            {isApi ? 'API' : 'UI'}
          </span>
        );
      },
    },
    {
      title: '环境',
      dataIndex: 'job_env_name',
      search: false,
      width: '8%',
      render: (_, record) => {
        const hasEnv = !!record.job_env_name;
        return (
          <span
            style={{
              ...styles.envTag,
              backgroundColor: hasEnv
                ? token.colorPrimaryBg
                : token.colorFillAlter,
              border: `1px solid ${
                hasEnv ? token.colorPrimaryBorder : token.colorBorderSecondary
              }`,
              color: hasEnv ? token.colorPrimary : token.colorTextSecondary,
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 11 }} />
            {record.job_env_name || '无'}
          </span>
        );
      },
    },
    {
      title: '执行信息',
      dataIndex: 'job_trigger_type',
      width: '18%',
      search: false,
      render: (_, record) => (
        <TriggerType record={record} callback={reloadTable} />
      ),
    },
    {
      title: '参数',
      dataIndex: 'job_kwargs',
      width: '18%',
      search: false,
      render: (text, record) => (
        <JobParams callback={reloadTable} text={text} record={record} />
      ),
    },
    {
      title: '通知',
      dataIndex: 'job_notify_on',
      width: '14%',
      search: false,
      render: (_, record) => {
        return <Notify record={record} callback={reloadTable} />;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      render: (_, record) => (
        <span style={styles.userTag}>
          <UserOutlined style={{ fontSize: 11 }} />
          {record.creatorName}
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '20%',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            label="编辑"
            type="primary"
            onClick={() => {
              setCurrentJob(record);
              setDrawerOpen(true);
            }}
          />
          <ActionButton
            label="历史"
            type="warning"
            onClick={() => {
              setCurrentJob(record);
              setOpenTaskHistory(true);
            }}
          />
          <Popconfirm
            title="确认删除？"
            description="删除后数据将无法恢复"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const { code, msg } = await remove_aps_job({
                job_id: record.uid,
              });
              if (code === 0) {
                message.success(msg || '删除成功');
                reloadTable();
              }
            }}
          >
            <ActionButton label="删除" type="danger" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    reloadTable();
  }, [currentModuleId, currentProjectId]);

  function reloadTable() {
    actionRef.current?.reload();
    setExpandedRowKeys([]);
    setDrawerOpen(false);
  }

  const fetchJobData = useCallback(
    async (values: any) => {
      const { code, data } = await page_aps_job({
        ...values,
        module_type: ModuleEnum.JOB,
        module_id: currentModuleId,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const handleExpand = (expanded: boolean, record: IJob) => {
    if (expanded) {
      setExpandedRowKeys([record.uid]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  return (
    <>
      <MyDrawer open={openTaskHistory} setOpen={setOpenTaskHistory}>
        {currentJob?.job_type === 1 ? (
          <InterfaceApiTaskResultTable job={currentJob} />
        ) : (
          <PlayTaskResultTable job={currentJob} />
        )}
      </MyDrawer>

      <MyDrawer open={drawerOpen} setOpen={setDrawerOpen} width={'60%'}>
        <JobDrawerForm
          currentJob={currentJob}
          callback={reloadTable}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
        />
      </MyDrawer>

      <MyProTable
        expandable={{
          fixed: 'left',
          expandedRowKeys,
          columnTitle: '关联任务',
          columnWidth: '4%',
          onExpand: handleExpand,
          expandedRowRender: (record: IJob) => {
            return <TasksFiled job_uid={record.uid} type={record.job_type} />;
          },
        }}
        persistenceKey={perKey}
        actionRef={actionRef}
        columns={columns}
        pagination={{
          defaultPageSize: 5,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        rowKey={'uid'}
        request={fetchJobData}
        toolBarRender={() => [
          <Button
            key="add"
            hidden={currentModuleId === undefined}
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentJob(undefined);
              setDrawerOpen(true);
            }}
            style={styles.addBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            添加任务
          </Button>,
        ]}
      />
    </>
  );
};

export default SchedulerTable;
