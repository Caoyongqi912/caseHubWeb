import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import { ProCard } from '@ant-design/pro-components';
import { Divider, List } from 'antd';
import { FC, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface SelfProps {
  script_text?: string;
  onChange: (value: string) => void;
  isSave: boolean;
}

const ScriptList = [
  {
    label: '设置一个变量 1',
    value: 'key = 1',
    desc: 'python 写法',
  },
  {
    label: '设置一个变量 2',
    value: 'hub_variables_set("name","cyq")',
    desc: '内置函数写法',
  },
  {
    label: '删除一个变量',
    value: 'hub_variables_remove("name")',
    desc: '删除运行中的变量 只能删除hub_variables_set 的变量',
  },
  {
    label: '获取时间戳 （内置）',
    value: 't = ts()',
    desc: (
      <p>
        params t: +1s -1s +1m -1m +1h -1h 获取不同时间段的时间戳
        不传递为当前时间戳
      </p>
    ),
  },
  {
    label: '获取日期 （内置）',
    value: 'current_date = date()',
    desc: (
      <>
        <p>params t: +1d -1d +1m -1m +1y -1y 获取日期 不传递为当前日期</p>
        <p>params ft: 时间格式 默认 '%Y-%m-%d'</p>
      </>
    ),
  },
  {
    label: '发送一个请求',
    value:
      'response = hub_request(url="https://somehost/anything",method="get") \ndata=response.json()',
    desc: (
      <>
        <p>发送一个请求、使用内置requests</p>
        <p>返回 response 对象</p>
      </>
    ),
  },
  {
    label: 'faker 生成随机数据',
    value: 'name = hub_faker.pystr()',
    desc: 'return xxx',
  },
  {
    label: 'MD5 生成字符串',
    value: 'data = hub_md5(value="abc")',
    desc: 'return xxx',
  },
  {
    label: '生成本月一号',
    value: 'data = hub_month_begin()',
    desc: 'return 2025-05-01',
  },
  {
    label: '随机获取',
    value: 'data = hub_random([1,2,3])',
    desc: (
      <>
        <p>:params values:List[Any]</p>
        <p>:return value:Any</p>
      </>
    ),
  },
];

const ApiScriptContent: FC<SelfProps> = ({ script_text, isSave, onChange }) => {
  const [scriptData, setScriptData] = useState('');

  useEffect(() => {
    if (script_text) {
      setScriptData(script_text);
    }
  }, [script_text]);

  const useDemoScript = (value: string) => {
    if (scriptData) {
      setScriptData(scriptData + '\n' + value);
      onChange(scriptData + '\n' + value);
    } else {
      setScriptData(value);
      onChange(value);
    }
  };
  return (
    <ProCard
      style={{ height: '100%' }}
      bodyStyle={{ padding: 30 }}
      split="vertical"
    >
      <ProCard
        bordered
        title={isSave && <p style={{ color: 'grey' }}>已保存! </p>}
        colSpan={'80%'}
      >
        <AceCodeEditor
          value={script_text}
          onChange={onChange}
          height={'30vh'}
          _mode={'python'}
        />
      </ProCard>
      <ProCard style={{ height: '30vh', overflow: 'auto' }}>
        <InfiniteScroll
          dataLength={ScriptList.length}
          hasMore={false}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          scrollableTarget="scrollableDiv"
          loader={false}
          next={() => {}}
        >
          <List
            itemLayout="horizontal"
            dataSource={ScriptList}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <a onClick={() => useDemoScript(item.value)}>
                      {item.label}
                    </a>
                  }
                  description={item.desc || ''}
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </ProCard>
    </ProCard>
  );
};

export default ApiScriptContent;
