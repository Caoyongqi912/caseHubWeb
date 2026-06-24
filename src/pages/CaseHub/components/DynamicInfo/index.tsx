/**
 * @file src/pages/CaseHub/components/DynamicInfo/index.tsx
 * @description 用例操作动态组件，以科技感时间线形式展示用例的操作记录
 */

import { queryTestCaseDynamic } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICaseDynamic } from '@/pages/CaseHub/types';
import {
  ClockCircleOutlined,
  DownOutlined,
  HistoryOutlined,
  RadarChartOutlined,
  SoundTwoTone,
  UpOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Typography } from 'antd';
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

/**
 * 用例操作动态组件
 *
 * 功能特性：
 * - 展示指定用例的操作记录时间线
 * - 超过 5 条时支持展开/收起
 * - 通过 ref 暴露 refresh 方法供父组件主动刷新
 * - 所有颜色取自 antd Token，自动适配项目主题切换
 */
const DynamicInfo = forwardRef<DynamicInfoRef, IProps>(
  ({ caseId, planId }, ref) => {
    const [originalData, setOriginalData] = useState<ICaseDynamic[]>([]);
    const [showMore, setShowMore] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [toggleHover, setToggleHover] = useState(false);
    const { colors } = useCaseHubTheme();
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

    /**
     * 获取操作动态数据
     * 仅在 caseId 存在时发起请求，请求前重置展开状态避免数据错位
     */
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
        {/* 注入科技感动画关键帧，动画本身不依赖主题色 */}
        <style>{`
          @keyframes slideInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        <ProCard style={styles.card()} styles={{ body: { padding: 0 } }}>
          {/* 头部标题区：脉冲科技图标 + 标题统计 + 状态徽标 */}
          <div style={styles.header()}>
            <div style={styles.headerIcon()}>
              <HistoryOutlined
                style={{ fontSize: 20, color: colors.primary }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title level={5} style={styles.headerTitle()}>
                操作动态
              </Title>
              <Text type="secondary" style={styles.headerCount()}>
                共 {originalData.length} 条记录
              </Text>
            </div>
            <div style={styles.headerBadge()}>
              <RadarChartOutlined
                style={{ color: colors.primary, fontSize: 14 }}
              />
            </div>
          </div>

          {/* 主体内容区：空状态或科技感时间线 */}
          <div style={styles.body()}>
            {displayData.length === 0 ? (
              <div style={styles.emptyState()}>
                <div style={styles.emptyIconWrap()}>
                  <SoundTwoTone style={{ fontSize: 28 }} />
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  暂无操作记录
                </Text>
                <Text type="secondary" style={{ fontSize: 12, opacity: 0.7 }}>
                  该用例尚未产生任何动态
                </Text>
              </div>
            ) : (
              <div style={styles.timeline()}>
                {displayData.map((item, index) => {
                  const isLast = index === displayData.length - 1;
                  const isHovered = hoveredId === item.id;

                  return (
                    <div
                      key={item.id}
                      style={styles.timelineRow(index)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* 左侧时间线节点与连线 */}
                      <div style={styles.timelineLeft()}>
                        <div style={styles.node()} />
                        {!isLast && <div style={styles.connector()} />}
                      </div>

                      {/* 右侧记录卡片：悬停时产生科技光效 */}
                      <div
                        style={{
                          ...styles.recordCard(),
                          ...(isHovered ? styles.recordCardHover() : {}),
                        }}
                      >
                        <div style={styles.recordShimmer()} />
                        <div style={styles.recordHeader()}>
                          <Text strong style={styles.userName()}>
                            {item.creatorName}
                          </Text>
                          <span style={styles.timeTag()}>
                            <ClockCircleOutlined style={{ fontSize: 10 }} />
                            {item.create_time}
                          </span>
                        </div>
                        <div style={styles.recordBody()}>
                          <span style={styles.recordIcon()}>
                            <SoundTwoTone style={{ fontSize: 12 }} />
                          </span>
                          <Text style={styles.recordDescription()}>
                            {item.description}
                          </Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 展开/收起控制区：超过 5 条时展示霓虹按钮 */}
            {shouldShowToggle && (
              <div style={styles.toggleArea()}>
                <span
                  style={{
                    ...styles.toggleButton(),
                    ...(toggleHover ? styles.toggleButtonHover() : {}),
                  }}
                  onClick={() => setShowMore(!showMore)}
                  onMouseEnter={() => setToggleHover(true)}
                  onMouseLeave={() => setToggleHover(false)}
                >
                  {showMore ? (
                    <>
                      收起 <UpOutlined style={{ fontSize: 12 }} />
                    </>
                  ) : (
                    <>
                      展开更多 ({originalData.length - 5} 条)
                      <DownOutlined style={{ fontSize: 12 }} />
                    </>
                  )}
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
