import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface CaseSelectionContextValue {
  selectedCaseIds: Set<number>;
  isSelected: (caseId: number) => boolean;
  toggleCase: (caseId: number) => void;
  selectCases: (caseIds: number[]) => void;
  selectAll: (caseIds: number[]) => void;
  clearSelection: () => void;
  selectedCount: number;
}

const CaseSelectionContext = createContext<CaseSelectionContextValue | null>(
  null,
);

export const useCaseSelection = (): CaseSelectionContextValue => {
  const context = useContext(CaseSelectionContext);
  if (!context) {
    throw new Error(
      'useCaseSelection must be used within CaseSelectionProvider',
    );
  }
  return context;
};

interface CaseSelectionProviderProps {
  children: ReactNode;
}

export const CaseSelectionProvider: React.FC<CaseSelectionProviderProps> = ({
  children,
}) => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<number>>(
    new Set(),
  );

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

  const value = useMemo(
    () => ({
      selectedCaseIds,
      isSelected,
      toggleCase,
      selectCases,
      selectAll,
      clearSelection,
      selectedCount,
    }),
    [
      selectedCaseIds,
      isSelected,
      toggleCase,
      selectCases,
      selectAll,
      clearSelection,
      selectedCount,
    ],
  );

  return (
    <CaseSelectionContext.Provider value={value}>
      {children}
    </CaseSelectionContext.Provider>
  );
};

export default CaseSelectionContext;
