import { pageInterApiResult } from '@/api/inter/interCase';
import MyProTable from '@/components/Table/MyProTable';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { IResponseInfo } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, theme } from 'antd';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

interface SelfProps {
  taskResultId?: number | string;
}

const InterfaceApiResultTable: FC<SelfProps> = ({ taskResultId }) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [allData, setAllData] = useState<any[]>([]);
  const [failOnly, setFailOnly] = useState(false);

  const dataSource = useMemo(() => {
    if (failOnly) {
      return allData.filter((item) => item.result === false);
    }
    return allData;
  }, [failOnly, allData]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        task_result_id: taskResultId,
        sort: sort,
      };
      const { code, data } = await pageInterApiResult(searchData);
      setAllData(data.items);
      return pageData(code, data);
    },
    [taskResultId],
  );

  const styles = useMemo(
    () => ({
      nameTag: {
        fontSize: 13,
        fontWeight: 500,
        padding: '4px 12px',
        borderRadius: 6,
        backgroundColor: token.colorBgTextActive,
        color: token.colorText,
        border: 'none',
      },
      timeTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 6,
        backgroundColor: token.colorInfoBg,
        color: token.colorInfo,
        border: `1px solid ${token.colorInfoBorder}`,
        fontFamily: 'monospace',
      },
      filterBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  const columns: ProColumns<IResponseInfo>[] = [
    {
      title: '执行用例',
      dataIndex: 'interface_name',
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <PlayCircleOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interface_name}
        </Tag>
      ),
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      valueType: 'select',
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag
          color={record.result ? 'success' : 'error'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {record.result ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.result ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '运行时间',
      dataIndex: 'start_time',
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => (
        <Tag style={styles.timeTag}>{record.start_time}</Tag>
      ),
    },
    {
      title: '运行环境',
      dataIndex: 'running_env_name',
      render: (_, record) => (
        <Tag style={styles.timeTag}>{record.running_env_name}</Tag>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starter_name',
      key: 'starterId',
      render: (_, record) => (
        <Tag
          style={{
            borderRadius: 12,
            fontSize: 12,
            padding: '2px 10px',
            backgroundColor: token.colorWarningBg,
            color: token.colorWarningText,
            border: `1px solid ${token.colorWarningBorder}`,
          }}
        >
          {record.starter_name}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record: IResponseInfo) => {
    return <InterfaceApiResponseDetail responses={[record]} />;
  };

  return (
    <ProCard bordered={false} bodyStyle={{ padding: 0 }}>
      <MyProTable
        toolBarRender={() => [
          <Button
            key="filter"
            type="primary"
            style={styles.filterBtn}
            onClick={() => setFailOnly(!failOnly)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
            }}
          >
            {failOnly ? '查看全部' : '只看失败'}
          </Button>,
        ]}
        rowKey="uid"
        expandable={{ expandedRowRender }}
        dataSource={dataSource}
        actionRef={actionRef}
        request={fetchResults}
        search={false}
        columns={columns}
      />
    </ProCard>
  );
};

export default InterfaceApiResultTable;
