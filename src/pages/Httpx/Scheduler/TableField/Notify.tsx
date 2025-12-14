import { IObjGet } from '@/api';
import { IJob } from '@/pages/Project/types';
import {
  BellFilled,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  NotificationOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  record: IJob;
}

const Notify: FC<Props> = ({ record }) => {
  // 通知类型配置
  const notifyTypeConfig: IObjGet = {
    0: { label: '通知', color: 'success', icon: <BellFilled /> },
    1: { label: '不通知', color: 'warning', icon: <BellOutlined /> },
  };

  // 通知时机配置
  const notifyOnConfig: IObjGet = {
    0: { label: '任务开始', color: 'blue', icon: <PlayCircleOutlined /> },
    1: { label: '任务成功', color: 'green', icon: <CheckCircleOutlined /> },
    2: { label: '任务失败', color: 'red', icon: <CloseCircleOutlined /> },
  };

  const typeConfig =
    notifyTypeConfig[record.job_notify_type] || notifyTypeConfig[1];
  const notifyOnArray = Array.isArray(record.job_notify_on)
    ? record.job_notify_on
    : [];

  return (
    <ProCard
      size="small"
      layout="center"
      style={{
        borderRadius: '8px',
      }}
      bodyStyle={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* 通知名称和类型 */}
      <Space align="center" style={{ width: '100%' }}>
        <Tooltip title="推送通知">
          <NotificationOutlined
            style={{
              color: '#722ed1',
              fontSize: '14px',
              marginRight: '8px',
            }}
          />
        </Tooltip>
        <Tag
          color={typeConfig.color}
          icon={typeConfig.icon}
          style={{ margin: 0 }}
        >
          {typeConfig.label}
        </Tag>
        {record.job_notify_name && (
          <Tag color={'blue'}>{record.job_notify_name}</Tag>
        )}
      </Space>

      {/* 通知时机 */}
      {notifyOnArray.length > 0 ? (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            通知时机:
          </Text>
          <Space wrap size={[4, 4]}>
            {notifyOnArray.map((onType) => {
              const config = notifyOnConfig[onType];
              if (!config) return null;
              return (
                <Tag
                  key={onType}
                  color={config.color}
                  icon={config.icon}
                  style={{
                    margin: 0,
                    fontSize: '10px',
                    padding: '1px 6px',
                  }}
                >
                  {config.label}
                </Tag>
              );
            })}
          </Space>
        </Space>
      ) : (
        <Text
          type="secondary"
          style={{
            fontSize: '11px',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          未配置通知时机
        </Text>
      )}
    </ProCard>
  );
};

export default Notify;
