import { EditableProTable } from '@ant-design/pro-components';
import { FC, useEffect } from 'react';

interface SelfProps {
  columns: any;
  dataSource: any;
  title?: string;
  setDataSource: any;
  editableKeys: any;
  setEditableRowKeys: any;
  extra?: any;
  recordCreatorProps?: boolean;

  [key: string]: any; // 索引签名
}

const EditableTable: FC<SelfProps> = ({
  columns,
  dataSource,
  title,
  setDataSource,
  editableKeys,
  setEditableRowKeys,
  extra,
  recordCreatorProps = true,
  ...props
}) => {
  useEffect(() => {
    if (dataSource) {
      setEditableRowKeys(dataSource.map((v: any) => v.id));
    }
  }, [dataSource]);

  return (
    <EditableProTable
      {...props}
      headerTitle={title}
      columns={columns}
      rowKey="id"
      value={dataSource}
      onChange={setDataSource}
      recordCreatorProps={
        recordCreatorProps
          ? {
              newRecordType: 'dataSource',
              record: () => ({
                id: Date.now(),
              }),
            }
          : false
      }
      editable={{
        type: 'multiple',
        editableKeys,
        actionRender: (row, config, defaultDoms) => {
          return [defaultDoms.delete];
        },
        onValuesChange: (record, recordList) => {
          if (extra) {
            extra(recordList);
          }
          setDataSource(recordList);
        },
        onChange: setEditableRowKeys,
      }}
    />
  );
};
export default EditableTable;
