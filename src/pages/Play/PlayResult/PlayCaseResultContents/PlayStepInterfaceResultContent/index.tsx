import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import AssertColumns from '@/pages/Httpx/componets/AssertColumns';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import RequestInfo from '@/pages/Httpx/InterfaceApiResponse/RequestInfo';
import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ITryResponseInfo } from '@/pages/Httpx/types';
import { IPlayCaseContentResult } from '@/pages/Play/componets/uiTypes';
import { CONFIG } from '@/utils/config';
import {
  ApiOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface Props {
  result: ITryResponseInfo;
  content: IPlayCaseContentResult;
}

const Index: FC<Props> = ({ result, content }) => {
  const { API_STATUS } = CONFIG;

  const tabExtra = (response: ITryResponseInfo) => {
    if (!response.response_status) return null;
    const { response_status, useTime, startTime } = response;
    const { color, text = '' } = API_STATUS[response_status!] || {
      color: '#F56C6C',
      text: '',
    };
    return (
      <Space
        size={12}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          rowGap: 8,
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 14,
          }}
        >
          {/* Method 标签 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: '#6c757d',
                fontWeight: 500,
                marginRight: 4,
              }}
            >
              Method:
            </span>
            <span
              style={{
                color: color,
                fontWeight: 600,
                padding: '2px 8px',
                backgroundColor: `${color}10`,
                borderRadius: 4,
              }}
            >
              {response.request_method}
            </span>
          </div>

          {/* Status Code 标签 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: '#6c757d',
                fontWeight: 500,
                marginRight: 4,
              }}
            >
              Status:
            </span>
            <span
              style={{
                color: color,
                fontWeight: 600,
                padding: '2px 8px',
                backgroundColor: `${color}10`,
                borderRadius: 4,
              }}
            >
              {response_status}
              {text && <span style={{ marginLeft: 4 }}>{text}</span>}
            </span>
          </div>

          {/* Time 标签组 */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {/* Request Time */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  color: '#6c757d',
                  fontWeight: 500,
                  marginRight: 4,
                }}
              >
                Request_Time:
              </span>
              <span
                style={{
                  color: '#67C23A',
                  fontWeight: 600,
                }}
              >
                {startTime}
              </span>
            </div>

            {/* Use Time */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  color: '#6c757d',
                  fontWeight: 500,
                  marginRight: 4,
                }}
              >
                Latency:
              </span>
              <span
                style={{
                  color: '#67C23A',
                  fontWeight: 600,
                }}
              >
                {useTime}ms
              </span>
            </div>
          </div>
        </div>
      </Space>
    );
  };
  const renderResponseBody = (item: any) => {
    const { response_txt } = item;
    try {
      const jsonValue = JSON.parse(response_txt);
      const value = JSON.stringify(jsonValue, null, 2);
      return <AceCodeEditor value={value} readonly={true} />;
    } catch (e) {
      return (
        <AceCodeEditor value={response_txt} _mode={'html'} readonly={true} />
      );
    }
  };

  return (
    <div>
      <ProCard
        extra={tabExtra(result)}
        bordered
        style={{
          borderRadius: '5px',
          borderLeft: `3px solid ${result.result ? '#52c41a' : '#ff4d4f'}`,
          marginTop: 5,
        }}
        collapsibleIconRender={({}) => {
          return (
            <Space>
              <Tag color={'green-inverse'}>STEP_{content.content_step}</Tag>
              <Tooltip title={'接口'}>
                <Tag color={'gold-inverse'} icon={<ApiOutlined />} />
              </Tooltip>
              {result.result === 'SUCCESS' ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor={'#c20000'} />
              )}
              <Text type={'secondary'} style={{ marginLeft: 20 }}>
                {result.interfaceName}
              </Text>
            </Space>
          );
        }}
        headerBordered
        collapsible
        defaultCollapsed
      >
        <MyTabs
          type={'line'}
          defaultActiveKey={'3'}
          items={[
            {
              key: '1',
              label: '请求头',
              children: <RequestHeaders header={result.request_head} />,
            },
            {
              key: '2',
              label: '响应头',
              children: <RequestHeaders header={result.response_head} />,
            },
            {
              key: '3',
              label: '响应体',
              children: renderResponseBody(result),
            },
            {
              key: '4',
              label: '变量提取',
              children: (
                <RespProTable
                  columns={ResponseExtractColumns}
                  dataSource={result.extracts}
                />
              ),
            },
            {
              key: '5',
              label: '接口断言',
              children: (
                <RespProTable
                  columns={AssertColumns}
                  dataSource={result.asserts}
                />
              ),
            },
            {
              key: '6',
              label: '实际请求',
              children: (
                <RequestInfo
                  method={result.request_method}
                  interfaceApiInfo={result.request_info}
                />
              ),
            },
          ]}
          size={'small'}
        />
      </ProCard>
    </div>
  );
};

export default Index;
