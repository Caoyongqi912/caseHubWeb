import { IModuleEnum } from '@/api';
import { pagePlayTask } from '@/api/play/playTask';
import MyProTable from '@/components/Table/MyProTable';
import { IUITask } from '@/pages/Play/componets/uiTypes';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { DesktopOutlined, UserOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { theme, Typography } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const { useToken } = theme;
const { Text } = Typography;

interface IProps {
  currentProjectId?: number;
  setJobs: (rowKeys: React.Key[]) => void;
}

const PlayTaskChoiceTable: FC<IProps> = ({ currentProjectId, setJobs }) => {
  const { token } = useToken();
  const actionRef = useRef<ActionType>();
  const [apiModuleEnum, setApiModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const styles = useMemo(
    () => ({
      container: {
        padding: 14,
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: '8px 12px',
        background: token.colorPrimaryBg,
        borderRadius: 8,
      },
      selectedInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      selectedCount: {
        padding: '2px 8px',
        borderRadius: 4,
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
      uidTag: {
        padding: '2px 8px',
        borderRadius: 4,
        background: `linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)`,
        color: '#fff',
        fontSize: 11,
        fontWeight: 500,
      },
      titleTag: {
        padding: '2px 8px',
        borderRadius: 4,
        background: token.colorPrimaryBg,
        color: token.colorPrimary,
        fontSize: 12,
        fontWeight: 500,
      },
      creatorTag: {
        padding: '2px 8px',
        borderRadius: 4,
        background: token.colorFillAlter,
        color: token.colorTextSecondary,
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      },
    }),
    [token],
  );

  useEffect(() => {
    if (!currentProjectId) return;
    fetchModulesEnum(
      currentProjectId,
      ModuleEnum.UI_TASK,
      setApiModuleEnum,
    ).then();
  }, [currentProjectId]);

  const taskColumns: ProColumns<IUITask>[] = [
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: apiModuleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: '任务编号',
      dataIndex: 'uid',
      key: 'uid',
      width: 140,
      render: (_, record) => (
        <span style={styles.uidTag}>{record.uid?.slice(0, 8)}</span>
      ),
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DesktopOutlined style={{ color: '#10b981', fontSize: 14 }} />
          <span style={styles.titleTag}>{record.title || '未命名任务'}</span>
        </div>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      width: 120,
      render: (_, record) => (
        <span style={styles.creatorTag}>
          <UserOutlined style={{ fontSize: 10 }} />
          {record.creatorName || '-'}
        </span>
      ),
    },
  ];

  const fetchPageUITaskTable = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pagePlayTask({
      module_type: ModuleEnum.UI_TASK,
      sort: sort,
      ...params,
    });
    return pageData(code, data);
  }, []);

  const rowSelection: TableRowSelection<IUITask> = {
    selectedRowKeys,
    type: 'checkbox',
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setJobs(newSelectedRowKeys);
    },
  };

  return (
    <div style={styles.container}>
      {selectedRowKeys.length > 0 && (
        <div style={styles.header}>
          <div style={styles.selectedInfo}>
            <DesktopOutlined style={{ color: token.colorPrimary }} />
            <Text style={{ fontSize: 13 }}>已选择</Text>
            <span style={styles.selectedCount}>{selectedRowKeys.length}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              个 UI 测试任务
            </Text>
          </div>
        </div>
      )}
      <MyProTable
        pagination={{
          defaultPageSize: 10,
        }}
        actionRef={actionRef}
        rowSelection={rowSelection}
        columns={taskColumns}
        rowKey={'uid'}
        request={fetchPageUITaskTable}
      />
    </div>
  );
};

export default PlayTaskChoiceTable;
