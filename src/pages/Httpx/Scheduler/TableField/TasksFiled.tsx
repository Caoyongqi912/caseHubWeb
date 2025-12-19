import { query_tasks_by_job } from '@/api/base/aps';
import { IInterfaceAPITask } from '@/pages/Httpx/types';
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
import { ProCard } from '@ant-design/pro-components';
import {
  Badge,
  Divider,
  Empty,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

interface Props {
  job_uid: string;
  refreshFlag?: number;
}

const TasksFiled: FC<Props> = ({ job_uid, refreshFlag }) => {
  const [jobTasks, setJobTasks] = useState<IInterfaceAPITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
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

  // 状态配置
  const getStatusConfig = (status: string) => {
    const config: Record<string, any> = {
      WAIT: {
        color: 'orange',
        label: '等待',
        icon: <ClockCircleFilled />,
      },
      RUNNING: {
        color: 'blue',
        label: '运行中',
        icon: <PlayCircleFilled />,
      },
      SUCCESS: {
        color: 'green',
        label: '成功',
        icon: <CheckCircleFilled />,
      },
      FAILED: {
        color: 'red',
        label: '失败',
        icon: <CloseCircleFilled />,
      },
      STOP: {
        color: 'gray',
        label: '停止',
        icon: <PauseCircleFilled />,
      },
    };
    return (
      config[status] || {
        color: 'default',
        label: status,
        icon: <ClockCircleFilled />,
      }
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin tip="加载任务中..." size="small" />
      </div>
    );
  }

  if (!jobTasks || jobTasks.length === 0) {
    return (
      <ProCard style={{ padding: '16px' }}>
        <Empty
          description="暂无任务"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: 0 }}
        />
      </ProCard>
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
      {/* 紧凑统计头部 */}
      <ProCard
        size="small"
        bordered
        style={{
          borderRadius: '6px',
          marginBottom: '8px',
        }}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Text strong style={{ fontSize: '12px' }}>
              任务列表
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: '11px', marginLeft: '8px' }}
            >
              {jobTasks.length} 个任务
            </Text>
          </div>
          <Space size={16}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#1890ff' }}
              >
                {totalCases}
              </div>
              <div style={{ fontSize: '15px', color: '#8c8c8c' }}>用例</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#722ed1' }}
              >
                {totalApis}
              </div>
              <div style={{ fontSize: '15px', color: '#8c8c8c' }}>接口</div>
            </div>
          </Space>
        </Space>
      </ProCard>

      {/* 紧凑任务列表 */}
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        {jobTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const totalCases = task.total_cases_num || 0;
          const totalApis = task.total_apis_num || 0;
          return (
            <ProCard
              key={task.id || task.uid}
              size="small"
              bordered
              onMouseEnter={() => setShowEditor(true)}
              onMouseLeave={() => setShowEditor(false)}
              style={{
                borderRadius: '6px',
              }}
              bodyStyle={{
                padding: '8px 12px',
                backgroundColor: statusConfig.bgColor,
              }}
            >
              {/* 第一行：标题和状态 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '6px',
                }}
              >
                <Space>
                  <Text
                    strong
                    style={{
                      fontSize: '16px',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    ellipsis={{ tooltip: task.title }}
                  >
                    {task.title || '未命名任务'}
                  </Text>
                  {showEditor && (
                    <DeleteOutlined
                      style={{ color: statusConfig.color }}
                      onClick={() => {
                        console.log(task);
                      }}
                    />
                  )}
                </Space>
                <Badge
                  status={statusConfig.color as any}
                  text={
                    <Tag
                      color={statusConfig.color}
                      icon={statusConfig.icon}
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        padding: '0 6px',
                        height: '20px',
                        lineHeight: '20px',
                      }}
                    >
                      {statusConfig.label}
                    </Tag>
                  }
                />
              </div>

              {/* 第二行：数据指标和创建信息 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                }}
              >
                <Space size={12}>
                  <Tooltip title="用例数">
                    <Space size={4}>
                      <FileTextOutlined
                        style={{ fontSize: '15px', color: '#1890ff' }}
                      />
                      <Text style={{ color: '#1890ff', fontWeight: 500 }}>
                        {totalCases}
                      </Text>
                    </Space>
                  </Tooltip>

                  <Tooltip title="接口数">
                    <Space size={4}>
                      <ApiOutlined
                        style={{ fontSize: '15px', color: '#722ed1' }}
                      />
                      <Text style={{ color: '#722ed1', fontWeight: 500 }}>
                        {totalApis}
                      </Text>
                    </Space>
                  </Tooltip>

                  <Divider
                    type="vertical"
                    style={{ margin: 0, height: '12px' }}
                  />

                  <Tooltip title="创建人">
                    <Space size={2}>
                      <UserOutlined style={{ fontSize: '15px' }} />
                      <Text type="secondary">
                        {task.creatorName || 'admin'}
                      </Text>
                    </Space>
                  </Tooltip>

                  <Tooltip title="创建时间">
                    <Space size={2}>
                      <ClockCircleOutlined style={{ fontSize: '15px' }} />
                      <Text type="secondary">
                        {task.create_time
                          ? task.create_time.split(' ')[0].replace(/-/g, '/')
                          : 'N/A'}
                      </Text>
                    </Space>
                  </Tooltip>
                </Space>

                <Tooltip title={`ID: ${task.uid}`}>
                  <Text
                    type="secondary"
                    style={{
                      fontFamily: 'monospace',
                      padding: '1px 4px',
                      borderRadius: '2px',
                    }}
                  >
                    {task.uid}
                  </Text>
                </Tooltip>
              </div>
            </ProCard>
          );
        })}
      </Space>
    </div>
  );
};

export default TasksFiled;
