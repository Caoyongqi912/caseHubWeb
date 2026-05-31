import {
  associatePlanCases,
  insertPlanCases,
  queryPlanCases,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import ChoiceCaseTable from '@/pages/CaseHub/Requirement/components/ChoiceCaseTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan, ITestCase } from '@/pages/CaseHub/types';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Checkbox, Empty, message, Space, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { usePlanCaseListStyles } from '../styles';
import BatchActionBar from './components/BatchActionBar';
import CaseFilterBar from './components/CaseFilterBar';
import CaseItem from './components/CaseItem';
import NewCaseForm from './components/NewCaseForm';
import PlanCaseImportModal from './components/PlanCaseImportModal';
import { useCaseFilter } from './hooks/useCaseFilter';
import { calculateSelectionState } from './hooks/useCaseSelection';

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

  /** 展开/收起指令版本号，通过 revision 变化通知所有 CaseItem */
  const [collapseRevision, setCollapseRevision] = useState(0);
  const [collapseAction, setCollapseAction] = useState<'expand' | 'collapse'>(
    'expand',
  );

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
        setCaseList(Array.from(uniqueMap.values()));
      }
    } finally {
      setLoading(false);
    }
  }, [planId, moduleId, filters]);

  /**
   * 当 planId 或 moduleId 变化时，重新加载数据
   * 注意：filters 变化不会触发重新加载，保持筛选状态
   */
  useEffect(() => {
    setCaseList([]);
    fetchPlanData();
  }, [planId, moduleId]);

  /**
   * 刷新列表
   */
  const handleRefresh = useCallback(() => {
    fetchPlanData();
  }, [fetchPlanData]);

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
   */
  const handleReviewChange = useCallback(
    (caseId: number, isReview: boolean) => {
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
   * 单个用例状态切换
   * 更新本地状态，避免不必要的全量刷新
   */
  const handleStatusChange = useCallback(
    (caseId: number, status: number) => {
      setCaseList((prev) =>
        prev.map((tc) =>
          tc.id === caseId ? { ...tc, case_status: status } : tc,
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

  /** 全部展开 */
  const handleExpandAll = useCallback(() => {
    setCollapseAction('expand');
    setCollapseRevision((prev) => prev + 1);
  }, []);

  /** 全部收起 */
  const handleCollapseAll = useCallback(() => {
    setCollapseAction('collapse');
    setCollapseRevision((prev) => prev + 1);
  }, []);

  /**
   * 添加用例到计划
   */
  const OnCaseSave = async (values: any) => {
    const newValue = {
      ...values,
      plan_id: Number(planId),
      plan_module_id: moduleId ?? undefined,
      project_id: planInfo?.project_id ?? undefined,
    };
    const { code, msg } = await insertPlanCases(newValue as ITestCase);

    if (code === 0) {
      handleRefresh();
      setDrawerVisible(false);
    } else {
      message.error(msg || '保存失败');
    }
  };

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
              padding: '12px',
            },
          }}
          extra={
            <CaseFilterBar
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onBatchExport={handleBatchExport}
              onBatchImport={handleBatchImport}
              hasActiveFilter={hasActiveFilter}
              filters={filters}
              resultCount={filteredList.length}
            />
          }
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
            ) : filteredList.length > 0 ? (
              filteredList.map((tc, index) => (
                <CaseItem
                  key={`${tc.id ?? tc.uid ?? 'item'}-${index}`}
                  testCase={tc}
                  planId={planId}
                  moduleId={moduleId}
                  selected={tc.id !== undefined && selectedCaseIds.has(tc.id)}
                  collapseCommand={{
                    action: collapseAction,
                    revision: collapseRevision,
                  }}
                  onSelectedChange={handleCaseSelectedChange}
                  onReviewChange={handleReviewChange}
                  onStatusChange={handleStatusChange}
                  onRefresh={handleRefresh}
                />
              ))
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
        />
      )}

      <PlanCaseImportModal
        open={importModalVisible}
        onOpenChange={setImportModalVisible}
        planId={planId || ''}
        planModules={planModules}
        onUploadFinish={handleRefresh}
      />
    </>
  );
};

export default Index;
