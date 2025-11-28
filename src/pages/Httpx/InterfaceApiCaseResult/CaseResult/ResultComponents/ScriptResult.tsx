import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}
const ScriptResult: FC<Props> = ({ result }) => {
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
          <Tag color={'geekblue-inverse'}>SCRIPT</Tag>
          <Text type={'secondary'}>{result.content_name}</Text>
        </Space>
      }
      headerBordered
      collapsible
      defaultCollapsed
    >
      <RespProTable
        columns={ResponseExtractColumns}
        dataSource={result.script_extracts}
      />
    </ProCard>
  );
};

export default ScriptResult;
