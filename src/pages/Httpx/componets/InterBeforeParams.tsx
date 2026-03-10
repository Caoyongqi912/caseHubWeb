import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IBeforeParams, IInterfaceAPI } from '@/pages/Httpx/types';
import {
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Tag, theme, Typography } from 'antd';
import React, { FC, useRef, useState } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
}

/**
 * 前置参数配置组件
 * 用于管理和编辑接口的前置参数，支持增删改查操作
 */
const InterBeforeParams: FC<SelfProps> = ({ form }) => {
  const { token } = useToken();
  const [beforeParamsEditableKeys, setBeforeParamsEditableRowKeys] =
    useState<React.Key[]>();
  const editorFormRef = useRef<EditableFormInstance<IBeforeParams>>();

  /**
   * 表格列配置
   * 定义前置参数表格的显示列和渲染方式
   */
  const beforeColumns: ProColumns<IBeforeParams>[] = [
    {
      title: '变量名',
      dataIndex: 'key',
      width: 200,
      render: (_, record) => (
        <Text
          strong
          style={{
            color: token.colorText,
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
            message: '变量名必填',
          },
        ],
      },
    },
    {
      title: '变量值',
      dataIndex: 'value',
      width: 300,
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: '变量值必填',
          },
        ],
      },
      render: (text, record) => {
        const isVariable = record?.value?.includes('{{$');
        return (
          <Tag
            color={isVariable ? 'orange' : 'blue'}
            style={{
              borderRadius: token.borderRadiusSM,
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
      title: '描述',
      dataIndex: 'desc',
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div
            style={{
              color: token.colorTextSecondary,
              fontSize: '13px',
            }}
          >
            {record.desc || '-'}
          </div>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      fixed: 'right',
      render: (_, record, __, action) => {
        return [
          <a
            key="edit"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
            style={{
              color: token.colorPrimary,
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = token.colorPrimaryHover;
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = token.colorPrimary;
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
    <div
      style={{
        padding: '16px',
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <div
        style={{
          marginBottom: '16px',
        }}
      >
        <Text strong style={{ fontSize: '16px' }}>
          前置参数配置
        </Text>
      </div>
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
    </div>
  );
};

export default InterBeforeParams;
