import {
  deletePlanModule,
  insertPlanModule,
  movePlanModule,
  updatePlanModule,
} from '@/api/case/caseplan';
import { useGlassStyles } from '@/components/Glass';
import {
  borderRadius,
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
  /** 模块列表（后端已包含根节点"全部用例"） */
  planModules: IPlanModule[];
  /** 测试计划ID */
  planId?: string;
  /** 模块变更回调 */
  onModulesChange?: () => void;
  /** 节点选中回调 */
  onSelect?: (moduleId: number | null) => void;
}

/** Tree节点数据类型扩展 */
interface TreeDataNode extends DataNode {
  key: number;
  title: React.ReactNode;
  data: IPlanModule;
  /** 是否为根节点（全部用例） */
  isRoot?: boolean;
}

type ModalMode = 'add' | 'edit';

/** Modal状态管理 */
interface ModalState {
  visible: boolean;
  mode: ModalMode;
  parentId?: number;
  moduleId?: number;
  initialTitle?: string;
}

/**
 * 计划目录模块组件
 * 展示树形目录结构，支持新增、编辑、删除、拖拽排序
 */
const PlanModule: FC<PlanModuleProps> = ({
  planModules,
  planId,
  onModulesChange,
  onSelect,
}) => {
  const { token } = useToken();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    mode: 'add',
  });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const styles = useGlassStyles();

  /** 将模块数据转换为Tree组件需要的树形结构 */
  const convertToTreeData = useCallback(
    (modules: IPlanModule[]): TreeDataNode[] => {
      return modules.map((module) => {
        const isRootNode = module.parent_id === null && module.order === 0;
        return {
          key: module.id,
          title: module.title,
          data: module,
          isRoot: isRootNode,
          icon: (props: AntTreeNodeProps) =>
            props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
          children: module.children
            ? convertToTreeData(module.children)
            : undefined,
        };
      });
    },
    [token.colorPrimary, token.colorSuccess],
  );

  /** 初始化树形数据 */
  useEffect(() => {
    if (planModules && planModules.length > 0) {
      const convertedData = convertToTreeData(planModules);
      setTreeData(convertedData);
      const rootId = planModules[0]?.id;
      if (rootId) {
        setExpandedKeys([rootId]);
      }
    } else {
      setTreeData([]);
    }
  }, [planModules, convertToTreeData]);

  /** 打开新增目录Modal */
  const handleOpenAddModal = useCallback((parentId: number) => {
    setModalState({
      visible: true,
      mode: 'add',
      parentId,
    });
  }, []);

  /** 打开编辑目录Modal */
  const handleOpenEditModal = useCallback((moduleId: number, title: string) => {
    setModalState({
      visible: true,
      mode: 'edit',
      moduleId,
      initialTitle: title,
    });
  }, []);

  /** 关闭Modal */
  const handleCloseModal = useCallback(() => {
    setModalState({
      visible: false,
      mode: 'add',
      parentId: undefined,
      moduleId: undefined,
      initialTitle: undefined,
    });
  }, []);

  /** Modal表单提交处理 */
  const handleModalFinish = useCallback(
    async (values: { title: string }): Promise<boolean> => {
      const { title } = values;

      try {
        if (modalState.mode === 'add') {
          await insertPlanModule({
            plan_id: Number(planId),
            title: title.trim(),
            order: treeData.length + 1,
            parent_id: modalState.parentId!,
          });
          message.success('创建成功');
        } else {
          await updatePlanModule({
            id: modalState.moduleId!,
            title: title.trim(),
          });
          message.success('修改成功');
        }
        handleCloseModal();
        onModulesChange?.();
        return true;
      } catch {
        message.error(modalState.mode === 'add' ? '创建失败' : '修改失败');
        return false;
      }
    },
    [modalState, planId, treeData.length, onModulesChange, handleCloseModal],
  );

  /** 删除目录 */
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

  /** 拖拽结束处理 */
  const handleDragEnd = useCallback(
    async (info: any) => {
      const dragNode = info.dragNode as TreeDataNode;
      const node = info.node as TreeDataNode;
      if (!dragNode || !node) return;

      const dragKey = dragNode.key;
      const dragIsRoot = dragNode.isRoot;

      if (dragIsRoot) {
        message.warning('"全部用例"不能移动');
        return;
      }

      const newOrder = info.dropPosition + 1;

      try {
        await movePlanModule({
          module_id: dragKey as number,
          new_parent_id: node.data?.parent_id,
          order: newOrder,
        });
        message.success('移动成功');
        onModulesChange?.();
      } catch {
        message.error('移动失败');
      }
    },
    [onModulesChange],
  );

  /** 组件样式对象 */
  const containerStyles = useMemo(
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
      },
      addIcon: {
        fontSize: typography.fontSize.sm,
        color: token.colorPrimary,
        cursor: 'pointer',
        opacity: 0,
        marginLeft: 'auto',
        marginRight: spacing.xs,
        ...styleHelpers.transition(['opacity']),
      },
      addIconVisible: {
        opacity: 1,
      },
      emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: token.colorTextTertiary,
      },
    }),
    [token, spacing, borderRadius, typography, styleHelpers],
  );

  /** 渲染节点标题 */
  const renderNodeTitle = useCallback(
    (node: TreeDataNode) => {
      const isRootNode = node.isRoot;
      const isHovered = hoveredKey === node.key;
      const menuItems: MenuProps['items'] = [];

      menuItems.push({
        key: 'add',
        icon: <PlusOutlined />,
        label: '新增子目录',
        onClick: () => handleOpenAddModal(node.key as number),
      });

      if (!isRootNode) {
        menuItems.push(
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

      return (
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['contextMenu']}
          disabled={isRootNode}
        >
          <div
            style={containerStyles.titleWrapper}
            onMouseEnter={() => setHoveredKey(node.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <HolderOutlined style={containerStyles.dragHandle} />
            <span style={containerStyles.titleText}>
              {node.title as string}
            </span>
            <PlusOutlined
              style={{
                ...containerStyles.addIcon,
                ...(isHovered ? containerStyles.addIconVisible : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddModal(node.key as number);
              }}
            />
          </div>
        </Dropdown>
      );
    },
    [
      containerStyles,
      hoveredKey,
      handleOpenAddModal,
      handleOpenEditModal,
      handleDeleteModule,
    ],
  );

  /** 递归处理树节点，为每个节点设置标题 */
  const processTreeNodes = useCallback(
    (nodes: TreeDataNode[]): TreeDataNode[] => {
      return nodes.map((node) => {
        const newNode: TreeDataNode = {
          ...node,
          title: renderNodeTitle(node),
        };
        if (newNode.children && newNode.children.length > 0) {
          newNode.children = processTreeNodes(
            newNode.children as TreeDataNode[],
          );
        }
        return newNode;
      });
    },
    [renderNodeTitle],
  );

  /** Tree组件配置 */
  const handleTreeSelect = useCallback(
    (selected: React.Key[]) => {
      setSelectedKeys(selected);
      if (selected.length > 0) {
        const selectedKey = selected[0];
        const selectedNode =
          treeData.find((node) => node.key === selectedKey) ||
          findNodeInTree(treeData, selectedKey as number);
        if (selectedNode) {
          onSelect?.(selectedKey as number);
        } else {
          onSelect?.(null);
        }
      } else {
        onSelect?.(null);
      }
    },
    [treeData, onSelect],
  );

  const treeProps: TreeProps = useMemo(
    () => ({
      expandedKeys,
      onExpand: setExpandedKeys,
      selectedKeys,
      onSelect: handleTreeSelect,
      draggable: {
        icon: false,
        nodeDraggable: (node) => {
          const treeNode = node as TreeDataNode;
          return !treeNode.isRoot;
        },
      },
      onDragEnd: handleDragEnd as any,
      blockNode: true,
      showLine: false,
      defaultExpandAll: true,
    }),
    [expandedKeys, handleTreeSelect, handleDragEnd],
  );

  /** 在树中查找节点 */
  const findNodeInTree = useCallback(
    (nodes: TreeDataNode[], key: number): TreeDataNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children && node.children.length > 0) {
          const found = findNodeInTree(node.children as TreeDataNode[], key);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  /** 处理后的树数据 */
  const processedTreeData = useMemo(() => {
    return processTreeNodes(treeData);
  }, [treeData, processTreeNodes]);

  return (
    <ProCard
      bordered
      bodyStyle={{
        height: '100%',
        minHeight: '90vh',
        background: 'transparent',
        padding: 4,
      }}
      title={<div>计划目录</div>}
      headerBordered
    >
      <Tree
        {...treeProps}
        style={{ height: '100%', background: 'transparent' }}
        treeData={processedTreeData}
      />
      <ModuleEditModal
        title={modalState.mode === 'add' ? '新增目录' : '编辑目录'}
        open={modalState.visible}
        onFinish={handleModalFinish}
        setOpen={handleCloseModal}
        initialValues={{ title: modalState.initialTitle }}
      />
    </ProCard>
  );
};

export default PlanModule;
