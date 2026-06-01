import { movePlanCases } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Modal } from 'antd';
import { FC, useCallback } from 'react';
import { usePlanModuleSelection } from './hooks/usePlanModuleSelection';
import PlanModuleSelectForm from './PlanModuleSelectForm';

export interface BatchMoveModalProps {
  open: boolean;
  selectedCaseIds: number[];
  currentPlanId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

/**
 * 批量移动用例弹窗
 * 支持选择目标测试计划和目录
 */
const BatchMoveModal: FC<BatchMoveModalProps> = ({
  open,
  selectedCaseIds,
  currentPlanId,
  onCancel,
  onSuccess,
}) => {
  const { colors, token } = useCaseHubTheme();
  const {
    selectedPlanId,
    selectedModuleId,
    submitting,
    setSubmitting,
    handlePlanChange,
    handleModuleChange,
    handleModalClose,
  } = usePlanModuleSelection({ open, currentPlanId, onClose: onCancel });

  /** 提交移动请求 */
  const handleSubmit = useCallback(async () => {
    if (!selectedPlanId) return;

    setSubmitting(true);
    try {
      const { code } = await movePlanCases({
        plan_id: selectedPlanId,
        case_id_list: selectedCaseIds,
        plan_case_module_id: selectedModuleId,
      });

      if (code === 0) {
        handleModalClose();
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedPlanId,
    selectedCaseIds,
    selectedModuleId,
    handleModalClose,
    onSuccess,
    setSubmitting,
  ]);

  return (
    <Modal
      title="批量移动用例"
      open={open}
      onCancel={handleModalClose}
      onOk={handleSubmit}
      cancelText="取消"
      okText="确定"
      okButtonProps={{ disabled: !selectedPlanId || submitting }}
      confirmLoading={submitting}
    >
      <div style={{ padding: '16px 0' }}>
        <p
          style={{
            color: colors.textTertiary,
            marginBottom: 16,
            fontSize: token.fontSizeSM,
          }}
        >
          已选择 {selectedCaseIds.length} 项用例将被移动
        </p>

        <PlanModuleSelectForm
          planId={selectedPlanId}
          moduleId={selectedModuleId}
          onPlanChange={handlePlanChange}
          onModuleChange={handleModuleChange}
        />
      </div>
    </Modal>
  );
};

export default BatchMoveModal;
