import { IObjGet } from '@/api';
import { switch_job, update_aps_job } from '@/api/base/aps';
import MyModal from '@/components/MyModal';
import { IJob } from '@/pages/Project/types';
import TriggerTypeForm from '@/pages/Scheduler/Job/JobForm/TriggerTypeForm';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FieldTimeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Form, Switch, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

const job_execute_interval_unit: IObjGet = {
  seconds: '秒',
  minutes: '分',
  hours: '时',
  weeks: '周',
};

const TRIGGER_CONFIG: Record<number, any> = {
  1: {
    label: '单次执行',
    shortLabel: '单次',
    getContent: (record: IJob) => record.job_execute_time,
    getFormattedContent: (record: IJob) => record.job_execute_time,
    icon: <ClockCircleOutlined />,
    gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    bg: '#e6f7ff',
    color: '#1890ff',
  },
  2: {
    label: '周期执行',
    shortLabel: '周期',
    getContent: (record: IJob) => record.job_execute_cron,
    getFormattedContent: (record: IJob) => record.job_execute_cron,
    icon: <SyncOutlined />,
    gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    bg: '#f6ffed',
    color: '#52c41a',
  },
  3: {
    label: '固定频率',
    shortLabel: '频率',
    getContent: (record: IJob) => record.job_execute_interval,
    getFormattedContent: (record: IJob) =>
      `${record.job_execute_interval}${
        job_execute_interval_unit[record.job_execute_interval_unit] || '秒'
      }`,
    icon: <FieldTimeOutlined />,
    gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
    bg: '#fff7e6',
    color: '#fa8c16',
  },
};

const TriggerType: FC<{
  record: IJob;
  callback: () => void;
}> = ({ record, callback }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [hovered, setHovered] = useState(false);

  const triggerType = record.job_trigger_type;
  const config = TRIGGER_CONFIG[triggerType] || TRIGGER_CONFIG[1];

  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
        minHeight: 32,
      },
      typeBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 8,
        background: config.gradient,
        boxShadow: `0 2px 6px ${config.color}40`,
        flexShrink: 0,
      },
      contentWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 0,
      },
      typeTag: {
        padding: '2px 8px',
        borderRadius: 4,
        background: config.bg,
        color: config.color,
        fontSize: 10,
        fontWeight: 600,
        whiteSpace: 'nowrap' as const,
      },
      contentBox: {
        padding: '2px 8px',
        borderRadius: 4,
        background: token.colorFillAlter,
        fontSize: 11,
        maxWidth: 100,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
        fontFamily: triggerType === 2 ? 'monospace' : 'inherit',
        border: `1px solid ${token.colorBorderSecondary}`,
      },
      rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      },
      nextRun: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        background: record.job_enabled
          ? 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
          : token.colorFillAlter,
        border: `1px solid ${
          record.job_enabled ? '#b7eb8f' : token.colorBorderSecondary
        }`,
      },
      nextRunIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: 4,
        background: record.job_enabled ? '#52c41a' : token.colorTextDisabled,
        color: '#fff',
        fontSize: 9,
      },
      switchWrap: {
        display: 'flex',
        alignItems: 'center',
        padding: '3px 6px',
        borderRadius: 6,
        background: record.job_enabled
          ? token.colorSuccessBg
          : token.colorFillAlter,
        border: `1px solid ${
          record.job_enabled
            ? token.colorSuccessBorder
            : token.colorBorderSecondary
        }`,
      },
      editBtn: {
        width: 26,
        height: 26,
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 2px 6px ${token.colorPrimary}30`,
        transition: 'all 0.2s',
      },
    }),
    [token, config, triggerType, record.job_enabled],
  );

  const formatNextRunTime = (time: string) => {
    if (!time) return { display: '无计划', short: '-', isFuture: false };

    const date = new Date(time);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);

    if (diffMs > 0) {
      if (diffHours < 1) {
        const mins = Math.round(diffHours * 60);
        return {
          display: `${mins}分钟后执行`,
          short: `${mins}分`,
          isFuture: true,
        };
      } else if (diffHours < 24) {
        const hrs = Math.round(diffHours);
        return {
          display: `${hrs}小时后执行`,
          short: `${hrs}时`,
          isFuture: true,
        };
      } else {
        const days = Math.floor(diffHours / 24);
        return {
          display: `${days}天后执行`,
          short: `${days}天`,
          isFuture: true,
        };
      }
    }
    return { display: '已过期', short: '过期', isFuture: false };
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
    <div
      style={styles.container}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tooltip title={config.label}>
        <div style={styles.typeBadge}>{config.icon}</div>
      </Tooltip>

      <div style={styles.contentWrapper}>
        <span style={styles.typeTag}>{config.shortLabel}</span>
        <Tooltip title={config.getFormattedContent(record)}>
          <Text style={styles.contentBox}>
            {config.getFormattedContent(record) || '-'}
          </Text>
        </Tooltip>
      </div>

      <div style={styles.rightSection}>
        <Tooltip title={nextRunInfo.display}>
          <div style={styles.nextRun}>
            <div style={styles.nextRunIcon}>
              {record.job_enabled ? (
                <CheckCircleOutlined />
              ) : (
                <ClockCircleOutlined />
              )}
            </div>
            <Text
              style={{
                fontSize: 10,
                color: record.job_enabled
                  ? '#52c41a'
                  : token.colorTextSecondary,
                fontWeight: 500,
              }}
            >
              {nextRunInfo.short}
            </Text>
          </div>
        </Tooltip>

        <div style={styles.switchWrap}>
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
        </div>

        <MyModal
          onFinish={updateJobTrigger}
          trigger={
            <div style={{ ...styles.editBtn, opacity: hovered ? 1 : 0 }}>
              <EditOutlined style={{ fontSize: 11 }} />
            </div>
          }
          form={form}
        >
          <TriggerTypeForm />
        </MyModal>
      </div>
    </div>
  );
};

export default TriggerType;
