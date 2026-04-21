import { queryDynamicHistoryList } from '@/api/inter';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Timeline, Tooltip, Typography } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { IInterfaceRemark } from '../../types';

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
    if (expanded || sortedData.length <= 5) {
      return sortedData;
    }
    return sortedData.slice(0, 5);
  }, [sortedData, expanded]);

  const formatTime = (time: string) => {
    const date = new Date(time);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const timelineItems = displayData.map((item) => ({
    key: item.id,
    dot: <ClockCircleOutlined style={{ fontSize: 14 }} />,
    children: (
      <div style={{ paddingBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
            {item.creatorName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatTime(item.create_time)}
          </Text>
        </div>
        <Tooltip title={item.description} placement="bottomLeft">
          <Paragraph
            style={{ margin: 0, fontSize: 13, color: '#595959' }}
            ellipsis={{ rows: 3, expandable: false }}
          >
            {item.description}
          </Paragraph>
        </Tooltip>
      </div>
    ),
  }));

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <span>变更历史</span>
          <Text type="secondary" style={{ fontWeight: 'normal', fontSize: 12 }}>
            ({sortedData.length})
          </Text>
        </div>
      }
      styles={{ body: { padding: '16px 24px' } }}
      bordered={false}
    >
      <Timeline items={timelineItems} />

      {sortedData.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '收起' : `展开更多 (${sortedData.length - 5} 条)`}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ApiRemark;
