import { query_tasks_by_job } from '@/api/base/aps';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Empty, Spin, Tag, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  job_uid: string;
}

const TasksFiled: FC<Props> = ({ job_uid }) => {
  const [jobTasks, setJobTasks] = useState<IInterfaceAPITask[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, [job_uid]);

  // 状态颜色配置
  const getStatusConfig = (status: string) => {
    const config = {
      WAIT: { color: '#fa8c16', label: '等待' },
      RUNNING: { color: '#1890ff', label: '运行中' },
      SUCCESS: { color: '#52c41a', label: '成功' },
      FAILED: { color: '#f5222d', label: '失败' },
      STOP: { color: '#d9d9d9', label: '停止' },
    };
    return (
      config[status as keyof typeof config] || {
        color: '#d9d9d9',
        label: status,
      }
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin tip="加载任务中..." />
      </div>
    );
  }

  if (!jobTasks || jobTasks.length === 0) {
    return (
      <div style={{ padding: '12px' }}>
        <Empty
          description="暂无任务数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // 计算统计
  const totalCases = jobTasks.reduce(
    (sum, task) => sum + (task.total_cases_num || 0),
    0,
  );
  const totalApis = jobTasks.reduce(
    (sum, task) => sum + (task.total_apis_num || 0),
    0,
  );

  return (
    <div style={{ padding: '4px' }}>
      {/* 统计标题 - 更紧凑 */}
      <div
        style={{
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Text strong style={{ fontSize: '13px', color: '#262626' }}>
            任务列表
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: '11px', marginLeft: '8px' }}
          >
            共 {jobTasks.length} 个任务
          </Text>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '13px', fontWeight: '600', color: '#1890ff' }}
            >
              {totalCases}
            </div>
            <div style={{ fontSize: '10px', color: '#8c8c8c' }}>总用例数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '13px', fontWeight: '600', color: '#722ed1' }}
            >
              {totalApis}
            </div>
            <div style={{ fontSize: '10px', color: '#8c8c8c' }}>总接口数</div>
          </div>
        </div>
      </div>

      {/* 任务卡片列表 - 更紧凑 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {jobTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const totalCases = task.total_cases_num || 0;
          const totalApis = task.total_apis_num || 0;

          return (
            <ProCard
              key={task.id || task.uid}
              size="small"
              style={{
                borderRadius: '6px',
                border: '1px solid #f0f0f0',
                margin: 0,
              }}
              bodyStyle={{ padding: '12px' }}
            >
              {/* 第一行：标题和状态 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{
                      fontSize: '13px',
                      color: '#262626',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={task.title}
                  >
                    {task.title || '未命名任务'}
                  </Text>
                  {task.desc && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: '11px',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                      title={task.desc}
                    >
                      {task.desc}
                    </Text>
                  )}
                </div>
                <Tag
                  style={{
                    margin: 0,
                    padding: '1px 6px',
                    fontSize: '11px',
                    borderRadius: '10px',
                    backgroundColor: `${statusConfig.color}10`,
                    color: statusConfig.color,
                    border: `1px solid ${statusConfig.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    height: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: statusConfig.color,
                      marginRight: '4px',
                    }}
                  />
                  {statusConfig.label}
                </Tag>
              </div>

              {/* 第二行：数据指标 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    padding: '6px',
                    backgroundColor: '#f0f5ff',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1890ff',
                    }}
                  >
                    {totalCases}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                    用例数
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px',
                    backgroundColor: '#f9f0ff',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#722ed1',
                    }}
                  >
                    {totalApis}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                    接口数
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px',
                    backgroundColor: '#f6ffed',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#389e0d',
                    }}
                  >
                    {totalCases + totalApis}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8c8c8c' }}>总数</div>
                </div>
              </div>

              {/* 第三行：创建信息 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10px',
                  color: '#8c8c8c',
                  paddingTop: '6px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '2px' }}>👤</span>
                    <span
                      style={{
                        maxWidth: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={task.creatorName}
                    >
                      {task.creatorName || 'admin'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '2px' }}>🕐</span>
                    {task.create_time
                      ? task.create_time.split(' ')[0].replace(/-/g, '/')
                      : 'N/A'}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: '#bfbfbf',
                    backgroundColor: '#f5f5f5',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontFamily: 'monospace',
                  }}
                  title={`ID: ${task.uid}`}
                >
                  {task.uid?.substring(0, 6) || 'N/A'}
                </div>
              </div>
            </ProCard>
          );
        })}
      </div>
    </div>
  );
};

export default TasksFiled;
