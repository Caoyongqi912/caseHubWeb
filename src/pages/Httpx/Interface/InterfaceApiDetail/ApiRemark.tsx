import { queryDynamicHistoryList } from '@/api/inter';
import { Empty, theme, Tooltip, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { IInterfaceRemark } from '../../types';

const { Text, Paragraph } = Typography;

interface Props {
  inteface_id?: string | number;
}

const ApiRemark: FC<Props> = ({ inteface_id }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<IInterfaceRemark[]>([]);
  const { token } = theme.useToken();

  useEffect(() => {
    if (inteface_id) {
      queryDynamicHistoryList(inteface_id).then((res) => {
        setData(res.data || []);
      });
    }
  }, [inteface_id]);

  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) =>
        new Date(b.create_time).getTime() - new Date(a.create_time).getTime(),
    );
  }, [data]);

  const displayData = useMemo(() => {
    if (expanded || sortedData.length <= 4) {
      return sortedData;
    }
    return sortedData.slice(0, 4);
  }, [sortedData, expanded]);

  const formatTime = (time: string) => {
    const date = new Date(time);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const getRelativeTime = (time: string) => {
    const now = new Date().getTime();
    const createTime = new Date(time).getTime();
    const diff = now - createTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    containerBg: isDark
      ? 'rgba(22, 27, 34, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    containerBorder: isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.06)',
    contentBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    contentBgHover: isDark
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.04)',
    contentBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    contentBorderHover: isDark
      ? 'rgba(88, 166, 255, 0.2)'
      : 'rgba(88, 166, 255, 0.3)',
    textPrimary: isDark ? '#e6edf3' : 'rgba(0, 0, 0, 0.88)',
    textSecondary: isDark ? 'rgba(139, 148, 158, 0.8)' : 'rgba(0, 0, 0, 0.45)',
    textDescription: isDark
      ? 'rgba(225, 228, 232, 0.85)'
      : 'rgba(0, 0, 0, 0.65)',
    accentPrimary: '#58a6ff',
    accentSecondary: '#8b5cf6',
    badgeBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  };

  return (
    <>
      <style>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(88, 166, 255, 0.15),
              0 0 12px rgba(88, 166, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(88, 166, 255, 0.1),
              0 0 20px rgba(88, 166, 255, 0.4);
          }
        }

        @media (max-width: 768px) {
          .api-remark-container {
            padding: 16px !important;
          }
          .remark-item {
            gap: 12px !important;
          }
          .marker-line {
            min-height: 40px !important;
          }
          .content-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <div
        className="api-remark-container"
        style={{
          padding: 24,
          minHeight: 300,
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          background: colors.containerBg,
          border: `1px solid ${colors.containerBorder}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at 20% 0%, rgba(88, 166, 255, ${
              isDark ? '0.06' : '0.08'
            }) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(139, 92, 246, ${
              isDark ? '0.05' : '0.06'
            }) 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          className="remark-header"
          style={{ marginBottom: 28, position: 'relative', zIndex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.accentPrimary}26, ${colors.accentSecondary}26)`,
                border: `1px solid ${colors.accentPrimary}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.accentPrimary,
                boxShadow: `0 4px 16px ${colors.accentPrimary}26`,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: '0 0 4px 0',
                  letterSpacing: 0.5,
                }}
              >
                变更历史
              </h3>
              <span
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                {sortedData.length} 条记录
              </span>
            </div>
          </div>
        </div>

        <div
          className="remark-list"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {sortedData.length === 0 ? (
            <Empty
              description="暂无变更记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            displayData.map((item, index) => (
              <div
                key={item.id}
                className="remark-item"
                style={{
                  display: 'flex',
                  gap: 20,
                  animation: `fadeInRight 0.4s ease-out forwards`,
                  animationDelay: `${index * 0.08}s`,
                  opacity: 0,
                }}
              >
                <div
                  className="timeline-marker"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 8,
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="marker-dot"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
                      border: `2px solid ${colors.containerBg}`,
                      boxShadow: `0 0 0 4px ${colors.accentPrimary}26, 0 0 12px ${colors.accentPrimary}4d`,
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                  {index < displayData.length - 1 && (
                    <div
                      className="marker-line"
                      style={{
                        width: 2,
                        flex: 1,
                        background: `linear-gradient(180deg, ${colors.accentPrimary}66, ${colors.accentSecondary}33)`,
                        marginTop: 8,
                        minHeight: 60,
                      }}
                    />
                  )}
                </div>

                <div
                  className="remark-content"
                  style={{
                    flex: 1,
                    background: colors.contentBg,
                    border: `1px solid ${colors.contentBorder}`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.contentBgHover;
                    e.currentTarget.style.borderColor =
                      colors.contentBorderHover;
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${
                      isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }, 0 0 40px ${colors.accentPrimary}0d`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.contentBg;
                    e.currentTarget.style.borderColor = colors.contentBorder;
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="content-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${colors.accentPrimary}40`,
                        }}
                      >
                        {item.creatorName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: colors.accentPrimary,
                            margin: 0,
                          }}
                        >
                          {item.creatorName || '未知用户'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textSecondary,
                            margin: 0,
                            fontFamily:
                              '"JetBrains Mono", "SF Mono", monospace',
                          }}
                        >
                          {formatTime(item.create_time)}
                        </Text>
                      </div>
                    </div>
                    <div
                      className="time-badge"
                      style={{
                        fontSize: 11,
                        color: colors.textSecondary,
                        background: colors.badgeBg,
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: `1px solid ${colors.contentBorder}`,
                        fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                      }}
                    >
                      {getRelativeTime(item.create_time)}
                    </div>
                  </div>

                  <div className="content-body">
                    <Tooltip title={item.description}>
                      <Paragraph
                        style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: colors.textDescription,
                          margin: 0,
                          cursor: 'pointer',
                        }}
                        ellipsis={{ rows: 3, expandable: false }}
                      >
                        {item.description || '无描述'}
                      </Paragraph>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {sortedData.length > 4 && (
          <div
            className="remark-footer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 16,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <button
              className={`expand-btn ${expanded ? 'expanded' : ''}`}
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background: expanded
                  ? `linear-gradient(135deg, ${colors.accentSecondary}1a, ${colors.accentPrimary}1a)`
                  : `linear-gradient(135deg, ${colors.accentPrimary}1a, ${colors.accentSecondary}1a)`,
                border: `1px solid ${colors.accentPrimary}33`,
                borderRadius: 8,
                color: colors.accentPrimary,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accentPrimary}33, ${colors.accentSecondary}33)`;
                e.currentTarget.style.borderColor = `${colors.accentPrimary}66`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${colors.accentPrimary}26`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = expanded
                  ? `linear-gradient(135deg, ${colors.accentSecondary}1a, ${colors.accentPrimary}1a)`
                  : `linear-gradient(135deg, ${colors.accentPrimary}1a, ${colors.accentSecondary}1a)`;
                e.currentTarget.style.borderColor = `${colors.accentPrimary}33`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ transition: 'all 0.3s ease' }}>
                {expanded
                  ? '收起记录'
                  : `展开更多 (${sortedData.length - 4} 条)`}
              </span>
              <svg
                className={`arrow-icon ${expanded ? 'rotate' : ''}`}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transition: 'transform 0.3s ease',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiRemark;
