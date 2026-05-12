import { queryTestCaseDynamic } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICaseDynamic } from '@/pages/CaseHub/types';
import { HistoryOutlined, SoundTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Avatar, Space, Timeline, Typography } from 'antd';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useDynamicInfoStyles } from './styles';

const { Text, Title } = Typography;

interface IProps {
  caseId?: number;
}

export interface DynamicInfoRef {
  refresh: () => void;
}

const DynamicInfo = forwardRef<DynamicInfoRef, IProps>(({ caseId }, ref) => {
  const [originalData, setOriginalData] = useState<ICaseDynamic[]>([]);
  const [displayData, setDisplayData] = useState<ICaseDynamic[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const { colors, spacing } = useCaseHubTheme();
  const styles = useDynamicInfoStyles();
  const fetchingRef = useRef(false);

  const fetchData = () => {
    if (!caseId) return;
    fetchingRef.current = true;
    setShowMore(false);
    queryTestCaseDynamic(caseId).then(async ({ code, data }) => {
      fetchingRef.current = false;
      if (code === 0) {
        setOriginalData(data);
        setShouldShowToggle(data.length > 5);

        if (data.length > 5) {
          setDisplayData(data.slice(0, 5));
        } else {
          setDisplayData(data);
        }
      }
    });
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchData,
  }));

  useEffect(() => {
    if (caseId) {
      fetchData();
    }
  }, [caseId]);

  useEffect(() => {
    if (originalData.length === 0) return;

    if (showMore) {
      setDisplayData(originalData);
    } else {
      setDisplayData(
        originalData.length > 5 ? originalData.slice(0, 5) : originalData,
      );
    }
  }, [showMore, originalData]);

  return (
    <div style={styles.container()}>
      <ProCard style={styles.card()} bodyStyle={{ padding: 0 }}>
        <div style={styles.header()}>
          <div style={styles.headerIcon()}>
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
            <div style={styles.emptyState()}>
              <SoundTwoTone style={{ fontSize: 48, opacity: 0.5 }} />
              <div style={{ marginTop: spacing.md }}>
                <Text type="secondary">暂无操作记录</Text>
              </div>
            </div>
          ) : (
            <Timeline
              items={displayData.map((item, index) => ({
                dot: <div style={styles.dot(index)} />,
                children: (
                  <div style={styles.timelineItem(index)} key={item.id}>
                    <div style={styles.contentCard() as any}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: spacing.sm,
                        }}
                      >
                        <Space size="middle" align="center">
                          <Avatar style={styles.avatar(index)}>
                            {item.creatorName[0]}
                          </Avatar>
                          <div>
                            <Text strong style={{ color: colors.text }}>
                              {item.creatorName}
                            </Text>
                            <div>
                              <span style={styles.timeTag()}>
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
                style={styles.toggleButton()}
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
});

export default DynamicInfo;
