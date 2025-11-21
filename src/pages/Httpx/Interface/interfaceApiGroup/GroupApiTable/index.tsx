import { IModuleEnum } from '@/api';
import {
  pageInterfaceGroup,
  removeInterfaceGroup,
  updateInterfaceGroup,
} from '@/api/inter/interGroup';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
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
  const [groupDetail, setGroupDetail] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
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
      render: (_, record) => {
        return <Tag color={'blue'}>{record.uid}</Tag>;
      },
    },
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
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
      dataIndex: 'creatorName',
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
              setGroupDetail(true);
            }}
          >
            详情
          </a>,
          <a
            onClick={() => {
              setCurrentGroupId(record.id);
              setOpenGroupAssociation(true);
            }}
            // onClick={() => {
            //   history.push(
            //     `/interface/group/detail/groupId=${record.id}&projectId=${record.project_id}&moduleId=${record.module_id}`,
            //   );
            // }}
          >
            关联API
          </a>,
          <Dropdown
            menu={{
              items: [
                // {
                //   key: '1',
                //   label: '复制',
                //   icon: <CopyOutlined />,
                //   onClick: async () => {
                //     const { code } = await copyInterfaceGroup(record.id);
                //     if (code === 0) {
                //       actionRef.current?.reload();
                //     }
                //   },
                // },
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
        name={''}
        open={groupDetail}
        setOpen={setGroupDetail}
        width={'15%'}
      >
        <GroupBaseInfo
          groupId={currentGroupId}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          callback={() => {
            setGroupDetail(false);
            actionRef.current?.reload();
          }}
        />
      </MyDrawer>
      <MyDrawer
        name={''}
        open={openGroupAssociation}
        setOpen={setOpenGroupAssociation}
        width={'50%'}
      >
        <GroupApiDetail groupId={currentGroupId} projectId={currentProjectId} />
      </MyDrawer>

      <Modal
        open={openModal}
        onOk={async () => {
          const values = await form.validateFields();
          const { code, msg } = await updateInterfaceGroup({
            id: currentGroupId,
            ...values,
          });
          if (code === 0) {
            message.success(msg);
            actionRef.current?.reload();
            form.resetFields();
            setOpenModal(false);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={'移动'}
      >
        <ProForm submitter={false} form={form}>
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
        x={1500}
        actionRef={actionRef}
        request={fetchInterfaceGroup}
        toolBarRender={() => [
          <Button
            type={'primary'}
            onClick={() => {
              setGroupDetail(true);
            }}
          >
            添加
          </Button>,
        ]}
      />
    </>
  );
};

export default Index;
