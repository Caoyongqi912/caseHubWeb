import { IObjGet } from '@/api';
import {
  copyCommonPlayStep,
  pagePlaySteps,
  queryPlayMethods,
  removePlayStep,
} from '@/api/play/playCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import PlayCaseStepAss from '@/pages/Play/componets/PlayCaseStepAss';
import { IPlayStepDetail } from '@/pages/Play/componets/uiTypes';
import PlayStepDetail from '@/pages/Play/PlayStep/PlayStepDetail';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
  Badge,
  Button,
  message,
  Popconfirm,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const methodColorMap: Record<string, string> = {
  click: 'processing',
  input: 'success',
  scroll: 'warning',
  wait: 'default',
  expect: 'error',
  screenshot: 'purple',
  select: 'cyan',
  hover: 'magenta',
};

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [methodEnum, setMethodEnum] = useState<IObjGet>();
  const [addStepOpen, setStepOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<IPlayStepDetail>();
  const [dataOpen, setDataOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState('');

  const reload = async () => {
    setStepOpen(false);
    setCurrentStep(undefined);
    await actionRef.current?.reload();
  };

  useEffect(() => {
    reload().then();
  }, [currentModuleId, currentProjectId]);

  useEffect(() => {
    queryPlayMethods().then(async ({ code, data }) => {
      if (code === 0 && data) {
        data.sort((a: any, b: any) => {
          if (a.label < b.label) return -1;
          if (a.label > b.label) return 1;
          return 0;
        });
        const methodEnum = data.reduce((acc, item) => {
          const { value, label, description } = item;
          const text = (
            <Tooltip title={description}>
              <span>{label}</span>
            </Tooltip>
          );
          return { ...acc, [value]: { text } };
        }, {});
        setMethodEnum(methodEnum);
      }
    });
  }, []);

  const fetchCommonStepPage = async (values: any) => {
    const { code, data } = await pagePlaySteps({
      ...values,
      module_id: currentModuleId,
      module_type: ModuleEnum.UI_STEP,
      is_common: true,
    });
    return pageData(code, data);
  };

  const remove_step = async (record: IPlayStepDetail) => {
    const { code, msg } = await removePlayStep({
      step_id: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const copy_step = async (record: IPlayStepDetail) => {
    const { code, msg } = await copyCommonPlayStep({
      step_id: record.id,
    });
    if (code === 0) {
      message.success(msg);
      await reload();
    }
  };

  const getMethodColor = (method: string) => {
    return methodColorMap[method] || 'default';
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
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
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

  const columns: ProColumns<IPlayStepDetail>[] = [
    {
      title: 'ID',
      dataIndex: 'uid',
      width: '10%',
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
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <Badge
            status={record.is_common ? 'success' : 'processing'}
            style={{ marginRight: 6 }}
          />
          {record.name}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
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
      title: '方法',
      dataIndex: 'method',
      valueEnum: { ...methodEnum },
      valueType: 'select',
      width: 140,
      render: (_, record) => (
        <Tag
          color={getMethodColor(record.method || '')}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {record.method?.toUpperCase() || '-'}
        </Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      valueType: 'text',
      editable: false,
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
      search: false,
      width: 180,
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
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            icon={<EyeOutlined />}
            label="详情"
            type="primary"
            onClick={() => {
              setCurrentStep(record);
              setDrawerTitle('步骤详情');
              setStepOpen(true);
            }}
          />
          <ActionButton
            icon={<CopyOutlined />}
            label="复制"
            type="success"
            onClick={() => copy_step(record)}
          />
          <Popconfirm
            title="确认删除？"
            description="删除后会影响被关联的用例！"
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => remove_step(record)}
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
            onClick={() => {
              setCurrentStep(record);
              setDataOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  const addStepButton = (
    <Button
      type="primary"
      hidden={!currentModuleId}
      onClick={() => {
        setCurrentStep(undefined);
        setDrawerTitle('添加共有步骤');
        setStepOpen(true);
      }}
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
      添加共有步骤
    </Button>
  );

  return (
    <>
      <MyDrawer name="关联用例" open={dataOpen} setOpen={setDataOpen}>
        <PlayCaseStepAss stepId={currentStep?.id} />
      </MyDrawer>
      <MyDrawer
        name={drawerTitle}
        width="auto"
        open={addStepOpen}
        setOpen={setStepOpen}
      >
        <PlayStepDetail
          step_detail={currentStep}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
          callback={reload}
        />
      </MyDrawer>
      <MyProTable
        persistenceKey={perKey}
        headerTitle="公共步骤列表"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        toolBarRender={() => [addStepButton]}
        request={fetchCommonStepPage}
      />
    </>
  );
};
export default Index;
