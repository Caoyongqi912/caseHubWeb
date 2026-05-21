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
      console.log('[useBatchDelete] 开始删除', { planId, caseIds });

      if (caseIds.length === 0) {
        console.warn('[useBatchDelete] 用例列表为空，直接返回');
        return;
      }

      console.log('[useBatchDelete] 设置 loading = true');
      setLoading(true);
      try {
        console.log('[useBatchDelete] 调用 removeAssociatePlanCases API');
        const { code } = await removeAssociatePlanCases({
          plan_id: planId,
          case_ids: caseIds,
        });

        console.log('[useBatchDelete] API 返回', { code });

        if (code === 0) {
          console.log('[useBatchDelete] 删除成功，准备触发成功回调');
          message.success(`成功移除 ${caseIds.length} 项用例`);
          console.log('[useBatchDelete] 调用 options.onSuccess');
          options?.onSuccess?.();
          console.log('[useBatchDelete] onSuccess 执行完成');
        } else {
          console.error('[useBatchDelete] 删除失败，code:', code);
          message.error('移除用例失败');
        }
      } catch (error) {
        console.error('[useBatchDelete] 请求异常:', error);
        message.error('移除失败，请重试');
      } finally {
        console.log('[useBatchDelete] 设置 loading = false');
        setLoading(false);
        console.log('[useBatchDelete] deleteCases 执行完毕');
      }
    },
    [options],
  );

  return { deleteCases, loading };
};
