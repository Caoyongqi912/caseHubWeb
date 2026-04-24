import { executeCaseByIO } from '@/api/play';
import { getPlayCaseResultDetail } from '@/api/play/playCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { IUIResult } from '@/pages/Play/componets/uiTypes';
import PlayCaseResultContents from '@/pages/Play/PlayResult/PlayCaseResultContents';
import PlayCaseResultInfo from '@/pages/Play/PlayResult/PlayCaseResultDetail/PlayCaseResultInfo';
import { useModel } from '@@/exports';
import {
  DatabaseOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SelfProps {
  openStatus?: boolean;
  caseId?: number;
  errorContinue?: boolean;
  resultId?: number;
}

const Index: FC<SelfProps> = (props) => {
  const { openStatus, caseId, errorContinue = true, resultId } = props;
  const { initialState } = useModel('@@initialState');
  const [logMessage, setLogMessage] = useState<string[]>([]);
  const [caseResultId, setCaseResultId] = useState<number>();
  const [defaultActiveKey, setDefaultActiveKey] = useState('2');
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
          executeCaseByIO({
            case_id: caseId,
            error_continue: errorContinue,
          }).then();
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
        }
      });
    }
  }, [caseResultId]);

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
      label: '步骤详情',
      key: 'step_detail',
      icon: <DatabaseOutlined />,
      disabled: tabDisabled,
      children: <PlayCaseResultContents play_case_id={caseResultId} />,
    },
  ];

  return (
    <ProCard
      bordered={false}
      tabs={{
        items: items,
        type: 'card',
        defaultActiveKey: defaultActiveKey,
      }}
    />
  );
};

export default Index;
