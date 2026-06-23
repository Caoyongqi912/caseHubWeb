import ResponseExtractColumns from '@/pages/Httpx/InterfaceApiResponse/ResponseExtract';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult } from '@/pages/Httpx/types';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PythonOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  result: ICaseContentResult;
}

const ScriptResult: FC<Props> = ({ result }) => {
  const { token } = useToken();

  const styles = useMemo(
    () => ({
      card: {
        borderRadius: token.borderRadiusSM,
        borderLeft: `3px solid ${
          result.result ? token.colorSuccess : token.colorError
        }`,
        marginTop: token.marginXS,
      },
    }),
    [token, result.result],
  );
  return (
    <ProCard
      variant={'outlined'}
      style={styles.card}
      title={
        <Space>
          <Tag color="green" variant="solid">
            STEP_{result.content_step}
          </Tag>
          <Tooltip title={'脚本'}>
            <Tag color="geekblue" variant="solid" icon={<PythonOutlined />} />
          </Tooltip>
          {result.result ? (
            <CheckCircleTwoTone twoToneColor={'#52c41a'} />
          ) : (
            <CloseCircleTwoTone twoToneColor={'#ff4d4f'} />
          )}
          <Text type={'secondary'}>{result.content_name}</Text>
        </Space>
      }
      collapsibleIconRender={({}) => {
        return null;
      }}
      headerBordered
      collapsible
      defaultCollapsed
      extra={
        result.script_vars?.length && (
          <Text type={'secondary'}>
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
