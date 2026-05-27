/**
 * @file PlanCaseList/hooks/useCaseFilter.ts
 * @description 用例筛选状态管理 hook
 * 管理用例列表的筛选条件，支持本地筛选
 */

import { ITestCase } from '@/pages/CaseHub/types';
import { useCallback, useMemo, useState } from 'react';

/**
 * 筛选值类型定义
 */
export interface CaseFilterValues {
  keyword?: string;
  caseStatus?: number;
  isReview?: boolean;
}

/**
 * 用例筛选管理 hook
 */
export interface UseCaseFilterResult {
  filters: CaseFilterValues;
  hasActiveFilter: boolean;
  filteredList: ITestCase[];
  handleFilterChange: (newFilters: CaseFilterValues) => void;
  clearFilters: () => void;
}

/**
 * 用例筛选管理
 * @param originalList - 原始用例列表（从接口获取的完整数据）
 * @returns 筛选相关的状态和操作方法
 *
 * @example
 * const {
 *   filters,
 *   hasActiveFilter,
 *   filteredList,
 *   handleFilterChange,
 *   clearFilters,
 * } = useCaseFilter(caseList);
 */
export const useCaseFilter = (
  originalList: ITestCase[],
): UseCaseFilterResult => {
  const [filters, setFilters] = useState<CaseFilterValues>({});

  /**
   * 根据筛选条件过滤用例列表（本地过滤）
   */
  const filteredList = useMemo(() => {
    let result = Array.isArray(originalList) ? [...originalList] : [];

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

    return result;
  }, [originalList, filters]);

  /**
   * 判断当前是否有激活的筛选条件
   * 用于控制筛选按钮的"激活"状态显示
   */
  const hasActiveFilter = useMemo(() => {
    return filters.caseStatus !== undefined || filters.isReview !== undefined;
  }, [filters]);

  /**
   * 更新筛选条件
   */
  const handleFilterChange = useCallback((newFilters: CaseFilterValues) => {
    setFilters(newFilters);
  }, []);

  /**
   * 清除所有筛选条件
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    hasActiveFilter,
    filteredList,
    handleFilterChange,
    clearFilters,
  };
};

/**
 * 根据筛选条件过滤单个用例
 * @param testCase - 用例对象
 * @param filters - 筛选条件
 * @returns 是否满足筛选条件
 */
export const filterTestCase = (
  testCase: ITestCase,
  filters: CaseFilterValues,
): boolean => {
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    if (!testCase.case_name.toLowerCase().includes(kw)) {
      return false;
    }
  }

  if (filters.caseStatus !== undefined) {
    if (testCase.case_status !== filters.caseStatus) {
      return false;
    }
  }

  if (filters.isReview !== undefined) {
    if (testCase.is_review !== filters.isReview) {
      return false;
    }
  }

  return true;
};

/**
 * 筛选条件是否为空
 */
export const isFilterEmpty = (filters: CaseFilterValues): boolean => {
  return (
    filters.keyword === undefined &&
    filters.caseStatus === undefined &&
    filters.isReview === undefined
  );
};
