/**
 * RequirementCases 页面组件
 * 用于展示和管理需求关联的测试用例列表
 * 支持用例搜索、筛选、分组、全选、状态管理等功能
 */
import { linkCommonCases } from '@/api/case/requirement';
import {
  addDefaultTestCase,
  queryCasesByRequirement,
  queryTagsByRequirement,
  updateRequirementCase,
  updateTestCase,
} from '@/api/case/testCase';
import { CaseSearchForm, ITestCase } from '@/pages/CaseHub/types';
import { useParams } from '@@/exports';
import {
  AppstoreOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Collapse, Empty, Spin, Typography } from 'antd';
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import CaseStatsBar from './components/CaseStatsBar';
import CaseStepSearchForm from './components/CaseStepSearchForm';
import RequirementCaseCard from './components/RequirementCaseCard';

const { Text } = Typography;

const colors = {
  primary: '#1677ff',
  primaryBg: '#e6f4ff',
  success: '#52c41a',
  successBg: '#f6ffed',
  warning: '#faad14',
  warningBg: '#fffbe6',
  error: '#ff4d4f',
  errorBg: '#fff2f0',
  bgContainer: '#ffffff',
  bgLayout: '#f5f5f5',
  border: '#d9d9d9',
  borderSecondary: '#f0f0f0',
  text: '#262626',
  textSecondary: '#8c8c8c',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};

const collapseExpandIcon = (isActive: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: borderRadius.sm,
  background: colors.primary,
  transition: 'all 200ms ease',
});

const groupedCaseLabel: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  fontWeight: 600,
  fontSize: 14,
};

const groupTitle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing.sm,
};

const groupCount: CSSProperties = {
  color: colors.textSecondary,
  fontSize: 12,
  fontWeight: 500,
};

interface GroupedTestCases {
  tag: string;
  cases: ITestCase[];
}

/**
 * 需求用例页面主组件
 * 包含状态管理、数据获取、渲染逻辑
 */
const Index: React.FC = () => {
  /** 从 URL 获取路由参数 */
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();

  /** 搜索表单数据 */
  const [searchInfo, setSearchInfo] = useState<CaseSearchForm>({});
  /** 是否需要滚动到顶部 */
  const [shouldScroll, setShouldScroll] = useState(false);
  /** 用例列表数据 */
  const [testCases, setTestCases] = useState<ITestCase[]>([]);
  /** 标签选项列表 */
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  /** 加载状态 */
  const [loading, setLoading] = useState(false);
  /** 刷新计数 key，用于触发数据重新加载 */
  const [reloadKey, setReloadKey] = useState(0);
  /** 已选中的用例 ID 集合 */
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );
  /** 是否启用分组显示模式 */
  const [isGrouped, setIsGrouped] = useState(true);
  /** 当前展开的分组 key 列表 */
  const [activeGroupKeys, setActiveGroupKeys] = useState<string[]>([]);
  /** 分组初始化状态标识 */
  const [isGroupInitialized, setIsGroupInitialized] = useState(false);

  /**
   * 刷新用例列表
   * 通过递增 reloadKey 触发 useEffect 重新加载数据
   */
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  /**
   * 更新单个用例的指定字段
   * @param caseId - 用例 ID
   * @param field - 字段名
   * @param value - 字段新值
   */
  const updateCaseData = useCallback(
    (caseId: number, field: keyof ITestCase, value: unknown) => {
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === caseId ? { ...tc, [field]: value } : tc)),
      );
    },
    [],
  );

  /** 获取用例列表数据 */
  useEffect(() => {
    if (!reqId) return;
    setLoading(true);
    queryCasesByRequirement({ requirement_id: reqId, ...searchInfo })
      .then(({ code, data }) => {
        if (code === 0) setTestCases(data);
      })
      .catch((err) => console.error('Failed to fetch cases:', err))
      .finally(() => setLoading(false));
  }, [reqId, reloadKey, searchInfo]);

  /** 获取标签选项列表 */
  useEffect(() => {
    if (!reqId) return;
    queryTagsByRequirement({ requirement_id: parseInt(reqId) }).then(
      ({ code, data }) => {
        if (code === 0 && data.length > 0) {
          setTags(data.map((tag) => ({ label: tag, value: tag })));
        }
      },
    );
  }, [reqId]);

  /**
   * 将用例列表按标签分组
   * - 有效标签的用例按标签归类
   * - 无标签的用例归入 "未分组"
   */
  const groupedTestCases = useMemo((): GroupedTestCases[] => {
    if (testCases.length === 0) return [];
    const groups = new Map<string, ITestCase[]>();
    const untaggedCases: ITestCase[] = [];
    testCases.forEach((tc) => {
      const tag = tc.case_tag || '';
      if (tag) {
        if (!groups.has(tag)) groups.set(tag, []);
        groups.get(tag)!.push(tc);
      } else {
        untaggedCases.push(tc);
      }
    });
    const result: GroupedTestCases[] = Array.from(groups.entries()).map(
      ([tag, cases]) => ({ tag, cases }),
    );
    if (untaggedCases.length > 0) {
      result.push({ tag: '未分组', cases: untaggedCases });
    }
    return result;
  }, [testCases]);

  /** 判断是否全部展开 */
  const isAllExpanded = useMemo(
    () =>
      activeGroupKeys.length === groupedTestCases.length &&
      groupedTestCases.length > 0,
    [activeGroupKeys, groupedTestCases],
  );

  /** 初始化分组时自动展开所有分组 */
  useEffect(() => {
    if (isGrouped && groupedTestCases.length > 0 && !isGroupInitialized) {
      setActiveGroupKeys(groupedTestCases.map((g) => g.tag));
      setIsGroupInitialized(true);
    }
  }, [isGrouped, groupedTestCases, isGroupInitialized]);

  /** 添加用例后滚动到顶部 */
  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        window.scrollTo({ behavior: 'smooth', top: 0 });
        setShouldScroll(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  /** 搜索条件变更时重置分组状态 */
  useEffect(() => {
    setIsGroupInitialized(false);
    setActiveGroupKeys([]);
  }, [searchInfo]);

  /** 已选中用例数量 */
  const selectedCount = selectedCaseIds.size;
  /** 已选中用例 ID 数组（用于批量操作） */
  const selectedCaseIdsArray = useMemo(
    () => Array.from(selectedCaseIds),
    [selectedCaseIds],
  );

  /**
   * 切换单个用例的选中状态
   * @param caseId - 用例 ID
   */
  const toggleCase = useCallback((caseId: number) => {
    setSelectedCaseIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(caseId) ? newSet.delete(caseId) : newSet.add(caseId);
      return newSet;
    });
  }, []);

  /**
   * 全选用例
   * @param caseIds - 要选中的用例 ID 数组
   */
  const selectAll = useCallback(
    (caseIds: number[]) => setSelectedCaseIds(new Set(caseIds)),
    [],
  );

  /** 清除所有选中状态 */
  const clearSelection = useCallback(() => setSelectedCaseIds(new Set()), []);

  /**
   * 更新用例字段（通用方法）
   * @param caseId - 用例 ID
   * @param field - 字段名
   * @param value - 字段值
   * @returns 是否更新成功
   */
  const updateCaseField = useCallback(
    async (
      caseId: number,
      field: keyof ITestCase,
      value: string | number | boolean,
    ) => {
      const { code } = await updateTestCase({
        id: caseId,
        [field]: value,
      } as unknown as ITestCase);
      if (code === 0) {
        updateCaseData(caseId, field, value);
        return true;
      }
      return false;
    },
    [updateCaseData],
  );

  /**
   * 更新用例等级
   * @param caseId - 用例 ID
   * @param case_level - 用例等级
   * @returns 是否更新成功
   */
  const updateCaseLevel = useCallback(
    async (caseId: number, case_level: string) => {
      if (!reqId) return false;
      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        case_level,
      });
      if (code === 0) {
        updateCaseData(caseId, 'case_level', case_level);
        return true;
      }
      return false;
    },
    [reqId, updateCaseData],
  );

  /**
   * 更新用例类型
   * @param caseId - 用例 ID
   * @param case_type - 用例类型
   * @returns 是否更新成功
   */
  const updateCaseType = useCallback(
    async (caseId: number, case_type: number) => {
      if (!reqId) return false;
      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        case_type,
      });
      if (code === 0) {
        updateCaseData(caseId, 'case_type', case_type);
        return true;
      }
      return false;
    },
    [reqId, updateCaseData],
  );

  /**
   * 更新用例评审状态
   * @param caseId - 用例 ID
   * @param isReview - 是否已评审
   * @returns 是否更新成功
   */
  const updateCaseReview = useCallback(
    async (caseId: number, isReview: boolean) => {
      if (!reqId) return false;
      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        is_review: isReview,
      });
      if (code === 0) {
        updateCaseData(caseId, 'is_review', isReview);
        return true;
      }
      return false;
    },
    [reqId, updateCaseData],
  );

  /** 添加默认用例 */
  const handleAddCase = useCallback(async () => {
    if (!reqId) return;
    const { code } = await addDefaultTestCase({
      requirement_id: parseInt(reqId),
    });
    if (code === 0) {
      refresh();
      setShouldScroll(true);
    }
  }, [reqId, refresh]);

  /**
   * 关联已有用例到需求
   * @param caseIds - 要关联的用例 ID 列表
   */
  const handleCaseSelect = async (caseIds: number[]) => {
    if (!reqId) return;
    const { code } = await linkCommonCases({
      requirement_id: parseInt(reqId),
      case_ids: caseIds,
    });
    if (code === 0) refresh();
  };

  /** 用例统计数据 */
  const caseStats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter((tc) => tc.case_status === 1).length;
    const failed = testCases.filter((tc) => tc.case_status === 2).length;
    const unchecked = testCases.filter(
      (tc) => tc.case_status === 0 || tc.case_status === undefined,
    ).length;
    return { total, passed, failed, unchecked };
  }, [testCases]);

  /** 全选所有用例 */
  const handleSelectAll = useCallback(() => {
    const allIds = testCases
      .map((tc) => tc.id)
      .filter((id): id is number => id !== undefined);
    selectAll(allIds);
  }, [testCases, selectAll]);

  /** 切换分组/平铺模式 */
  const toggleGrouped = useCallback(() => setIsGrouped((p) => !p), []);
  /** 展开所有分组 */
  const expandAll = useCallback(
    () => setActiveGroupKeys(groupedTestCases.map((g) => g.tag)),
    [groupedTestCases],
  );
  /** 收起所有分组 */
  const collapseAll = useCallback(() => setActiveGroupKeys([]), []);

  /**
   * 渲染单个用例卡片
   * @param item - 用例数据
   */
  const renderTestCase = useCallback(
    (item: ITestCase) => (
      <RequirementCaseCard
        key={item.id}
        testcaseData={item}
        isSelected={selectedCaseIds.has(item.id!)}
        onToggleCase={toggleCase}
        reqId={reqId}
        tags={tags}
        onTagsChange={setTags}
        onUpdateCaseField={updateCaseField}
        onUpdateCaseReview={updateCaseReview}
        onUpdateCaseLevel={updateCaseLevel}
        onUpdateCaseType={updateCaseType}
        onRefreshCases={refresh}
        onCaseDataChange={updateCaseData}
      />
    ),
    [
      selectedCaseIds,
      toggleCase,
      reqId,
      tags,
      updateCaseField,
      updateCaseReview,
      updateCaseLevel,
      updateCaseType,
      refresh,
      updateCaseData,
    ],
  );

  /** 空状态占位节点 */
  const emptyNode = (
    <Empty
      style={{ height: '70vh' }}
      description={<Text type="secondary">暂无用例</Text>}
    />
  );

  /** 渲染分组列表 */
  const renderGroupedCases = useMemo(() => {
    if (groupedTestCases.length === 0) return emptyNode;
    const collapseItems = groupedTestCases.map((group) => ({
      key: group.tag,
      label: (
        <div style={groupedCaseLabel}>
          <div style={groupTitle}>
            <AppstoreOutlined />
            <span>{group.tag}</span>
          </div>
          <span style={groupCount}>{group.cases.length} 个用例</span>
        </div>
      ),
      children: (
        <div style={{ padding: `${spacing.sm}px 0` }}>
          {group.cases.map(renderTestCase)}
        </div>
      ),
    }));
    return (
      <Collapse
        activeKey={activeGroupKeys}
        onChange={(keys) => setActiveGroupKeys(keys as string[])}
        items={collapseItems}
        expandIcon={({ isActive }) => (
          <div style={collapseExpandIcon(!!isActive)}>
            {isActive ? (
              <DownOutlined style={{ fontSize: 10 }} />
            ) : (
              <RightOutlined style={{ fontSize: 10 }} />
            )}
          </div>
        )}
        expandIconPlacement="start"
        style={{ background: 'transparent', border: 'none' }}
      />
    );
  }, [groupedTestCases, activeGroupKeys, renderTestCase]);

  /** 渲染平铺列表 */
  const renderUngroupedCases = useMemo(() => {
    if (testCases.length === 0) return emptyNode;
    return <div>{testCases.map(renderTestCase)}</div>;
  }, [testCases, renderTestCase]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
      }}
    >
      {/* 搜索和工具栏区域 - 固定在顶部 */}
      <CaseStepSearchForm
        projectId={parseInt(projectId!)}
        tags={tags}
        isGrouped={isGrouped}
        isAllExpanded={isAllExpanded}
        selectedCount={selectedCount}
        totalCount={testCases.length}
        requirementId={parseInt(reqId!)}
        onRefreshCallback={refresh}
        allTestCase={testCases}
        selectedCase={selectedCaseIdsArray}
        onSelectedCaseChange={(ids) => {
          if (typeof ids === 'function') {
            selectAll(ids(selectedCaseIdsArray));
          } else {
            selectAll(ids);
          }
        }}
        uploadProps={{ reqId, moduleId, projectId }}
        searchHandlers={{
          onSearch: setSearchInfo,
          onReset: () => setSearchInfo({}),
        }}
        selectionHandlers={{
          onSelectAll: handleSelectAll,
          onExpandAll: expandAll,
          onCollapseAll: collapseAll,
          onClearSelection: clearSelection,
        }}
        actionHandlers={{
          onRefresh: refresh,
          onToggleGroup: toggleGrouped,
          onAddCase: handleAddCase,
          onUploadFinish: refresh,
          onCaseSelect: handleCaseSelect,
        }}
      />

      {/* 用例列表区域 - 可滚动 */}
      <ProCard
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 4,
        }}
      >
        {loading ? (
          <Spin size="large" />
        ) : isGrouped ? (
          renderGroupedCases
        ) : (
          renderUngroupedCases
        )}
      </ProCard>

      {/* 统计栏 - 固定在底部 */}
      {caseStats.total > 0 && (
        <CaseStatsBar
          total={caseStats.total}
          passed={caseStats.passed}
          failed={caseStats.failed}
          unchecked={caseStats.unchecked}
        />
      )}
    </div>
  );
};

export default Index;
