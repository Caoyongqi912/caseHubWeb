import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  GroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  result: ICaseContentResult;
}

const GroupResult: FC<Props> = ({ result }) => {
  const { token } = useToken();

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

  return (
    <ProCard
      bordered
      style={styles.card}
      collapsibleIconRender={({}) => {
        return (
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
              <Tooltip title={'接口组'}>
                <Tag color={'blue-inverse'} icon={<GroupOutlined />} />
              </Tooltip>
              {result.result ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor={'#c20000'} />
              )}
              <Text type={'secondary'} style={{ marginLeft: 20 }}>
                {result.content_name}
              </Text>
            </Space>
          </Space>
        );
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={
        <Space>
          <Tag color={'green'}>{result.success_api_num ?? 0} 成功</Tag>
          <Tag color={'red'}>{result.fail_api_num ?? 0} 失败</Tag>
          <Tag color={'blue'}>{result.total_api_num ?? 0} 总数</Tag>
        </Space>
      }
    >
      <APIResult result={result} prefix={'GROUP_STEP'} />
    </ProCard>
  );
};

export default GroupResult;
