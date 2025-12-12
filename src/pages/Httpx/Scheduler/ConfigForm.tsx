import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import { add_aps_job, update_aps_job } from '@/api/base/aps';
import ApiTaskChoiceTable from '@/pages/Httpx/Scheduler/APITaskChoiceTable';
import { IJob } from '@/pages/Project/types';
import {
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
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

import JobTasksList from '@/pages/Httpx/Scheduler/JobTasksList';

interface SelfProps {
  callback: () => void;
  currentModuleId?: number;
  currentProjectId?: number;
  currentJob?: IJob;
}

const TriggerType = {
  once: 1,
  cron: 2,
  fixedRate: 3,
};

const ConfigForm: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, currentJob, callback } = props;
  const [jobType, setJobType] = useState<number>(1);
  const [apiEnvs, setApiEnvs] = useState<{ value: number; label: string }[]>(
    [],
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showChoiceTable, setShowChoiceTable] = useState<boolean>(true);
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<IJob>>[]>(
    [],
  );

  useEffect(() => {
    if (!currentJob) return;
    setShowChoiceTable(false);
    setJobs(currentJob.job_task_id_list);
    formMapRef.current.map((item) => {
      item.current?.setFieldsValue(currentJob);
    });
  }, [currentJob]);

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
        job_task_id_list: rowKeys as string[],
      });
    }
  };

  const onFinishOrUpdate = async (values: IJob) => {
    console.log(values);
    //更新
    if (currentJob) {
      const { code, data, msg } = await update_aps_job({
        ...values,
        uid: currentJob.uid,
      });
      if (code === 0) {
        callback();
        message.success(msg);
        formMapRef.current[0].current?.resetFields();
        return Promise.resolve(true);
      }
    } else {
      if (currentProjectId && currentModuleId) {
        const { code, data, msg } = await add_aps_job({
          ...values,
          module_id: currentModuleId,
          project_id: currentProjectId,
        });
        if (code === 0) {
          callback();
          message.success(msg);
          formMapRef.current[0].current?.resetFields();
          return Promise.resolve(true);
        }
      }
    }
  };
  return (
    <StepsForm formMapRef={formMapRef} onFinish={onFinishOrUpdate}>
      <StepsForm.StepForm name="step0" title="基础信息">
        <ProCard bodyStyle={{ padding: 0 }}>
          <ProFormText
            width="lg"
            label="任务名称"
            name="job_name"
            placeholder="请输入任务名称"
            required
            rules={[{ required: true, message: '请输入任务名称' }]}
          />
          <ProFormRadio.Group
            width="lg"
            label="任务类型"
            name="job_type"
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
            name={'job_env_id'}
            placeholder="请选择运行环境"
            allowClear
            showSearch
            options={apiEnvs}
            rules={[{ required: true, message: '请选择运行环境' }]}
            onChange={(value) => {
              formMapRef.current[0].current?.setFieldsValue({
                job_env_name: apiEnvs.find((item) => item.value === value)
                  ?.label,
              });
            }}
          />
          <ProFormText name="job_env_name" hidden={true} />

          <ProFormList name="job_kwargs" label="运行参数">
            <ProFormGroup key="group">
              <ProFormText name="key" />
              <ProFormText name="value" />
            </ProFormGroup>
          </ProFormList>
        </ProCard>
      </StepsForm.StepForm>
      <StepsForm.StepForm
        formKey={'jobs'}
        name="step1"
        title="选择任务"
        onFinish={async (values) => {
          if (selectedRowKeys.length === 0) {
            message.error('请选择任务');
            return false;
          } else return true;
        }}
      >
        <ProFormSelect name={'job_task_id_list'} hidden={true} />
        {showChoiceTable ? (
          <>
            {jobType === 1 ? (
              <ApiTaskChoiceTable
                currentProjectId={currentProjectId}
                setJobs={setJobs}
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <JobTasksList
            setShowChoiceTable={setShowChoiceTable}
            jobId={currentJob?.uid}
            setJobs={setJobs}
          />
        )}
      </StepsForm.StepForm>

      <StepsForm.StepForm name="step3" title="设置定时">
        <ProForm.Group>
          <ProFormSelect
            name="job_trigger_type"
            label="触发类型"
            required
            width={'md'}
            rules={[{ required: true, message: '请选择触发类型' }]}
            options={[
              { label: '单次执行', value: 1 },
              { label: '周期执行', value: 2 },
              { label: '固定频率', value: 3 },
            ]}
            fieldProps={{
              onChange: (value) => {
                // 可以根据不同类型显示不同的表单字段
              },
            }}
          />

          <ProFormSelect
            name="job_execute_strategy"
            label="执行策略"
            width={'md'}
            tooltip="当任务正在执行时，新触发的任务如何处理"
            options={[
              { label: '并行执行', value: 2 },
              { label: '跳过执行', value: 1 },
              { label: '等待执行', value: 3 },
            ]}
            initialValue={2}
          />
        </ProForm.Group>

        {/* 单次执行配置 */}
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

        {/* Cron表达式配置 */}
        <ProFormDependency name={['job_trigger_type']}>
          {({ job_trigger_type }) => {
            if (job_trigger_type === TriggerType.cron) {
              return (
                <ProForm.Group>
                  <ProFormText
                    name="job_execute_cron"
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
        <ProFormDependency name={['job_trigger_type']}>
          {({ job_trigger_type }) => {
            if (job_trigger_type === TriggerType.fixedRate) {
              return (
                <ProForm.Group>
                  <ProFormDigit
                    name="job_execute_interval"
                    label="执行间隔"
                    width={'md'}
                    required
                    rules={[{ required: true, message: '请输入执行间隔' }]}
                    fieldProps={{
                      addonAfter: '时',
                      min: 1,
                      max: 24,
                    }}
                    tooltip="任务执行的固定时间间隔"
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

          <ProFormSwitch
            name="job_enabled"
            label="立即启用"
            initialValue={true}
            tooltip="是否立即启用该定时任务"
          />
        </ProForm.Group>
      </StepsForm.StepForm>
      <StepsForm.StepForm title="通知配置" name="step4">
        <ProFormRadio.Group
          label="是否通知"
          name="job_notify_type"
          options={[
            { label: '通知', value: 0 },
            { label: '不通知', value: 1 },
          ]}
          initialValue={1}
          required
          rules={[{ required: true, message: '选择是否通知' }]}
        />
        <ProFormDependency name={['job_notify_type']}>
          {({ job_notify_type }) => {
            if (job_notify_type === 0) {
              return (
                <>
                  <ProFormSelect
                    name="job_notify_id"
                    label="通知方式"
                    options={[
                      { label: '邮件通知', value: 1 },
                      { label: '企业微信', value: 2 },
                      { label: '钉钉', value: 3 },
                    ]}
                  />
                  <ProFormSelect
                    name="job_notify_on"
                    label="通知时机"
                    mode="multiple"
                    options={[
                      { label: '任务开始', value: 0 },
                      { label: '任务成功', value: 1 },
                      { label: '任务失败', value: 2 },
                    ]}
                    initialValue={[1, 2]}
                  />
                </>
              );
            }
            return null;
          }}
        </ProFormDependency>
      </StepsForm.StepForm>
    </StepsForm>
  );
};
export default ConfigForm;
