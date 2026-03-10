import { insertModule } from '@/api/base';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import {
  ApartmentOutlined,
  FolderAddOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Empty, message, theme, Typography } from 'antd';
import { FC, useMemo, useState } from 'react';
import {
  borderRadius,
  shadows,
  spacing,
  styleHelpers,
  typography,
} from './styles';

const { useToken } = theme;
const { Text, Title } = Typography;

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

  const styles = useMemo(
    () => ({
      container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing.xxxl}px ${spacing.lg}px`,
        minHeight: 'calc(100vh - 200px)',
        background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
        borderRadius: borderRadius.xl,
        position: 'relative' as const,
        overflow: 'hidden',
      },
      content: {
        position: 'relative' as const,
        zIndex: 1,
        textAlign: 'center' as const,
        maxWidth: 400,
      },
      featureItem: {
        padding: `${spacing.md}px ${spacing.lg}px`,
        background: token.colorFillAlter,
        borderRadius: borderRadius.lg,
        border: `1px dashed ${token.colorBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        ...styleHelpers.transition(['background-color', 'border-color']),
      },
    }),
    [token],
  );

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
      <div style={styles.container}>
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${token.colorPrimaryBg} 0%, transparent 70%)`,
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${token.colorInfoBg} 0%, transparent 70%)`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '5%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${token.colorWarningBg} 0%, transparent 70%)`,
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />

        <div style={styles.content}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: borderRadius.xxl,
              background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: spacing.xl,
              boxShadow: shadows.lg,
            }}
          >
            <FolderAddOutlined
              style={{
                fontSize: 36,
                color: '#fff',
              }}
            />
          </div>

          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
              height: 80,
              marginBottom: spacing.lg,
              opacity: 0.6,
            }}
            description={
              <div style={{ marginTop: spacing.md }}>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: token.colorText,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing.sm,
                  }}
                >
                  还没有目录
                </Title>
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
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            style={{
              ...styleHelpers.buttonPrimary(token),
              height: 48,
              padding: `0 ${spacing.xxxl}px`,
              fontSize: typography.fontSize.md,
              marginTop: spacing.xl,
              borderRadius: borderRadius.lg,
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            去创建
          </Button>
          <div
            style={{
              marginTop: spacing.xxl,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                ...styles.featureItem,
                maxWidth: 260,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: borderRadius.round,
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ApartmentOutlined
                  style={{ fontSize: typography.fontSize.sm, color: '#fff' }}
                />
              </div>
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: token.colorTextSecondary,
                }}
              >
                支持多层级目录结构
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmptyModule;
