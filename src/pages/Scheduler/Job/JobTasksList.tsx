import { query_tasks_by_job } from '@/api/base/aps';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProCard, ProList } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Descriptions,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { FC, useEffect, useState } from 'react';

interface Props {
  jobId?: string;
  setJobs: (jobs: React.Key[]) => void;
  setShowChoiceTable: (show: boolean) => void;
}

const JobTasksList: FC<Props> = ({ setJobs, setShowChoiceTable, jobId }) => {
  const [jobTasks, setJobTasks] = useState<any[]>([]);

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

  return (
    <ProCard
      extra={
        <Button
          type="primary"
          onClick={() => setShowChoiceTable(true)}
          icon={<ReloadOutlined />}
        >
          重新选择
        </Button>
      }
    >
      <ProList
        style={{ width: '100%' }}
        rowKey="id"
        dataSource={jobTasks}
        showActions="hover"
        metas={{
          title: {
            dataIndex: 'title',
            title: '任务名称',
            render: (text, record) => (
              <Space>
                <Tag>{text}</Tag>
                <Tag color="geekblue">UID: {record.uid}</Tag>
              </Space>
            ),
          },
          avatar: {
            dataIndex: 'creatorName',
            title: '创建人',
            render: (text, record) => (
              <Tooltip title={`创建人: ${text}`}>
                <Avatar style={{ backgroundColor: '#1890ff' }} size="small">
                  {record.creatorName?.charAt(0) || 'A'}
                </Avatar>
              </Tooltip>
            ),
          },
          description: {
            dataIndex: 'desc',
            title: '描述',
            render: (text, record) => (
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                {text && (
                  <Typography.Text type="secondary">{text}</Typography.Text>
                )}
              </Space>
            ),
          },
          content: {
            render: (_, record) => (
              <div style={{ marginTop: 8 }}>
                <Descriptions size="small" column={3}>
                  <Descriptions.Item label="用例数">
                    <Tag color={'green'}>{record.total_cases_num}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="API数">
                    <Tag color={'green'}>{record.total_apis_num}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="优先级">
                    <Tag
                      color={
                        record.level === 'P1'
                          ? 'red'
                          : record.level === 'P2'
                          ? 'orange'
                          : 'blue'
                      }
                    >
                      {record.level}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {record.create_time}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          },
          actions: {
            cardActionProps: 'extra',
            render: (text, record) => [
              <Tooltip title="删除任务" key="delete">
                <Popconfirm
                  title="确定要删除这个任务吗？"
                  onConfirm={async () => await removeTask(record.uid)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>,
            ],
          },
        }}
      />
    </ProCard>
  );
};

export default JobTasksList;
