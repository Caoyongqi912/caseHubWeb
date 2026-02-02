import { pageDBConfig, removeDBConfig } from '@/api/base/dbConfig';
import MyProTable from '@/components/Table/MyProTable';
import DBModel from '@/pages/Project/Db/DBModel';
import { pageData } from '@/utils/somefunc';
import { useAccess } from '@@/exports';
import {
  DatabaseFilled,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Divider, message, Space, Tag, Tooltip } from 'antd';
import { FC, useRef, useState } from 'react';

interface IProps {
  projectId?: string;
}

const Index: FC<IProps> = ({ projectId }) => {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAccess();
  const [currentDBConfig, setCurrentDBConfig] = useState<string>();

  const queryDbs = async (params: any, sort: any) => {
    const values = {
      ...params,
      project_id: projectId,
    };
    const { code, data } = await pageDBConfig({ ...values, sort: sort });
    return pageData(code, data);
  };

  const isReload = async () => {
    await actionRef.current?.reload();
    setOpen(false);
    setCurrentDBConfig(undefined);
  };

  const handleEdit = (record: any) => {
    setCurrentDBConfig(record.uid);
    setOpen(true);
  };

  const handleDelete = async (record: any) => {
    try {
      const { code, msg } = await removeDBConfig({ uid: record.uid });
      if (code === 0) {
        message.success(msg || '删除成功');
        await actionRef.current?.reload();
      } else {
        message.error(msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns[] = [
    {
      title: '数据库类型',
      dataIndex: 'db_type',
      valueType: 'select',
      valueEnum: {
        1: { text: 'mysql', value: 1 },
        2: { text: 'oracle', value: 2 },
        3: { text: 'redis', value: 3 },
      },
      width: 120,
      render: (text) => {
        let color = 'blue';
        if (text === 'mysql') color = 'green';
        if (text === 'oracle') color = 'orange';
        if (text === 'redis') color = 'red';

        return (
          <Space size={8} align="center">
            <DatabaseFilled style={{ color }} />
            <Tag
              color={color}
              style={{
                borderRadius: '4px',
                fontSize: '13px',
                padding: '2px 8px',
              }}
            >
              {text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '配置名称',
      dataIndex: 'db_name',
      ellipsis: true,
      width: 200,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text) => {
        return (
          <Tooltip title={text}>
            <Space size={8} align="center">
              <DatabaseOutlined style={{ color: '#1890ff' }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#262626',
                }}
              >
                {text}
              </span>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '数据库名称',
      dataIndex: 'db_database',
      ellipsis: true,
      width: 200,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      render: (text) => {
        return (
          <Tooltip title={text}>
            <a
              style={{
                color: '#1890ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <DatabaseOutlined />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      ellipsis: true,
      width: 150,
      editable: false,
      search: false,
      render: (text) => {
        return (
          <Space size={6} align="center">
            <UserOutlined style={{ color: '#8c8c8c' }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#595959',
              }}
            >
              {text}
            </span>
          </Space>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (text, record, _, action) => {
        if (isAdmin) {
          return (
            <Space size={12}>
              <Tooltip title="编辑数据库配置">
                <a
                  key="editable"
                  onClick={() => handleEdit(record)}
                  style={{
                    color: '#1890ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <EditOutlined />
                  编辑
                </a>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="删除数据库配置">
                <a
                  onClick={() => handleDelete(record)}
                  style={{
                    color: '#ff4d4f',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <DeleteOutlined />
                  删除
                </a>
              </Tooltip>
            </Space>
          );
        }
      },
    },
  ];

  return (
    <ProCard
      title="数据库配置"
      headerBordered={true}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
      }}
      bodyStyle={{
        padding: '24px',
      }}
    >
      <MyProTable
        toolBarRender={() => [
          <DBModel
            currentProjectId={projectId!}
            callBack={isReload}
            currentDBConfigId={currentDBConfig}
            open={open}
            setOpen={setOpen}
          />,
        ]}
        actionRef={actionRef}
        columns={columns}
        request={queryDbs}
        rowKey={'uid'}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条数据库配置记录`,
        }}
        tableStyle={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </ProCard>
  );
};

export default Index;
