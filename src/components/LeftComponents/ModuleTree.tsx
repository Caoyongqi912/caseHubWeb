import { IModule } from '@/api';
import {
  dropModule,
  insertModule,
  queryTreeModuleByProject,
  removeModule,
  updateModule,
} from '@/api/base';
import EmptyModule from '@/components/LeftComponents/EmptyModule';
import {
  getLocalStorageModule,
  getParentKey,
  setLocalStorageModule,
} from '@/components/LeftComponents/func';
import ModuleModal from '@/components/LeftComponents/ModuleModal';
import { useAccess } from '@@/exports';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  message,
  Modal,
  theme,
  Tooltip,
  Tree,
  TreeProps,
  Typography,
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

const { Search } = Input;
const { Text } = Typography;
const { useToken } = theme;

/* ============================================================
 * 常量
 * ============================================================ */

const UNGROUPED_MODULE_PREFIX = 'ungrouped_module_';

const isUngroupedModule = (key: string | number): boolean =>
  String(key).startsWith(UNGROUPED_MODULE_PREFIX);

type HandleAction = { title: string; key: number };
const Handle: Record<string, HandleAction> = {
  AddRoot: { title: '新增模块', key: 1 },
  AddChild: { title: '新增子模块', key: 2 },
  EditModule: { title: '编辑模块', key: 3 },
  RemoveModule: { title: '删除模块', key: 4 },
};

/* ============================================================
 * 计数徽标
 * ============================================================ */

const CountBadge: FC<{ value: number; color: string }> = ({ value, color }) => (
  <span
    style={{
      minWidth: 18,
      height: 16,
      padding: '0 5px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color,
      background: `${color}14`,
    }}
  >
    {value}
  </span>
);

/* ============================================================
 * 工具
 * ============================================================ */

const flattenModules = (list: IModule[]): IModule[] => {
  const out: IModule[] = [];
  const walk = (xs: IModule[]) => {
    xs.forEach((x) => {
      out.push(x);
      if (x.children) walk(x.children);
    });
  };
  walk(list);
  return out;
};

/* ============================================================
 * Props
 * ============================================================ */

interface IProps {
  currentProjectId?: number;
  moduleType: number;
  onModuleChange: (moduleId: number | undefined) => void;
  reloadKey?: number;
}

/* ============================================================
 * ModuleTree
 * ============================================================ */

const ModuleTree: FC<IProps> = ({
  currentProjectId,
  moduleType,
  onModuleChange,
  reloadKey,
}) => {
  const { isAdmin } = useAccess();
  const { token } = useToken();

  // -------- 状态 --------
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
  const [searchValue, setSearchValue] = useState('');
  const [hoveredKey, setHoveredKey] = useState<React.Key | null>(null);

  // -------- 拉取数据 --------
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
  }, [currentProjectId, moduleType, reload, reloadKey]);

  const checkModuleExists = (list: IModule[], id: number): boolean =>
    list.some(
      (m) => m.key === id || (m.children && checkModuleExists(m.children, id)),
    );

  // -------- 派生数据 --------
  const treeData = useMemo(() => {
    const build = (data: IModule[]): any[] =>
      data.map((item) => ({
        title: item.title,
        key: item.key,
        count: (item as any).count,
        children: item.children ? build(item.children) : undefined,
      }));
    return build(modules);
  }, [modules]);

  const flatModules = useMemo(() => flattenModules(modules), [modules]);
  const totalCount = modules.length;
  const folderCount = modules.filter((m) => m.children?.length).length;

  const selectedTitle = useMemo(() => {
    const found = flatModules.find((m) => selectedKeys.includes(m.key));
    return found?.title;
  }, [flatModules, selectedKeys]);

  const hasNoSearchResult = useMemo(() => {
    if (!searchValue) return false;
    return !flatModules.some((m) => String(m.title).includes(searchValue));
  }, [searchValue, flatModules]);

  // -------- 业务回调 --------

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

  const menuItems = (node: IModule): MenuProps['items'] => {
    if (isUngroupedModule(String(node.key))) return [];
    return [
      {
        key: 'edit',
        label: '编辑',
        onClick: () => {
          setOpen(true);
          setCurrentModule(node);
          setHandleModule(Handle.EditModule);
        },
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: <span style={{ color: token.colorError }}>删除</span>,
        onClick: () => handleDelete(node),
      },
    ];
  };

  const TreeTitleRender = (node: any) => {
    const nodeKey = String(node.key);
    const isUngrouped = isUngroupedModule(nodeKey);
    const isSelected = selectedKeys.includes(node.key);
    const isHovered = hoveredKey === node.key;
    const isLeaf = !node.children;

    return (
      <div
        className="module-tree-node"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minWidth: 0,
          padding: '4px 8px',
          borderRadius: 6,
          // background: isSelected
          //   ? token.colorPrimaryBg
          //   : isHovered
          //   ? token.colorBgTextHover
          //   : 'transparent',
          transition: 'background 0.15s ease',
          cursor: 'pointer',
        }}
        onClick={() => setCurrentModule(node)}
        onMouseEnter={() => setHoveredKey(node.key)}
        onMouseLeave={() => setHoveredKey(null)}
      >
        {/* 选中态：左侧 3px 纯色条 */}
        {isSelected && (
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 6,
              bottom: 6,
              width: 3,
              borderRadius: 2,
              background: token.colorPrimary,
            }}
          />
        )}

        {/* 标题 */}
        <Text
          style={{
            fontSize: 13,
            lineHeight: 1.4,
            fontWeight: isSelected
              ? 600
              : isUngrouped
              ? 400
              : isLeaf
              ? 500
              : 600,
            fontStyle: isUngrouped ? 'italic' : 'normal',
            color: isUngrouped
              ? token.colorTextTertiary
              : isSelected
              ? token.colorPrimary
              : token.colorText,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingLeft: isSelected ? 6 : 0,
          }}
          title={String(node.title)}
        >
          {node.title}
        </Text>

        {/* 右侧：徽标 + 操作 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            marginLeft: 6,
          }}
        >
          {node.count > 0 && (
            <CountBadge value={node.count} color={token.colorPrimary} />
          )}

          {isAdmin && !isUngrouped && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Tooltip title="新增子模块" mouseEnterDelay={0.4}>
                <button
                  type="button"
                  aria-label="新增子模块"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentModule(node);
                    setHandleModule(Handle.AddChild);
                    setOpen(true);
                  }}
                  className="module-tree-iconbtn"
                  style={{
                    width: 20,
                    height: 20,
                    border: 'none',
                    background: 'transparent',
                    color: token.colorPrimary,
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                >
                  +
                </button>
              </Tooltip>
              <Dropdown
                menu={{ items: menuItems(node) }}
                trigger={['click']}
                placement="bottomRight"
              >
                <button
                  type="button"
                  aria-label="更多操作"
                  onClick={(e) => e.stopPropagation()}
                  className="module-tree-iconbtn"
                  style={{
                    width: 20,
                    height: 20,
                    border: 'none',
                    background: 'transparent',
                    color: token.colorTextSecondary,
                    fontSize: 12,
                    lineHeight: 1,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                >
                  ···
                </button>
              </Dropdown>
            </span>
          )}
        </div>
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

    if (isUngroupedModule(nodeKey)) {
      onModuleChange(undefined);
      setLocalStorageModule(moduleType, '');
    } else {
      onModuleChange(nodeKey as number);
      setLocalStorageModule(moduleType, String(nodeKey));
    }
  };

  /* ============================================================
   * 渲染
   * ============================================================ */

  return (
    <>
      <ModuleModal
        title={handleModule.title}
        open={open}
        onFinish={onModuleFinish}
        setOpen={setOpen}
      />

      {modules.length > 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 0,
          }}
        >
          {/* 头部：标题 + 按钮 + 统计/已选 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 标题行 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <Text strong style={{ fontSize: 15, letterSpacing: 0.2 }}>
                模块目录
              </Text>
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
                    style={{ flexShrink: 0 }}
                  >
                    新建
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* 统计/已选行 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: token.colorTextTertiary,
                  fontWeight: 500,
                }}
              >
                共 {totalCount} 个模块 · {folderCount} 个文件夹
              </span>
              {selectedTitle && (
                <>
                  <span style={{ color: token.colorBorder }}>·</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: token.colorPrimary,
                      fontWeight: 500,
                      background: token.colorPrimaryBg,
                      padding: '1px 8px',
                      borderRadius: 4,
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={selectedTitle}
                  >
                    {selectedTitle}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 搜索框 */}
          <Search
            placeholder="搜索模块…"
            variant="filled"
            allowClear
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
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
            size="middle"
          />

          {/* 树列表 */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              borderRadius: 8,
              // border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            {hasNoSearchResult ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 16px',
                  gap: 6,
                  color: token.colorTextTertiary,
                }}
              >
                <span style={{ fontSize: 12 }}>
                  没有匹配 "{searchValue}" 的模块
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setSearchValue('')}
                  style={{ fontSize: 12, padding: 0, height: 'auto' }}
                >
                  清除搜索
                </Button>
              </div>
            ) : (
              <Tree
                showLine={{ showLeafIcon: false }}
                showIcon={false}
                blockNode
                draggable={
                  isAdmin
                    ? {
                        icon: false,
                        nodeDraggable: (node) =>
                          !isUngroupedModule(String(node.key)),
                      }
                    : false
                }
                onExpand={(keys) => {
                  setExpandedKeys(keys);
                  setAutoExpandParent(false);
                }}
                onDrop={isAdmin ? onDrop : undefined}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                onSelect={onSelect}
                treeData={treeData}
                titleRender={TreeTitleRender}
              />
            )}
          </div>
        </div>
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
