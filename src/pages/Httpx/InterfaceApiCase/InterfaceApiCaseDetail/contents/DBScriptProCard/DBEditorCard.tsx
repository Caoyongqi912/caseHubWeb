import { queryDBConfig } from '@/api/base/dbConfig';
import { updateCaseContentDBScript } from '@/api/inter/interCase';
import { IDBConfig } from '@/pages/Httpx/types';
import {
  DatabaseOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  message,
  Popover,
  Select,
  Space,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;
const { useToken } = theme;

interface DBEditorCardProps {
  caseContentId: number;
  currentDBId?: number;
  sqlValue?: string;
  dbOptions: { label: string; value: number }[];
  onDBChange: (value: number) => void;
  onSQLChange: (value: string) => void;
}

/**
 * 数据库SQL编辑器卡片组件
 * @description 包含数据库选择、SQL编辑器和执行测试功能
 */
const DBEditorCard: FC<DBEditorCardProps> = ({
  caseContentId,
  currentDBId,
  sqlValue,
  dbOptions,
  onDBChange,
  onSQLChange,
}) => {
  const { token } = useToken();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [saveScript, setSaveScript] = useState(false);
  const [canTry, setCanTry] = useState(false);
  const [options, setOptions] =
    useState<{ label: string; value: number }[]>(dbOptions);

  /**
   * 同步外部 dbOptions 到内部状态
   * @description 当外部 dbOptions 变化时更新内部状态
   */
  useEffect(() => {
    setOptions(dbOptions);
  }, [dbOptions]);

  /**
   * 监听 SQL 内容变化，更新 canTry 状态
   * @description 只有当 SQL 内容存在时才显示执行测试按钮
   */
  useEffect(() => {
    setCanTry(!!sqlValue);
  }, [sqlValue]);

  /**
   * 加载数据库配置选项
   * @description 获取所有可用的数据库配置列表，用于下拉选择
   */
  useEffect(() => {
    if (dbOptions.length === 0) {
      queryDBConfig().then(({ code, data }) => {
        if (code === 0 && data) {
          setOptions(
            data.map((item: IDBConfig) => ({
              label: item.db_name,
              value: item.id,
            })),
          );
        }
      });
    }
  }, [dbOptions.length]);

  /**
   * SQL内容变化处理（防抖保存）
   * @description SQL内容变化时自动保存到服务端，防抖时间为3秒
   * @param value - 新的SQL内容
   */
  const handleSQLChange = useCallback(
    (value: string) => {
      clearTimeout(timeoutRef.current);
      onSQLChange(value);
      if (!currentDBId) {
        message.error('请选择数据库');
        return;
      }
      timeoutRef.current = setTimeout(async () => {
        const { code } = await updateCaseContentDBScript({
          id: caseContentId,
          sql_text: value,
          db_id: currentDBId,
        });
        if (code === 0) {
          setSaveScript(true);
          setTimeout(() => setSaveScript(false), 2000);
        }
      }, 3000);
    },
    [caseContentId, currentDBId, onSQLChange],
  );

  /**
   * 执行测试按钮点击处理
   * @description 点击执行测试按钮，验证数据库选择后执行测试（功能开发中）
   */
  const handleTry = useCallback(() => {
    if (!currentDBId) {
      message.error('请选择数据库');
      return;
    }
    if (sqlValue && currentDBId) {
      message.info('执行测试功能开发中');
    }
  }, [currentDBId, sqlValue]);

  return (
    <div style={{ marginBottom: '16px' }}>
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
              value={currentDBId}
              options={options}
              style={{ minWidth: '180px' }}
              onChange={onDBChange}
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
        {canTry && (
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
        )}
      </div>
      {saveScript && (
        <Alert
          message="脚本已自动保存"
          type="success"
          icon={<SaveOutlined />}
          showIcon
          closable
          style={{
            marginTop: '12px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        />
      )}
    </div>
  );
};

export default DBEditorCard;
