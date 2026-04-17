import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import { ProCard } from '@ant-design/pro-components';
import { Empty, Space, Tag, Typography } from 'antd';
import { FC } from 'react';
import { IResponseInfo } from '../types';

const { Text } = Typography;

interface Props {
  info: IResponseInfo;
}

/**
 * 请求信息组件
 * 用于显示接口请求的详细信息，包括请求头、Query参数和请求体
 */
const RequestInfo: FC<Props> = ({ info }) => {
  const {
    request_body_type,
    request_json,
    request_data,
    request_url,
    request_method,
  } = info;

  /**
   * 根据请求体类型获取对应的数据
   * @description body_type: 0=无请求体, 1=raw格式使用request_body, 2=data格式使用request_data
   */
  const getRequestBodyData = (): { type: number; data: unknown } => {
    if (request_body_type === 0) {
      return { type: 0, data: null };
    }
    if (request_body_type === 1) {
      return { type: 1, data: request_json };
    }
    if (request_body_type === 2) {
      return { type: 2, data: request_data };
    }
    return { type: 0, data: null };
  };

  /**
   * 获取请求体类型的显示文本
   * @description 根据 body_type 返回对应的类型描述
   */
  const getBodyTypeLabel = (type: number): string => {
    switch (type) {
      case 0:
        return '无请求体';
      case 1:
        return 'Raw';
      case 2:
        return 'FormData';
      default:
        return '未知';
    }
  };

  /**
   * 渲染请求体内容
   * @description 根据请求体类型渲染对应的内容，支持JSON格式化和字符串显示
   */
  const renderResponseBody = (bodyType: number, json: unknown) => {
    if (bodyType === 0 || !json) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {bodyType === 0 ? getBodyTypeLabel(bodyType) : '请求体为空'}
            </Text>
          }
        />
      );
    }

    const isObject = typeof json === 'object';
    const isString = typeof json === 'string';

    if (isObject || isString) {
      try {
        const parseTarget = isObject ? json : JSON.parse(json);
        const value = JSON.stringify(parseTarget, null, 2);
        return <AceCodeEditor value={value} readonly={true} _mode="json" />;
      } catch {
        if (isString) {
          return <AceCodeEditor value={json} _mode="html" readonly={true} />;
        }
      }
    }

    return <AceCodeEditor value={String(json)} readonly={true} _mode="text" />;
  };

  const bodyData = getRequestBodyData();

  return (
    <ProCard split={'horizontal'}>
      <ProCard>
        <Space direction={'horizontal'}>
          <Tag
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          >
            {request_method}
          </Tag>
          <Text
            style={{
              fontSize: '14px',
              color: '#64748b',
              fontFamily: 'Monaco, "Courier New", monospace',
            }}
          >
            {request_url}
          </Text>
        </Space>
      </ProCard>
      <ProCard>
        <MyTabs
          size={'small'}
          defaultActiveKey={'1'}
          items={[
            {
              label: 'Header',
              key: '1',
              children: <RequestHeaders header={info.request_headers} />,
            },
            {
              label: 'Query',
              key: '2',
              children: <RequestHeaders header={info.request_params} />,
            },
            {
              label: getBodyTypeLabel(bodyData.type),
              key: '3',
              children: <>{renderResponseBody(bodyData.type, bodyData.data)}</>,
            },
          ]}
        />
      </ProCard>
    </ProCard>
  );
};

export default RequestInfo;
