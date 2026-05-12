import { ITestCase } from '@/pages/CaseHub/types';

export interface GroupedTestCases {
  tag: string;
  cases: ITestCase[];
}

export interface CaseSelectionContextValue {
  selectedCaseIds: Set<number>;
  isSelected: (caseId: number) => boolean;
  toggleCase: (caseId: number) => void;
  selectCases: (caseIds: number[]) => void;
  selectAll: (caseIds: number[]) => void;
  clearSelection: () => void;
  selectedCount: number;
}

export interface CaseUpdateContextValue {
  reqId: string | undefined;
  tags: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  updateCaseField: (
    caseId: number,
    field: keyof ITestCase,
    value: string | number | boolean,
  ) => Promise<boolean>;
  updateCaseReview: (caseId: number, isReview: boolean) => Promise<boolean>;
  refreshCases: () => void;
  onCaseDataChange: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

export interface UseCaseListResult {
  testCases: ITestCase[];
  tags: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  loading: boolean;
  reloadKey: number;
  refresh: () => void;
  updateCaseData: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

export interface UseCaseListOptions {
  reqId: string | undefined;
  searchInfo: Record<string, unknown>;
}

export interface UseCaseGroupingResult {
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

export interface UseCaseGroupingOptions {
  testCases: ITestCase[];
}
