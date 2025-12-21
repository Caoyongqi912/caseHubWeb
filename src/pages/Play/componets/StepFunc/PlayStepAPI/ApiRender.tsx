import MyDrawer from '@/components/MyDrawer';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { Descriptions, Tag, Typography } from 'antd';
import { FC, useState } from 'react';

const { Text, Link } = Typography;

interface Self {
  apiInfo?: IInterfaceAPI;
}

const ApiRender: FC<Self> = ({ apiInfo }) => {
  const [openAPIDrawer, setOpenAPIDrawer] = useState(false);

  return (
    <>
      <MyDrawer open={openAPIDrawer} setOpen={setOpenAPIDrawer}>
        <InterfaceApiDetail interfaceId={apiInfo?.id} />
      </MyDrawer>
      {apiInfo && (
        <Descriptions
          size="small"
          column={2}
          bordered
          style={{ margin: '-12px -16px' }}
          labelStyle={{
            padding: '8px 12px',
            backgroundColor: '#fafafa',
            width: '80px',
          }}
          contentStyle={{
            padding: '8px 12px',
          }}
        >
          <Descriptions.Item label="标题">
            <Link
              strong
              onClick={() => {
                setOpenAPIDrawer(true);
              }}
            >
              {apiInfo.name}
            </Link>
          </Descriptions.Item>

          <Descriptions.Item label="UID">
            <code style={{ fontSize: '12px' }}>{apiInfo.uid}</code>
          </Descriptions.Item>

          <Descriptions.Item label="优先级">
            <Tag color={apiInfo.level === 'P1' ? 'red' : 'orange'}>
              {apiInfo.level}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="描述" span={2}>
            <div
              style={{
                color: apiInfo.description ? 'inherit' : '#999',
                fontStyle: apiInfo.description ? 'normal' : 'italic',
              }}
            >
              {apiInfo.description || '暂无描述'}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="URL" span={2}>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {apiInfo.method} {apiInfo.url}
            </div>
          </Descriptions.Item>
        </Descriptions>
      )}
    </>
  );
};

export default ApiRender;
