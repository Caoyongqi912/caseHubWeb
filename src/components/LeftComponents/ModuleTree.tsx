import { IModule } from '@/api';
import {
  dropModule,
  insertModule,
  queryTreeModuleByProject,
  removeModule,
  updateModule,
} from '@/api/base';
import { useGlassStyles } from '@/components/Glass';
import EmptyModule from '@/components/LeftComponents/EmptyModule';
import {
  getLocalStorageModule,
  getParentKey,
  setLocalStorageModule,
} from '@/components/LeftComponents/func';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { useAccess } from '@@/exports';
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Dropdown,
  Input,
  MenuProps,
  message,
  Modal,
  Space,
  Tooltip,
  Tree,
  TreeProps,
  Typography,
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

const { Search } = Input;
const { Text } = Typography;

type HandleAction = { title: string; key: number };

const Handle: Record<string, HandleAction> = {
  AddRoot: { title: '新增模块', key: 1 },
  AddChild: { title: '新增子模块', key: 2 },
  EditModule: { title: '编辑模块', key: 3 },
  RemoveModule: { title: '删除模块', key: 4 },
};

interface IProps {
  currentProjectId?: number;
  moduleType: number;
  onModuleChange: (moduleId: number) => void;
}

const ModuleTree: FC<IProps> = ({
  currentProjectId,
  moduleType,
  onModuleChange,
}) => {
  const { isAdmin } = useAccess();
  const { colors } = useGlassStyles();
  const [reload, setReload] = useState(0);
  const [modules, setModules] = useState<IModule[]>([]);
  const [open, setOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<IModule | null>(null);
  const [handleModule, setHandleModule] = useState<HandleAction>(
    Handle.AddRoot,
  );
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  useEffect(() => {
    if (!currentProjectId) {
      setModules([]);
      setSelectedKeys([]);
      setExpandedKeys([]);
      return;
    }

    queryTreeModuleByProject(currentProjectId, moduleType).then(
      ({ code, data }) => {
        if (code === 0 && data) {
          setModules(data);
          const storageNum = getLocalStorageModule(moduleType);
          if (storageNum) {
            const moduleId = parseInt(storageNum);
            if (checkModuleExists(data, moduleId)) {
              onModuleChange(moduleId);
              setSelectedKeys([moduleId]);
              setExpandedKeys([moduleId]);
            }
          }
        }
      },
    );
  }, [currentProjectId, reload]);

  const checkModuleExists = (list: IModule[], id: number): boolean => {
    return list.some(
      (m) => m.key === id || (m.children && checkModuleExists(m.children, id)),
    );
  };

  const treeData = useMemo(() => {
    const buildTree = (data: IModule[]): any[] =>
      data.map((item) => ({
        title: item.title,
        key: item.key,
        count: (item as any).count,
        children: item.children ? buildTree(item.children) : undefined,
      }));
    return buildTree(modules);
  }, [modules]);

  const onDrop: TreeProps['onDrop'] = async (info: any) => {
    const { code } = await dropModule({
      id: info.dragNode.key,
      targetId: info.dropToGap ? null : info.node.key,
    });
    if (code === 0) setReload((r) => r + 1);
  };

  const handleDelete = (node: IModule) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后该模块下的所有内容将无法恢复，确定要继续吗？',
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        removeModule({ moduleId: node.key }).then(({ code, msg }) => {
          if (code === 0) {
            message.success(msg);
            setReload((r) => r + 1);
          }
        });
      },
    });
  };

  const menuItems = (node: IModule): MenuProps['items'] => [
    {
      key: 'edit',
      label: <Text style={{ color: colors.error }}>编辑</Text>,
      icon: <EditOutlined style={{ color: colors.primary }} />,
      onClick: () => {
        setOpen(true);
        setCurrentModule(node);
        setHandleModule(Handle.EditModule);
      },
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      label: <Text style={{ color: colors.error }}>删除</Text>,
      icon: <DeleteOutlined style={{ color: colors.error }} />,
      onClick: () => handleDelete(node),
    },
  ];

  const TreeTitleRender = (node: any) => {
    const isSelected = selectedKeys.includes(node.key);
    const isHovered = currentModule?.key === node.key;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderRadius: 4,
          margin: '2px 0',
          padding: '4px 8px',
          minHeight: 25,
          background: isSelected
            ? `${colors.primary}15`
            : isHovered
            ? colors.bgElevated
            : 'transparent',
          border: isSelected
            ? `1px solid ${colors.primary}30`
            : '1px solid transparent',
          transition: 'all 0.2s ease',
        }}
        onClick={() => setCurrentModule(node)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          {node.children ? (
            <FolderOutlined style={{ fontSize: 12, color: colors.primary }} />
          ) : (
            <FileTextOutlined
              style={{ fontSize: 12, color: colors.textSecondary }}
            />
          )}
          <Text
            strong
            style={{
              fontSize: 13,
              color: isSelected ? colors.primary : colors.text,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.title}
          </Text>
        </div>
        {node.count > 0 && (
          <Badge
            count={node.count}
            size="small"
            style={{ backgroundColor: colors.primary }}
          />
        )}
        {isAdmin && isHovered && (
          <Space size={2}>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentModule(node);
                setHandleModule(Handle.AddChild);
                setOpen(true);
              }}
              style={{ color: colors.primary }}
            />
            <Dropdown menu={{ items: menuItems(node) }} trigger={['click']}>
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        )}
      </div>
    );
  };

  const onModuleFinish = async ({ title }: { title: string }) => {
    if (!currentProjectId) return;

    const actions: Record<number, () => Promise<any>> = {
      [Handle.AddRoot.key]: () =>
        insertModule({
          title,
          project_id: currentProjectId,
          module_type: moduleType,
        }),
      [Handle.AddChild.key]: () =>
        currentModule
          ? insertModule({
              title,
              project_id: currentProjectId,
              module_type: moduleType,
              parent_id: currentModule.key,
            })
          : Promise.resolve(),
      [Handle.EditModule.key]: () =>
        currentModule
          ? updateModule({ id: currentModule.key, title })
          : Promise.resolve(),
    };

    const result = await actions[handleModule.key]?.();
    if (result?.code === 0) {
      message.success(result.msg);
      setOpen(false);
      setReload((r) => r + 1);
    }
  };

  const onSelect = (_: any, info: any) => {
    const nodeKey = info.node.key;
    setSelectedKeys([nodeKey]);
    onModuleChange(nodeKey);
    setLocalStorageModule(moduleType, nodeKey);
  };

  return (
    <>
      <ModuleModal
        title={handleModule.title}
        open={open}
        onFinish={onModuleFinish}
        setOpen={setOpen}
      />

      {modules.length > 0 ? (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <ProCard
            size="small"
            style={{
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: `linear-gradient(135deg, ${colors.bgContainer} 0%, ${colors.primary}08 100%)`,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryGlow} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderOpenOutlined style={{ fontSize: 16, color: '#fff' }} />
                </div>
                <Text strong style={{ fontSize: 14 }}>
                  模块目录
                </Text>
              </div>
              {isAdmin && (
                <Tooltip title="新建根模块">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setHandleModule(Handle.AddRoot);
                      setCurrentModule(null);
                      setOpen(true);
                    }}
                  >
                    新建
                  </Button>
                </Tooltip>
              )}
            </div>
            <Search
              placeholder="搜索模块..."
              prefix={
                <SearchOutlined style={{ color: colors.textSecondary }} />
              }
              allowClear
              variant="filled"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setExpandedKeys([]);
                } else {
                  const keys = treeData
                    .map((item: any) =>
                      item.title.indexOf(value) > -1
                        ? getParentKey(item.key, modules)
                        : null,
                    )
                    .filter(Boolean);
                  setExpandedKeys(keys as React.Key[]);
                }
                setAutoExpandParent(true);
              }}
              style={{ borderRadius: 6 }}
            />
          </ProCard>

          <ProCard
            size="small"
            bodyStyle={{
              padding: 8,
              maxHeight: 'calc(100vh - 400px)',
              overflowY: 'auto',
            }}
            style={{ borderRadius: 12, border: `1px solid ${colors.border}` }}
          >
            <Tree
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              draggable={isAdmin}
              blockNode
              onExpand={(keys) => {
                setExpandedKeys(keys);
                setAutoExpandParent(false);
              }}
              onDrop={onDrop}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              selectedKeys={selectedKeys}
              onSelect={onSelect}
              treeData={treeData}
              titleRender={TreeTitleRender}
            />
          </ProCard>

          <div
            style={{
              padding: '8px 12px',
              borderTop: `1px solid ${colors.borderLight}`,
              fontSize: 12,
              color: colors.textSecondary,
              textAlign: 'center',
              background: colors.bgElevated,
              borderRadius: '0 0 8px 8px',
            }}
          >
            <Space split={<span>•</span>} size={8}>
              <span>共 {modules.length} 个模块</span>
              <span>
                {modules.filter((m) => m.children?.length).length} 个文件夹
              </span>
            </Space>
          </div>
        </Space>
      ) : (
        isAdmin && (
          <EmptyModule
            currentProjectId={currentProjectId}
            moduleType={moduleType}
            callBack={() => setReload((r) => r + 1)}
          />
        )
      )}
    </>
  );
};

export default ModuleTree;
