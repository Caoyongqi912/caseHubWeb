// Mainly handles the scenarios of creating and editing
import type { ProFormInstance } from '@ant-design/pro-components';
import { StepsForm } from '@ant-design/pro-components';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';

type FormValue = {
  jobInfo: {
    name: string;
    type: number;
  };
  syncTableInfo: {
    timeRange: [Dayjs, Dayjs];
    title: string;
  };
};
const formValue: FormValue = {
  jobInfo: {
    name: 'normal job',
    type: 1,
  },
  syncTableInfo: {
    timeRange: [dayjs().subtract(1, 'm'), dayjs()],
    title: 'example table title',
  },
};
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(formValue);
    }, time);
  });
};
const jobType = [
  {
    value: 1,
    label: '选额任务',
  },
  {
    value: 2,
    label: '配置参数',
  },
  {
    value: 3,
    label: '设置定时',
  },
];
const ConfigForm = () => {
  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([]);
  useEffect(() => {
    waitTime(1000).then(() => {
      // In the editing scenario, you need to use formMapRef to loop through and set formData
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(formValue);
      });
    });
  }, []);

  return (
    <StepsForm
      formMapRef={formMapRef}
      onFinish={(values) => {
        console.log(values);
        return Promise.resolve(true);
      }}
    >
      <StepsForm.StepForm name="step1" title="选额任务"></StepsForm.StepForm>
      <StepsForm.StepForm name="step2" title="参数配置"></StepsForm.StepForm>
      <StepsForm.StepForm name="step3" title="设置定时"></StepsForm.StepForm>
    </StepsForm>
  );
};
export default ConfigForm;
