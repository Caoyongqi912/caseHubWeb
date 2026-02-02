import { insertModule } from '@/api/base';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { Button, Empty, message, theme, Typography } from 'antd';
import { FC, useState } from 'react';

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

const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
  default: 'all 200ms ease-in-out',
  fast: 'all 150ms ease-in-out',
  slow: 'all 300ms ease-in-out',
};

const { useToken } = theme;

const { Text } = Typography;

export interface IProps {
  currentProjectId?: number;
  moduleType: number;
  callBack: () => void;
}

const EmptyModule: FC<IProps> = ({
  currentProjectId,
  moduleType,
  callBack,
}) => {
  const [open, setOpen] = useState(false);
  const { token } = useToken();

  /**
   * 创建一个目录
   */
  const onFinish = async (value: { title: string }) => {
    if (currentProjectId) {
      const body = {
        title: value.title,
        project_id: currentProjectId,
        module_type: moduleType,
      };
      const { code, msg } = await insertModule(body);
      if (code === 0) {
        message.success(msg);
        setOpen(false);
        callBack();
      }
    }
  };
  return (
    <>
      <ModuleModal
        title={'创建'}
        open={open}
        onFinish={onFinish}
        setOpen={setOpen}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${spacing.xxxl}px ${spacing.lg}px`,
          minHeight: 200,
        }}
      >
        <Empty
          style={{ marginBottom: spacing.xl }}
          description={
            <div style={{ marginTop: spacing.md }}>
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  color: token.colorText,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                还没有目录
              </Text>
              <div style={{ marginTop: spacing.xs }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: token.colorTextSecondary,
                  }}
                >
                  创建第一个目录来组织您的内容
                </Text>
              </div>
            </div>
          }
        />
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setOpen(true);
          }}
          style={{
            borderRadius: borderRadius.md,
            fontWeight: typography.fontWeight.medium,
            height: 40,
            padding: `0 ${spacing.xxl}px`,
            boxShadow: shadows.sm,
            transition: transitions.default,
          }}
        >
          去创建
        </Button>
      </div>
    </>
  );
};

export default EmptyModule;
