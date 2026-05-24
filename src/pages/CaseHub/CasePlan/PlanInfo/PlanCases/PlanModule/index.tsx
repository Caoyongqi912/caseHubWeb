import {
  deletePlanModule,
  insertPlanModule,
  movePlanModule,
  updatePlanModule,
} from '@/api/case/caseplan';
import {
  spacing,
  styleHelpers,
  typography,
} from '@/components/LeftComponents/styles';
import type { IPlanModule } from '@/pages/CaseHub/types';
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import { Dropdown, message, Modal, theme, Tree } from 'antd';
import type { AntTreeNodeProps, DataNode, TreeProps } from 'antd/es/tree';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
  title: React.ReactNode;
  data: IPlanModule;
  isRoot?: boolean;
}

type ModalMode = 'add' | 'edit';

interface ModalState {
  visible: boolean;
  mode: ModalMode;
  parentId?: number;
  moduleId?: number;
  initialTitle?: string;
}

const ROOT_ORDER = 0;

const createModalState = (overrides: Partial<ModalState> = {}): ModalState => ({
  visible: false,
  mode: 'add',
  ...overrides,
});

/**
 * 计划目录模块组件
 * 展示树形目录结构，支持新增、编辑、删除、拖拽排序
 */
const Index: FC<PlanModuleProps> = ({
  planModules,
  planId,
  onModulesChange,
  onSelect,
}) => {
  const { token } = useToken();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [activeKey, setActiveKey] = useState<React.Key | null>(null);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>(createModalState());
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const isRootNode = (module: IPlanModule) =>
    module.parent_id === null && module.order === ROOT_ORDER;

  /** 将模块数据转换为 Tree 组件需要的树形结构 */
  const convertToTreeData = useCallback(
    (modules: IPlanModule[]): TreeDataNode[] =>
      modules.map((module) => ({
        key: module.id,
        title: module.title,
        data: module,
        isRoot: isRootNode(module),
        icon: (props: AntTreeNodeProps) =>
          props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
        children: module.children
          ? convertToTreeData(module.children)
          : undefined,
      })),
    [],
  );

  /** 初始化树形数据并默认展开、激活根节点 */
  useEffect(() => {
    if (!planModules?.length) {
      setTreeData([]);
      setActiveKey(null);
      return;
    }
    const convertedData = convertToTreeData(planModules);
    setTreeData(convertedData);
    const rootId = planModules[0]?.id;
    setExpandedKeys(rootId ? [rootId] : []);
    setActiveKey(rootId ?? null);
    onSelect?.(rootId ?? null);
  }, [planModules, convertToTreeData, onSelect]);

  const resetModal = useCallback(() => setModalState(createModalState()), []);

  const handleOpenAddModal = useCallback(
    (parentId: number) =>
      setModalState(createModalState({ visible: true, mode: 'add', parentId })),
    [],
  );

  const handleOpenEditModal = useCallback(
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

  /** Modal 表单提交：根据模式分发新增/编辑逻辑 */
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
          await updatePlanModule({
            id: modalState.moduleId!,
            title,
          });
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

  /** 删除目录（带二次确认） */
  const handleDeleteModule = useCallback(
    async (moduleId: number) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该目录吗？删除后将无法恢复。',
        okText: '确认',
        cancelText: '取消',
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

  /** 拖拽排序结束处理 */
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

  /** 节点样式配置 */
  const nodeStyles = useMemo(
    () => ({
      titleWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs}px 0`,
        minHeight: 24,
      },
      dragHandle: {
        fontSize: typography.fontSize.sm,
        color: token.colorTextTertiary,
        cursor: 'grab',
        padding: `0 ${spacing.xs}px`,
        opacity: 0.5,
        ...styleHelpers.transition(['opacity']),
      },
      titleText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: token.colorText,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      rightArea: {
        position: 'relative' as const,
        marginLeft: 'auto',
        paddingRight: spacing.xs,
        width: 40,
        height: 24,
        lineHeight: '24px',
      },
      caseCount: {
        position: 'absolute' as const,
        right: spacing.xs,
        top: 0,
        height: '100%',
        fontSize: typography.fontSize.sm,
        color: token.colorTextTertiary,
        lineHeight: 'inherit',
      },
      addIcon: {
        position: 'absolute' as const,
        right: spacing.xs,
        top: 0,
        height: '100%',
        fontSize: typography.fontSize.sm,
        color: token.colorPrimary,
        cursor: 'pointer',
        opacity: 0,
        lineHeight: 'inherit',
        ...styleHelpers.transition(['opacity']),
      },
    }),
    [token, spacing, styleHelpers, typography],
  );

  /** 构建节点右键菜单项 */
  const buildMenuItems = useCallback(
    (node: TreeDataNode): MenuProps['items'] => {
      const items: MenuProps['items'] = [
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: '新增子目录',
          onClick: () => handleOpenAddModal(node.key as number),
        },
      ];

      if (!node.isRoot) {
        items.push(
          { type: 'divider' as const },
          {
            key: 'rename',
            icon: <EditOutlined />,
            label: '重命名',
            onClick: () =>
              handleOpenEditModal(node.key as number, node.title as string),
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
    [handleOpenAddModal, handleOpenEditModal, handleDeleteModule],
  );

  /** 渲染自定义节点标题（含高亮、hover、右键菜单、用例数量） */
  const renderNodeTitle = useCallback(
    (node: TreeDataNode) => {
      const isActive = activeKey === node.key;
      const isHovered = hoveredKey === node.key;
      const caseCount = node.data.case_nums || 0;

      return (
        <Dropdown
          menu={{ items: buildMenuItems(node) }}
          trigger={['contextMenu']}
          disabled={node.isRoot}
        >
          <div
            style={{
              ...nodeStyles.titleWrapper,
              background: isActive ? token.colorPrimaryBg : 'transparent',
              borderRadius: token.borderRadius,
            }}
            onMouseEnter={() => setHoveredKey(node.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <HolderOutlined style={nodeStyles.dragHandle} />
            <span style={nodeStyles.titleText}>{node.title as string}</span>
            <span style={nodeStyles.rightArea}>
              {caseCount > 0 && (
                <span
                  style={{
                    ...nodeStyles.caseCount,
                    opacity: isHovered ? 0 : 1,
                    ...styleHelpers.transition(['opacity']),
                  }}
                >
                  {caseCount}
                </span>
              )}
              <PlusOutlined
                style={{
                  ...nodeStyles.addIcon,
                  opacity: isHovered ? 1 : 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddModal(node.key as number);
                }}
              />
            </span>
          </div>
        </Dropdown>
      );
    },
    [
      activeKey,
      hoveredKey,
      nodeStyles,
      token,
      buildMenuItems,
      handleOpenAddModal,
      styleHelpers,
    ],
  );

  /** 递归为每个节点注入自定义标题渲染 */
  const processTreeNodes = useCallback(
    (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => ({
        ...node,
        title: renderNodeTitle(node),
        children: node.children?.length
          ? processTreeNodes(node.children as TreeDataNode[])
          : undefined,
      })),
    [renderNodeTitle],
  );

  /** 在树中递归查找指定 key 的节点 */
  const findNodeInTree = useCallback(
    (nodes: TreeDataNode[], key: number): TreeDataNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        const found = node.children?.length
          ? findNodeInTree(node.children as TreeDataNode[], key)
          : null;
        if (found) return found;
      }
      return null;
    },
    [],
  );

  /** Tree 选中事件处理：单选模式，同步 activeKey 与父组件回调 */
  const handleTreeSelect = useCallback(
    (selected: React.Key[]) => {
      const key = selected[0] ?? null;
      setActiveKey(key);

      if (key == null) {
        onSelect?.(null);
        return;
      }

      const found =
        treeData.find((n) => n.key === key) ||
        findNodeInTree(treeData, key as number);
      onSelect?.(found ? (key as number) : null);
    },
    [treeData, onSelect, findNodeInTree],
  );

  /** Tree 组件 props 配置 */
  const treeProps: TreeProps = useMemo(
    () => ({
      expandedKeys,
      onExpand: setExpandedKeys,
      selectedKeys: activeKey != null ? [activeKey] : [],
      onSelect: handleTreeSelect,
      multiple: false,
      draggable: {
        icon: false,
        nodeDraggable: (node) => !(node as TreeDataNode).isRoot,
      },
      onDragEnd: handleDragEnd as any,
      blockNode: true,
      showLine: false,
      defaultExpandAll: true,
    }),
    [expandedKeys, activeKey, handleTreeSelect, handleDragEnd],
  );

  const processedTreeData = useMemo(
    () => processTreeNodes(treeData),
    [treeData, processTreeNodes],
  );

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ProCard
        title="计划目录"
        headerBordered
        bordered
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        // 👇 关键：只让 body 区域滚动，头部固定
        styles={{
          body: {
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          },
        }}
      >
        {/* Tree 也要充满 */}
        <Tree {...treeProps} treeData={processedTreeData} />
        <ModuleEditModal
          title={modalState.mode === 'add' ? '新增目录' : '编辑目录'}
          open={modalState.visible}
          onFinish={handleModalFinish}
          onCancel={resetModal}
          initialValues={{ title: modalState.initialTitle }}
        />
      </ProCard>
    </div>
  );
};

export default Index;
