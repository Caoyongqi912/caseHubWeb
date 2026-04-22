import { IModuleEnum } from '@/api';
import {
  copyApiCase,
  insertApiCase,
  pageInterApiCase,
  removeApiCase,
  updateApiCase,
} from '@/api/inter/interCase';
import { useGlassStyles } from '@/components/Glass';
import MyDrawer from '@/components/MyDrawer';
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
  HistoryOutlined,
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
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import InterfaceApiCaseResultTable from '../../InterfaceApiCaseResult/InterfaceApiCaseResultTable';

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
  const [currentCaseId, setCurrentCaseId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [caseForm] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [copyProjectId, setCopyProjectId] = useState<number>();
  const [openHistory, setOpenHistory] = useState(false);

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
      if (!currentModuleId) return;
      const { code, data } = await pageInterApiCase({
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API_CASE,
        sort: sort,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const tagBaseStyle = {
    borderRadius: 6,
    fontSize: 12,
    padding: '4px 12px',
    fontWeight: 600,
  };

  const addBtnStyle = {
    height: 36,
    borderRadius: 8,
    fontWeight: 500,
    background: styles.colors.gradientPrimary,
    border: 'none',
    boxShadow: `0 4px 16px ${styles.colors.primaryGlow}`,
  };

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => (
    <a
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        color: type === 'primary' ? styles.colors.primary : styles.colors.error,
        backgroundColor:
          type === 'primary'
            ? `${styles.colors.primary}15`
            : `${styles.colors.error}15`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </a>
  );

  const columns: ProColumns<IInterfaceAPICase>[] = [
    {
      title: '业务编号',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      copyable: true,
      fixed: 'left',
      render: (_, record) => (
        <Tag
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            background: `${styles.colors.primary}15`,
            color: styles.colors.primary,
            border: `1px solid ${styles.colors.primary}30`,
          }}
        >
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </Tag>
      ),
    },
    {
      title: '名称',
      dataIndex: 'case_title',
      key: 'case_title',
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <Tag style={{ borderRadius: 6, fontSize: 13, padding: '4px 12px' }}>
          <FileTextOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.case_title}
        </Tag>
      ),
    },
    {
      title: '步骤数量',
      dataIndex: 'case_api_num',
      valueType: 'text',
      width: 100,
      render: (_, record) => (
        <Tag style={{ borderRadius: 6, fontWeight: 500, padding: '4px 12px' }}>
          {record.case_api_num || 0}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'case_level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: 100,
      render: (_, record) => {
        const levelConfig = CONFIG.API_LEVEL_ENUM[record.case_level];
        return (
          <Tag
            color={levelConfig?.status === 'Success' ? 'success' : 'processing'}
            style={tagBaseStyle}
          >
            {record.case_level}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'case_status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      width: 100,
      render: (_, record) => CONFIG.API_STATUS_ENUM[record.case_status].tag,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'select',
      width: 120,
      renderFormItem: () => <UserSelect />,
      render: (_, record) => (
        <Tag style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12 }}>
          {record.creatorName}
        </Tag>
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
                { type: 'divider' },
                {
                  key: '5',
                  icon: <HistoryOutlined />,
                  label: '运行历史',
                  onClick: () => {
                    setCurrentCaseId(record.id);
                    setOpenHistory(true);
                  },
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
                      <a style={{ color: styles.colors.error }}>删除</a>
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
    const { code, data } = await insertApiCase(values);
    if (code === 0) {
      message.success('添加成功');
      actionRef.current?.reload();
      history.push(
        `/interface/caseApi/detail/caseApiId=${data.id}&projectId=${data.project_id}&moduleId=${data.module_id}`,
      );
    }
    return true;
  };

  return (
    <div>
      <MyDrawer
        name={'运行历史'}
        open={openHistory}
        width={'85%'}
        setOpen={setOpenHistory}
      >
        <InterfaceApiCaseResultTable apiCaseId={currentCaseId} />
      </MyDrawer>
      <Modal
        open={openModal}
        onOk={async () => {
          const values = await form.validateFields();
          const { code, msg } = await updateApiCase({
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
            onChange={(value) => setCopyProjectId(value as number)}
          />
          <ProFormTreeSelect
            required
            name="module_id"
            label="模块"
            rules={[{ required: true, message: '所属模块必选' }]}
            fieldProps={{
              treeData: moduleEnum,
              fieldNames: { label: 'title' },
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
                style={addBtnStyle}
                icon={<PlusOutlined />}
                onClick={() => setCurrentCaseId(undefined)}
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
