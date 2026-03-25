import { IPlayCaseContentResultResponse } from '@/pages/Play/componets/uiTypes';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';
import PlayStepResultContent from '../PlayStepResultContent';
const { Text } = Typography;

interface SelfProps {
  content: IPlayCaseContentResultResponse;
}

const Index: FC<SelfProps> = ({ content }) => {
  return (
    <div>
      <ProCard
        bordered
        style={{
          borderRadius: '5px',
          borderLeft: `3px solid ${
            content.result.content_result ? '#52c41a' : '#ff4d4f'
          }`,

          marginTop: 5,
        }}
        headerBordered
        collapsible
        defaultCollapsed
        title={
          <Space>
            <Tag color={'green-inverse'}>
              STEP_{content.result.content_step}
            </Tag>
            <Tooltip title={'条件组'}>
              <Tag color={'purple-inverse'}>IF</Tag>
            </Tooltip>
            <CheckCircleTwoTone twoToneColor="#52c41a" />

            <Tooltip title={content.result.content_message || null}>
              <Text style={{ width: '100%' }}>
                {content.result.content_message}
              </Text>
            </Tooltip>
            <Typography></Typography>
          </Space>
        }
        collapsibleIconRender={({}) => {
          return true;
        }}
        extra={
          <Text type={'secondary'}>步骤 x {content.children?.length || 0}</Text>
        }
      >
        {content.children?.map((item) => {
          return <PlayStepResultContent content={item} key={item.content_id} />;
        })}
      </ProCard>
    </div>
  );
};

export default Index;
