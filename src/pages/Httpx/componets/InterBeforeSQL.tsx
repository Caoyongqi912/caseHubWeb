import { queryAllDBConfigs, tryDBScript } from '@/api/base/dbConfig';
import { updateInterApiById } from '@/api/inter';
import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyDrawer from '@/components/MyDrawer';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IBeforeSQLExtract, IInterfaceAPI } from '@/pages/Httpx/types';
import { IDBConfig } from '@/pages/Project/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProCard,
  ProForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
  Button,
  FormInstance,
  message,
  Popover,
  Space,
  Typography,
} from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';

const { Paragraph, Text } = Typography;

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
}

/**
 * 公共样式配置
 */
const commonStyles = {
  button: {
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  buttonPrimary: {
    borderRadius: '6px',
    boxShadow: '0 2px 0 rgba(24, 144, 255, 0.2)',
    transition: 'all 0.3s ease',
  },
  popover: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxWidth: '500px',
  },
  popoverContent: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  listItem: {
    marginBottom: '8px',
    paddingLeft: '8px',
  },
  subListItem: {
    marginBottom: '4px',
    paddingLeft: '24px',
  },
  code: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: '#d63384',
  },
  label: {
    color: '#8c8c8c',
    fontSize: '12px',
    marginBottom: '4px',
  },
  warningText: {
    color: '#faad14',
    fontSize: '13px',
  },
  strongText: {
    color: '#262626',
    fontSize: '13px',
  },
  normalText: {
    color: '#595959',
    fontSize: '13px',
  },
  linkText: {
    color: '#1890ff',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  linkTextHover: {
    color: '#40a9ff',
    textDecoration: 'underline',
  },
};

/**
 * 接口前置SQL处理组件
 * 用于在接口执行前执行SQL查询，提取变量供接口使用
 */
const InterBeforeSql: FC<SelfProps> = (props) => {
  const { form } = props;
  const [sqlValue, setSqlValue] = useState<string>();
  const editorFormRef = useRef<EditableFormInstance<IBeforeSQLExtract>>();

  const [beforeSQLParamsEditableKeys, setBeforeSQLParamsEditableRowKeys] =
    useState<React.Key[]>();
  const [canTry, setCanTry] = useState<boolean>(false);
  const [beforeDbId, setBeforeDbId] = useState<number>();
  const [open, setOpen] = useState<boolean>(false);
  const [tryData, setTryData] = useState<any>();

  /**
   * 初始化SQL和数据库ID
   */
  useEffect(() => {
    const interface_before_sql = form.getFieldValue('interface_before_sql');
    const interface_before_db_id = form.getFieldValue('interface_before_db_id');
    if (interface_before_db_id) {
      setBeforeDbId(interface_before_db_id);
    }
    if (interface_before_sql) {
      setSqlValue(interface_before_sql);
    }
  }, []);

  /**
   * 根据SQL值控制Try按钮显示
   */
  useEffect(() => {
    if (sqlValue) {
      setCanTry(true);
    } else {
      setCanTry(false);
    }
  }, [sqlValue]);

  /**
   * 更新SQL配置
   */
  const updateSqlValue = async () => {
    const InterfaceId = form.getFieldValue('id');

    if (sqlValue && beforeDbId && InterfaceId) {
      const { code, msg } = await updateInterApiById({
        id: InterfaceId,
        interface_before_db_id: beforeDbId,
        interface_before_sql: sqlValue,
      });
      if (code === 0) {
        message.success(msg);
      }
    }
  };

  const removeSqlValue = async () => {
    const InterfaceId = form.getFieldValue('id');
    form.setFieldValue('interface_before_sql', null);
    form.setFieldValue('interface_before_db_id', null);
    setSqlValue('');
    const { code, msg } = await updateInterApiById({
      id: InterfaceId,
      interface_before_db_id: null,
      interface_before_sql: null,
    });
    if (code === 0) {
      message.success(msg);
    }
  };

  /**
   * 渲染SQL使用说明内容
   */
  const contentSQL = (
    <div style={{ ...commonStyles.popoverContent, overflowY: 'auto' }}>
      <Paragraph style={{ marginBottom: '12px' }}>
        <Text strong style={commonStyles.strongText}>
          SQL变量使用说明
        </Text>
      </Paragraph>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>• 仅支持一条SQL语句</Text>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>• 变量查询</Text>
        <div style={commonStyles.subListItem}>
          <Text code style={commonStyles.code}>
            select name from table ..
          </Text>
        </div>
        <div style={commonStyles.subListItem}>
          <Text style={commonStyles.normalText}>
            name将被处理为变量名，对应的值是查询返回的第一个值
          </Text>
        </div>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>• 使用as别名</Text>
        <div style={commonStyles.subListItem}>
          <Text code style={commonStyles.code}>
            select username as u, password as p from table ..
          </Text>
        </div>
        <div style={commonStyles.subListItem}>
          <Text style={commonStyles.normalText}>
            u, p将被处理为变量名，对应的值是查询返回的第一个值
          </Text>
        </div>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>
          • 支持上文变量{'{xx}'}写入SQL
        </Text>
        <div style={commonStyles.subListItem}>
          <Text code style={commonStyles.code}>
            select * from table where id = {'{ID}'}
          </Text>
        </div>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.warningText}>⚠️ 使用Oracle注意事项</Text>
        <div style={commonStyles.subListItem}>
          <Text style={commonStyles.normalText}>
            Oracle返回变量字段名皆为大写，设置变量名需大写，否则无法获取到变量值
          </Text>
        </div>
      </div>
    </div>
  );

  /**
   * 渲染JSONPath使用说明内容
   */
  const contentJP = (
    <div style={{ ...commonStyles.popoverContent, overflowY: 'auto' as const }}>
      <Paragraph style={{ marginBottom: '12px' }}>
        <Text strong style={commonStyles.strongText}>
          JSONPath表达式说明
        </Text>
      </Paragraph>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>
          • 查询SQL语句返回结果一般为数组格式，如：
        </Text>
        <div style={commonStyles.subListItem}>
          <Text code style={commonStyles.code}>
            {`   [{ "id":1,"name":"jack"}]`}
          </Text>
        </div>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>
          • $[0]表示读取第一条记录的整个对象值
        </Text>
        <div style={commonStyles.subListItem}>
          <Text style={commonStyles.normalText}>
            $[0].name表示读取第一条记录的name字段
          </Text>
        </div>
      </div>

      <div style={commonStyles.listItem}>
        <Text style={commonStyles.normalText}>
          • 如果返回一个单字符串则不需要传递jsonpath
        </Text>
      </div>
    </div>
  );
  /**
   * 表格列配置
   */
  const beforeColumns: ProColumns<IBeforeSQLExtract>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      width: 200,
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
      width: 300,
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record, __, action) => {
        return [
          <a
            key="edit"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
            style={commonStyles.linkText}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = commonStyles.linkTextHover.color;
              e.currentTarget.style.textDecoration =
                commonStyles.linkTextHover.textDecoration;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = commonStyles.linkText.color;
              e.currentTarget.style.textDecoration =
                commonStyles.linkText.textDecoration;
            }}
          >
            编辑
          </a>,
        ];
      },
    },
  ];

  return (
    <ProCard split={'horizontal'}>
      <MyDrawer name={'db'} open={open} setOpen={setOpen}>
        <AceCodeEditor
          value={tryData}
          readonly={true}
          _mode={'json'}
          height={'100vh'}
        />
      </MyDrawer>

      <ProCard
        title={
          <ProFormSelect
            disabled={false}
            noStyle={true}
            width={'md'}
            name={'interface_before_db_id'}
            required={true}
            placeholder="请选择数据库"
            request={async () => {
              const { code, data } = await queryAllDBConfigs();
              if (code === 0) {
                return data.map((item: IDBConfig) => {
                  return {
                    label: item.db_name,
                    value: item.id,
                  };
                });
              }
              return [];
            }}
            onChange={(value: number) => {
              setBeforeDbId(value);
              form.setFieldsValue({
                interface_before_db_id: value,
              });
            }}
          />
        }
        extra={
          <Space size="small">
            {canTry && (
              <Button
                disabled={false}
                type={'primary'}
                onClick={async () => {
                  if (sqlValue && beforeDbId) {
                    const { code, data } = await tryDBScript({
                      db_id: beforeDbId,
                      script: sqlValue,
                    });
                    if (code === 0) {
                      setTryData(JSON.stringify(data, null, 2));
                      setOpen(true);
                    }
                  }
                }}
                style={commonStyles.buttonPrimary}
              >
                Try
                <Popover
                  content={'SQL 不支持变量的调试'}
                  overlayStyle={commonStyles.popover}
                >
                  <QuestionCircleOutlined />
                </Popover>
              </Button>
            )}
            {canTry && (
              <Space size="small">
                <Button
                  disabled={false}
                  onClick={updateSqlValue}
                  style={commonStyles.button}
                >
                  提交
                </Button>
                <Button
                  disabled={false}
                  onClick={removeSqlValue}
                  style={commonStyles.button}
                >
                  删除
                </Button>
              </Space>
            )}
            <Popover content={contentSQL} overlayStyle={commonStyles.popover}>
              <Button type="primary" style={commonStyles.buttonPrimary}>
                在SQL语法中设置与使用变量
                <QuestionCircleOutlined />
              </Button>
            </Popover>
          </Space>
        }
      >
        <AceCodeEditor
          value={sqlValue}
          onChange={(value) => setSqlValue(value)}
          height={'20vh'}
          _mode={'mysql'}
        />
      </ProCard>

      <ProCard
        title="变量提取配置"
        extra={
          <Popover content={contentJP} overlayStyle={commonStyles.popover}>
            <Button type="primary" style={commonStyles.buttonPrimary}>
              提取结果到变量
              <QuestionCircleOutlined />
            </Button>
          </Popover>
        }
      >
        <ProForm.Item
          name={'interface_before_sql_extracts'}
          trigger={'onValuesChange'}
        >
          <EditableProTable<IBeforeSQLExtract>
            rowKey={'id'}
            search={false}
            editableFormRef={editorFormRef}
            columns={beforeColumns}
            scroll={{ x: 'max-content' }}
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
              onSave: async () => {
                await FormEditableOnValueChange(
                  form,
                  'interface_before_sql_extracts',
                );
              },
              onDelete: async (key) => {
                await FormEditableOnValueRemove(
                  form,
                  'interface_before_sql_extracts',
                  key,
                );
              },
              actionRender: (row, _, dom) => {
                return [dom.save, dom.delete, dom.cancel];
              },
            }}
          />
        </ProForm.Item>
      </ProCard>
    </ProCard>
  );
};

export default InterBeforeSql;
