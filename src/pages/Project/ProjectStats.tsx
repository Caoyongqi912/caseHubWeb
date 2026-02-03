import { queryProjectInfoCount } from '@/api/base';
import {
  DatabaseOutlined,
  EnvironmentOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Col, Row, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';

/**
 * 项目统计组件Props接口
 * 用于接收项目ID参数
 */
interface ProjectStatsProps {
  projectId: number;
}

/**
 * 统计数据接口
 * 定义各类资源的数量统计
 */
interface StatsData {
  db_count: number; // 数据库数量
  env_count: number; // 环境数量
  variable_count: number; // 变量数量
}

/**
 * 项目统计组件
 * 用于展示项目中各类资源的统计信息，包括数据库、环境、推送配置和变量的数量
 */
const ProjectStats: FC<ProjectStatsProps> = ({ projectId }) => {
  // 统计数据状态
  const [stats, setStats] = useState<StatsData>({
    db_count: 0,
    env_count: 0,
    variable_count: 0,
  });
  // 加载状态
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { code, data } = await queryProjectInfoCount(projectId);
      if (code === 0) {
        setStats(data);
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  // 统计项配置数组
  const statItems = [
    {
      title: '数据库',
      value: stats.db_count,
      icon: <DatabaseOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: '环境',
      value: stats.env_count,
      icon: <EnvironmentOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: '变量',
      value: stats.variable_count,
      icon: <KeyOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
    },
  ];

  // 加载中状态显示
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '12px' }}>
        <Spin size="small" />
      </div>
    );
  }

  // 渲染统计卡片
  return (
    <div style={{ marginTop: '16px' }}>
      <Row gutter={[8, 8]}>
        {statItems.map((item, index) => (
          <Col xs={8} sm={8} md={8} key={index}>
            <ProCard
              size="small"
              style={{
                borderRadius: '6px',
                backgroundColor: `${item.color}08`,
                transition: 'all 0.3s ease',
                minWidth: '0',
              }}
              bodyStyle={{
                padding: '8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '0',
              }}
              hoverable
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#8c8c8c',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#262626',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            </ProCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProjectStats;
