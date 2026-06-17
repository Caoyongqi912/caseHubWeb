import { deleteBatchTestCase, updateBatchTestCase } from '@/api/case/testCase';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export interface UseBatchMoveOptions {
  onSuccess?: () => void;
}

export interface UseBatchMoveResult {
  moveCases: (
    caseIds: number[],
    projectId: number,
    moduleId: number,
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
      projectId: number,
      moduleId: number,
    ): Promise<boolean> => {
      if (caseIds.length === 0) return false;
      if (!projectId || !moduleId) return false;

      setLoading(true);
      try {
        const { code, msg } = await updateBatchTestCase({
          update_case_list: caseIds,
          project_id: projectId,
          module_id: moduleId,
        });

        if (code === 0) {
          message.success(`成功移动 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
          return true;
        } else {
          message.error(msg || '移动失败');
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

export interface UseBatchDeleteOptions {
  onSuccess?: () => void;
}

export interface UseBatchDeleteResult {
  deleteCases: (caseIds: number[]) => Promise<boolean>;
  loading: boolean;
}

export const useBatchDelete = (
  options?: UseBatchDeleteOptions,
): UseBatchDeleteResult => {
  const [loading, setLoading] = useState(false);

  const deleteCases = useCallback(
    async (caseIds: number[]): Promise<boolean> => {
      if (caseIds.length === 0) return false;

      setLoading(true);
      try {
        const { code } = await deleteBatchTestCase({
          delete_case_list: caseIds,
        });

        if (code === 0) {
          message.success(`成功删除 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
          return true;
        } else {
          message.error('部分用例删除失败');
          return false;
        }
      } catch {
        message.error('删除失败，请重试');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { deleteCases, loading };
};

export interface BatchEditValues {
  case_tag?: string;
  case_level?: string;
  case_type?: number;
  case_platform?: string;
}

export interface UseBatchEditOptions {
  onSuccess?: () => void;
}

export interface UseBatchEditResult {
  editCases: (caseIds: number[], values: BatchEditValues) => Promise<boolean>;
  loading: boolean;
}

export const useBatchEdit = (
  options?: UseBatchEditOptions,
): UseBatchEditResult => {
  const [loading, setLoading] = useState(false);

  const editCases = useCallback(
    async (caseIds: number[], values: BatchEditValues): Promise<boolean> => {
      if (caseIds.length === 0) return false;
      if (
        !values.case_tag &&
        !values.case_level &&
        !values.case_type &&
        !values.case_platform
      ) {
        message.warning('请至少选择一项要修改的内容');
        return false;
      }

      setLoading(true);
      try {
        const { code } = await updateBatchTestCase({
          update_case_list: caseIds,
          case_tag: values.case_tag,
          case_level: values.case_level,
          case_type: values.case_type,
          case_platform: values.case_platform,
        });

        if (code === 0) {
          message.success(`成功修改 ${caseIds.length} 项用例`);
          options?.onSuccess?.();
          return true;
        } else {
          message.error('部分用例修改失败');
          return false;
        }
      } catch {
        message.error('修改失败，请重试');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { editCases, loading };
};
