import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IBeforeParams, IInterfaceAPI } from '@/pages/Httpx/types';
import {
  EditableFormInstance,
  EditableProTable,
  ProCard,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Tag, Typography } from 'antd';
import React, { FC, useRef, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
}

/**
 * 前置参数配置组件
 * 用于管理和编辑接口的前置参数，支持增删改查操作
 */
const InterBeforeParams: FC<SelfProps> = ({ form }) => {
  const [beforeParamsEditableKeys, setBeforeParamsEditableRowKeys] =
    useState<React.Key[]>();
  const editorFormRef = useRef<EditableFormInstance<IBeforeParams>>();

  /**
   * 表格列配置
   * 定义前置参数表格的显示列和渲染方式
   */
  const beforeColumns: ProColumns<IBeforeParams>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      width: 200,
      render: (_, record) => (
        <Text
          strong
          style={{
            color: '#262626',
            fontSize: '14px',
          }}
        >
          {record.key}
        </Text>
      ),
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
      title: 'Value',
      dataIndex: 'value',
      width: 300,
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: 'value 必填',
          },
        ],
      },
      render: (text, record) => {
        const isVariable = record?.value?.includes('{{$');
        return (
          <Tag
            color={isVariable ? 'orange' : 'blue'}
            style={{
              borderRadius: '4px',
              fontSize: '12px',
              padding: '2px 8px',
              fontFamily: 'monospace',
            }}
          >
            {text}
          </Tag>
        );
      },
      renderFormItem: (_, { record }) => {
        return (
          <ProFormText
            noStyle
            name={'value'}
            fieldProps={{
              placeholder: '请输入参数值',
              style: {
                fontFamily: 'monospace',
              },
              suffix: (
                <ApiVariableFunc
                  value={record?.value}
                  index={record?.id}
                  setValue={(index, newData) => {
                    editorFormRef.current?.setRowData?.(index, newData);
                    form.setFieldsValue({
                      before_params: form
                        .getFieldValue('before_params')
                        .map((item: any) =>
                          item.id === index
                            ? { ...item, value: newData.value }
                            : item,
                        ),
                    });
                  }}
                />
              ),
              value: record?.value,
            }}
          />
        );
      },
    },
    {
      title: 'Desc',
      dataIndex: 'desc',
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div
            style={{
              color: '#595959',
              fontSize: '13px',
            }}
          >
            {record.desc || '-'}
          </div>
        );
      },
    },
    {
      title: 'Opt',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record, __, action) => {
        return [
          <a
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
            style={{
              color: '#1890ff',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#40a9ff';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            编辑
          </a>,
        ];
      },
    },
  ];

  /**
   * 渲染前置参数配置卡片
   */
  return (
    <ProCard
      title="前置参数配置"
      headerBordered={true}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
        marginBottom: '16px',
      }}
      bodyStyle={{
        padding: '24px',
      }}
    >
      <ProForm.Item name={'before_params'} trigger={'onValuesChange'}>
        <EditableProTable<IBeforeParams>
          editableFormRef={editorFormRef}
          rowKey={'id'}
          search={false}
          columns={beforeColumns}
          scroll={{ x: 'max-content' }}
          options={{
            density: true,
            setting: true,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => ({
              id: Date.now(),
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys: beforeParamsEditableKeys,
            onDelete: async (key) => {
              await FormEditableOnValueRemove(form, 'before_params', key);
            },
            onChange: setBeforeParamsEditableRowKeys,
            onSave: async () => {
              await FormEditableOnValueChange(form, 'before_params');
            },
            actionRender: (row, _, dom) => {
              return [dom.save, dom.cancel, dom.delete];
            },
          }}
        />
      </ProForm.Item>
    </ProCard>
  );
};

export default InterBeforeParams;
