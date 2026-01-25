import { Button, Empty, Typography } from 'antd';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  transitions,
  typography,
} from './designTokens';

const { Text } = Typography;

const EmptyProject = () => {
  return (
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
              还没有项目
            </Text>
            <div style={{ marginTop: spacing.xs }}>
              <Text
                type="secondary"
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.neutral[500],
                }}
              >
                创建第一个项目开始您的工作
              </Text>
            </div>
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
  );
};

export default EmptyProject;
