import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import Handler from '@/components/DnDDraggable/handler';
import { CodeOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Divider,
  Input,
  List,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Text } = Typography;
const { useToken } = theme;

/**
 * 脚本内容信息接口
 */
export interface ScriptContentInfo {
  id: number;
  content_name?: string;
  script_text?: string;
}

/**
 * 更新脚本函数类型
 */
export type UpdateScriptFunc = (data: {
  id: number;
  script_text?: string;
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
  const { token } = useToken();
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
    <div style={{ padding: '16px' }}>
      {isSave && (
        <Alert
          message="已自动保存"
          type="success"
          icon={<SaveOutlined />}
          showIcon
          closable
          style={{ marginBottom: '12px' }}
        />
      )}
      <div style={{ display: 'flex', gap: '16px', height: '35vh' }}>
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
              value={script_text}
              onChange={onChange}
              height={'35vh'}
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
                        {typeof item.desc === 'string' ? item.desc : item.desc}
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
  );
};

/**
 * 脚本内容卡片组件
 * 用于显示和管理脚本步骤内容，支持Python脚本编辑和示例插入
 */
const ScriptContentCard: FC<Props> = (props) => {
  const { token } = useToken();
  const timeoutRef = useRef<any>(null);

  const {
    id,
    step,
    contentInfo,
    extra,
    onMouseEnter,
    onMouseLeave,
    updateScript,
  } = props;

  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showScriptInput, setShowScriptInput] = useState(true);
  const [scriptTextName, setScriptTextName] = useState<string>();
  const [scriptText, setScriptText] = useState<string>();
  const [saveScript, setSaveScript] = useState(false);

  useEffect(() => {
    const { content_name, script_text } = contentInfo;
    if (content_name) {
      setScriptTextName(content_name);
      setShowScriptInput(false);
    }
    if (script_text) {
      setScriptText(script_text);
    }
  }, [
    contentInfo.content_name,
    contentInfo.script_text,
    contentInfo.script_text,
  ]);

  const handleScriptOnChange = (value: string) => {
    clearTimeout(timeoutRef.current);
    setScriptText(value);
    timeoutRef.current = setTimeout(async () => {
      const updateData: any = {
        id: contentInfo.id,
        script_text: value,
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
        <Space size={8}>
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {scriptTextName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowScriptInput(true);
              }}
            />
          )}
        </Space>
      );
    } else {
      return (
        <Input
          style={{ width: '100%', maxWidth: '300px' }}
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
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: showOption
          ? `0 4px 12px ${token.colorPrimaryBg}`
          : `0 1px 3px ${token.colorBgLayout}`,
        transition: 'all 0.3s ease',
        borderColor: showOption ? token.colorPrimaryBorder : token.colorBorder,
      }}
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
          <Space size={8} align="center">
            <Handler id={id} step={step} />
            <Tag
              icon={<CodeOutlined />}
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #2563eb20',
                fontWeight: 600,
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: token.borderRadiusSM,
              }}
            >
              脚本
            </Tag>
            {SCRIPT()}
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
