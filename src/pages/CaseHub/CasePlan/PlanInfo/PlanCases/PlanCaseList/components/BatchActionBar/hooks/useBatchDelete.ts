import { removeAssociatePlanCases } from '@/api/case/caseplan';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchDeleteOptions {
  onSuccess?: () => void;
}

export interface UseBatchDeleteResult {
  deleteCases: (planId: number, caseIds: number[]) => Promise<void>;
  loading: boolean;
}

export const useBatchDelete = (
  options?: UseBatchDeleteOptions,
): UseBatchDeleteResult => {
  const [loading, setLoading] = useState(false);

  const deleteCases = useCallback(
    async (planId: number, caseIds: number[]) => {
      if (caseIds.length === 0) return;

      setLoading(true);
      try {
        const { code } = await removeAssociatePlanCases({
          plan_id: planId,
          case_ids: caseIds,
        });

        if (code === 0) {
          message.success(`成功移除 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
        } else {
          message.error('移除用例失败');
        }
      } catch {
        message.error('移除失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { deleteCases, loading };
};
