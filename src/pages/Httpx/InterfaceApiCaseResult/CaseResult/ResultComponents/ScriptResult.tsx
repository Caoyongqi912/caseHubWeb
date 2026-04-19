import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PythonOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';

const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}

const ScriptResult: FC<Props> = ({ result }) => {
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
            <Tooltip title={'脚本'}>
              <Tag color={'geekblue-inverse'} icon={<PythonOutlined />} />
            </Tooltip>
            {result.result ? (
              <CheckCircleTwoTone twoToneColor={'#52c41a'} />
            ) : (
              <CloseCircleTwoTone twoToneColor={'#ff4d4f'} />
            )}
            <Text type={'secondary'} style={{ marginLeft: 20 }}>
              {result.content_name}
            </Text>
          </Space>
        );
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={
        result.script_vars?.length && (
          <Text type={'secondary'} style={{ marginLeft: 20 }}>
            {result.script_vars?.length} 个脚本变量
          </Text>
        )
      }
    >
      <RespProTable
        columns={ResponseExtractColumns}
        dataSource={result.script_vars || []}
      />
    </ProCard>
  );
};

export default ScriptResult;
