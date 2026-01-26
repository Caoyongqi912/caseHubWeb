import { insertModule } from '@/api/base';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { Button, Empty, message, Typography } from 'antd';
import { FC, useState } from 'react';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  transitions,
  typography,
} from './designTokens';

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
                  color: colors.neutral[600],
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
                    color: colors.neutral[500],
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
