import { tryInterScript } from '@/api/inter';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import { FormEditableOnValueChange } from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  FormInstance,
  List,
  Popover,
  Space,
  Splitter,
  Typography,
} from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Text, Title, Paragraph } = Typography;

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  tag: 'before_script' | 'after_script';
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

const InterScript: FC<SelfProps> = ({ form, tag }) => {
  const timeoutRef = useRef<any>(null);

  const [scriptData, setScriptData] = useState<any>();
  const [showButton, setShowButton] = useState(false);
  const [open, setOpen] = useState(false);
  const [tryData, setTryData] = useState<any>();
  const [isSaved, setIsSaved] = useState(false);

  const formSetter = (value: string | null) => {
    form.setFieldsValue({
      [tag === 'before_script' ? 'before_script' : 'after_script']: value,
    });
  };

  useEffect(() => {
    const script = form.getFieldValue(tag);
    if (script) {
      setScriptData(script);
    }
  }, []);

  useEffect(() => {
    if (scriptData) {
      setShowButton(true);
    }
  }, [scriptData]);
  const handleOnChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    setScriptData(value);
    formSetter(value);
    timeoutRef.current = setTimeout(async () => {
      await FormEditableOnValueChange(form, tag, false).then(() => {
        setIsSaved(true);
        // 2秒后设置回 false
        setTimeout(() => {
          setIsSaved(false);
        }, 2000);
      });
    }, 3000);
  };

  const useDemoScript = (value: string) => {
    if (scriptData) {
      handleOnChange(scriptData + '\n' + value);
    } else {
      handleOnChange(value);
    }
  };

  const Desc = (
    <ul>
      <li>
        <Text type={'secondary'}>
          like{' '}
          <Text type={'secondary'} code copyable>
            name = faker.name()
          </Text>
        </Text>
      </li>
      <li>
        <Text type={'secondary'}>
          所有{' '}
          <Text type={'secondary'} code>
            =
          </Text>
          前变量名 会被替换成变量
        </Text>
      </li>
      <li>
        <Text type={'secondary'}>非常规变量值将会被过滤</Text>
      </li>
    </ul>
  );
  return (
    <>
      <MyDrawer name={'script response'} open={open} setOpen={setOpen}>
        <AceCodeEditor value={tryData} height={'100vh'} _mode={'json'} />
      </MyDrawer>
      <ProCard
        title={
          <Title level={5}>
            <Popover content={Desc}>
              编写py脚本 设置变量{' '}
              <QuestionCircleOutlined style={{ marginLeft: 20 }} />
            </Popover>
          </Title>
        }
        headerBordered
        extra={
          <Space>
            {showButton && (
              <Button
                disabled={false}
                type={'primary'}
                onClick={async () => {
                  const { code, data } = await tryInterScript(scriptData);
                  if (code === 0) {
                    try {
                      setTryData(JSON.stringify(data, null, 2));
                    } catch (err) {
                      setTryData(data);
                    }
                    setOpen(true);
                  }
                }}
              >
                Try
              </Button>
            )}
          </Space>
        }
      >
        <Splitter style={{ height: '100%' }}>
          <Splitter.Panel
            collapsible={true}
            defaultSize="80%"
            min="80%"
            max="100%"
          >
            <ProCard style={{ height: '100%' }} bodyStyle={{ padding: 0 }}>
              {isSaved && <p style={{ color: 'grey' }}>已保存! </p>}
              <AceCodeEditor
                value={scriptData}
                onChange={handleOnChange}
                height={'60vh'}
                _mode={'python'}
              />
            </ProCard>
          </Splitter.Panel>
          <Splitter.Panel
            collapsible={true}
            defaultSize="20%"
            min="0%"
            max="20%"
          >
            <ProCard style={{ height: '500px', overflow: 'auto' }}>
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
          </Splitter.Panel>
        </Splitter>
      </ProCard>
    </>
  );
};

export default InterScript;
