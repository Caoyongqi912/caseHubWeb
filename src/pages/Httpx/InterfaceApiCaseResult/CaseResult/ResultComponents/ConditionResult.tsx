import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
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
      style={{
        borderRadius: '5px',
        borderLeft: `3px solid ${
          result.content_result ? '#52c41a' : '#ff4d4f'
        }`,
        marginTop: 5,
      }}
      collapsibleIconRender={({}) => {
        return (
          <Space>
            <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
            <Tooltip title={'条件组'}>
              <Tag color={'purple-inverse'}>IF</Tag>
            </Tooltip>
            {result.content_result ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor={'#fca760'} />
            )}
            {content_condition && (
              <Space style={{ marginLeft: 20 }}>
                <Text strong> {content_condition.key}</Text>
                <Text
                  style={{
                    color: result.content_condition?.condition_result
                      ? '#52c41a'
                      : '#FCA760FF',
                  }}
                >
                  {OperatorOption[content_condition.operator]}
                </Text>
                <Text strong> {content_condition.value}</Text>
              </Space>
            )}
          </Space>
        );
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={<Text type="secondary">共 {result?.data?.length || 0} 接口</Text>}
    >
      <APIResult result={result} prefix={'IF_STEP'} />
    </ProCard>
  );
};

export default ConditionResult;
