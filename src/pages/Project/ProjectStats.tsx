import { pageEnv } from '@/api/base';
import { pageDBConfig } from '@/api/base/dbConfig';
import { pagePushConfig } from '@/api/base/pushConfig';
import { pageInterGlobalVariable } from '@/api/inter/interGlobal';
import {
  DatabaseOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';

/**
 * 项目统计组件Props接口
 * 用于接收项目ID参数
 */
interface ProjectStatsProps {
  projectId: string;
}

/**
 * 统计数据接口
 * 定义各类资源的数量统计
 */
interface StatsData {
  dbCount: number; // 数据库数量
  envCount: number; // 环境数量
  pushCount: number; // 推送配置数量
  variableCount: number; // 变量数量
}

/**
 * 项目统计组件
 * 用于展示项目中各类资源的统计信息，包括数据库、环境、推送配置和变量的数量
 */
const ProjectStats: FC<ProjectStatsProps> = ({ projectId }) => {
  // 统计数据状态
  const [stats, setStats] = useState<StatsData>({
    dbCount: 0,
    envCount: 0,
    pushCount: 0,
    variableCount: 0,
  });
  // 加载状态
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [dbResult, envResult, pushResult, variableResult] =
          await Promise.all([
            pageDBConfig({ project_id: projectId, current: 1, pageSize: 1 }),
            pageEnv({ project_id: projectId, current: 1, pageSize: 1 }),
            pagePushConfig({ project_id: projectId, current: 1, pageSize: 1 }),
            pageInterGlobalVariable({
              project_id: projectId,
              current: 1,
              pageSize: 1,
            }),
          ]);

        setStats({
          dbCount:
            dbResult.code === 0 ? dbResult.data?.pageInfo?.total || 0 : 0,
          envCount:
            envResult.code === 0 ? envResult.data?.pageInfo?.total || 0 : 0,
          pushCount:
            pushResult.code === 0 ? pushResult.data?.pageInfo?.total || 0 : 0,
          variableCount:
            variableResult.code === 0
              ? variableResult.data?.pageInfo?.total || 0
              : 0,
        });
      } catch (error) {
        console.error('Failed to fetch project stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  // 统计项配置数组
  const statItems = [
    {
      title: '数据库',
      value: stats.dbCount,
      icon: <DatabaseOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: '环境',
      value: stats.envCount,
      icon: <EnvironmentOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: '推送',
      value: stats.pushCount,
      icon: <SendOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
    },
    {
      title: '变量',
      value: stats.variableCount,
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
          <Col xs={12} sm={12} md={6} lg={6} key={index}>
            <Card
              size="small"
              style={{
                borderRadius: '6px',
                border: `1px solid ${item.color}20`,
                backgroundColor: `${item.color}08`,
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#8c8c8c',
                      marginBottom: '2px',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#262626',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProjectStats;
