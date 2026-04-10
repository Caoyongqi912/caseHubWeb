import { updateCaseContentDBScript } from '@/api/inter/interCase';
import { IBeforeSQLExtract } from '@/pages/Httpx/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Popover, theme, Typography } from 'antd';
import { FC, useMemo, useRef } from 'react';

const { Text: TypographyText, Paragraph } = Typography;
const { useToken } = theme;

interface DBExtractTableProps {
  caseContentId: number;
  dataSource: IBeforeSQLExtract[];
  editableKeys?: React.Key[];
  onDataChange: (data: IBeforeSQLExtract[]) => void;
  onEditableKeysChange: (keys: React.Key[]) => void;
}

/**
 * 数据库变量提取表格组件
 * @description 用于配置SQL查询结果的变量提取规则，包含标题和可编辑表格
 */
const DBExtractTable: FC<DBExtractTableProps> = ({
  caseContentId,
  dataSource,
  editableKeys,
  onDataChange,
  onEditableKeysChange,
}) => {
  const { token } = useToken();
  const editorFormRef = useRef<EditableFormInstance<IBeforeSQLExtract>>();

  /**
   * 表格列定义
   * @description 配置变量提取表格的列，包括变量名和JsonPath表达式
   */
  const columns: ProColumns<IBeforeSQLExtract>[] = useMemo(
    () => [
      {
        title: '变量名',
        dataIndex: 'key',
        width: '40%',
        formItemProps: {
          required: true,
          rules: [{ required: true, message: '变量名必填' }],
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
        render: (_, record, __, action) => [
          <a
            key="edit"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
            style={{ color: '#9333ea' }}
          >
            编辑
          </a>,
        ],
      },
    ],
    [],
  );

  /**
   * 变量提取表格配置
   * @description 配置可编辑表格的新增、编辑、删除和保存行为
   */
  const editableTableConfig = useMemo(
    () => ({
      type: 'multiple' as const,
      editableKeys,
      onChange: onEditableKeysChange,
      onValuesChange: (
        _: IBeforeSQLExtract,
        recordList: IBeforeSQLExtract[],
      ) => {
        onDataChange(recordList);
      },
      onSave: async () => {
        if (dataSource) {
          await updateCaseContentDBScript({
            id: caseContentId,
            sql_extracts: dataSource,
          });
        }
      },
      onDelete: async (
        _key: unknown,
        row: IBeforeSQLExtract & { index?: number },
      ) => {
        const newData = dataSource.filter((item) => item.id !== row.id);
        onDataChange(newData);
        if (newData) {
          await updateCaseContentDBScript({
            id: caseContentId,
            sql_extracts: newData,
          });
        }
      },
      actionRender: (_: unknown, __: unknown, dom: unknown) => {
        const domObj = dom as {
          save?: unknown;
          delete?: unknown;
          cancel?: unknown;
        };
        return domObj.save && domObj.delete && domObj.cancel
          ? [domObj.save, domObj.delete, domObj.cancel]
          : [dom];
      },
    }),
    [
      editableKeys,
      dataSource,
      caseContentId,
      onDataChange,
      onEditableKeysChange,
    ],
  );

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${token.colorBorderSecondary}`,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TypographyText
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: token.colorText,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                width: '4px',
                height: '16px',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
            提取结果到变量
          </TypographyText>
        </div>
        <Popover
          placement="bottomLeft"
          content={
            <div style={{ maxWidth: '400px' }}>
              <Paragraph style={{ marginBottom: '12px', fontWeight: 600 }}>
                变量提取说明
              </Paragraph>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>
                  <TypographyText
                    code
                  >{`查询 SQL 返回结果一般为数组格式，如: [{"id":1,"name":"jack"}]`}</TypographyText>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    <li>
                      <TypographyText
                        type="secondary"
                        style={{ fontSize: '12px' }}
                      >
                        $ [0] 读取第一条记录的整个对象值
                      </TypographyText>
                    </li>
                    <li>
                      <TypographyText
                        type="secondary"
                        style={{ fontSize: '12px' }}
                      >
                        $ [0].name 读取第一条记录的 name 字段
                      </TypographyText>
                    </li>
                  </ul>
                </li>
                <li>
                  <TypographyText type="secondary" style={{ fontSize: '12px' }}>
                    如果返回单个字符串则不需要传递 jsonpath
                  </TypographyText>
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
      </div>
      <EditableProTable<IBeforeSQLExtract>
        rowKey={'id'}
        search={false}
        editableFormRef={editorFormRef}
        columns={columns}
        value={dataSource}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          record: () => ({ id: Date.now() }),
          creatorButtonText: '添加变量',
        }}
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        editable={editableTableConfig}
      />
    </div>
  );
};

export default DBExtractTable;
