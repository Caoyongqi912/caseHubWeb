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

const LoopResult: FC<Props> = ({ result }) => {
  return (
    <ProCard
      bordered
      style={{
        borderRadius: '5px',
        borderLeft: `3px solid ${result.result ? '#52c41a' : '#ff4d4f'}`,
        marginTop: 5,
      }}
      collapsibleIconRender={({}) => {
        return (
          <Space>
            <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
            <Tooltip title={'条件组'}>
              <Tag color={'purple-inverse'}>LOOP</Tag>
            </Tooltip>
            {result.result ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor={'#fca760'} />
            )}
          </Space>
        );
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={<Text type="secondary">共 {result?.data?.length || 0} 接口</Text>}
    >
      <APIResult result={result} prefix={'LOOP_STEP'} />
    </ProCard>
  );
};

export default LoopResult;
