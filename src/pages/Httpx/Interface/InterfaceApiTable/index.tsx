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
import UserSelect from '@/components/Table/UserSelect';
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

/**
 * 接口API表格组件
 * 用于展示和管理接口API列表，支持复制、移动、删除等操作
 */
const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const [copyForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [openModal, setOpenModal] = useState(false);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [copyOrMove, setCopyOrMove] = useState(1); // 1: 复制, 2: 移动

  /**
   * 根据当前项目ID获取模块枚举
   */
  useEffect(() => {
    if (copyProjectId) {
      fetchModulesEnum(copyProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [copyProjectId]);

  /**
   * 当模块或项目变化时重新加载表格数据
   */
  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  /**
   * 获取接口列表数据
   */
  const fetchInterface = useCallback(
    async (params: any, sort: any) => {
      const { code, data } = await pageInterApi({
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API,
        is_common: 1,
        sort: sort,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  /**
   * 表格列配置
   * 定义接口列表的显示列和渲染方式
   */
  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 140,
      copyable: true,
      render: (_, record) => {
        return (
          <Tag
            color={'blue'}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '2px 8px',
              fontFamily: 'monospace',
            }}
          >
            {record.uid}
          </Tag>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div
            style={{
              fontWeight: 500,
            }}
          >
            {record.name}
          </div>
        );
      },
    },

    {
      title: '路径',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      width: 300,
      render: (_, record) => {
        return (
          <div
            style={{
              fontFamily: 'monospace',
              color: '#1890ff',
              fontSize: '13px',
            }}
          >
            {record.url}
          </div>
        );
      },
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
      width: 100,
      render: (_, record) => {
        const methodConfig = CONFIG.API_METHOD_ENUM[record.method];
        return (
          <Tag
            color={methodConfig?.color}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '2px 10px',
              fontWeight: 500,
            }}
          >
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
      width: 100,
      render: (_, record) => {
        const levelConfig = CONFIG.API_LEVEL_ENUM[record.level];
        return (
          <Tag
            color={levelConfig?.status === 'Success' ? 'green' : 'blue'}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '2px 8px',
            }}
          >
            {record.level}
          </Tag>
        );
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
      width: 100,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
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
      render: (_, record) => {
        return (
          <Tag
            color={'orange'}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '2px 8px',
            }}
          >
            {record.creatorName}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 180,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            history.push(`/interface/interApi/detail/interId=${record.id}`);
          }}
          style={{
            color: '#1890ff',
            fontWeight: 500,
          }}
        >
          详情
        </a>,

        <Dropdown
          key="more"
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
                    <a style={{ color: '#ff4d4f' }}>删除</a>
                  </Popconfirm>
                ),
              },
            ],
          }}
        >
          <a
            key="dropdown"
            onClick={(e) => e.preventDefault()}
            style={{
              color: '#8c8c8c',
            }}
          >
            <Space>
              <DashOutlined />
            </Space>
          </a>
        </Dropdown>,
      ],
    },
  ];

  /**
   * 复制/移动接口模态框确认操作
   */
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
              return;
            }
            if (response?.code === 0) {
              message.success(response.msg);
              copyForm.resetFields();
              setOpenModal(false);
              actionRef.current?.reload();
            }
          } catch (error) {
            console.error('操作失败:', error);
          }
        }}
        onCancel={() => setOpenModal(false)}
        title={copyOrMove === 1 ? '复制接口' : '移动接口'}
        width={600}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          style: {
            borderRadius: '6px',
            boxShadow: '0 2px 0 rgba(24, 144, 255, 0.2)',
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
          },
        }}
        styles={{
          body: {
            padding: '24px',
          },
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
          },
        }}
      >
        <ProForm
          submitter={false}
          form={copyForm}
          layout="vertical"
          style={{
            maxWidth: '100%',
          }}
        >
          <ProFormSelect
            width={'md'}
            options={projects}
            label={'项目'}
            name={'project_id'}
            required={true}
            onChange={(value) => {
              setCopyProjectId(value as number);
            }}
            fieldProps={{
              placeholder: '请选择目标项目',
              size: 'large',
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
              placeholder: '请选择目标模块',
              size: 'large',
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
            hidden={currentModuleId === undefined}
            type={'primary'}
            onClick={() => {
              window.open(
                `/interface/interApi/detail/projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(24, 144, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 8px rgba(24, 144, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 0 rgba(24, 144, 255, 0.2)';
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
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(24, 144, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 8px rgba(24, 144, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 2px 0 rgba(24, 144, 255, 0.2)';
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
