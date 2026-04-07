import {
  pageInterCaseResult,
  removeCaseAPIResult,
  removeCaseAPIResults,
} from '@/api/inter/interCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import InterfaceApiCaseResultDrawer from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultDrawer';
import { IInterfaceCaseResult } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import {
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
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
  apiCaseId?: number | string;
  taskResultId?: number | string;
  reload?: number;
}

const InterfaceApiCaseResultTable: FC<SelfProps> = (props) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const { apiCaseId, taskResultId } = props;
  const [open, setOpen] = useState(false);
  const [currentCaseResultId, setCurrentCaseResultId] = useState<number>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [failOnly, setFailOnly] = useState(false);

  useEffect(() => {
    if (failOnly) {
      setDataSource(dataSource.filter((item) => item.result === 'ERROR'));
    } else {
      actionRef.current?.reload();
    }
  }, [failOnly]);

  useEffect(() => {
    if (props.reload) {
      actionRef.current?.reload();
    }
  }, [props.reload]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        sort: sort,
      };
      searchData.interfaceCaseID = apiCaseId ? apiCaseId : undefined;
      searchData.interface_task_result_Id = taskResultId
        ? taskResultId
        : undefined;
      const { code, data } = await pageInterCaseResult(searchData);
      setDataSource(data.items);
      return pageData(code, data);
    },
    [apiCaseId, taskResultId],
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
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
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
      userTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 12,
        backgroundColor: token.colorWarningBg,
        color: token.colorWarningText,
        border: `1px solid ${token.colorWarningBorder}`,
      },
      timeTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 6,
        backgroundColor: token.colorInfoBg,
        color: token.colorInfo,
        border: `1px solid ${token.colorInfoBorder}`,
        fontFamily: 'monospace',
      },
      clearBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorErrorBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

  const columns: ProColumns<IInterfaceCaseResult>[] = [
    {
      title: '执行用例',
      dataIndex: 'interfaceCaseName',
      key: 'interfaceCaseName',
      ellipsis: true,
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <PlayCircleOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interfaceCaseName}
        </Tag>
      ),
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      key: 'result',
      valueType: 'select',
      width: 100,
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag
          color={record.result === 'SUCCESS' ? 'success' : 'error'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {record.result === 'SUCCESS' ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.result}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      dataIndex: 'progress',
      width: 150,
      valueType: (item) => ({
        type: 'progress',
        status: item.status !== 'OVER' ? 'active' : 'success',
      }),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueEnum: {
        RUNNING: { text: '运行中', status: 'Processing' },
        OVER: { text: '完成', status: 'Success' },
      },
      render: (_, record) => (
        <Tag
          color={record.status === 'RUNNING' ? 'processing' : 'success'}
          style={{ borderRadius: 6, fontWeight: 500, padding: '4px 12px' }}
        >
          {record.status === 'RUNNING' ? '运行中' : '完成'}
        </Tag>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starterId',
      key: 'starterId',
      valueType: 'select',
      width: 120,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => (
        <Tag style={styles.userTag}>
          <UserOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.starterName}
        </Tag>
      ),
    },
    {
      title: '执行时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      key: 'startTime',
      width: 180,
      render: (_, record) => (
        <Tag style={styles.timeTag}>
          <ScheduleOutlined style={{ marginRight: 4, opacity: 0.6 }} />
          {record.create_time}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'OVER' ? (
            <>
              <ActionButton
                icon={<EyeOutlined />}
                label="详情"
                type="primary"
                onClick={() => {
                  setCurrentCaseResultId(record.id);
                  setOpen(true);
                }}
              />
              {!taskResultId ? (
                <Popconfirm
                  title="确认删除？"
                  description="删除后数据将无法恢复"
                  okText="确认删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    const { code, msg } = await removeCaseAPIResult(record.uid);
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
              ) : null}
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  const removeCaseResult = async (caseResultUid: string) => {
    const { code, msg } = await removeCaseAPIResult(caseResultUid);
    if (code === 0) {
      message.success(msg);
      actionRef.current?.reload();
    }
  };

  const removeCaseResults = async () => {
    if (apiCaseId) {
      const { code, msg } = await removeCaseAPIResults(apiCaseId);
      if (code === 0) {
        message.success(msg);
        actionRef.current?.reload();
      }
    }
  };

  const toolBar = (
    <>
      {taskResultId ? (
        <Button
          type="primary"
          style={styles.clearBtn}
          icon={<FilterOutlined />}
          onClick={() => setFailOnly(!failOnly)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
          }}
        >
          {failOnly ? '查看全部' : '只看失败'}
        </Button>
      ) : (
        <Space>
          <Button
            type="primary"
            danger
            style={styles.clearBtn}
            icon={<ClearOutlined />}
            onClick={removeCaseResults}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorErrorBg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorErrorBg}`;
            }}
          >
            Clear All
          </Button>
        </Space>
      )}
    </>
  );

  return (
    <>
      <MyDrawer width="80%" open={open} setOpen={setOpen}>
        <InterfaceApiCaseResultDrawer
          currentCaseResultId={currentCaseResultId}
        />
      </MyDrawer>

      <MyProTable
        toolBarRender={() => [toolBar]}
        rowKey="uid"
        dataSource={dataSource}
        actionRef={actionRef}
        request={fetchResults}
        search={false}
        columns={columns}
      />
    </>
  );
};

export default InterfaceApiCaseResultTable;
