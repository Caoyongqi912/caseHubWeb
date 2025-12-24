import { IEnv } from '@/api';
import { queryEnvBy } from '@/api/base';
import { add_aps_job, update_aps_job } from '@/api/base/aps';
import { IJob } from '@/pages/Project/types';
import ApiTaskChoiceTable from '@/pages/Scheduler/APITaskChoiceTable';
import {
  ProCard,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';

import NotifyForm from '@/pages/Scheduler/JobForm/NotifyForm';
import TriggerTypeForm from '@/pages/Scheduler/JobForm/TriggerTypeForm';
import JobTasksList from '@/pages/Scheduler/JobTasksList';
import PlayTaskChoiceTable from '@/pages/Scheduler/PlayTaskChoiceTable';

interface SelfProps {
  callback: () => void;
  currentModuleId?: number;
  currentProjectId?: number;
  currentJob?: IJob;
}

const Index: FC<SelfProps> = (props) => {
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

  const setNotifyName2Form = (value: string) => {
    formMapRef.current[3].current?.setFieldsValue({
      job_notify_name: value,
    });
  };
  const onFinishOrUpdate = async (values: IJob) => {
    //更新
    if (currentJob) {
      const { code, data, msg } = await update_aps_job({
        ...values,
        uid: currentJob.uid,
      });
      if (code === 0) {
        callback();
        message.success(msg);
        setSelectedRowKeys([]);
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
          setSelectedRowKeys([]);
          formMapRef.current[0].current?.resetFields();
          return Promise.resolve(true);
        }
      }
    }
  };
  return (
    <StepsForm formMapRef={formMapRef} onFinish={onFinishOrUpdate}>
      <StepsForm.StepForm name="step0" title="基础信息">
        <ProCard>
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
          {jobType === 1 && (
            <>
              <ProFormSelect
                width="lg"
                required={true}
                label="运行环境"
                name={'job_env_id'}
                placeholder="请选择运行环境"
                allowClear
                showSearch
                options={apiEnvs}
                rules={[{ required: jobType === 1, message: '请选择运行环境' }]}
                onChange={(value) => {
                  formMapRef.current[0].current?.setFieldsValue({
                    job_env_name: apiEnvs.find((item) => item.value === value)
                      ?.label,
                  });
                }}
              />
              <ProFormText name="job_env_name" hidden={true} />
            </>
          )}

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
              <>
                <PlayTaskChoiceTable
                  currentProjectId={currentProjectId}
                  setJobs={setJobs}
                />
              </>
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
        <TriggerTypeForm />
        <ProFormSwitch
          name="job_enabled"
          label="立即启用"
          initialValue={true}
          tooltip="是否立即启用该定时任务"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm title="通知配置" name="step4">
        <NotifyForm setNotifyName={setNotifyName2Form} />
      </StepsForm.StepForm>
    </StepsForm>
  );
};
export default Index;
