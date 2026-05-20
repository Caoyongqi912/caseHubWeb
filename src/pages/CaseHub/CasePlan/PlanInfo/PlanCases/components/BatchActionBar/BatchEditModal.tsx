import { updateAssociatePlanCases } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { Modal, Radio, Select } from 'antd';
import { FC, useCallback, useState } from 'react';

export interface BatchEditModalProps {
  open: boolean;
  selectedCaseIds: number[];
  currentPlanId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

// 用例状态枚举
const CASE_STATUS_OPTIONS = [
  { label: '未开始', value: 0 },
  { label: '通过', value: 1 },
  { label: '失败', value: 2 },
  { label: '阻塞', value: 3 },
  { label: '跳过', value: 4 },
];

// 评审状态选项
const REVIEW_OPTIONS = [
  { label: '待评审', value: 0 },
  { label: '已评审', value: 1 },
];

/**
 * 批量修改用例弹窗
 * 支持修改用例状态和评审状态
 */
const BatchEditModal: FC<BatchEditModalProps> = ({
  open,
  selectedCaseIds,
  currentPlanId,
  onCancel,
  onSuccess,
}) => {
  const { colors, spacing, token } = useCaseHubTheme();
  const [isReview, setIsReview] = useState<number | undefined>(undefined);
  const [caseStatus, setCaseStatus] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // 修改用例状态
  const handleStatusChange = useCallback((value: number) => {
    console.log('[BatchEdit] 用例状态变更:', {
      value,
      label: CASE_STATUS_OPTIONS.find((o) => o.value === value)?.label,
    });
    setCaseStatus(value);
  }, []);

  // 关闭弹窗并重置状态
  const handleModalClose = useCallback(() => {
    console.log('[BatchEdit] 关闭弹窗，重置状态');
    setIsReview(undefined);
    setCaseStatus(undefined);
    onCancel();
  }, [onCancel]);

  // 提交修改
  const handleSubmit = useCallback(async () => {
    // 至少选择一个要修改的字段
    if (isReview === undefined && caseStatus === undefined) {
      console.warn('[BatchEdit] 未选择任何修改字段');
      return;
    }

    if (!currentPlanId) {
      console.error('[BatchEdit] 缺少 planId');
      return;
    }

    console.log('[BatchEdit] 开始提交修改:', {
      planId: currentPlanId,
      caseIds: selectedCaseIds,
      isReview,
      caseStatus,
    });

    setSubmitting(true);
    try {
      const { code } = await updateAssociatePlanCases({
        plan_id: Number(currentPlanId),
        case_id_list: selectedCaseIds,
        is_review: isReview,
        case_status: caseStatus,
      });

      console.log('[BatchEdit] API 返回:', { code });

      if (code === 0) {
        console.log('[BatchEdit] 修改成功，关闭弹窗并触发成功回调');
        handleModalClose();
        onSuccess?.();
      } else {
        console.error('[BatchEdit] 修改失败，code:', code);
      }
    } catch (error) {
      console.error('[BatchEdit] 请求异常:', error);
    } finally {
      console.log('[BatchEdit] 结束提交，重置 submitting 状态');
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
            onChange={(e) => {
              console.log('[BatchEdit] 评审状态变更:', {
                value: e.target.value,
              });
              setIsReview(e.target.value);
            }}
          >
            {REVIEW_OPTIONS.map((option) => (
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
            options={CASE_STATUS_OPTIONS}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BatchEditModal;
