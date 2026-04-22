import {
  pageInterGlobalVariable,
  removeInterGlobalVariable,
  updateInterGlobalVariable,
} from '@/api/inter/interGlobal';
import { queryProjectEnum } from '@/components/CommonFunc';
import { useGlassStyles } from '@/components/Glass';
import MyProTable from '@/components/Table/MyProTable';
import VarModalForm from '@/pages/Httpx/InterfaceConfig/VarModalForm';
import { IInterfaceGlobalVariable } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Tooltip } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAccess } from 'umi';

interface IProps {
  projectId?: string;
}

const GlobalVariables: FC<IProps> = ({ projectId }) => {
  const { isAdmin } = useAccess();
  const styles = useGlassStyles();
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
      render: (text) => {
        return (
          <Space size={8} align="center">
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
      tooltip: true,
      ellipsis: true,
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
            <Tooltip title={text} placement="top">
              <div
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
      render: (text) => {
        return (
          <Space size={4} align="center">
            <UserOutlined
              style={{ color: styles.colors.primary, fontSize: '14px' }}
            />
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
                    color: styles.colors.primary,
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
                    color: styles.colors.error,
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
    <>
      <VarModalForm
        open={isModalOpen}
        setOpen={setIsModalOpen}
        callBack={() => actionRef.current?.reload()}
      />
      <MyProTable
        cardStyle={{
          borderRadius: '16px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
        }}
        headerTitle="全局变量配置"
        actionRef={actionRef}
        columns={columns}
        request={fetchInterApiVariables}
        toolBarRender={() => [
          <Button
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              borderRadius: '8px',
              background: styles.colors.gradientPrimary,
              border: 'none',
              boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
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
      />
    </>
  );
};

export default GlobalVariables;
