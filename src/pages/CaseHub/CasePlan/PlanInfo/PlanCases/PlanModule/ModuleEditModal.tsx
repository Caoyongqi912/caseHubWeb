import { Form, Input, Modal } from 'antd';
import { FC, useEffect } from 'react';

interface Props {
  title: string;
  open: boolean;
  onFinish: (values: any) => Promise<boolean>;
  onCancel: () => void;
  initialValues?: any;
}

const ModuleEditModal: FC<Props> = ({
  title,
  open,
  onFinish,
  onCancel,
  initialValues,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ title: initialValues?.title || '' });
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const success = await onFinish(values);
      if (success) {
        form.resetFields();
      }
    } catch {
      // 验证失败，不关闭
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnHidden
      cancelText="取消"
      okText="确定"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ title: initialValues?.title || '' }}
      >
        <Form.Item
          name="title"
          label="目录名称"
          rules={[{ required: true, message: '请输入目录名称' }]}
        >
          <Input placeholder="请输入目录名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModuleEditModal;
