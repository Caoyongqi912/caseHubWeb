import { executeCaseByIO } from '@/api/play';
import { getPlayCaseResultDetail } from '@/api/play/playCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import { IUIResult } from '@/pages/Play/componets/uiTypes';
import PlayCaseResultInfo from '@/pages/Play/PlayResult/PlayCaseResultDetail/PlayCaseResultInfo';
import { useModel } from '@@/exports';
import {
  DatabaseOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { TabsProps, Tag } from 'antd';
import { FC, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SelfProps {
  openStatus?: boolean;
  caseId?: string;
  error_stop?: boolean;
  resultId?: string;
}

const Index: FC<SelfProps> = (props) => {
  const { openStatus, caseId, error_stop = true, resultId } = props;
  const { initialState } = useModel('@@initialState');
  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [caseResultId, setCaseResultId] = useState<string>();
  const [defaultActiveKey, setDefaultActiveKey] = useState('2');
  const [asserts, setAsserts] = useState<any[]>([]);
  const [vars, setVars] = useState<any[]>([]);
  const [currentResultDetail, setCurrentResultDetail] = useState<IUIResult>();
  const [tabDisabled, setTabDisabled] = useState(true);

  useEffect(() => {
    let socket: Socket | undefined;
    const createSocket = () => {
      socket = io('ws://localhost:5050/ui_namespace', {
        query: {
          clientId: initialState?.currentUser?.uid,
          EIO: 4,
        },
        upgrade: false, // 禁止降级
        transports: ['websocket'],
        path: '/socket.io',
      });

      socket.on('connect', () => {
        console.log('connect socket');
        if (caseId) {
          executeCaseByIO({ caseId: caseId, error_stop: error_stop }).then();
        }
      });

      socket.on('ui_message', ({ code, data }) => {
        console.log('Received message:', code, data);
        if (code === 0) {
          setLogMessage((prevMessages) => [...prevMessages, data]);
        } else {
          setCaseResultId(data.rId);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    };

    const cleanSocket = () => {
      if (socket) {
        socket.off('connect');
        socket.off('message');
        socket.disconnect();
      }
    };

    if (openStatus && caseId) {
      cleanSocket();
      createSocket();
    } else {
      setDefaultActiveKey('2');
      setLogMessage([]);
      cleanSocket();
    }

    return () => {
      cleanSocket();
    };
  }, [openStatus, caseId]);

  useEffect(() => {
    if (resultId) {
      setCaseResultId(resultId);
    }
  }, [resultId]);

  useEffect(() => {
    if (caseResultId) {
      setTabDisabled(false);
      getPlayCaseResultDetail(caseResultId).then(async ({ code, data }) => {
        if (code === 0) {
          setCurrentResultDetail(data);
          if (data.running_logs) {
            setLogMessage(data.running_logs.split('\n'));
          } else {
            setLogMessage([]);
          }
          if (data.asserts_info) {
            setAsserts(data.asserts_info);
            setVars(data.vars_info);
          }
        }
      });
    }
  }, [caseResultId]);

  const UIAssertColumns: ProColumns[] = [
    {
      title: '类型',
      valueType: 'text',
      dataIndex: 'type',
      fixed: 'left',
      width: '6%',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: '步骤',
      valueType: 'text',
      dataIndex: 'assert_name',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },

    {
      title: '断言描述',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: '预计结果',
      dataIndex: 'assert_expect',
      key: 'expect',
      valueType: 'textarea',
    },
    {
      title: '断言方法',
      dataIndex: 'assert_opt',
      render: (text) => <Tag color={'blue'}>{text}</Tag>,
    },
    {
      title: '实际结果',
      dataIndex: 'assert_actual',
      valueType: 'textarea',
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      key: 'result',
      fixed: 'right',
      render: (_, record) => (
        <Tag color={record.assert_result ? 'green' : 'volcano'}>
          {record.assert_result ? 'SUCCESS' : 'FAIL'}
        </Tag>
      ),
    },
  ];

  const UIVarsColumns: ProColumns[] = [
    {
      title: '步骤',
      valueType: 'text',
      dataIndex: 'step_name',
      fixed: 'left',
      width: '10%',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: '提取方式',
      valueType: 'text',
      dataIndex: 'extract_method',
      fixed: 'left',
      width: '10%',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
    {
      title: 'Key',
      dataIndex: 'key',
      valueType: 'text',
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },

    {
      title: 'Value',
      dataIndex: 'value',
      valueType: 'text',
      ellipsis: true,
      render: (text) => {
        return <Tag color={'blue'}>{text}</Tag>;
      },
    },
  ];

  const items: TabsProps['items'] = [
    {
      label: '基本信息',
      key: '1',
      icon: <InfoCircleOutlined />,
      disabled: tabDisabled,
      children: <PlayCaseResultInfo resultDetail={currentResultDetail} />,
    },
    {
      label: '请求日志',
      key: '2',
      icon: <MessageOutlined />,
      children: (
        <AceCodeEditor
          value={logMessage.join('\n')}
          height="100vh"
          _mode="json"
          readonly={true}
        />
      ),
    },
    {
      label: '断言详情',
      key: '3',
      icon: <OrderedListOutlined />,
      disabled: tabDisabled,
      children: (
        <ProTable
          search={false}
          toolBarRender={false}
          columns={UIAssertColumns}
          dataSource={asserts}
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      label: '变量提取',
      key: '4',
      icon: <DatabaseOutlined />,
      disabled: tabDisabled,
      children: (
        <ProTable
          search={false}
          toolBarRender={false}
          columns={UIVarsColumns}
          dataSource={vars}
        />
      ),
    },
  ];

  return (
    <ProCard bordered={true}>
      <MyTabs
        items={items}
        tabPosition={'top'}
        defaultActiveKey={defaultActiveKey}
      />
    </ProCard>
  );
};

export default Index;
