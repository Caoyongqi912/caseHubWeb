import { pageInterApiResult } from '@/api/inter/interCase';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { ITryResponseInfo } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface SelfProps {
  taskResultId?: number | string;
}

const InterfaceApiResultTable: FC<SelfProps> = ({ taskResultId }) => {
  const actionRef = useRef<ActionType>(); //Table action 的引用，便于自定义触发
  const [open, setOpen] = useState(false);
  const [responseInfo, setResponseInfo] = useState<ITryResponseInfo[]>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [failOnly, setFailOnly] = useState(false);

  useEffect(() => {
    if (failOnly) {
      setDataSource(dataSource.filter((item) => item.result === 'ERROR'));
    } else {
      actionRef.current?.reload();
    }
  }, [failOnly]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        //只查询公共api
        interface_task_result_Id: taskResultId,
        sort: sort,
      };
      const { code, data } = await pageInterApiResult(searchData);
      setDataSource(data.items);
      return pageData(code, data);
    },
    [taskResultId],
  );

  const columns: ProColumns<ITryResponseInfo>[] = [
    {
      title: '执行用例',
      dataIndex: 'interfaceName',
      render: (_, record) => <Tag color={'blue'}>{record.interfaceName}</Tag>,
    },

    {
      title: '测试结果',
      dataIndex: 'result',
      valueType: 'select',
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag color={record.result === 'SUCCESS' ? 'green' : 'error'}>
          {record.result}
        </Tag>
      ),
    },

    {
      title: '执行人',
      dataIndex: 'starterName',
      key: 'starterId',
      render: (_, record) => <Tag color={'blue'}>{record.starterName}</Tag>,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setResponseInfo([record]);
              setOpen(true);
            }}
          >
            详情
          </a>
        </>
      ),
    },
  ];
  return (
    <ProCard bordered={false} bodyStyle={{ padding: 0 }}>
      <MyDrawer name={''} open={open} setOpen={setOpen}>
        <InterfaceApiResponseDetail responses={responseInfo} />
      </MyDrawer>
      <MyProTable
        toolBarRender={() => [
          <Button type={'primary'} onClick={() => setFailOnly(!failOnly)}>
            只看失败
          </Button>,
        ]}
        rowKey={'uid'}
        dataSource={dataSource}
        actionRef={actionRef}
        request={fetchResults}
        search={false}
        columns={columns}
        x={1000}
      />
    </ProCard>
  );
};

export default InterfaceApiResultTable;
