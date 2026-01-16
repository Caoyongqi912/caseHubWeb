import {
  getDBContentInfo,
  updateCaseContent,
  updateCaseContentDBScript,
} from '@/api/inter/interCase';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import Handler from '@/components/DnDDraggable/handler';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IBeforeSQLExtract, IInterfaceCaseContent } from '@/pages/Httpx/types';
import {
  ConsoleSqlOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProCard,
} from '@ant-design/pro-components';
import {
  Button,
  Form,
  Input,
  message,
  Popover,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';

import { queryDBConfig, tryDBScript } from '@/api/base/dbConfig';
import MyDrawer from '@/components/MyDrawer';
import { IDBConfig } from '@/pages/Project/types';
import { ProColumns } from '@ant-design/pro-table/lib/typing';

const { Text, Paragraph } = Typography;

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  projectId?: number;
  callback?: () => void;
}

const ApidbCard: FC<Props> = (props) => {
  const [form] = Form.useForm();
  const timeoutRef = useRef<any>(null);

  const { step, id, caseId, caseContent, callback } = props;
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
  const [dataSource, setDatasource] = useState<any[]>([]);
  useEffect(() => {
    const { content_name, target_id } = caseContent;
    if (content_name) {
      setDBTextName(content_name);
      setShowDBInput(false);
    }
    getDBContentInfo(target_id).then(async ({ code, data }) => {
      const { db_id, sql_text, sql_extracts } = data;
      if (code === 0) {
        setCurrentDBId(db_id);
        setSqlValue(sql_text);
        setDatasource(sql_extracts);
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
  }, [caseContent]);

  useEffect(() => {
    if (sqlValue) {
      setCanTry(true);
    } else {
      setCanTry(false);
    }
  }, [sqlValue]);

  const columns: ProColumns<IBeforeSQLExtract>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: 'Key 必填',
          },
        ],
      },
    },
    {
      title: 'JsonPath表达',
      dataIndex: 'jp',
    },
    {
      title: 'Opt',
      valueType: 'option',
      fixed: 'right',
      render: (_, record, __, action) => {
        return [
          <a
            onClick={() => {
              console.log('edit', record.id);
              action?.startEditable?.(record.id);
            }}
          >
            编辑
          </a>,
        ];
      },
    },
  ];
  const DB_NAME = () => {
    if (dbTextName && !showDBInput) {
      return (
        <>
          <Text>{dbTextName}</Text>
          {showEditIcon && (
            <EditOutlined
              style={{ marginLeft: 10 }}
              onClick={(event) => {
                event.stopPropagation();
                setShowDBInput(true);
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
            if (e.target.value) setDBTextName(e.target.value);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onBlur={async () => await updateContentTitle(dbTextName)}
          onPressEnter={async () => await updateContentTitle(dbTextName)}
        />
      );
    }
  };

  const updateContentTitle = async (value: string | undefined) => {
    if (value) {
      const { code, data } = await updateCaseContent({
        id: caseContent.id,
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
        id: caseContent.target_id,
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
  return (
    <ProCard
      bodyStyle={{
        padding: 10,
      }}
      split={'horizontal'}
      bordered
      collapsible
      hoverable
      defaultCollapsed
      onMouseEnter={() => {
        setShowOption(true);
        setShowEditIcon(true);
      }}
      onMouseLeave={() => {
        setShowOption(false);
        setShowEditIcon(false);
      }}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      collapsibleIconRender={({}) => {
        return (
          <Space>
            <Handler id={id} step={step} />
            <Tag color={'purple-inverse'} icon={<ConsoleSqlOutlined />} />
            <div style={{ marginLeft: 10 }}>{DB_NAME()}</div>
          </Space>
        );
      }}
    >
      <ProCard
        title={
          <Select
            placeholder={'请选择数据库'}
            disabled={false}
            value={currentDBId}
            options={dbOptions}
            onChange={(value: number) => {
              setCurrentDBId(value);
              form.setFieldsValue({
                db_id: value,
              });
            }}
          />
        }
        subTitle={
          <Popover
            content={
              <Paragraph>
                <ul>
                  <li>
                    <Text>仅支持一条SQL</Text>
                  </li>
                  <li>
                    变量查询
                    <ul>
                      <li>
                        <Text code>select name form table .. </Text>
                      </li>
                      <li>
                        <Text>
                          name将被处理为变量名，对应的值是搜索返回的第一个
                        </Text>
                      </li>
                    </ul>
                  </li>
                  <li>
                    使用as
                    <ul>
                      <li>
                        <Text code>
                          select username as u,password as p form table ..{' '}
                        </Text>
                      </li>
                      <li>
                        <Text>
                          u,p 将被处理为变量名，对应的值是搜索返回的第一个
                        </Text>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul>
                  <li>
                    <Text strong>{'支持 上文 变量{{xx}} 写入SQL'}</Text>
                    <ul>
                      <li>
                        <Text code>
                          {'select * from table where id = {{ID}}'}
                        </Text>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul>
                  <li>
                    {'使用Oracle 注意⚠️'}
                    <li>
                      <Text>
                        Oracle
                        返回变量字段名皆为大写，设置变量名需大写，否则无法获取到变量值。
                      </Text>
                    </li>
                  </li>
                </ul>
              </Paragraph>
            }
          >
            <Text type="secondary">
              在SQL语法中设置与使用变量
              <QuestionCircleOutlined />
            </Text>
          </Popover>
        }
        extra={
          <Space>
            <>
              {canTry && (
                <Button
                  disabled={false}
                  type={'primary'}
                  onClick={async () => {
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
                  }}
                >
                  Try
                  <Popover content={'SQL 不支持变量的调试'}>
                    <QuestionCircleOutlined />
                  </Popover>
                </Button>
              )}
            </>
          </Space>
        }
      >
        {saveScript && <p style={{ color: 'grey' }}>已保存! </p>}
        <AceCodeEditor
          value={sqlValue}
          onChange={onDBScriptChange}
          height={'20vh'}
          _mode={'mysql'}
        />
      </ProCard>
      <ProCard
        extra={
          <Popover
            content={
              <Paragraph>
                <ul>
                  <li>
                    <Text code>
                      {`查询 SQL 语句返回结果一般为数组格式，如:
          [{ "id":1,"name":"jack"}]`}{' '}
                    </Text>
                    <ul>
                      <li>
                        <Text>
                          JSONPath $[0]表示读取第一条记录的整个对象值;$[0].name
                          表示读取第一条记录的 name 字段
                        </Text>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <Text code>
                      {'如果返回 一个单字符串 则不需要传递jsonpath '}
                    </Text>
                  </li>
                </ul>
              </Paragraph>
            }
          >
            <Text type={'secondary'}>
              提取结果到变量
              <QuestionCircleOutlined />
            </Text>
          </Popover>
        }
      >
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
                  id: caseContent.target_id,
                  sql_extracts: dataSource,
                });
              }
            },
            onDelete: async (key) => {
              const newData = dataSource.filter((item) => item.id !== key);
              setDatasource(newData);
              if (newData) {
                await updateCaseContentDBScript({
                  id: caseContent.target_id,
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
      <MyDrawer name={'db'} open={open} setOpen={setOpen}>
        <AceCodeEditor
          value={tryData}
          readonly={true}
          _mode={'json'}
          height={'100vh'}
        />
      </MyDrawer>
    </ProCard>
  );
};

export default ApidbCard;
