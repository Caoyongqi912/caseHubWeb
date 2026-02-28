import { IPlayCaseContentResultResponse } from '@/pages/Play/componets/uiTypes';
import PlayStepResultContent from '@/pages/Play/PlayResult/PlayCaseResultContents/PlayStepResultContent';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  GroupOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface SelfProps {
  content: IPlayCaseContentResultResponse;
}

const Index: FC<SelfProps> = ({ content }) => {
  return (
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
          <Tag color={'green-inverse'}>STEP_{content.result.content_step}</Tag>
          <Tooltip title={'UI 步骤组'}>
            <Tag color={'geekblue-inverse'} icon={<GroupOutlined />} />
          </Tooltip>
          {content.result.content_result ? (
            <CheckCircleTwoTone twoToneColor={'#52c41a'} />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#ff4d4f'} />
          )}
          <Tooltip title={content.result.content_message || null}>
            <Text type={'secondary'} style={{ marginLeft: 20 }}>
              {content.result.content_name}
            </Text>
          </Tooltip>
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
  );
};

export default Index;
