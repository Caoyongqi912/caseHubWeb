import { copyPlanCases } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Modal, Select } from 'antd';
import { FC, useCallback, useState } from 'react';
import { CASE_STATUS_OPTIONS_FOR_COPY } from '../constants/caseStatus';
import { usePlanModuleSelection } from './hooks/usePlanModuleSelection';
import PlanModuleSelectForm from './PlanModuleSelectForm';

export interface BatchCopyModalProps {
  open: boolean;
  selectedCaseIds: number[];
  currentPlanId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

/**
 * 批量复制用例弹窗
 * 支持选择目标测试计划、目录及用例状态
 */
const BatchCopyModal: FC<BatchCopyModalProps> = ({
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
    setSelectedPlanId,
    setSelectedModuleId,
    handlePlanChange,
    handleModuleChange,
  } = usePlanModuleSelection({ open, currentPlanId, onClose: onCancel });

  const [isReview, setIsReview] = useState<number>(0);

  /** 关闭弹窗并重置状态 */
  const handleModalClose = useCallback(() => {
    setIsReview(0);
    setSelectedPlanId(undefined);
    setSelectedModuleId(undefined);
    onCancel();
  }, [onCancel, setSelectedPlanId, setSelectedModuleId]);

  /** 提交复制请求 */
  const handleSubmit = useCallback(async () => {
    if (!selectedPlanId) return;

    setSubmitting(true);
    try {
      const { code } = await copyPlanCases({
        plan_id: selectedPlanId,
        case_id_list: selectedCaseIds,
        plan_case_module_id: selectedModuleId,
        is_review: isReview,
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
    isReview,
    handleModalClose,
    onSuccess,
    setSubmitting,
  ]);

  return (
    <Modal
      title="批量复制用例"
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
          已选择 {selectedCaseIds.length} 项用例将被复制
        </p>

        <PlanModuleSelectForm
          planId={selectedPlanId}
          moduleId={selectedModuleId}
          onPlanChange={handlePlanChange}
          onModuleChange={handleModuleChange}
        />

        <div style={{ marginTop: 16 }}>
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            用例状态
          </label>
          <Select
            style={{ width: '100%' }}
            value={isReview}
            onChange={setIsReview}
            options={CASE_STATUS_OPTIONS_FOR_COPY}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchCopyModal;
