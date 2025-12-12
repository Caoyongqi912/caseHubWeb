import { page_aps_job, remove_aps_job } from '@/api/base/aps';
import MyProTable from '@/components/Table/MyProTable';
import ConfigForm from '@/pages/Httpx/Scheduler/ConfigForm';
import { IJob } from '@/pages/Project/types';
import { ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProCard,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

// 常量配置
const TRIGGER_CONFIG: any = {
  1: {
    label: '单次执行',
    getContent: (record: IJob) => record.job_execute_time,
    getFormattedContent: (record: IJob) => record.job_execute_time,
    icon: <ClockCircleOutlined />,
    primaryColor: '#1890ff',
    secondaryColor: '#e6f7ff',
    tertiaryColor: '#91d5ff',
    tooltip: '任务将在指定时间执行一次',
  },
  2: {
    label: '周期执行',
    getContent: (record: IJob) => record.job_execute_cron,
    getFormattedContent: (record: IJob) => record.job_execute_cron,
    icon: <SyncOutlined />,
    primaryColor: '#52c41a',
    secondaryColor: '#f6ffed',
    tertiaryColor: '#b7eb8f',
    tooltip: '任务将按照Cron表达式周期执行',
  },
  3: {
    label: '固定频率',
    getContent: (record: IJob) => record.job_execute_interval,
    getFormattedContent: (record: IJob) =>
      `${record.job_execute_interval} 小时`,
    icon: <FieldTimeOutlined />,
    primaryColor: '#fa8c16',
    secondaryColor: '#fff7e6',
    tertiaryColor: '#ffd591',
    tooltip: '任务将按照固定频率执行',
  },
};

const SchedulerTable: FC<SelfProps> = (props) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const { currentProjectId, currentModuleId, perKey } = props;
  const [modalVisit, setModalVisit] = useState(false);
  const [currentJob, setCurrentJob] = useState<IJob>();
  const columns: ProColumns<IJob>[] = [
    {
      title: '任务ID',
      dataIndex: 'uid',
      copyable: true,
      width: '10%',
    },
    {
      title: '任务名称',
      dataIndex: 'job_name',
      ellipsis: true,
      width: '10%',
    },
    {
      title: '任务类型',
      dataIndex: 'job_type',
      width: '10%',
      valueEnum: {
        1: {
          text: 'API',
        },
        2: {
          text: 'UI',
        },
      },
      render: (_, record) => (
        <Tag color={'blue'}>{record.job_type === 1 ? 'API' : 'UI'}</Tag>
      ),
    },
    {
      title: '执行信息',
      dataIndex: 'job_trigger_type',
      search: false,
      width: '20%',
      render: (_, record) => {
        const triggerType = record.job_trigger_type;
        const config = TRIGGER_CONFIG[triggerType] || TRIGGER_CONFIG[1];

        // 格式化下次执行时间
        const formatNextRunTime = (time: string) => {
          if (!time) return '暂无';
          const date = new Date(time);
          const now = new Date();
          // @ts-ignore
          const diffHours = Math.abs(date - now) / (1000 * 60 * 60);

          if (diffHours < 1) {
            return `${Math.round(diffHours * 60)}分钟后`;
          } else if (diffHours < 24) {
            return `${Math.round(diffHours)}小时后`;
          } else {
            return date.toLocaleDateString();
          }
        };

        return (
          <Tooltip title={config.tooltip}>
            <ProCard
              size="small"
              bodyStyle={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: config.secondaryColor,
                border: `1px solid ${config.primaryColor}20`,
              }}
              style={{
                border: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {/* 触发器类型和信息 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <Tag
                        color={config.primaryColor}
                        style={{
                          margin: 0,
                          borderRadius: '4px',
                          fontWeight: 500,
                          fontSize: '12px',
                        }}
                      >
                        {config.label}
                      </Tag>
                    </div>

                    <Text
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontFamily: triggerType === 2 ? 'monospace' : 'inherit',
                        color: '#333',
                        backgroundColor: 'white',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${config.primaryColor}30`,
                        lineHeight: '1.4',
                      }}
                    >
                      {config.getFormattedContent(record)}
                    </Text>
                  </div>
                </div>

                {/* 下次执行时间 - 作为独立区域显示 */}
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        color: config.primaryColor,
                        marginRight: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Text
                      type="secondary"
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      下次执行
                    </Text>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: '12px',
                        color: record.next_run_time
                          ? config.primaryColor
                          : '#999',
                      }}
                    >
                      {record.next_run_time
                        ? formatNextRunTime(record.next_run_time)
                        : '暂无计划'}
                    </Text>

                    {record.next_run_time && (
                      <Tag
                        color={config.primaryColor}
                        style={{
                          margin: 0,
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {new Date(record.next_run_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Tag>
                    )}
                  </div>

                  {record.next_run_time && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#999',
                        marginTop: '2px',
                      }}
                    >
                      {new Date(record.next_run_time).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Space>
            </ProCard>
          </Tooltip>
        );
      },
    },
    {
      title: '参数',
      dataIndex: 'job_kwargs',
      search: false,
      width: '20%',
      render: (text, record) => {
        // 处理参数数据
        const renderParams = () => {
          try {
            // 尝试解析参数
            let params = text;

            // 如果已经是字符串，尝试解析JSON
            if (typeof params === 'string') {
              params = JSON.parse(params);
            }

            // 如果是数组且格式为 [{key:xx, value:xx}, ...]
            if (Array.isArray(params) && params.length > 0) {
              return (
                <div
                  style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {params.map((item, index) => {
                    // 处理 {key:xx, value:xx} 格式
                    if (item && typeof item === 'object') {
                      // 如果有明确的 key 和 value 字段
                      if (item.key !== undefined && item.value !== undefined) {
                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '6px',
                              fontSize: '12px',
                              padding: '4px',
                              backgroundColor:
                                index % 2 === 0 ? 'white' : '#fafafa',
                              borderRadius: '4px',
                            }}
                          >
                            <span
                              style={{
                                color: '#722ed1',
                                minWidth: '70px',
                                padding: '2px 6px',
                                backgroundColor: '#f9f0ff',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: '500',
                                marginRight: '8px',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={String(item.key)}
                            >
                              {String(item.key).length > 8
                                ? `${String(item.key).substring(0, 8)}...`
                                : String(item.key)}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                color: '#333',
                                padding: '2px 8px',
                                backgroundColor: '#f0f5ff',
                                borderRadius: '3px',
                                fontSize: '11px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={String(item.value)}
                            >
                              {String(item.value)}
                            </span>
                          </div>
                        );
                      }
                      // 如果是普通对象，显示所有键值对
                      else {
                        return (
                          <div key={index} style={{ marginBottom: '8px' }}>
                            <div
                              style={{
                                fontSize: '10px',
                                color: '#8c8c8c',
                                marginBottom: '2px',
                                paddingLeft: '4px',
                              }}
                            >
                              参数组 {index + 1}
                            </div>
                            {Object.entries(item).map(([key, value]) => (
                              <div
                                key={key}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: '4px',
                                  fontSize: '12px',
                                  padding: '3px 6px',
                                  backgroundColor: '#fafafa',
                                  borderRadius: '3px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#666',
                                    minWidth: '50px',
                                    paddingRight: '6px',
                                    fontSize: '11px',
                                  }}
                                >
                                  {key}:
                                </span>
                                <span
                                  style={{
                                    flex: 1,
                                    color: '#333',
                                    fontSize: '11px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={String(value)}
                                >
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    }

                    // 如果不是对象，直接显示
                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#f6f6f6',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}
                      >
                        {String(item)}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // 如果是单个对象
            if (
              params &&
              typeof params === 'object' &&
              !Array.isArray(params)
            ) {
              const entries = Object.entries(params);
              if (entries.length === 0) {
                return null;
              }

              return (
                <div
                  style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {entries.map(([key, value], index) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '6px',
                        fontSize: '12px',
                        padding: '4px',
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        borderRadius: '4px',
                      }}
                    >
                      <span
                        style={{
                          color: '#722ed1',
                          minWidth: '70px',
                          padding: '2px 6px',
                          backgroundColor: '#f9f0ff',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '500',
                          marginRight: '8px',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={String(key)}
                      >
                        {String(key).length > 8
                          ? `${String(key).substring(0, 8)}...`
                          : String(key)}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: '#333',
                          padding: '2px 8px',
                          backgroundColor: '#f0f5ff',
                          borderRadius: '3px',
                          fontSize: '11px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={String(value)}
                      >
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            // 空值情况
            return null;
          } catch (error) {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                }}
              >
                <Text type={'secondary'}>无参数</Text>
              </div>
            );
          }
        };

        // 获取参数数量
        const getParamCount = () => {
          try {
            const params = typeof text === 'string' ? JSON.parse(text) : text;

            if (Array.isArray(params)) {
              // 如果是 [{key:xx, value:xx}, ...] 格式
              if (
                params.length > 0 &&
                params[0] &&
                params[0].key !== undefined
              ) {
                return `${params.length} 个参数`;
              }
              // 如果是普通数组
              return `${params.length} 个项`;
            } else if (params && typeof params === 'object') {
              return `${Object.keys(params).length} 个参数`;
            }
            return '0 个参数';
          } catch {
            return '参数信息';
          }
        };

        const paramsContent = renderParams();

        if (!paramsContent) {
          return (
            <ProCard
              size="small"
              bodyStyle={{
                padding: '16px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
              }}
              style={{
                border: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ color: '#bfbfbf', fontSize: '12px' }}>
                无参数配置
              </div>
            </ProCard>
          );
        }

        return (
          <ProCard
            size="small"
            bodyStyle={{
              padding: '12px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              maxHeight: '200px',
              overflow: 'hidden',
            }}
            style={{
              border: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {/* 标题区域 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                  }}
                >
                  {getParamCount()}
                </div>
              </div>
            </div>

            {/* 参数内容区域 */}
            <div
              style={{
                marginBottom: '8px',
              }}
            >
              {paramsContent}
            </div>

            {/* 查看更多按钮 */}
            {record.job_kwargs !== null && (
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: '8px',
                  borderTop: '1px dashed #f0f0f0',
                }}
              >
                <a
                  style={{
                    fontSize: '11px',
                    color: '#722ed1',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    try {
                      const params =
                        typeof text === 'string' ? JSON.parse(text) : text;
                      Modal.info({
                        title: '参数详情',
                        width: 600,
                        icon: null,
                        content: (
                          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                            <pre
                              style={{
                                backgroundColor: '#f6f8fa',
                                padding: '20px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                lineHeight: '1.6',
                              }}
                            >
                              {JSON.stringify(params, null, 2)}
                            </pre>
                          </div>
                        ),
                        okText: '关闭',
                        okType: 'default',
                      });
                    } catch (error) {
                      message.error('参数格式错误，无法查看详情');
                    }
                  }}
                >
                  <EyeOutlined
                    style={{ marginRight: '4px', fontSize: '11px' }}
                  />
                  查看完整参数
                </a>
              </div>
            )}
          </ProCard>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      render: (text, record) => (
        <Space>
          <a
            type="primary"
            onClick={() => {
              setCurrentJob(record);
              setModalVisit(true);
            }}
          >
            编辑
          </a>

          <a
            onClick={async () => {
              const { code, data } = await remove_aps_job({
                job_id: record.uid,
              });
              if (code === 0) {
                reloadTable();
              }
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    reloadTable();
  }, [currentModuleId, currentProjectId]);

  const reloadTable = () => {
    actionRef.current?.reload();
    setModalVisit(false);
  };

  const fetchJobData = useCallback(
    async (values: any) => {
      const { code, data } = await page_aps_job({
        ...values,
        module_type: ModuleEnum.JOB,
        module_id: currentModuleId,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );
  return (
    <div>
      <ModalForm
        size={'small'}
        title="Create New Form"
        open={modalVisit}
        submitter={false}
        onFinish={async () => {
          return true;
        }}
        onOpenChange={setModalVisit}
      >
        <ConfigForm
          currentJob={currentJob}
          callback={reloadTable}
          currentProjectId={currentProjectId}
          currentModuleId={currentModuleId}
        />
      </ModalForm>
      <MyProTable
        actionRef={actionRef}
        columns={columns}
        rowKey={'id'}
        request={fetchJobData}
        toolBarRender={() => [
          <Button
            hidden={currentModuleId === undefined}
            type="primary"
            onClick={() => {
              setCurrentJob(undefined);
              setModalVisit(true);
            }}
          >
            <PlusOutlined />
            添加任务
          </Button>,
        ]}
      />
    </div>
  );
};
export default SchedulerTable;
