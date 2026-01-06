import { IModuleEnum } from '@/api';
import { searchUser } from '@/api/base';
import {
  copyApiCase,
  insertApiCase,
  pageInterApiCase,
  removeApiCase,
  setApiCase,
} from '@/api/inter/interCase';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import ApiCaseBaseForm from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/ApiCaseBaseForm';
import { IInterfaceAPICase } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import { useModel } from '@@/exports';
import {
  CopyOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  MoreOutlined,
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
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [caseForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);

  const [copyProjectId, setCopyProjectId] = useState<number>();
  // 根据当前项目ID获取环境和用例部分
  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(
        copyProjectId,
        ModuleEnum.API_CASE,
        setModuleEnum,
      ).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      caseForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchInterfaceCase = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API_CASE,
        sort: sort,
      };
      const { code, data } = await pageInterApiCase(searchData);
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const queryUser: any = async (value: any) => {
    const { keyWords } = value;
    if (keyWords) {
      const { code, data } = await searchUser({ username: keyWords });
      if (code === 0) {
        return data.map((item) => ({
          label: item.username,
          value: item.id,
        }));
      }
    }
  };
  const columns: ProColumns<IInterfaceAPICase>[] = [
    {
      title: '业务编号',
      dataIndex: 'uid',
      key: 'uid',
      width: '10%',
      copyable: true,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '步骤数量',
      dataIndex: 'apiNum',
      valueType: 'text',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.apiNum}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      render: (_, record) => {
        return <Tag color={'blue'}>{record.level}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'select',
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => {
        return <Tag>{record.creatorName}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '10%',
      fixed: 'right',
      render: (_, record) => {
        return [
          <a
            onClick={() => {
              history.push(
                `/interface/caseApi/detail/caseApiId=${record.id}&projectId=${record.project_id}&moduleId=${record.module_id}`,
              );
            }}
          >
            详情
          </a>,
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: '复制',
                  icon: <CopyOutlined />,
                  onClick: async () => {
                    const { code } = await copyApiCase(record.id);
                    if (code === 0) {
                      actionRef.current?.reload();
                    }
                  },
                },
                {
                  key: '3',
                  label: '移动至',
                  icon: <DeliveredProcedureOutlined />,
                  onClick: () => {
                    setCurrentCaseId(record.id);
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
                        await removeApiCase(record.id).then(
                          async ({ code }) => {
                            if (code === 0) {
                              actionRef.current?.reload();
                            }
                          },
                        );
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
                <MoreOutlined />
                {/*<DashOutlined />*/}
              </Space>
            </a>
          </Dropdown>,
        ];
      },
    },
  ];

  const saveBaseInfo = async (values: IInterfaceAPICase) => {
    await insertApiCase(values).then(async ({ code, data }) => {
      if (code === 0) {
        message.success('添加成功');
        actionRef.current?.reload();
        history.push(
          `/interface/caseApi/detail/caseApiId=${data.id}&projectId=${data.project_id}&moduleId=${data.module_id}`,
        );
      }
    });
    return true;
  };

  return (
    <>
      <Modal
        open={openModal}
        onOk={async () => {
          const values = await form.validateFields();
          const { code, msg } = await setApiCase({
            id: currentCaseId,
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
        key={perKey}
        rowKey={'id'}
        actionRef={actionRef}
        x={1200}
        columns={columns}
        request={fetchInterfaceCase}
        toolBarRender={() => [
          <MyModal
            onFinish={saveBaseInfo}
            trigger={
              <Button
                hidden={currentModuleId === undefined}
                type={'primary'}
                onClick={() => setCurrentCaseId(undefined)}
              >
                <PlusOutlined />
                添加任务用例
              </Button>
            }
            form={caseForm}
          >
            <ApiCaseBaseForm />
          </MyModal>,
        ]}
      />
    </>
  );
};
export default Index;
