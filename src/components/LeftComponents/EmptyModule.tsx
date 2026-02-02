import { insertModule } from '@/api/base';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { Button, Empty, message, theme, Typography } from 'antd';
import { FC, useState } from 'react';
import { borderRadius, spacing, styleHelpers, typography } from './styles';

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
          // minHeight: 'calc(100vh - 200px)',
          background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
          borderRadius: borderRadius.xl,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${token.colorPrimaryBg} 0%, transparent 70%)`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${token.colorInfoBg} 0%, transparent 70%)`,
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
              height: 120,
              marginBottom: spacing.lg,
            }}
            description={
              <div style={{ marginTop: spacing.md }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.lg,
                    color: token.colorText,
                    fontWeight: typography.fontWeight.semibold,
                    display: 'block',
                    marginBottom: spacing.sm,
                  }}
                >
                  还没有目录
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: token.colorTextSecondary,
                    display: 'block',
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  创建第一个目录来组织您的内容
                </Text>
              </div>
            }
          />
          <Button
            type="primary"
            size="large"
            onClick={() => setOpen(true)}
            style={{
              ...styleHelpers.buttonPrimary(token),
              height: 44,
              padding: `0 ${spacing.xxxl}px`,
              fontSize: typography.fontSize.base,
              marginTop: spacing.xl,
            }}
          >
            去创建
          </Button>
          <div
            style={{
              marginTop: spacing.xl,
              padding: `${spacing.md}px ${spacing.lg}px`,
              background: token.colorFillAlter,
              borderRadius: borderRadius.md,
              border: `1px dashed ${token.colorBorder}`,
            }}
          >
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: token.colorTextSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: token.colorPrimary,
                }}
              />
              支持多层级目录结构
            </Text>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmptyModule;
