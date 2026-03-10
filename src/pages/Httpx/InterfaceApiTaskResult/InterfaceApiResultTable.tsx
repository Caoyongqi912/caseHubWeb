import { pageInterApiResult } from '@/api/inter/interCase';
import MyProTable from '@/components/Table/MyProTable';
import InterfaceApiResponseDetail from '@/pages/Httpx/InterfaceApiResponse/InterfaceApiResponseDetail';
import { ITryResponseInfo } from '@/pages/Httpx/types';
import { pageData } from '@/utils/somefunc';
import { ActionType, ProCard, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  Tag,
  theme,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SelfProps {
  taskResultId?: number | string;
}

const InterfaceApiResultTable: FC<SelfProps> = ({ taskResultId }) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [originDataSource, setOriginDataSource] = useState<any[]>([]);
  const [failDataSource, setFailDataSource] = useState<any[]>([]);
  const [failOnly, setFailOnly] = useState(false);

  useEffect(() => {
    if (failOnly) {
      setOriginDataSource(
        failDataSource.filter((item) => item.result === 'ERROR'),
      );
    } else {
      setOriginDataSource([...failDataSource]);
    }
  }, [failOnly, failDataSource]);

  const fetchResults = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        interface_task_result_Id: taskResultId,
        sort: sort,
      };
      const { code, data } = await pageInterApiResult(searchData);
      setOriginDataSource(data.items);
      setFailDataSource(data.items);
      return pageData(code, data);
    },
    [taskResultId],
  );

  const styles = useMemo(
    () => ({
      actionBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
      primaryBtn: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      successBtn: {
        color: token.colorSuccess,
        backgroundColor: token.colorSuccessBg,
      },
      dangerBtn: {
        color: token.colorError,
        backgroundColor: token.colorErrorBg,
      },
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

  const ActionButton: FC<{
    icon: React.ReactNode;
    label: string;
    type?: 'primary' | 'danger';
    onClick?: () => void;
  }> = ({ icon, label, type = 'primary', onClick }) => {
    const styleMap = {
      primary: styles.primaryBtn,
      danger: styles.dangerBtn,
    };

    return (
      <a
        onClick={onClick}
        style={{
          ...styles.actionBtn,
          ...styleMap[type],
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {icon}
        {label}
      </a>
    );
  };

  const columns: ProColumns<ITryResponseInfo>[] = [
    {
      title: '执行用例',
      dataIndex: 'interfaceName',
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <PlayCircleOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interfaceName}
        </Tag>
      ),
    },
    {
      title: '测试结果',
      dataIndex: 'result',
      valueType: 'select',
      width: 100,
      valueEnum: { SUCCESS: { text: '成功' }, ERROR: { text: '失败' } },
      render: (_, record) => (
        <Tag
          color={record.result === 'SUCCESS' ? 'success' : 'error'}
          style={{
            borderRadius: 6,
            fontWeight: 500,
            padding: '4px 12px',
          }}
        >
          {record.result === 'SUCCESS' ? (
            <CheckCircleOutlined style={{ marginRight: 4 }} />
          ) : (
            <CloseCircleOutlined style={{ marginRight: 4 }} />
          )}
          {record.result}
        </Tag>
      ),
    },
    {
      title: '运行时间',
      dataIndex: 'startTime',
      valueType: 'dateTime',
      sorter: true,
      width: 180,
      render: (_, record) => (
        <Tag style={styles.timeTag}>{record.startTime}</Tag>
      ),
    },
    {
      title: '执行人',
      dataIndex: 'starterName',
      key: 'starterId',
      width: 120,
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
          {record.starterName}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => <></>,
    },
  ];

  const expandedRowRender = (record: ITryResponseInfo) => {
    return <InterfaceApiResponseDetail responses={[record]} />;
  };

  return (
    <ProCard bordered={false} bodyStyle={{ padding: 0 }}>
      <MyProTable
        toolBarRender={() => [
          <Button
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
        dataSource={originDataSource}
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
