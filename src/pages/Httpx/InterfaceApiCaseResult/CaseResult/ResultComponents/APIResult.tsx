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
import { Space, Tag, theme, Tooltip, Typography } from 'antd';
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
      cardExtra: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        rowGap: token.paddingXS,
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        backgroundColor: token.colorBgLayout,
        borderRadius: token.borderRadiusSM,
      },
      tagGroup: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap' as const,
        gap: token.paddingSM,
        fontSize: token.fontSize,
      },
      tagLabel: {
        color: token.colorTextSecondary,
        fontWeight: 500,
        marginRight: token.marginXS,
      },
      tagValue: (color: string) => ({
        color: color,
        fontWeight: 600,
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        backgroundColor: `${color}15`,
        borderRadius: token.borderRadiusSM,
      }),
      successColor: token.colorSuccess,
      errorColor: token.colorError,
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

  const tabExtra = (response: IResponseInfo) => {
    if (!response.response_status) return null;
    const { response_status, use_time, start_time } = response;
    const { color, text = '' } = API_STATUS[response_status!] || {
      color: token.colorError,
      text: '',
    };
    return (
      <Space size={token.paddingSM} style={styles.cardExtra}>
        <div style={styles.tagGroup}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={styles.tagLabel}>Method:</span>
            <span style={styles.tagValue(color)}>
              {response.request_method}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={styles.tagLabel}>Status:</span>
            <span style={styles.tagValue(color)}>
              {response_status}
              {text && (
                <span style={{ marginLeft: token.marginXS }}>{text}</span>
              )}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: token.paddingSM,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={styles.tagLabel}>Request_Time:</span>
              <span
                style={{
                  ...styles.tagValue(styles.successColor),
                  background: 'none',
                  padding: 0,
                }}
              >
                {start_time}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={styles.tagLabel}>Latency:</span>
              <span
                style={{
                  ...styles.tagValue(styles.successColor),
                  background: 'none',
                  padding: 0,
                }}
              >
                {use_time}ms
              </span>
            </div>
          </div>
        </div>
      </Space>
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
              collapsibleIconRender={({}) => {
                return (
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space>
                      {stepTag(index)}
                      <Tooltip title={'接口'}>
                        <Tag color={'gold-inverse'} icon={<ApiOutlined />}>
                          API
                        </Tag>
                      </Tooltip>
                      {item.result ? (
                        <CheckCircleTwoTone twoToneColor={token.colorSuccess} />
                      ) : (
                        <CloseCircleTwoTone twoToneColor={token.colorError} />
                      )}
                      <Text
                        type={'secondary'}
                        style={{ marginLeft: token.marginLG }}
                      >
                        {item.interface_name}
                      </Text>
                    </Space>
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
