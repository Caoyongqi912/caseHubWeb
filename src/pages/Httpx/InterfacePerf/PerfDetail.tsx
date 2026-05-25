import { stopPerfInterApi } from '@/api/inter';
import { useModel, useParams } from '@@/exports';
import { Line, LineConfig } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { Button, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const { Title } = Typography;

const StatusColor: Record<string, string> = {
  READY: '#ffa500',
  SPAWNING: '#811546',
  CLEANUP: '#fadd1d',
  RUNNING: '#1dfa79',
  STOPPED: '#ff0000',
  STOPPING: '#fa1da2',
  MISSING: '#dcdbd3',
};
const PerfDetail = () => {
  const { perfId } = useParams<{ perfId: string }>();
  const { initialState } = useModel('@@initialState');
  const [rpsData, setRpsData] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('READY');
  const [currentRps, setCurrentRps] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [requestNums, setRequestNums] = useState<number>(0);
  const [totalAvgResponseTime, setTotalAvgResponseTime] = useState<number>(0);
  const [MaxResponseTime, setMaxResponseTime] = useState<number>(0);
  const [data05, setData05] = useState<any[]>([]);
  const [data95, setData95] = useState<any[]>([]);
  const [requestFailNum, setRequestFailNum] = useState<number>(0);

  const commonChartConfig: LineConfig = {
    data: [],
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    meta: {
      time: { alias: '时间' },
      value: { alias: '数值' },
    },
    legend: { position: 'top' },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ({ type }) => {
      if (type === 'RPS') return '#1dfa79';
      if (type === '05th percentile') return '#faad14';
      if (type === '95th percentile') return '#ff4d4f';
      return '#1890ff';
    },
  };
  const rpsConfig = useMemo(
    () => ({
      ...commonChartConfig,
      data: rpsData,
    }),
    [rpsData],
  );

  const responseConfig = useMemo(
    () => ({
      ...commonChartConfig,
      data: [...data05, ...data95],
    }),
    [data05, data95],
  );

  useEffect(() => {
    let socket: Socket | undefined;
    const createSocket = () => {
      socket = io('ws://localhost:5050/api_perf_ns', {
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
      });

      socket.on('api_message', (data) => {
        console.log(data);
        // Incrementally update the data
        setStatus(data.status);
        setCurrentRps(data.total_rps);
        setUserCount(data.user_count);
        setRequestNums(data.request_num);
        setRequestFailNum(data.request_fail_num);
        setTotalAvgResponseTime(data.total_avg_response_time[1]);
        setMaxResponseTime(data.max_response);
        const newRpsData = {
          time: data.current_rps[0],
          value: data.current_rps[1],
          type: 'RPS',
        };
        // 使用函数式更新，确保每次更新都是基于最新状态
        setRpsData((prev) => [...prev, newRpsData]);
        if (data.response_time_percentile_05) {
          const newData05 = {
            time: data.response_time_percentile_05[0],
            value: data.response_time_percentile_05[1],
            type: '05th percentile',
          };
          setData05((prev) => [...prev, newData05]);
        }
        if (data.response_time_percentile_095) {
          const newData95 = {
            time: data.response_time_percentile_095[0],
            value: data.response_time_percentile_095[1],
            type: '95th percentile',
          };
          setData95((prev) => [...prev, newData95]);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    };
    createSocket();
    const cleanSocket = () => {
      if (socket) {
        socket.off('push_message');
        socket.off('message');
        socket.disconnect();
      }
    };
    return () => {
      cleanSocket();
    };
  }, []);

  return (
    <ProCard ghost split={'horizontal'} gutter={16}>
      <ProCard
        title={'Status'}
        extra={
          <Button
            onClick={async () => {
              if (perfId) {
                await stopPerfInterApi({ taskId: perfId });
              }
            }}
          >
            Stop
          </Button>
        }
      >
        <Title
          level={3}
          style={{
            color: StatusColor[status],
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {status}
        </Title>
      </ProCard>
      <ProCard split={'vertical'}>
        <ProCard split={'vertical'}>
          <ProCard split={'horizontal'}>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>Request Num</Title>
                <Title
                  level={2}
                  style={{
                    color: '#c21ce7',
                    marginTop: 20,
                    textAlign: 'center',
                    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {requestNums}
                </Title>
              </Space>
            </ProCard>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>Request Fail Num</Title>
                <Title
                  level={2}
                  style={{
                    color: 'green',
                    marginTop: 20,
                    textAlign: 'center',
                    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {requestFailNum}
                </Title>
              </Space>
            </ProCard>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>Max Response Time (ms)</Title>
                <Title
                  level={2}
                  style={{
                    color: 'green',
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  {MaxResponseTime}
                </Title>
              </Space>
            </ProCard>
          </ProCard>
          <ProCard split={'horizontal'}>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>User Count</Title>
                <Title
                  level={2}
                  style={{
                    color: '#c21ce7',
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  {userCount}
                </Title>
              </Space>
            </ProCard>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>RPS</Title>
                <Title
                  level={2}
                  style={{
                    color: 'green',
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  {currentRps}
                </Title>
              </Space>
            </ProCard>
            <ProCard layout={'center'} hoverable>
              <Space orientation={'vertical'}>
                <Title level={5}>Avg Response Time (ms)</Title>
                <Title
                  level={2}
                  style={{
                    color: 'green',
                    marginTop: 20,
                    textAlign: 'center',
                  }}
                >
                  {totalAvgResponseTime}
                </Title>
              </Space>
            </ProCard>
          </ProCard>
        </ProCard>
        <ProCard title={'RPS'}>
          <Line {...rpsConfig} />
        </ProCard>
      </ProCard>
      <ProCard
        variant="outlined"
        style={{ marginTop: 20 }}
        title={'Response Time'}
      >
        <Line {...responseConfig} />
      </ProCard>
    </ProCard>
  );
};

export default PerfDetail;
