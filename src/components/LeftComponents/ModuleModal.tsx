import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import { FC } from 'react';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from './designTokens';

interface SelfProps {
  title: string;
  open: boolean;
  onFinish: any;
  setOpen: any;
}

const ModuleModal: FC<SelfProps> = ({ title, open, onFinish, setOpen }) => {
  const [form] = Form.useForm<{ title: string }>();

  return (
    <ModalForm
      open={open}
      onFinish={onFinish}
      form={form}
      title={
        <span
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[800],
          }}
        >
          {title}
        </span>
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setOpen(false),
        styles: {
          body: {
            padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.lg}px`,
          },
        },
      }}
      submitter={{
        searchConfig: {
          submitText: '确定',
          resetText: '取消',
        },
        submitButtonProps: {
          style: {
            borderRadius: borderRadius.md,
            fontWeight: typography.fontWeight.medium,
            boxShadow: shadows.sm,
          },
        },
        resetButtonProps: {
          style: {
            borderRadius: borderRadius.md,
          },
        },
      }}
    >
      <ProFormText
        width="md"
        name="title"
        label={
          <span
            style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.neutral[700],
            }}
          >
            模块名称
          </span>
        }
        placeholder="请输入名称"
        fieldProps={{
          style: {
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
          },
        }}
        rules={[
          {
            required: true,
            message: '请输入模块名称',
          },
          {
            max: 50,
            message: '模块名称不能超过50个字符',
          },
        ]}
      />
    </ModalForm>
  );
};

export default ModuleModal;
