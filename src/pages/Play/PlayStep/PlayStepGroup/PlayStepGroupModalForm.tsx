import {
  insertPlayGroupSteps,
  updatePlayGroupSteps,
} from '@/api/play/playCase';
import { IUIGroupStep } from '@/pages/Play/componets/uiTypes';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC, useEffect } from 'react';

interface SelfProps {
  currentModuleId?: number;
  currentProjectId?: number;
  callBack: () => void;
  current?: IUIGroupStep;
  trigger: React.ReactElement;
}

const PlayStepGroupModalForm: FC<SelfProps> = ({
  current,
  currentModuleId,
  callBack,
  currentProjectId,
  trigger,
}) => {
  const [form] = Form.useForm<IUIGroupStep>();
  useEffect(() => {
    if (current) {
      form.setFieldsValue(current);
    }
  }, [current]);

  useEffect(() => {
    if (currentModuleId && currentProjectId) {
      form.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentModuleId]);

  const onFinish = async (values: any) => {
    if (current) {
      const { code } = await updatePlayGroupSteps({
        ...values,
        id: current.id,
      });
      if (code === 0) {
        callBack();
        return true;
      }
    } else {
      const { code } = await insertPlayGroupSteps(values);
      if (code === 0) {
        callBack();
        return true;
      }
    }
    return false;
  };
  return (
    <ModalForm<IUIGroupStep>
      trigger={trigger}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={onFinish}
    >
      <ProFormText name="project_id" hidden />
      <ProFormText name="module_id" hidden />
      <ProFormText
        required
        width="md"
        name="name"
        label="组名"
        placeholder="Please enter a name"
        rules={[{ required: true, message: '请输入组名' }]}
      />
      <ProFormTextArea
        label="描述"
        required
        width="md"
        name="description"
        rules={[{ required: true, message: '请输入描述' }]}
      />
    </ModalForm>
  );
};

export default PlayStepGroupModalForm;
