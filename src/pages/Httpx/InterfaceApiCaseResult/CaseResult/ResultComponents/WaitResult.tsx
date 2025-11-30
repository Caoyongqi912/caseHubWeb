import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, FieldTimeOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, Tooltip, Typography } from 'antd';
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
          <Tooltip title={'等待'}>
            <Tag color={'orange-inverse'} icon={<FieldTimeOutlined />} />
          </Tooltip>
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
