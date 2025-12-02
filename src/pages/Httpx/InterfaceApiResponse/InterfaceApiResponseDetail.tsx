import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import AssertColumns from '@/pages/Httpx/componets/AssertColumns';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import RequestInfo from '@/pages/Httpx/InterfaceApiResponse/RequestInfo';
import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { IInterfaceResultByCase } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  responses?: any[];
}

const InterfaceApiResponseDetail: FC<SelfProps> = ({ responses }) => {
  const { API_STATUS } = CONFIG;
  const [activeKeys, setActiveKeys] = useState(
    Array(responses?.length).fill('3'),
  );

  const tabExtra = (response: IInterfaceResultByCase) => {
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

  const TabTitle = (title: string) => (
    <span style={{ color: 'orange' }}>{title}</span>
  );
  const renderResponseBody = (item: IInterfaceResultByCase) => {
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

  const setDesc = (text: string) => {
    return text?.length > 8 ? text?.slice(0, 8) + '...' : text;
  };

  return (
    <div>
      {responses?.map((item: any, index: number) => {
        if (item.is_group) {
          return (
            <ProCard
              key={index}
              bodyStyle={{ padding: 10 }}
              extra={tabExtra(item)}
              bordered
              style={{ borderRadius: '5px', marginTop: 5 }}
              title={
                <>
                  <Tag color={'blue'}>组</Tag>
                  <Tag color={'green'}>{`API (${item.groupAPINums})`}</Tag>
                  <Tag color={item.result === false ? '#f50' : '#87d068'}>
                    {item.groupName}
                  </Tag>
                </>
              }
              headerBordered
              collapsible
              defaultCollapsed
            >
              <InterfaceApiResponseDetail responses={item.data} />
            </ProCard>
          );
        } else if (item.is_condition) {
          return (
            <ProCard
              key={index}
              bodyStyle={{ padding: 10 }}
              extra={tabExtra(item)}
              bordered
              style={{ borderRadius: '5px', marginTop: 5 }}
              title={
                <>
                  <Tag color={'blue'}>IF</Tag>
                  <Tag color={'green'}>{`API (${item.conditionAPINums})`}</Tag>
                  <Tag color={item.result === false ? '#f50' : '#87d068'}>
                    {item.conditionName}
                  </Tag>
                </>
              }
              headerBordered
              collapsible
              defaultCollapsed
            >
              <InterfaceApiResponseDetail responses={item.data} />
            </ProCard>
          );
        } else {
          return (
            <ProCard
              extra={tabExtra(item)}
              bordered
              style={{ borderRadius: '5px', marginTop: 5 }}
              title={
                <>
                  <Tag color={'blue'}>API</Tag>
                  <Tag
                    color={
                      item.result?.toLowerCase() === 'error'
                        ? '#f50'
                        : '#87d068'
                    }
                  >
                    {item.interfaceName}
                  </Tag>
                  <Text type={'secondary'}>{setDesc(item.interfaceDesc)}</Text>
                </>
              }
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
                    label: TabTitle('请求头'),
                    children: <RequestHeaders header={item.request_head} />,
                  },
                  {
                    key: '2',
                    label: TabTitle('响应头'),
                    children: <RequestHeaders header={item.response_head} />,
                  },
                  {
                    key: '3',
                    label: TabTitle('响应体'),
                    children: renderResponseBody(item),
                  },
                  {
                    key: '4',
                    label: TabTitle('变量提取'),
                    children: (
                      <RespProTable
                        columns={ResponseExtractColumns}
                        dataSource={item.extracts}
                      />
                    ),
                  },
                  {
                    key: '5',
                    label: TabTitle('接口断言'),
                    children: (
                      <RespProTable
                        columns={AssertColumns}
                        dataSource={item.asserts}
                      />
                    ),
                  },
                  {
                    key: '6',
                    label: TabTitle('实际请求'),
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
          );
        }
      })}
    </div>
  );
};

export default InterfaceApiResponseDetail;
