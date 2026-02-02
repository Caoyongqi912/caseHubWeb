import { Button, Empty, theme, Typography } from 'antd';
import { borderRadius, spacing, styleHelpers, typography } from './styles';

const { useToken } = theme;
const { Text } = Typography;

const EmptyProject = () => {
  const { token } = useToken();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing.xxxl}px ${spacing.lg}px`,
        minHeight: 'calc(100vh - 200px)',
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
          background: `radial-gradient(circle, ${token.colorSuccessBg} 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${token.colorWarningBg} 0%, transparent 70%)`,
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
                还没有项目
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
                创建第一个项目开始您的工作
              </Text>
            </div>
          }
        />
        <Button
          type="primary"
          size="large"
          onClick={() => {
            window.open(`/project/List`);
          }}
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
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: `${spacing.sm}px ${spacing.lg}px`,
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
                gap: spacing.xs,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: token.colorSuccess,
                }}
              />
              管理您的测试用例和模块
            </Text>
          </div>
          <div
            style={{
              padding: `${spacing.sm}px ${spacing.lg}px`,
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
                gap: spacing.xs,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: token.colorInfo,
                }}
              />
              支持团队协作和权限管理
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyProject;
