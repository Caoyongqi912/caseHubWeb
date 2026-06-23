import { ICaseContentResult } from '@/pages/Httpx/types';
import { CheckCircleTwoTone, FieldTimeOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Space, Tag, theme, Tooltip, Typography } from 'antd';
import { FC, useMemo } from 'react';

const { Text } = Typography;
const { useToken } = theme;

interface Props {
  result: ICaseContentResult;
}

const WaitResult: FC<Props> = ({ result }) => {
  const { token } = useToken();

  const styles = useMemo(
    () => ({
      card: {
        borderRadius: token.borderRadiusSM,
        borderLeft: `3px solid ${
          result.result ? token.colorSuccess : token.colorError
        }`,
        marginTop: token.marginXS,
      },
    }),
    [token, result.result],
  );
  return (
    <ProCard
      variant={'outlined'}
      style={styles.card}
      hoverable
      headerBordered
      collapsible={false}
      title={
        <Space style={{ marginLeft: '8px' }}>
          <Tag color="green" variant="solid">
            STEP_{result.content_step}
          </Tag>
          <Tooltip title={'等待'}>
            <Tag color="orange" variant="solid" icon={<FieldTimeOutlined />} />
          </Tooltip>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text type={'secondary'}>Sleep {result.wait_seconds || 0} s</Text>
        </Space>
      }
    />
  );
};

export default WaitResult;
