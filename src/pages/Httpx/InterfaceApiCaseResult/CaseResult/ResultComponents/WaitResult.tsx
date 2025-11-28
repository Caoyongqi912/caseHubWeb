import { ProCard } from '@ant-design/pro-components';
import { Space, Tag } from 'antd';
import { FC } from 'react';

interface Props {
  result: any;
}
const WaitResult: FC<Props> = ({ result }) => {
  return (
    <ProCard
      bordered
      collapsible={false}
      hoverable
      defaultCollapsed
      title={
        <Space>
          <Tag color={'green-inverse'}>STEP_{result.content_step}</Tag>
          <Tag color={'orange-inverse'}>WAIT</Tag>
          <Tag color={'#87d068'}>{`${result.wait_time} s`}</Tag>
        </Space>
      }
    />
  );
};

export default WaitResult;
