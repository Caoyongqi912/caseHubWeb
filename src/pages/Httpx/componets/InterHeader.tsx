import { HeadersEnum } from '@/pages/Httpx/componets/APIEditEnum';
import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import { IHeaders, IInterfaceAPI } from '@/pages/Httpx/types';
import {
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Select, Tag } from 'antd';
import React, { FC, useRef, useState } from 'react';

interface SelfProps {
  form: FormInstance<IInterfaceAPI>;
  readonly?: boolean;
}

const InterHeader: FC<SelfProps> = ({ form, readonly = false }) => {
  const [headersEditableKeys, setHeadersEditableRowKeys] =
    useState<React.Key[]>();
  const [headerData, setHeaderData] = useState<
    {
      value: string;
      text: any;
    }[]
  >([]);
  const editorFormRef = useRef<EditableFormInstance<IHeaders>>();

  const handleHeaderSearch = (newValue: string) => {
    if (newValue) {
      const filteredOptions = Object.keys(HeadersEnum)
        .filter((item) =>
          HeadersEnum[item].text.toLowerCase().includes(newValue.toLowerCase()),
        )
        .map((key) => ({ value: key, text: HeadersEnum[key].text }));
      setHeaderData(
        filteredOptions.length > 0
          ? filteredOptions
          : [{ value: newValue, text: newValue }],
      );
    } else {
      setHeaderData([]);
    }
  };

  const headerColumns: ProColumns<IHeaders>[] = [
    {
      title: 'Key',
      key: 'key',
      dataIndex: 'key',
      fixed: 'left',
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: 'Key 必填',
          },
        ],
      },
      renderFormItem: () => {
        return (
          <Select
            showSearch
            defaultActiveFirstOption={false}
            filterOption={true}
            onSearch={handleHeaderSearch}
            notFoundContent={null}
            options={(headerData || []).map((d) => ({
              value: d.value,
              label: d.text,
            }))}
          />
        );
      },
    },
    {
      title: 'Value',
      key: 'value',
      dataIndex: 'value',
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: 'Value 必填',
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
                  index={record?.id as number}
                  setValue={(index, newData) => {
                    editorFormRef.current?.setRowData?.(index, newData);
                    form.setFieldsValue({
                      interface_headers: form
                        .getFieldValue('interface_headers')
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
      key: 'desc',
      dataIndex: 'desc',
    },
    {
      title: 'Opt',
      valueType: 'option',
      fixed: 'right',
      render: (_, record, __, action) => {
        if (!readonly) {
          return (
            <a
              onClick={() => {
                action?.startEditable?.(record.id);
              }}
            >
              编辑
            </a>
          );
        }
      },
    },
  ];

  return (
    <>
      <ProForm.Item name={'interface_headers'} trigger={'onValuesChange'}>
        <EditableProTable<IHeaders>
          editableFormRef={editorFormRef}
          rowKey={'id'}
          toolBarRender={false}
          columns={headerColumns}
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
            editableKeys: headersEditableKeys,
            onChange: setHeadersEditableRowKeys,
            onSave: async () => {
              await FormEditableOnValueChange(form, 'interface_headers');
            },
            onDelete: async (key) => {
              await FormEditableOnValueRemove(form, 'interface_headers', key);
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

export default InterHeader;
