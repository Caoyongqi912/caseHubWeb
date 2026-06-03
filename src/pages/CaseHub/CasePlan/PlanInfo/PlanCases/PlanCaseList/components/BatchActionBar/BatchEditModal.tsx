import { updateAssociatePlanCases } from '@/api/case/caseplan';
import { toSelectOptions } from '@/pages/CaseHub/hooks/caseEnumOption';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Modal, Radio, Select } from 'antd';
import { FC, useCallback, useMemo, useState } from 'react';

export interface BatchEditModalProps {
  open: boolean;
  selectedCaseIds: number[];
  currentPlanId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

/**
 * 批量修改用例弹窗
 * 支持修改用例状态和评审状态（均从后端动态枚举获取）
 */
const BatchEditModal: FC<BatchEditModalProps> = ({
  open,
  selectedCaseIds,
  currentPlanId,
  onCancel,
  onSuccess,
}) => {
  const { colors, spacing, token } = useCaseHubTheme();
  /**
   * 从 Context 动态获取用例状态 / 评审状态选项
   */
  const { options: caseOptions } = useCaseEnumConfig('CASE_STATUS');
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');

  /** 用例状态选项（Select 下拉） */
  const caseStatusOptions = useMemo(
    () => toSelectOptions(caseOptions),
    [caseOptions],
  );

  /** 评审状态选项（Radio.Group） */
  const reviewStatusRadioOptions = useMemo(
    () => toSelectOptions(reviewOptions),
    [reviewOptions],
  );

  const [isReview, setIsReview] = useState<string | undefined>(undefined);
  const [caseStatus, setCaseStatus] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  /** 修改用例状态（value 为 string 枚举值） */
  const handleStatusChange = useCallback((value: string) => {
    setCaseStatus(value);
  }, []);

  /** 关闭弹窗并重置状态 */
  const handleModalClose = useCallback(() => {
    setIsReview(undefined);
    setCaseStatus(undefined);
    onCancel();
  }, [onCancel]);

  /** 提交批量修改 */
  const handleSubmit = useCallback(async () => {
    if (isReview === undefined && caseStatus === undefined) return;
    if (!currentPlanId) return;

    setSubmitting(true);
    try {
      // 状态字段已为 string 类型（与后端枚举 value 对齐），直接传给 API
      const { code } = await updateAssociatePlanCases({
        plan_id: Number(currentPlanId),
        case_id_list: selectedCaseIds,
        is_review: isReview,
      });

      if (code === 0) {
        handleModalClose();
        onSuccess?.();
      }
    } catch {
      // 请求异常已在拦截器处理
    } finally {
      setSubmitting(false);
    }
  }, [
    currentPlanId,
    selectedCaseIds,
    isReview,
    caseStatus,
    handleModalClose,
    onSuccess,
  ]);

  const hasSelection = isReview !== undefined || caseStatus !== undefined;

  return (
    <Modal
      title="批量修改用例"
      open={open}
      onCancel={handleModalClose}
      onOk={handleSubmit}
      cancelText="取消"
      okText="确定"
      okButtonProps={{ disabled: !hasSelection || submitting }}
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
          已选择 {selectedCaseIds.length} 项用例
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
            评审状态
          </label>
          <Radio.Group
            value={isReview}
            onChange={(e) => setIsReview(e.target.value)}
          >
            {reviewStatusRadioOptions.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
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
            用例状态
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder="选择用例状态"
            allowClear
            value={caseStatus}
            onChange={handleStatusChange}
            options={caseStatusOptions}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchEditModal;
