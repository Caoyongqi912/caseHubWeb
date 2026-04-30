import { queryDynamicHistoryList } from '@/api/inter';
import { Empty, Tooltip, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { IInterfaceRemark } from '../../types';
import './ApiRemark.less';

const { Text, Paragraph } = Typography;

interface Props {
  inteface_id?: string | number;
}

const ApiRemark: FC<Props> = ({ inteface_id }) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<IInterfaceRemark[]>([]);

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

  return (
    <div className="api-remark-container">
      <div className="remark-header">
        <div className="header-left">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="header-text">
            <h3 className="header-title">变更历史</h3>
            <span className="header-count">{sortedData.length} 条记录</span>
          </div>
        </div>
      </div>

      <div className="remark-list">
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
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="timeline-marker">
                <div className="marker-dot" />
                {index < displayData.length - 1 && (
                  <div className="marker-line" />
                )}
              </div>

              <div className="remark-content">
                <div className="content-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {item.creatorName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <Text className="user-name">
                        {item.creatorName || '未知用户'}
                      </Text>
                      <Text className="create-time">
                        {formatTime(item.create_time)}
                      </Text>
                    </div>
                  </div>
                  <div className="time-badge">
                    {getRelativeTime(item.create_time)}
                  </div>
                </div>

                <div className="content-body">
                  <Tooltip title={item.description}>
                    <Paragraph
                      className="description"
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
        <div className="remark-footer">
          <button
            className={`expand-btn ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="btn-text">
              {expanded ? '收起记录' : `展开更多 (${sortedData.length - 4} 条)`}
            </span>
            <svg
              className={`arrow-icon ${expanded ? 'rotate' : ''}`}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
  );
};

export default ApiRemark;
