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
  DashOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  PlusOutlined,
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
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
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
  // 根据当前项目ID获取环境和用例部分
  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
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
  // 使用useCallback优化请求函数
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
        console.error('获取接口组列表失败:', error);
        return { success: false, data: [] };
      } finally {
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
      width: '10%',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.uid}</Tag>;
      },
    },
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <MyModal
          form={groupForm}
          title={record.name}
          onFinish={saveBaseInfo}
          trigger={
            <a
              onClick={() => {
                groupForm.setFieldsValue(record);
                setCurrentGroupId(record.id);
              }}
            >
              {text}
            </a>
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
    },
    {
      title: '接口数',
      dataIndex: 'api_num',
      key: 'api_num',
      render: (_, record) => {
        return <Tag color={'blue-inverse'}>{record.api_num}</Tag>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      valueType: 'select',
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => {
        return <Tag color={'orange'}>{record.creatorName}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: '10%',
      render: (_, record) => {
        return [
          <a
            onClick={() => {
              setCurrentGroupId(record.id);
              setOpenGroupAssociation(true);
            }}
          >
            关联详情
          </a>,
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
                  label: (
                    <Popconfirm
                      title={'确认删除？'}
                      okText={'确认'}
                      cancelText={'点错了'}
                      onConfirm={async () => {
                        const { code } = await removeInterfaceGroup(record.id);
                        if (code === 0) {
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
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <DashOutlined />
              </Space>
            </a>
          </Dropdown>,
        ];
      },
    },
  ];
  return (
    <>
      <MyDrawer
        open={openGroupAssociation}
        setOpen={setOpenGroupAssociation}
        width={'80%'}
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
        title={'移动'}
      >
        <ProForm submitter={false} form={moveForm}>
          <ProFormSelect
            width={'md'}
            options={projects}
            label={'项目'}
            name={'project_id'}
            required={true}
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
            width={'md'}
          />
        </ProForm>
      </Modal>
      <MyProTable
        persistenceKey={perKey}
        columns={columns}
        rowKey={'id'}
        x={1200}
        actionRef={actionRef}
        request={fetchInterfaceGroup}
        toolBarRender={() => [
          <MyModal
            form={groupForm}
            onFinish={saveBaseInfo}
            trigger={
              <Button
                hidden={currentModuleId === undefined}
                type={'primary'}
                onClick={() => setCurrentGroupId(undefined)}
              >
                <PlusOutlined />
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
