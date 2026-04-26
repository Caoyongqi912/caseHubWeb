import { uploadInterApiData } from '@/api/inter';
import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import SetKv2Query from '@/pages/Httpx/componets/setKv2Query';
import { IFromData, IInterfaceAPI } from '@/pages/Httpx/types';
import {
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Input, Select, Space, Tag } from 'antd';
import React, { FC, useRef, useState } from 'react';

const VALUE_TYPE_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Bool', value: 'bool' },
  { label: 'File', value: 'file' },
];

const BOOL_OPTIONS = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
];

interface SelfProps {
  type: string;
  form: FormInstance<IInterfaceAPI>;
}

const APIFormData: FC<SelfProps> = ({ form }) => {
  const [dataEditableKeys, setDataEditableRowKeys] = useState<React.Key[]>();
  const [, forceUpdate] = useState({});
  const editorFormRef = useRef<EditableFormInstance<IFromData>>();

  const uploadData = async (info: any, index: number | undefined) => {
    if (info.fileList.length === 0) return;

    const formData = new FormData();
    const file = info.fileList[0]?.originFileObj;
    if (!file) return;

    formData.append('data_file', file);
    formData.append('interfaceId', form.getFieldValue('uid'));

    const { code, data } = await uploadInterApiData(formData);
    if (code === 0) {
      const currentData = form.getFieldValue('interface_data');
      const newData = currentData.map((item: any) =>
        item.id === index ? { ...item, value: data } : item,
      );

      form.setFieldsValue({ interface_data: newData });
      editorFormRef.current?.setRowData?.(index!, {
        ...currentData[index!],
        value: data,
      });
    }
  };
  const handleValueTypeChange = (newValueType: string, record: IFromData) => {
    const currentValue = record?.value;
    const currentValueType = record?.value_type || 'text';

    const currentData = form.getFieldValue('interface_data') || [];

    if (currentValueType !== newValueType && currentValue) {
      const newData = currentData.map((item: IFromData) =>
        item.id === record.id
          ? { ...item, value_type: newValueType, value: undefined }
          : item,
      );
      form.setFieldsValue({ interface_data: newData });
      editorFormRef.current?.setRowData?.(
        record.id as number,
        {
          value_type: newValueType,
          value: undefined,
        } as any,
      );
      forceUpdate({});
    } else {
      const newData = currentData.map((item: IFromData) =>
        item.id === record.id ? { ...item, value_type: newValueType } : item,
      );
      form.setFieldsValue({ interface_data: newData });
      editorFormRef.current?.setRowData?.(
        record.id as number,
        {
          value_type: newValueType,
        } as any,
      );
    }
  };

  const renderValueByType = (record: IFromData) => {
    const valueType = record?.value_type || 'text';
    const keyPrefix = `${record.id}-${valueType}`;

    switch (valueType) {
      case 'number':
        return (
          <ProFormText
            noStyle
            name="value"
            key={`${keyPrefix}-number`}
            fieldProps={{
              type: 'number',
              placeholder: '请输入数字',
            }}
            rules={[
              { required: true, message: 'Value 必填' },
              {
                pattern: /^-?\d+(\.\d+)?$/,
                message: '请输入有效的数字',
              },
            ]}
          />
        );

      case 'bool':
        return (
          <ProFormSelect
            noStyle
            name="value"
            key={`${keyPrefix}-bool`}
            options={BOOL_OPTIONS}
            placeholder="请选择布尔值"
            rules={[{ required: true, message: 'Value 必填' }]}
          />
        );

      case 'file':
        const hasFile =
          record?.value &&
          typeof record.value === 'string' &&
          !record.value.includes('{{$');
        const fileName =
          hasFile && typeof record.value === 'string'
            ? record.value.split('/').pop()
            : '';

        return (
          <Space key={`${keyPrefix}-file`}>
            <ProFormUploadButton
              noStyle
              name="value_file"
              title={hasFile ? '重新上传' : '上传文件'}
              max={1}
              accept="*"
              fieldProps={{
                listType: 'text',
                multiple: false,
                showUploadList: {
                  showPreviewIcon: false,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                },
                fileList: hasFile
                  ? [
                      {
                        uid: '-1',
                        name: fileName || '附件',
                        status: 'done',
                        url: record.value,
                      },
                    ]
                  : [],
                beforeUpload: () => false,
                onChange: (info) => uploadData(info, record.id as number),
              }}
            />
            {hasFile && (
              <a
                onClick={() => {
                  window.open(record.value, '_blank');
                }}
                style={{ color: '#1890ff' }}
                title="预览附件"
              >
                预览
              </a>
            )}
          </Space>
        );

      case 'text':
      default:
        return (
          <ProFormText
            noStyle
            name="value"
            key={`${keyPrefix}-text`}
            fieldProps={{
              placeholder: '请输入文本',
              suffix: (
                <ApiVariableFunc
                  value={record?.value}
                  index={record?.id}
                  setValue={(idx, newData) => {
                    editorFormRef.current?.setRowData?.(idx, newData);
                    const currentData =
                      form.getFieldValue('interface_data') || [];
                    const newDataList = currentData.map((item: IFromData) =>
                      item.id === idx
                        ? { ...item, value: newData.value }
                        : item,
                    );
                    form.setFieldsValue({ interface_data: newDataList });
                  }}
                />
              ),
            }}
            rules={[{ required: true, message: 'Value 必填' }]}
          />
        );
    }
  };

  const renderValueDisplay = (text: any, record: IFromData) => {
    if (!text) return <Tag color="default">未设置</Tag>;

    const valueType = record?.value_type || 'text';

    if (typeof text === 'string' && text.includes('{{$')) {
      return <Tag color="orange">{text}</Tag>;
    }

    switch (valueType) {
      case 'number':
        return <Tag color="blue">{text}</Tag>;
      case 'bool':
        return <Tag color={text === 'true' ? 'green' : 'red'}>{text}</Tag>;
      case 'file':
        const fileName =
          typeof text === 'string' ? text.split('/').pop() : text;
        return <Tag color="purple">{fileName}</Tag>;
      default:
        return <Tag color="blue">{text}</Tag>;
    }
  };

  const columns: ProColumns<IFromData>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      width: '25%',
      renderFormItem: (_, { record }) => {
        return <Input placeholder="请输入 Key" disabled={!record} />;
      },
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
      title: 'Type',
      dataIndex: 'value_type',
      width: '15%',
      valueType: 'select',
      valueEnum: {
        text: { text: 'Text', status: 'Default' },
        number: { text: 'Number', status: 'Processing' },
        bool: { text: 'Bool', status: 'Success' },
        file: { text: 'File', status: 'Warning' },
      },
      renderFormItem: (_, { record }) => {
        return (
          <Select
            options={VALUE_TYPE_OPTIONS}
            placeholder="选择类型"
            onChange={(value) => {
              if (record) {
                handleValueTypeChange(value, record);
              }
            }}
          />
        );
      },
      formItemProps: {
        required: true,
        rules: [
          {
            required: true,
            message: 'Type 必填',
          },
        ],
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: '30%',
      render: (text, record) => renderValueDisplay(text, record),
      renderFormItem: (_, { record }) => {
        if (!record) return null;
        const currentData = form.getFieldValue('interface_data') || [];
        const currentRecord =
          currentData.find((item: IFromData) => item.id === record.id) ||
          record;
        return renderValueByType(currentRecord);
      },
    },
    {
      title: 'Desc',
      dataIndex: 'desc',
      width: '20%',
      renderFormItem: () => {
        return <Input placeholder="请输入描述" />;
      },
    },
    {
      title: 'Opt',
      valueType: 'option',
      width: '10%',
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
  return (
    <>
      <SetKv2Query
        callBack={(resultArray: any) => {
          form.setFieldValue('interface_data', resultArray);
          setDataEditableRowKeys(resultArray.map((item: any) => item.id) || []);
        }}
      />
      <ProForm.Item name={'interface_data'} trigger={'onValuesChange'}>
        <EditableProTable<IFromData>
          rowKey={'id'}
          editableFormRef={editorFormRef}
          toolBarRender={false}
          columns={columns}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => ({
              id: Date.now(),
              value_type: 'text',
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys: dataEditableKeys,
            onSave: async () => {
              await FormEditableOnValueChange(form, 'interface_data');
            },
            onDelete: async (key) => {
              await FormEditableOnValueRemove(form, 'interface_data', key);
            },
            onChange: setDataEditableRowKeys,
            actionRender: (_, __, dom) => {
              return [dom.delete, dom.save, dom.cancel];
            },
          }}
        />
      </ProForm.Item>
    </>
  );
};

export default APIFormData;
