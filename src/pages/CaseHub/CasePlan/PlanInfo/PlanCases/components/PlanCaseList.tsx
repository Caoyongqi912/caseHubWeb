import { associatePlanCases, queryPlanCases } from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import ChoiceCaseTable from '@/pages/CaseHub/Requirement/components/ChoiceCaseTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ITestCase } from '@/pages/CaseHub/types';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Checkbox, Empty, message, Space, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { usePlanCaseListStyles } from '../styles';
import BatchActionBar from './BatchActionBar';
import CaseFilterBar, { CaseFilterValues } from './CaseFilterBar';
import CaseItem from './CaseItem';

interface PlanCaseListProps {
  planId?: string;
  moduleId?: number | null;
  onModulesRefresh?: () => void;
}

const Index: FC<PlanCaseListProps> = ({
  planId,
  moduleId,
  onModulesRefresh,
}) => {
  const styles = usePlanCaseListStyles();
  const { colors, spacing } = useCaseHubTheme();
  const [caseList, setCaseList] = useState<ITestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [openChoiceCaseDrawer, setOpenChoiceCaseDrawer] = useState(false);
  const [filters, setFilters] = useState<CaseFilterValues>({});
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );
  const fetchQueryPlanCases = useCallback(async () => {
    if (!planId) return;
    setLoading(true);

    try {
      const { code, data } = await queryPlanCases({
        plan_id: Number(planId),
        plan_module_id: moduleId ?? undefined,
        is_review: filters.isReview,
      });
      if (code === 0) {
        setSelectedCaseIds(new Set());
        const list = Array.isArray(data) ? data : [];
        setCaseList(list);
      }
    } finally {
      setLoading(false);
    }
  }, [planId, moduleId, filters]);

  useEffect(() => {
    setCaseList([]);
    fetchQueryPlanCases();
  }, [planId, moduleId]);

  const handleRefresh = useCallback(() => {
    fetchQueryPlanCases();
  }, [fetchQueryPlanCases]);

  const handleFilterChange = useCallback((newFilters: CaseFilterValues) => {
    setFilters(newFilters);
  }, []);

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

  const handleBatchExport = useCallback(
    () => message.info('批量导出功能开发中'),
    [],
  );
  const handleBatchImport = useCallback(
    () => message.info('批量导入功能开发中'),
    [],
  );

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

  const isAllSelected = useMemo(() => {
    if (filteredCaseList.length === 0) return false;
    const selectableItems = filteredCaseList.filter(
      (tc) => tc.id !== undefined,
    );
    if (selectableItems.length === 0) return false;
    if (selectedCaseIds.size === 0) return false;
    return selectableItems.every((tc) => selectedCaseIds.has(tc.id as number));
  }, [filteredCaseList, selectedCaseIds]);

  const isIndeterminate = useMemo(() => {
    if (filteredCaseList.length === 0) return false;
    const selectableItems = filteredCaseList.filter(
      (tc) => tc.id !== undefined,
    );
    if (selectableItems.length === 0) return false;
    const selectedCount = selectableItems.filter((tc) =>
      selectedCaseIds.has(tc.id as number),
    ).length;
    return selectedCount > 0 && selectedCount < selectableItems.length;
  }, [filteredCaseList, selectedCaseIds]);

  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        const allIds = filteredCaseList
          .map((tc) => tc.id)
          .filter((id): id is number => id !== undefined);
        setSelectedCaseIds(new Set(allIds));
      } else {
        setSelectedCaseIds(new Set());
      }
    },
    [filteredCaseList],
  );

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

  // 批量移动成功
  const handleBatchMoveSuccess = useCallback(() => {
    setSelectedCaseIds(new Set());
    handleRefresh();
    onModulesRefresh?.();
  }, [handleRefresh, onModulesRefresh]);

  const handleExitSelection = useCallback(() => {
    setSelectedCaseIds(new Set());
  }, []);

  const CardTitle = () => (
    <Space size="middle">
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={handleSelectAll}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => message.info('新增用例功能开发中')}
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
  );

  const CardExtra = () => (
    <CaseFilterBar
      onFilterChange={handleFilterChange}
      onRefresh={handleRefresh}
      onBatchExport={handleBatchExport}
      onBatchImport={handleBatchImport}
    />
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
          title={<CardTitle />}
          headerBordered
          bordered
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          bodyStyle={{
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          }}
          extra={<CardExtra />}
        >
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              minHeight: 0,
              position: 'relative',
              paddingBottom: selectedCaseIds.size > 0 ? '68px' : '0',
            }}
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
                    selected={tc.id !== undefined && selectedCaseIds.has(tc.id)}
                    onSelectedChange={handleCaseSelectedChange}
                  />
                ))}
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
        name={'规划用例'}
        open={openChoiceCaseDrawer}
        setOpen={setOpenChoiceCaseDrawer}
        width={'60%'}
      >
        <ChoiceCaseTable
          onCaseSelect={handleAssociateCases}
          hideAddButton={false}
        />
      </MyDrawer>

      {selectedCaseIds.size > 0 && (
        <BatchActionBar
          selectedCount={selectedCaseIds.size}
          selectedCaseIds={selectedCaseIdsArray}
          planId={planId}
          onBatchSuccess={handleBatchMoveSuccess}
          onExit={handleExitSelection}
        />
      )}
    </>
  );
};

export default Index;
