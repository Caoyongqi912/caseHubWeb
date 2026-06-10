import {
  deletePlanModule,
  insertPlanModule,
  movePlanModule,
  updatePlanModule,
} from '@/api/case/caseplan';
import type { IPlanModule } from '@/pages/CaseHub/types';
import { useAccess } from '@@/exports';
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import { Dropdown, message, Modal, theme, Tooltip, Tree } from 'antd';
import type { AntTreeNodeProps, DataNode, TreeProps } from 'antd/es/tree';
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ModuleEditModal from './ModuleEditModal';

const { useToken } = theme;

interface PlanModuleProps {
  planModules: IPlanModule[];
  planId?: string;
  onModulesChange?: () => void;
  onSelect?: (moduleId: number | null) => void;
}

interface TreeDataNode extends DataNode {
  key: number;
  data: IPlanModule;
  isRoot?: boolean;
}

const ROOT_ORDER = 0;
const TREE_CLASS = 'plan-module-tree';

type ModalMode = 'add' | 'edit';

interface ModalState {
  visible: boolean;
  mode: ModalMode;
  parentId?: number;
  moduleId?: number;
  initialTitle?: string;
}

const createModalState = (overrides: Partial<ModalState> = {}): ModalState => ({
  visible: false,
  mode: 'add',
  ...overrides,
});

/**
 * 计划目录
 * - 渲染:树形结构、选中、hover、整行高亮、0 弱化
 * - 写操作(新增/重命名/删除/拖拽)仅 isAdmin 可见
 * - 数据变化后通过 onModulesChange 通知父组件刷新
 */
const Index: FC<PlanModuleProps> = ({
  planModules,
  planId,
  onModulesChange,
  onSelect,
}) => {
  const { token } = useToken();
  const { isAdmin } = useAccess();

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [activeKey, setActiveKey] = useState<React.Key | null>(null);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>(createModalState());
  const isInitializedRef = useRef(false);

  const isRootNode = (module: IPlanModule) =>
    module.parent_id === null && module.order === ROOT_ORDER;

  /** 从 planModules 派生 TreeData（不需要 state） */
  const treeData = useMemo<TreeDataNode[]>(() => {
    if (!planModules?.length) return [];
    const build = (modules: IPlanModule[]): TreeDataNode[] =>
      modules.map((module) => ({
        key: module.id,
        data: module,
        isRoot: isRootNode(module),
        icon: (props: AntTreeNodeProps) =>
          props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
        children: module.children ? build(module.children) : undefined,
      }));
    return build(planModules);
  }, [planModules]);

  /** 首次加载时初始化展开 / 选中根节点 */
  useEffect(() => {
    if (!planModules?.length) {
      setActiveKey(null);
      isInitializedRef.current = false;
      return;
    }
    if (isInitializedRef.current) return;
    const rootId = planModules[0]?.id;
    setExpandedKeys(rootId ? [rootId] : []);
    setActiveKey(rootId ?? null);
    onSelect?.(rootId ?? null);
    isInitializedRef.current = true;
  }, [planModules, onSelect]);

  // ===== 写操作(仅 admin) =====

  const resetModal = useCallback(() => setModalState(createModalState()), []);

  const openAddModal = useCallback(
    (parentId: number) =>
      setModalState(createModalState({ visible: true, mode: 'add', parentId })),
    [],
  );

  const openEditModal = useCallback(
    (moduleId: number, title: string) =>
      setModalState(
        createModalState({
          visible: true,
          mode: 'edit',
          moduleId,
          initialTitle: title,
        }),
      ),
    [],
  );

  /** 提交编辑表单(新增 / 重命名二选一) */
  const handleModalFinish = useCallback(
    async (values: { title: string }): Promise<boolean> => {
      const title = values.title.trim();
      if (!title) return false;
      try {
        if (modalState.mode === 'add') {
          await insertPlanModule({
            plan_id: Number(planId),
            title,
            order: treeData.length + 1,
            parent_id: modalState.parentId!,
          });
          message.success('创建成功');
        } else {
          await updatePlanModule({ id: modalState.moduleId!, title });
          message.success('修改成功');
        }
        resetModal();
        onModulesChange?.();
        return true;
      } catch {
        message.error(modalState.mode === 'add' ? '创建失败' : '修改失败');
        return false;
      }
    },
    [modalState, planId, treeData.length, resetModal, onModulesChange],
  );

  /** 删除目录 */
  const handleDeleteModule = useCallback(
    (moduleId: number) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该目录吗?删除后将无法恢复。',
        okText: '确认',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await deletePlanModule({ module_id: moduleId });
            message.success('删除成功');
            onModulesChange?.();
          } catch {
            message.error('删除失败');
          }
        },
      });
    },
    [onModulesChange],
  );

  /** 拖拽排序 */
  const handleDragEnd = useCallback(
    async (info: any) => {
      const dragNode = info.dragNode as TreeDataNode;
      const targetNode = info.node as TreeDataNode;
      if (!dragNode || !targetNode || dragNode.isRoot) {
        if (dragNode?.isRoot) message.warning('"全部用例"不能移动');
        return;
      }
      try {
        await movePlanModule({
          module_id: dragNode.key as number,
          new_parent_id: targetNode.data?.parent_id,
          order: info.dropPosition + 1,
        });
        message.success('移动成功');
        onModulesChange?.();
      } catch {
        message.error('移动失败');
      }
    },
    [onModulesChange],
  );

  /** 右键菜单 */
  const buildMenuItems = useCallback(
    (node: TreeDataNode): MenuProps['items'] => {
      const items: MenuProps['items'] = [
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: '新增子目录',
          onClick: () => openAddModal(node.key as number),
        },
      ];
      if (!node.isRoot) {
        items.push(
          { type: 'divider' as const },
          {
            key: 'rename',
            icon: <EditOutlined />,
            label: '重命名',
            onClick: () => openEditModal(node.key as number, node.data.title),
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => handleDeleteModule(node.key as number),
          },
        );
      }
      return items;
    },
    [openAddModal, openEditModal, handleDeleteModule],
  );

  // ===== 选中 =====
  const handleTreeSelect = useCallback(
    (selected: React.Key[]) => {
      const key = (selected[0] ?? null) as number | null;
      setActiveKey(key);
      onSelect?.(key);
    },
    [onSelect],
  );

  // ===== 节点标题 =====
  const renderNodeTitle = useCallback(
    (node: TreeDataNode) => {
      const isActive = activeKey === node.key;
      const isHovered = hoveredKey === node.key;
      const caseCount = node.data.case_nums ?? 0;

      // hover 切换:admin + hovered 渲染 +,否则渲染数字(0 也展示,弱化)
      const showAddButton = isAdmin && isHovered;
      const content = (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            color: isActive ? token.colorPrimary : undefined,
          }}
          onMouseEnter={() => setHoveredKey(node.key)}
          onMouseLeave={() => setHoveredKey(null)}
        >
          <ModuleName name={node.data.title} isActive={isActive} />
          {showAddButton ? (
            <PlusOutlined
              style={{
                marginLeft: 'auto',
                padding: '0 4px',
                fontSize: 13,
                color: token.colorPrimary,
                lineHeight: '22px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                openAddModal(node.key as number);
              }}
            />
          ) : (
            <span
              style={{
                marginLeft: 'auto',
                paddingLeft: 8,
                fontSize: 12,
                color: token.colorTextTertiary,
                lineHeight: '22px',
                flexShrink: 0,
                opacity: caseCount === 0 ? 0.45 : 1,
                fontWeight: isActive ? 600 : undefined,
              }}
            >
              {caseCount}
            </span>
          )}
        </div>
      );

      if (!isAdmin) return content;
      return (
        <Dropdown
          menu={{ items: buildMenuItems(node) }}
          trigger={['contextMenu']}
          disabled={node.isRoot}
        >
          {content}
        </Dropdown>
      );
    },
    [
      activeKey,
      hoveredKey,
      token.colorPrimary,
      token.colorTextTertiary,
      isAdmin,
      openAddModal,
      buildMenuItems,
    ],
  );

  // ===== Tree 配置 =====
  const treeProps: TreeProps = useMemo(
    () => ({
      expandedKeys,
      onExpand: setExpandedKeys,
      selectedKeys: activeKey != null ? [activeKey] : [],
      onSelect: handleTreeSelect,
      multiple: false,
      // 仅 admin 启用拖拽
      draggable: isAdmin
        ? {
            icon: false,
            nodeDraggable: (node) => !(node as TreeDataNode).isRoot,
          }
        : false,
      onDragEnd: isAdmin ? (handleDragEnd as any) : undefined,
      blockNode: true,
      showLine: false,
      indent: 10,
    }),
    [expandedKeys, activeKey, handleTreeSelect, isAdmin, handleDragEnd],
  );

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ProCard
        title="计划目录"
        headerBordered
        variant="outlined"
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          // body 注入:flex 布局 + 横向 padding 0 + 把 selected bg 作为 CSS 变量下沉
          // (用 styles.body 而非 bodyStyle,后者在 antd v5 ProCard 上会泄漏到 DOM 触发 warning)
          body: {
            flex: 1,
            overflow: 'auto',
            padding: 0,
            ['--plan-module-selected-bg' as any]: token.colorPrimaryBg,
          },
        }}
      >
        <Tree
          {...treeProps}
          treeData={treeData}
          titleRender={(nodeData) => renderNodeTitle(nodeData as TreeDataNode)}
          className={TREE_CLASS}
        />
        {isAdmin && (
          <ModuleEditModal
            title={modalState.mode === 'add' ? '新增目录' : '编辑目录'}
            open={modalState.visible}
            onFinish={handleModalFinish}
            onCancel={resetModal}
            initialValues={{ title: modalState.initialTitle }}
          />
        )}
        <style>{`
          .${TREE_CLASS} .ant-tree-treenode-selected {
            background: var(--plan-module-selected-bg, #e6f4ff);
            border-radius: 4px;
          }
          .${TREE_CLASS} .ant-tree-node-content-wrapper {
            min-height: 22px;
            line-height: 22px;
            overflow: hidden;
            background: transparent !important;
          }
        `}</style>
      </ProCard>
    </div>
  );
};

/**
 * 目录名称:超长省略 + Tooltip
 */
const ModuleName: FC<{ name: string; isActive?: boolean }> = memo(
  ({ name, isActive = false }) => {
    const MAX_LEN = 16;
    const truncated =
      name.length > MAX_LEN ? `${name.slice(0, MAX_LEN)}…` : name;
    const needTooltip = name.length > MAX_LEN;
    const textStyle: React.CSSProperties = {
      flex: 1,
      fontSize: 14,
      fontWeight: isActive ? 600 : 400,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    return needTooltip ? (
      <Tooltip title={name} mouseEnterDelay={0.3}>
        <span style={textStyle}>{truncated}</span>
      </Tooltip>
    ) : (
      <span style={textStyle}>{truncated}</span>
    );
  },
);
ModuleName.displayName = 'ModuleName';

export default Index;
