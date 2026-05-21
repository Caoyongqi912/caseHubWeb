import { movePlanCases } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Modal } from 'antd';
import { FC, useCallback, useState } from 'react';
import ModuleTreeSelect from './ModuleTreeSelect';
import PlanSelect from './PlanSelect';

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
  const { colors, spacing, token } = useCaseHubTheme();
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>();
  const [selectedModuleId, setSelectedModuleId] = useState<
    number | undefined
  >();
  const [submitting, setSubmitting] = useState(false);

  // 选择目标测试计划
  const handlePlanChange = useCallback((planId: number | undefined) => {
    setSelectedPlanId(planId);
    setSelectedModuleId(undefined);
  }, []);

  // 选择目标目录
  const handleModuleChange = useCallback((moduleId: number | undefined) => {
    setSelectedModuleId(moduleId);
  }, []);

  // 关闭弹窗并重置状态
  const handleModalClose = useCallback(() => {
    setSelectedPlanId(undefined);
    setSelectedModuleId(undefined);
    onCancel();
  }, [onCancel]);

  // 提交移动
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
      <div style={{ padding: `${spacing.md}px 0` }}>
        <p
          style={{
            color: colors.textTertiary,
            marginBottom: spacing.md,
            fontSize: token.fontSizeSM,
          }}
        >
          已选择 {selectedCaseIds.length} 项用例将被移动
        </p>

        <div style={{ marginBottom: spacing.md }}>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            目标测试计划
          </label>
          <PlanSelect
            value={selectedPlanId}
            onChange={handlePlanChange}
            excludePlanId={currentPlanId ? Number(currentPlanId) : undefined}
            placeholder="搜索测试计划..."
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: token.fontSize,
            }}
          >
            目标目录
          </label>
          <ModuleTreeSelect
            planId={selectedPlanId}
            value={selectedModuleId}
            onChange={handleModuleChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchMoveModal;
