import { IObjGet, IPage, IResponse } from '@/api';
import { CaseSubStep, ICaseDynamic, ITestCase } from '@/pages/CaseHub/types';
import { request } from '@@/plugin-request';

/**
 * queryCasesByRequirement
 * @param searchInfo
 * @param options
 */
export const queryCasesByRequirement = async (
  searchInfo: IObjGet,
  options?: IObjGet,
) => {
  return request<IResponse<ITestCase[]>>('/api/hub/cases/queryByField', {
    method: 'GET',
    params: searchInfo,
    ...(options || {}),
  });
};

/**
 * queryTagsByRequirement
 * @param searchInfo
 * @param options
 */
export const queryTagsByRequirement = async (
  searchInfo: { requirement_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<string[]>>('/api/hub/cases/queryTagsByReqId', {
    method: 'GET',
    params: searchInfo,
    ...(options || {}),
  });
};
/**
 * saveCase
 * @param caseInfo
 * @param options
 */
export const saveTestCase = async (caseInfo: ITestCase, options?: IObjGet) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/insert', {
    method: 'POST',
    data: caseInfo,
    ...(options || {}),
  });
};

/**
 * getTestCaseInfo
 * @param case_id
 * @param options
 */
export const getTestCaseInfo = async (case_id: number, options?: IObjGet) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/info', {
    method: 'GET',
    params: { case_id: case_id },
    ...(options || {}),
  });
};

/**
 * addDefault
 * @param caseInfo
 * @param options
 */
export const addDefaultTestCase = async (
  caseInfo: {
    requirement_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/addDefault', {
    method: 'POST',
    data: caseInfo,
    ...(options || {}),
  });
};

/**
 * saveCase
 * @param caseInfo
 * @param options
 */
export const updateTestCase = async (
  caseInfo: ITestCase,
  options?: IObjGet,
) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/update', {
    method: 'POST',
    data: caseInfo,
    ...(options || {}),
  });
};

/**
 * updateBatchCase
 * @param data
 * @param options
 */
export const updateBatchTestCase = async (
  data: {
    update_case_list: number[];
    project_id?: number;
    module_id?: number;
    case_level?: string;
    case_type?: number;
    case_tag?: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/batchUpdate', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * deleteBatchCase
 * @param data
 * @param options
 */
export const deleteBatchTestCase = async (
  data: {
    delete_case_list: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<number>>('/api/hub/cases/batchDelete', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * updateRequirementCase
 * @param {
    requirement_id: number;
    case_id: number;
    is_review?:number;
    case_status?:number
  }
 * @param options
 */
export const updateRequirementCase = async (
  caseInfo: {
    requirement_id: number;
    case_id: number;
    is_review?: number;
    case_status?: number;
    case_type?: number;
    case_level?: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/hub/req/updateRequirementCase', {
    method: 'POST',
    data: caseInfo,
    ...(options || {}),
  });
};

/**
 * 上传预览用例（Step 1）
 * POST /hub/cases/upload
 * @param file - Excel 文件
 */
export const uploadPreviewCase = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return request<{
    file_md5: string;
    total_count: number;
    valid_count: number;
    invalid_count: number;
    errors: Array<{
      row: number;
      errors: Array<{ field: string; message: string }>;
    }>;
  }>('/api/hub/cases/upload', {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 保留原 uploadTestCase 作为别名（向后兼容）
 * @deprecated 请使用 uploadPreviewCase
 */
export const uploadTestCase = async (data: FormData, options?: IObjGet) => {
  return request('/api/hub/cases/upload', {
    method: 'POST',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
    ...(options || {}),
  });
};

/**
 * 确认导入用例（Step 2）
 * POST /hub/cases/upload/commit
 * @param data - { file_md5, project_id, module_id, is_common?, requirement_id?, plan_id?, case_status?, is_review? }
 */
export const commitImportCase = async (data: {
  file_md5: string;
  project_id: number;
  module_id?: number;
  is_common?: boolean;
  requirement_id?: string;
  plan_id?: string;
  case_status?: number;
  is_review?: number;
}) => {
  return request<{ imported_count: number }>('/api/hub/cases/upload/commit', {
    method: 'POST',
    data: data,
  });
};

/**
 * 取消上传（Step 3）
 * POST /hub/cases/upload/cancel
 * @param file_md5 - 文件唯一标识
 */
export const cancelImportCase = async (file_md5: string) => {
  return request('/api/hub/cases/upload/cancel', {
    method: 'POST',
    data: { file_md5 },
  });
};

/**
 * queryTestCaseSupStep
 * @param caseId
 * @param options
 */
export const queryTestCaseSupStep = async (
  caseId: string,
  options?: IObjGet,
) => {
  return request<IResponse<CaseSubStep[]>>(
    `/api/hub/cases/querySubSteps/${caseId}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
};

/**
 * queryTestCaseDynamic
 * @param caseId
 * @param options
 */
export const queryTestCaseDynamic = async (
  caseId: number,
  planId?: string,
  options?: IObjGet,
) => {
  return request<IResponse<ICaseDynamic[]>>(
    `/api/hub/cases/queryDynamic/${caseId}`,
    {
      method: 'GET',
      params: { plan_id: planId },
      ...(options || {}),
    },
  );
};

/**
 * 重排序测试用例
 * @param info - 包含 requirement_id 和 caseIds
 * @param options - 可选的请求配置
 */
export const reorderTestCase = async (
  info: {
    requirement_id: number;
    caseIds: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/reorder`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};
/**
 * removeTestCase
 * @param info
 * @param options
 */
export const removeTestCase = async (
  info: {
    requirement_id?: number;
    caseId: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/remove`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * copyTestCase
 * @param info
 * @param options
 */
export const copyTestCase = async (
  info: {
    requirement_id?: number;
    caseId: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/copy`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};
/**
 * reorderTestCase
 * @param info
 * @param options
 */
export const reorderTestCaseStep = async (
  info: {
    step_ids: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/reorderSupStep`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * removeTestCaseStep
 * @param info
 * @param options
 */
export const removeTestCaseStep = async (
  info: {
    stepId: any;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/removeStep`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * copyTestCaseStep
 * @param info
 * @param options
 */
export const copyTestCaseStep = async (
  info: {
    step_id: any;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/copyStep`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * handleAddTestCaseStep
 * @param info
 * @param options
 */
export const handleAddTestCaseStep = async (
  info: {
    caseId: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/handleAddStepLine`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * updateTestCaseStep
 * @param info
 * @param options
 */
export const updateTestCaseStep = async (
  info: CaseSubStep,
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/updateSubSteps`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * 下载用例模板 Excel
 * @param options - 配置选项
 * @returns 包含 blob 数据和文件名的对象
 */
export const downloadCaseExcel = async (options: { responseType: 'blob' }) => {
  const response = await request<any>('/api/hub/cases/downloadCaseDemo', {
    method: 'GET',
    ...(options || {}),
  });

  const contentDisposition = response?.headers?.['content-disposition'];
  let filename = '用例模板.xlsx';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=['"]?([^;"'\n]+)/i);
    if (match) {
      filename = decodeURIComponent(match[1]);
    }
  }

  return {
    blob: response as unknown as Blob,
    filename,
  };
};

/**
 * setAllTestCaseStatus
 * @param info
 * @param options
 */
export const setAllTestCaseStatus = async (
  info: {
    requirement_id: number;
    case_status: number;
    case_ids: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/req/updateStatus`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * setAllTestCaseReview
 * @param info
 * @param options
 */
export const setAllTestCaseReview = async (
  info: {
    requirement_id: number;
    is_review: number;
    case_ids: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/req/updateReview`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * 分页查询测试用例
 * @param searchParams - 查询参数
 * @param options - 可选的请求配置
 */
export const pageTestCase = async (searchParams: any, options?: IObjGet) => {
  return request<IResponse<IPage<ITestCase>>>('/api/hub/cases/page', {
    method: 'POST',
    data: searchParams,
    ...(options || {}),
  });
};

/**
 * moveTestCase2Common
 * @param info
 * @param options
 */
export const moveTestCase2Common = async (
  info: {
    case_ids: number[];
    module_id: number;
    project_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/updateCommon`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * moveTestCase2Common
 * @param info
 * @param options
 */
export const getTestCaseMind = async (
  info: {
    requirement_id: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>(`/api/hub/mindCase/detail`, {
    method: 'GET',
    params: info,
    ...(options || {}),
  });
};

/**
 * moveTestCase2Common
 * @param info
 * @param options
 */
export const insertTestCaseMind = async (
  info: {
    requirement_id: string;
    mind_node: any;
    module_id: string;
    project_id: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>(`/api/hub/mindCase/insert`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * updateTestCaseMind
 * @param info
 * @param options
 */
export const updateTestCaseMind = async (
  info: {
    id: number;
    mind_node?: any;
    module_id?: string;
    project_id?: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>(`/api/hub/mindCase/update`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};
