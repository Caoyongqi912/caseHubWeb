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
import { ProCard } from '@ant-design/pro-components';
import {
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

/* ============================================================
 * 常量区
 * ============================================================ */

/** 未分组模块的 key 前缀（后端约定的占位模块标识） */
const UNGROUPED_MODULE_PREFIX = 'ungrouped_module_';

/** 是否为未分组模块（不可编辑、不可拖入） */
const isUngroupedModule = (key: string | number): boolean =>
  String(key).startsWith(UNGROUPED_MODULE_PREFIX);

/** 模块操作类型枚举 */
type HandleAction = { title: string; key: number };
const Handle: Record<string, HandleAction> = {
  AddRoot: { title: '新增模块', key: 1 },
  AddChild: { title: '新增子模块', key: 2 },
  EditModule: { title: '编辑模块', key: 3 },
  RemoveModule: { title: '删除模块', key: 4 },
};

/* ============================================================
 * 组件 Props
 * ============================================================ */

interface IProps {
  currentProjectId?: number;
  moduleType: number;
  onModuleChange: (moduleId: number | undefined) => void;
  /**
   * 外部刷新触发器
   * 通常由父级传入一个递增的 number，每次变化时重新拉取目录
   * 用于在跨组件的写操作（用例上传/导入等）完成后联动刷新本目录
   * 不传则只在 currentProjectId/moduleType 变化时刷新（兼容历史用法）
   */
  reloadKey?: number;
}

/* ============================================================
 * 计数徽标：纯数字 + tabular-nums，避免位数变化时抖动
 * ============================================================ */

const CountBadge: FC<{ value: number; color: string }> = ({ value, color }) => (
  <span
    style={{
      minWidth: 20,
      height: 18,
      padding: '0 6px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum"',
      letterSpacing: 0.2,
      color,
      background: `${color}14`,
    }}
  >
    {value}
  </span>
);

/* ============================================================
 * 工具：递归扁平化树节点
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
 * 主组件：ModuleTree
 * ============================================================ */

const ModuleTree: FC<IProps> = ({
  currentProjectId,
  moduleType,
  onModuleChange,
  reloadKey,
}) => {
  const { isAdmin } = useAccess();
  const { colors } = useGlassStyles();

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

  // -------- 主题感知 --------
  // 派生 isDark：与 useGlassStyles 内部的判定方式保持一致
  const isDark = useMemo(
    () => colors.bgContainer === '#141414' || colors.bgLayout === '#000',
    [colors.bgContainer, colors.bgLayout],
  );

  const styles = useMemo(
    () => ({
      // —— 头部卡 ——
      headerCard: {
        position: 'relative' as const,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        background: isDark
          ? `linear-gradient(140deg, ${colors.bgContainer} 0%, ${colors.primary}10 60%, ${colors.bgContainer} 100%)`
          : `linear-gradient(140deg, ${colors.bgContainer} 0%, ${colors.primary}06 60%, ${colors.bgContainer} 100%)`,
        overflow: 'hidden' as const,
      },
      headerTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
      },
      titleGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 2,
        minWidth: 0,
        flex: 1,
      },
      titleText: {
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: colors.text,
        lineHeight: 1.3,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      titleHint: {
        fontSize: 11,
        color: colors.textTertiary,
        fontWeight: 500,
        letterSpacing: 0.2,
        lineHeight: 1.4,
      },
      newButton: {
        height: 26,
        padding: '0 10px',
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 6,
        background: colors.gradientPrimary,
        border: 'none',
        boxShadow: `0 2px 8px ${colors.primaryGlow}`,
        color: '#fff',
        flexShrink: 0,
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // —— 搜索容器（带 1px 渐变描边）——
      searchWrap: {
        position: 'relative' as const,
        borderRadius: 8,
        padding: 1,
        background: isDark
          ? `linear-gradient(135deg, ${colors.border} 0%, ${colors.primary}30 100%)`
          : `linear-gradient(135deg, ${colors.border} 0%, ${colors.primary}22 100%)`,
        transition: 'background 0.2s ease',
      },
      // —— 树容器 ——
      treeCard: {
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
        background: colors.bgContainer,
        position: 'relative' as const,
      },
      // —— 底部状态栏 ——
      footer: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 12px',
        borderRadius: 8,
        background: colors.bgElevated,
        border: `1px solid ${colors.borderLight}`,
        fontSize: 11,
      },
      footerStat: {
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        color: colors.textSecondary,
        fontWeight: 500,
      },
      footerValue: {
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        fontWeight: 700,
        color: colors.text,
        fontSize: 12,
      },
      footerDivider: {
        width: 1,
        height: 10,
        background: colors.border,
      },
    }),
    [colors, isDark],
  );

  // -------- 副作用：拉取模块树 --------
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
    // 依赖：项目 id、模块类型、组件内 reload 计数、父级传入的 reloadKey
    // reloadKey 用于响应跨组件的写操作（如上传/导入用例）触发的目录刷新
  }, [currentProjectId, moduleType, reload, reloadKey]);

  /** 深度判断指定 id 是否存在于树中（用于恢复 localStorage 中的选中项） */
  const checkModuleExists = (list: IModule[], id: number): boolean =>
    list.some(
      (m) => m.key === id || (m.children && checkModuleExists(m.children, id)),
    );

  // -------- 构造 Antd Tree 所需的数据结构 --------
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

  // -------- 统计 / 派生数据 --------
  const flatModules = useMemo(() => flattenModules(modules), [modules]);
  const totalCount = modules.length;
  const folderCount = modules.filter((m) => m.children?.length).length;

  // 当前选中的模块标题
  const selectedTitle = useMemo(() => {
    const found = flatModules.find((m) => selectedKeys.includes(m.key));
    return found?.title;
  }, [flatModules, selectedKeys]);

  // 搜索时是否有匹配
  const hasNoSearchResult = useMemo(() => {
    if (!searchValue) return false;
    return !flatModules.some((m) => String(m.title).includes(searchValue));
  }, [searchValue, flatModules]);

  /* ============================================================
   * 业务回调区
   * ============================================================ */

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

  /** 删除模块（带二次确认） */
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
   * 生成节点下拉菜单
   * 未分组模块不显示编辑和删除菜单
   */
  const menuItems = (node: IModule): MenuProps['items'] => {
    const nodeKey = String(node.key);
    if (isUngroupedModule(nodeKey)) return [];

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
        label: <span style={{ color: colors.error }}>删除</span>,
        onClick: () => handleDelete(node),
      },
    ];
  };

  /**
   * 自定义树节点渲染
   * 纯文字驱动：依靠 weight / 颜色 / 计数 / 选中态左侧条 区分节点类型
   */
  const TreeTitleRender = (node: any) => {
    const nodeKey = String(node.key);
    const isUngrouped = isUngroupedModule(nodeKey);
    const isSelected = selectedKeys.includes(node.key);
    const isHovered = currentModule?.key === node.key;
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
          padding: '4px 8px 4px 10px',
          margin: '1px 0',
          borderRadius: 6,
          background: isSelected
            ? isDark
              ? `linear-gradient(90deg, ${colors.primary}24 0%, ${colors.primary}0a 100%)`
              : `linear-gradient(90deg, ${colors.primary}18 0%, ${colors.primary}04 100%)`
            : isHovered
            ? isDark
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.03)'
            : 'transparent',
          transition: 'background 0.18s ease',
          cursor: 'pointer',
        }}
        onClick={() => setCurrentModule(node)}
      >
        {/* 选中态：左侧 2px 渐变激活条 */}
        {isSelected && (
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 5,
              bottom: 5,
              width: 2,
              borderRadius: 1,
              background: colors.primary,
            }}
          />
        )}

        {/* 左侧：标题 */}
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
              ? colors.textTertiary
              : isSelected
              ? colors.primary
              : colors.text,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={String(node.title)}
        >
          {node.title}
        </Text>

        {/* 右侧：徽标 + 行内操作 */}
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
            <CountBadge value={node.count} color={colors.primary} />
          )}

          {isAdmin && !isUngrouped && (
            <span
              className="module-tree-row-actions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                // 平时透明，hover 行才显示（CSS 控制）
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
                    color: colors.primary,
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
                    color: colors.textSecondary,
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

  /** Modal 提交：根据操作类型分发到对应 API */
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
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          {/* —— 头部：标题 + 计数 + 新建按钮 + 搜索 —— */}
          <ProCard
            size="small"
            style={styles.headerCard}
            styles={{ body: { padding: 12 } }}
            hoverable={false}
          >
            <div style={styles.headerTopRow}>
              <div style={styles.titleGroup}>
                <span style={styles.titleText}>模块目录</span>
                <span style={styles.titleHint}>
                  {selectedTitle
                    ? `已选 · ${selectedTitle}`
                    : '点击模块查看用例'}
                </span>
              </div>

              {isAdmin && (
                <Tooltip title="新建根模块" mouseEnterDelay={0.4}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setHandleModule(Handle.AddRoot);
                      setCurrentModule(null);
                      setOpen(true);
                    }}
                    style={styles.newButton}
                  >
                    新建
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* 搜索框：渐变外框 */}
            <div style={styles.searchWrap}>
              <Search
                placeholder="搜索模块…"
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
                style={{
                  width: '100%',
                  borderRadius: 7,
                  background: colors.bgContainer,
                }}
                size="middle"
              />
            </div>
          </ProCard>

          {/* —— 树列表 —— */}
          <ProCard
            size="small"
            styles={{
              body: {
                padding: '6px 4px 6px 2px',
                maxHeight: 'calc(100vh - 420px)',
                minHeight: 200,
                overflowY: 'auto',
              },
            }}
            style={styles.treeCard}
            hoverable={false}
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
                  color: colors.textTertiary,
                }}
              >
                <span style={{ fontSize: 12 }}>
                  没有匹配 “{searchValue}” 的模块
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
                draggable={{
                  icon: false,
                  nodeDraggable: (node) => !isUngroupedModule(String(node.key)),
                }}
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
                switcherIcon={({ expanded }) => (
                  // 细线 chevron：SVG 描边 + 旋转动画，替代原 ▾ 字符
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 14,
                      height: 14,
                      color: expanded ? colors.primary : colors.textTertiary,
                      transition: 'color 0.2s ease, transform 0.2s ease',
                      transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 1.5L6 4.5L2.5 7.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              />
            )}
          </ProCard>

          {/* —— 底部状态栏（仅文字 + 数字）—— */}
          <div style={styles.footer}>
            <span style={styles.footerStat}>
              <span style={styles.footerValue}>{totalCount}</span>
              <span>模块</span>
            </span>
            <span style={styles.footerDivider} />
            <span style={styles.footerStat}>
              <span style={styles.footerValue}>{folderCount}</span>
              <span>文件夹</span>
            </span>
            {selectedTitle && (
              <>
                <span style={styles.footerDivider} />
                <span
                  style={{
                    ...styles.footerStat,
                    color: colors.textTertiary,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={selectedTitle}
                >
                  选中 · {selectedTitle}
                </span>
              </>
            )}
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

      {/* —— 组件级样式：行 hover 显示行内操作；为纯文字按钮加 hover 反馈 —— */}
      <style>{`
        .module-tree-node:hover .module-tree-row-actions {
          opacity: 1 !important;
        }
        .ant-tree .ant-tree-node-content-wrapper {
          width: 100%;
          overflow: hidden;
        }
        .ant-tree .ant-tree-node-content-wrapper:hover {
          background: transparent !important;
        }
        .ant-tree .ant-tree-node-selected {
          background: transparent !important;
        }
        .ant-tree .ant-tree-indent-unit::before {
          border-color: ${colors.borderLight} !important;
        }
        .ant-tree .ant-tree-switcher {
          width: 20px;
          height: 26px;
          line-height: 26px;
        }
        .ant-tree .ant-tree-node-content-wrapper {
          min-height: 26px;
          line-height: 26px;
        }
        .module-tree-iconbtn:hover {
          background: ${
            isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
          } !important;
        }
      `}</style>
    </>
  );
};

export default ModuleTree;
