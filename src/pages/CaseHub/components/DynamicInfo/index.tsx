import { queryTestCaseDynamic } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICaseDynamic } from '@/pages/CaseHub/types';
import { HistoryOutlined, SoundTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Timeline, Typography } from 'antd';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDynamicInfoStyles } from './styles';

const { Text, Title } = Typography;

interface IProps {
  caseId?: number;
  planId?: string;
}

export interface DynamicInfoRef {
  refresh: () => void;
}

const DynamicInfo = forwardRef<DynamicInfoRef, IProps>(
  ({ caseId, planId }, ref) => {
    const [originalData, setOriginalData] = useState<ICaseDynamic[]>([]);
    const [showMore, setShowMore] = useState(false);
    const { colors, spacing } = useCaseHubTheme();
    const styles = useDynamicInfoStyles();
    const fetchingRef = useRef(false);

    /** 派生：实际展示的数据（支持展开/收起） */
    const displayData = useMemo(() => {
      if (showMore) return originalData;
      return originalData.length > 5 ? originalData.slice(0, 5) : originalData;
    }, [showMore, originalData]);

    /** 派生：是否显示展开/收起按钮 */
    const shouldShowToggle = useMemo(
      () => originalData.length > 5,
      [originalData],
    );

    const fetchData = () => {
      if (!caseId) return;
      fetchingRef.current = true;
      setShowMore(false);
      queryTestCaseDynamic(caseId, planId).then(({ code, data }) => {
        fetchingRef.current = false;
        if (code === 0) {
          setOriginalData(data);
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

    return (
      <div style={styles.container()}>
        <ProCard style={styles.card()} styles={{ body: { padding: 0 } }}>
          <div style={styles.header()}>
            <div style={styles.headerIcon()}>
              <HistoryOutlined
                style={{ fontSize: 18, color: colors.primary }}
              />
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

          <div>
            {displayData.length === 0 ? (
              <div style={styles.emptyState()}>
                <div style={styles.emptyIconWrap()}>
                  <SoundTwoTone style={{ fontSize: 24 }} />
                </div>
                <Text type="secondary">暂无操作记录</Text>
              </div>
            ) : (
              <Timeline
                items={displayData.map((item, index) => ({
                  icon: <div style={styles.dot()} />,
                  content: (
                    <div style={styles.timelineItem(index)} key={item.id}>
                      <div style={styles.contentCard() as any}>
                        <div style={styles.metaRow()}>
                          <Text strong style={{ color: colors.text }}>
                            {item.creatorName}
                          </Text>
                          <span style={styles.timeTag()}>
                            {item.create_time}
                          </span>
                        </div>

                        <div style={styles.descriptionRow()}>
                          <span style={styles.descriptionIcon()}>
                            <SoundTwoTone style={{ fontSize: 14 }} />
                          </span>
                          <Text style={styles.descriptionText()}>
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
                <span
                  style={styles.toggleButton()}
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore
                    ? '收起'
                    : `展开更多 (${originalData.length - 5} 条)`}
                </span>
              </div>
            )}
          </div>
        </ProCard>
      </div>
    );
  },
);

DynamicInfo.displayName = 'DynamicInfo';

export default DynamicInfo;
