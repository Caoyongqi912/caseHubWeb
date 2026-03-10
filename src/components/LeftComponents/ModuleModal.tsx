import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form, theme } from 'antd';
import { FC, useMemo } from 'react';
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

  const styles = useMemo(
    () => ({
      modalContent: {
        padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.lg}px`,
      },
      modalBody: {
        borderRadius: borderRadius.xl,
        boxShadow: shadows.xl,
        overflow: 'hidden',
      },
      infoBox: {
        marginBottom: spacing.xl,
        padding: `${spacing.md}px ${spacing.lg}px`,
        background: `linear-gradient(135deg, ${token.colorInfoBg} 0%, ${token.colorInfoBgHover} 100%)`,
        borderRadius: borderRadius.lg,
        borderLeft: `3px solid ${token.colorInfo}`,
      },
      footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spacing.md,
        paddingTop: spacing.lg,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        marginTop: spacing.lg,
      },
    }),
    [token],
  );

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
              width: 36,
              height: 36,
              borderRadius: borderRadius.lg,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <EditOutlined
              style={{
                fontSize: typography.fontSize.md,
                color: '#fff',
              }}
            />
          </div>
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
          body: styles.modalContent,
          content: styles.modalBody,
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
            fontSize: typography.fontSize.base,
          },
        },
        resetButtonProps: {
          style: {
            borderRadius: borderRadius.md,
            height: 40,
            padding: `0 ${spacing.xl}px`,
            fontSize: typography.fontSize.base,
            ...styleHelpers.transition(['background-color', 'border-color']),
          },
        },
        //@ts-ignore
        style: styles.footer,
      }}
    >
      <div style={styles.infoBox}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing.sm,
          }}
        >
          <InfoCircleOutlined
            style={{
              fontSize: typography.fontSize.md,
              color: token.colorInfo,
              marginTop: 2,
            }}
          />
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
            height: 44,
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
