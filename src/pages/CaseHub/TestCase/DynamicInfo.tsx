import { queryTestCaseDynamic } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICaseDynamic } from '@/pages/CaseHub/type';
import { HistoryOutlined, SoundTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Avatar, Space, Timeline, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';

const { Text, Title } = Typography;

interface IProps {
  caseId?: number;
}

const DynamicInfo: FC<IProps> = ({ caseId }) => {
  const [originalData, setOriginalData] = useState<ICaseDynamic[]>([]);
  const [displayData, setDisplayData] = useState<ICaseDynamic[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const { token, colors, spacing, borderRadius, shadows } = useCaseHubTheme();

  useEffect(() => {
    if (caseId) {
      queryTestCaseDynamic(caseId).then(async ({ code, data }) => {
        if (code === 0) {
          setOriginalData(data);
          setShouldShowToggle(data.length > 5);

          if (data.length > 5) {
            setDisplayData(data.slice(-5));
          } else {
            setDisplayData(data);
          }
        }
      });
    }
  }, [caseId]);

  useEffect(() => {
    if (originalData.length === 0) return;

    if (showMore) {
      setDisplayData(originalData);
    } else {
      setDisplayData(
        originalData.length > 5 ? originalData.slice(-5) : originalData,
      );
    }
  }, [showMore, originalData]);

  const containerStyle = useMemo(
    () => ({
      minHeight: '100%',
      background: `
        radial-gradient(ellipse at 0% 0%, ${colors.primaryBg}40 0%, transparent 50%),
        linear-gradient(180deg, ${colors.bgContainer} 0%, ${colors.bgLayout} 100%)
      `,
      padding: spacing.lg,
    }),
    [colors, spacing],
  );

  const cardStyle = useMemo(
    () => ({
      borderRadius: borderRadius.xxl,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden' as const,
      boxShadow: shadows.lg,
      background: colors.bgContainer,
    }),
    [borderRadius, colors, shadows],
  );

  const headerStyle = useMemo(
    () => ({
      padding: `${spacing.xl}px ${spacing.xl}px`,
      background: `
        linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.bgContainer} 100%)
      `,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    }),
    [colors, spacing],
  );

  const headerIconStyle = useMemo(
    () => ({
      width: 40,
      height: 40,
      borderRadius: borderRadius.lg,
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 12px ${colors.primary}40`,
    }),
    [colors, borderRadius],
  );

  const timelineItemStyle = (index: number) => ({
    padding: `${spacing.md}px 0`,
    position: 'relative' as const,
    animation: `slideIn 300ms ease-out ${index * 50}ms both`,
  });

  const avatarStyle = (index: number) => ({
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    background: `linear-gradient(135deg, ${
      index % 3 === 0
        ? colors.primary
        : index % 3 === 1
        ? colors.warning
        : colors.info
    } 0%, ${
      index % 3 === 0
        ? colors.primaryHover
        : index % 3 === 1
        ? colors.warningHover
        : colors.infoHover
    } 100%)`,
    boxShadow: `0 2px 8px ${
      index % 3 === 0
        ? colors.primary
        : index % 3 === 1
        ? colors.warning
        : colors.info
    }40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.bgContainer}`,
  });

  const dotStyle = (index: number) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${
      index % 2 === 0 ? colors.success : colors.primary
    } 0%, ${index % 2 === 0 ? colors.successHover : colors.primaryHover} 100%)`,
    boxShadow: `0 0 0 4px ${
      index % 2 === 0 ? colors.successBg : colors.primaryBg
    }`,
  });

  const contentCardStyle = useMemo(
    () => ({
      marginLeft: spacing.xl,
      padding: `${spacing.md}px ${spacing.lg}px`,
      borderRadius: borderRadius.xl,
      background: colors.bgLayout,
      border: `1px solid ${colors.borderSecondary}`,
      position: 'relative' as const,
      transition: `all ${token.motionDurationFast} ${token.motionEaseInOut}`,
      '&:hover': {
        borderColor: colors.primary,
        boxShadow: shadows.md,
      },
    }),
    [colors, spacing, borderRadius, shadows, token],
  );

  const timeTagStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: borderRadius.round,
      background: colors.bgContainer,
      border: `1px solid ${colors.border}`,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: 500,
    }),
    [colors, borderRadius],
  );

  return (
    <div style={containerStyle}>
      <ProCard style={cardStyle} bodyStyle={{ padding: 0 }}>
        <div style={headerStyle}>
          <div style={headerIconStyle}>
            <HistoryOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title
              level={5}
              style={{ margin: 0, fontWeight: 600, color: colors.text }}
            >
              操作动态
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {originalData.length} 条记录
            </Text>
          </div>
        </div>

        <div style={{ padding: spacing.lg }}>
          {displayData.length === 0 ? (
            <div
              style={{
                textAlign: 'center' as const,
                padding: spacing.xxxl,
                color: colors.textSecondary,
              }}
            >
              <SoundTwoTone style={{ fontSize: 48, opacity: 0.5 }} />
              <div style={{ marginTop: spacing.md }}>
                <Text type="secondary">暂无操作记录</Text>
              </div>
            </div>
          ) : (
            <Timeline
              items={displayData.map((item, index) => ({
                dot: <div style={dotStyle(index)} />,
                children: (
                  <div style={timelineItemStyle(index)} key={item.id}>
                    <div style={contentCardStyle as any}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: spacing.sm,
                        }}
                      >
                        <Space size="middle" align="center">
                          <Avatar style={avatarStyle(index)}>
                            {item.creatorName[0]}
                          </Avatar>
                          <div>
                            <Text strong style={{ color: colors.text }}>
                              {item.creatorName}
                            </Text>
                            <div>
                              <span style={timeTagStyle}>
                                {item.create_time}
                              </span>
                            </div>
                          </div>
                        </Space>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: spacing.sm,
                          marginTop: spacing.sm,
                        }}
                      >
                        <SoundTwoTone style={{ fontSize: 14, marginTop: 2 }} />
                        <Text
                          style={{
                            color: colors.textSecondary,
                            lineHeight: 1.6,
                          }}
                        >
                          {item.description}
                        </Text>
                      </div>
                    </div>
                  </div>
                ),
              }))}
            />
          )}

          {shouldShowToggle && (
            <div
              style={{
                textAlign: 'center' as const,
                marginTop: spacing.lg,
                padding: `${spacing.md}px 0`,
                borderTop: `1px dashed ${colors.border}`,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: `${spacing.sm}px ${spacing.lg}px`,
                  borderRadius: borderRadius.round,
                  transition: `all ${token.motionDurationFast}`,
                  background: colors.primaryBg,
                }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? '收起' : `展开更多 (${originalData.length - 5} 条)`}
              </Text>
            </div>
          )}
        </div>
      </ProCard>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicInfo;
