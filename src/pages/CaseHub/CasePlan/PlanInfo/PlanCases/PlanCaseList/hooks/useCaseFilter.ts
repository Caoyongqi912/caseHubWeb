/**
 * @file PlanCaseList/hooks/useCaseFilter.ts
 * @description 用例筛选状态管理 hook
 * 管理用例列表的筛选条件，支持本地筛选
 */

import { ITestCase } from '@/pages/CaseHub/types';
import { useCallback, useMemo, useState } from 'react';

/**
 * 创建人筛选条目
 * - id: 用户 ID，对应 ITestCase.creatorId，用于精确匹配
 * - name: 用户名，对应 ITestCase.creatorName，用于 Chip 展示
 */
export interface CreatorFilterItem {
  id: number;
  name: string;
}

/**
 * 筛选值类型定义
 * 状态字段均为 string 类型（与后端枚举 value 对齐）
 * - firstStatus: 一轮执行状态
 * - secondStatus: 二轮执行状态（取值同 firstStatus）
 * - isReview: 评审状态
 * - creators: 创建人多选，命中用例的 creatorId 字段（精确 ID 匹配）
 *   存 id + name 是为了 Chip 展示无需回查用户名
 */
export interface CaseFilterValues {
  keyword?: string;
  firstStatus?: string;
  secondStatus?: string;
  isReview?: string;
  /** 适用端 (PLATFORM 枚举值, 与 case_platform 字段对齐) */
  casePlatform?: string;
  creators?: CreatorFilterItem[];
}

/**
 * 用例筛选管理 hook
 */
export interface UseCaseFilterResult {
  filters: CaseFilterValues;
  hasActiveFilter: boolean;
  filteredList: ITestCase[];
  handleFilterChange: (newFilters: CaseFilterValues) => void;
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

    if (filters.firstStatus !== undefined) {
      // ITestCase.first_status 已为 string 类型，直接比较无需转换
      result = result.filter((c) => c.first_status === filters.firstStatus);
    }

    if (filters.secondStatus !== undefined) {
      result = result.filter((c) => c.second_status === filters.secondStatus);
    }

    if (filters.creators && filters.creators.length > 0) {
      // 使用 Set 提升 O(1) 查找性能（filter 内被调用次数等于用例数 × 选中人数）
      const creatorIds = new Set(filters.creators.map((c) => c.id));
      result = result.filter((c) => creatorIds.has(c.creatorId));
    }

    if (filters.isReview !== undefined) {
      result = result.filter((c) => c.is_review === filters.isReview);
    }

    if (filters.casePlatform !== undefined) {
      result = result.filter((c) => c.case_platform === filters.casePlatform);
    }

    return result;
  }, [originalList, filters]);

  /**
   * 判断当前是否有激活的筛选条件
   * 用于控制筛选按钮的"激活"状态显示
   * keyword 非空时也算激活
   */
  const hasActiveFilter = useMemo(() => {
    return (
      !!filters.keyword ||
      filters.firstStatus !== undefined ||
      filters.secondStatus !== undefined ||
      filters.isReview !== undefined ||
      filters.casePlatform !== undefined ||
      (filters.creators !== undefined && filters.creators.length > 0)
    );
  }, [filters]);

  /**
   * 更新筛选条件
   */
  const handleFilterChange = useCallback((newFilters: CaseFilterValues) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    hasActiveFilter,
    filteredList,
    handleFilterChange,
  };
};
