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
  ApiOutlined,
  CopyOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  DownOutlined,
  EyeOutlined,
  LinkOutlined,
  MoreOutlined,
  NumberOutlined,
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
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history } from 'umi';

const { Text, Paragraph } = Typography;

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
  const [copyForm] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [openModal, setOpenModal] = useState(false);
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [copyOrMove, setCopyOrMove] = useState(1);

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
        is_common: 1,
        sort: sort,
      });
      return pageData(code, data);
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
      successBtn: {
        color: token.colorSuccess,
        backgroundColor: token.colorSuccessBg,
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
      urlText: {
        fontFamily: 'monospace',
        color: token.colorPrimary,
        fontSize: 13,
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
    type?: 'primary' | 'success' | 'danger' | 'warning';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    const styleMap = {
      primary: styles.primaryBtn,
      success: styles.successBtn,
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

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 140,
      copyable: true,
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '名称',
      dataIndex: 'interface_name',
      key: 'interface_name',
      fixed: 'left',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <ApiOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interface_name}
        </Tag>
      ),
    },
    {
      title: '路径',
      dataIndex: 'interface_url',
      key: 'interface_url',
      ellipsis: true,
      width: 300,
      render: (_, record) => (
        <Text style={styles.urlText} ellipsis>
          <LinkOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interface_url}
        </Text>
      ),
    },
    {
      title: '方法',
      dataIndex: 'interface_method',
      valueType: 'select',
      key: 'interface_method',
      valueEnum: CONFIG.API_METHOD_ENUM,
      filters: true,
      search: true,
      onFilter: true,
      width: 100,
      render: (_, record) => {
        const methodConfig = CONFIG.API_METHOD_ENUM[record.interface_method];
        return (
          <Tag
            color={methodConfig?.color}
            style={{
              borderRadius: 6,
              fontSize: 12,
              padding: '4px 12px',
              fontWeight: 600,
            }}
          >
            {record.interface_method}
          </Tag>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'interface_level',
      key: 'interface_level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      search: false,
      filters: true,
      onFilter: true,
      width: 100,
      render: (_, record) => {
        const levelConfig = CONFIG.API_LEVEL_ENUM[record.interface_level];
        return (
          <Tag
            color={levelConfig?.status === 'Success' ? 'success' : 'processing'}
            style={{
              borderRadius: 6,
              fontSize: 12,
              padding: '4px 12px',
            }}
          >
            {record.interface_level}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'interface_status',
      valueType: 'select',
      key: 'interface_status',
      search: false,
      filters: true,
      onFilter: true,
      valueEnum: CONFIG.API_STATUS_ENUM,
      width: 100,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.interface_status].tag;
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
      render: (_, record) => (
        <Tag style={styles.creatorTag}>{record.creatorName}</Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '8%',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              history.push(`/interface/interApi/detail/interId=${record.id}`);
            }}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: '复制接口',
                  icon: <CopyOutlined />,
                  onClick: async () => {
                    const { code, msg } = await copyInterApiById(record.id);
                    if (code === 0) {
                      message.success(msg || '复制成功');
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
                  danger: true,
                  label: (
                    <Popconfirm
                      title="确认删除？"
                      description="删除后数据将无法恢复"
                      okText="确认删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        const { code, msg } = await removeInterApiById(
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
      <Modal
        open={openModal}
        onOk={async () => {
          try {
            const values = await copyForm.validateFields();
            if (!currentApiId) return;
            let response;
            if (copyOrMove === 1) {
              response = await copyApiTo({
                interface_id: currentApiId,
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
        title={
          <span style={{ fontWeight: 600 }}>
            {copyOrMove === 1 ? '复制接口' : '移动接口'}
          </span>
        }
        width={600}
      >
        <ProForm submitter={false} form={copyForm} layout="vertical">
          <ProFormSelect
            width="md"
            options={projects}
            label="项目"
            name="project_id"
            required
            onChange={(value) => {
              setCopyProjectId(value as number);
            }}
            fieldProps={{
              placeholder: '请选择目标项目',
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
            }}
            width="md"
          />
        </ProForm>
      </Modal>
      <MyProTable
        persistenceKey={perKey}
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchInterface}
        toolBarRender={() => [
          <Button
            key="add"
            hidden={currentModuleId === undefined}
            type="primary"
            style={styles.addBtn}
            icon={<PlusOutlined />}
            onClick={() => {
              window.open(
                `/interface/interApi/detail/projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
            }}
          >
            添加接口
          </Button>,
          <Button
            key="export"
            type="primary"
            style={styles.addBtn}
            icon={<DownOutlined />}
            onClick={async () => {
              if (currentModuleId) {
                await outPutInter2Yaml(currentModuleId);
              } else {
                message.warning('请选择模块');
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
            }}
          >
            接口导出
          </Button>,
        ]}
      />
    </>
  );
};

export default Index;
