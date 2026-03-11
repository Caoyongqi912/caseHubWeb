import { query_tasks_by_job } from '@/api/base/aps';
import {
  ApiOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Empty, Popconfirm, theme, Typography } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

const { useToken } = theme;
const { Text } = Typography;

interface Props {
  jobId?: string;
  setJobs: (jobs: React.Key[]) => void;
  setShowChoiceTable: (show: boolean) => void;
}

const JobTasksList: FC<Props> = ({ setJobs, setShowChoiceTable, jobId }) => {
  const { token } = useToken();
  const [jobTasks, setJobTasks] = useState<any[]>([]);

  const styles = useMemo(
    () => ({
      container: {
        padding: 14,
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      },
      taskCard: {
        background: token.colorFillAlter,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
        transition: 'all 0.2s ease',
      },
      taskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      taskTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      taskId: {
        padding: '2px 8px',
        borderRadius: 4,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        color: '#fff',
        fontSize: 11,
        fontWeight: 500,
      },
      taskName: {
        padding: '2px 8px',
        borderRadius: 4,
        background: token.colorPrimaryBg,
        color: token.colorPrimary,
        fontSize: 12,
        fontWeight: 500,
      },
      taskMeta: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap' as const,
      },
      metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color: token.colorTextSecondary,
      },
      metaIcon: {
        fontSize: 12,
        color: token.colorTextSecondary,
      },
      metaValue: {
        padding: '1px 6px',
        borderRadius: 4,
        background: token.colorBgContainer,
        fontSize: 11,
        fontWeight: 500,
      },
      levelP1: {
        background: '#fff1f0',
        color: '#cf1322',
      },
      levelP2: {
        background: '#fff7e6',
        color: '#d46b08',
      },
      levelP3: {
        background: '#e6f7ff',
        color: '#0958d9',
      },
      deleteBtn: {
        padding: '4px 8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: token.colorError,
        fontSize: 12,
      },
      emptyContainer: {
        padding: '40px 20px',
        textAlign: 'center' as const,
      },
      reloadBtn: {
        height: 32,
        borderRadius: 6,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      },
    }),
    [token],
  );

  useEffect(() => {
    if (jobId) {
      query_tasks_by_job(jobId).then(async ({ code, data }) => {
        if (code === 0) {
          setJobTasks(data);
        }
      });
    }
  }, [jobId]);

  const removeTask = async (taskId: string) => {
    const afterRemove = jobTasks.filter((task) => task.uid !== taskId);
    if (afterRemove.length === 0) {
      setShowChoiceTable(true);
    } else {
      setJobTasks(afterRemove);
      setJobs(afterRemove.map((task) => task.uid));
    }
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'P1':
        return styles.levelP1;
      case 'P2':
        return styles.levelP2;
      default:
        return styles.levelP3;
    }
  };

  if (jobTasks.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Empty description="暂无任务" />
        <Button
          type="primary"
          style={{ ...styles.reloadBtn, marginTop: 16 }}
          onClick={() => setShowChoiceTable(true)}
          icon={<ReloadOutlined />}
        >
          选择任务
        </Button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Text strong style={{ fontSize: 13 }}>
          已选择 {jobTasks.length} 个任务
        </Text>
        <Button
          type="primary"
          ghost
          style={styles.reloadBtn}
          onClick={() => setShowChoiceTable(true)}
          icon={<ReloadOutlined />}
        >
          重新选择
        </Button>
      </div>

      {jobTasks.map((task) => (
        <div key={task.uid} style={styles.taskCard}>
          <div style={styles.taskHeader}>
            <div style={styles.taskTitle}>
              <span style={styles.taskId}>{task.uid?.slice(0, 8)}</span>
              <span style={styles.taskName}>{task.title || '未命名任务'}</span>
            </div>
            <Popconfirm
              title="确定要删除这个任务吗？"
              onConfirm={async () => await removeTask(task.uid)}
              okText="确定"
              cancelText="取消"
            >
              <div style={styles.deleteBtn}>
                <DeleteOutlined style={{ fontSize: 12 }} />
                <span>删除</span>
              </div>
            </Popconfirm>
          </div>

          <div style={styles.taskMeta}>
            <div style={styles.metaItem}>
              <ApiOutlined style={styles.metaIcon} />
              <Text style={{ fontSize: 12 }}>API: </Text>
              <span style={{ ...styles.metaValue, color: '#52c41a' }}>
                {task.total_apis_num || 0}
              </span>
            </div>
            <div style={styles.metaItem}>
              <FileTextOutlined style={styles.metaIcon} />
              <Text style={{ fontSize: 12 }}>用例: </Text>
              <span style={{ ...styles.metaValue, color: '#52c41a' }}>
                {task.total_cases_num || 0}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>P</span>
              <Text style={{ fontSize: 12 }}>优先级: </Text>
              <span
                style={{ ...styles.metaValue, ...getLevelStyle(task.level) }}
              >
                {task.level || 'P3'}
              </span>
            </div>
            <div style={styles.metaItem}>
              <UserOutlined style={styles.metaIcon} />
              <Text style={{ fontSize: 12 }}>创建人: </Text>
              <span style={styles.metaValue}>{task.creatorName || '-'}</span>
            </div>
            <div style={styles.metaItem}>
              <ClockCircleOutlined style={styles.metaIcon} />
              <Text style={{ fontSize: 12 }}>时间: </Text>
              <span style={styles.metaValue}>{task.create_time || '-'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobTasksList;
