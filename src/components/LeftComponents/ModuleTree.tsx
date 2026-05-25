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
  InboxOutlined,
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

/**
 * 未分组模块的 key 前缀
 * 后端返回格式：{key: "ungrouped_module_{module_type}", title: "未分组数据", ...}
 */
const UNGROUPED_MODULE_PREFIX = 'ungrouped_module_';

/**
 * 检查是否为未分组模块
 */
const isUngroupedModule = (key: string | number): boolean => {
  return String(key).startsWith(UNGROUPED_MODULE_PREFIX);
};

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
  onModuleChange: (moduleId: number | undefined) => void;
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

  /**
   * 拖拽排序结束处理
   * 不允许将节点拖拽到未分组模块上
   */
  const onDrop: TreeProps['onDrop'] = async (info: any) => {
    const targetKey = info.node.key;
    if (isUngroupedModule(targetKey)) {
      message.warning('无法将模块移动到未分组数据中');
      return;
    }

    const { code } = await dropModule({
      id: info.dragNode.key,
      targetId: info.dropToGap ? null : info.node.key,
    });
    if (code === 0) setReload((r) => r + 1);
  };

  const handleDelete = (node: IModule) => {
    if (isUngroupedModule(node.key)) {
      message.warning('未分组数据模块无法删除');
      return;
    }

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

  /**
   * 生成节点右键菜单
   * 未分组模块不显示编辑和删除菜单
   */
  const menuItems = (node: IModule): MenuProps['items'] => {
    const nodeKey = String(node.key);
    if (isUngroupedModule(nodeKey)) {
      return [];
    }

    return [
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
  };

  const TreeTitleRender = (node: any) => {
    const nodeKey = String(node.key);
    const isUngrouped = isUngroupedModule(nodeKey);
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
          {isUngrouped ? (
            <InboxOutlined
              style={{ fontSize: 12, color: colors.textTertiary }}
            />
          ) : node.children ? (
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
              color: isUngrouped
                ? colors.textTertiary
                : isSelected
                ? colors.primary
                : colors.text,
              fontStyle: isUngrouped ? 'italic' : 'normal',
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
        {isAdmin && isHovered && !isUngrouped && (
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

  /**
   * 选择节点处理
   * 未分组模块传递 undefined，其他模块传递对应的 key
   */
  const onSelect = (_: any, info: any) => {
    const nodeKey = info.node.key;
    setSelectedKeys([nodeKey]);

    if (isUngroupedModule(nodeKey)) {
      onModuleChange(undefined);
      setLocalStorageModule(moduleType, '');
    } else {
      onModuleChange(nodeKey as number);
      setLocalStorageModule(moduleType, String(nodeKey));
    }
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
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <ProCard
            size="small"
            style={{
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: `linear-gradient(135deg, ${colors.bgContainer} 0%, ${colors.primary}08 100%)`,
            }}
            styles={{ body: { padding: 16 } }}
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
            styles={{
              body: {
                padding: 8,
                maxHeight: 'calc(100vh - 400px)',
                overflowY: 'auto',
              },
            }}
            style={{ borderRadius: 12, border: `1px solid ${colors.border}` }}
          >
            <Tree
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              draggable={{
                icon: false,
                nodeDraggable: (node) => !isUngroupedModule(String(node.key)),
              }}
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
            <Space separator={<span>•</span>} size={8}>
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
