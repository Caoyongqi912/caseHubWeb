import {
  copyInterApiById,
  outPutInter2Yaml,
  pageInterApi,
  removeInterApiById,
} from '@/api/inter';
import { useGlassStyles } from '@/components/Glass';
import UserSelect from '@/components/Table/UserSelect';
import CopyOrMoveModal from '@/pages/Httpx/Interface/InterfaceApiTable/CopyOrMoveModal';
import { IInterfaceAPI } from '@/pages/Httpx/types';
import { CONFIG, ModuleEnum } from '@/utils/config';
import { pageData } from '@/utils/somefunc';
import {
  ApiOutlined,
  CopyOutlined,
  DeleteOutlined,
  DeliveredProcedureOutlined,
  DownOutlined,
  EyeOutlined,
  LinkOutlined,
  MoreOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Dropdown,
  message,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { history } from 'umi';

const { Text } = Typography;

interface SelfProps {
  currentProjectId?: number;
  currentModuleId?: number;
  perKey: string;
}

const Index: FC<SelfProps> = ({
  currentModuleId,
  currentProjectId,
  perKey,
}) => {
  const styles = useGlassStyles();
  const actionRef = useRef<ActionType>();
  const [currentApiId, setCurrentApiId] = useState<number>();
  const [copyOrMove, setCopyOrMove] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const tagBaseStyle = {
    borderRadius: 6,
    fontSize: 12,
    padding: '4px 8px',
  };

  const uidTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 6,
  };

  const urlTextStyle = {
    fontFamily: 'monospace',
    color: styles.colors.primary,
    fontSize: 12,
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentModuleId, currentProjectId]);

  const fetchInterface = useCallback(
    async (params: any, sort: any) => {
      if (!currentModuleId) return;
      const { code, data } = await pageInterApi({
        ...params,
        module_id: currentModuleId,
        module_type: ModuleEnum.API,
        is_common: 1,
        sort: sort,
      });
      return pageData(code, data);
    },
    [currentModuleId],
  );

  const addBtnStyle = {
    height: 36,
    borderRadius: 8,
  };

  const columns: ProColumns<IInterfaceAPI>[] = [
    {
      title: '接口编号',
      dataIndex: 'uid',
      key: 'uid',
      fixed: 'left',
      width: '10%',
      copyable: true,
      render: (_, record) => (
        <Tag
          style={{
            ...uidTagStyle,
            background: `${styles.colors.primary}15`,
            color: styles.colors.primary,
          }}
        >
          <NumberOutlined />
          {record.uid}
        </Tag>
      ),
    },
    {
      title: '名称',
      dataIndex: 'interface_name',
      key: 'interface_name',
      fixed: 'left',
      ellipsis: true,
      width: '25%',
      render: (_, record) => (
        <Tag style={tagBaseStyle}>
          <ApiOutlined />
          {record.interface_name}
        </Tag>
      ),
    },
    {
      title: '路径',
      dataIndex: 'interface_url',
      key: 'interface_url',
      ellipsis: true,
      render: (_, record) => (
        <Text ellipsis style={urlTextStyle}>
          <LinkOutlined />
          {record.interface_url}
        </Text>
      ),
    },
    {
      title: '方法',
      dataIndex: 'interface_method',
      valueType: 'select',
      key: 'interface_method',
      valueEnum: CONFIG.API_METHOD_ENUM,
      filters: true,
      search: true,
      onFilter: true,
      width: '10%',

      render: (_, record) => {
        const methodConfig = CONFIG.API_METHOD_ENUM[record.interface_method];
        return (
          <Tag color={methodConfig?.color} style={tagBaseStyle}>
            {record.interface_method}
          </Tag>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'interface_level',
      key: 'interface_level',
      valueType: 'select',
      valueEnum: CONFIG.API_LEVEL_ENUM,
      search: false,
      filters: true,
      onFilter: true,
      width: '10%',

      render: (_, record) => {
        const levelConfig = CONFIG.API_LEVEL_ENUM[record.interface_level];
        return (
          <Tag
            color={levelConfig?.status === 'Success' ? 'success' : 'processing'}
            style={tagBaseStyle}
          >
            {record.interface_level}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'interface_status',
      valueType: 'select',
      key: 'interface_status',
      search: false,
      filters: true,
      onFilter: true,
      width: '10%',

      valueEnum: CONFIG.API_STATUS_ENUM,
      render: (_, record) =>
        CONFIG.API_STATUS_ENUM[record.interface_status].tag,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: '8%',

      valueType: 'select',
      renderFormItem: () => <UserSelect />,
      render: (_, record) => (
        <Tag style={{ ...tagBaseStyle, borderRadius: 12 }}>
          {record.creatorName}
        </Tag>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '10%',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              history.push(
                `/interface/interApi/detail?interId=${record.id}&projectId=${currentProjectId}&moduleId=${currentModuleId}`,
              );
            }}
          >
            详情
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: '复制接口',
                  icon: <CopyOutlined />,
                  onClick: async () => {
                    const { code, msg } = await copyInterApiById(record.id);
                    if (code === 0) {
                      message.success(msg || '复制成功');
                      actionRef.current?.reload();
                    }
                  },
                },
                {
                  key: '3',
                  label: '复制至',
                  icon: <CopyOutlined />,
                  onClick: () => {
                    setCurrentApiId(record.id);
                    setCopyOrMove(1);
                    setOpenModal(true);
                  },
                },
                {
                  key: '2',
                  label: '移动至',
                  icon: <DeliveredProcedureOutlined />,
                  onClick: () => {
                    setCurrentApiId(record.id);
                    setCopyOrMove(2);
                    setOpenModal(true);
                  },
                },
                { type: 'divider' },
                {
                  key: '4',
                  icon: <DeleteOutlined />,
                  danger: true,
                  label: (
                    <Popconfirm
                      title="确认删除？"
                      description="删除后数据将无法恢复"
                      okText="确认删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        const { code, msg } = await removeInterApiById(
                          record.id,
                        );
                        if (code === 0) {
                          message.success(msg || '删除成功');
                          actionRef.current?.reload();
                        }
                      }}
                    >
                      <a>删除</a>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const ToolBarRender = [
    <Button
      key="add"
      hidden={currentModuleId === undefined}
      type="primary"
      style={addBtnStyle}
      icon={<PlusOutlined />}
      onClick={() => {
        history.push(
          `/interface/interApi/detail?projectId=${currentProjectId}&moduleId=${currentModuleId}`,
        );
      }}
    >
      添加接口
    </Button>,
    <Button
      key="export"
      type="primary"
      style={addBtnStyle}
      icon={<DownOutlined />}
      onClick={async () => {
        if (currentModuleId) {
          await outPutInter2Yaml(currentModuleId);
        } else {
          message.warning('请选择模块');
        }
      }}
    >
      接口导出
    </Button>,
  ];
  return (
    <>
      <CopyOrMoveModal
        open={openModal}
        currentApiId={currentApiId}
        copyOrMove={copyOrMove}
        actionRef={actionRef}
        onCancel={() => setOpenModal(false)}
      />

      <div style={{ height: 'calc(100vh - 240px)' }}>
        <ProTable
          persistenceKey={perKey}
          columns={columns}
          rowKey="id"
          actionRef={actionRef}
          scroll={{ x: 1200, y: 'fill' }}
          //@ts-ignore
          request={fetchInterface}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          search={{ defaultCollapsed: true, labelWidth: 'auto' }}
          toolBarRender={() => ToolBarRender}
        />
      </div>
    </>
  );
};

export default Index;
