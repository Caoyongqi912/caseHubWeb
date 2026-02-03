import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { ProFormDateTimePicker } from '@ant-design/pro-form';
import moment from 'moment/moment';

const TriggerType = {
  once: 1,
  cron: 2,
  fixedRate: 3,
};

/**
 * 触发类型表单组件
 * 用于配置定时任务的触发类型和执行策略
 *
 * 功能特性：
 * - 支持单次执行、周期执行、固定频率三种触发类型
 * - 支持配置执行策略（并行、跳过、等待）
 * - 支持配置重试次数和重试间隔
 */
const TriggerTypeForm = () => {
  return (
    <>
      <ProForm.Group>
        <ProFormSelect
          name="job_trigger_type"
          label="触发类型"
          required
          width="md"
          rules={[{ required: true, message: '请选择触发类型' }]}
          options={[
            { label: '单次执行', value: 1 },
            { label: '周期执行', value: 2 },
            { label: '固定频率', value: 3 },
          ]}
          fieldProps={{
            onChange: (value) => {},
          }}
        />

        <ProFormSelect
          name="job_execute_strategy"
          label="执行策略"
          width="md"
          tooltip="当任务正在执行时，新触发的任务如何处理"
          options={[
            { label: '并行执行', value: 2 },
            { label: '跳过执行', value: 1 },
            { label: '等待执行', value: 3 },
          ]}
          initialValue={2}
        />
      </ProForm.Group>

      <ProFormDependency name={['job_trigger_type']}>
        {({ job_trigger_type }) => {
          if (job_trigger_type === TriggerType.once) {
            return (
              <ProForm.Group>
                <ProFormDateTimePicker
                  name="job_execute_time"
                  label="执行时间"
                  required
                  rules={[{ required: true, message: '请选择执行时间' }]}
                  fieldProps={{
                    format: 'YYYY-MM-DD HH:mm:ss',
                    showTime: true,
                    disabledDate: (current) => {
                      return current && current < moment().startOf('day');
                    },
                  }}
                />
              </ProForm.Group>
            );
          }
          return null;
        }}
      </ProFormDependency>

      <ProFormDependency name={['job_trigger_type']}>
        {({ job_trigger_type }) => {
          if (job_trigger_type === TriggerType.cron) {
            return (
              <ProForm.Group>
                <ProFormText
                  name="job_execute_cron"
                  label="Cron表达式"
                  required
                  rules={[{ required: true, message: '请输入Cron表达式' }]}
                  tooltip={
                    <div>
                      <div>格式: 分 时 日 月 周</div>
                      <div>示例:</div>
                      <div>0 12 * * * - 每天12点执行</div>
                      <div>5 * * * * - 每5分钟执行</div>
                    </div>
                  }
                  placeholder="例如: 0 0 12 * * ?"
                />
              </ProForm.Group>
            );
          }
          return null;
        }}
      </ProFormDependency>

      <ProFormDependency name={['job_trigger_type']}>
        {({ job_trigger_type }) => {
          if (job_trigger_type === TriggerType.fixedRate) {
            return (
              <ProForm.Group>
                <ProFormDigit
                  name="job_execute_interval"
                  label="执行间隔"
                  width="md"
                  required
                  rules={[{ required: true, message: '请输入执行间隔' }]}
                  fieldProps={{
                    addonAfter: (
                      <ProFormSelect
                        initialValue="seconds"
                        noStyle
                        name="job_execute_interval_unit"
                        options={[
                          { label: '秒', value: 'seconds' },
                          { label: '分', value: 'minutes' },
                          { label: '时', value: 'hours' },
                          { label: '周', value: 'weeks' },
                        ]}
                      />
                    ),
                    min: 1,
                    max: 2000,
                  }}
                  tooltip="任务执行的固定时间间隔"
                />
              </ProForm.Group>
            );
          }
          return null;
        }}
      </ProFormDependency>

      <ProForm.Group>
        <ProFormDigit
          name="job_max_retry_count"
          label="最大重试次数"
          initialValue={0}
          fieldProps={{
            min: 0,
            max: 10,
          }}
          tooltip="任务执行失败时的最大重试次数"
        />

        <ProFormDigit
          name="job_retry_interval"
          label="重试间隔"
          initialValue={60}
          fieldProps={{
            addonAfter: '秒',
            min: 0,
            max: 3600,
          }}
          tooltip="任务执行失败后的重试间隔时间"
        />
      </ProForm.Group>
    </>
  );
};

export default TriggerTypeForm;
