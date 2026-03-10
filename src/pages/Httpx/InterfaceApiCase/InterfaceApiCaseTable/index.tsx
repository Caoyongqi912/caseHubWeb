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
  EyeOutlined,
  FileTextOutlined,
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
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [caseForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [copyProjectId, setCopyProjectId] = useState<number>();

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

  const columns: ProColumns<IInterfaceAPICase>[] = [
    {
      title: '业务编号',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      copyable: true,
      fixed: 'left',
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <FileTextOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.title}
        </Tag>
      ),
    },
    {
      title: '步骤数量',
      dataIndex: 'apiNum',
      valueType: 'text',
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
          {record.apiNum || 0}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: 100,
      render: (_, record) => (
        <Tag
          color={
            CONFIG.API_LEVEL_ENUM[record.level]?.status === 'Success'
              ? 'success'
              : 'processing'
          }
          style={{ borderRadius: 6, fontSize: 12, padding: '4px 12px' }}
        >
          {record.level}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      width: 100,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
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
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      sorter: true,
      search: false,
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '10%',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              history.push(
                `/interface/caseApi/detail/caseApiId=${record.id}&projectId=${record.project_id}&moduleId=${record.module_id}`,
              );
            }}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: '复制',
                  icon: <CopyOutlined />,
                  onClick: async () => {
                    const { code, msg } = await copyApiCase(record.id);
                    if (code === 0) {
                      message.success(msg || '复制成功');
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
                  danger: true,
                  label: (
                    <Popconfirm
                      title="确认删除？"
                      description="删除后数据将无法恢复"
                      okText="确认删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        const { code, msg } = await removeApiCase(record.id);
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
    <div>
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
        title={<span style={{ fontWeight: 600 }}>移动用例</span>}
      >
        <ProForm submitter={false} form={form}>
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
        key={perKey}
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={fetchInterfaceCase}
        toolBarRender={() => [
          <MyModal
            key="add"
            onFinish={saveBaseInfo}
            trigger={
              <Button
                hidden={currentModuleId === undefined}
                type="primary"
                style={styles.addBtn}
                icon={<PlusOutlined />}
                onClick={() => setCurrentCaseId(undefined)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
                }}
              >
                添加任务用例
              </Button>
            }
            form={caseForm}
          >
            <ApiCaseBaseForm />
          </MyModal>,
        ]}
      />
    </div>
  );
};

export default Index;
