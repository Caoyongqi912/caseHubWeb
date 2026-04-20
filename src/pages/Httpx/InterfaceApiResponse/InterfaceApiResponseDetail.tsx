import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import AssertColumns from '@/pages/Httpx/componets/AssertColumns';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import RequestInfo from '@/pages/Httpx/InterfaceApiResponse/RequestInfo';
import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { IResponseInfo } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { ProCard } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface SelfProps {
  responses?: IResponseInfo[];
}

const InterfaceApiResponseDetail: FC<SelfProps> = ({ responses }) => {
  const { API_STATUS } = CONFIG;

  const tabExtra = (response: IResponseInfo) => {
    if (!response.response_status) return null;
    const { response_status, start_time, use_time } = response;
    const { color, text = '' } = API_STATUS[response_status!] || {
      color: '#F56C6C',
      text: '',
    };
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
          padding: '4px 8px',
          borderRadius: 4,
          maxWidth: '100%',
        }}
      >
        <InfoItem
          label="Method"
          value={response.request_method}
          color={color}
        />
        <InfoItem
          label="Status"
          value={String(response_status)}
          color={color}
          suffix={text}
        />
        <InfoItem label="Request_Time" value={start_time || '-'} />
        <InfoItem label="Latency" value={`${use_time}ms`} />
      </div>
    );
  };

  const InfoItem = ({
    label,
    value,
    color,
    suffix,
  }: {
    label: string;
    value: string;
    color?: string;
    suffix?: string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <span
        style={{
          color: '#6c757d',
          fontWeight: 500,
          fontSize: 12,
          marginRight: 4,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          color: color || '#67C23A',
          // fontWeight: 600,
          fontSize: 12,
          padding: '1px 6px',
          backgroundColor: `${color || '#67C23A'}10`,
          borderRadius: 3,
        }}
      >
        {value}
        {suffix && <span style={{ marginLeft: 4 }}>{suffix}</span>}
      </span>
    </div>
  );

  const TabTitle = (title: string) => (
    <span style={{ color: 'orange' }}>{title}</span>
  );
  const renderResponseBody = (item: IResponseInfo) => {
    const { response_text } = item;
    try {
      const jsonValue = JSON.parse(response_text);
      const value = JSON.stringify(jsonValue, null, 2);
      return <AceCodeEditor value={value} readonly={true} />;
    } catch (e) {
      return (
        <AceCodeEditor value={response_text} _mode={'html'} readonly={true} />
      );
    }
  };

  const setDesc = (text: string) => {
    return text?.length > 8 ? text?.slice(0, 8) + '...' : text;
  };

  return (
    <div>
      {responses?.map((item: IResponseInfo, index: number) => {
        return (
          <ProCard
            extra={tabExtra(item)}
            bordered
            style={{ borderRadius: '5px', marginTop: 15 }}
            headerBordered
            collapsible
            defaultCollapsed
            collapsibleIconRender={() => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <Tag color={'blue'}>API</Tag>
                <Tag color={item.result === false ? '#f50' : '#87d067'}>
                  {item.interface_name}
                </Tag>
                <Text type={'secondary'}>{setDesc(item.interface_desc)}</Text>
              </div>
            )}
          >
            <MyTabs
              type={'line'}
              defaultActiveKey={'3'}
              items={[
                {
                  key: '1',
                  label: TabTitle('请求头'),
                  children: <RequestHeaders header={item.request_headers} />,
                },
                {
                  key: '2',
                  label: TabTitle('响应头'),
                  children: <RequestHeaders header={item.response_headers} />,
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
                  children: <RequestInfo info={item} />,
                },
              ]}
              size={'small'}
            />
          </ProCard>
        );
      })}
    </div>
  );
};

export default InterfaceApiResponseDetail;
