import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { AssertOption } from '@/pages/Httpx/componets/assertEnum';
import { IPlayCaseContentResult } from '@/pages/Play/componets/uiTypes';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CheckCircleTwoTone,
  CheckOutlined,
  CloseCircleTwoTone,
  CloseOutlined,
  QuestionOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface SelfProps {
  content: IPlayCaseContentResult;
}

const Index: FC<SelfProps> = ({ content }) => {
  const { content_asserts } = content;

  return (
    <div>
      <ProCard
        bordered
        style={{
          borderRadius: '5px',
          borderLeft: `3px solid ${
            content.content_result ? '#52c41a' : '#ff4d4f'
          }`,
          marginTop: 5,
        }}
        headerBordered
        collapsible
        defaultCollapsed
        extra={
          <Space>
            {content.content_asserts && (
              <Text type={'secondary'}>
                断言 x {content.content_asserts.length}
              </Text>
            )}
          </Space>
        }
        title={
          <Space>
            <Tag color={'green-inverse'}>STEP_{content.content_step}</Tag>
            <Tooltip title={'断言'}>
              <Tag color={'red-inverse'} icon={<QuestionOutlined />} />
            </Tooltip>
            {content.content_result ? (
              <CheckCircleTwoTone twoToneColor={'#52c41a'} />
            ) : (
              <CloseCircleTwoTone twoToneColor={'#ff4d4f'} />
            )}
            <Tooltip title={content.content_desc || null}>
              <Text type={'secondary'} style={{ marginLeft: 20 }}>
                {content.content_name}
              </Text>
            </Tooltip>
          </Space>
        }
        collapsibleIconRender={({}) => {
          return true;
        }}
      >
        {content_asserts && content_asserts.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <Divider orientation="left" plain>
              <Space>
                <CheckCircleOutlined />
                <Text strong>断言详情</Text>
              </Space>
            </Divider>

            {content_asserts.map((item, index) => (
              <ProCard
                size="small"
                style={{
                  height: '100%',
                  borderLeft: `3px solid ${
                    item.assert_result ? '#52c41a' : '#ff4d4f'
                  }`,
                  borderRadius: '6px',
                  marginTop: 5,
                }}
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {/* 标题行 */}
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor: '#1890ff',
                            marginRight: 8,
                          }}
                        />
                        <Text strong>变量名：{item.assert_key}</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Tag
                        color={item.assert_result ? 'success' : 'error'}
                        icon={
                          item.assert_result ? (
                            <CheckOutlined />
                          ) : (
                            <CloseOutlined />
                          )
                        }
                        style={{
                          borderRadius: '12px',
                          margin: 0,
                        }}
                      >
                        {
                          AssertOption.find((i) => i.value === item.assert_type)
                            ?.label
                        }
                      </Tag>
                    </Col>
                  </Row>

                  {/* 对比卡片 */}
                  <Row gutter={12}>
                    <Col span={12}>
                      <ProCard
                        size="small"
                        headerBordered
                        title={
                          <Text style={{ fontSize: '12px' }}>
                            <UserOutlined style={{ marginRight: 4 }} />
                            变量值
                          </Text>
                        }
                        style={{
                          borderColor: '#b7eb8f',
                        }}
                      >
                        {typeof item.assert_actual === 'object' ? (
                          <AceCodeEditor
                            readonly={true}
                            _mode={'json'}
                            value={JSON.stringify(item.assert_actual, null, 2)}
                            height={'10vh'}
                          />
                        ) : (
                          <Text
                            code
                            style={{
                              color: item.assert_result ? '#389e0d' : '#cf1322',
                              fontSize: '13px',
                              wordBreak: 'break-all',
                            }}
                          >
                            {String(item.assert_actual)}
                          </Text>
                        )}
                      </ProCard>
                    </Col>
                    <Col span={12}>
                      <ProCard
                        headerBordered
                        size="small"
                        title={
                          <Text style={{ fontSize: '12px' }}>
                            <CheckCircleOutlined style={{ marginRight: 4 }} />
                            预期值
                          </Text>
                        }
                        style={{
                          borderColor: item.assert_result
                            ? '#b7eb8f'
                            : '#ffccc7',
                        }}
                      >
                        {typeof item.assert_expect === 'object' ? (
                          <AceCodeEditor
                            readonly={true}
                            _mode={'json'}
                            value={JSON.stringify(item.assert_expect, null, 2)}
                            height={'10vh'}
                          />
                        ) : (
                          <Text
                            code
                            style={{
                              color: item.assert_result ? '#389e0d' : '#cf1322',
                              fontSize: '13px',
                              wordBreak: 'break-all',
                            }}
                          >
                            {String(item.assert_expect)}
                          </Text>
                        )}
                      </ProCard>
                    </Col>
                  </Row>

                  {/* 状态说明 */}
                  {!item.assert_result && (
                    <Alert
                      message={
                        <Space>
                          <WarningOutlined />
                          <span>预期值与实际值不匹配</span>
                        </Space>
                      }
                      type="error"
                      showIcon
                      style={{ borderRadius: '4px' }}
                    />
                  )}
                </Space>
              </ProCard>
            ))}

            {/* 统计信息 */}
            {content_asserts.length > 1 && (
              <div style={{ marginTop: 16 }}>
                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <BarChartOutlined />
                        <Text type="secondary">断言统计</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Badge
                          status="success"
                          text={
                            <Text>
                              通过：
                              <Text strong>
                                {
                                  content_asserts.filter(
                                    (item) => item.assert_result,
                                  ).length
                                }
                              </Text>
                            </Text>
                          }
                        />
                        <Badge
                          status="error"
                          text={
                            <Text>
                              失败：
                              <Text strong>
                                {
                                  content_asserts.filter(
                                    (item) => !item.assert_result,
                                  ).length
                                }
                              </Text>
                            </Text>
                          }
                        />
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}
          </div>
        )}
      </ProCard>
    </div>
  );
};

export default Index;
