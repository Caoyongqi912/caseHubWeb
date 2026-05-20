import { associatePlanCases } from '@/api/case/caseplan';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchMoveOptions {
  onSuccess?: () => void;
}

export interface UseBatchMoveResult {
  moveCases: (
    caseIds: number[],
    targetPlanId: number,
    targetModuleId?: number,
  ) => Promise<boolean>;
  loading: boolean;
}

export const useBatchMove = (
  options?: UseBatchMoveOptions,
): UseBatchMoveResult => {
  const [loading, setLoading] = useState(false);

  const moveCases = useCallback(
    async (
      caseIds: number[],
      targetPlanId: number,
      targetModuleId?: number,
    ): Promise<boolean> => {
      if (caseIds.length === 0) return false;
      if (!targetPlanId) return false;

      setLoading(true);
      try {
        const { code } = await associatePlanCases({
          plan_id: targetPlanId,
          case_ids: caseIds,
          plan_module_id: targetModuleId,
        });

        if (code === 0) {
          message.success(`成功移动 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
          return true;
        } else {
          message.error('移动失败');
          return false;
        }
      } catch {
        message.error('移动失败，请重试');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { moveCases, loading };
};
