/**
 * @file PlanCaseList/hooks/useCaseSelection.ts
 * @description 用例选中状态管理 hook
 * 管理用例列表的多选、全选、半选状态
 */

import { ITestCase } from '@/pages/CaseHub/types';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useCallback, useState } from 'react';

/**
 * 用例选中状态管理 hook
 */
export interface UseCaseSelectionResult {
  selectedCaseIds: Set<number>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedCount: number;
  handleSelectAll: (
    e: CheckboxChangeEvent,
    selectableItems: ITestCase[],
  ) => void;
  handleSelectOne: (id: number | undefined, selected: boolean) => void;
  clearSelection: () => void;
  isSelected: (id: number) => boolean;
}

/**
 * 用例选中状态管理
 * @returns 选中状态相关的状态和操作方法
 *
 * @example
 * const {
 *   selectedCaseIds,
 *   isAllSelected,
 *   isIndeterminate,
 *   handleSelectAll,
 *   handleSelectOne,
 *   clearSelection,
 * } = useCaseSelection();
 */
export const useCaseSelection = (): UseCaseSelectionResult => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );

  /**
   * 计算是否全选（基于当前筛选后的列表）
   */
  const isAllSelected = useCallback(
    (selectableItems: ITestCase[]) => {
      if (selectableItems.length === 0) return false;
      if (selectedCaseIds.size === 0) return false;
      return selectableItems.every((tc) => {
        if (tc.id === undefined) return false;
        return selectedCaseIds.has(tc.id);
      });
    },
    [selectedCaseIds],
  );

  /**
   * 计算是否半选
   */
  const isIndeterminate = useCallback(
    (selectableItems: ITestCase[]) => {
      if (selectableItems.length === 0) return false;
      const selectedCount = selectableItems.filter((tc) => {
        if (tc.id === undefined) return false;
        return selectedCaseIds.has(tc.id);
      }).length;
      return selectedCount > 0 && selectedCount < selectableItems.length;
    },
    [selectedCaseIds],
  );

  /**
   * 全选 / 取消全选
   */
  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent, selectableItems: ITestCase[]) => {
      if (e.target.checked) {
        const allIds = selectableItems
          .map((tc) => tc.id)
          .filter((id): id is number => id !== undefined);
        setSelectedCaseIds(new Set(allIds));
      } else {
        setSelectedCaseIds(new Set());
      }
    },
    [],
  );

  /**
   * 单个用例选中状态变化
   */
  const handleSelectOne = useCallback(
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
   * 清除所有选中
   */
  const clearSelection = useCallback(() => {
    setSelectedCaseIds(new Set());
  }, []);

  /**
   * 检查指定 ID 是否被选中
   */
  const isSelected = useCallback(
    (id: number) => selectedCaseIds.has(id),
    [selectedCaseIds],
  );

  return {
    selectedCaseIds,
    isAllSelected: false,
    isIndeterminate: false,
    selectedCount: selectedCaseIds.size,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
    isSelected,
  };
};

/**
 * 基于列表数据计算选中状态
 * 用于在已知列表数据时计算 isAllSelected 和 isIndeterminate
 */
export const calculateSelectionState = (
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
