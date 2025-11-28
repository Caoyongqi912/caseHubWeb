import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
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
          {result.content_result ? (
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#c20000'} />
          )}
          {content_condition && (
            <div style={{ marginLeft: 20 }}>
              <Text type={'warning'}> {content_condition.key}</Text>
              <Text strong> {OperatorOption[content_condition.operator]}</Text>
              <Text type={'warning'}> {content_condition.value}</Text>
            </div>
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
