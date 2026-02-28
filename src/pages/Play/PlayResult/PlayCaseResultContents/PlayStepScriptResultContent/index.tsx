import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { IPlayCaseContentResult } from '@/pages/Play/componets/uiTypes';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PythonOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface SelfProps {
  content: IPlayCaseContentResult;
}

const Index: FC<SelfProps> = ({ content }) => {
  return (
    <ProCard
      extra={
        <Space>
          {content.extracts && (
            <Text type={'secondary'}>变量 x {content.extracts.length}</Text>
          )}
        </Space>
      }
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
          <Tooltip title={'脚本'}>
            <Tag color={'geekblue-inverse'} icon={<PythonOutlined />} />
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
      <RespProTable
        columns={ResponseExtractColumns}
        dataSource={content.extracts}
      />
    </ProCard>
  );
};

export default Index;
