import { updateRequirementCase, updateTestCase } from '@/api/case/testCase';
import { ITestCase } from '@/pages/CaseHub/types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * 统一的CaseContext
 * 合并了CaseSelectionContext和CaseUpdateContext的功能
 * 简化Provider嵌套，提升状态管理效率
 */

interface CaseContextValue {
  // 选择相关状态和方法
  selectedCaseIds: Set<number>;
  isSelected: (caseId: number) => boolean;
  toggleCase: (caseId: number) => void;
  selectCases: (caseIds: number[]) => void;
  selectAll: (caseIds: number[]) => void;
  clearSelection: () => void;
  selectedCount: number;

  // 更新相关状态和方法
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
  updateCaseLevel: (caseId: number, case_level: string) => Promise<boolean>;
  updateCaseType: (caseId: number, case_type: number) => Promise<boolean>;
  refreshCases: () => void;
  onCaseDataChange: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

const CaseContext = createContext<CaseContextValue | null>(null);

/**
 * 使用CaseContext的Hook
 * @returns CaseContextValue
 * @throws Error 如果不在CaseProvider内使用
 */
export const useCaseContext = (): CaseContextValue => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within CaseProvider');
  }
  return context;
};

/**
 * 向后兼容的Hook
 * 保持原有API不变
 */
export const useCaseSelection = () => {
  const context = useCaseContext();
  return {
    selectedCaseIds: context.selectedCaseIds,
    isSelected: context.isSelected,
    toggleCase: context.toggleCase,
    selectCases: context.selectCases,
    selectAll: context.selectAll,
    clearSelection: context.clearSelection,
    selectedCount: context.selectedCount,
  };
};

/**
 * 向后兼容的Hook
 * 保持原有API不变
 */
export const useCaseUpdate = () => {
  const context = useCaseContext();
  return {
    reqId: context.reqId,
    tags: context.tags,
    setTags: context.setTags,
    updateCaseField: context.updateCaseField,
    updateCaseReview: context.updateCaseReview,
    updateCaseLevel: context.updateCaseLevel,
    updateCaseType: context.updateCaseType,
    refreshCases: context.refreshCases,
    onCaseDataChange: context.onCaseDataChange,
  };
};

interface CaseProviderProps {
  children: ReactNode;
  reqId: string | undefined;
  tags: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  refreshCases: () => void;
  onCaseDataChange: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

/**
 * 统一的CaseProvider
 * 提供选择和更新功能
 */
export const CaseProvider: React.FC<CaseProviderProps> = ({
  children,
  reqId,
  tags,
  setTags,
  refreshCases,
  onCaseDataChange,
}) => {
  // 选择相关状态
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );

  // 选择相关方法
  const isSelected = useCallback(
    (caseId: number) => selectedCaseIds.has(caseId),
    [selectedCaseIds],
  );

  const toggleCase = useCallback((caseId: number) => {
    setSelectedCaseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  }, []);

  const selectCases = useCallback((caseIds: number[]) => {
    setSelectedCaseIds(new Set(caseIds));
  }, []);

  const selectAll = useCallback((caseIds: number[]) => {
    setSelectedCaseIds(new Set(caseIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCaseIds(new Set());
  }, []);

  const selectedCount = selectedCaseIds.size;

  // 更新相关方法
  const updateCaseField = useCallback(
    async (
      caseId: number,
      field: keyof ITestCase,
      value: string | number | boolean,
    ): Promise<boolean> => {
      const { code } = await updateTestCase({
        id: caseId,
        [field]: value,
      } as unknown as ITestCase);

      if (code === 0) {
        onCaseDataChange(caseId, field, value);
        return true;
      }
      return false;
    },
    [onCaseDataChange],
  );

  const updateCaseLevel = useCallback(
    async (caseId: number, case_level: string): Promise<boolean> => {
      if (!reqId) return false;

      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        case_level: case_level,
      });

      if (code === 0) {
        onCaseDataChange(caseId, 'case_level', case_level);
        return true;
      }
      return false;
    },
    [reqId, onCaseDataChange],
  );

  const updateCaseType = useCallback(
    async (caseId: number, case_type: number): Promise<boolean> => {
      if (!reqId) return false;

      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        case_type: case_type,
      });

      if (code === 0) {
        onCaseDataChange(caseId, 'case_type', case_type);
        return true;
      }
      return false;
    },
    [reqId, onCaseDataChange],
  );

  const updateCaseReview = useCallback(
    async (caseId: number, isReview: boolean): Promise<boolean> => {
      if (!reqId) return false;

      const { code } = await updateRequirementCase({
        requirement_id: parseInt(reqId),
        case_id: caseId,
        is_review: isReview,
      });

      if (code === 0) {
        onCaseDataChange(caseId, 'is_review', isReview);
        return true;
      }
      return false;
    },
    [reqId, onCaseDataChange],
  );

  const value = useMemo(
    () => ({
      // 选择相关
      selectedCaseIds,
      isSelected,
      toggleCase,
      selectCases,
      selectAll,
      clearSelection,
      selectedCount,
      // 更新相关
      reqId,
      tags,
      setTags,
      updateCaseField,
      updateCaseReview,
      updateCaseLevel,
      updateCaseType,
      refreshCases,
      onCaseDataChange,
    }),
    [
      selectedCaseIds,
      isSelected,
      toggleCase,
      selectCases,
      selectAll,
      clearSelection,
      selectedCount,
      reqId,
      tags,
      setTags,
      updateCaseField,
      updateCaseReview,
      updateCaseLevel,
      updateCaseType,
      refreshCases,
      onCaseDataChange,
    ],
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
};

export default CaseContext;
