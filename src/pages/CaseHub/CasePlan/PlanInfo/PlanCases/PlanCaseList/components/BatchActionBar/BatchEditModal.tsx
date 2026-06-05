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
 *
 * 支持三个维度：
 *  1. 评审状态（REVIEW_STATUS 枚举）
 *  2. 一轮测试状态（first_status，与 CASE_STATUS 复用同一枚举）
 *  3. 二轮测试状态（second_status，与 CASE_STATUS 复用同一枚举）
 *
 * 历史说明：早期版本此处是单个「用例状态」字段，
 * 后端将用例执行状态拆为「一轮 / 二轮」两套独立字段后，
 * 本弹窗同步改造为两个并列的 Select，共享同一份枚举数据源。
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
   * 从 Context 动态获取枚举选项
   * 一轮 / 二轮复用同一份 CASE_STATUS 枚举（与后端约定一致）
   */
  const { options: caseOptions } = useCaseEnumConfig('CASE_STATUS');
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');

  /** 一轮 / 二轮状态共用一份 Select 选项（来自同一枚举） */
  const roundStatusOptions = useMemo(
    () => toSelectOptions(caseOptions),
    [caseOptions],
  );

  /** 评审状态选项（Radio.Group） */
  const reviewStatusRadioOptions = useMemo(
    () => toSelectOptions(reviewOptions),
    [reviewOptions],
  );

  const [isReview, setIsReview] = useState<string | undefined>(undefined);
  const [firstStatus, setFirstStatus] = useState<string | undefined>(undefined);
  const [secondStatus, setSecondStatus] = useState<string | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  /** 关闭弹窗并重置三个字段 */
  const handleModalClose = useCallback(() => {
    setIsReview(undefined);
    setFirstStatus(undefined);
    setSecondStatus(undefined);
    onCancel();
  }, [onCancel]);

  /** 提交批量修改（仅提交用户实际选择过的字段） */
  const handleSubmit = useCallback(async () => {
    if (
      isReview === undefined &&
      firstStatus === undefined &&
      secondStatus === undefined
    ) {
      return;
    }
    if (!currentPlanId) return;

    setSubmitting(true);
    try {
      // 状态字段已为 string 类型（与后端枚举 value 对齐），直接传给 API
      const { code } = await updateAssociatePlanCases({
        plan_id: Number(currentPlanId),
        case_id_list: selectedCaseIds,
        is_review: isReview,
        first_status: firstStatus,
        second_status: secondStatus,
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
    firstStatus,
    secondStatus,
    handleModalClose,
    onSuccess,
  ]);

  const hasSelection =
    isReview !== undefined ||
    firstStatus !== undefined ||
    secondStatus !== undefined;

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
      width={460}
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

        {/* —— 评审状态 —— */}
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

        {/* —— 一轮 / 二轮测试状态（并列两个 Select，共享枚举） —— */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing.md,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.xs,
                color: colors.text,
                fontSize: token.fontSize,
              }}
            >
              一轮测试状态
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="选择一轮状态"
              allowClear
              value={firstStatus}
              onChange={setFirstStatus}
              options={roundStatusOptions}
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
              二轮测试状态
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="选择二轮状态"
              allowClear
              value={secondStatus}
              onChange={setSecondStatus}
              options={roundStatusOptions}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BatchEditModal;
