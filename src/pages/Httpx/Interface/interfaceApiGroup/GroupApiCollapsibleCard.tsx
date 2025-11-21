import { removeInterfaceGroupApis } from '@/api/inter/interGroup';
import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { UnorderedListOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { message, Space, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text } = Typography;

interface SelfProps {
  step: number;
  groupId: number;
  interfaceApiInfo: IInterfaceAPI;
  callback: () => void;
}

const GroupApiCollapsibleCard: FC<SelfProps> = ({
  step,
  interfaceApiInfo,
  groupId,
  callback,
}) => {
  const [showAPIDetail, setShowAPIDetail] = useState(false);

  const removeAssociation = async () => {
    const { code, msg } = await removeInterfaceGroupApis({
      groupId: groupId,
      apiId: interfaceApiInfo?.id,
    });
    if (code === 0) {
      callback?.();
      message.success(msg);
    }
  };

  return (
    <>
      <ProCard
        onClick={() => {
          setShowAPIDetail(true);
        }}
        collapsible={true}
        defaultCollapsed={true}
        collapsibleIconRender={({ collapsed }) => null}
        hoverable
        title={
          <Space>
            <UnorderedListOutlined
              style={{ color: '#c3cad4', marginRight: 10, marginLeft: 10 }}
            />
            <Tag color={'green-inverse'}>Step_{step}</Tag>
            <Tag color={'gold-inverse'}>API</Tag>
            <Tag color={'cyan'}>{interfaceApiInfo?.method}</Tag>
            <Tag color={'cyan'}>{interfaceApiInfo?.name}</Tag>
            <Text type={'secondary'}>{interfaceApiInfo?.url}</Text>
          </Space>
        }
        extra={
          <Space>
            <a onClick={removeAssociation}>解除</a>
          </Space>
        }
      ></ProCard>
      <MyDrawer
        width={'75%'}
        name={''}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail
          interfaceId={interfaceApiInfo?.id}
          callback={() => {}}
        />
      </MyDrawer>
    </>
  );
};

export default GroupApiCollapsibleCard;
