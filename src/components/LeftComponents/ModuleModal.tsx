import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form, theme } from 'antd';
import { FC } from 'react';

// 样式常量
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  round: 9999,
};

const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.10)',
  dropdown:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};

const typography = {
  fontSize: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const { useToken } = theme;

interface SelfProps {
  title: string;
  open: boolean;
  onFinish: any;
  setOpen: any;
}

const ModuleModal: FC<SelfProps> = ({ title, open, onFinish, setOpen }) => {
  const [form] = Form.useForm<{ title: string }>();
  const { token } = useToken();

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
            color: token.colorText,
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
              color: token.colorText,
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
