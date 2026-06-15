import { removeAssociatePlanCases } from '@/api/case/caseplan';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchUnlinkOptions {
  onSuccess?: () => void;
}

export interface UseBatchUnlinkResult {
  unlinkCases: (planId: number, caseIds: number[]) => Promise<void>;
  loading: boolean;
}

/**
 * 批量解除用例与计划的关联（不删除用例本体）
 *
 * 与 useBatchDeletePermanent 的区别：
 * - 本钩子：只删除 plan_case_association 关联记录，用例本身（test_case / case_sub_step）保留
 * - useBatchDeletePermanent：先解关联，再物理删除用例本体及子步骤，不可恢复
 */
export const useBatchUnlink = (
  options?: UseBatchUnlinkOptions,
): UseBatchUnlinkResult => {
  const [loading, setLoading] = useState(false);

  const unlinkCases = useCallback(
    async (planId: number, caseIds: number[]) => {
      if (caseIds.length === 0) return;

      setLoading(true);
      try {
        const { code } = await removeAssociatePlanCases({
          plan_id: planId,
          case_ids: caseIds,
        });

        if (code === 0) {
          message.success(`成功解除 ${caseIds.length} 项用例的关联`);
          options?.onSuccess?.();
        } else {
          message.error('解除关联失败');
        }
      } catch {
        message.error('解除关联失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { unlinkCases, loading };
};
