import { IModuleEnum, IObjGet } from '@/api';
import { pageInterApi } from '@/api/inter';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import UserSelect from '@/components/Table/UserSelect';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { fetchModulesEnum, pageData } from '@/utils/somefunc';
import {
  ApiOutlined,
  NumberOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, theme } from 'antd';
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
  radio?: boolean;
  onSelect: (value: number[], copy: boolean) => Promise<any>;
  onlyQuote?: boolean;
}

const InterfaceCaseChoiceApiTable: FC<SelfProps> = ({
  projectId,
  onSelect,
  radio = false,
  onlyQuote = false,
}) => {
  const { token } = theme.useToken();
  const actionRef = useRef<ActionType>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const [moduleEnum, setModuleEnum] = useState<IModuleEnum[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (!projectId) return;
    queryProjectEnum(setProjectEnumMap).then(async () => {
      await fetchModulesEnum(projectId, ModuleEnum.API, setModuleEnum).then();
    });
  }, [projectId]);

  const fetchInterface = useCallback(
    async (params: any, sort: any) => {
      const searchData = {
        ...params,
        project_id: projectId,
        module_type: ModuleEnum.API,
        is_common: 1,
        sort: sort,
      };
      const { code, data } = await pageInterApi(searchData);
      return pageData(code, data);
    },
    [projectId],
  );

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

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '项目',
      dataIndex: 'project_id',
      hideInTable: true,
      hideInSearch: true,
      valueType: 'select',
      valueEnum: projectEnumMap,
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
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      width: 140,
      copyable: true,
      render: (_, record) => (
        <span style={styles.idTag}>
          <NumberOutlined style={{ fontSize: 10, opacity: 0.7 }} />
          {record.uid}
        </span>
      ),
    },
    {
      title: '名称',
      dataIndex: 'interface_name',
      key: 'interface_name',
      width: 200,
      render: (_, record) => (
        <Tag style={styles.nameTag}>
          <ApiOutlined style={{ marginRight: 6, opacity: 0.6 }} />
          {record.interface_name}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'interface_level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      width: 100,
      render: (_, record) => (
        <Tag
          color={
            CONFIG.API_LEVEL_ENUM[record.interface_level]?.status === 'Success'
              ? 'success'
              : 'processing'
          }
          style={{ borderRadius: 6, fontSize: 12, padding: '4px 12px' }}
        >
          {record.interface_level}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'interface_status',
      valueType: 'select',
      valueEnum: CONFIG.API_STATUS_ENUM,
      width: 100,
      render: (_, record) => {
        return CONFIG.API_STATUS_ENUM[record.interface_status].tag;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
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

  const rowSelection: TableRowSelection<IInterfaceAPI> = {
    selectedRowKeys,
    type: radio ? 'radio' : 'checkbox',
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <MyProTable
      tableAlertOptionRender={() => {
        return (
          <Space>
            {!onlyQuote && (
              <Button
                type="primary"
                style={styles.addBtn}
                icon={<PlusOutlined />}
                onClick={async () => {
                  await onSelect(selectedRowKeys as number[], true);
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
                复制添加
              </Button>
            )}

            <Button
              type="primary"
              style={styles.addBtn}
              icon={<PlusOutlined />}
              onClick={async () => {
                await onSelect(selectedRowKeys as number[], false);
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
              引用添加
            </Button>
          </Space>
        );
      }}
      rowSelection={rowSelection}
      columns={columns}
      rowKey="id"
      actionRef={actionRef}
      request={fetchInterface}
    />
  );
};

export default InterfaceCaseChoiceApiTable;
