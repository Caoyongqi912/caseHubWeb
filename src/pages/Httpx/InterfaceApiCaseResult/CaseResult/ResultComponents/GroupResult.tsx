import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  GroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Tag, theme, Tooltip, Typography } from 'antd';
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
    }),
    [token, result.result],
  );

  return (
    <ProCard
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
          <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
          <Tooltip title={'接口组'}>
            <Tag color={'blue-inverse'} icon={<GroupOutlined />} />
          </Tooltip>
          {result.result ? (
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#c20000'} />
          )}
          <Text type={'secondary'}>{result.content_name}</Text>
        </div>
      )}
      headerBordered
      collapsible
      defaultCollapsed
      extra={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Tag color={'green'}>{result.success_api_num ?? 0} 成功</Tag>
          <Tag color={'red'}>{result.fail_api_num ?? 0} 失败</Tag>
          <Tag color={'blue'}>{result.total_api_num ?? 0} 总数</Tag>
        </div>
      }
    >
      <APIResult result={result} prefix={'GROUP_STEP'} />
    </ProCard>
  );
};

export default GroupResult;
