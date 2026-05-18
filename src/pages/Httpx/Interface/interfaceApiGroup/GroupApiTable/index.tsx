import { IModuleEnum } from '@/api';
import {
  insertInterfaceGroup,
  pageInterfaceGroup,
  removeInterfaceGroup,
  updateInterfaceGroup,
} from '@/api/inter/interGroup';
import { useGlassStyles } from '@/components/Glass';
import MyDrawer from '@/components/MyDrawer';
import MyModal from '@/components/MyModal';
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
  ProTable,
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
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

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
  const styles = useGlassStyles();
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

  const tagBaseStyle = {
    borderRadius: 6,
    fontSize: 12,
    padding: '4px 8px',
  };

  const uidTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 6,
  };

  const addBtnStyle = {
    height: 36,
    borderRadius: 8,
  };

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

  const columns: ProColumns<IInterfaceGroup>[] = [
    {
      title: 'ID',
      dataIndex: 'uid',
      key: 'uid',
      copyable: true,
      width: 130,
      render: (_, record) => (
        <Tag
          style={{
            ...uidTagStyle,
            background: `${styles.colors.primary}15`,
            color: styles.colors.primary,
          }}
        >
          <NumberOutlined />
          {record.uid}
        </Tag>
      ),
    },
    {
      title: '组名',
      dataIndex: 'interface_group_name',
      key: 'interface_group_name',
      width: 240,
      render: (_, record) => (
        <MyModal
          form={groupForm}
          title={record.interface_group_name}
          onFinish={saveBaseInfo}
          trigger={
            <Tag style={tagBaseStyle}>
              <FolderOutlined />
              {record.interface_group_name}
            </Tag>
          }
        >
          <GroupBaseInfo />
        </MyModal>
      ),
    },
    {
      title: '描述',
      dataIndex: 'interface_group_desc',
      key: 'interface_group_desc',
      ellipsis: true,
      width: 320,
    },
    {
      title: '接口数',
      dataIndex: 'interface_group_api_num',
      key: 'interface_group_api_num',
      width: 100,
      render: (_, record) => (
        <Tag style={tagBaseStyle}>{record.interface_group_api_num || 0}</Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      valueType: 'select',
      width: 110,
      renderFormItem: () => <UserSelect />,
      render: (_, record) => (
        <Tag style={{ ...tagBaseStyle, borderRadius: 12 }}>
          <UserOutlined />
          {record.creatorName}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => {
              setCurrentGroupId(record.id);
              setOpenGroupAssociation(true);
            }}
          >
            详情
          </Button>
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
                { type: 'divider' },
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
                      <a>删除</a>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
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

      <div style={{ height: 'calc(100vh - 240px)' }}>
        <ProTable
          persistenceKey={perKey}
          columns={columns}
          rowKey="id"
          actionRef={actionRef}
          scroll={{ x: 1200, y: 400 }}
          request={fetchInterfaceGroup}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          search={{ defaultCollapsed: true, labelWidth: 'auto' }}
          toolBarRender={() => [
            <MyModal
              key="add"
              form={groupForm}
              onFinish={saveBaseInfo}
              trigger={
                <Button
                  hidden={currentModuleId === undefined}
                  type="primary"
                  style={addBtnStyle}
                  icon={<PlusOutlined />}
                  onClick={() => setCurrentGroupId(undefined)}
                >
                  添加接口组
                </Button>
              }
            >
              <GroupBaseInfo />
            </MyModal>,
          ]}
        />
      </div>
    </>
  );
};

export default Index;
