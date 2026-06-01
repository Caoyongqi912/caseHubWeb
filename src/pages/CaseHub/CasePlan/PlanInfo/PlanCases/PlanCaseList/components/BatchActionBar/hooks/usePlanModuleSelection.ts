import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

export interface UsePlanModuleSelectionOptions {
  /** 弹窗是否打开，用于在打开时回填当前计划 */
  open: boolean;
  /** 当前测试计划 ID，打开弹窗时默认选中 */
  currentPlanId?: string;
  /** 弹窗外部传入的关闭回调 */
  onClose: () => void;
}

export interface UsePlanModuleSelectionResult {
  selectedPlanId: number | undefined;
  selectedModuleId: number | undefined;
  submitting: boolean;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setSelectedPlanId: Dispatch<SetStateAction<number | undefined>>;
  setSelectedModuleId: Dispatch<SetStateAction<number | undefined>>;
  handlePlanChange: (planId: number | undefined) => void;
  handleModuleChange: (moduleId: number | undefined) => void;
  handleModalClose: () => void;
}

/**
 * 批量移动/复制弹窗共享的选择状态管理 hook
 * 统一管理：目标计划、目标目录、提交态、打开时回填、关闭时重置
 */
export const usePlanModuleSelection = ({
  open,
  currentPlanId,
  onClose,
}: UsePlanModuleSelectionOptions): UsePlanModuleSelectionResult => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
  const [selectedModuleId, setSelectedModuleId] = useState<
    number | undefined
  >();
  const [submitting, setSubmitting] = useState(false);

  /** 弹窗打开时默认选中当前测试计划 */
  useEffect(() => {
    if (open && currentPlanId) {
      setSelectedPlanId(Number(currentPlanId));
    }
  }, [open, currentPlanId]);

  /** 选择目标测试计划，清空目录选择 */
  const handlePlanChange = useCallback((planId: number | undefined) => {
    setSelectedPlanId(planId);
    setSelectedModuleId(undefined);
  }, []);

  /** 选择目标目录 */
  const handleModuleChange = useCallback((moduleId: number | undefined) => {
    setSelectedModuleId(moduleId);
  }, []);

  /** 关闭弹窗并重置状态 */
  const handleModalClose = useCallback(() => {
    setSelectedPlanId(undefined);
    setSelectedModuleId(undefined);
    onClose();
  }, [onClose]);

  return {
    selectedPlanId,
    selectedModuleId,
    submitting,
    setSubmitting,
    setSelectedPlanId,
    setSelectedModuleId,
    handlePlanChange,
    handleModuleChange,
    handleModalClose,
  };
};
