import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import Handler from '@/components/DnDDraggable/handler';
import { EditOutlined, PythonOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Divider, Input, List, Space, Tag, Typography } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Text } = Typography;

/**
 * 脚本内容信息接口
 */
export interface ScriptContentInfo {
  id: number;
  content_name?: string;
  script_text?: string;
  api_script_text?: string;
}

/**
 * 更新脚本函数类型
 */
export type UpdateScriptFunc = (data: {
  id: number;
  script_text?: string;
  api_script_text?: string;
  content_name?: string;
}) => Promise<any>;

/**
 * 脚本内容卡片组件Props
 */
interface Props {
  id: number;
  step: number;
  caseId: number;
  contentInfo: ScriptContentInfo;
  callback?: () => void;
  extra?: React.ReactNode;
  showExtra?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  updateScript: UpdateScriptFunc;
  scriptTextKey: 'script_text' | 'api_script_text';
}

/**
 * 脚本示例列表
 */
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

/**
 * 脚本内容子组件Props
 */
interface ScriptContentChildProps {
  script_text?: string;
  onChange: (value: string) => void;
  isSave: boolean;
}

/**
 * 脚本内容子组件
 * 显示代码编辑器和示例列表
 */
const ScriptContentChild: FC<ScriptContentChildProps> = ({
  script_text,
  onChange,
  isSave,
}) => {
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

/**
 * 脚本内容卡片组件
 * 用于显示和管理脚本步骤内容，支持Python脚本编辑和示例插入
 */
const ScriptContentCard: FC<Props> = (props) => {
  const timeoutRef = useRef<any>(null);

  const {
    id,
    step,
    contentInfo,
    extra,
    onMouseEnter,
    onMouseLeave,
    updateScript,
    scriptTextKey,
  } = props;

  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showScriptInput, setShowScriptInput] = useState(true);
  const [scriptTextName, setScriptTextName] = useState<string>();
  const [scriptText, setScriptText] = useState<string>();
  const [saveScript, setSaveScript] = useState(false);

  useEffect(() => {
    const { content_name, script_text, api_script_text } = contentInfo;
    if (content_name) {
      setScriptTextName(content_name);
      setShowScriptInput(false);
    }
    if (scriptTextKey === 'api_script_text' && api_script_text) {
      setScriptText(api_script_text);
    } else if (scriptTextKey === 'script_text' && script_text) {
      setScriptText(script_text);
    }
  }, [
    contentInfo.content_name,
    contentInfo.script_text,
    contentInfo.api_script_text,
    scriptTextKey,
  ]);

  const handleScriptOnChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    setScriptText(value);
    timeoutRef.current = setTimeout(async () => {
      const updateData: any = {
        id: contentInfo.id,
        [scriptTextKey]: value,
      };
      const { code } = await updateScript(updateData);
      if (code === 0) {
        setSaveScript(true);
        setTimeout(() => {
          setSaveScript(false);
        }, 2000);
      }
    }, 3000);
  };

  const handleUpdateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateScript({
        id: contentInfo.id,
        content_name: value,
      });
      if (code === 0) {
        setScriptTextName(data.content_name);
        setShowScriptInput(false);
      }
    } else {
      setShowScriptInput(true);
    }
  };

  const SCRIPT = () => {
    if (scriptTextName && !showScriptInput) {
      return (
        <>
          <Text>{scriptTextName}</Text>
          {showEditIcon && (
            <EditOutlined
              style={{ marginLeft: 10 }}
              onClick={(event) => {
                event.stopPropagation();
                setShowScriptInput(true);
              }}
            />
          )}
        </>
      );
    } else {
      return (
        <Input
          style={{ width: '100%' }}
          variant={'outlined'}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.value) setScriptTextName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await handleUpdateContentTitle(scriptTextName)}
          onPressEnter={async () =>
            await handleUpdateContentTitle(scriptTextName)
          }
        />
      );
    }
  };

  return (
    <ProCard
      bordered
      collapsible
      hoverable
      defaultCollapsed
      extra={extra}
      onMouseEnter={() => {
        setShowOption(true);
        setShowEditIcon(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setShowOption(false);
        setShowEditIcon(false);
        onMouseLeave?.();
      }}
      collapsibleIconRender={() => {
        return (
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'geekblue-inverse'} icon={<PythonOutlined />} />
            <Tag color={'geekblue-inverse'}>脚本</Tag>
            <div style={{ marginLeft: 10 }}>{SCRIPT()}</div>
          </Space>
        );
      }}
    >
      <ScriptContentChild
        script_text={scriptText}
        onChange={handleScriptOnChange}
        isSave={saveScript}
      />
    </ProCard>
  );
};

export default ScriptContentCard;
