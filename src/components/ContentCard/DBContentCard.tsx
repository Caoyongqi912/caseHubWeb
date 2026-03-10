import {
  getDBContentInfo,
  queryDBConfig,
  tryDBScript,
} from '@/api/base/dbConfig';
import { updateCaseContentDBScript } from '@/api/inter/interCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import { IBeforeSQLExtract } from '@/pages/Httpx/types';
import { IDBConfig } from '@/pages/Project/types';
import {
  DatabaseOutlined,
  EditOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProCard,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  message,
  Popover,
  Select,
  Space,
  Tag,
  theme,
  Typography,
} from 'antd';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import Handler from '../DnDDraggable/handler';

const { Text, Paragraph } = Typography;
const { useToken } = theme;

/**
 * DB内容信息接口
 */
export interface DBContentInfo {
  id: number;
  content_name?: string;
  target_id: number;
}

/**
 * 更新内容标题函数类型
 */
export type UpdateContentTitleFunc = (data: {
  id: number;
  content_name?: string;
}) => Promise<any>;

/**
 * DB内容卡片组件Props
 */
interface Props {
  id: number;
  step: number;
  caseId: number;
  contentInfo: DBContentInfo;
  callback?: () => void;
  extra?: React.ReactNode;
  showExtra?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  updateContentTitle: UpdateContentTitleFunc;
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * 表格列定义
 */
const columns: ProColumns<IBeforeSQLExtract>[] = [
  {
    title: '变量名',
    dataIndex: 'key',
    width: '40%',
    formItemProps: {
      required: true,
      rules: [
        {
          required: true,
          message: '变量名必填',
        },
      ],
    },
  },
  {
    title: 'JsonPath 表达式',
    dataIndex: 'jp',
    width: '40%',
  },
  {
    title: '操作',
    valueType: 'option',
    width: '20%',
    fixed: 'right',
    render: (_, record, __, action) => {
      return [
        <a
          key="edit"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
      ];
    },
  },
];

/**
 * DB内容卡片组件
 * 用于显示和管理数据库步骤内容，支持SQL编辑、变量提取等功能
 */
const DBContentCard: FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { token } = useToken();
  const timeoutRef = useRef<any>(null);

  const {
    id,
    step,
    caseId,
    contentInfo,
    callback,
    extra,
    showExtra = true,
    onMouseEnter,
    onMouseLeave,
    updateContentTitle,
    onCollapse,
  } = props;

  const editorFormRef = useRef<EditableFormInstance<IBeforeSQLExtract>>();
  const [beforeSQLParamsEditableKeys, setBeforeSQLParamsEditableRowKeys] =
    useState<React.Key[]>();
  const [showOption, setShowOption] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showDBInput, setShowDBInput] = useState(true);
  const [dbTextName, setDBTextName] = useState<string>();
  const [sqlValue, setSqlValue] = useState<string>();
  const [canTry, setCanTry] = useState<boolean>(false);
  const [currentDBId, setCurrentDBId] = useState<number>();
  const [tryData, setTryData] = useState<any>();
  const [open, setOpen] = useState<boolean>(false);
  const [saveScript, setSaveScript] = useState(false);
  const [dbOptions, setDBOptions] = useState<
    {
      label: string;
      value: number;
    }[]
  >([]);
  const [dataSource, setDatasource] = useState<IBeforeSQLExtract[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const { content_name } = contentInfo;
    if (content_name) {
      setDBTextName(content_name);
      setShowDBInput(false);
    }
  }, [contentInfo.content_name]);

  const loadData = () => {
    if (hasLoaded || !contentInfo.target_id) return;

    getDBContentInfo(contentInfo.target_id).then(async ({ code, data }) => {
      const { db_id, sql_text, sql_extracts } = data;
      if (code === 0) {
        setCurrentDBId(db_id);
        setSqlValue(sql_text);
        setDatasource(sql_extracts || []);
        setHasLoaded(true);
      }
    });

    queryDBConfig().then(async ({ code, data }) => {
      if (code === 0) {
        setDBOptions(
          data.map((item: IDBConfig) => {
            return {
              label: item.db_name,
              value: item.id,
            };
          }),
        );
      }
    });
  };

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapse?.(collapsed);
    if (!collapsed) {
      loadData();
    }
  };

  useEffect(() => {
    if (sqlValue) {
      setCanTry(true);
    } else {
      setCanTry(false);
    }
  }, [sqlValue]);

  const handleUpdateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateContentTitle({
        id: contentInfo.id,
        content_name: value,
      });
      if (code === 0) {
        setDBTextName(data.content_name);
        setShowDBInput(false);
      }
    } else {
      setShowDBInput(true);
    }
  };

  const onDBScriptChange = async (value: string) => {
    clearTimeout(timeoutRef.current);
    setSqlValue(value);
    if (!currentDBId) {
      message.error('请选择数据库');
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      const { code } = await updateCaseContentDBScript({
        id: contentInfo.target_id,
        sql_text: value,
        db_id: currentDBId,
      });
      if (code === 0) {
        setSaveScript(true);
        setTimeout(() => {
          setSaveScript(false);
        }, 2000);
      }
    }, 3000);
  };

  const DB_NAME = useMemo(() => {
    if (dbTextName && !showDBInput) {
      return (
        <Space size={8}>
          <Text
            strong
            style={{
              fontSize: '14px',
              color: token.colorText,
            }}
          >
            {dbTextName}
          </Text>
          {showEditIcon && (
            <EditOutlined
              style={{
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowDBInput(true);
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
            if (e.target.value) setDBTextName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await handleUpdateContentTitle(dbTextName)}
          onPressEnter={async () => await handleUpdateContentTitle(dbTextName)}
        />
      );
    }
  }, [dbTextName, showDBInput, showEditIcon, token]);

  const handleTry = async () => {
    if (!currentDBId) {
      message.error('请选择数据库');
      return;
    }
    if (sqlValue && currentDBId) {
      const { code, data } = await tryDBScript({
        db_id: currentDBId,
        script: sqlValue,
      });
      if (code === 0) {
        setTryData(JSON.stringify(data, null, 2));
        setOpen(true);
      }
    }
  };

  return (
    <>
      <ProCard
        bodyStyle={{
          padding: 10,
        }}
        split={'horizontal'}
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
          borderColor: showOption
            ? token.colorPrimaryBorder
            : token.colorBorder,
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
        onCollapse={handleCollapse}
        collapsibleIconRender={({}) => {
          return (
            <Space size={8} align="center">
              <Handler id={id} step={step} />
              <Tag
                icon={<DatabaseOutlined />}
                style={{
                  background: '#f3e8ff',
                  color: '#9333ea',
                  border: '1px solid #9333ea20',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: token.borderRadiusSM,
                }}
              >
                DB
              </Tag>
              {DB_NAME}
            </Space>
          );
        }}
      >
        <ProCard
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Space size="middle">
              <Select
                placeholder={'请选择数据库'}
                disabled={false}
                value={currentDBId}
                options={dbOptions}
                style={{ minWidth: '200px' }}
                onChange={(value: number) => {
                  setCurrentDBId(value);
                  form.setFieldsValue({
                    db_id: value,
                  });
                }}
              />
              <Popover
                content={
                  <Paragraph style={{ maxWidth: '400px' }}>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      <li>
                        <Text strong>仅支持一条SQL</Text>
                      </li>
                      <li>
                        变量查询
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>
                            <Text code>select name from table ...</Text>
                          </li>
                          <li>
                            <Text type="secondary">
                              name将被处理为变量名，对应的值是搜索返回的第一个
                            </Text>
                          </li>
                        </ul>
                      </li>
                      <li>
                        使用 as
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>
                            <Text code>
                              select username as u, password as p from table ...
                            </Text>
                          </li>
                          <li>
                            <Text type="secondary">
                              u, p 将被处理为变量名，对应的值是搜索返回的第一个
                            </Text>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Text strong>支持上文变量 {'{{xx}}'} 写入SQL</Text>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>
                            <Text code>
                              select * from table where id = {'{{ID}}'}
                            </Text>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Text type="warning">使用 Oracle 注意⚠️</Text>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>
                            <Text type="secondary">
                              Oracle
                              返回变量字段名皆为大写，设置变量名需大写，否则无法获取到变量值
                            </Text>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </Paragraph>
                }
              >
                <Button type="link" icon={<QuestionCircleOutlined />}>
                  帮助
                </Button>
              </Popover>
            </Space>
            {canTry && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleTry}
              >
                执行测试
              </Button>
            )}
          </div>
          {saveScript && (
            <Alert
              message="已自动保存"
              type="success"
              icon={<SaveOutlined />}
              showIcon
              closable
              style={{ marginBottom: '12px' }}
            />
          )}
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              overflow: 'hidden',
            }}
          >
            <AceCodeEditor
              value={sqlValue}
              onChange={onDBScriptChange}
              height={'25vh'}
              _mode={'mysql'}
            />
          </div>
        </ProCard>
        <Divider style={{ margin: '16px 0' }} />
        <ProCard
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <Text strong style={{ fontSize: '14px' }}>
              提取结果到变量
            </Text>
            <Popover
              content={
                <Paragraph style={{ maxWidth: '400px' }}>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>
                      <Text code>
                        {`查询 SQL 语句返回结果一般为数组格式，如: [{"id":1,"name":"jack"}]`}
                      </Text>
                      <ul style={{ paddingLeft: '20px' }}>
                        <li>
                          <Text type="secondary">
                            JSONPath: $[0]
                            表示读取第一条记录的整个对象值；$[0].name
                            表示读取第一条记录的 name 字段
                          </Text>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Text type="secondary">
                        如果返回一个单字符串则不需要传递 jsonpath
                      </Text>
                    </li>
                  </ul>
                </Paragraph>
              }
            >
              <Button type="link" icon={<QuestionCircleOutlined />}>
                帮助
              </Button>
            </Popover>
          </div>
          <EditableProTable<IBeforeSQLExtract>
            rowKey={'id'}
            search={false}
            editableFormRef={editorFormRef}
            columns={columns}
            value={dataSource}
            recordCreatorProps={{
              newRecordType: 'dataSource',
              record: () => ({
                id: Date.now(),
              }),
              creatorButtonText: '添加变量提取',
            }}
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
            }}
            editable={{
              type: 'multiple',
              editableKeys: beforeSQLParamsEditableKeys,
              onChange: setBeforeSQLParamsEditableRowKeys,
              onValuesChange: async (_, recordList) => {
                setDatasource(recordList);
              },
              onSave: async () => {
                if (dataSource) {
                  await updateCaseContentDBScript({
                    id: contentInfo.target_id,
                    sql_extracts: dataSource,
                  });
                }
              },
              onDelete: async (key) => {
                const newData = dataSource.filter((item) => item.id !== key);
                setDatasource(newData);
                if (newData) {
                  await updateCaseContentDBScript({
                    id: contentInfo.target_id,
                    sql_extracts: newData,
                  });
                }
              },
              actionRender: (__, _, dom) => {
                return [dom.save, dom.delete, dom.cancel];
              },
            }}
          />
        </ProCard>
      </ProCard>
      <MyDrawer name={'db'} open={open} setOpen={setOpen}>
        <AceCodeEditor
          value={tryData}
          readonly={true}
          _mode={'json'}
          height={'100vh'}
        />
      </MyDrawer>
    </>
  );
};

export default DBContentCard;
