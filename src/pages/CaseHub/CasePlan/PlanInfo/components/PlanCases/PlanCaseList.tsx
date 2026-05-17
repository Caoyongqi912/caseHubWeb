import { associatePlanCases, queryPlanCases } from '@/api/case/caseplan';
import { updateRequirementCase } from '@/api/case/testCase';
import MyDrawer from '@/components/MyDrawer';
import ChoiceCaseTable from '@/pages/CaseHub/Requirement/components/ChoiceCaseTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { ProCard } from '@ant-design/pro-components';
import { Button, Empty, message, Select, Space, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CaseFilterBar, { CaseFilterValues } from './CaseFilterBar';
import CaseItem from './CaseItem';
import PlanCaseForm from './PlanCaseForm';
import { usePlanCaseListStyles } from './styles';

interface PlanCaseListProps {
  planId?: string;
  moduleId?: number | null;
}

const DEFAULT_PAGE_SIZE = 20;

const PAGE_SIZE_OPTIONS: SelectProps['options'] = [
  { value: 10, label: '10 条/页' },
  { value: 20, label: '20 条/页' },
  { value: 50, label: '50 条/页' },
];

const Index: FC<PlanCaseListProps> = ({ planId, moduleId }) => {
  const styles = usePlanCaseListStyles();
  const { colors, spacing } = useCaseHubTheme();
  const [caseList, setCaseList] = useState<ITestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openNewCaseDrawer, setOpenNewCaseDrawer] = useState(false);
  const [openChoiceCaseDrawer, setOpenChoiceCaseDrawer] = useState(false);
  const [filters, setFilters] = useState<CaseFilterValues>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const listContainerRef = useRef<HTMLDivElement>(null);

  /** 分页查询用例数据 */
  const fetchQueryPlanCases = useCallback(
    async (page: number, pageSize: number, isLoadMore = false) => {
      if (!planId) return;
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const { code, data } = await queryPlanCases({
          plan_id: Number(planId),
          plan_module_id: moduleId ?? undefined,
          is_review: filters.isReview,
          current: page,
          pageSize,
        });
        if (code === 0) {
          const list = Array.isArray(data?.items) ? data.items : [];
          const total = data?.pageInfo?.total ?? 0;
          setCaseList((prev) =>
            isLoadMore && page > 1 ? [...prev, ...list] : list,
          );
          setPagination((prev) => ({ ...prev, current: page, total }));
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [planId, moduleId, filters],
  );

  /** 初始化加载 + planId/moduleId 变化时刷新 */
  useEffect(() => {
    fetchQueryPlanCases(1, pagination.pageSize);
  }, [planId, moduleId]);

  /** 刷新：重置到第1页重新请求 */
  const handleRefresh = useCallback(() => {
    setPagination((p) => ({ ...p, current: 1 }));
    fetchQueryPlanCases(1, pagination.pageSize);
  }, [fetchQueryPlanCases, pagination.pageSize]);

  /** 过滤条件变化时重置分页并请求 */
  const handleFilterChange = useCallback(
    (newFilters: CaseFilterValues) => {
      setFilters(newFilters);
      setPagination((p) => ({ ...p, current: 1 }));
      fetchQueryPlanCases(1, pagination.pageSize);
    },
    [fetchQueryPlanCases, pagination.pageSize],
  );

  /** 每页条数变化 */
  const handlePageSizeChange = useCallback(
    (value: number) => {
      setPagination((p) => ({ ...p, pageSize: value, current: 1 }));
      fetchQueryPlanCases(1, value);
    },
    [fetchQueryPlanCases],
  );

  /** 滚动到底部自动加载下一页 */
  const handleScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el || loading || loadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (
      scrollTop + clientHeight >= scrollHeight - 60 &&
      caseList.length < pagination.total
    ) {
      const next = pagination.current + 1;
      setPagination((p) => ({ ...p, current: next }));
      fetchQueryPlanCases(next, pagination.pageSize, true);
    }
  }, [loading, loadingMore, caseList.length, pagination, fetchQueryPlanCases]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /** 客户端过滤（搜索、排序、状态筛选） */
  const filteredCaseList = useMemo(() => {
    let result = Array.isArray(caseList) ? [...caseList] : [];
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter((c) => c.case_name.toLowerCase().includes(kw));
    }
    if (filters.caseStatus !== undefined) {
      result = result.filter((c) => c.case_status === filters.caseStatus);
    }
    if (filters.isReview !== undefined) {
      result = result.filter((c) => c.is_review === filters.isReview);
    }
    if (filters.sortBy && filters.sortBy !== 'default') {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'status':
            return (a.case_status ?? 0) - (b.case_status ?? 0);
          case 'name':
            return a.case_name.localeCompare(b.case_name);
          default:
            return 0;
        }
      });
    }
    return result;
  }, [caseList, filters]);

  /** 通用用例字段更新：查找 → 校验 → API调用 → 乐观更新 → 提示 */
  const updateCaseField = useCallback(
    async <T extends object>(
      caseId: number,
      fieldData: T,
      successMsg: string,
      errorMsg: string,
    ) => {
      const target = caseList.find((c) => c.id === caseId);
      if (!target?.requirement_id) {
        message.warning('该用例缺少需求关联，无法更新');
        return false;
      }
      try {
        const { code } = await updateRequirementCase({
          requirement_id: Number(target.requirement_id),
          case_id: caseId,
          ...fieldData,
        });
        if (code === 0) {
          setCaseList((prev) =>
            prev.map((c) => (c.id === caseId ? { ...c, ...fieldData } : c)),
          );
          message.success(successMsg);
          return true;
        }
        return false;
      } catch {
        message.error(errorMsg);
        return false;
      }
    },
    [caseList],
  );

  const handleReviewToggle = useCallback(
    async (caseId: number, isReview: boolean) =>
      updateCaseField(
        caseId,
        { is_review: isReview } as object,
        isReview ? '已标记为已评审' : '已取消评审',
        '更新评审状态失败',
      ),
    [updateCaseField],
  );

  const handleStatusChange = useCallback(
    async (caseId: number, caseStatus: number) =>
      updateCaseField(
        caseId,
        { case_status: caseStatus } as object,
        caseStatus === 1 ? '已标记为通过' : '已取消通过',
        '更新执行状态失败',
      ),
    [updateCaseField],
  );

  const handleEditCase = useCallback((_testCase: ITestCase) => {
    message.info(`编辑功能开发中`);
  }, []);

  const handleRemoveCase = useCallback(async (caseId: number) => {
    try {
      setCaseList((prev) => prev.filter((c) => c.id !== caseId));
      message.success('已移除该用例');
    } catch {
      message.error('移除用例失败');
    }
  }, []);

  const handleBatchExport = useCallback(
    () => message.info('批量导出功能开发中'),
    [],
  );
  const handleBatchImport = useCallback(
    () => message.info('批量导入功能开发中'),
    [],
  );

  /** 规划用例关联回调 */
  const handleCaseSelect = async (caseIds: number[]) => {
    const { code } = await associatePlanCases({
      plan_id: Number(planId),
      case_ids: caseIds,
      plan_module_id: Number(moduleId) ?? undefined,
    });
    if (code === 0) {
      message.success('关联成功');
      setOpenChoiceCaseDrawer(false);
      handleRefresh();
    } else {
      message.error('关联失败');
    }
  };

  const hasMoreData = caseList.length < pagination.total;

  return (
    <>
      <div style={styles.container()}>
        <ProCard
          headerBordered
          bodyStyle={{
            padding: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          style={{
            height: '100%',
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
          title={
            <Space>
              <Button type="primary" onClick={() => setOpenNewCaseDrawer(true)}>
                新增用例
              </Button>
              <Button
                type="primary"
                onClick={() => setOpenChoiceCaseDrawer(true)}
              >
                规划用例
              </Button>
            </Space>
          }
          extra={
            <Space size={spacing.sm}>
              <Select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                options={PAGE_SIZE_OPTIONS}
                style={{ width: 110 }}
                size="small"
              />
              <CaseFilterBar
                onFilterChange={handleFilterChange}
                onRefresh={handleRefresh}
                onBatchExport={handleBatchExport}
                onBatchImport={handleBatchImport}
              />
            </Space>
          }
        >
          <div
            ref={listContainerRef}
            style={styles.listContainer()}
            onScroll={handleScroll}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: spacing.xxxl,
                }}
              >
                <Spin tip="加载中..." />
              </div>
            ) : filteredCaseList.length > 0 ? (
              <>
                {filteredCaseList.map((tc) => (
                  <CaseItem
                    key={tc.id ?? tc.uid}
                    testCase={tc}
                    onReviewToggle={handleReviewToggle}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditCase}
                    onRemove={handleRemoveCase}
                  />
                ))}
                {hasMoreData && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: `${spacing.md}px 0`,
                      color: colors.textTertiary,
                      fontSize: 13,
                    }}
                  >
                    {loadingMore ? (
                      <Space>
                        <Spin size="small" />
                        <span>加载更多...</span>
                      </Space>
                    ) : (
                      <span>向下滚动加载更多</span>
                    )}
                  </div>
                )}
                {!hasMoreData && caseList.length > 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: `${spacing.md}px 0`,
                      color: colors.textTertiary,
                      fontSize: 12,
                    }}
                  >
                    已加载全部 {caseList.length} 条数据
                  </div>
                )}
              </>
            ) : (
              <div style={styles.emptyState()}>
                <Empty
                  description={
                    <span style={{ color: colors.textTertiary }}>
                      {filters.keyword ||
                      filters.caseStatus !== undefined ||
                      filters.isReview !== undefined
                        ? '没有匹配的用例'
                        : '暂无用例，请新增或规划用例'}
                    </span>
                  }
                />
              </div>
            )}
          </div>
        </ProCard>
      </div>

      <MyDrawer
        name={'添加用例'}
        open={openNewCaseDrawer}
        setOpen={setOpenNewCaseDrawer}
        width={'60%'}
      >
        <PlanCaseForm />
      </MyDrawer>
      <MyDrawer
        name={'规划用例'}
        open={openChoiceCaseDrawer}
        setOpen={setOpenChoiceCaseDrawer}
        width={'60%'}
      >
        <ChoiceCaseTable
          onCaseSelect={handleCaseSelect}
          hideAddButton={false}
        />
      </MyDrawer>
    </>
  );
};

export default Index;
