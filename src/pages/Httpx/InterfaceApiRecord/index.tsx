import {
  clearApiRecord,
  deduplicationRecord,
  queryApiRecord,
  startApiRecord,
} from '@/api/inter';
import AddToApi from '@/pages/Httpx/InterfaceApiRecord/AddToApi';
import AddToCase from '@/pages/Httpx/InterfaceApiRecord/AddToCase';
import RecordDetail from '@/pages/Httpx/InterfaceApiRecord/RecordDetail';
import { IInterfaceAPIRecord } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProCard,
  ProColumns,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Empty, message, Tabs, Tag } from 'antd';
import { useRef, useState } from 'react';

const Index = () => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const { API_REQUEST_METHOD } = CONFIG;

  const [recordStatus, setRecordStatus] = useState(false);
  const [recordDataSource, setRecordDataSource] =
    useState<IInterfaceAPIRecord[]>();
  const [polling, setPolling] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [addOpenModal, setAddOpenModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string>();
  const StartRecord = async (values: any) => {
    setRecordStatus(true);
    setPolling(3000);
    const { code } = await startApiRecord(values);
    if (code === 0) {
      setOpenModal(false);
      message.success('开始录制');
    }
  };
  const StopRecord = async () => {
    setPolling(0);
    setRecordStatus(false);
  };

  const queryRecord = async () => {
    const { code, data } = await queryApiRecord();
    if (code === 0) {
      setRecordDataSource(data);
      return data;
    }
  };

  const columns: ProColumns<IInterfaceAPIRecord>[] = [
    {
      title: 'URL',
      dataIndex: 'url',
      copyable: true,
      render: (_, record) => {
        return <a>{record.url}</a>;
      },
    },
    {
      title: 'Method',
      dataIndex: 'method',
      render: (_, record) => {
        return <Tag color={'blue'}>{record.method}</Tag>;
      },
    },
    {
      title: 'Time',
      dataIndex: 'create_time',
    },
    {
      title: 'Option',
      dataIndex: 'options',
      render: (_, record) => {
        return (
          <a
            onClick={() => {
              setCurrentRecordId(record.uid);
              setAddOpenModal(true);
            }}
          >
            添加
          </a>
        );
      },
    },
  ];

  const recordBut = (
    <>
      {!recordStatus ? (
        <>
          <Button type={'primary'} onClick={() => setOpenModal(true)}>
            <PlayCircleOutlined />
            开始录制
          </Button>
        </>
      ) : (
        <Button type={'primary'} onClick={StopRecord}>
          <LoadingOutlined />
          停止录制
        </Button>
      )}
      {recordDataSource && recordDataSource?.length > 0 && (
        <>
          <Button
            type={'primary'}
            onClick={async () => {
              const { code } = await clearApiRecord();
              if (code === 0) {
                setRecordDataSource([]);
                actionRef.current?.reload();
              }
            }}
          >
            清空
          </Button>
          <Button
            onClick={async () => {
              const { code } = await deduplicationRecord();
              if (code === 0) {
                actionRef.current?.reload();
              }
            }}
          >
            去重
          </Button>
        </>
      )}
    </>
  );

  const expandedRowRender = (record: IInterfaceAPIRecord) => {
    return <RecordDetail interfaceAPIRecordInfo={record} />;
  };
  return (
    <ProCard>
      <ModalForm
        open={addOpenModal}
        submitter={false}
        onOpenChange={setAddOpenModal}
      >
        <Tabs>
          <Tabs.TabPane key={'1'} tab={'API'}>
            <AddToApi
              currentRecordId={currentRecordId}
              setCloseModal={setAddOpenModal}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key={'2'} tab={'API用例'}>
            <AddToCase
              currentRecordId={currentRecordId}
              setCloseModal={setAddOpenModal}
            />
          </Tabs.TabPane>
        </Tabs>
      </ModalForm>
      <ModalForm
        open={openModal}
        onOpenChange={setOpenModal}
        onFinish={StartRecord}
      >
        <ProFormSelect
          mode={'multiple'}
          name={'method'}
          options={API_REQUEST_METHOD}
          label={'目标方法'}
        />
        <ProFormText
          name={'url'}
          label={'目标url'}
          placeholder={'请输入URL 以过滤请求'}
        />
      </ModalForm>
      {/* <MyProTable
        actionRef={actionRef}
        // @ts-ignore
        polling={polling}
        expandable={{
          expandedRowRender,
        }}
        search={false}
        columns={columns}
        rowKey={'uid'}
        request={queryRecord}
        dataSource={recordDataSource}
        toolBarRender={() => [recordBut]}
      /> */}
      <Empty description={'待开发'} />
    </ProCard>
  );
};

export default Index;
