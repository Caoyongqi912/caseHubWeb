/**
 * MetaDrawer —— 用例节点 meta 字段编辑器
 *
 * 设计 brief: docs/mindmap-redesign-2026-06-17.md §4.3
 * 只编辑 meta, 不动 topic.
 */
import { Button, Drawer, Form, Input, message, Select, Space, Tag } from 'antd';
import { FC, useEffect } from 'react';
import type { CaseMeta, MindNode } from './utils';

interface MetaDrawerProps {
  open: boolean;
  node: MindNode | null;
  onClose: () => void;
  onSave: (meta: CaseMeta) => void;
}

const LEVEL_OPTIONS = [
  { value: 'P0-最高', label: 'P0-最高' },
  { value: 'P1-高', label: 'P1-高' },
  { value: 'P2-中', label: 'P2-中' },
  { value: 'P3-低', label: 'P3-低' },
];

const TYPE_OPTIONS = [
  { value: '功能测试', label: '功能测试' },
  { value: '冒烟', label: '冒烟' },
  { value: '回归', label: '回归' },
  { value: '其他', label: '其他' },
];

const MetaDrawer: FC<MetaDrawerProps> = ({ open, node, onClose, onSave }) => {
  const [form] = Form.useForm<CaseMeta>();

  // 节点切换时重置表单
  useEffect(() => {
    if (open && node) {
      form.setFieldsValue({
        case_level: node.meta?.case_level,
        case_type: node.meta?.case_type,
        case_tag: node.meta?.case_tag ?? [],
        case_mark: node.meta?.case_mark ?? '',
        case_setup: node.meta?.case_setup ?? '',
      });
    } else {
      form.resetFields();
    }
  }, [open, node, form]);

  const handleFinish = (values: CaseMeta) => {
    const cleanTags = (arr?: string[]) =>
      (arr ?? []).map((s) => s.trim()).filter((s) => s.length > 0);
    const meta: CaseMeta = {
      case_level: values.case_level,
      case_type: values.case_type,
      case_tag: cleanTags(values.case_tag),
      case_mark: values.case_mark?.trim() || undefined,
      case_setup: values.case_setup?.trim() || undefined,
    };
    onSave(meta);
    message.success('已保存');
  };

  if (!node) return null;

  return (
    <Drawer
      title="编辑用例节点"
      open={open}
      onClose={onClose}
      width={480}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="用例等级" name="case_level">
          <Select allowClear placeholder="选择等级" options={LEVEL_OPTIONS} />
        </Form.Item>

        <Form.Item label="用例类型" name="case_type">
          <Select allowClear placeholder="选择类型" options={TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item label="标签" name="case_tag">
          <Select
            mode="tags"
            placeholder="回车添加标签"
            tokenSeparators={[',']}
            tagRender={({ value, closable, onClose: tagClose }) => (
              <Tag
                color="blue"
                closable={closable}
                onClose={tagClose}
                style={{ marginRight: 4 }}
              >
                {value}
              </Tag>
            )}
          />
        </Form.Item>

        <Form.Item label="前置条件" name="case_setup">
          <Input.TextArea
            rows={3}
            placeholder="例如: 已登录, 已创建测试数据"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="备注" name="case_mark">
          <Input.TextArea
            rows={3}
            placeholder="备注信息"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MetaDrawer;
