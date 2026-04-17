import { IInterfaceCaseResult } from '@/pages/Httpx/types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  StepForwardOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Badge, Col, Empty, Row, Space, Tag, theme, Typography } from 'antd';
import { FC } from 'react';

const { useToken } = theme;
const { Title, Text, Paragraph } = Typography;

interface SelfProps {
  caseResultInfo?: IInterfaceCaseResult;
}

const InterfaceApiCaseResultBaseInfo: FC<SelfProps> = ({ caseResultInfo }) => {
  const { token } = useToken();

  if (!caseResultInfo) {
    return (
      <div style={{ padding: '40px 16px' }}>
        <Empty
          description="暂无用例结果信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const isSuccess = caseResultInfo.result;

  return (
    <div style={{ padding: '16px' }}>
      {/* 标题区域 */}
      <ProCard
        style={{
          marginBottom: '16px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>
                {caseResultInfo.interface_case_name || '未命名测试'}
              </Title>
              <Space size={8}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  <IdcardOutlined /> {caseResultInfo.interface_case_uid}
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  结果ID: {caseResultInfo.interface_case_id}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Badge
              status={isSuccess ? 'success' : 'error'}
              text={
                <Tag
                  color={isSuccess ? 'success' : 'error'}
                  icon={
                    isSuccess ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  {caseResultInfo.result || '未知'}
                </Tag>
              }
            />
          </Col>
        </Row>

        {/* 用例描述 */}
        {caseResultInfo.interface_case_desc && (
          <div style={{ marginTop: '12px' }}>
            <Paragraph
              type="secondary"
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              {caseResultInfo.interface_case_desc}
            </Paragraph>
          </div>
        )}
      </ProCard>

      {/* 执行信息卡片 */}
      <ProCard
        title={
          <Space>
            <ThunderboltOutlined style={{ color: token.colorPrimary }} />
            <Text strong>执行信息</Text>
          </Space>
        }
        style={{
          marginBottom: '16px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row gutter={[16, 16]}>
          {/* 执行人 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <UserOutlined /> 执行人
                </Text>
                <Text strong>{caseResultInfo.starter_name || '未知'}</Text>
              </Space>
            </div>
          </Col>

          {/* 运行环境 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <EnvironmentOutlined /> 运行环境
                </Text>
                <Tag color="blue">
                  {caseResultInfo.running_env_name || '未配置'}
                </Tag>
              </Space>
            </div>
          </Col>

          {/* 开始时间 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined /> 开始时间
                </Text>
                <Text strong>{caseResultInfo.start_time || '未记录'}</Text>
              </Space>
            </div>
          </Col>

          {/* 总用时 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <FieldTimeOutlined /> 总用时
                </Text>
                <Text strong style={{ color: token.colorPrimary }}>
                  {caseResultInfo.use_time
                    ? `${caseResultInfo.use_time} ms`
                    : '未统计'}
                </Text>
              </Space>
            </div>
          </Col>

          {/* 总步长 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <StepForwardOutlined /> 总步长
                </Text>
                <Text strong>{caseResultInfo.total_num || 0}</Text>
              </Space>
            </div>
          </Col>

          {/* 测试结果 */}
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                padding: '12px',
                background: isSuccess
                  ? token.colorSuccessBg
                  : token.colorErrorBg,
                borderRadius: token.borderRadiusSM,
                border: `1px solid ${
                  isSuccess ? token.colorSuccessBorder : token.colorErrorBorder
                }`,
              }}
            >
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  测试结果
                </Text>
                <Tag
                  color={isSuccess ? 'success' : 'error'}
                  icon={
                    isSuccess ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                >
                  {caseResultInfo.result ? '通过' : '未知'}
                </Tag>
              </Space>
            </div>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default InterfaceApiCaseResultBaseInfo;
