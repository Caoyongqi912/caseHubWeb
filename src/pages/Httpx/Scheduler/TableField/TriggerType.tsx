import { IJob } from '@/pages/Project/types';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface Props {
  record: IJob;
}

// 常量配置
const TRIGGER_CONFIG: any = {
  1: {
    label: '单次执行',
    getContent: (record: IJob) => record.job_execute_time,
    getFormattedContent: (record: IJob) => record.job_execute_time,
    icon: <ClockCircleOutlined />,
    primaryColor: '#1890ff',
    secondaryColor: '#e6f7ff',
    tertiaryColor: '#91d5ff',
    tooltip: '任务将在指定时间执行一次',
  },
  2: {
    label: '周期执行',
    getContent: (record: IJob) => record.job_execute_cron,
    getFormattedContent: (record: IJob) => record.job_execute_cron,
    icon: <SyncOutlined />,
    primaryColor: '#52c41a',
    secondaryColor: '#f6ffed',
    tertiaryColor: '#b7eb8f',
    tooltip: '任务将按照Cron表达式周期执行',
  },
  3: {
    label: '固定频率',
    getContent: (record: IJob) => record.job_execute_interval,
    getFormattedContent: (record: IJob) =>
      `${record.job_execute_interval} 小时`,
    icon: <FieldTimeOutlined />,
    primaryColor: '#fa8c16',
    secondaryColor: '#fff7e6',
    tertiaryColor: '#ffd591',
    tooltip: '任务将按照固定频率执行',
  },
};

const TriggerType: FC<Props> = ({ record }) => {
  const triggerType = record.job_trigger_type;

  const config = TRIGGER_CONFIG[triggerType] || TRIGGER_CONFIG[1];
  // 格式化下次执行时间
  const formatNextRunTime = (time: string) => {
    if (!time) return '暂无';
    const date = new Date(time);
    const now = new Date();
    // @ts-ignore
    const diffHours = Math.abs(date - now) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)}分钟后`;
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)}小时后`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Tooltip title={config.tooltip}>
      <ProCard
        size="small"
        bodyStyle={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: config.secondaryColor,
          border: `1px solid ${config.primaryColor}20`,
        }}
        style={{
          border: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {/* 触发器类型和信息 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <Tag
                  color={config.primaryColor}
                  style={{
                    margin: 0,
                    borderRadius: '4px',
                    fontWeight: 500,
                    fontSize: '12px',
                  }}
                >
                  {config.label}
                </Tag>
              </div>

              <Text
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontFamily: triggerType === 2 ? 'monospace' : 'inherit',
                  color: '#333',
                  backgroundColor: 'white',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${config.primaryColor}30`,
                  lineHeight: '1.4',
                }}
              >
                {config.getFormattedContent(record)}
              </Text>
            </div>
          </div>

          {/* 下次执行时间 - 作为独立区域显示 */}
          <div
            style={{
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <CalendarOutlined
                style={{
                  color: config.primaryColor,
                  marginRight: '6px',
                  fontSize: '12px',
                }}
              />
              <Text
                type="secondary"
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                下次执行
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                strong
                style={{
                  fontSize: '12px',
                  color: record.next_run_time ? config.primaryColor : '#999',
                }}
              >
                {record.next_run_time
                  ? formatNextRunTime(record.next_run_time)
                  : '暂无计划'}
              </Text>

              {record.next_run_time && (
                <Tag
                  color={config.primaryColor}
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {new Date(record.next_run_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Tag>
              )}
            </div>

            {record.next_run_time && (
              <div
                style={{
                  fontSize: '10px',
                  color: '#999',
                  marginTop: '2px',
                }}
              >
                {new Date(record.next_run_time).toLocaleDateString()}
              </div>
            )}
          </div>
        </Space>
      </ProCard>
    </Tooltip>
  );
};

export default TriggerType;
