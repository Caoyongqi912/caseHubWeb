import {
  copyPlayGroup,
  pagePlayGroupSteps,
  removePlayGroup,
} from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { IUIGroupStep } from '@/pages/Play/componets/uiTypes';
import PlayStepGroupModalForm from '@/pages/Play/PlayStep/PlayStepGroup/PlayStepGroupModalForm';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  LinkOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useEffect, useMemo, useRef } from 'react';

const { Paragraph } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const PlayStepGroupTable: FC<SelfProps> = (props) => {
  const { currentProjectId, currentModuleId, perKey } = props;
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();

  const reload = () => {
    actionRef.current?.reload();
  };

  useEffect(() => {
    reload();
  }, [currentModuleId, currentProjectId]);

  const fetchStepGroupPage = async (values: any) => {
    const { code, data } = await pagePlayGroupSteps({
      ...values,
      module_id: currentModuleId,
      module_type: ModuleEnum.UI_STEP,
    });
    return pageData(code, data);
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

  const columns: ProColumns<IUIGroupStep>[] = [
    {
      title: 'UID',
      dataIndex: 'uid',
      width: 100,
      copyable: true,
      editable: false,
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
      valueType: 'text',
      dataIndex: 'name',
      copyable: true,
      width: 200,
      render: (_, record) => {
        return (
          <PlayStepGroupModalForm
            trigger={
              <Tag
                style={styles.nameTag}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    token.colorBgTextActive;
                }}
              >
                <FolderOutlined style={{ marginRight: 4, opacity: 0.6 }} />
                {record.name}
              </Tag>
            }
            currentProjectId={record.project_id}
            currentModuleId={record.module_id}
            callBack={reload}
            current={record}
          />
        );
      },
    },
    {
      title: '描述',
      valueType: 'text',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
      width: 280,
      render: (_, record) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          style={{
            margin: 0,
            color: token.colorTextSecondary,
            fontSize: 13,
          }}
        >
          {record.description || '-'}
        </Paragraph>
      ),
    },
    {
      title: '步长',
      valueType: 'text',
      dataIndex: 'step_num',
      search: false,
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
          {(record as any).step_num || 0}
        </Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      valueType: 'text',
      editable: false,
      width: 120,
      render: (_, record) => (
        <Tag style={styles.creatorTag}>{record.creatorName || '-'}</Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              window.open(`/ui/group/detail/groupId=${record.id}`);
            }}
          />
          <ActionButton
            icon={<CopyOutlined />}
            label="复制"
            type="success"
            onClick={async () => {
              const { code, msg } = await copyPlayGroup({
                group_id: record.id,
              });
              if (code === 0) {
                message.success(msg || '复制成功');
                reload();
              }
            }}
          />
          <Popconfirm
            title="确认删除？"
            description="删除后会影响被关联的用例！"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              const { code, msg } = await removePlayGroup({
                group_id: record.id,
              });
              if (code === 0) {
                message.success(msg || '删除成功');
                reload();
              }
            }}
          >
            <ActionButton
              icon={<DeleteOutlined />}
              label="删除"
              type="danger"
            />
          </Popconfirm>
          <ActionButton
            icon={<LinkOutlined />}
            label="关联"
            type="warning"
            onClick={() => {}}
          />
        </Space>
      ),
    },
  ];

  return (
    <MyProTable
      headerTitle="步骤组"
      actionRef={actionRef}
      persistenceKey={perKey}
      rowKey="id"
      x={1000}
      columns={columns}
      toolBarRender={() => [
        <PlayStepGroupModalForm
          trigger={
            <Button
              type="primary"
              hidden={currentModuleId === undefined}
              style={styles.addBtn}
              icon={<PlusOutlined />}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
              }}
            >
              添加步骤组
            </Button>
          }
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          callBack={reload}
        />,
      ]}
      request={fetchStepGroupPage}
    />
  );
};

export default PlayStepGroupTable;
