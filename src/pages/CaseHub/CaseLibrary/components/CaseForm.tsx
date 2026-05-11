import { saveTestCase } from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message, theme } from 'antd';
import { FC, useCallback, useState } from 'react';
import CaseSteps, { TestCaseStep } from './CaseStepsForm';

const { useToken } = theme;

interface Props {
  callback: () => void;
  project_id: number;
  module_id: number;
  is_common?: boolean;
}

/**
 * 用例表单组件
 * 提供测试用例的创建和编辑功能
 * 支持表单验证、测试步骤管理、提交保存等操作
 */
const CaseForm: FC<Props> = ({
  callback,
  project_id,
  module_id,
  is_common = true,
}) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;

  const [steps, setSteps] = useState<TestCaseStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  /**
   * 构建提交数据
   * 合并表单值、步骤数据和项目/模块信息
   */
  const buildSubmitData = useCallback(
    (values: Record<string, unknown>) => {
      return {
        ...values,
        project_id,
        module_id,
        is_common: is_common,
        case_sub_steps: steps.map((step) => ({
          order: step.order,
          action: step.action,
          expected_result: step.expected_result,
        })),
      };
    },
    [project_id, module_id, steps],
  );

  /**
   * 保存并关闭
   * 验证表单后提交数据，成功后调用回调函数关闭弹窗
   */
  const handleSaveAndClose = useCallback(async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();
      const submitData = buildSubmitData(values);
      const { code, msg } = await saveTestCase(submitData as never);

      if (code === 0) {
        message.success(msg || '保存成功');
        callback?.();
      } else {
        message.error(msg || '保存失败');
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [form, buildSubmitData, callback]);

  /**
   * 保存并创建下一个
   * 验证表单后提交数据，成功后清空表单继续创建
   */
  const handleSaveAndNext = useCallback(async () => {
    try {
      setLoadingNext(true);

      const values = await form.validateFields();
      const submitData = buildSubmitData(values);
      const { code, msg } = await saveTestCase(submitData as never);

      if (code === 0) {
        message.success(msg || '保存成功');
        form.resetFields();
        setSteps([]);
      } else {
        message.error(msg || '保存失败');
      }
    } catch {
    } finally {
      setLoadingNext(false);
    }
  }, [form, buildSubmitData]);

  return (
    <ProCard>
      <ProForm form={form} submitter={false}>
        <ProFormText
          name="project_id"
          hidden={true}
          initialValue={project_id}
        />
        <ProFormText name="module_id" hidden={true} initialValue={module_id} />

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
            icon={<SaveOutlined />}
            onClick={handleSaveAndNext}
            loading={loadingNext}
          >
            完成并创建下一个
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleSaveAndClose}
            loading={loading}
          >
            完成
          </Button>
        </div>
      </ProForm>
    </ProCard>
  );
};

export default CaseForm;
