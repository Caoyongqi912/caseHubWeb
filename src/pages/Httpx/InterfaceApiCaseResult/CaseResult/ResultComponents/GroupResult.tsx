import APIResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult/ResultComponents/APIResult';
import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  GroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
  index: number;
}

const GroupResult: FC<Props> = ({ result, index }) => {
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
          <Tag color={'blue-inverse'} icon={<GroupOutlined />} />
          {result.content_result ? (
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#c20000'} />
          )}
          <Text type={'secondary'} style={{ marginLeft: 20 }}>
            {result.content_name}
          </Text>
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
