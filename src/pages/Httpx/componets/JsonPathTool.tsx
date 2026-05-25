import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { ProCard } from '@ant-design/pro-components';
import { Button, Input, message, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
// @ts-ignore
import { ClearOutlined, ThunderboltOutlined } from '@ant-design/icons';
import jsonpath from 'jsonpath';

const JsonPathTool = () => {
  const [script, setScript] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [extractValue, setExtractValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 常用JSONPath表达式
  const commonExpressions = [
    { value: '$..*', label: '所有元素' },
    { value: '$.store.book[*].title', label: '所有书籍标题' },
    { value: '$..author', label: '所有作者' },
    { value: '$.store.*', label: 'store下所有内容' },
    { value: '$.store..price', label: '所有价格' },
    { value: '$..book[2]', label: '第三本书' },
    { value: '$..book[?(@.price < 10)]', label: '价格<10的书' },
  ];

  // 示例JSON数据
  const exampleJson = JSON.stringify(
    {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: 8.95,
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            price: 8.99,
          },
        ],
        bicycle: { color: 'red', price: 19.95 },
      },
    },
    null,
    2,
  );

  // 提取数据
  const extractData = async () => {
    if (!script || !jsonValue) {
      message.warning('请输入JSON数据和JSONPath表达式');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const jsonObj = JSON.parse(jsonValue);
      const extracted = jsonpath.query(jsonObj, script);

      if (extracted === undefined) {
        setExtractValue('');
        setError('未匹配到任何数据');
      } else {
        setExtractValue(JSON.stringify(extracted, null, 2));
      }
    } catch (e) {
      console.error('提取失败:', e);
      setError(e instanceof Error ? e.message : '提取数据时发生错误');
      setExtractValue('');
    } finally {
      setLoading(false);
    }
  };

  // 自动提取效果
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (script && jsonValue) {
        await extractData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [script, jsonValue]);

  // 加载示例数据
  const loadExample = async () => {
    setJsonValue(exampleJson);
    setScript('$.store.book[*].title');
    message.info('已加载示例数据');
  };

  // 格式化JSON
  const formatJson = async () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonValue), null, 2);
      setJsonValue(formatted);
      message.success('格式化成功');
    } catch (e) {
      message.error('JSON格式错误，无法格式化');
    }
  };

  // 清空所有内容
  const clearAll = () => {
    setJsonValue('');
    setScript('');
    setExtractValue('');
    setError('');
  };

  return (
    <ProCard
      title="JSONPath 提取工具"
      split="horizontal"
      variant="outlined"
      headerBordered
      extra={
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={loadExample}>
            示例数据
          </Button>
          <Button onClick={formatJson} disabled={!jsonValue}>
            格式化JSON
          </Button>
          <Button icon={<ClearOutlined />} danger onClick={clearAll}>
            清空
          </Button>
        </Space>
      }
    >
      <ProCard>
        <Space orientation="vertical" style={{ width: '100%' }}>
          <div>
            <Input
              placeholder="输入JSONPath表达式，如: $.data[0]"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              addonBefore={
                <Select
                  style={{ width: 150 }}
                  placeholder="常用表达式"
                  onChange={(value) => setScript(value)}
                  options={commonExpressions}
                />
              }
              addonAfter={
                <Button type="primary" onClick={extractData} loading={loading}>
                  提取
                </Button>
              }
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginTop: -12, marginBottom: 12 }}>
              {error}
            </div>
          )}
        </Space>
      </ProCard>

      <ProCard split="vertical">
        <ProCard title="JSON输入" headerBordered>
          <AceCodeEditor
            _mode="json"
            value={jsonValue}
            onChange={(value: string) => setJsonValue(value)}
            height="500px"
          />
        </ProCard>
        <ProCard title="提取结果" headerBordered>
          <AceCodeEditor
            _mode="json"
            value={extractValue}
            readonly={true}
            height="500px"
          />
        </ProCard>
      </ProCard>
    </ProCard>
  );
};

export default JsonPathTool;
