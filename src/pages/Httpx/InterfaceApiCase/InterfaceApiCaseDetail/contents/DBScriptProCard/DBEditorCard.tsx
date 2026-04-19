import { tryDBScript } from '@/api/base/dbConfig';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import {
  DatabaseOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, message, Popover, Select, Space, Typography } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

const { Text, Paragraph } = Typography;

interface DBEditorCardProps {
  dbId?: number;
  dbOptions: { label: string; value: number }[];
  onDBChange: (value: number) => void;
  getSqlValue: () => string;
}

const DBEditorCard: FC<DBEditorCardProps> = ({
  dbId,
  dbOptions,
  onDBChange,
  getSqlValue,
}) => {
  const [localDBId, setLocalDBId] = useState<number | undefined>(dbId);
  const [open, setOpen] = useState(false);
  const [tryData, setTryData] = useState('');

  useEffect(() => {
    if (dbId) {
      setLocalDBId(dbId);
    }
  }, [dbId]);

  const handleDBChange = useCallback(
    (value: number) => {
      setLocalDBId(value);
      onDBChange(value);
    },
    [onDBChange],
  );

  const handleTry = useCallback(() => {
    const currentDBId = dbId ?? localDBId;
    if (!currentDBId) {
      message.error('请选择数据库');
      return;
    }
    const sqlValue = getSqlValue();
    if (!sqlValue) {
      message.warning('请输入 SQL 语句');
      return;
    }
    tryDBScript({ db_id: currentDBId, script: sqlValue }).then(
      ({ code, data }) => {
        if (code === 0) {
          setTryData(JSON.stringify(data, null, 2));
          setOpen(true);
        } else {
          message.error(data || '执行失败');
        }
      },
    );
  }, [dbId, localDBId, getSqlValue]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <MyDrawer name={'db'} open={open} setOpen={setOpen}>
        <AceCodeEditor
          value={tryData}
          readonly={true}
          _mode={'json'}
          height={'100vh'}
        />
      </MyDrawer>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Space size="middle" wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DatabaseOutlined style={{ color: '#9333ea', fontSize: '18px' }} />
            <Select
              placeholder="选择数据库"
              value={localDBId}
              options={dbOptions}
              style={{ minWidth: '180px' }}
              onChange={handleDBChange}
              dropdownStyle={{ borderRadius: '8px' }}
            />
          </div>
          <Popover
            placement="bottomLeft"
            content={
              <div style={{ maxWidth: '420px' }}>
                <Paragraph style={{ marginBottom: '12px', fontWeight: 600 }}>
                  SQL 使用指南
                </Paragraph>
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  <li style={{ marginBottom: '12px' }}>
                    <Text strong>仅支持一条SQL</Text>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Text strong>变量查询</Text>
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      <li>
                        <Text code>select name from table ...</Text>
                      </li>
                      <li>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          name 将作为变量名
                        </Text>
                      </li>
                    </ul>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Text strong>使用 as 定义别名</Text>
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      <li>
                        <Text code>
                          select username as u, password as p ...
                        </Text>
                      </li>
                      <li>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          u, p 将作为变量名
                        </Text>
                      </li>
                    </ul>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Text strong>支持上文变量</Text>
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      <li>
                        <Text
                          code
                        >{`select * from table where id = {'{{ID}}'}`}</Text>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Text type="warning">Oracle 用户注意 ⚠️</Text>
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      <li>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          字段名均为大写，设置变量名需大写
                        </Text>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            }
            title={null}
            trigger="click"
          >
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              style={{
                color: '#9333ea',
                background: 'rgba(147, 51, 234, 0.08)',
                borderRadius: '8px',
              }}
            >
              帮助
            </Button>
          </Popover>
        </Space>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleTry}
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          执行测试
        </Button>
      </div>
    </div>
  );
};

export default DBEditorCard;
