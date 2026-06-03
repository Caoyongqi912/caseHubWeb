import {
  associatePlanCases,
  insertPlanCases,
  queryPlanCases,
  reorderPlanCases,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import ChoiceCaseTable from '@/pages/CaseHub/Requirement/components/ChoiceCaseTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan, ITestCase } from '@/pages/CaseHub/types';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { arrayMove } from '@dnd-kit/sortable';
import { Button, Checkbox, Empty, message, Space, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// @ts-ignore
import { VariableSizeList } from 'react-window';
import { usePlanCaseListStyles } from '../styles';
import BatchActionBar from './components/BatchActionBar';
import CaseFilterBar from './components/CaseFilterBar';
import CaseItem from './components/CaseItem';
import NewCaseForm from './components/NewCaseForm';
import PlanCaseImportModal from './components/PlanCaseImportModal';
import PlanCaseSortableWrapper from './components/PlanCaseSortableWrapper';
import { useCaseFilter } from './hooks/useCaseFilter';

/**
 * 基于列表数据计算选中状态
 * 用于在已知列表数据时计算 isAllSelected 和 isIndeterminate
 */
const calculateSelectionState = (
  list: ITestCase[],
  selectedCaseIds: Set<number>,
): { isAllSelected: boolean; isIndeterminate: boolean } => {
  const selectableItems = list.filter((tc) => tc.id !== undefined);

  if (selectableItems.length === 0) {
    return { isAllSelected: false, isIndeterminate: false };
  }

  if (selectedCaseIds.size === 0) {
    return { isAllSelected: false, isIndeterminate: false };
  }

  const selectedCount = selectableItems.filter((tc) =>
    selectedCaseIds.has(tc.id as number),
  ).length;

  const isAllSelected = selectedCount === selectableItems.length;
  const isIndeterminate =
    selectedCount > 0 && selectedCount < selectableItems.length;

  return { isAllSelected, isIndeterminate };
};

/**
 * 跟踪元素的实际高度（用于给虚拟列表喂高度）
 * 使用 ResizeObserver 监听容器尺寸变化
 */
const useElementHeight = (ref: React.RefObject<HTMLElement>): number => {
  const [height, setHeight] = useState(0);
  // useLayoutEffect 同步触发，避免首帧渲染时 listHeight=0 导致列表闪一下空区
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return height;
};

/**
 * 虚拟列表行数据，由父组件构造后通过 itemData 注入
 * 包含渲染一行所需的全部数据与回调，避免 Row 闭包过期
 */
interface CaseRowData {
  list: ITestCase[];
  selectedCaseIds: Set<number>;
  planId?: string;
  moduleId?: number | null;
  onSelectedChange: (id: number | undefined, selected: boolean) => void;
  onReviewChange: (caseId: number, isReview: string) => void;
  /** 一轮测试状态变更回调（同步更新左侧模块树计数） */
  onFirstStatusChange: (caseId: number, status: string) => void;
  /** 二轮测试状态变更回调 */
  onSecondStatusChange: (caseId: number, status: string) => void;
  /** 卡片折叠状态变更回调（用于虚拟列表动态调整行高） */
  onCollapsedChange: (caseId: number | undefined, collapsed: boolean) => void;
  /** 在指定用例之后插入新用例 */
  onInsertAfter?: (afterCaseId: number) => void;
  /** 是否启用拖拽排序 */
  isSortable: boolean;
  onRefresh: () => void;
  /** 已折叠的用例 ID 集合（用于受控折叠状态） */
  collapsedCaseIds: Set<number>;
}

/**
 * VariableSizeList 渲染的每行组件
 * 读取 itemData 中的数据渲染单个 CaseItem
 */
const CaseRow: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: CaseRowData;
}> = ({ index, style, data }) => {
  // 关键：CaseRow 永远不返回 null。
  // 之前的 return null 在 HMR/边界时机会让所有行同时变 null → 整片空白。
  // 改为：即使数据不完整，也渲染一个占位 div 撑住槽位（react-window 依赖槽位来算 scrollHeight）。
  const safeList = data && Array.isArray(data.list) ? data.list : [];
  const safeSelected = data?.selectedCaseIds ?? new Set<number>();
  const tc =
    typeof index === 'number' && index >= 0 && index < safeList.length
      ? safeList[index]
      : undefined;

  return (
    <div
      style={{
        ...style,
        display: 'block',
        boxSizing: 'border-box',
        // 卡片之间留 4px 视觉间隙（itemSize 已在 EXPANDED_HEIGHT 计入此 padding）
        paddingBottom: 6,
      }}
    >
      {tc ? (
        <CaseItem
          testCase={tc}
          planId={data?.planId}
          moduleId={data?.moduleId}
          selected={tc.id !== undefined && safeSelected.has(tc.id)}
          onSelectedChange={data?.onSelectedChange ?? (() => {})}
          onReviewChange={data?.onReviewChange ?? (() => {})}
          onFirstStatusChange={data?.onFirstStatusChange ?? (() => {})}
          onSecondStatusChange={data?.onSecondStatusChange ?? (() => {})}
          onCollapsedChange={data?.onCollapsedChange ?? (() => {})}
          onInsertAfter={data?.onInsertAfter}
          isSortable={data?.isSortable ?? false}
          onRefresh={data?.onRefresh ?? (() => {})}
          collapsed={
            tc.id !== undefined &&
            (data?.collapsedCaseIds ?? new Set()).has(tc.id)
          }
        />
      ) : (
        // 槽位占位，避免空白行
        <div style={{ height: '100%' }} />
      )}
    </div>
  );
};

/**
 * 计划用例列表 Props
 */
interface PlanCaseListProps {
  planId?: string;
  moduleId?: number | null;
  planModules: import('@/pages/CaseHub/types').IPlanModule[];
  planInfo?: ICasePlan;
  onModulesRefresh?: () => void;
}

/**
 * 计划用例列表组件
 * 展示指定计划下的所有测试用例，支持筛选、选中、批量操作等功能
 */
const Index: FC<PlanCaseListProps> = ({
  planId,
  moduleId,
  planModules,
  planInfo,
  onModulesRefresh,
}) => {
  const styles = usePlanCaseListStyles();
  const { colors, spacing } = useCaseHubTheme();

  const [caseList, setCaseList] = useState<ITestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [openChoiceCaseDrawer, setOpenChoiceCaseDrawer] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  /** 记录要在哪个 case 之后插入（null 表示追加到末尾） */
  const [insertAfterCaseId, setInsertAfterCaseId] = useState<number | null>(
    null,
  );

  /**
   * 跟踪已折叠的用例 ID 集合
   * 用于 itemSize 动态计算：折叠态的卡片只返回头部高度（不含表格）
   */
  const [collapsedCaseIds, setCollapsedCaseIds] = useState<Set<number>>(
    () => new Set(),
  );

  /**
   * 虚拟列表容器 ref + VariableSizeList ref
   * 用于测量容器高度
   */
  const listContainerRef = useRef<HTMLDivElement>(null);
  const virtualListRef = useRef<VariableSizeList>(null);

  /**
   * 使用筛选 hook 管理筛选状态
   */
  const { filters, hasActiveFilter, filteredList, handleFilterChange } =
    useCaseFilter(caseList);

  /**
   * 获取用例列表
   * planInfo 由父组件传入，无需重复请求
   */
  const fetchPlanData = useCallback(async () => {
    if (!planId || !moduleId) return;

    setLoading(true);

    try {
      const { code, data } = await queryPlanCases({
        plan_id: Number(planId),
        plan_module_id: moduleId,
        is_review: filters.isReview,
      });

      if (code === 0) {
        setSelectedCaseIds(new Set());
        const list = Array.isArray(data) ? data : [];
        // 使用 Map 去重，比 filter + findIndex 性能更好 O(n) vs O(n²)
        const uniqueMap = new Map<number, ITestCase>();
        list.forEach((item) => {
          if (item.id !== undefined) {
            uniqueMap.set(item.id, item);
          }
        });
        // 保留未变化项的引用，避免破坏 CaseItem 的 React.memo
        setCaseList((prev) => {
          const prevMap = new Map<number, ITestCase>();
          prev.forEach((c) => {
            if (c.id !== undefined) prevMap.set(c.id, c);
          });
          const next: ITestCase[] = [];
          uniqueMap.forEach((v, k) => {
            const prevItem = prevMap.get(k);
            if (prevItem) {
              const keysA = Object.keys(prevItem);
              const keysB = Object.keys(v);
              const unchanged =
                keysA.length === keysB.length &&
                keysA.every((key) =>
                  Object.is(
                    prevItem[key as keyof ITestCase],
                    v[key as keyof ITestCase],
                  ),
                );
              next.push(unchanged ? prevItem : v);
            } else {
              next.push(v);
            }
          });
          return next;
        });
      }
    } finally {
      setLoading(false);
    }
  }, [planId, moduleId, filters]);

  useEffect(() => {
    setCaseList([]);
    fetchPlanData();
  }, [planId, moduleId, fetchPlanData]);

  /**
   * 刷新列表
   * 同步触发 module 刷新，用于复制/删除等引起数据增减的场景，
   * 保证左侧模块树的计数与列表保持一致
   */
  const handleRefresh = useCallback(() => {
    fetchPlanData();
    onModulesRefresh?.();
  }, [fetchPlanData, onModulesRefresh]);

  const handleBatchExport = useCallback(
    () => message.info('批量导出功能开发中'),
    [],
  );

  const handleBatchImport = useCallback(() => setImportModalVisible(true), []);

  /**
   * 关联用例到当前计划
   */
  const handleAssociateCases = async (caseIds: number[]) => {
    const { code } = await associatePlanCases({
      plan_id: Number(planId),
      case_ids: caseIds,
      plan_module_id: moduleId ?? undefined,
    });
    if (code === 0) {
      message.success('关联成功');
      setOpenChoiceCaseDrawer(false);
      handleRefresh();
    } else {
      message.error('关联失败');
    }
  };

  /**
   * 计算选中状态（基于筛选后的列表）
   */
  const { isAllSelected, isIndeterminate } = useMemo(
    () => calculateSelectionState(filteredList, selectedCaseIds),
    [filteredList, selectedCaseIds],
  );

  /**
   * 全选 / 取消全选
   */
  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        const allIds = filteredList
          .map((tc) => tc.id)
          .filter((id): id is number => id !== undefined);
        setSelectedCaseIds(new Set(allIds));
      } else {
        setSelectedCaseIds(new Set());
      }
    },
    [filteredList],
  );

  /**
   * 单个用例选中状态变化
   */
  const handleCaseSelectedChange = useCallback(
    (id: number | undefined, selected: boolean) => {
      if (id === undefined) return;
      setSelectedCaseIds((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    [],
  );

  /**
   * 批量移动成功后的回调
   */
  const handleBatchMoveSuccess = useCallback(() => {
    setSelectedCaseIds(new Set());
    handleRefresh();
    onModulesRefresh?.();
  }, [handleRefresh, onModulesRefresh]);

  /**
   * 单个用例评审状态切换
   * isReview 已为 string 类型（与后端枚举 value 对齐），直接赋值给 ITestCase.is_review
   */
  const handleReviewChange = useCallback(
    (caseId: number, isReview: string) => {
      setCaseList((prev) =>
        prev.map((tc) =>
          tc.id === caseId ? { ...tc, is_review: isReview } : tc,
        ),
      );
      onModulesRefresh?.();
    },
    [onModulesRefresh],
  );

  /**
   * 单个用例一轮测试状态切换
   * 仅更新对应字段，保持其它状态不变；同步触发 onModulesRefresh 以更新左侧模块树计数
   */
  const handleFirstStatusChange = useCallback(
    (caseId: number, status: string) => {
      setCaseList((prev) =>
        prev.map((tc) =>
          tc.id === caseId ? { ...tc, first_status: status } : tc,
        ),
      );
      onModulesRefresh?.();
    },
    [onModulesRefresh],
  );

  /**
   * 单个用例二轮测试状态切换
   * 逻辑同 handleFirstStatusChange
   */
  const handleSecondStatusChange = useCallback(
    (caseId: number, status: string) => {
      setCaseList((prev) =>
        prev.map((tc) =>
          tc.id === caseId ? { ...tc, second_status: status } : tc,
        ),
      );
      onModulesRefresh?.();
    },
    [onModulesRefresh],
  );

  /**
   * 退出批量选择模式
   */
  const handleExitSelection = useCallback(() => {
    setSelectedCaseIds(new Set());
  }, []);

  /**
   * 处理卡片折叠状态变更
   * 更新 collapsedCaseIds 集合
   * 注意：不在此处调用 resetAfterIndex，由 useEffect 统一处理
   */
  const handleCollapsedChange = useCallback(
    (caseId: number | undefined, collapsed: boolean) => {
      if (caseId === undefined) return;
      setCollapsedCaseIds((prev) => {
        const next = new Set(prev);
        if (collapsed) {
          next.add(caseId);
        } else {
          next.delete(caseId);
        }
        return next;
      });
    },
    [],
  );

  /**
   * 一键折叠 / 展开所有用例卡片
   * collapsed=true → 将当前列表所有 caseId 加入 collapsedCaseIds
   * collapsed=false → 清空 collapsedCaseIds
   *
   * 注意：仅更新状态，不在此处调用 resetAfterIndex。
   * 虚拟列表的重测量由下方的 useEffect 统一处理（rerender-move-effect-to-event），
   * 确保 resetAfterIndex 在 collapsedCaseIds 已落盘后才执行，
   * 避免 itemSize 回调读到旧 Set 导致高度计算错误。
   */
  const handleCollapseAllChange = useCallback(
    (collapsed: boolean) => {
      setCollapsedCaseIds(() => {
        if (collapsed) {
          // 折叠全部：将 filteredList 中所有有 id 的 case 加入 Set
          return new Set(
            filteredList
              .map((tc) => tc.id)
              .filter((id): id is number => id !== undefined),
          );
        }
        // 展开全部：清空
        return new Set();
      });
    },
    [filteredList],
  );

  /**
   * collapsedCaseIds 变化后，通知虚拟列表从索引 0 起重新测量所有行高
   * 统一处理「单个卡片折叠」和「一键折叠/展开」两种场景的高度同步
   */
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已提交新布局后再重测
    const rafId = requestAnimationFrame(() => {
      virtualListRef.current?.resetAfterIndex(0, true);
    });
    return () => cancelAnimationFrame(rafId);
  }, [collapsedCaseIds]);

  /**
   * 在指定用例之后插入新用例
   * 设置插入位置标记，打开新建表单抽屉
   */
  const handleInsertAfter = useCallback((afterCaseId: number) => {
    setInsertAfterCaseId(afterCaseId);
    setDrawerVisible(true);
  }, []);

  /**
   * 在指定用例之后批量上传导入
   * 设置插入位置标记，打开导入弹窗
   * 导入完成后通过 onUploadFinish 触发 reorder 到目标位置
   */
  const handleInsertAfterImport = useCallback((afterCaseId: number) => {
    setInsertAfterCaseId(afterCaseId);
    setImportModalVisible(true);
  }, []);

  /**
   * 导入完成回调
   * 如果有指定插入位置（insertAfterCaseId），刷新后自动将新导入的用例移到目标位置
   */
  const handleImportFinish = useCallback(async () => {
    const targetInsertId = insertAfterCaseId;
    // 先清空标记，避免后续刷新重复触发
    setInsertAfterCaseId(null);
    // 刷新列表获取最新数据（包含新导入的用例）
    handleRefresh();

    // 如果指定了目标位置，等刷新后将新导入的用例排序到目标之后
    if (targetInsertId !== null) {
      setTimeout(async () => {
        try {
          const { data: freshList } = await queryPlanCases({
            plan_id: Number(planId),
            plan_module_id: moduleId ?? undefined,
          });
          if (!freshList || !Array.isArray(freshList)) return;

          // 新导入的用例通常在列表末尾
          // 找到目标位置的索引，将末尾的新用例移到其后
          const targetIndex = freshList.findIndex(
            (tc) => tc.id === targetInsertId,
          );
          if (targetIndex >= 0 && targetIndex < freshList.length - 1) {
            // 假设新导入的用例在末尾，将其移到 targetIndex + 1 的位置
            const reordered = [...freshList];
            const lastIdx = reordered.length - 1;
            const [importedCase] = reordered.splice(lastIdx, 1);
            reordered.splice(targetIndex + 1, 0, importedCase);
            await reorderPlanCases({
              plan_id: Number(planId),
              plan_module_id: moduleId ?? undefined,
              case_ids: reordered.map((c) => c.id!).filter(Boolean),
            });
            handleRefresh();
          }
        } catch {
          // 排序失败不影响导入成功的结果
        }
      }, 800);
    }
  }, [insertAfterCaseId, handleRefresh, planId, moduleId]);

  /**
   * 拖拽排序处理
   * 乐观更新列表顺序，异步调用 API 持久化
   * 失败时回滚到原始顺序
   */
  const handleCaseReorder = useCallback(
    async (activeId: number, overId: number) => {
      // 在 filteredList 中找到位置（filteredList 与 caseList 保持同序）
      const oldIndex = filteredList.findIndex((tc) => tc.id === activeId);
      const newIndex = filteredList.findIndex((tc) => tc.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      // 乐观更新：立即调整 caseList 顺序
      const prevList = [...caseList];
      const moved = arrayMove(prevList, oldIndex, newIndex);
      setCaseList(moved);

      try {
        const { code } = await reorderPlanCases({
          plan_id: Number(planId),
          plan_module_id: moduleId ?? undefined,
          case_ids: moved.map((c) => c.id!).filter(Boolean),
        });
        if (code !== 0) {
          throw new Error('排序失败');
        }
      } catch {
        message.error('排序失败，已回滚');
        // 回滚到原始顺序
        setCaseList(prevList);
      }
    },
    [filteredList, caseList, planId, moduleId],
  );

  /**
   * 添加用例到计划
   * 支持指定位置插入（insertAfterCaseId 不为 null 时）
   */
  const OnCaseSave = async (values: Record<string, unknown>) => {
    const newValue = {
      ...values,
      plan_id: Number(planId),
      plan_module_id: moduleId ?? undefined,
      project_id: planInfo?.project_id ?? undefined,
    };
    const { code, msg } = await insertPlanCases(
      newValue as unknown as ITestCase,
    );

    if (code === 0) {
      // 如果有指定插入位置，记录下来，刷新后需要将新用例移到正确位置
      const targetInsertAfterId = insertAfterCaseId;
      setInsertAfterCaseId(null);
      setDrawerVisible(false);
      // 先刷新列表获取最新数据（包含新插入的用例）
      handleRefresh();

      // 如果指定了插入位置，等刷新后将新用例排序到目标位置
      if (targetInsertAfterId !== null) {
        // 延迟执行：等待 fetchPlanData 完成后获取新列表
        setTimeout(async () => {
          try {
            const { data: freshList } = await queryPlanCases({
              plan_id: Number(planId),
              plan_module_id: moduleId ?? undefined,
            });
            if (!freshList || !Array.isArray(freshList)) return;

            // 找到新插入的用例（通常是最后一个）和目标位置
            const newCaseId = freshList[freshList.length - 1]?.id;
            const targetIndex = freshList.findIndex(
              (tc) => tc.id === targetInsertAfterId,
            );
            if (newCaseId && targetIndex >= 0) {
              // 构建目标顺序：新用例放到 targetIndex + 1 的位置
              const reordered = [...freshList];
              const newIdx = reordered.findIndex((tc) => tc.id === newCaseId);
              if (newIdx !== -1 && newIdx !== targetIndex + 1) {
                const [newCase] = reordered.splice(newIdx, 1);
                reordered.splice(targetIndex + 1, 0, newCase);
                await reorderPlanCases({
                  plan_id: Number(planId),
                  plan_module_id: moduleId ?? undefined,
                  case_ids: reordered.map((c) => c.id!).filter(Boolean),
                });
                handleRefresh();
              }
            }
          } catch {
            // 排序失败不影响插入成功的结果
          }
        }, 500);
      }
    } else {
      message.error(msg || '保存失败');
    }
  };

  /* ============================================================
   * 虚拟化相关
   * ============================================================ */

  /** 跟踪容器实际高度，供 VariableSizeList 使用 */
  const listHeight = useElementHeight(listContainerRef);

  /** 用例卡片基线高度（ProCard 头部 + 边距） */
  const EXPANDED_BASE = 120;
  /** StepTable 中每行步骤的估算高度 */
  const STEP_ROW_HEIGHT = 32;
  /**
   * 折叠态卡片仅保留头部的高度（不含表格）
   * 约等于 ProCard headerBordered 区域 + padding
   */
  const COLLAPSED_HEIGHT = 52;

  /**
   * 估算某条用例的渲染高度
   * 折叠时只返回头部高度（COLLAPSED_HEIGHT），
   * 展开时返回基线 + 步骤数 × 行高
   *
   * 注意：collapsedCaseIds 变化时会触发 resetAfterIndex(0)，
   * 让 VariableSizeList 重新测量所有行高，无需在此处做增量更新。
   */
  const itemSize = useCallback(
    (index: number) => {
      const tc = filteredList[index];
      if (!tc || tc.id === undefined) return EXPANDED_BASE;
      if (collapsedCaseIds.has(tc.id)) return COLLAPSED_HEIGHT;
      const stepCount = tc.case_sub_steps?.length || 0;
      return EXPANDED_BASE + stepCount * STEP_ROW_HEIGHT;
    },
    [filteredList, collapsedCaseIds],
  );

  /**
   * 列表数据变化时让虚拟列表重新测量
   * resetAfterIndex 让从 0 起的所有项重新计算偏移
   */
  useEffect(() => {
    virtualListRef.current?.resetAfterIndex(0, true);
  }, [filteredList]);

  /**
   * 构造虚拟列表行数据
   * 用 useMemo 锁住引用，避免每次 render 都生成新对象导致行全部重渲染
   * 注意：此 useMemo 必须放在所有依赖函数定义之后，确保依赖数组中的函数引用稳定
   */
  const rowData = useMemo<CaseRowData>(
    () => ({
      // ?? [] 兜底，防止极短瞬间 filteredList 处于 undefined 状态
      list: filteredList ?? [],
      selectedCaseIds: selectedCaseIds ?? new Set<number>(),
      planId,
      moduleId,
      onSelectedChange: handleCaseSelectedChange,
      onReviewChange: handleReviewChange,
      onFirstStatusChange: handleFirstStatusChange,
      onSecondStatusChange: handleSecondStatusChange,
      onCollapsedChange: handleCollapsedChange,
      onInsertAfter: handleInsertAfter,
      isSortable: true,
      onRefresh: handleRefresh,
      collapsedCaseIds: collapsedCaseIds ?? new Set<number>(),
    }),
    [
      filteredList,
      selectedCaseIds,
      planId,
      moduleId,
      handleCaseSelectedChange,
      handleReviewChange,
      handleFirstStatusChange,
      handleSecondStatusChange,
      handleCollapsedChange,
      handleInsertAfter,
      handleRefresh,
      collapsedCaseIds,
    ],
  );

  const selectedCaseIdsArray = useMemo(
    () => Array.from(selectedCaseIds),
    [selectedCaseIds],
  );

  return (
    <>
      <div
        style={{
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ProCard
          title={
            <Space size="middle">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setDrawerVisible(true)}
              >
                新增用例
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => setOpenChoiceCaseDrawer(true)}
              >
                关联用例
              </Button>
            </Space>
          }
          headerBordered
          variant={'outlined'}
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
              padding: '6px',
              // 让 body 成为 flex 容器，子元素的 flex: 1 才能撑开高度
              // 否则列表容器 height=auto、useElementHeight 测到 0、列表不渲染
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          extra={
            <CaseFilterBar
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              onBatchExport={handleBatchExport}
              onBatchImport={handleBatchImport}
              onCollapseAllChange={handleCollapseAllChange}
              hasActiveFilter={hasActiveFilter}
              filters={filters}
              resultCount={filteredList.length}
            />
          }
        >
          <div
            ref={listContainerRef}
            style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 0,
              position: 'relative',
              padding: '0 2px',
              paddingBottom: selectedCaseIds.size > 0 ? '68px' : '2px',
            }}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: spacing.xxxl,
                  gap: spacing.md,
                }}
              >
                <Spin />
                <span style={{ color: '#999', fontSize: 14 }}>加载中...</span>
              </div>
            ) : filteredList.length > 0 && listHeight > 0 ? (
              <PlanCaseSortableWrapper
                items={filteredList}
                onReorder={handleCaseReorder}
              >
                <VariableSizeList
                  ref={virtualListRef}
                  height={listHeight}
                  itemCount={filteredList.length}
                  itemSize={itemSize}
                  width="100%"
                  itemData={rowData}
                  overscanCount={3}
                >
                  {CaseRow}
                </VariableSizeList>
              </PlanCaseSortableWrapper>
            ) : !loading ? (
              <div style={styles.emptyState()}>
                <Empty
                  description={
                    <span style={{ color: colors.textTertiary }}>
                      {filters.keyword ||
                      filters.firstStatus !== undefined ||
                      filters.secondStatus !== undefined ||
                      filters.isReview !== undefined ||
                      (filters.creators !== undefined &&
                        filters.creators.length > 0)
                        ? '没有匹配的用例'
                        : '暂无用例，请新增或规划用例'}
                    </span>
                  }
                />
              </div>
            ) : null}
          </div>
        </ProCard>
      </div>

      <MyDrawer
        name={'添加用例'}
        width={'60%'}
        open={drawerVisible}
        setOpen={setDrawerVisible}
      >
        <NewCaseForm onSubmit={OnCaseSave} />
      </MyDrawer>
      <MyDrawer
        name={'规划用例'}
        open={openChoiceCaseDrawer}
        setOpen={setOpenChoiceCaseDrawer}
        width={'60%'}
      >
        <ChoiceCaseTable
          onCaseSelect={handleAssociateCases}
          hideAddButton={false}
          projectId={planInfo?.project_id}
        />
      </MyDrawer>

      {selectedCaseIds.size > 0 && (
        <BatchActionBar
          selectedCount={selectedCaseIds.size}
          selectedCaseIds={selectedCaseIdsArray}
          planId={planId}
          onBatchSuccess={handleBatchMoveSuccess}
          onExit={handleExitSelection}
          onInsertAfter={handleInsertAfter}
          onInsertAfterImport={handleInsertAfterImport}
        />
      )}

      <PlanCaseImportModal
        open={importModalVisible}
        onOpenChange={setImportModalVisible}
        planId={planId || ''}
        planModules={planModules}
        onUploadFinish={handleImportFinish}
      />
    </>
  );
};

export default Index;
