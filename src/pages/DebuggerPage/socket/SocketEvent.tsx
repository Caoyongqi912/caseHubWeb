import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import React, { FC, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ISocketEventProps {
  event_name: string;
  listen_switch: boolean;
  desc?: string;
}

interface SelfProps {
  socket: Socket | null;
  callback: (data: any) => Promise<void>;
}

const SocketEvent: FC<SelfProps> = ({ socket, callback }) => {
  const [dataSource, setDataSource] = React.useState<
    readonly ISocketEventProps[]
  >([]);
  const [eventEditableRowKeys, setEventEditableRowKeys] =
    useState<React.Key[]>();
  const editorFormRef = useRef<EditableFormInstance<ISocketEventProps>>();

  const columns: ProColumns<ISocketEventProps>[] = [
    {
      title: '事件名',
      dataIndex: 'event_name',
      width: '40%',
    },
    {
      title: '监听',
      dataIndex: 'listen_switch',
      valueType: 'switch',
      width: '20%',
      fieldProps: (form, { rowKey, rowIndex }) => {
        const record = dataSource[rowIndex];
        return {
          checkedChildren: '开启',
          unCheckedChildren: '关闭',
          disabled: !socket?.connected || !record?.event_name,
          onChange: (checked: boolean, event: Event) => {
            if (checked) {
              socket?.on(record.event_name, callback);
            } else {
              socket?.off(record.event_name);
            }
          },
        };
      },
    },
  ];
  return (
    <EditableProTable
      editableFormRef={editorFormRef}
      dataSource={dataSource}
      rowKey={'id'}
      columns={columns}
      recordCreatorProps={{
        newRecordType: 'dataSource',
        record: () => ({
          id: Date.now(),
          listen_switch: false,
          event_name: 'message',
        }),
      }}
      onChange={setDataSource}
      editable={{
        type: 'multiple',
        editableKeys: eventEditableRowKeys,
        onChange: setEventEditableRowKeys,
      }}
    />
  );
};

export default SocketEvent;
