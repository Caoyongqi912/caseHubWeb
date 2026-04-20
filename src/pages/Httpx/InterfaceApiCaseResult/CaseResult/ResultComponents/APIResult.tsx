import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import AssertColumns from '@/pages/Httpx/componets/AssertColumns';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import RequestInfo from '@/pages/Httpx/InterfaceApiResponse/RequestInfo';
import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult, IResponseInfo } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import {
  ApiOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  prefix: string;
  result: ICaseContentResult;
}

const ApiResult: FC<Props> = ({ result, prefix }) => {
  const { token } = useToken();
  const { API_STATUS } = CONFIG;

  const styles = useMemo(
    () => ({
      card: {
        borderRadius: token.borderRadiusSM,
        borderLeft: `3px solid ${
          result.result ? token.colorSuccess : token.colorError
        }`,
        marginTop: token.marginXS,
      },
    }),
    [token, result.result],
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

  const InfoItem = ({
    label,
    value,
    color,
    suffix,
    noBg,
  }: {
    label: string;
    value: string;
    color?: string;
    suffix?: string;
    noBg?: boolean;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <span
        style={{
          color: token.colorTextSecondary,
          fontWeight: 500,
          fontSize: 12,
          marginRight: 4,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          color: color || token.colorSuccess,
          fontWeight: 600,
          fontSize: 12,
          padding: noBg ? 0 : '1px 6px',
          backgroundColor: noBg ? 'none' : `${color || token.colorSuccess}15`,
          borderRadius: 3,
        }}
      >
        {value}
        {suffix && <span style={{ marginLeft: 4 }}>{suffix}</span>}
      </span>
    </div>
  );

  const tabExtra = (response: IResponseInfo) => {
    if (!response.response_status) return null;
    const { response_status, use_time, start_time } = response;
    const { color, text = '' } = API_STATUS[response_status!] || {
      color: token.colorError,
      text: '',
    };
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
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
        <InfoItem label="Request_Time" value={start_time || '-'} noBg />
        <InfoItem label="Latency" value={`${use_time}ms`} noBg />
      </div>
    );
  };

  const stepTag = (index: number) => {
    return (
      <Tag color={'green-inverse'}>
        {prefix}_{prefix === 'STEP' ? result.content_step : index + 1}
      </Tag>
    );
  };

  return (
    <>
      {result.data && result.data.length > 0 && (
        <>
          {result.data.map((item: IResponseInfo, index: number) => (
            <ProCard
              extra={tabExtra(item)}
              bordered
              style={styles.card}
              collapsibleIconRender={() => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {stepTag(index)}
                  <Tooltip title={'接口'}>
                    <Tag color={'gold-inverse'} icon={<ApiOutlined />} />
                  </Tooltip>
                  {item.result ? (
                    <CheckCircleTwoTone twoToneColor={token.colorSuccess} />
                  ) : (
                    <CloseCircleTwoTone twoToneColor={token.colorError} />
                  )}
                  <Text type={'secondary'}>{item.interface_name}</Text>
                </div>
              )}
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
                    children: <RequestHeaders header={item.request_headers} />,
                  },
                  {
                    key: '2',
                    label: '响应头',
                    children: <RequestHeaders header={item.response_headers} />,
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
                    children: <RequestInfo info={item} />,
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
