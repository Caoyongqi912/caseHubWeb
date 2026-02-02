import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form, theme } from 'antd';
import { FC } from 'react';
import {
  borderRadius,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './styles';

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <div
            style={{
              width: 4,
              height: 20,
              background: `linear-gradient(180deg, ${token.colorPrimary} 0%, ${token.colorPrimaryBg} 100%)`,
              borderRadius: borderRadius.xs,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: token.colorText,
            }}
          >
            {title}
          </span>
        </div>
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setOpen(false),
        centered: true,
        styles: {
          body: {
            padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.lg}px`,
          },
          content: {
            borderRadius: borderRadius.xl,
            boxShadow: shadows.xl,
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
            ...styleHelpers.buttonPrimary(token),
            height: 40,
            padding: `0 ${spacing.xl}px`,
          },
        },
        resetButtonProps: {
          style: {
            borderRadius: borderRadius.md,
            height: 40,
            padding: `0 ${spacing.xl}px`,
            ...styleHelpers.transition(['background-color', 'border-color']),
          },
        },
        style: {
          display: 'flex',
          justifyContent: 'flex-end',
          gap: spacing.md,
          paddingTop: spacing.lg,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          marginTop: spacing.lg,
        },
      }}
    >
      <div
        style={{
          marginBottom: spacing.xl,
          padding: `${spacing.md}px ${spacing.lg}px`,
          background: token.colorInfoBg,
          borderRadius: borderRadius.md,
          borderLeft: `3px solid ${token.colorInfo}`,
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: token.colorInfoText,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          请输入模块名称，建议使用简洁明确的命名方式
        </span>
      </div>
      <ProFormText
        width="lg"
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
        placeholder="请输入模块名称（最多50个字符）"
        fieldProps={{
          style: {
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
          },
          size: 'large',
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
          {
            pattern: /^[^<>{}]*$/,
            message: '模块名称不能包含特殊字符',
          },
        ]}
      />
    </ModalForm>
  );
};

export default ModuleModal;
