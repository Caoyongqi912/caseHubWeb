import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IJob } from '@/pages/Project/types';
import { EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { List, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import { FC, ReactNode, useState } from 'react';

const { Text, Paragraph } = Typography;

interface Props {
  text: ReactNode;
  record: IJob;
}

const JobParams: FC<Props> = ({ text, record }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 解析参数数据
  const parseParams = () => {
    try {
      let params = text;

      if (typeof params === 'string') {
        params = JSON.parse(params);
      }

      return params;
    } catch (error) {
      return null;
    }
  };

  const params = parseParams();

  // 获取参数数量
  const getParamCount = () => {
    if (!params) return '0 个参数';

    if (Array.isArray(params)) {
      return `${params.length} 个参数`;
    } else if (typeof params === 'object') {
      return `${Object.keys(params).length} 个参数`;
    }

    return '0 个参数';
  };

  // 渲染参数内容
  const renderParamsContent = () => {
    if (!params) {
      return (
        <Space
          direction="vertical"
          align="center"
          style={{ width: '100%', padding: '16px' }}
        >
          <SettingOutlined style={{ fontSize: '24px' }} />
          <Text type="secondary">无参数配置</Text>
        </Space>
      );
    }

    // 数组参数格式 [{key: xx, value: xx}, ...]
    if (Array.isArray(params) && params.length > 0) {
      return (
        <List
          size="small"
          dataSource={params}
          renderItem={(item, index) => {
            if (item && typeof item === 'object') {
              // 键值对格式
              if (item.key !== undefined && item.value !== undefined) {
                return (
                  <List.Item
                    style={{
                      padding: '8px 0',
                      borderRadius: '4px',
                    }}
                  >
                    <Space align="start" style={{ width: '100%' }}>
                      <Tooltip title={String(item.key)}>
                        <Tag
                          color="purple"
                          style={{ margin: 0, maxWidth: '80px' }}
                        >
                          <Paragraph
                            ellipsis={{ rows: 1 }}
                            style={{ margin: 0, fontSize: '11px' }}
                          >
                            {String(item.key)}
                          </Paragraph>
                        </Tag>
                      </Tooltip>
                      <Tooltip title={String(item.value)}>
                        <Paragraph
                          ellipsis={{ rows: 1 }}
                          style={{
                            flex: 1,
                            margin: 0,
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {String(item.value)}
                        </Paragraph>
                      </Tooltip>
                    </Space>
                  </List.Item>
                );
              }

              // 普通对象格式
              return (
                <ProCard
                  key={index}
                  size="small"
                  title={`参数组 ${index + 1}`}
                  headerBordered
                  style={{ marginBottom: '8px' }}
                >
                  <ProDescriptions
                    column={1}
                    size="small"
                    dataSource={item}
                    columns={Object.keys(item).map((key) => ({
                      title: key,
                      dataIndex: key,
                      render: (value) => (
                        <Tooltip title={String(value)}>
                          <Paragraph
                            ellipsis={{ rows: 1 }}
                            style={{ margin: 0, fontSize: '11px' }}
                          >
                            {String(value)}
                          </Paragraph>
                        </Tooltip>
                      ),
                    }))}
                  />
                </ProCard>
              );
            }

            // 非对象格式
            return (
              <List.Item style={{ padding: '4px 0' }}>
                <Paragraph
                  ellipsis={{ rows: 1 }}
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                >
                  {String(item)}
                </Paragraph>
              </List.Item>
            );
          }}
        />
      );
    }

    // 对象参数格式
    if (params && typeof params === 'object' && !Array.isArray(params)) {
      const entries = Object.entries(params);
      if (entries.length === 0) return null;

      return (
        <List
          size="small"
          dataSource={entries}
          renderItem={([key, value], index) => (
            <List.Item
              style={{
                padding: '8px 0',
                backgroundColor: index % 2 === 0 ? 'transparent' : '#fafafa',
                borderRadius: '4px',
              }}
            >
              <Space align="start" style={{ width: '100%' }}>
                <Tooltip title={String(key)}>
                  <Tag color="blue" style={{ margin: 0, maxWidth: '80px' }}>
                    <Paragraph
                      ellipsis={{ rows: 1 }}
                      style={{ margin: 0, fontSize: '11px' }}
                    >
                      {String(key)}
                    </Paragraph>
                  </Tag>
                </Tooltip>
                <Tooltip title={String(value)}>
                  <Paragraph
                    ellipsis={{ rows: 1 }}
                    style={{
                      flex: 1,
                      margin: 0,
                      fontSize: '11px',
                      backgroundColor: '#f0f5ff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {String(value)}
                  </Paragraph>
                </Tooltip>
              </Space>
            </List.Item>
          )}
        />
      );
    }

    return null;
  };

  if (!params) {
    return (
      <ProCard
        size="small"
        layout="center"
        bordered
        style={{
          borderRadius: '8px',
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Space direction="vertical" align="center" size={8}>
          <SettingOutlined style={{ fontSize: '20px' }} />
          <Text type="secondary">无参数配置</Text>
        </Space>
      </ProCard>
    );
  }

  return (
    <>
      <Modal
        title={'参数详情'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
      >
        <ProCard
          bordered
          headerBordered
          size="small"
          style={{ marginTop: '16px' }}
        >
          {' '}
          <AceCodeEditor
            readonly={true}
            _mode={'json'}
            value={JSON.stringify(
              typeof text === 'string' ? JSON.parse(text) : text,
              null,
              2,
            )}
          />
        </ProCard>
      </Modal>
      <ProCard
        size="small"
        style={{
          borderRadius: '8px',
        }}
        bodyStyle={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题区域 */}
        <Space
          align="center"
          style={{
            width: '100%',
          }}
        >
          <SettingOutlined style={{ fontSize: '14px', color: '#722ed1' }} />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {getParamCount()}
          </Text>
        </Space>
        {/* 参数内容 */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
          {renderParamsContent()}
        </div>
        {/* 查看更多按钮 */}
        {record.job_kwargs !== null && (
          <Space
            style={{
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <a
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{ fontSize: '11px' }}
            >
              <EyeOutlined style={{ marginRight: '4px', fontSize: '11px' }} />
              查看完整参数
            </a>
          </Space>
        )}
      </ProCard>
    </>
  );
};

export default JobParams;
