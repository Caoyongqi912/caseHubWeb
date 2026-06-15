import { deletePlanCasePermanently } from '@/api/case/caseplan';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchDeletePermanentOptions {
  onSuccess?: () => void;
}

export interface UseBatchDeletePermanentResult {
  deleteCasesPermanently: (planId: number, caseIds: number[]) => Promise<void>;
  loading: boolean;
}

/**
 * 批量物理删除计划下的用例（不可恢复）
 *
 * 后端对应：POST /api/hub/plan/cases/delete_permanent
 * 行为：
 *  1) 解除用例与当前计划的关联
 *  2) 物理删除用例本体（test_case）和子步骤（case_sub_step）
 *
 * 错误处理：
 *  - 后端会在用例还被其他计划引用时返回 code != 0 + msg
 *    （"用例还被其他计划引用,无法彻底删除"），此时弹该 msg 给用户
 *  - 网络异常走通用 catch
 */
export const useBatchDeletePermanent = (
  options?: UseBatchDeletePermanentOptions,
): UseBatchDeletePermanentResult => {
  const [loading, setLoading] = useState(false);

  const deleteCasesPermanently = useCallback(
    async (planId: number, caseIds: number[]) => {
      if (caseIds.length === 0) return;

      setLoading(true);
      try {
        const { code, msg } = await deletePlanCasePermanently({
          plan_id: planId,
          case_ids: caseIds,
        });

        if (code === 0) {
          message.success(`已彻底删除 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
        } else {
          message.error(msg || '物理删除用例失败');
        }
      } catch {
        message.error('物理删除失败，请重试');
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { deleteCasesPermanently, loading };
};
