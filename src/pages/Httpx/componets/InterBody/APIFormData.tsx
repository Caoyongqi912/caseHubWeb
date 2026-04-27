import { removeInterApiFileData, uploadInterApiData } from '@/api/inter';
import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import {
  FormEditableOnValueChange,
  FormEditableOnValueRemove,
} from '@/pages/Httpx/componets/FormEditableOnValueChange';
import SetKv2Query from '@/pages/Httpx/componets/setKv2Query';
import { IFromData, IInterfaceAPI } from '@/pages/Httpx/types';
import { LoadingOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProForm,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Input, Select, Tag } from 'antd';
import React, { FC, useRef, useState } from 'react';

const VALUE_TYPE_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'File', value: 'file' },
];

interface SelfProps {
  type: string;
  form: FormInstance<IInterfaceAPI>;
}

const APIFormData: FC<SelfProps> = ({ form }) => {
  const [dataEditableKeys, setDataEditableRowKeys] = useState<React.Key[]>();
  const [, forceUpdate] = useState({});
  const editorFormRef = useRef<EditableFormInstance<IFromData>>();
  const [fileUidMap, setFileUidMap] = useState<Record<number, string>>({});
  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [fileLoading, setFileLoading] = useState<Record<number, boolean>>({});

  const uploadData = async (info: any, index: number | undefined) => {
    if (info.fileList.length === 0) return;

    const formData = new FormData();
    const file = info.fileList[0]?.originFileObj;
    if (!file) return;

    formData.append('data_file', file);
    formData.append('interfaceId', form.getFieldValue('uid'));

    setFileLoading((prev) => ({ ...prev, [index!]: true }));

    const { code, data } = await uploadInterApiData(formData);
    if (code === 0) {
      const currentData = form.getFieldValue('interface_data');
      const newData = currentData.map((item: any) =>
        item.id === index ? { ...item, value: data.uid } : item,
      );

      form.setFieldsValue({ interface_data: newData });
      editorFormRef.current?.setRowData?.(index!, {
        ...currentData[index!],
        value: data.uid,
      });
      setFileUidMap((prev) => ({ ...prev, [index!]: data.uid }));
      setFileNameMap((prev) => ({ ...prev, [data.uid]: data.file_name }));
      setFileLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[index!];
        return newLoading;
      });
    } else {
      setFileLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[index!];
        return newLoading;
      });
    }
  };

  const clearFileValue = async (recordId: number) => {
    const uid = fileUidMap[recordId];

    setFileLoading((prev) => ({ ...prev, [recordId]: true }));

    if (uid) {
      await removeInterApiFileData({ file_id: uid });
      setFileUidMap((prev) => {
        const newMap = { ...prev };
        delete newMap[recordId];
        return newMap;
      });
      setFileNameMap((prev) => {
        const newMap = { ...prev };
        delete newMap[uid];
        return newMap;
      });
    }

    const currentData = form.getFieldValue('interface_data');
    const newData = currentData.map((item: any) =>
      item.id === recordId ? { ...item, value: undefined } : item,
    );
    form.setFieldsValue({ interface_data: newData });
    editorFormRef.current?.setRowData?.(recordId, {
      ...currentData.find((item: any) => item.id === recordId),
      value: undefined,
    } as any);
    setFileLoading((prev) => {
      const newLoading = { ...prev };
      delete newLoading[recordId];
      return newLoading;
    });
    forceUpdate({});
  };

  const handleValueTypeChange = (newValueType: string, record: IFromData) => {
    const currentValueType = record?.value_type || 'text';

    if (currentValueType === 'file' && newValueType !== 'file') {
      clearFileValue(record.id as number);
      return;
    }

    const currentData = form.getFieldValue('interface_data') || [];

    if (currentValueType !== newValueType && record?.value) {
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
      case 'file':
        const hasFile =
          record?.value && typeof record.value === 'string' && record.value;
        const fileName = hasFile
          ? fileNameMap[record.value] || record.value
          : '';

        return (
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
                      name: fileName,
                      status: 'done',
                    },
                  ]
                : [],
              beforeUpload: () => false,
              onChange: (info) => uploadData(info, record.id as number),
              onRemove: () => {
                clearFileValue(record.id as number);
                return false;
              },
            }}
          />
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
      case 'file':
        const isLoading = fileLoading[record.id as number];
        if (isLoading) {
          return (
            <Tag color="blue" icon={<LoadingOutlined spin />}>
              {text || '处理中...'}
            </Tag>
          );
        }
        const displayName = fileNameMap[text] || text;
        return <Tag color="purple">{displayName}</Tag>;
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
