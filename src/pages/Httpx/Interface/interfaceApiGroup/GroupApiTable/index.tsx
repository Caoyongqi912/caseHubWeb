import { IModuleEnum } from '@/api';
import {
  insertInterfaceGroup,
  pageInterfaceGroup,
  removeInterfaceGroup,
  updateInterfaceGroup,
} from '@/api/inter/interGroup';
import MyDrawer from '@/components/MyDrawer';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import GroupApiDetail from '@/pages/Httpx/Interface/interfaceApiGroup/GroupApiDetail';
import GroupBaseInfo from '@/pages/Httpx/Interface/interfaceApiGroup/GroupBaseInfo';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  DeleteOutlined,
  DeliveredProcedureOutlined,
  FolderOutlined,
  LinkOutlined,
  MoreOutlined,
  NumberOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProForm,
  ProFormSelect,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import {
  Button,
  Dropdown,
  Form,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag,
  theme,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [currentGroupId, setCurrentGroupId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [moveForm] = Form.useForm();
  const [groupForm] = Form.useForm<IInterfaceGroup>();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [openGroupAssociation, setOpenGroupAssociation] =
    useState<boolean>(false);

  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
    groupForm.setFieldsValue({
      project_id: currentProjectId,
      module_id: currentModuleId,
    });
  }, [currentModuleId, currentProjectId]);

  const saveBaseInfo = async (values: IInterfaceGroup) => {
    if (currentGroupId) {
      const { code, msg } = await updateInterfaceGroup({
        ...values,
        id: currentGroupId,
      });
      if (code === 0) {
        actionRef.current?.reload();
        message.success(msg);
      }
    } else {
      const { code, msg } = await insertInterfaceGroup(values);
      if (code === 0) {
        actionRef.current?.reload();
        message.success(msg);
      }
    }
    return true;
  };

  const fetchInterfaceGroup = useCallback(
    async (params: any) => {
      try {
        const { code, data } = await pageInterfaceGroup({
          ...params,
          module_id: currentModuleId,
          module_type: ModuleEnum.API,
        });
        return pageData(code, data);
      } catch (error) {
        return { success: false, data: [] };
      }
    },
    [currentModuleId],
  );

  const styles = useMemo(
    () => ({
      actionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
      primaryBtn: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
      },
      warningBtn: {
        color: token.colorWarning,
        backgroundColor: token.colorWarningBg,
      },
      idTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        color: token.colorPrimary,
        border: `1px solid ${token.colorPrimaryBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        letterSpacing: '0.5px',
      },
      nameTag: {
        fontSize: 13,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        border: 'none',
      },
      creatorTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 12,
        backgroundColor: token.colorWarningBg,
        color: token.colorWarningText,
        border: `1px solid ${token.colorWarningBorder}`,
      },
      addBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger' | 'warning';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    const styleMap = {
      primary: styles.primaryBtn,
      danger: styles.dangerBtn,
      warning: styles.warningBtn,
    };

    return (
      <a
        onClick={onClick}
        style={{
          ...styles.actionBtn,
          ...styleMap[type],
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {icon}
        {label}
      </a>
    );
  };

  const columns: ProColumns<IInterfaceGroup>[] = [
    {
      title: 'ID',
      dataIndex: 'uid',
      key: 'uid',
      copyable: true,
      width: 120,
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <MyModal
          form={groupForm}
          title={record.name}
          onFinish={saveBaseInfo}
          trigger={
            <Tag
              style={styles.nameTag}
              onClick={() => {
                groupForm.setFieldsValue(record);
                setCurrentGroupId(record.id);
              }}
            >
              <FolderOutlined style={{ marginRight: 6, opacity: 0.6 }} />
              {record.name}
            </Tag>
          }
        >
          <GroupBaseInfo />
        </MyModal>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: '接口数',
      dataIndex: 'api_num',
      key: 'api_num',
      width: 100,
      render: (_, record) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
            backgroundColor: token.colorInfoBg,
            color: token.colorInfo,
            border: `1px solid ${token.colorInfoBorder}`,
          }}
        >
          {record.api_num || 0}
        </Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      valueType: 'select',
      width: 120,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => (
        <Tag style={styles.creatorTag}>
          <UserOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.creatorName}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<LinkOutlined />}
            label="关联详情"
            type="warning"
            onClick={() => {
              setCurrentGroupId(record.id);
              setOpenGroupAssociation(true);
            }}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: '3',
                  label: '移动至',
                  icon: <DeliveredProcedureOutlined />,
                  onClick: () => {
                    setCurrentGroupId(record.id);
                    setOpenModal(true);
                  },
                },
                {
                  type: 'divider',
                },
                {
                  key: '2',
                  icon: <DeleteOutlined />,
                  danger: true,
                  label: (
                    <Popconfirm
                      title="确认删除？"
                      description="删除后数据将无法恢复"
                      okText="确认删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        const { code, msg } = await removeInterfaceGroup(
                          record.id,
                        );
                        if (code === 0) {
                          message.success(msg || '删除成功');
                          actionRef.current?.reload();
                        }
                      }}
                    >
                      <a style={{ color: token.colorError }}>删除</a>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <MoreOutlined />
              </Space>
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <MyDrawer
        open={openGroupAssociation}
        setOpen={setOpenGroupAssociation}
        width="80%"
      >
        <GroupApiDetail groupId={currentGroupId} projectId={currentProjectId} />
      </MyDrawer>

      <Modal
        open={openModal}
        onOk={async () => {
          const values = await moveForm.validateFields();
          const { code, msg } = await updateInterfaceGroup({
            id: currentGroupId,
            ...values,
          });
          if (code === 0) {
            message.success(msg);
            actionRef.current?.reload();
            moveForm.resetFields();
            setOpenModal(false);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={<span style={{ fontWeight: 600 }}>移动接口组</span>}
      >
        <ProForm submitter={false} form={moveForm}>
          <ProFormSelect
            width="md"
            options={projects}
            label="项目"
            name="project_id"
            required
            onChange={(value) => {
              setCopyProjectId(value as number);
            }}
          />
          <ProFormTreeSelect
            required
            name="module_id"
            label="模块"
            rules={[{ required: true, message: '所属模块必选' }]}
            fieldProps={{
              treeData: moduleEnum,
              fieldNames: {
                label: 'title',
              },
              filterTreeNode: true,
            }}
            width="md"
          />
        </ProForm>
      </Modal>
      <MyProTable
        persistenceKey={perKey}
        columns={columns}
        rowKey="id"
        x={1200}
        actionRef={actionRef}
        request={fetchInterfaceGroup}
        toolBarRender={() => [
          <MyModal
            key="add"
            form={groupForm}
            onFinish={saveBaseInfo}
            trigger={
              <Button
                hidden={currentModuleId === undefined}
                type="primary"
                style={styles.addBtn}
                icon={<PlusOutlined />}
                onClick={() => setCurrentGroupId(undefined)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
                }}
              >
                添加
              </Button>
            }
          >
            <GroupBaseInfo />
          </MyModal>,
        ]}
      />
    </>
  );
};

export default Index;
