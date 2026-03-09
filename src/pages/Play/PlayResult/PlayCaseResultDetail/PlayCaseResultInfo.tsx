import { IUIResult } from '@/pages/Play/componets/uiTypes';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import {
  Badge,
  Col,
  Divider,
  Image,
  Row,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC } from 'react';

const { useToken } = theme;
const { Title, Text, Paragraph } = Typography;
const ProDescriptionsItem = ProDescriptions.Item;

interface ISelfProps {
  resultDetail?: IUIResult;
}

const PlayCaseResultInfo: FC<ISelfProps> = ({ resultDetail }) => {
  const { token } = useToken();
  const isSuccess = resultDetail?.result === 'SUCCESS';

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
                {resultDetail?.ui_case_name || '未命名测试'}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {resultDetail?.ui_case_description || '暂无描述'}
              </Text>
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
                  {resultDetail?.result || '未知'}
                </Tag>
              }
            />
          </Col>
        </Row>
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
                <Text strong>{resultDetail?.start_time || '-'}</Text>
              </Space>
            </div>
          </Col>
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
                  <ClockCircleOutlined /> 用时
                </Text>
                <Text strong style={{ color: token.colorPrimary }}>
                  {resultDetail?.use_time || '-'}
                </Text>
              </Space>
            </div>
          </Col>
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
                  <ClockCircleOutlined /> 结束时间
                </Text>
                <Text strong>{resultDetail?.end_time || '-'}</Text>
              </Space>
            </div>
          </Col>
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
                <Text strong>{resultDetail?.starter_name || '-'}</Text>
              </Space>
            </div>
          </Col>
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
                  <FileTextOutlined /> 用例步长
                </Text>
                <Text strong>{resultDetail?.ui_case_step_num || 0}</Text>
              </Space>
            </div>
          </Col>
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
                  {resultDetail?.result || '未知'}
                </Tag>
              </Space>
            </div>
          </Col>
        </Row>
      </ProCard>

      {/* 错误信息卡片 */}
      {resultDetail?.result === 'FAIL' && (
        <ProCard
          title={
            <Space>
              <WarningOutlined style={{ color: token.colorError }} />
              <Text strong style={{ color: token.colorError }}>
                错误信息
              </Text>
            </Space>
          }
          style={{
            marginBottom: '16px',
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            borderColor: token.colorErrorBorder,
          }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* 错误步骤信息 */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: '12px',
                    background: token.colorErrorBg,
                    borderRadius: token.borderRadiusSM,
                    border: `1px solid ${token.colorErrorBorder}`,
                  }}
                >
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      错误步骤
                    </Text>
                    <Tag color="error">
                      步骤 {resultDetail?.ui_case_err_step || '-'}
                    </Tag>
                  </Space>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: '12px',
                    background: token.colorErrorBg,
                    borderRadius: token.borderRadiusSM,
                    border: `1px solid ${token.colorErrorBorder}`,
                  }}
                >
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      错误步骤标题
                    </Text>
                    <Text strong>
                      {resultDetail?.ui_case_err_step_title || '-'}
                    </Text>
                  </Space>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            {/* 错误原因 */}
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: '12px',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                错误步骤原因
              </Text>
              <Paragraph
                style={{
                  padding: '12px',
                  background: token.colorBgLayout,
                  borderRadius: token.borderRadiusSM,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {resultDetail?.ui_case_err_step_msg || '暂无错误信息'}
              </Paragraph>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* 错误截图 */}
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: '12px',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                <PictureOutlined /> 错误步骤截图
              </Text>
              {resultDetail?.ui_case_err_step_pic_path ? (
                <Image
                  width="100%"
                  style={{
                    maxWidth: '600px',
                    borderRadius: token.borderRadiusSM,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                  src={resultDetail.ui_case_err_step_pic_path}
                  placeholder
                />
              ) : (
                <div
                  style={{
                    padding: '40px',
                    background: token.colorBgLayout,
                    borderRadius: token.borderRadiusSM,
                    border: `1px dashed ${token.colorBorderSecondary}`,
                    textAlign: 'center',
                  }}
                >
                  <Text type="secondary">暂无错误截图</Text>
                </div>
              )}
            </div>
          </Space>
        </ProCard>
      )}
    </div>
  );
};

export default PlayCaseResultInfo;
