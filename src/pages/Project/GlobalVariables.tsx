import {
  pageInterGlobalVariable,
  removeInterGlobalVariable,
  updateInterGlobalVariable,
} from '@/api/inter/interGlobal';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import VarModalForm from '@/pages/Httpx/InterfaceConfig/VarModalForm';
import { IInterfaceGlobalVariable } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Tooltip } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAccess } from 'umi';

interface IProps {
  projectId?: string;
}

const GlobalVariables: FC<IProps> = ({ projectId }) => {
  const { isAdmin } = useAccess();
  const actionRef = useRef<ActionType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectEnum, setProjectEnum] = useState<any>([]);

  useEffect(() => {
    queryProjectEnum(setProjectEnum).then();
  }, []);

  const columns: ProColumns<IInterfaceGlobalVariable>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      copyable: true,
      width: 200,
      render: (text) => {
        return (
          <Space size={8} align="center">
            <KeyOutlined style={{ color: '#1890ff' }} />
            <Tag
              color={'blue'}
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
      title: 'Value',
      dataIndex: 'value',
      copyable: true,
      hideInSearch: true,
      ellipsis: true,
      width: 300,
      render: (text) => {
        return (
          <Tooltip title={text} placement="top">
            <div
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#595959',
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
      ellipsis: true,
      width: 300,
      render: (text) => {
        return (
          <Space size={4} align="center">
            <InfoCircleOutlined
              style={{ color: '#8c8c8c', fontSize: '14px' }}
            />
            <Tooltip title={text} placement="top">
              <div
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#595959',
                }}
              >
                {text || '暂无描述'}
              </div>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '创建人',
      editable: false,
      dataIndex: 'creatorName',
      width: 150,
      render: (text) => {
        return (
          <Space size={4} align="center">
            <UserOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
            <Tag
              color={'blue'}
              style={{
                borderRadius: '4px',
                fontSize: '12px',
                padding: '2px 6px',
              }}
            >
              {text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 120,
      render: (__, record, _, action) => {
        return (
          isAdmin && (
            <Space size={12}>
              <Tooltip title="编辑">
                <a
                  onClick={async () => {
                    action?.startEditable?.(record.uid);
                  }}
                  style={{
                    color: '#1890ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <EditOutlined style={{ marginRight: 4 }} />
                  编辑
                </a>
              </Tooltip>
              <Tooltip title="删除">
                <a
                  onClick={async () => {
                    await removeInterGlobalVariable(record.uid).then(
                      ({ code, msg }) => {
                        if (code === 0) {
                          message.success(msg);
                          actionRef.current?.reload();
                        }
                      },
                    );
                  }}
                  style={{
                    color: '#ff4d4f',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  删除
                </a>
              </Tooltip>
            </Space>
          )
        );
      },
    },
  ];

  const fetchInterApiVariables = useCallback(async (values: any, sort: any) => {
    const { code, data } = await pageInterGlobalVariable({
      ...values,
      sort: sort,
      project_id: projectId,
    });
    return pageData(code, data);
  }, []);

  const setInterApiVariables = async (
    _: any,
    values: IInterfaceGlobalVariable,
  ) => {
    const { code, msg } = await updateInterGlobalVariable(values);
    if (code === 0) {
      actionRef.current?.reload();
      message.success(msg);
    }
  };

  return (
    <ProCard
      title="全局变量配置"
      headerBordered={true}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
      }}
      bodyStyle={{
        padding: '24px',
      }}
    >
      <VarModalForm
        open={isModalOpen}
        setOpen={setIsModalOpen}
        callBack={() => actionRef.current?.reload()}
      />
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={fetchInterApiVariables}
        x={1000}
        toolBarRender={() => [
          <Button
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
            }}
          >
            添加变量
          </Button>,
        ]}
        rowKey={'uid'}
        onSave={setInterApiVariables}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        tableStyle={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </ProCard>
  );
};

export default GlobalVariables;
