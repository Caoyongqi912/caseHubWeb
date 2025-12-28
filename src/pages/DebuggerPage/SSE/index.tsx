import { start_sse_task } from '@/api/base';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { useModel } from '@@/exports';
import { Button, Card } from 'antd';
import { useRef, useState } from 'react';

export default function TestSSE() {
  const [logs, setLogs] = useState<string[]>([]);
  const es = useRef<EventSource | null>(null);
  const { initialState } = useModel('@@initialState');

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, msg]);
  };

  const start = async () => {
    await start_sse_task();
  };

  const connect = () => {
    if (es.current) return;

    es.current = new EventSource(
      `http://localhost:5050/project/listen?user_id=${initialState?.currentUser?.uid}`,
    );
    console.log('链接SSE');

    es.current.onmessage = (e) => {
      log(e.data);
    };

    es.current.onerror = () => {
      es.current?.close();
      es.current = null;
      console.log('断开');
    };
  };

  const disconnect = () => {
    es.current?.close();
    es.current = null;
    log('手动断开');
  };

  return (
    <Card title="测试">
      <div style={{ marginBottom: 20 }}>
        <Button onClick={start} style={{ marginRight: 8 }}>
          开始任务
        </Button>
        <Button onClick={connect} style={{ marginRight: 8 }}>
          连接
        </Button>
        <Button onClick={disconnect}>断开</Button>
      </div>

      <div
        style={{
          height: 300,
          border: '1px solid #ddd',
          padding: 10,
          overflow: 'auto',
          background: '#f9f9f9',
        }}
      >
        <AceCodeEditor
          value={logs.join('\n')}
          height="100vh"
          _mode="json"
          readonly={true}
        />
        {logs.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              marginTop: 120,
            }}
          >
            点击按钮开始测试
          </div>
        )}
      </div>
    </Card>
  );
}
