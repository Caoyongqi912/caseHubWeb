import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import RespProTable from '@/pages/Httpx/InterfaceApiResponse/RespProTable';
import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, ConsoleSqlOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { Space, Tag, Tooltip, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
}

const BdResult: FC<Props> = ({ result }) => {
  const { script_extracts } = result;

  const columns: ProColumns[] = [
    {
      title: '变量名',
      copyable: true,
      dataIndex: 'key',
      render: (text) => {
        return <Tag color={'green'}>{text}</Tag>;
      },
    },
    {
      title: '提取值',
      dataIndex: 'value',
      valueType: 'text',
      copyable: true,
      width: '60%',
      render: (_text, record) => {
        const { value } = record;
        // 判断值的类型
        if (typeof value === 'object' && value !== null) {
          // 如果是对象类型，使用 AceCodeEditor 展示 JSON
          return (
            <AceCodeEditor
              value={JSON.stringify(value, null, 2)}
              readonly={true}
              height="80px"
            />
          );
        }
        // 其他情况默认返回空
        return <span>{value}</span>;
      },
    },
  ];

  return (
    <ProCard
      extra={
        script_extracts && (
          // @ts-ignore
          <Text type="secondary">共 {script_extracts.length} 个变量</Text>
        )
      }
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
            <Tooltip title={'SQL'}>
              <Tag color={'geekblue-inverse'} icon={<ConsoleSqlOutlined />} />
            </Tooltip>
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <Text type={'secondary'} style={{ marginLeft: 20 }}>
              {result.content_name}
            </Text>
          </Space>
        );
      }}
      headerBordered
      collapsible
      defaultCollapsed
    >
      <RespProTable columns={columns} dataSource={result.script_extracts} />
    </ProCard>
  );
};

export default BdResult;
