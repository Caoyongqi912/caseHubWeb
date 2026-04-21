import { IModuleEnum } from '@/api';
import { pageApiTask } from '@/api/inter/interTask';
import MyProTable from '@/components/Table/MyProTable';
import { IInterfaceAPI, IInterfaceAPITask } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import { ApiOutlined, UserOutlined } from '@ant-design/icons';
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

const ApiTaskChoiceTable: FC<IProps> = ({ setJobs, currentProjectId }) => {
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
        background: `linear-gradient(135deg, #6366f1 0%, #818cf8 100%)`,
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
      ModuleEnum.API_TASK,
      setApiModuleEnum,
    ).then();
  }, [currentProjectId]);

  const taskColumns: ProColumns<IInterfaceAPITask>[] = [
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
      dataIndex: 'interface_task_title',
      key: 'interface_task_titletitle',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApiOutlined style={{ color: '#6366f1', fontSize: 14 }} />
          <span style={styles.titleTag}>
            {record.interface_task_title || '未命名任务'}
          </span>
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

  const fetchPageTasks = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageApiTask({
      ...params,
      module_type: ModuleEnum.API_TASK,
      sort: sort,
    });
    return pageData(code, data);
  }, []);

  const rowSelection: TableRowSelection<IInterfaceAPI> = {
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
            <ApiOutlined style={{ color: token.colorPrimary }} />
            <Text style={{ fontSize: 13 }}>已选择</Text>
            <span style={styles.selectedCount}>{selectedRowKeys.length}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              个 API 测试任务
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
        request={fetchPageTasks}
      />
    </div>
  );
};

export default ApiTaskChoiceTable;
