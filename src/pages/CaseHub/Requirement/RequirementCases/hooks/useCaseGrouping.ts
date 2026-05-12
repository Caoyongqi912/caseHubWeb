import { ITestCase } from '@/pages/CaseHub/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface GroupedTestCases {
  tag: string;
  cases: ITestCase[];
}

interface UseCaseGroupingResult {
  groupedTestCases: GroupedTestCases[];
  isGrouped: boolean;
  activeGroupKeys: string[];
  isAllExpanded: boolean;
  isInitialized: boolean;
  toggleGrouped: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  setActiveGroupKeys: (keys: string[]) => void;
  resetGrouping: () => void;
}

interface UseCaseGroupingOptions {
  testCases: ITestCase[];
}

export const useCaseGrouping = (
  options: UseCaseGroupingOptions,
): UseCaseGroupingResult => {
  const { testCases } = options;

  const [isGrouped, setIsGrouped] = useState(true);
  const [activeGroupKeys, setActiveGroupKeys] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const groupedTestCases = useMemo((): GroupedTestCases[] => {
    if (testCases.length === 0) return [];

    const groups = new Map<string, ITestCase[]>();
    const untaggedCases: ITestCase[] = [];

    testCases.forEach((tc) => {
      const tag = tc.case_tag || '';
      if (tag) {
        if (!groups.has(tag)) {
          groups.set(tag, []);
        }
        groups.get(tag)!.push(tc);
      } else {
        untaggedCases.push(tc);
      }
    });

    const result: GroupedTestCases[] = Array.from(groups.entries()).map(
      ([tag, cases]) => ({
        tag,
        cases,
      }),
    );

    if (untaggedCases.length > 0) {
      result.push({ tag: '未分组', cases: untaggedCases });
    }

    return result;
  }, [testCases]);

  const isAllExpanded = useMemo(
    () =>
      activeGroupKeys.length === groupedTestCases.length &&
      groupedTestCases.length > 0,
    [activeGroupKeys.length, groupedTestCases.length],
  );

  useEffect(() => {
    if (isGrouped && groupedTestCases.length > 0 && !isInitialized) {
      setActiveGroupKeys(groupedTestCases.map((g) => g.tag));
      setIsInitialized(true);
    }
  }, [isGrouped, groupedTestCases, isInitialized]);

  const toggleGrouped = useCallback(() => {
    setIsGrouped((prev) => !prev);
  }, []);

  const expandAll = useCallback(() => {
    setActiveGroupKeys(groupedTestCases.map((g) => g.tag));
  }, [groupedTestCases]);

  const collapseAll = useCallback(() => {
    setActiveGroupKeys([]);
  }, []);

  const resetGrouping = useCallback(() => {
    setIsInitialized(false);
    setActiveGroupKeys([]);
  }, []);

  return {
    groupedTestCases,
    isGrouped,
    activeGroupKeys,
    isAllExpanded,
    isInitialized,
    toggleGrouped,
    expandAll,
    collapseAll,
    setActiveGroupKeys,
    resetGrouping,
  };
};

export default useCaseGrouping;
