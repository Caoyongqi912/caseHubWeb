import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import AssertColumns from '@/pages/Httpx/componets/AssertColumns';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import RequestInfo from '@/pages/Httpx/InterfaceApiResponse/RequestInfo';
import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult, ITryResponseInfo } from '@/pages/Httpx/types';
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
  prefix: string;
  result: ICaseContentResult;
}

const ApiResult: FC<Props> = ({ result, prefix }) => {
  const { API_STATUS } = CONFIG;

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

  const stepTag = (index: number) => {
    if (prefix === 'STEP') {
      return (
        <Tag color={'green-inverse'}>
          {prefix}_{result.content_step}
        </Tag>
      );
    } else {
      return (
        <Tag color={'green-inverse'}>
          {prefix}_{index + 1}
        </Tag>
      );
    }
  };
  return (
    <>
      {result.data && result.data.length > 0 && (
        <>
          {result.data.map((item: ITryResponseInfo, index: number) => (
            <ProCard
              extra={tabExtra(item)}
              bordered
              style={{
                borderRadius: '5px',
                borderLeft: `3px solid ${item.result ? '#52c41a' : '#ff4d4f'}`,

                marginTop: 5,
              }}
              collapsibleIconRender={({}) => {
                return (
                  <Space>
                    {stepTag(index)}
                    <Tooltip title={'接口'}>
                      <Tag color={'gold-inverse'} icon={<ApiOutlined />} />
                    </Tooltip>
                    {item.result === 'SUCCESS' ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseCircleTwoTone twoToneColor={'#c20000'} />
                    )}
                    <Text type={'secondary'} style={{ marginLeft: 20 }}>
                      {item.interfaceName}
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
                    children: <RequestHeaders header={item.request_head} />,
                  },
                  {
                    key: '2',
                    label: '响应头',
                    children: <RequestHeaders header={item.response_head} />,
                  },
                  {
                    key: '3',
                    label: '响应体',
                    children: renderResponseBody(item),
                  },
                  {
                    key: '4',
                    label: '变量提取',
                    children: (
                      <RespProTable
                        columns={ResponseExtractColumns}
                        dataSource={item.extracts}
                      />
                    ),
                  },
                  {
                    key: '5',
                    label: '接口断言',
                    children: (
                      <RespProTable
                        columns={AssertColumns}
                        dataSource={item.asserts}
                      />
                    ),
                  },
                  {
                    key: '6',
                    label: '实际请求',
                    children: (
                      <RequestInfo
                        method={item.request_method}
                        interfaceApiInfo={item.request_info}
                      />
                    ),
                  },
                ]}
                size={'small'}
              />
            </ProCard>
          ))}
        </>
      )}
    </>
  );
};

export default ApiResult;
