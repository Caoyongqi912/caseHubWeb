import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import SetKv2Query from '@/pages/Httpx/componets/setKv2Query';
import { IInterfaceAPI, IParams } from '@/pages/Httpx/types';
import {
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Tag } from 'antd';
import React, { FC, useRef, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  readonly?: boolean;
}

const InterParam: FC<SelfProps> = ({ form, readonly = false }) => {
  const [paramsEditableKeys, setParamsEditableRowKeys] = useState<React.Key[]>(
    [],
  );
  const editorFormRef = useRef<EditableFormInstance<IParams>>();
  const columns: ProColumns<IParams>[] = [
    {
      title: 'Key',
      width: '30%',
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
      title: 'Value',
      dataIndex: 'value',
      width: '30%',
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
        if (record?.value?.includes('{{$')) {
          return <Tag color={'orange'}>{text}</Tag>;
        } else {
          return <Tag color={'blue'}>{text}</Tag>;
        }
      },
      renderFormItem: (_, { record }) => {
        return (
          <ProFormText
            noStyle
            name={'value'}
            fieldProps={{
              suffix: (
                <ApiVariableFunc
                  value={record?.value}
                  index={record?.id}
                  setValue={(index, newData) => {
                    editorFormRef.current?.setRowData?.(index, newData);
                    form.setFieldsValue({
                      interface_params: form
                        .getFieldValue('interface_params')
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
      width: '20%',
    },
    {
      title: 'Opt',
      valueType: 'option',
      render: (_, record, __, action) => {
        return (
          <>
            {!readonly && (
              <a
                onClick={() => {
                  action?.startEditable?.(record.id);
                }}
              >
                编辑
              </a>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      <SetKv2Query
        callBack={(resultArray: any) => {
          form.setFieldValue('interface_params', resultArray);
          setParamsEditableRowKeys(
            resultArray.map((item: any) => item.id) || [],
          );
        }}
      />
      <ProForm.Item name={'interface_params'} trigger={'onValuesChange'}>
        <EditableProTable<IParams>
          editableFormRef={editorFormRef}
          rowKey={'id'}
          toolBarRender={false}
          columns={columns}
          recordCreatorProps={
            !readonly && {
              newRecordType: 'dataSource',
              record: () => ({
                id: Date.now(),
              }),
            }
          }
          editable={{
            type: 'multiple',
            editableKeys: paramsEditableKeys,
            onChange: setParamsEditableRowKeys,
            onDelete: async (key) => {
              await FormEditableOnValueRemove(form, 'interface_params', key);
            },
            onSave: async () => {
              await FormEditableOnValueChange(form, 'interface_params');
            },
            actionRender: (_, __, dom) => {
              return [dom.save, dom.cancel, dom.delete];
            },
          }}
        />
      </ProForm.Item>
    </>
  );
};

export default InterParam;
