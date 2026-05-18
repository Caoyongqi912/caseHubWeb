import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { FC, useMemo } from 'react';

interface Props {
  title: string;
  open: boolean;
  onFinish: (values: any) => Promise<boolean>;
  setOpen: (open: boolean) => void;
  initialValues?: any;
}

const Index: FC<Props> = ({
  title,
  open,
  onFinish,
  setOpen,
  initialValues,
}) => {
  const { colors, spacing, borderRadius, animations } = useCaseHubTheme();

  const formStyles = useMemo(
    () => ({
      modal: {
        bodyStyle: {
          padding: `${spacing.lg}px ${spacing.xl}px`,
          background: colors.bgContainer,
          borderRadius: borderRadius.xl,
        },
      },
      input: {
        marginBottom: spacing.md,
        '& .ant-form-item-label > label': {
          color: colors.text,
          fontWeight: 600,
        },
        '& .ant-input': {
          borderRadius: borderRadius.md,
          transition: `all ${animations.fast} ${animations.easeInOut}`,
          '&:hover': { borderColor: colors.primary },
          '&:focus': {
            borderColor: colors.primary,
            boxShadow: `0 0 0 2px ${colors.primary}20`,
          },
        },
      },
    }),
    [colors, spacing, borderRadius, animations],
  );

  return (
    <ModalForm
      title={title}
      open={open}
      onFinish={onFinish}
      modalProps={{
        destroyOnHidden: true,
        ...formStyles.modal,
      }}
      submitter={{
        searchConfig: { resetText: '取消', submitText: '确定' },
        render: (_, dom) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.sm,
            }}
          >
            {dom}
          </div>
        ),
      }}
      initialValues={initialValues || {}}
    >
      <ProFormText
        name="title"
        label="目录名称"
        placeholder="请输入目录名称"
        rules={[{ required: true, message: '请输入目录名称' }]}
        fieldProps={{ style: { width: '100%', ...formStyles.input } }}
      />
    </ModalForm>
  );
};

export default Index;
