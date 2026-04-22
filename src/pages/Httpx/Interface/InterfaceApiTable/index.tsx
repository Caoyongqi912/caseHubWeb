import { IModuleEnum } from '@/api';
import {
  copyApiTo,
  copyInterApiById,
  outPutInter2Yaml,
  pageInterApi,
  removeInterApiById,
  updateInterApiById,
} from '@/api/inter';
import { useGlassStyles } from '@/components/Glass';
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
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { history } from 'umi';

const { Text } = Typography;

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
      if (!currentModuleId) return;
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

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 140,
      copyable: true,
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
      dataIndex: 'interface_name',
      key: 'interface_name',
      fixed: 'left',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <Tag style={{ borderRadius: 6, fontSize: 13, padding: '4px 12px' }}>
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
        <Text
          ellipsis
          style={{
            fontFamily: 'monospace',
            color: styles.colors.primary,
            fontSize: 13,
          }}
        >
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
          <Tag color={methodConfig?.color} style={{ ...tagBaseStyle }}>
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
            style={tagBaseStyle}
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
      render: (_, record) =>
        CONFIG.API_STATUS_ENUM[record.interface_status].tag,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
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
                { type: 'divider' },
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

  return (
    <>
      <Modal
        open={openModal}
        onOk={async () => {
          try {
            const values = await copyForm.validateFields();
            if (!currentApiId) return;
            const response =
              copyOrMove === 1
                ? await copyApiTo({
                    interface_id: currentApiId,
                    project_id: values.project_id,
                    module_id: values.module_id,
                  })
                : await updateInterApiById({
                    id: currentApiId,
                    project_id: values.project_id,
                    module_id: values.module_id,
                  });
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
            onChange={(value) => setCopyProjectId(value as number)}
            fieldProps={{ placeholder: '请选择目标项目' }}
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
            style={addBtnStyle}
            icon={<PlusOutlined />}
            onClick={() => {
              window.open(
                `/interface/interApi/detail/projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
          >
            添加接口
          </Button>,
          <Button
            key="export"
            type="primary"
            style={addBtnStyle}
            icon={<DownOutlined />}
            onClick={async () => {
              if (currentModuleId) {
                await outPutInter2Yaml(currentModuleId);
              } else {
                message.warning('请选择模块');
              }
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
