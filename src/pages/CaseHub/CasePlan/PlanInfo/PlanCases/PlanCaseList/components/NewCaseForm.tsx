import CaseSteps, {
  TestCaseStep,
} from '@/pages/CaseHub/CaseLibrary/components/CaseStepsForm';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { CheckCircleOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, theme } from 'antd';
import { FC, useCallback, useState } from 'react';

const { useToken } = theme;

interface Props {
  onSubmit: (values: Record<string, unknown>) => void;
}

/**
 * 新增用例表单组件
 * 支持填写用例基本信息、步骤、前置条件等
 */
const NewCaseForm: FC<Props> = ({ onSubmit }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;

  const [steps, setSteps] = useState<TestCaseStep[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 构建提交数据
   * 合并表单值与步骤数据
   * @param values - 表单字段值
   * @returns 包含 case_sub_steps 的完整提交数据
   */
  const buildSubmitData = useCallback(
    (values: Record<string, unknown>) => {
      return {
        ...values,
        case_sub_steps: steps.map((step) => ({
          order: step.order,
          action: step.action,
          expected_result: step.expected_result,
        })),
      };
    },
    [steps],
  );

  /**
   * 保存用例
   * 先校验表单，再构建数据并提交
   */
  const handleSave = useCallback(async () => {
    const values = await form.validateFields();
    const submitData = buildSubmitData(values);
    onSubmit(submitData);
  }, [form, buildSubmitData, onSubmit]);

  return (
    <ProCard>
      <ProForm form={form} submitter={false}>
        <ProFormText
          label="用例名称"
          name="case_name"
          placeholder="请输入用例名称"
          rules={[{ required: true, message: '请输入用例名称' }]}
          fieldProps={{
            variant: 'filled',
          }}
        />

        <ProFormText
          label="用例标签"
          name="case_tag"
          placeholder="请输入用例标签，多个标签用逗号分隔"
        />

        <ProForm.Group>
          <ProFormSelect
            label="用例级别"
            name="case_level"
            width={'md'}
            options={CASE_LEVEL_OPTION}
            fieldProps={{ variant: 'filled' }}
            style={{ flex: 1 }}
          />

          <ProFormSelect
            label="用例类型"
            name="case_type"
            options={CASE_TYPE_OPTION}
            fieldProps={{ variant: 'filled' }}
            style={{ flex: 1 }}
            width={'md'}
          />
        </ProForm.Group>

        <ProFormTextArea
          label="前置条件"
          name="case_setup"
          placeholder="输入用例执行的前置条件..."
          fieldProps={{
            rows: 2,
          }}
        />

        <CaseSteps value={steps} onChange={setSteps} />

        <ProFormTextArea
          label="备注"
          name="case_mark"
          placeholder="输入备注信息..."
          fieldProps={{
            rows: 3,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: token.marginSM,
            marginTop: token.marginLG,
            paddingTop: token.paddingLG,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            完成
          </Button>
        </div>
      </ProForm>
    </ProCard>
  );
};

export default NewCaseForm;
