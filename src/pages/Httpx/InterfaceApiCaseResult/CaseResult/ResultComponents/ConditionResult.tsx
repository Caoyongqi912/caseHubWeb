import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}
const OperatorOption: { [key: number]: string } = {
  0: '等于',
  1: '不等于',
  2: '大于',
  3: '小于',
  4: '大于等于',
  5: '小于等于',
  6: '包含',
  7: '不包含',
};

const ConditionResult: FC<Props> = ({ result }) => {
  const { content_condition } = result;

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
          <Tag color={'purple-inverse'}>IF</Tag>
          {content_condition && (
            <>
              <Text type={'warning'}> {content_condition.key}</Text>
              <Text strong> {OperatorOption[content_condition.operator]}</Text>
              <Text type={'warning'}> {content_condition.value}</Text>
            </>
          )}
        </Space>
      }
      headerBordered
      collapsible
      defaultCollapsed
    >
      <APIResult result={result} prefix={'IF_STEP'} />
    </ProCard>
  );
};

export default ConditionResult;
