import {
  borderRadius,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from '@/components/LeftComponents/styles';
import {
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form, theme } from 'antd';
import { FC, useEffect, useMemo } from 'react';

const { useToken } = theme;

interface ModuleEditModalProps {
  /** Modal 标题 */
  title: string;
  /** 是否显示 Modal */
  open: boolean;
  /** 表单提交回调，返回 true 表示提交成功 */
  onFinish: (values: { title: string }) => Promise<boolean>;
  /** 设置 Modal 显示状态 */
  setOpen: (open: boolean) => void;
  /** 初始值 */
  initialValues?: {
    title?: string;
  };
}

/**
 * 目录编辑 Modal 组件
 * 用于新增和编辑目录名称
 */
const ModuleEditModal: FC<ModuleEditModalProps> = ({
  title,
  open,
  onFinish,
  setOpen,
  initialValues,
}) => {
  const [form] = Form.useForm<{ title: string }>();
  const { token } = useToken();

  /**
   * 当Modal打开时重置表单
   * - 新增模式：清空表单
   * - 编辑模式：填充初始值
   */
  useEffect(() => {
    if (open) {
      if (initialValues?.title) {
        form.setFieldsValue({ title: initialValues.title });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const styles = useMemo(
    () => ({
      /** Modal 内容区域样式 */
      modalContent: {
        padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.lg}px`,
      },
      /** Modal body 样式 */
      modalBody: {
        borderRadius: borderRadius.xl,
        boxShadow: shadows.xl,
        overflow: 'hidden',
      },
      /** 提示信息框样式 */
      infoBox: {
        marginBottom: spacing.xl,
        padding: `${spacing.md}px ${spacing.lg}px`,
        background: `linear-gradient(135deg, ${token.colorInfoBg} 0%, ${token.colorInfoBgHover} 100%)`,
        borderRadius: borderRadius.lg,
        borderLeft: `3px solid ${token.colorInfo}`,
      },
      /** 底部按钮区域样式 */
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

  const isEdit = title.includes('编辑') || title.includes('修改');

  const stylesExtra = useMemo(
    () => ({
      /** 标题区域容器 */
      headerTitleWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
      },
      /** 图标容器 */
      iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.lg,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: shadows.sm,
      },
      /** 标题文本 */
      titleText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: token.colorText,
      },
      /** 提示内容区域 */
      infoContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.sm,
      },
      /** 提示文本 */
      infoText: {
        fontSize: typography.fontSize.sm,
        color: token.colorInfoText,
        lineHeight: typography.fontSize.normal,
      },
      /** 标签文本 */
      labelText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: token.colorText,
      },
    }),
    [token, spacing, borderRadius, shadows, typography],
  );

  return (
    <ModalForm
      open={open}
      onFinish={onFinish}
      form={form}
      title={
        <div style={stylesExtra.headerTitleWrapper}>
          <div style={stylesExtra.iconContainer}>
            {isEdit ? (
              <EditOutlined
                style={{ fontSize: typography.fontSize.md, color: '#fff' }}
              />
            ) : (
              <PlusOutlined
                style={{ fontSize: typography.fontSize.md, color: '#fff' }}
              />
            )}
          </div>
          <span style={stylesExtra.titleText}>{title}</span>
        </div>
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnHidden: true,
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
        style: styles.footer as any,
      }}
    >
      <div style={styles.infoBox}>
        <div style={stylesExtra.infoContent}>
          <InfoCircleOutlined
            style={{
              fontSize: typography.fontSize.md,
              color: token.colorInfo,
              marginTop: 2,
            }}
          />
          <span style={stylesExtra.infoText}>
            请输入目录名称，建议使用简洁明确的命名方式
          </span>
        </div>
      </div>
      <ProFormText
        width="lg"
        name="title"
        label={<span style={stylesExtra.labelText}>目录名称</span>}
        placeholder="请输入目录名称（最多50个字符）"
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
            message: '请输入目录名称',
          },
          {
            max: 50,
            message: '目录名称不能超过50个字符',
          },
          {
            pattern: /^[^<>{}]*$/,
            message: '目录名称不能包含特殊字符',
          },
        ]}
      />
    </ModalForm>
  );
};

export default ModuleEditModal;
