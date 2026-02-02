import { allJobs, setSwitch } from '@/api/base';
import MyProTable from '@/components/Table/MyProTable';
import { queryData } from '@/utils/somefunc';
import { history } from '@@/core/history';
import {
  ApiOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  LayoutOutlined,
  OrderedListOutlined,
  PoweroffOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { message, Space, Switch, Tag, Tooltip } from 'antd';
import { useCallback, useRef } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>();

  const fetchJobs = useCallback(async () => {
    const { code, data } = await allJobs();
    return queryData(code, data);
  }, []);

  const setTaskSwitch = async (tag: string, jobId: string, flag: boolean) => {
    const { code } = await setSwitch({ tag: tag, uid: jobId, switch: flag });
    if (code === 0) {
      if (flag) {
        message.success('已重启任务');
      } else {
        message.success('已暂停任务');
      }
    }
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      title: '任务类型',
      dataIndex: 'tag',
      key: 'tag',
      fixed: 'left',
      width: 120,
      render: (text, record) => {
        const icon =
          record.tag === 'API' ? <ApiOutlined /> : <LayoutOutlined />;
        return (
          <Space size={8} align="center">
            {icon}
            <Tag
              color={record.tag === 'API' ? 'blue' : 'purple'}
              style={{
                borderRadius: '4px',
                fontSize: '13px',
                padding: '2px 8px',
              }}
            >
              {record.tag}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: 180,
      copyable: true,
      render: (text, record) => {
        let url = '';
        if (record.tag === 'API') {
          url = '/interface/task/detail/taskId=' + record.id;
        } else {
          url = '/ui/task/detail/taskId=' + record.id;
        }
        return (
          <Tooltip title="点击查看详情">
            <a
              onClick={() => {
                history.push(url);
              }}
              style={{
                color: '#1890ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <OrderedListOutlined style={{ fontSize: '14px' }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {record.uid}
              </span>
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
      render: (text, record) => {
        return (
          <Tooltip title={record.title}>
            <Space size={8} align="center">
              <AppstoreOutlined style={{ color: '#1890ff' }} />
              <Tag
                color={'geekblue'}
                style={{
                  borderRadius: '4px',
                  fontSize: '13px',
                  padding: '2px 8px',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {record.title}
              </Tag>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text) => {
        let color = 'blue';
        let icon = <SyncOutlined />;

        if (text === 'RUNNING') {
          color = 'green';
          icon = <SyncOutlined spin />;
        }

        return (
          <Space size={6} align="center">
            {icon}
            <Tag
              color={color}
              style={{
                borderRadius: '4px',
                fontSize: '13px',
                padding: '2px 8px',
              }}
            >
              {text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '运行状态',
      hideInSearch: true,
      dataIndex: 'switch',
      width: 120,
      render: (_, record) => {
        return (
          <Space size={8} align="center">
            <PoweroffOutlined
              style={{ color: record.switch ? '#52c41a' : '#bfbfbf' }}
            />
            <Tooltip title={record.switch ? '点击暂停任务' : '点击启动任务'}>
              <Switch
                checkedChildren="运行中"
                unCheckedChildren="已暂停"
                onClick={async (checked) => {
                  await setTaskSwitch(record.tag, record.uid, checked);
                }}
                checked={record.switch}
                size="default"
                style={{
                  fontSize: '12px',
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '下次执行',
      dataIndex: 'next',
      hideInSearch: true,
      width: 200,
      ellipsis: true,
      render: (text) => {
        return (
          <Tooltip title={text}>
            <Space size={6} align="center">
              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#595959',
                }}
              >
                {text}
              </span>
            </Space>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <ProCard
      title="任务管理"
      headerBordered={true}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
      }}
      bodyStyle={{
        padding: '24px',
      }}
    >
      <MyProTable
        search={false}
        // @ts-ignore
        actionRef={actionRef}
        rowKey={'id'}
        columns={columns}
        request={fetchJobs}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条任务记录`,
        }}
        tableStyle={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </ProCard>
  );
};

export default Index;
