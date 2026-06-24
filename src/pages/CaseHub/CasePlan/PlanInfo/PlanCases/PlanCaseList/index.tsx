import {
  associatePlanCases,
  insertPlanCases,
  queryPlanCases,
  reorderPlanCases,
  reorderPlanCasesBulk,
} from '@/api/case/caseplan';
import { exportCases } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan, IPlanModule, ITestCase } from '@/pages/CaseHub/types';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
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
import ModuleCaseSelector from './components/ModuleCaseSelector';
// @ts-ignore
import { VariableSizeList } from 'react-window';
import { usePlanCaseListStyles } from '../styles';
import BatchActionBar from './components/BatchActionBar';
import CaseFilterBar from './components/CaseFilterBar';
import CaseItem from './components/CaseItem';
import NewCaseForm from './components/NewCaseForm';
import PlanCaseImportModal from './components/PlanCaseImportModal';
import PlanCaseSortableWrapper, {
  DropPosition,
} from './components/PlanCaseSortableWrapper';
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
  /** 二轮测试状态变更回调 */
  onSecondStatusChange: (caseId: number, status: string) => void;
  /** 卡片折叠状态变更回调（用于虚拟列表动态调整行高） */
  onCollapsedChange: (caseId: number | undefined, collapsed: boolean) => void;
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
        padding: 8,
        // 卡片之间留 4px 视觉间隙（itemSize 已在 EXPANDED_HEIGHT 计入此 padding）
        paddingBottom: 4,
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
          onSecondStatusChange={data?.onSecondStatusChange ?? (() => {})}
          onCollapsedChange={data?.onCollapsedChange ?? (() => {})}
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
  planInfo?: ICasePlan;
  /**
   * 计划目录树 (来自父级 PlanCases, 用于反查当前 moduleId 对应的 module 名称,
   */
  planModules?: IPlanModule[];
  onModulesRefresh?: () => void;
}

/**
 * 计划用例列表组件
 * 展示指定计划下的所有测试用例，支持筛选、选中、批量操作等功能
 */
const Index: FC<PlanCaseListProps> = ({
  planId,
  moduleId,
  planInfo,
  planModules,
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
  /**
   * 记录"在哪个 case 之后批量导入"的锚点（null = 追加到末尾）。
   * 之前"下方插入用例"功能也复用此 state,已下线,只服务于批量导入。
   */
  const [importAfterCaseId, setImportAfterCaseId] = useState<number | null>(
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

  /**
   * 按所选 case_ids 导出 (走 exportCases 的 case_ids 路径).
   * 0 选时弹提示; 走 exportCases 后端默认模板仍是 M2 (RoundtripReader 兼容).
   * 多个入口复用: title 区的'导出所选' (case_ids) + BatchActionBar 的圆形'导出'按钮.
   */
  const handleBatchExport = useCallback(
    async (idsOverride?: number[]) => {
      const ids = idsOverride ?? Array.from(selectedCaseIds);
      if (ids.length === 0) {
        message.warning('请先选择要导出的用例');
        return;
      }
      if (!planId || !planInfo?.project_id) {
        message.warning('计划信息未加载, 无法导出');
        return;
      }
      try {
        await exportCases({
          scope_type: 'plan',
          scope_id: Number(planId),
          project_id: planInfo.project_id,
          case_ids: ids,
        });
        message.success('导出已开始, 留意浏览器下载');
      } catch (err) {
        // 全局拦截器已 message.error, 这里吞掉避免 unhandled rejection
        console.error('exportCases failed:', err);
      }
    },
    [planId, planInfo, selectedCaseIds],
  );

  const handleBatchImport = useCallback(() => setImportModalVisible(true), []);

  /**
   * 关联用例到当前计划
   * @param caseIds 选中的用例 ID 列表
   * @param options.moduleIds 源项目模块 ID 列表（用于后端按目录复制/匹配计划分组）
   */
  const handleAssociateCases = async (
    caseIds: number[],
    options?: { moduleIds?: number[] },
  ) => {
    if (caseIds.length === 0) {
      message.warning('请至少选择一个用例');
      return;
    }
    const { code, msg } = await associatePlanCases({
      plan_id: Number(planId),
      case_ids: caseIds,
      // 兜底目标分组（用户在计划页左侧选中的 plan_module）
      plan_module_id: moduleId ?? undefined,
      // 源项目模块 ID 列表：传了就走后端"按目录复制"逻辑
      module_ids: options?.moduleIds?.length ? options.moduleIds : undefined,
    });
    if (code === 0) {
      message.success('关联成功');
      setOpenChoiceCaseDrawer(false);
      handleRefresh();
    } else {
      message.error(msg || '关联失败');
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
  const handleReviewChange = useCallback((caseId: number, isReview: string) => {
    setCaseList((prev) =>
      prev.map((tc) =>
        tc.id === caseId ? { ...tc, is_review: isReview } : tc,
      ),
    );
  }, []);

  /**
   * 单个用例二轮测试状态切换
   * 仅更新对应字段，保持其它状态不变；
   */
  const handleSecondStatusChange = useCallback(
    (caseId: number, status: string) => {
      setCaseList((prev) =>
        prev.map((tc) =>
          tc.id === caseId ? { ...tc, second_status: status } : tc,
        ),
      );
    },
    [],
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
   * 注意：不在此处调用 resetAfterIndex，由下方的 useLayoutEffect 统一处理，
   * 详见折叠状态 effect 处的注释（重测行高的同步/强制策略说明）。
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
   * 虚拟列表的重测量由下方的 useLayoutEffect 统一处理（rerender-move-effect-to-event），
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
   * 折叠状态变更后，通知虚拟列表重新计算行高
   *
   * 关键修复：useLayoutEffect + resetAfterIndex(0, true)
   * --------------------------------------------------------
   * 历史问题：原来用 useEffect + rAF + resetAfterIndex(0, false) 时，'一键折叠 /
   * 展开'会出现偶发的'卡片之间巨大空白'，需要轻微滚动才能恢复。
   *
   * 根因：react-window 的 resetAfterIndex(index, false) 只把内部 size 缓存标记
   * 为 stale（lastMeasuredIndex = index - 1）但【不】调用 forceUpdate。
   * 下次 render 才会用最新 itemSize 回调重测行高。问题是'下次 render'何时来？
   *   - 折叠/展开时，ProCard body 走 display:none / StepTable 条件卸载，
   *     DOM 在 commit 阶段同步完成，但 React 此时已经 commit 完毕；
   *   - useEffect + rAF 跑在 paint 之后，浏览器可能先画一帧'旧高度'快照，
   *     用户看到的就是大空白；
   *   - 直到 ResizeObserver / scroll 事件触发新 render，缓存才被重算。
   *
   * 修复策略：
   *   1) useLayoutEffect：在 DOM 更新后、浏览器绘制前同步执行，
   *      确保'清缓存 + 触发重测'先于用户视觉感知；
   *   2) resetAfterIndex(0, true)：forceUpdate 强制走一次 render，
   *      让 react-window 用最新 itemSize 重算所有 item 的 offset。
   *
   * 性能说明：true 模式会触发一次 forceUpdate，对 100+ 行的滚动场景是负担，
   * 但折叠/展开是【低频】操作（一次最多触发两次），可以放心使用。
   * 滚动场景依旧走 useElementHeight + 容器高度变化触发常规重渲染。
   */
  useLayoutEffect(() => {
    virtualListRef.current?.resetAfterIndex(0, true);
  }, [collapsedCaseIds]);

  /**
   * 在指定用例之后批量上传导入
   * 设置插入位置标记，打开导入弹窗
   * 导入完成后通过 onUploadFinish 触发 reorder 到目标位置
   */
  const handleInsertAfterImport = useCallback((afterCaseId: number) => {
    setImportAfterCaseId(afterCaseId);
    setImportModalVisible(true);
  }, []);

  /**
   * 导入完成回调
   * 如果有指定插入位置（insertAfterCaseId），刷新后自动将新导入的用例移到目标位置
   */
  const handleImportFinish = useCallback(async () => {
    const targetInsertId = importAfterCaseId;
    // 先清空标记，避免后续刷新重复触发
    setImportAfterCaseId(null);
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
            // 新导入的用例通常在列表末尾，用锚点 API 把它移到目标之后
            const importedCase = freshList[freshList.length - 1];
            if (importedCase?.id) {
              await reorderPlanCases({
                plan_id: Number(planId),
                case_id: importedCase.id,
                after_id: targetInsertId,
              });
              handleRefresh();
            }
          }
        } catch {
          // 排序失败不影响导入成功的结果
        }
      }, 800);
    }
  }, [importAfterCaseId, handleRefresh, planId, moduleId]);

  /**
   * 拖拽排序处理（单选 / 多选统一入口）
   *
   * 设计要点
   * --------
   * - 多选检测：当 ``selectedCaseIds.size > 1`` 且 activeId 属于选中集合时，
   *   触发"块拖拽"语义：整块作为整体移动到 over 之后，块内顺序保持
   * - 乐观更新：本地立即重排，UI 不阻塞；失败时回滚到原顺序
   * - 传输最小化：
   *     - 单条：走单条接口，传 (case_id, after_id, before_id)
   *     - 多选：走 bulk 接口，链式锚点：
   *         block[0].after_id = overId
   *         block[i].after_id = block[i-1]   (i > 0)
   *       块内顺序 = 当前 caseList 顺序
   *
   * @param activeId 被拖拽的用例ID
   * @param overId 目标位置的用例ID（dnd-kit 提供的 drop target）
   */
  const handleCaseReorder = useCallback(
    async (activeId: number, overId: number, dropPosition: DropPosition) => {
      if (activeId === overId) return;

      // 1) 检测是否多选块拖拽
      const isBlockDrag =
        selectedCaseIds.size > 1 && selectedCaseIds.has(activeId);

      // 2) 计算要移动的 case_id 列表（按 caseList 当前顺序）
      const movedIds: number[] = isBlockDrag
        ? caseList
            .map((tc) => tc.id)
            .filter(
              (id): id is number => id !== undefined && selectedCaseIds.has(id),
            )
        : [activeId];

      // 3) drop target 必须在 caseList 中，且不应是被移动的 case 之一
      if (!movedIds.includes(overId)) {
        // 正常路径
      } else {
        // overId 在 moved 里 = drop 到了块内某个 case 上，相当于无操作
        return;
      }

      // 4) 乐观更新：取块 → 从原列表删除 → 按 dropPosition 插到 over 之前 / 之后
      const prevList = caseList;
      const block = caseList.filter(
        (tc) => tc.id !== undefined && movedIds.includes(tc.id),
      );
      const cleanList = caseList.filter(
        (tc) => tc.id === undefined || !movedIds.includes(tc.id),
      );
      const anchorIdx = cleanList.findIndex((tc) => tc.id === overId);
      if (anchorIdx === -1) return;
      // 根据 dropPosition 决定插入到 over 之前还是之后
      const insertIdx = dropPosition === 'before' ? anchorIdx : anchorIdx + 1;
      const newList = [
        ...cleanList.slice(0, insertIdx),
        ...block,
        ...cleanList.slice(insertIdx),
      ];
      setCaseList(newList);

      // 5) 构造 items：链式锚点
      // - dropPosition='after': 第一条 after_id=overId，后续链式 after_id=前一条
      // - dropPosition='before': 第一条 before_id=overId 落到 over 之前，后续链式 after_id=前一条
      //   （链式用 after_id 是因为：第一条已落到 over 之前，后续每条只要 after 前一条
      //   就会自然夹在第一条和 over 之间，从而保持块内顺序）
      const items = movedIds.map((cid, i) => {
        if (i === 0 && dropPosition === 'before') {
          return { case_id: cid, before_id: overId };
        }
        return {
          case_id: cid,
          after_id: i === 0 ? overId : movedIds[i - 1],
        };
      });

      try {
        if (movedIds.length === 1) {
          // 单条：单条接口，根据 dropPosition 选用 before_id / after_id
          const { code } = await reorderPlanCases({
            plan_id: Number(planId),
            case_id: activeId,
            ...(dropPosition === 'before'
              ? { before_id: overId }
              : { after_id: overId }),
          });
          if (code !== 0) throw new Error('reorder failed');
        } else {
          // 块：bulk 接口
          const { code } = await reorderPlanCasesBulk({
            plan_id: Number(planId),
            items,
          });
          if (code !== 0) throw new Error('bulk reorder failed');
        }
      } catch {
        message.error('排序失败，已回滚');
        setCaseList(prevList);
      }
    },
    [caseList, selectedCaseIds, planId],
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
      setDrawerVisible(false);
      handleRefresh();
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
   * 用例前置条件 (case_setup) 块的估算高度
   * 对应 CaseItem 内 caseSetupBlock 的渲染高度:
   *   padding 4px(top) + 6px(bottom) + 内部 16~20px 文字行高 ≈ 28~30px
   * 取 32 与 STEP_ROW_HEIGHT 对齐, 后续要调 CaseItem 排版时记得同步这里,
   * 否则虚拟列表铺位会跟实际 DOM 错位, 表现为 "下一步骤被覆盖"
   */
  const CASE_SETUP_BLOCK_HEIGHT = 32;

  /**
   * 行高查表：key=caseId, value=估算高度
   * 通过 useMemo 在 filteredList / collapsedCaseIds 变化时一次性算好，
   * 让 itemSize 回调本身保持纯函数 + 稳定依赖（不读 filteredList 引用），
   * 避免任何 setState 重建 itemSize 引用从而触发 VariableSizeList 全表重测。
   *
   * 高度规则:
   *   - 折叠态: 仅 header, 不渲染 caseSetupBlock / StepTable, 高度 = COLLAPSED_HEIGHT
   *   - 展开态: header + caseSetupBlock + StepTable,
   *     高度 = EXPANDED_BASE + stepCount * STEP_ROW_HEIGHT + CASE_SETUP_BLOCK_HEIGHT
   *     展开态每张卡片都追加 caseSetupBlock 高度, 不管有没有 case_setup,
   *     让有/无前置 case 行高一致, 避免虚拟列表铺位错乱.
   */
  const heightByCaseId = useMemo(() => {
    const map = new Map<number, number>();
    for (const tc of filteredList) {
      if (tc.id === undefined) continue;
      if (collapsedCaseIds.has(tc.id)) {
        map.set(tc.id, COLLAPSED_HEIGHT);
      } else {
        const stepCount = tc.case_sub_steps?.length || 0;
        map.set(
          tc.id,
          EXPANDED_BASE + stepCount * STEP_ROW_HEIGHT + CASE_SETUP_BLOCK_HEIGHT,
        );
      }
    }
    return map;
  }, [filteredList, collapsedCaseIds]);

  /**
   * 估算某条用例的渲染高度（纯函数 + 稳定引用）
   * 依赖仅 heightByCaseId：filteredList 内容或 collapsedCaseIds 变化才会重建；
   * 其它 state（如 selectedCaseIds）变化不会重建，避免 VariableSizeList 全表重测。
   */
  const itemSize = useCallback(
    (index: number) => {
      const tc = filteredList[index];
      if (!tc || tc.id === undefined) return EXPANDED_BASE;
      return heightByCaseId.get(tc.id) ?? EXPANDED_BASE;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredList, heightByCaseId],
  );

  /**
   * 列表数据变化时（筛选 / 刷新）让虚拟列表重新测量
   *
   * 同步用 useLayoutEffect + resetAfterIndex(0, true)，与折叠 effect 一致。
   * 筛选/刷新同样是低频操作，true 模式下的 forceUpdate 成本可接受；
   * 这样能避免出现'切换筛选后偶现行高错乱'的同类问题。
   */
  useLayoutEffect(() => {
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
      onSecondStatusChange: handleSecondStatusChange,
      onCollapsedChange: handleCollapsedChange,
      isSortable: true,
      /**
       * peer 判定：选中 ≥2 且当前 case 在选中集合内
       * 选中即可见（不需拖动），给用户"块已就绪"的即时反馈
       */
      isBlockDragPeer: (caseId: number) =>
        selectedCaseIds.size > 1 && selectedCaseIds.has(caseId),
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
      handleSecondStatusChange,
      handleCollapsedChange,
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
              {/*
                "新增用例"仅在选中具体子目录时出现。
                - moduleId 为 null (= 左侧选中"全部用例")时, 没有"放入哪个目录"的语义,
                  硬让用户新增会落不到任何 plan_module, 容易让用例"飘"在全部用例里;
                - 选了子目录, moduleId 是有效数字, 此时新增会自动挂到该 plan_module.
              */}
              {moduleId != null && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setDrawerVisible(true)}
                >
                  新增用例
                </Button>
              )}
              <Button
                icon={<LinkOutlined />}
                onClick={() => setOpenChoiceCaseDrawer(true)}
              >
                关联用例
              </Button>
              {/*
                原"按当前 plan_module 导出"按钮已移除。
                改为:批量导出统一在 BatchActionBar 内的"导出所选"入口里完成,
                避免工具栏上重复出现导出入口,操作更聚焦。
              */}
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
              /**
               * 计划项目上下文 (planInfo.project_id) 未加载完时不传 onBatchImport,
               * CaseFilterBar 内部据此隐藏"批量导入"菜单项, 避免后端 422.
               */
              onBatchImport={
                planInfo?.project_id ? handleBatchImport : undefined
              }
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
        width={'75%'}
      >
        <ModuleCaseSelector
          planId={planId}
          projectId={planInfo?.project_id}
          projectName={planInfo?.plan_name}
          onConfirm={handleAssociateCases}
          onCancel={() => setOpenChoiceCaseDrawer(false)}
        />
      </MyDrawer>

      {selectedCaseIds.size > 0 && (
        <BatchActionBar
          selectedCount={selectedCaseIds.size}
          selectedCaseIds={selectedCaseIdsArray}
          planId={planId}
          onBatchSuccess={handleBatchMoveSuccess}
          onBatchExport={handleBatchExport}
          onExit={handleExitSelection}
          onInsertAfterImport={handleInsertAfterImport}
        />
      )}

      <PlanCaseImportModal
        open={importModalVisible}
        onOpenChange={setImportModalVisible}
        planId={planId || ''}
        /**
         * 把 plan 所属项目的 id 传给预览组件, 启用"用例库分组"硬门禁.
         * plan 本身已经绑定了 project, 这里直接读 planInfo.
         */
        projectId={planInfo?.project_id ?? 0}
        onUploadFinish={handleImportFinish}
        /**
         * 导入完成后刷新左侧计划目录树.
         * Excel "所属分组" 列会在 plan_module 表创建缺失节点,
         * 不刷新会导致新建的目录不显示, 用户感知不到.
         */
        onModuleRefresh={onModulesRefresh}
      />
    </>
  );
};

export default Index;
