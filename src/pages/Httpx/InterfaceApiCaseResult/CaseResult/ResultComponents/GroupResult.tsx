import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
  index: number;
}

const GroupResult: FC<Props> = ({ result, index }) => {
  const setDesc = (text?: string) => {
    return text && text?.length > 8 ? text?.slice(0, 8) + '...' : text;
  };

  return (
    <ProCard
      bordered
      style={{ borderRadius: '5px', marginTop: 5 }}
      collapsibleIconRender={({}) => {
        return null;
      }}
      title={
        <Space>
          <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
          <Tag color={'blue-inverse'}>GROUP</Tag>
          <Tag color={!result.content_result ? '#f50' : '#87d068'}>
            {result.content_name}
          </Tag>
          <Text type={'secondary'}>{setDesc(result.content_desc)}</Text>
        </Space>
      }
      headerBordered
      collapsible
      defaultCollapsed
    >
      <APIResult result={result} prefix={'GROUP_STEP'} />
    </ProCard>
  );
};

export default GroupResult;
