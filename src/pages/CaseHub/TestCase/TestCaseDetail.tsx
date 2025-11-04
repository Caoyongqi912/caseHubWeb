import { updateTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/CaseConfig';
import CaseSubSteps from '@/pages/CaseHub/TestCase/CaseSubSteps';
import { ITestCase } from '@/pages/CaseHub/type';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

interface Props {
  testcase?: ITestCase;
  callback: () => void;
}

const TestCaseDetail: FC<Props> = ({ testcase, callback }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [caseForm] = Form.useForm<ITestCase>();
  const [editStatus, setEditStatus] = useState<number>(0);
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;
  useEffect(() => {
    if (!testcase) return;
    caseForm.setFieldsValue(testcase);
  }, [testcase]);
  const reload = () => {
    setEditStatus(editStatus + 1);
  };

  const onValuesChange = async (values: any, allValues: ITestCase) => {
    console.log(values);
    if (!testcase) return;
    const data = {
      id: testcase.id,
      ...allValues,
    };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { code, msg } = await updateTestCase(data);
      if (code === 0) {
        callback();
      }
    }, 1500);
  };
  return (
    <ProCard>
      <ProForm
        form={caseForm}
        onValuesChange={onValuesChange}
        submitter={false}
      >
        <ProCard>
          <ProFormText
            name={'case_name'}
            label={'用例标题'}
            placeholder={'请输入用例标题'}
            required={true}
            tooltip={'最长20位'}
            rules={[{ required: true, message: '标题不能为空' }]}
          />
          <ProForm.Group size={'large'}>
            <ProFormSelect
              label={'用例等级'}
              required={true}
              width={'md'}
              name={'case_level'}
              options={CASE_LEVEL_OPTION}
            />
            <ProFormSelect
              label={'用例类型'}
              required={true}
              width={'md'}
              name={'case_type'}
              options={CASE_TYPE_OPTION}
            />
          </ProForm.Group>
        </ProCard>
        <CaseSubSteps
          caseId={testcase?.id}
          hiddenStatusBut={true}
          callback={reload}
          case_status={testcase?.case_status}
        />
      </ProForm>
    </ProCard>
  );
};

export default TestCaseDetail;
