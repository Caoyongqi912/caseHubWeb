import { IPlayCaseContentResult } from '@/pages/Play/componets/uiTypes';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PlayCircleTwoTone,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Image, Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface SelfProps {
  content: IPlayCaseContentResult;
}

const Index: FC<SelfProps> = ({ content }) => {
  return (
    <ProCard
      bordered
      style={{
        borderRadius: '5px',
        borderLeft: `3px solid ${
          content.content_result ? '#52c41a' : '#ff4d4f'
        }`,

        marginTop: 5,
      }}
      headerBordered
      collapsible
      defaultCollapsed
      title={
        <Space>
          <Tag color={'green-inverse'}>STEP_{content.content_step}</Tag>
          <Tooltip title={'UI 步骤'}>
            <Tag color={'geekblue-inverse'} icon={<PlayCircleTwoTone />} />
          </Tooltip>
          {content.content_result ? (
            <CheckCircleTwoTone twoToneColor={'#52c41a'} />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#ff4d4f'} />
          )}
          <Tooltip title={content.content_desc || null}>
            <Text type={'secondary'} style={{ marginLeft: 20 }}>
              {content.content_name}
            </Text>
          </Tooltip>
        </Space>
      }
      collapsibleIconRender={({}) => {
        return true;
      }}
    >
      <Space direction={'vertical'} style={{ width: '100%' }}>
        <Typography>
          <pre style={{ width: '100%' }}>{content.content_message}</pre>
        </Typography>
        {!content.content_result && (
          <Image
            width={200}
            src={content?.content_screenshot_path || undefined}
          />
        )}
      </Space>
    </ProCard>
  );
};

export default Index;
