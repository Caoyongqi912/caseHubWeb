import {
  addPlayMethod,
  pagePlayMethods,
  removePlayMethod,
  updatePlayMethod,
} from '@/api/play/playCase';
import MyProTable from '@/components/Table/MyProTable';
import { IUIMethod } from '@/pages/Play/componets/uiTypes';
import { pageData } from '@/utils/somefunc';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FunctionOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProCard,
  ProColumns,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message, Space, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;

const Index = () => {
  const { token } = theme.useToken();
  const [methodForm] = Form.useForm<IUIMethod>();
  const actionRef = useRef<ActionType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageUIMethod = useCallback(async (values: any, sort: any) => {
    const { code, data } = await pagePlayMethods({ ...values, sort: sort });
    return pageData(code, data);
  }, []);

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
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
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
      valueTag: {
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        color: token.colorPrimary,
        border: `1px solid ${token.colorPrimaryBorder}`,
      },
      yesTag: {
        borderRadius: 6,
        fontWeight: 500,
        padding: '4px 12px',
        backgroundColor: token.colorSuccessBg,
        color: token.colorSuccess,
        border: `1px solid ${token.colorSuccessBorder}`,
      },
      noTag: {
        borderRadius: 6,
        fontWeight: 500,
        padding: '4px 12px',
        backgroundColor: token.colorErrorBg,
        color: token.colorError,
        border: `1px solid ${token.colorErrorBorder}`,
      },
      addBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      modalCard: {
        marginTop: 10,
        borderRadius: 8,
      },
    }),
    [token],
  );

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    const styleMap = {
      primary: styles.primaryBtn,
      danger: styles.dangerBtn,
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

  const columns: ProColumns<IUIMethod>[] = [
    {
      title: '名称',
      dataIndex: 'label',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <FunctionOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.label}
        </Tag>
      ),
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 150,
      render: (_, record) => (
        <Text code style={styles.valueTag}>
          {record.value}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
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
      title: '提取器',
      width: 100,
      dataIndex: 'need_locator',
      render: (_, record) => (
        <Tag style={record.need_locator === 1 ? styles.yesTag : styles.noTag}>
          {record.need_locator === 1 ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.need_locator === 1 ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '输入值',
      dataIndex: 'need_value',
      width: 100,
      render: (_, record) => (
        <Tag style={record.need_value === 1 ? styles.yesTag : styles.noTag}>
          {record.need_value === 1 ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.need_value === 1 ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record, __, action) => (
        <Space size={4}>
          <ActionButton
            icon={<EditOutlined />}
            label="编辑"
            type="primary"
            onClick={() => {
              action?.startEditable?.(record.uid);
            }}
          />
          <ActionButton
            icon={<DeleteOutlined />}
            label="删除"
            type="danger"
            onClick={async () => {
              const { code, msg } = await removePlayMethod(record.uid);
              if (code === 0) {
                message.success(msg);
                actionRef.current?.reload();
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const AddMethod = (
    <Button
      type="primary"
      style={styles.addBtn}
      icon={<PlusOutlined />}
      onClick={() => setIsModalOpen(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
      }}
    >
      添加方法
    </Button>
  );

  const OnUpdateMethod = async (_: any, values: IUIMethod) => {
    const { code, msg } = await updatePlayMethod(values);
    if (code === 0) {
      actionRef.current?.reload();
      message.success(msg);
    }
  };

  const onMethodFormFinish = async (values: IUIMethod) => {
    const { code, msg } = await addPlayMethod(values);
    if (code === 0) {
      message.success(msg);
      actionRef.current?.reload();
      setIsModalOpen(false);
    }
  };

  return (
    <ProCard split="horizontal" style={{ height: '100%' }}>
      <ModalForm
        open={isModalOpen}
        form={methodForm}
        onFinish={onMethodFormFinish}
        onOpenChange={setIsModalOpen}
        title={
          <span style={{ fontWeight: 600 }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            添加操作方法
          </span>
        }
      >
        <ProCard style={styles.modalCard}>
          <ProFormText
            name="label"
            label="方法名"
            required
            rules={[{ required: true, message: '方法名必填' }]}
            placeholder="请输入方法名称"
          />
          <ProFormText
            name="value"
            label="方法值"
            required
            rules={[{ required: true, message: '方法值必填' }]}
            placeholder="请输入方法值"
          />
          <ProFormText
            name="description"
            label="方法描述"
            placeholder="请输入方法描述"
          />
          <ProFormSelect
            name="need_locator"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 2 },
            ]}
            label="是否需要定位器"
            initialValue={1}
          />
          <ProFormSelect
            name="need_value"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 2 },
            ]}
            label="是否需要输入值"
            initialValue={1}
          />
        </ProCard>
      </ModalForm>
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        request={pageUIMethod}
        x={1000}
        toolBarRender={() => [AddMethod]}
        rowKey="uid"
        onSave={OnUpdateMethod}
      />
    </ProCard>
  );
};

export default Index;
