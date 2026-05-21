import { copyTestCase } from '@/api/case/testCase';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchCopyOptions {
  onSuccess?: () => void;
}

export interface UseBatchCopyResult {
  copyCases: (caseIds: number[]) => Promise<void>;
  loading: boolean;
}

export const useBatchCopy = (
  options?: UseBatchCopyOptions,
): UseBatchCopyResult => {
  const [loading, setLoading] = useState(false);

  const copyCases = useCallback(
    async (caseIds: number[]) => {
      if (caseIds.length === 0) return;

      setLoading(true);
      try {
        const copyPromises = caseIds.map((caseId) => copyTestCase({ caseId }));
        const results = await Promise.all(copyPromises);
        const allSuccess = results.every((res) => res.code === 0);

        if (allSuccess) {
          message.success(`成功复制 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
        } else {
          message.error('部分用例复制失败');
        }
      } catch {
        message.error('复制失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { copyCases, loading };
};
