import {
  deletePlanModule,
  insertPlanModule,
  movePlanModule,
  queryPlanCases,
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
import { Dropdown, message, Modal, Progress, theme, Tooltip, Tree } from 'antd';
import type { AntTreeNodeProps, DataNode, TreeProps } from 'antd/es/tree';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  title?: React.ReactNode;
  data: IPlanModule;
  isRoot?: boolean;
}

/**
 * 单轮测试统计（一轮 / 二轮）
 * 与 API 层 @/api/case/caseplan 中 RoundStats 字段一一对应，但采用 camelCase 命名
 */
interface RoundStats {
  passed: number;
  failed: number;
  pending: number;
  passRate: number;
  executionRate: number;
}

/** 模块用例统计（按测试轮次拆分） */
interface ModuleStats {
  /** 模块下用例总数（两个轮次共享） */
  total: number;
  /** 一轮测试统计 */
  first: RoundStats;
  /** 二轮测试统计 */
  second: RoundStats;
}

/**
 * 用例状态字段名（用于本地按轮次聚合统计）
 * 0=未开始 / 1=通过 / 2=失败 / 3=阻塞 / 4=跳过
 */
type RoundStatusField = 'first_status' | 'second_status';

/**
 * 从用例列表按指定状态字段聚合单轮统计
 * 通过单次遍历累计三个计数器（passed/failed/pending），避免 filter + length 多次扫描
 * @param cases - 用例列表
 * @param field - 要统计的状态字段名（first_status / second_status）
 * @returns 该轮次的统计数据
 */
const computeRoundStats = (
  cases: ReadonlyArray<Partial<Record<RoundStatusField, number | undefined>>>,
  field: RoundStatusField,
): RoundStats => {
  let passed = 0;
  let failed = 0;
  let pending = 0;
  for (const c of cases) {
    const v = c[field];
    if (v === 1) passed += 1;
    else if (v === 2) failed += 1;
    // 0 / undefined / 3 / 4 都归为未执行（含未开始 / 阻塞 / 跳过）
    else pending += 1;
  }
  const executed = passed + failed;
  return {
    passed,
    failed,
    pending,
    passRate: executed > 0 ? Math.round((passed / executed) * 100) : 0,
    executionRate:
      cases.length > 0 ? Math.round((executed / cases.length) * 100) : 0,
  };
};

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
  const [moduleStatsMap, setModuleStatsMap] = useState<
    Map<number, ModuleStats>
  >(new Map());
  const loadingStatsRef = useRef<Set<number>>(new Set());
  const isInitializedRef = useRef(false);

  const isRootNode = (module: IPlanModule) =>
    module.parent_id === null && module.order === ROOT_ORDER;

  /** 扁平化模块树，收集所有有 case 的模块 */
  const flattenModules = useCallback(
    (modules: IPlanModule[]): IPlanModule[] => {
      const result: IPlanModule[] = [];
      const walk = (list: IPlanModule[]) => {
        for (const m of list) {
          if (m.case_nums > 0) result.push(m);
          if (m.children?.length) walk(m.children);
        }
      };
      walk(modules);
      return result;
    },
    [],
  );

  /** 加载单个模块的用例统计
   * 本地按 first_status / second_status 字段分别聚合一轮 / 二轮统计
   */
  const loadModuleStats = useCallback(
    async (moduleId: number) => {
      if (!planId || loadingStatsRef.current.has(moduleId)) return;
      loadingStatsRef.current.add(moduleId);

      try {
        const { code, data } = await queryPlanCases({
          plan_id: Number(planId),
          plan_module_id: moduleId,
        });
        if (code === 0) {
          const cases = Array.isArray(data) ? data : [];
          // 一次遍历同时计算两轮统计（computeRoundStats 内部已优化为单次循环）
          const first = computeRoundStats(cases, 'first_status');
          const second = computeRoundStats(cases, 'second_status');

          setModuleStatsMap((prev) => {
            const next = new Map(prev);
            next.set(moduleId, {
              total: cases.length,
              first,
              second,
            });
            return next;
          });
        }
      } finally {
        loadingStatsRef.current.delete(moduleId);
      }
    },
    [planId],
  );

  /** 分批并行加载所有模块统计，每批 5 个避免后端压力 */
  const loadAllModuleStats = useCallback(
    async (modules: IPlanModule[]) => {
      const all = flattenModules(modules);
      const batchSize = 5;
      for (let i = 0; i < all.length; i += batchSize) {
        const batch = all.slice(i, i + batchSize);
        await Promise.all(batch.map((m) => loadModuleStats(m.id)));
      }
    },
    [flattenModules, loadModuleStats],
  );

  /** 将模块数据转换为 Tree 组件需要的树形结构
   *
   * 注意：不设置 title 字段，避免 rc-tree 在内部元素上渲染默认的
   * 浏览器原生 tooltip。模块标题通过 data.title 在 titleRender 中渲染。
   */
  const convertToTreeData = useCallback(
    (modules: IPlanModule[]): TreeDataNode[] =>
      modules.map((module) => ({
        key: module.id,
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

  /** 初始化树形数据并默认展开、激活根节点（统计加载由独立 useEffect 负责） */
  useEffect(() => {
    if (!planModules?.length) {
      setTreeData([]);
      setActiveKey(null);
      isInitializedRef.current = false;
      return;
    }
    const convertedData = convertToTreeData(planModules);
    setTreeData(convertedData);
    const rootId = planModules[0]?.id;

    // 仅在首次加载时初始化展开和选中状态，避免后续数据更新时重置用户选择
    if (!isInitializedRef.current) {
      setExpandedKeys(rootId ? [rootId] : []);
      setActiveKey(rootId ?? null);
      onSelect?.(rootId ?? null);
      isInitializedRef.current = true;
    }
  }, [planModules, convertToTreeData, onSelect]);

  /**
   * 加载各模块用例统计：直接走本地计算路径
   *
   * 历史原因：
   * - 原主路径 getPlanModulesStats 旧版不返回 per-round（first/second）字段，
   *   即便 type 扩展了，仍会被 mapApiStats 降级为 emptyRoundStats()，导致双 Progress 显示 0
   * - 旧版 fallback 路径 loadAllModuleStats 在每模块调用一次 queryPlanCases，
   *   拿到首层 + 步进数据后由 computeRoundStats 一次遍历算出 first / second，是当前唯一正确的来源
   * - 后端 /api/hub/plan/modules/stats 后续若支持 per-round，可在此处重新切换到主路径
   */
  useEffect(() => {
    if (!planId || !planModules?.length) return;

    // 清空旧统计，避免新旧数据串味
    setModuleStatsMap(new Map());
    loadingStatsRef.current.clear();

    loadAllModuleStats(planModules);
  }, [planId, planModules, loadAllModuleStats]);

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
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'flex-end' as const,
        marginLeft: 'auto',
        paddingRight: spacing.xs,
        gap: 4,
        minWidth: 56,
        height: 24,
        lineHeight: '24px',
      },
      caseCount: {
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
              handleOpenEditModal(node.key as number, node.data.title),
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

  /**
   * 单轮 Progress 描边色
   * 优先级：失败 > 100% 完成 > 进行中
   */
  const getRoundStrokeColor = (round: RoundStats): string => {
    if (round.failed > 0) return token.colorError;
    if (round.executionRate === 100) return token.colorSuccess;
    return token.colorPrimary;
  };

  /** 渲染迷你统计进度环（一轮 + 二轮两个圆环）
   * 只在 root 目录下展示全量数据的统计情况（包含进度环和详细统计）
   * 子目录只展示简单的用例数量
   */
  const renderStatRing = useCallback(
    (stats: ModuleStats | undefined, caseCount: number, isRoot: boolean) => {
      // 子目录只显示简单数量
      if (!isRoot) {
        return caseCount > 0 ? (
          <span style={nodeStyles.caseCount}>{caseCount}</span>
        ) : null;
      }

      // root 目录但无统计或无用例时，仅显示数量
      if (!stats || caseCount === 0) {
        return caseCount > 0 ? (
          <span style={nodeStyles.caseCount}>{caseCount}</span>
        ) : null;
      }

      /**
       * 渲染单个圆环 Progress（无文本信息）
       * @param round - 该轮统计数据
       */
      const renderRoundProgress = (round: RoundStats) => (
        <Progress
          type="circle"
          percent={round.executionRate}
          size={14}
          strokeWidth={7}
          strokeColor={getRoundStrokeColor(round)}
          railColor={token.colorFillSecondary}
          format={() => ''}
          showInfo={false}
          style={{ marginBottom: 0 }}
        />
      );

      /**
       * 渲染单轮 Tooltip 详情片段
       * @param label - 轮次名称（"一轮测试" / "二轮测试"）
       * @param round - 该轮统计数据
       */
      const renderRoundTooltipBlock = (label: string, round: RoundStats) => (
        <div>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ color: token.colorSuccess }}>
            通过 {round.passed} 条
          </div>
          {round.failed > 0 && (
            <div style={{ color: token.colorError }}>
              失败 {round.failed} 条
            </div>
          )}
          {round.pending > 0 && (
            <div style={{ color: token.colorTextTertiary }}>
              未执行 {round.pending} 条
            </div>
          )}
          <div>
            通过率 <strong>{round.passRate}%</strong> · 执行率{' '}
            <strong>{round.executionRate}%</strong>
          </div>
        </div>
      );

      const tooltipTitle = (
        <div style={{ fontSize: 12, lineHeight: 1.8 }}>
          {renderRoundTooltipBlock('一轮测试', stats.first)}
          <div
            style={{
              borderTop: `1px solid ${token.colorBorder}`,
              margin: '4px 0',
            }}
          />
          {renderRoundTooltipBlock('二轮测试', stats.second)}
          <div
            style={{
              borderTop: `1px solid ${token.colorBorder}`,
              marginTop: 4,
              paddingTop: 4,
            }}
          >
            总计 <strong>{stats.total}</strong> 条
          </div>
        </div>
      );

      return (
        <Tooltip title={tooltipTitle} placement="right">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* 左侧：一轮测试进度环 */}
            {renderRoundProgress(stats.first)}
            {/* 右侧：二轮测试进度环 */}
            {renderRoundProgress(stats.second)}
            <span style={nodeStyles.caseCount}>{caseCount}</span>
          </span>
        </Tooltip>
      );
    },
    [nodeStyles, token],
  );

  /** 渲染自定义节点标题（含高亮、hover、右键菜单、用例统计） */
  const renderNodeTitle = useCallback(
    (node: TreeDataNode) => {
      const isActive = activeKey === node.key;
      const isHovered = hoveredKey === node.key;
      const caseCount = node.data.case_nums || 0;
      const stats = moduleStatsMap.get(node.key as number);

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
            <span style={nodeStyles.titleText}>{node.data.title}</span>
            <span
              style={{
                ...nodeStyles.rightArea,
                position: 'relative',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  opacity: isHovered ? 0 : 1,
                  ...styleHelpers.transition(['opacity']),
                }}
              >
                {renderStatRing(stats, caseCount, node.isRoot ?? false)}
              </span>
              <PlusOutlined
                style={{
                  ...nodeStyles.addIcon,
                  opacity: isHovered ? 1 : 0,
                  position: 'absolute',
                  right: spacing.xs,
                  top: 0,
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
      moduleStatsMap,
      nodeStyles,
      token,
      buildMenuItems,
      handleOpenAddModal,
      styleHelpers,
      spacing,
      renderStatRing,
    ],
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
        variant="outlined"
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          },
        }}
      >
        <Tree
          {...treeProps}
          treeData={treeData}
          titleRender={(nodeData) => renderNodeTitle(nodeData as TreeDataNode)}
        />
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
