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
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FormInstance, Tag, Typography } from 'antd';
import React, { FC, useRef, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  type: string;
  form: FormInstance<IInterfaceAPI>;
}

const APIFormData: FC<SelfProps> = ({ form }) => {
  const [dataEditableKeys, setDataEditableRowKeys] = useState<React.Key[]>();
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
  const columns: ProColumns<IFromData>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      width: '30%',
      render: (_, record) => <Text strong>{record.key}</Text>,
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
      title: 'value',
      dataIndex: 'value',
      width: '30%',
      render: (text) => {
        if (!text || typeof text !== 'string')
          return <Tag color={'default'}>未设置</Tag>;
        if (text.includes('{{$')) {
          return <Tag color={'orange'}>{text}</Tag>;
        }
        return <Tag color={'blue'}>{text}</Tag>;
      },
      renderFormItem: ({ index }, { record }) => {
        const hasFile =
          record?.value &&
          typeof record.value === 'string' &&
          !record.value.includes('{{$');
        const fileName =
          hasFile && typeof record.value === 'string'
            ? record.value.split('/').pop()
            : '';

        return (
          <ProFormText
            noStyle
            name={'value'}
            fieldProps={{
              suffix: (
                <>
                  <ProFormUploadButton
                    noStyle
                    name="value"
                    title={hasFile ? '重新上传文件' : '上传文件'}
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
                      onChange: (info) => uploadData(info, index),
                    }}
                  />
                  {hasFile && (
                    <a
                      onClick={() => {
                        window.open(record.value, '_blank');
                      }}
                      style={{ marginLeft: 8, color: '#1890ff' }}
                      title="预览附件"
                    >
                      预览
                    </a>
                  )}
                  <ApiVariableFunc
                    value={record?.value}
                    index={record?.id}
                    setValue={(index, newData) => {
                      editorFormRef.current?.setRowData?.(index, newData);
                      form.setFieldsValue({
                        interface_data: form
                          .getFieldValue('interface_data')
                          .map((item: any) =>
                            item.id === index
                              ? { ...item, value: newData.value }
                              : item,
                          ),
                      });
                    }}
                  />
                </>
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
        return [
          <a
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
