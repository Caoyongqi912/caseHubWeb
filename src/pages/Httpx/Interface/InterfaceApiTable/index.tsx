import { IModuleEnum } from '@/api';
import {
  copyApiTo,
  copyInterApiById,
  outPutInter2Yaml,
  pageInterApi,
  removeInterApiById,
  updateInterApiById,
} from '@/api/inter';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  CopyOutlined,
  DashOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  DownOutlined,
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
import { history } from 'umi';

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
  const [copyForm] = Form.useForm();
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [openModal, setOpenModal] = useState(false);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [currentApiId, setCurrentApiId] = useState<number>();
  // 1copy 2move
  const [copyOrMove, setCopyOrMove] = useState(1);

  // 根据当前项目ID获取环境和用例部分
  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchInterface = useCallback(
    async (params: any, sort: any) => {
      const { code, data } = await pageInterApi({
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API,
        //只查询公共api
        is_common: 1,
        sort: sort,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '12%',
      copyable: true,
      render: (_, record) => {
        return <Tag color={'blue'}>{record.uid}</Tag>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },

    {
      title: '路径',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      valueType: 'select',
      key: 'method',
      valueEnum: CONFIG.API_METHOD_ENUM,
      filters: true,
      search: true,
      onFilter: true,
      render: (_, record) => {
        return (
          <Tag color={CONFIG.API_METHOD_ENUM[record.method].color}>
            {record.method}
          </Tag>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      key: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      search: false,
      filters: true,
      onFilter: true,
      render: (_, record) => {
        return <Tag color={'blue'}>{record.level}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      key: 'status',
      search: false,
      filters: true,
      onFilter: true,
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (_, record) => {
        return <Tag color={'orange'}>{record.creatorName}</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '6%',
      fixed: 'right',
      render: (_, record) => [
        <a
          onClick={() => {
            history.push(`/interface/interApi/detail/interId=${record.id}`);
          }}
        >
          详情
        </a>,

        <Dropdown
          menu={{
            items: [
              {
                key: '1',
                label: '复制接口',
                icon: <CopyOutlined />,
                onClick: async () => {
                  const { code } = await copyInterApiById(record.id);
                  if (code === 0) {
                    actionRef.current?.reload();
                  }
                },
              },
              {
                key: '3',
                label: '复制至',
                icon: <CopyOutlined />,
                onClick: () => {
                  setCurrentApiId(record.id);
                  setCopyOrMove(1);
                  setOpenModal(true);
                },
              },
              {
                key: '2',
                label: '移动至',
                icon: <DeliveredProcedureOutlined />,
                onClick: () => {
                  setCurrentApiId(record.id);
                  setCopyOrMove(2);
                  setOpenModal(true);
                },
              },

              {
                type: 'divider',
              },
              {
                key: '4',
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title={'确认删除？'}
                    okText={'确认'}
                    cancelText={'点错了'}
                    onConfirm={async () => {
                      const { code } = await removeInterApiById(record.id);
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
      ],
    },
  ];

  return (
    <>
      <Modal
        open={openModal}
        onOk={async () => {
          try {
            const values = await copyForm.validateFields();
            if (!currentApiId) return;
            let response;
            if (copyOrMove === 1) {
              response = await copyApiTo({
                inter_id: currentApiId,
                project_id: values.project_id,
                module_id: values.module_id,
              });
            } else if (copyOrMove === 2) {
              response = await updateInterApiById({
                id: currentApiId,
                project_id: values.project_id,
                module_id: values.module_id,
              });
            } else {
              return; // 无效的操作类型
            }
            if (response?.code === 0) {
              message.success(response.msg);
              copyForm.resetFields();
              setOpenModal(false);
              actionRef.current?.reload();
            }
          } catch (error) {
            // 表单验证失败或其他错误处理
            console.error('操作失败:', error);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={copyOrMove === 1 ? '复制接口' : '移动接口'}
      >
        <ProForm submitter={false} form={copyForm}>
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
        request={fetchInterface}
        toolBarRender={() => [
          <Button
            type={'primary'}
            onClick={() => {
              window.open(
                `/interface/interApi/detail/projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
          >
            <PlusOutlined />
            添加接口
          </Button>,
          <Button
            type={'primary'}
            onClick={async () => {
              if (currentModuleId) {
                await outPutInter2Yaml(currentModuleId);
              } else {
                message.warning('请选择模块');
              }
            }}
          >
            <DownOutlined />
            接口导出
          </Button>,
        ]}
      />
    </>
  );
};

export default Index;
