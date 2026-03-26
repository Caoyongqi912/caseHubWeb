import { queryTestCaseDynamic } from '@/api/case/testCase';
import { useDynamicInfoStyles } from '@/pages/CaseHub/styles';
import { ICaseDynamic } from '@/pages/CaseHub/type';
import { HistoryOutlined, SoundTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Avatar, Space, Timeline, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text, Title } = Typography;

interface IProps {
  caseId?: number;
}

const DynamicInfo: FC<IProps> = ({ caseId }) => {
  const [originalData, setOriginalData] = useState<ICaseDynamic[]>([]);
  const [displayData, setDisplayData] = useState<ICaseDynamic[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const styles = useDynamicInfoStyles();

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

  return (
    <div style={styles.containerStyle()}>
      <ProCard style={styles.cardStyle()} bodyStyle={{ padding: 0 }}>
        <div style={styles.headerStyle()}>
          <div style={styles.headerIconStyle()}>
            <HistoryOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title
              level={5}
              style={{ margin: 0, fontWeight: 600, color: 'inherit' }}
            >
              操作动态
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              共 {originalData.length} 条记录
            </Text>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {displayData.length === 0 ? (
            <div style={styles.emptyStateStyle() as any}>
              <SoundTwoTone style={{ fontSize: 48, opacity: 0.5 }} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">暂无操作记录</Text>
              </div>
            </div>
          ) : (
            <Timeline
              items={displayData.map((item, index) => ({
                dot: <div style={styles.dotStyle(index)} />,
                children: (
                  <div style={styles.timelineItemStyle(index)} key={item.id}>
                    <div style={styles.contentCardStyle() as any}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <Space size="middle" align="center">
                          <Avatar style={styles.avatarStyle(index)}>
                            {item.creatorName[0]}
                          </Avatar>
                          <div>
                            <Text strong style={{ color: 'inherit' }}>
                              {item.creatorName}
                            </Text>
                            <div>
                              <span style={styles.timeTagStyle()}>
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
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <SoundTwoTone style={{ fontSize: 14, marginTop: 2 }} />
                        <Text
                          style={{
                            color: 'inherit',
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
            <div style={styles.toggleAreaStyle()}>
              <Text
                style={styles.toggleTextStyle()}
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
