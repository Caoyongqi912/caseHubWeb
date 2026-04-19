import { ProTable } from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import { FC } from 'react';

interface SelfProps {
  columns: ProColumns[];
  dataSource: any;
}

const RespProTable: FC<SelfProps> = ({ columns, dataSource }) => {
  return (
    <ProTable
      pagination={false}
      search={false}
      toolBarRender={false}
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: 1000 }}
    />
  );
};

export default RespProTable;
