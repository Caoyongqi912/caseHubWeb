import {
  addPlayCaseBasicInfo,
  copyPlayCase,
  editPlayCaseBaseInfo,
  pagePlayCase,
  removePlayCase,
} from '@/api/play/playCase';
import MyModal from '@/components/MyModal';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { IUICase } from '@/pages/Play/componets/uiTypes';
import PlayBaseForm from '@/pages/Play/PlayCase/PlayCaseDetail/PlayBaseForm';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Form,
  message,
  Popconfirm,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [caseForm] = Form.useForm<IUICase>();
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef<ActionType>();
  const [currentPlay, setCurrentPlay] = useState<IUICase>();
  const [modalName, setModalName] = useState('新增用例');

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    if (currentProjectId && currentModuleId) {
      caseForm.setFieldsValue({
        project_id: currentProjectId,
        module_id: currentModuleId,
      });
    }
  }, [currentModuleId, currentProjectId]);

  const fetchUICase = useCallback(
    async (params: any, sort: any) => {
      if (currentModuleId) {
        const { code, data } = await pagePlayCase({
          module_id: currentModuleId,
          module_type: ModuleEnum.UI_CASE,
          ...params,
          sort: sort,
        });
        return pageData(code, data);
      }
    },
    [currentModuleId, currentProjectId],
  );

  const saveOrUpdateCaseBase = async (values: IUICase) => {
    if (currentPlay) {
      editPlayCaseBaseInfo({
        ...values,
        id: currentPlay.id,
      }).then(async ({ code, msg }) => {
        if (code === 0) {
          message.success(msg);
          actionRef.current?.reload();
        }
      });
    } else {
      addPlayCaseBasicInfo(values).then(async ({ code, data, msg }) => {
        if (code === 0) {
          message.success(msg);
          actionRef.current?.reload();
        }
      });
    }
    return true;
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
        cursor: 'pointer',
        transition: 'all 0.2s ease',
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

  const columns: ProColumns<IUICase>[] = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      copyable: true,
      width: 100,
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
      sorter: true,
      fixed: 'left',
      key: 'title',
      width: 200,
      render: (_, record) => (
        <MyModal
          onFinish={saveOrUpdateCaseBase}
          trigger={
            <Tag
              style={styles.nameTag}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgTextActive;
              }}
              onClick={() => {
                caseForm.setFieldsValue(record);
                setCurrentPlay(record);
              }}
            >
              <FileTextOutlined style={{ marginRight: 4, opacity: 0.6 }} />
              {record.title}
            </Tag>
          }
          form={caseForm}
        >
          <PlayBaseForm />
        </MyModal>
      ),
    },
    {
      title: '优先级',
      key: 'level',
      dataIndex: 'level',
      valueType: 'select',
      width: 100,
      valueEnum: CONFIG.API_LEVEL_ENUM,
      render: (_, record) => (
        <Tag
          color={CONFIG.RENDER_CASE_LEVEL[record.level]?.color || 'default'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {CONFIG.RENDER_CASE_LEVEL[record.level]?.text || '-'}
        </Tag>
      ),
    },
    {
      title: '步骤数',
      dataIndex: 'step_num',
      hideInSearch: true,
      key: 'step_num',
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
          {record.step_num || 0}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      key: 'status',
      width: 100,
      valueEnum: CONFIG.CASE_STATUS_ENUM,
      render: (_, record) => (
        <Tag
          color={CONFIG.RENDER_CASE_STATUS[record.status]?.color || 'default'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {CONFIG.RENDER_CASE_STATUS[record.status]?.text || '-'}
        </Tag>
      ),
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
        <Tag style={styles.creatorTag}>{record.creatorName || '-'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'date',
      key: 'create_time',
      sorter: true,
      search: false,
      width: 160,
      render: (_, record) => (
        <Text
          type="secondary"
          style={{ fontSize: 13, fontFamily: 'monospace' }}
        >
          {record.create_time}
        </Text>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              window.open(
                `/ui/case/detail/caseId=${record.id}&projectId=${record.project_id}&moduleId=${record.module_id}`,
              );
            }}
          />
          <ActionButton
            icon={<CopyOutlined />}
            label="复制"
            type="success"
            onClick={async () => {
              const { code, data, msg } = await copyPlayCase({
                caseId: record.id,
              });
              if (code === 0) {
                message.success(msg);
                actionRef.current?.reload();
              }
            }}
          />
          {(initialState?.currentUser?.id === record.creator ||
            initialState?.currentUser?.isAdmin) && (
            <Popconfirm
              title="确认删除？"
              description="删除后数据将无法恢复"
              okText="确认删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                const { code, msg } = await removePlayCase({
                  caseId: record.id,
                });
                if (code === 0) {
                  message.success(msg);
                  actionRef.current?.reload();
                }
              }}
            >
              <ActionButton
                icon={<DeleteOutlined />}
                label="删除"
                type="danger"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const AddCaseButton = (
    <>
      <MyModal
        onFinish={saveOrUpdateCaseBase}
        trigger={
          <Button
            type="primary"
            hidden={currentModuleId === undefined}
            style={styles.addBtn}
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentPlay(undefined);
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
            添加用例
          </Button>
        }
        form={caseForm}
      >
        <PlayBaseForm />
      </MyModal>
    </>
  );

  return (
    <MyProTable
      persistenceKey={perKey}
      columns={columns}
      rowKey="id"
      request={fetchUICase}
      actionRef={actionRef}
      toolBarRender={() => [AddCaseButton]}
    />
  );
};

export default Index;
