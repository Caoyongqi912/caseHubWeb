import { IObjGet } from '@/api';
import { ProDescriptions } from '@ant-design/pro-components';
import { Empty } from 'antd';
import { FC } from 'react';

interface SelfProps {
  header?: IObjGet;
}

const RequestHeaders: FC<SelfProps> = ({ header }) => {
  return (
    <>
      {header && Object.keys(header).length !== 0 ? (
        <ProDescriptions
          column={1}
          bordered={true}
          size="small"
          columns={Object.entries(header).map(([key]) => ({
            title: key,
            dataIndex: key,
            valueType: 'text',
            copyable: true,
            ellipsis: true,
          }))}
          dataSource={header}
        />
      ) : (
        <Empty />
      )}
    </>
  );
};

export default RequestHeaders;
