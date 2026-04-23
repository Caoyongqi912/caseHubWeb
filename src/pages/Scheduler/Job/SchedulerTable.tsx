import { page_aps_job, remove_aps_job } from '@/api/base/aps';
import { useGlassStyles } from '@/components/Glass';
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
import { Button, message, Popconfirm, Space } from 'antd';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const SchedulerTable: FC<SelfProps> = (props) => {
  const styles = useGlassStyles();
  const actionRef = useRef<ActionType>();
  const { currentProjectId, currentModuleId, perKey } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<IJob>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [openTaskHistory, setOpenTaskHistory] = useState(false);

  const ActionButton: FC<{
    label: string;
    type?: 'primary' | 'success' | 'danger' | 'warning';
    onClick?: () => void;
  }> = ({ label, type = 'primary', onClick }) => {
    const typeColors = {
      primary: {
        color: styles.colors.primary,
        bg: `${styles.colors.primary}15`,
      },
      success: {
        color: styles.colors.success,
        bg: `${styles.colors.success}15`,
      },
      danger: { color: styles.colors.error, bg: `${styles.colors.error}15` },
      warning: {
        color: styles.colors.warning,
        bg: `${styles.colors.warning}15`,
      },
    };
    const colors = typeColors[type];

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
          color: colors.color,
          backgroundColor: colors.bg,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${colors.bg}`;
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
        <span style={styles.tagMono()}>
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
        <span style={styles.tagLabel()}>
          <ScheduleOutlined
            style={{ fontSize: 12, color: styles.colors.primary }}
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
          <span style={isApi ? styles.tagInfo() : styles.tagSuccess()}>
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
            style={styles.tagBase({
              bg: hasEnv ? `${styles.colors.primary}15` : undefined,
              border: hasEnv ? `${styles.colors.primary}30` : undefined,
              color: hasEnv
                ? styles.colors.primary
                : styles.colors.textSecondary,
            })}
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
        <span style={styles.tagWarning()}>
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
      if (!currentModuleId) {
        return;
      }
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
            style={styles.addButton()}
          >
            添加任务
          </Button>,
        ]}
      />
    </>
  );
};

export default SchedulerTable;
