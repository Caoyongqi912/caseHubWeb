import { queryInterfaceGroupApis } from '@/api/inter/interGroup';
import MyDrawer from '@/components/MyDrawer';
import MyProTable from '@/components/Table/MyProTable';
import InterfaceApiDetail from '@/pages/Httpx/Interface/InterfaceApiDetail';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG } from '@/utils/config';
import { queryData } from '@/utils/somefunc';
import {
  ApiOutlined,
  FlagOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { theme } from 'antd';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

interface SelfProps {
  groupId: number;
}

const GroupInterfaceTable: FC<SelfProps> = (props) => {
  const { groupId } = props;
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();

  const [showAPIDetail, setShowAPIDetail] = useState(false);
  const [currentApiId, setCurrentApiId] = useState<number>();

  const styles = useMemo(
    () => ({
      idTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 6,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBorder} 100%)`,
        color: token.colorPrimary,
        border: `1px solid ${token.colorPrimaryBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      nameTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        fontSize: 13,
        fontWeight: 500,
        color: token.colorText,
      },
      levelTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 12,
      },
      creatorTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: 16,
        background: `linear-gradient(135deg, ${token.colorWarningBg} 0%, ${token.colorWarningBorder} 100%)`,
        color: token.colorWarningText,
        fontWeight: 500,
        fontSize: 12,
        border: `1px solid ${token.colorWarningBorder}`,
      },
    }),
    [token],
  );

  const levelColors = useMemo(
    () => ({
      P0: { bg: '#fff1f0', border: '#ffa39e', color: '#cf1322' },
      P1: { bg: '#fff7e6', border: '#ffd591', color: '#d46b08' },
      P2: { bg: '#e6f7ff', border: '#91d5ff', color: '#096dd9' },
      P3: { bg: '#f6ffed', border: '#b7eb8f', color: '#389e0d' },
    }),
    [],
  );

  const fetchInterface = useCallback(async () => {
    if (groupId) {
      const { code, data } = await queryInterfaceGroupApis(groupId);
      return queryData(code, data);
    }
  }, [groupId]);

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '12%',
      render: (_, record) => {
        return (
          <span
            style={styles.idTag}
            onClick={() => {
              setCurrentApiId(record.id);
              setShowAPIDetail(true);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${token.colorPrimaryBg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                'inset 0 1px 0 rgba(255,255,255,0.1)';
            }}
          >
            <NumberOutlined style={{ fontSize: 11 }} />
            {record.uid}
          </span>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: '18%',
      render: (_, record) => (
        <span style={styles.nameTag}>
          <ApiOutlined style={{ color: token.colorPrimary, fontSize: 12 }} />
          {record.name}
        </span>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: '12%',
      render: (_, record) => {
        const levelConfig =
          levelColors[record.level as keyof typeof levelColors] ||
          levelColors.P2;
        return (
          <span
            style={{
              ...styles.levelTag,
              backgroundColor: levelConfig.bg,
              border: `1px solid ${levelConfig.border}`,
              color: levelConfig.color,
            }}
          >
            <FlagOutlined style={{ fontSize: 11 }} />
            {record.level}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: '12%',
      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: '12%',
      render: (_, record) => (
        <span style={styles.creatorTag}>
          <UserOutlined style={{ fontSize: 11 }} />
          {record.creatorName}
        </span>
      ),
    },
  ];

  return (
    <>
      <MyDrawer
        width={'75%'}
        name={''}
        open={showAPIDetail}
        setOpen={setShowAPIDetail}
      >
        <InterfaceApiDetail interfaceId={currentApiId} callback={() => {}} />;
      </MyDrawer>
      <MyProTable
        columns={columns}
        search={false}
        rowKey={'id'}
        x={800}
        actionRef={actionRef}
        request={fetchInterface}
      />
    </>
  );
};

export default GroupInterfaceTable;
