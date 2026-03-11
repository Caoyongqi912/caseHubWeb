import { IObjGet } from '@/api';
import { switch_job, update_aps_job } from '@/api/base/aps';
import MyModal from '@/components/MyModal';
import { IJob } from '@/pages/Project/types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FieldTimeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  DatePicker,
  Form,
  InputNumber,
  message,
  Select,
  Switch,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import { FC, useEffect, useMemo, useState } from 'react';

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

const TriggerType: FC<{ record: IJob; callback: () => void }> = ({
  record,
  callback,
}) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [triggerType, setTriggerType] = useState(record.job_trigger_type ?? 1);

  useEffect(() => {
    if (!record) return;
    form.setFieldsValue(record);
    setTriggerType(record.job_trigger_type ?? 1);
  }, [record, form]);

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
      formItem: {
        marginBottom: 16,
      },
      formLabel: {
        marginBottom: 8,
        fontWeight: 500,
        color: token.colorText,
      },
      formRow: {
        display: 'flex',
        gap: 16,
      },
      formRowItem: {
        flex: 1,
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
    const { code } = await update_aps_job({ ...values, uid: record.uid });
    if (code === 0) {
      message.success('保存成功');
      callback();
    }
    return true;
  };

  const renderForm = () => (
    <>
      <div style={styles.formRow}>
        <div style={styles.formRowItem}>
          <div style={styles.formLabel}>触发类型</div>
          <Select
            value={triggerType}
            onChange={(value) => {
              setTriggerType(value);
              form.setFieldsValue({ job_trigger_type: value });
            }}
            options={[
              { label: '单次执行', value: 1 },
              { label: '周期执行', value: 2 },
              { label: '固定频率', value: 3 },
            ]}
          />
          <Form.Item name="job_trigger_type" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>

        <div style={styles.formRowItem}>
          <div style={styles.formLabel}>执行策略</div>
          <Select
            defaultValue={record.job_execute_strategy ?? 2}
            onChange={(value) =>
              form.setFieldsValue({ job_execute_strategy: value })
            }
            options={[
              { label: '并行执行', value: 2 },
              { label: '跳过执行', value: 1 },
              { label: '等待执行', value: 3 },
            ]}
          />
          <Form.Item name="job_execute_strategy" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>
      </div>

      {triggerType === 1 && (
        <div style={styles.formItem}>
          <div style={styles.formLabel}>执行时间</div>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            disabledDate={(current) =>
              current && current < moment().startOf('day')
            }
            onChange={(_, dateString) =>
              form.setFieldsValue({ job_execute_time: dateString })
            }
          />
          <Form.Item name="job_execute_time" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>
      )}

      {triggerType === 2 && (
        <div style={styles.formItem}>
          <div style={styles.formLabel}>Cron表达式</div>
          <Select
            placeholder="例如: 0 0 12 * * ?"
            onChange={(value) =>
              form.setFieldsValue({ job_execute_cron: value })
            }
            options={[
              { label: '每分钟 (0 * * * * *)', value: '0 * * * * *' },
              { label: '每小时 (0 0 * * * *)', value: '0 0 * * * *' },
              { label: '每天12点 (0 0 12 * * *)', value: '0 0 12 * * *' },
            ]}
            showSearch
            allowClear
          />
          <Form.Item name="job_execute_cron" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>
      )}

      {triggerType === 3 && (
        <div style={styles.formRow}>
          <div style={styles.formRowItem}>
            <div style={styles.formLabel}>执行间隔</div>
            <InputNumber
              min={1}
              max={2000}
              style={{ width: '100%' }}
              addonAfter={
                <Select
                  defaultValue={record.job_execute_interval_unit ?? 'seconds'}
                  style={{ width: 60 }}
                  onChange={(value) =>
                    form.setFieldsValue({ job_execute_interval_unit: value })
                  }
                  options={[
                    { label: '秒', value: 'seconds' },
                    { label: '分', value: 'minutes' },
                    { label: '时', value: 'hours' },
                    { label: '周', value: 'weeks' },
                  ]}
                />
              }
              onChange={(value) =>
                form.setFieldsValue({ job_execute_interval: value })
              }
            />
            <Form.Item name="job_execute_interval" noStyle>
              <input type="hidden" />
            </Form.Item>
            <Form.Item name="job_execute_interval_unit" noStyle>
              <input type="hidden" />
            </Form.Item>
          </div>
        </div>
      )}

      <div style={styles.formRow}>
        <div style={styles.formRowItem}>
          <div style={styles.formLabel}>最大重试次数</div>
          <InputNumber
            min={0}
            max={10}
            style={{ width: '100%' }}
            defaultValue={record.job_max_retry_count ?? 0}
            onChange={(value) =>
              form.setFieldsValue({ job_max_retry_count: value })
            }
          />
          <Form.Item name="job_max_retry_count" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>

        <div style={styles.formRowItem}>
          <div style={styles.formLabel}>重试间隔(秒)</div>
          <InputNumber
            min={0}
            max={3600}
            style={{ width: '100%' }}
            defaultValue={record.job_retry_interval ?? 60}
            onChange={(value) =>
              form.setFieldsValue({ job_retry_interval: value })
            }
          />
          <Form.Item name="job_retry_interval" noStyle>
            <input type="hidden" />
          </Form.Item>
        </div>
      </div>
    </>
  );

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
              if (code === 0) callback();
            }}
          />
        </div>

        <div
          style={{ ...styles.editBtn, opacity: hovered ? 1 : 0 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <EditOutlined style={{ fontSize: 11 }} />
        </div>
      </div>

      <MyModal
        onFinish={updateJobTrigger}
        setOpen={setOpen}
        open={open}
        form={form}
      >
        {renderForm()}
      </MyModal>
    </div>
  );
};

export default TriggerType;
