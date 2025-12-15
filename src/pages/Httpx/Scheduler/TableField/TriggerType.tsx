import { IObjGet } from '@/api';
import { switch_job, update_aps_job } from '@/api/base/aps';
import MyModal from '@/components/MyModal';
import TriggerTypeForm from '@/pages/Httpx/Scheduler/JobForm/TriggerTypeForm';
import { IJob } from '@/pages/Project/types';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FieldTimeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Form, Space, Statistic, Switch, Tag, Tooltip, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const job_execute_interval_unit: IObjGet = {
  seconds: '秒',
  minutes: '分',
  hours: '时',
  weeks: '周',
};

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
      `${record.job_execute_interval} ${
        job_execute_interval_unit[record.job_execute_interval_unit]
      }`,
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
  const [form] = Form.useForm();
  const [showEdit, setShowEdit] = useState(false);
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

  const updateJobTrigger = async (values: any) => {
    const { code } = await update_aps_job({
      ...values,
      uid: record.uid,
    });
    if (code === 0) {
      callback();
    }
    return true;
  };
  return (
    <>
      <ProCard
        size="small"
        bordered
        style={{
          borderRadius: '6px',
        }}
        onMouseEnter={() => setShowEdit(true)}
        onMouseLeave={() => setShowEdit(false)}
        bodyStyle={{
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* 第一行：类型标签和操作按钮 */}
        <Space
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Space align="center" size={4}>
            <Tooltip title={config.tooltip}>
              <Tag
                color={config.color}
                icon={config.icon}
                style={{
                  margin: 0,
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '11px',
                  padding: '1px 6px',
                  height: '20px',
                  lineHeight: '18px',
                }}
              >
                {config.label}
              </Tag>
            </Tooltip>
            {showEdit && (
              <MyModal
                onFinish={updateJobTrigger}
                trigger={
                  <Tooltip title="编辑触发器">
                    <a
                      style={{
                        fontSize: '11px',
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#722ed1',
                      }}
                    >
                      <EditOutlined
                        style={{ fontSize: '10px', marginRight: '2px' }}
                      />
                      编辑
                    </a>
                  </Tooltip>
                }
                form={form}
              >
                <TriggerTypeForm />
              </MyModal>
            )}
          </Space>

          <Space align="center" size={4}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              {record.job_enabled ? '已启用' : '已禁用'}
            </Text>
            <Switch
              size="small"
              value={record.job_enabled}
              onChange={async (checked) => {
                const { code } = await switch_job({
                  job_id: record.uid,
                  enable: checked,
                });
                if (code === 0) {
                  callback();
                }
              }}
            />
          </Space>
        </Space>

        {/* 第二行：触发器详情 - 更紧凑 */}
        <ProCard
          bordered
          style={{
            borderRadius: '4px',
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              fontSize: '12px',
              fontFamily: triggerType === 2 ? 'monospace' : 'inherit',
              textAlign: 'center',
              fontWeight: 500,
            }}
            ellipsis={{
              rows: 1,
              tooltip: config.getFormattedContent(record),
            }}
          >
            {config.getFormattedContent(record)}
          </Paragraph>
        </ProCard>

        {/* 第三行：下次执行时间 - 更紧凑 */}
        <ProCard
          bordered
          style={{
            borderRadius: '4px',
          }}
        >
          <Space
            align="center"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <Space size={4}>
              <CalendarOutlined style={{ fontSize: '11px' }} />
              <Text
                type="secondary"
                style={{ fontSize: '11px', fontWeight: 500 }}
              >
                下次执行
              </Text>
            </Space>

            {record.next_run_time && nextRunInfo.isFuture && (
              <Tag
                color={config.color}
                style={{
                  margin: 0,
                  fontSize: '9px',
                  padding: '0 4px',
                  borderRadius: '8px',
                }}
              >
                {nextRunInfo.date?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Tag>
            )}
          </Space>

          <div style={{ textAlign: 'center' }}>
            <Text
              strong
              style={{
                fontSize: '12px',
                display: 'block',
                color: record.next_run_time ? config.color : '#bfbfbf',
                marginBottom: '2px',
              }}
            >
              {nextRunInfo.display}
            </Text>

            {record.next_run_time &&
              nextRunInfo.isFuture &&
              nextRunInfo.date && (
                <Countdown
                  title=""
                  value={nextRunInfo.date.getTime()}
                  format="HH:mm:ss"
                  valueStyle={{ fontSize: '9px' }}
                />
              )}
          </div>
        </ProCard>
      </ProCard>
    </>
  );
};

export default TriggerType;
