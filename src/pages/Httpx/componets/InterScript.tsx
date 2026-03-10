import { tryInterScript } from '@/api/inter';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import { FormEditableOnValueChange } from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import {
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Divider,
  FormInstance,
  List,
  Popover,
  Space,
  theme,
  Typography,
} from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Text, Title } = Typography;
const { useToken } = theme;

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
  const { token } = useToken();
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
      <MyDrawer name={'脚本执行结果'} open={open} setOpen={setOpen}>
        <AceCodeEditor value={tryData} height={'100vh'} _mode={'json'} />
      </MyDrawer>
      <div style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              编写 Python 脚本设置变量
            </Title>
            <Popover content={Desc}>
              <QuestionCircleOutlined style={{ color: token.colorPrimary }} />
            </Popover>
          </Space>
          {showButton && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
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
              style={{
                borderRadius: token.borderRadius,
              }}
            >
              执行测试
            </Button>
          )}
        </div>
        {isSaved && (
          <Alert
            message="已自动保存"
            type="success"
            icon={<SaveOutlined />}
            showIcon
            closable
            style={{ marginBottom: '12px' }}
          />
        )}
        <div style={{ display: 'flex', gap: '16px', height: '60vh' }}>
          <div style={{ flex: '1' }}>
            <div
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <AceCodeEditor
                value={scriptData}
                onChange={handleOnChange}
                height={'60vh'}
                _mode={'python'}
              />
            </div>
          </div>
          <div
            style={{
              width: '300px',
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              overflow: 'auto',
              background: token.colorBgContainer,
            }}
            id="scrollableDiv"
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${token.colorBorder}`,
                background: token.colorBgLayout,
              }}
            >
              <Text strong style={{ fontSize: '14px' }}>
                脚本示例
              </Text>
            </div>
            <InfiniteScroll
              dataLength={ScriptList.length}
              hasMore={false}
              endMessage={
                <Divider plain style={{ margin: '12px 0' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    没有更多示例了
                  </Text>
                </Divider>
              }
              scrollableTarget="scrollableDiv"
              loader={false}
              next={() => {}}
            >
              <List
                itemLayout="horizontal"
                dataSource={ScriptList}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 16px' }}>
                    <List.Item.Meta
                      title={
                        <Button
                          type="link"
                          onClick={() => useDemoScript(item.value)}
                          style={{ padding: 0, height: 'auto' }}
                        >
                          {item.label}
                        </Button>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {typeof item.desc === 'string'
                            ? item.desc
                            : item.desc}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterScript;
