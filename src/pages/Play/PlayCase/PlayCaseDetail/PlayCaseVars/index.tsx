import {
  addPlayCaseVars,
  pagePlayCaseVars,
  removePlayCaseVars,
  updatePlayCaseVars,
} from '@/api/play/playCase';
import ApiVariableFunc from '@/pages/Httpx/componets/ApiVariableFunc';
import { IUIVars } from '@/pages/Play/componets/uiTypes';
import { pageData } from '@/utils/somefunc';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProColumns,
  ProFormText,
} from '@ant-design/pro-components';
import { message, Popconfirm, Tag, Typography } from 'antd';
import React, { FC, useCallback, useRef, useState } from 'react';

const { Text } = Typography;

interface ISelfProps {
  currentCaseId: string;
}

const Index: FC<ISelfProps> = ({ currentCaseId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [varsEditableKeys, setVarsEditableRowKeys] = useState<React.Key[]>();
  const [dataSource, setDataSource] = useState<IUIVars[]>([]);
  const editorFormRef = useRef<EditableFormInstance<IUIVars>>();
  //
  const fetchPageVars = useCallback(
    async (values: any) => {
      const { code, data } = await pagePlayCaseVars({
        ...values,
        play_case_id: parseInt(currentCaseId),
      });
      return pageData(code, data, setDataSource);
    },
    [currentCaseId],
  );

  const varColumns: ProColumns<IUIVars>[] = [
    {
      title: '变量名',
      dataIndex: 'key',
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: '此项是必填项',
          },
        ],
      },
      render: (_, record) => <Text strong>{record.key}</Text>,
    },
    {
      title: '值',
      dataIndex: 'value',
      valueType: 'text',
      hideInSearch: true,
      render: (text, record) => {
        if (record?.value?.includes('{{$')) {
          return <Tag color="orange">{text}</Tag>;
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
                  setValue={editorFormRef.current?.setRowData}
                />
              ),
              value: record?.value,
            }}
          />
        );
      },
    },

    {
      title: 'Opt',
      valueType: 'option',
      fixed: 'right',
      width: '15%',
      render: (_, record, __, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          title="确认删除"
          onConfirm={async () => {
            const { code, msg } = await removePlayCaseVars({ uid: record.uid });
            if (code === 0) {
              message.success(msg);
              actionRef.current?.reload();
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <EditableProTable<IUIVars>
      editableFormRef={editorFormRef}
      options={{
        density: true,
        setting: {
          listsHeight: 400,
        },
      }}
      search={false}
      dataSource={dataSource}
      request={fetchPageVars}
      rowKey={'id'}
      actionRef={actionRef}
      columns={varColumns}
      recordCreatorProps={{
        newRecordType: 'dataSource',
        creatorButtonText: '新增一条变量',
        // @ts-ignore
        record: () => ({
          id: Date.now(),
          play_case_id: parseInt(currentCaseId),
        }),
      }}
      editable={{
        type: 'single',
        editableKeys: varsEditableKeys,
        onChange: setVarsEditableRowKeys,
        onSave: async (_, data) => {
          console.log(data);
          data.play_case_id = parseInt(currentCaseId);
          if (data.uid) {
            const { code, msg } = await updatePlayCaseVars(data);
            if (code === 0) {
              message.success(msg);
            }
          } else {
            const { code, msg } = await addPlayCaseVars(data);
            if (code === 0) {
              message.success(msg);
            }
          }
          actionRef.current?.reload();
        },
        actionRender: (__, _, dom) => {
          return [dom.save, dom.cancel];
        },
      }}
    />
  );
};

export default Index;
