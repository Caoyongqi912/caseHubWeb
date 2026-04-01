import { updateRequirementCase, updateTestCase } from '@/api/case/testCase';
import { ITestCase } from '@/pages/CaseHub/types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

interface CaseUpdateContextValue {
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

const CaseUpdateContext = createContext<CaseUpdateContextValue | null>(null);

export const useCaseUpdate = (): CaseUpdateContextValue => {
  const context = useContext(CaseUpdateContext);
  if (!context) {
    throw new Error('useCaseUpdate must be used within CaseUpdateProvider');
  }
  return context;
};

interface CaseUpdateProviderProps {
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

export const CaseUpdateProvider: React.FC<CaseUpdateProviderProps> = ({
  children,
  reqId,
  tags,
  setTags,
  refreshCases,
  onCaseDataChange,
}) => {
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

  /** 切换用例类型 */
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
  /** 切换用例类型 */
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

  /** 切换审核状态 */
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
      reqId,
      tags,
      setTags,
      updateCaseField,
      updateCaseReview,
      refreshCases,
      onCaseDataChange,
      updateCaseLevel,
      updateCaseType,
    }),
    [
      reqId,
      tags,
      setTags,
      updateCaseField,
      updateCaseReview,
      refreshCases,
      onCaseDataChange,
      updateCaseLevel,
      updateCaseType,
    ],
  );

  return (
    <CaseUpdateContext.Provider value={value}>
      {children}
    </CaseUpdateContext.Provider>
  );
};

export default CaseUpdateContext;
