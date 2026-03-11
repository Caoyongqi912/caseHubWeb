import { query_tasks_by_job } from '@/api/base/aps';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { IUITask } from '@/pages/Play/componets/uiTypes';
import {
  ApiOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  DeleteOutlined,
  FileTextOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, Spin, theme, Tooltip, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  job_uid: string;
  type: number;
  refreshFlag?: number;
}

const TasksFiled: FC<Props> = ({ job_uid, type, refreshFlag }) => {
  const { token } = useToken();
  const [jobTasks, setJobTasks] = useState<IInterfaceAPITask[] | IUITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!job_uid) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { code, data } = await query_tasks_by_job(job_uid);
        if (code === 0) {
          setJobTasks(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [job_uid, refreshFlag]);

  const statusConfig = useMemo(
    () => ({
      WAIT: {
        color: '#fa8c16',
        bg: '#fff7e6',
        label: '等待',
        icon: <ClockCircleFilled />,
      },
      RUNNING: {
        color: '#1890ff',
        bg: '#e6f7ff',
        label: '运行',
        icon: <PlayCircleFilled />,
      },
      SUCCESS: {
        color: '#52c41a',
        bg: '#f6ffed',
        label: '成功',
        icon: <CheckCircleFilled />,
      },
      FAILED: {
        color: '#ff4d4f',
        bg: '#fff2f0',
        label: '失败',
        icon: <CloseCircleFilled />,
      },
      STOP: {
        color: '#8c8c8c',
        bg: '#fafafa',
        label: '停止',
        icon: <PauseCircleFilled />,
      },
    }),
    [],
  );

  const getStatusStyle = (status: string) => {
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.WAIT;
    return config;
  };

  const styles = useMemo(
    () => ({
      container: {
        padding: '8px 12px',
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        padding: '6px 10px',
        background: token.colorFillAlter,
        borderRadius: 6,
      },
      taskCard: (isHovered: boolean, status: string) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        marginBottom: 6,
        borderRadius: 6,
        border: `1px solid ${
          isHovered ? token.colorPrimary : token.colorBorderSecondary
        }`,
        background: getStatusStyle(status).bg,
        transition: 'all 0.2s',
        cursor: 'pointer',
      }),
      statusBadge: (status: string) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        background: getStatusStyle(status).color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap' as const,
      }),
      uidTag: {
        padding: '1px 6px',
        borderRadius: 3,
        background: token.colorFillAlter,
        color: token.colorTextSecondary,
        fontSize: 10,
        fontFamily: 'monospace',
      },
      metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
      },
      deleteBtn: {
        padding: '4px',
        borderRadius: 4,
        color: token.colorError,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      },
    }),
    [token, statusConfig],
  );

  const totalCases = useMemo(
    () =>
      jobTasks.reduce(
        (sum, task: any) =>
          sum + (type === 1 ? task.total_cases_num : task.play_case_num || 0),
        0,
      ),
    [jobTasks, type],
  );

  const totalApis = useMemo(
    () =>
      jobTasks.reduce((sum, task: any) => sum + (task.total_apis_num || 0), 0),
    [jobTasks],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <Spin size="small" />
      </div>
    );
  }

  if (!jobTasks || jobTasks.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Empty
          description="暂无关联任务"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Text strong style={{ fontSize: 12 }}>
          关联任务 ({jobTasks.length})
        </Text>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={styles.metaItem}>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: 12 }} />
            <span style={{ color: '#1890ff', fontWeight: 500 }}>
              {totalCases}
            </span>
            <Text type="secondary" style={{ fontSize: 11 }}>
              用例
            </Text>
          </div>
          {type === 1 && (
            <div style={styles.metaItem}>
              <ApiOutlined style={{ color: '#722ed1', fontSize: 12 }} />
              <span style={{ color: '#722ed1', fontWeight: 500 }}>
                {totalApis}
              </span>
              <Text type="secondary" style={{ fontSize: 11 }}>
                接口
              </Text>
            </div>
          )}
        </div>
      </div>

      {jobTasks.map((task) => {
        const isHovered = hoveredId === task.uid;
        const statusStyle = getStatusStyle(task.status);
        const taskAny = task as any;
        const cases =
          type === 1 ? taskAny.total_cases_num : taskAny.play_case_num || 0;

        return (
          <div
            key={task.uid}
            style={styles.taskCard(isHovered, task.status)}
            onMouseEnter={() => setHoveredId(task.uid)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.statusBadge(task.status)}>
              {statusStyle.icon}
              <span>{statusStyle.label}</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <Text
                  strong
                  style={{ fontSize: 13 }}
                  ellipsis={{ tooltip: task.title }}
                >
                  {task.title || '未命名任务'}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={styles.metaItem}>
                  <FileTextOutlined
                    style={{ color: '#1890ff', fontSize: 11 }}
                  />
                  <span style={{ color: '#1890ff' }}>{cases}</span>
                </span>
                {type === 1 && (
                  <span style={styles.metaItem}>
                    <ApiOutlined style={{ color: '#722ed1', fontSize: 11 }} />
                    <span style={{ color: '#722ed1' }}>
                      {taskAny.total_apis_num || 0}
                    </span>
                  </span>
                )}
                <span style={styles.metaItem}>
                  <UserOutlined
                    style={{ color: token.colorTextSecondary, fontSize: 11 }}
                  />
                  <Text type="secondary">{task.creatorName || '-'}</Text>
                </span>
                <span style={styles.metaItem}>
                  <ClockCircleOutlined
                    style={{ color: token.colorTextSecondary, fontSize: 11 }}
                  />
                  <Text type="secondary">
                    {task.create_time?.split(' ')[0] || '-'}
                  </Text>
                </span>
              </div>
            </div>

            <Tooltip title={task.uid}>
              <span style={styles.uidTag}>{task.uid?.slice(0, 8)}</span>
            </Tooltip>

            <div
              style={{ ...styles.deleteBtn, opacity: isHovered ? 1 : 0 }}
              onClick={() => console.log(task)}
            >
              <DeleteOutlined style={{ fontSize: 12 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TasksFiled;
