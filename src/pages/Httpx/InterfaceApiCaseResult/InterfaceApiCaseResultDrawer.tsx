import { caseAPIResultDetail, runApiCaseIo } from '@/api/inter/interCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import CaseResult from '@/pages/Httpx/InterfaceApiCaseResult/CaseResult';
import InterfaceApiCaseResultBaseInfo from '@/pages/Httpx/InterfaceApiCaseResult/InterfaceApiCaseResultBaseInfo';
import { IInterfaceCaseResult } from '@/pages/Httpx/types';
import { useModel } from '@@/exports';
import {
  InfoCircleOutlined,
  MessageOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SelfProps {
  openStatus?: boolean;
  caseApiId?: string;
  env_id?: number;
  error_stop?: boolean;
  currentCaseResultId?: string | number;
}

const InterfaceApiCaseResultDrawer: FC<SelfProps> = ({
  currentCaseResultId,
  openStatus,
  caseApiId,
  env_id,
  error_stop,
}) => {
  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [caseResultId, setCaseResultId] = useState<string>();
  const [tabDisabled, setTabDisabled] = useState(true);
  const { initialState } = useModel('@@initialState');
  const [defaultActiveKey, setDefaultActiveKey] = useState('2');
  const [caseResultInfo, setCaseResultInfo] = useState<IInterfaceCaseResult>();

  useEffect(() => {
    if (currentCaseResultId) {
      setCaseResultId(currentCaseResultId as string);
    }
  }, [currentCaseResultId]);
  useEffect(() => {
    if (caseResultId) {
      setTabDisabled(false);
    }
  }, [caseResultId]);

  // 核心逻辑，处理socket连接相关，根据openStatus和caseApiId来建立或清理连接
  useEffect(() => {
    let socket: Socket | undefined;
    const createSocket = () => {
      socket = io('ws://localhost:5050/api_namespace', {
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
        if (caseApiId) {
          runApiCaseIo({
            case_id: caseApiId,
            env_id: env_id!,
            error_stop: error_stop!,
          }).then();
        }
      });

      socket.on('api_message', ({ code, data }) => {
        console.log('Received message:', data);
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

    if (openStatus && caseApiId) {
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
  }, [openStatus, caseApiId]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (caseResultId) {
        const { code, data } = await caseAPIResultDetail(caseResultId);
        if (code === 0 && !isCancelled) {
          setCaseResultInfo(data);
          const { interfaceLog } = data;
          if (interfaceLog) {
            setLogMessage(interfaceLog.split('\n'));
          } else {
            setLogMessage([]);
          }
        }
      }
    };
    fetchData().then((r) => {});
    return () => {
      isCancelled = true;
    };
  }, [caseResultId]);

  const items: TabsProps['items'] = [
    {
      label: '基本信息',
      key: '1',
      icon: <InfoCircleOutlined />,
      disabled: tabDisabled,
      children: (
        <InterfaceApiCaseResultBaseInfo caseResultInfo={caseResultInfo} />
      ),
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
      label: '步骤详情',
      key: '3',
      disabled: tabDisabled,
      icon: <OrderedListOutlined />,
      children: <CaseResult caseResultId={caseResultId} />,
    },
  ];
  return (
    <ProCard>
      <MyTabs
        items={items}
        tabPosition={'top'}
        defaultActiveKey={defaultActiveKey}
      />
    </ProCard>
  );
};

export default InterfaceApiCaseResultDrawer;
