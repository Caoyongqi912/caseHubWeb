import { IEnv, ISearch } from '@/api';
import { deleteEnv, pageEnv, updateEnv } from '@/api/base';
import MyProTable from '@/components/Table/MyProTable';
import AddEnv from '@/pages/Project/Env/AddEnv';
import { pageData } from '@/utils/somefunc';
import {
  EditOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { message, Space, Tooltip } from 'antd';
import { FC, useRef } from 'react';

interface IProps {
  projectId?: string;
}

const Index: FC<IProps> = ({ projectId }) => {
  const actionRef = useRef<ActionType>();

  const pageEnvs = async (value: ISearch, sort: any) => {
    const searchData: any = {
      ...value,
      project_id: projectId,
      sort: sort,
    };
    const { code, data } = await pageEnv(searchData);
    return pageData(code, data);
  };

  const isReload = (value: boolean) => {
    if (value) {
      actionRef.current?.reload();
    }
  };

  const columns: ProColumns[] = [
    {
      title: '环境名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
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
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
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
      title: '环境描述',
      dataIndex: 'desc',
      ellipsis: true,
      width: 250,
      render: (text) => {
        return (
          <Tooltip title={text}>
            <Space size={8} align="center">
              <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#595959',
                }}
              >
                {text || '暂无描述'}
              </span>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '主机地址',
      dataIndex: 'host',
      ellipsis: true,
      width: 300,
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
              <LinkOutlined style={{ color: '#52c41a' }} />
              <a
                style={{
                  color: '#1890ff',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </a>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '端口号',
      dataIndex: 'port',
      ellipsis: true,
      width: 120,
      render: (text) => {
        return (
          <Tooltip title={text}>
            <Space size={8} align="center">
              <NumberOutlined style={{ color: '#fa8c16' }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#595959',
                }}
              >
                {text || '-'}
              </span>
            </Space>
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
          <Tooltip title={text}>
            <Space size={8} align="center">
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
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      render: (text, record, _, action) => [
        <Tooltip title="编辑环境配置">
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.uid);
            }}
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
        </Tooltip>,
      ],
    },
  ];

  const onSave = async (_: string, record: IEnv) => {
    updateEnv({ ...record }).then(({ code, msg }) => {
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    });
  };

  const onDelete = async (_: string, record: IEnv) => {
    await deleteEnv({ ...record }).then(({ code, msg }) => {
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    });
  };

  return (
    <ProCard
      title="环境配置"
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
        actionRef={actionRef}
        columns={columns}
        request={pageEnvs}
        rowKey={'uid'}
        onSave={onSave}
        onDelete={onDelete}
        toolBarRender={() => [<AddEnv reload={isReload} />]}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条环境配置记录`,
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
