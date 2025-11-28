import AceCodeEditor from '@/components/CodeEditor/AceCodeEditor';
import MyTabs from '@/components/MyTabs';
import RequestHeaders from '@/pages/Httpx/InterfaceApiResponse/RequestHeaders';
import { ProCard } from '@ant-design/pro-components';
import { Empty, Space, Tag } from 'antd';
import { FC } from 'react';

interface Props {
  method: string;
  interfaceApiInfo?: any;
}

const RequestInfo: FC<Props> = ({ method, interfaceApiInfo }) => {
  const renderResponseBody = (json: any) => {
    console.log('===', json);
    if (!json) {
      return <Empty />;
    }
    if (typeof json === 'object') {
      return (
        <AceCodeEditor value={JSON.stringify(json, null, 2)} readonly={true} />
      );
    } else if (typeof json === 'string') {
      try {
        const jsonValue = JSON.parse(json);
        const value = JSON.stringify(jsonValue, null, 2);
        return <AceCodeEditor value={value} readonly={true} />;
      } catch (e) {
        return <AceCodeEditor value={json} _mode={'html'} readonly={true} />;
      }
    }
  };

  return (
    <ProCard split={'horizontal'}>
      <ProCard>
        <Space direction={'horizontal'}>
          <Tag color={'#f5993b'}> {method}</Tag>
          {interfaceApiInfo?.url}
        </Space>
      </ProCard>
      <ProCard>
        <MyTabs
          size={'small'}
          defaultActiveKey={'1'}
          items={[
            {
              label: 'Header',
              key: '1',
              children: <RequestHeaders header={interfaceApiInfo.headers} />,
            },
            {
              label: 'Query',
              key: '2',
              children: <RequestHeaders header={interfaceApiInfo?.params} />,
            },
            {
              label: 'Body',
              key: '3',
              children: <>{renderResponseBody(interfaceApiInfo?.json)}</>,
            },
          ]}
        />
      </ProCard>
    </ProCard>
  );
};

export default RequestInfo;
