import { switch_job } from '@/api/base/aps';
import { IJob } from '@/pages/Project/types';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Statistic, Switch, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text, Paragraph } = Typography;
const { Countdown } = Statistic;

// 常量配置
const TRIGGER_CONFIG: Record<number, any> = {
  1: {
    label: '单次执行',
    getContent: (record: IJob) => record.job_execute_time,
    getFormattedContent: (record: IJob) => record.job_execute_time,
    icon: <ClockCircleOutlined />,
    color: 'blue',
    status: 'processing',
    tooltip: '任务将在指定时间执行一次',
  },
  2: {
    label: '周期执行',
    getContent: (record: IJob) => record.job_execute_cron,
    getFormattedContent: (record: IJob) => record.job_execute_cron,
    icon: <SyncOutlined />,
    color: 'green',
    status: 'success',
    tooltip: '任务将按照Cron表达式周期执行',
  },
  3: {
    label: '固定频率',
    getContent: (record: IJob) => record.job_execute_interval,
    getFormattedContent: (record: IJob) =>
      `${record.job_execute_interval} 小时`,
    icon: <FieldTimeOutlined />,
    color: 'orange',
    status: 'warning',
    tooltip: '任务将按照固定频率执行',
  },
};

const TriggerType: FC<{
  record: IJob;
  callback: () => void;
}> = ({ record, callback }) => {
  const triggerType = record.job_trigger_type;
  const config = TRIGGER_CONFIG[triggerType] || TRIGGER_CONFIG[1];

  // 格式化下次执行时间
  const formatNextRunTime = (time: string) => {
    if (!time) return { display: '暂无计划', isFuture: false };

    const date = new Date(time);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

    if (diffMs > 0) {
      // 未来时间
      if (diffHours < 1) {
        return {
          display: `${Math.round(diffHours * 60)}分钟后`,
          isFuture: true,
          date,
        };
      } else if (diffHours < 24) {
        return {
          display: `${Math.round(diffHours)}小时后`,
          isFuture: true,
          date,
        };
      } else {
        return {
          display: date.toLocaleDateString(),
          isFuture: true,
          date,
        };
      }
    } else {
      // 过去时间
      return {
        display: '已过期',
        isFuture: false,
        date,
      };
    }
  };

  const nextRunInfo = formatNextRunTime(record.next_run_time || '');

  return (
    <ProCard
      size="small"
      style={{
        borderRadius: '8px',
      }}
      bodyStyle={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* 触发器类型 */}
      <Space
        align="center"
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <Tooltip title={config.tooltip}>
          <Tag
            color={config.color}
            icon={config.icon}
            style={{
              margin: 0,
              borderRadius: '4px',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            {config.label}
          </Tag>
        </Tooltip>
        <Switch
          size={'small'}
          value={record.job_enabled}
          onChange={async (checked) => {
            const { code } = await switch_job({
              job_id: record.uid,
              enable: checked,
            });
            if (code === 0) {
              callback();
            }
            // return await setTaskAuto(checked, record.id);
          }}
        />
      </Space>

      {/* 触发器详情 */}
      <ProCard size="small" bordered bodyStyle={{ padding: '8px' }}>
        <Paragraph
          style={{
            margin: 0,
            fontFamily: triggerType === 2 ? 'monospace' : 'inherit',
            textAlign: 'center',
          }}
          ellipsis={{
            rows: 2,
            tooltip: config.getFormattedContent(record),
          }}
        >
          {config.getFormattedContent(record)}
        </Paragraph>
      </ProCard>

      {/* 下次执行时间 */}
      <ProCard
        size="small"
        title={
          <Space align="center">
            <CalendarOutlined />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              下次执行
            </Text>
          </Space>
        }
        extra={
          record.next_run_time &&
          nextRunInfo.isFuture && (
            <Tooltip title="精确时间">
              <Tag
                color={config.color}
                style={{
                  margin: 0,
                  fontSize: '10px',
                  padding: '0 6px',
                  borderRadius: '10px',
                }}
              >
                {nextRunInfo.date?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Tag>
            </Tooltip>
          )
        }
        bordered
        bodyStyle={{ padding: '8px' }}
      >
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text
            strong
            style={{
              fontSize: '12px',
              textAlign: 'center',
              display: 'block',
            }}
          >
            {nextRunInfo.display}
          </Text>

          {record.next_run_time && nextRunInfo.isFuture && nextRunInfo.date && (
            <Countdown
              title="倒计时"
              value={nextRunInfo.date.getTime()}
              format="HH:mm:ss"
              valueStyle={{
                fontSize: '10px',
              }}
            />
          )}

          {record.next_run_time && (
            <Text
              type="secondary"
              style={{ fontSize: '10px', textAlign: 'center' }}
            >
              {nextRunInfo.date?.toLocaleDateString()}
            </Text>
          )}
        </Space>
      </ProCard>
    </ProCard>
  );
};

export default TriggerType;
