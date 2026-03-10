import {
  insertInterGlobalHeader,
  pageInterGlobalHeader,
  removeInterGlobalHeader,
  updateInterGlobalHeader,
} from '@/api/inter/interGlobal';
import { queryProjectEnum, queryProjects } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceGlobalHeader } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import { useAccess } from '@@/exports';
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  KeyOutlined,
  PlusOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProCard,
  ProColumns,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Form, message, Space, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { useToken } = theme;
const { Text } = Typography;

const ActionButton: FC<{
  icon: React.ReactNode;
  label: string;
  type?: 'primary' | 'success' | 'danger' | 'warning';
  onClick?: () => void;
}> = ({ icon, label, type = 'primary', onClick }) => {
  const { token } = useToken();

  const colors = useMemo(
    () => ({
      primary: { color: token.colorPrimary, bg: token.colorPrimaryBg },
      success: { color: token.colorSuccess, bg: token.colorSuccessBg },
      danger: { color: token.colorError, bg: token.colorErrorBg },
      warning: { color: token.colorWarning, bg: token.colorWarningBg },
    }),
    [token],
  );

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        color: colors[type].color,
        backgroundColor: colors[type].bg,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `0 2px 8px ${colors[type].bg}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {icon}
      {label}
    </span>
  );
};

const InterApiHeaders = () => {
  const [hFrom] = Form.useForm<IInterfaceGlobalHeader>();
  const { isAdmin } = useAccess();
  const { token } = useToken();
  const actionRef = useRef<ActionType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<{ label: string; value: number }[]>(
    [],
  );
  const [projectEnum, setProjectEnum] = useState<any>([]);

  const styles = useMemo(
    () => ({
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
      keyTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: token.colorInfoBg,
        border: `1px solid ${token.colorInfoBorder}`,
        fontSize: 13,
        fontWeight: 500,
        color: token.colorInfoText,
      },
      valueTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: token.colorSuccessBg,
        border: `1px solid ${token.colorSuccessBorder}`,
        fontSize: 13,
        fontWeight: 500,
        color: token.colorSuccessText,
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
      },
      descTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        fontSize: 13,
        color: token.colorTextSecondary,
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
      },
      projectTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        fontSize: 13,
        fontWeight: 500,
        color: token.colorPrimary,
      },
      addBtn: {
        height: 36,
        padding: '0 16px',
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  useEffect(() => {
    queryProjects(setProjects).then();
    queryProjectEnum(setProjectEnum).then();
  }, []);

  const fetchInterApiHeaders = useCallback(async (values: any, sort: any) => {
    const { code, data } = await pageInterGlobalHeader({
      ...values,
      sort: sort,
    });
    return pageData(code, data);
  }, []);

  const setInterApiHeaders = async (_: any, values: IInterfaceGlobalHeader) => {
    const { code, msg } = await updateInterGlobalHeader(values);
    if (code === 0) {
      actionRef.current?.reload();
      message.success(msg);
    }
  };

  const columns: ProColumns<IInterfaceGlobalHeader>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInSearch: true,
      width: '12%',
      valueEnum: projectEnum,
      render: (text, record) => (
        <span style={styles.projectTag}>
          <ProjectOutlined style={{ fontSize: 12 }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      width: '18%',
      render: (text, record) => (
        <span style={styles.keyTag}>
          <KeyOutlined style={{ fontSize: 12 }} />
          {text}
        </span>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: '25%',
      render: (text, record) => <span style={styles.valueTag}>{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
      width: '25%',
      render: (text, record) => (
        <span style={styles.descTag}>
          <FileTextOutlined style={{ fontSize: 12, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text || '-'}
          </span>
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: '12%',
      render: (text, record, _, action) => {
        return (
          isAdmin && (
            <Space size={4}>
              <ActionButton
                icon={<EditOutlined style={{ fontSize: 12 }} />}
                label="编辑"
                type="primary"
                onClick={async () => {
                  action?.startEditable?.(record.uid);
                }}
              />
              <ActionButton
                icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                label="删除"
                type="danger"
                onClick={async () => {
                  await removeInterGlobalHeader(record.uid).then(
                    ({ code, msg }) => {
                      if (code === 0) {
                        message.success(msg);
                        actionRef.current?.reload();
                      }
                    },
                  );
                }}
              />
            </Space>
          )
        );
      },
    },
  ];

  const onFinish = async () => {
    const value = await hFrom.validateFields();
    const { code, msg } = await insertInterGlobalHeader(value);
    if (code === 0) {
      message.success(msg);
      hFrom.resetFields();
      setIsModalOpen(false);
      actionRef.current?.reload();
    }
  };

  return (
    <ProCard style={{ borderRadius: 12 }}>
      <ModalForm<IInterfaceGlobalHeader>
        open={isModalOpen}
        form={hFrom}
        onFinish={onFinish}
        onOpenChange={setIsModalOpen}
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>添加请求头配置</span>
        }
        modalProps={{
          centered: true,
          styles: {
            body: { padding: '24px 24px 12px' },
            content: { borderRadius: 12 },
          },
        }}
      >
        <ProFormSelect
          options={projects}
          label={'所属项目'}
          name={'project_id'}
          required={true}
          placeholder="请选择项目"
        />
        <ProFormText
          name={'key'}
          label={'Key'}
          required
          rules={[{ required: true, message: 'key必填' }]}
          placeholder="请输入 Header Key"
        />
        <ProFormText
          name={'value'}
          label={'Value'}
          required
          rules={[{ required: true, message: 'value必填' }]}
          placeholder="请输入 Header Value"
        />
        <ProFormTextArea
          name={'description'}
          label={'描述'}
          placeholder="请输入描述信息"
        />
      </ModalForm>
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={fetchInterApiHeaders}
        x={1000}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={styles.addBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            添加请求头
          </Button>,
        ]}
        rowKey={'uid'}
        onSave={setInterApiHeaders}
      />
    </ProCard>
  );
};

export default InterApiHeaders;
