import CaseSteps, {
  TestCaseStep,
} from '@/pages/CaseHub/CaseLibrary/components/CaseStepsForm';
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';

import { CheckCircleOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, theme } from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

const { useToken } = theme;

interface Props {
  onSubmit: (values: Record<string, unknown>) => void;
}

/**
 * 新增用例表单组件
 * 支持填写用例基本信息、步骤、前置条件等
 */
const NewCaseForm: FC<Props> = ({ onSubmit }) => {
  // 用例类型从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: typeOptions } = useCaseEnumConfig('CASE_TYPE');
  const typeSelectOptions = useMemo(
    () => toSelectOptions(typeOptions),
    [typeOptions],
  );

  // 适用端从后端枚举配置拉取（用例配置中心 PLATFORM 分类）
  const { options: platformOptions } = useCaseEnumConfig('PLATFORM');
  const platformSelectOptions = useMemo(
    () => toSelectOptions(platformOptions),
    [platformOptions],
  );

  const { token } = useToken();
  const [form] = Form.useForm();

  // 用例等级从后端枚举配置拉取（管理员在配置中心增删后自动生效）
  const { options: levelOptions } = useCaseEnumConfig('CASE_LEVEL');
  const levelSelectOptions = useMemo(
    () => toSelectOptions(levelOptions),
    [levelOptions],
  );

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
        // case_platform: 多选 array -> CSV 字符串, Array.from(new Set(...)) 去重
        // 避免用户不小心点重复项时后端存 "PC,PC,xxx" 这种脏数据
        case_platform: Array.isArray(values.case_platform)
          ? Array.from(
              new Set((values.case_platform as string[]).filter(Boolean)),
            ).join(',') || undefined
          : values.case_platform,
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

        {/* <ProFormText
          label="用例标签"
          name="case_tag"
          placeholder="请输入用例标签，多个标签用逗号分隔"
        /> */}

        <ProForm.Group>
          <ProFormSelect
            label="用例级别"
            name="case_level"
            width={'md'}
            options={levelSelectOptions}
            fieldProps={{ variant: 'filled' }}
            style={{ flex: 1 }}
          />

          <ProFormSelect
            label="用例类型"
            name="case_type"
            options={typeSelectOptions}
            fieldProps={{ variant: 'filled' }}
            style={{ flex: 1 }}
            width={'md'}
          />

          <ProFormSelect
            label="适用端"
            name="case_platform"
            options={platformSelectOptions}
            fieldProps={{ variant: 'filled' }}
            style={{ flex: 1 }}
            width={'md'}
            allowClear
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
