import { ICaseContentResult } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}

const AssertResult: FC<Props> = ({ result }) => {
  const { content_asserts } = result;
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
          <Tag color={'red-inverse'}>Assert</Tag>
          <Text type={'secondary'}>{result.content_name}</Text>
          {content_asserts && (
            <>
              <Text type={'warning'}> {content_asserts.expect}</Text>
              <Text type={'warning'}> {content_asserts.actual}</Text>
            </>
          )}
        </Space>
      }
      headerBordered
      collapsible
      defaultCollapsed
    ></ProCard>
  );
};

export default AssertResult;
