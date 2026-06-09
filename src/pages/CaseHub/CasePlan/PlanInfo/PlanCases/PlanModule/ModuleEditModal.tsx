import { Form, Input, Modal } from 'antd';
import { FC, useEffect } from 'react';

interface ModuleEditModalProps {
  title: string;
  open: boolean;
  /** 初始值,编辑模式下用于回显 */
  initialValues?: { title?: string };
  /** 返回 true=提交成功(关闭弹窗),false=保留弹窗 */
  onFinish: (values: { title: string }) => Promise<boolean> | boolean;
  onCancel: () => void;
}

/**
 * 计划目录编辑弹窗(新增 / 重命名共用)
 * 提交流程由父组件控制(决定走 insert 还是 update + 是否刷新)
 */
const ModuleEditModal: FC<ModuleEditModalProps> = ({
  title,
  open,
  initialValues,
  onFinish,
  onCancel,
}) => {
  const [form] = Form.useForm<{ title: string }>();

  // 打开时回显,关闭时清空
  // 注意:deps 只用 initialValues?.title 字符串,不用 initialValues 对象,
  // 否则父组件每次 render 传新对象会导致 effect 反复触发、覆盖用户已输入的内容
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ title: initialValues?.title ?? '' });
    } else {
      form.resetFields();
    }
  }, [open, initialValues?.title, form]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      destroyOnClose
      okText="保存"
      cancelText="取消"
      onOk={async () => {
        try {
          const values = await form.validateFields();
          const ok = await onFinish(values);
          if (ok) form.resetFields();
        } catch {
          // 校验失败:保留弹窗
        }
      }}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="title"
          label="目录名称"
          rules={[
            { required: true, message: '请输入目录名称' },
            { max: 50, message: '目录名称不超过 50 个字符' },
          ]}
        >
          <Input placeholder="请输入目录名称" maxLength={50} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModuleEditModal;
