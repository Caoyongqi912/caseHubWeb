import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, FieldTimeOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Typography } from 'antd';
import { FC } from 'react';
const { Text } = Typography;

interface Props {
  result: ICaseContentResult;
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
          <Tag color={'orange-inverse'} icon={<FieldTimeOutlined />} />
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text type={'secondary'} style={{ marginLeft: 20 }}>
            Sleep {result.wait_time} s
          </Text>
        </Space>
      }
    />
  );
};

export default WaitResult;
