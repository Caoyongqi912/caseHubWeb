import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import ApiTaskChoiceTable from '@/pages/Httpx/Scheduler/APITaskChoiceTable';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { ProFormDateTimePicker } from '@ant-design/pro-form';
import { message } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
}

const ConfigForm: FC<SelfProps> = (props) => {
  const { currentProjectId } = props;
  const [jobType, setJobType] = useState<number>(1);
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([]);

  useEffect(() => {
    if (!currentProjectId) return;
    queryEnvBy({ project_id: currentProjectId } as IEnv).then(
      async ({ code, data }) => {
        if (code === 0) {
          setApiEnvs(
            data.map((item: IEnv) => ({
              value: item.id,
              label: item.name,
            })),
          );
        }
      },
    );
  }, [currentProjectId]);

  const setJobs = (rowKeys: React.Key[]) => {
    setSelectedRowKeys(rowKeys);
    if (formMapRef.current[1]?.current) {
      formMapRef.current[1].current?.setFieldsValue({
        jobs: rowKeys,
      });
    }
  };

  return (
    <StepsForm
      formMapRef={formMapRef}
      onFinish={(values) => {
        console.log(values);
        return Promise.resolve(true);
      }}
    >
      <StepsForm.StepForm name="step0" title="基础信息">
        <ProFormRadio.Group
          width="lg"
          label="任务类型"
          name="type"
          required={true}
          rules={[{ required: true, message: '请选择任务类型' }]}
          options={[
            {
              label: 'API',
              value: 1,
            },
            {
              label: 'UI',
              value: 2,
            },
          ]}
          fieldProps={{
            onChange: ({ target }) => {
              setJobType(target.value);
            },
          }}
        />
        <ProFormSelect
          width="lg"
          required={true}
          label="运行环境"
          name={'env'}
          placeholder="请选择运行环境"
          allowClear
          showSearch
          options={apiEnvs}
          rules={[{ required: true, message: '请选择运行环境' }]}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        formKey={'jobs'}
        name="step1"
        title="选择任务"
        onFinish={async (values) => {
          console.log(values);
          if (selectedRowKeys.length === 0) {
            message.error('请选择任务');
            return false;
          } else return true;
        }}
      >
        <ProFormSelect name={'jobs'} hidden={true} />
        {jobType === 1 ? (
          <ApiTaskChoiceTable
            currentProjectId={currentProjectId}
            setJobs={setJobs}
          />
        ) : (
          <></>
        )}
      </StepsForm.StepForm>

      <StepsForm.StepForm name="step3" title="设置定时">
        <ProForm.Group>
          <ProFormSelect
            name="triggerType"
            label="触发类型"
            required
            rules={[{ required: true, message: '请选择触发类型' }]}
            options={[
              { label: '单次执行', value: 'once' },
              { label: '周期执行', value: 'cron' },
              { label: '固定频率', value: 'fixedRate' },
            ]}
            fieldProps={{
              onChange: (value) => {
                // 可以根据不同类型显示不同的表单字段
              },
            }}
          />

          <ProFormSelect
            name="executeStrategy"
            label="执行策略"
            tooltip="当任务正在执行时，新触发的任务如何处理"
            options={[
              { label: '并行执行', value: 'parallel' },
              { label: '跳过执行', value: 'skip' },
              { label: '等待执行', value: 'wait' },
            ]}
            initialValue="parallel"
          />
        </ProForm.Group>

        {/* 单次执行配置 */}
        <ProFormDependency name={['triggerType']}>
          {({ triggerType }) => {
            if (triggerType === 'once') {
              return (
                <ProForm.Group>
                  <ProFormDateTimePicker
                    name="executeTime"
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

        {/* Cron表达式配置 */}
        <ProFormDependency name={['triggerType']}>
          {({ triggerType }) => {
            if (triggerType === 'cron') {
              return (
                <ProForm.Group>
                  <ProFormText
                    name="cronExpression"
                    label="Cron表达式"
                    required
                    rules={[
                      { required: true, message: '请输入Cron表达式' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          // 简单的Cron表达式验证
                          const cronRegex =
                            /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
                          if (cronRegex.test(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Cron表达式格式不正确'),
                          );
                        },
                      },
                    ]}
                    tooltip={
                      <div>
                        <div>格式: 秒 分 时 日 月 周</div>
                        <div>示例:</div>
                        <div>0 0 12 * * ? - 每天12点执行</div>
                        <div>0 0/5 * * * ? - 每5分钟执行</div>
                        <div>0 0 9-18 * * ? - 每天9点到18点整点执行</div>
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

        {/* 固定频率配置 */}
        <ProFormDependency name={['triggerType']}>
          {({ triggerType }) => {
            if (triggerType === 'fixedRate') {
              return (
                <ProForm.Group>
                  <ProFormDigit
                    name="interval"
                    label="执行间隔"
                    required
                    rules={[{ required: true, message: '请输入执行间隔' }]}
                    fieldProps={{
                      addonAfter: '秒',
                      min: 1,
                      max: 86400,
                    }}
                    tooltip="任务执行的固定时间间隔"
                  />

                  <ProFormDigit
                    name="initialDelay"
                    label="初始延迟"
                    fieldProps={{
                      addonAfter: '秒',
                      min: 0,
                      max: 3600,
                    }}
                    tooltip="第一次执行前的延迟时间"
                  />
                </ProForm.Group>
              );
            }
            return null;
          }}
        </ProFormDependency>

        {/* 通用配置 */}
        <ProForm.Group>
          <ProFormDigit
            name="maxRetryCount"
            label="最大重试次数"
            initialValue={0}
            fieldProps={{
              min: 0,
              max: 10,
            }}
            tooltip="任务执行失败时的最大重试次数"
          />

          <ProFormDigit
            name="retryInterval"
            label="重试间隔"
            initialValue={60}
            fieldProps={{
              addonAfter: '秒',
              min: 0,
              max: 3600,
            }}
            tooltip="任务执行失败后的重试间隔时间"
          />

          <ProFormSwitch
            name="enabled"
            label="立即启用"
            initialValue={true}
            tooltip="是否立即启用该定时任务"
          />
        </ProForm.Group>
      </StepsForm.StepForm>
      <StepsForm.StepForm title="通知配置" name="step4">
        <>
          <ProFormSelect
            name="notifyType"
            label="通知方式"
            options={[
              { label: '不通知', value: 'none' },
              { label: '邮件通知', value: 'email' },
              { label: '企业微信', value: 'wechat' },
              { label: '钉钉', value: 'dingtalk' },
            ]}
            initialValue="none"
          />

          <ProFormDependency name={['notifyType']}>
            {({ notifyType }) => {
              if (notifyType !== 'none') {
                return (
                  <ProFormSelect
                    name="notifyOn"
                    label="通知时机"
                    mode="multiple"
                    options={[
                      { label: '任务开始', value: 'start' },
                      { label: '任务成功', value: 'success' },
                      { label: '任务失败', value: 'failure' },
                    ]}
                    initialValue={['failure']}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
        </>
      </StepsForm.StepForm>
    </StepsForm>
  );
};
export default ConfigForm;
