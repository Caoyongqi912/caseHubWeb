import { IModuleEnum, IObjGet } from '@/api';
import {
  selectCommonGroups2Case,
  selectCommonGroups2ConditionAPI,
} from '@/api/inter/interCase';
import { pageInterfaceGroup } from '@/api/inter/interGroup';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { IInterfaceGroup } from '@/pages/Httpx/types';
import { ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import {
  FolderOutlined,
  NumberOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag, theme } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface SelfProps {
  projectId?: number;
  currentCaseId: number;
  condition_api_id?: number;
  refresh?: () => void;
}

const GroupApiChoiceTable: FC<SelfProps> = (props) => {
  const { token } = theme.useToken();
  const { currentCaseId, refresh, condition_api_id, projectId } = props;
  const actionRef = useRef<ActionType>();
  const [selectProjectId, setSelectProjectId] = useState<number | undefined>(
    projectId,
  );
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchInterfaceGroup = useCallback(
    async (params: any) => {
      const { code, data } = await pageInterfaceGroup({
        ...params,
        project_id: projectId,
        module_type: ModuleEnum.API,
      });
      return pageData(code, data);
    },
    [projectId],
  );

  useEffect(() => {
    queryProjectEnum(setProjectEnumMap).then();
  }, []);

  useEffect(() => {
    if (selectProjectId) {
      fetchModulesEnum(selectProjectId, ModuleEnum.API, setModuleEnum).then();
    }
  }, [selectProjectId]);

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
      apiNumTag: {
        borderRadius: 6,
        fontWeight: 500,
        padding: '4px 12px',
        backgroundColor: token.colorInfoBg,
        color: token.colorInfo,
        border: `1px solid ${token.colorInfoBorder}`,
      },
      creatorTag: {
        fontSize: 12,
        padding: '2px 10px',
        borderRadius: 12,
        backgroundColor: token.colorWarningBg,
        color: token.colorWarningText,
        border: `1px solid ${token.colorWarningBorder}`,
      },
      addBtn: {
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${token.colorPrimaryBg}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
    [token],
  );

  const columns: ProColumns<IInterfaceGroup>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
      initialValue: selectProjectId?.toString(),
      fieldProps: {
        disabled: true,
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module_id',
      hideInTable: true,
      valueType: 'treeSelect',
      fieldProps: {
        treeData: moduleEnum,
        fieldNames: {
          label: 'title',
        },
      },
    },
    {
      title: 'ID',
      dataIndex: 'uid',
      key: 'uid',
      width: 150,
      copyable: true,
      fixed: 'left',
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <FolderOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.name}
        </Tag>
      ),
    },
    {
      title: '接口数',
      dataIndex: 'api_num',
      key: 'api_num',
      width: 100,
      render: (_, record) => (
        <Tag style={styles.apiNumTag}>{record.api_num || 0}</Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      valueType: 'select',
      width: 120,
      renderFormItem: () => {
        return <UserSelect />;
      },
      render: (_, record) => (
        <Tag style={styles.creatorTag}>
          <UserOutlined style={{ marginRight: 4, opacity: 0.7 }} />
          {record.creatorName}
        </Tag>
      ),
    },
  ];

  const rowSelection: TableRowSelection<IInterfaceGroup> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <MyProTable
      tableAlertOptionRender={() => {
        return (
          <Space>
            <Button
              type="primary"
              style={styles.addBtn}
              icon={<PlusOutlined />}
              onClick={async () => {
                if (condition_api_id) {
                  const { code, msg } = await selectCommonGroups2ConditionAPI({
                    condition_api_id: condition_api_id,
                    group_id_list: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                  return;
                }
                if (currentCaseId) {
                  const { code, msg } = await selectCommonGroups2Case({
                    interface_case_id: currentCaseId,
                    api_group_id_list: selectedRowKeys as number[],
                  });
                  if (code === 0) {
                    message.success(msg);
                    refresh?.();
                  }
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${token.colorPrimaryBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${token.colorPrimaryBg}`;
              }}
            >
              确认添加
            </Button>
          </Space>
        );
      }}
      rowSelection={rowSelection}
      columns={columns}
      rowKey="id"
      x={1000}
      actionRef={actionRef}
      request={fetchInterfaceGroup}
    />
  );
};

export default GroupApiChoiceTable;
