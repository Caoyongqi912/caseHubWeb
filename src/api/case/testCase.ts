import { IObjGet, IPage, IResponse } from '@/api';
import { CaseSubStep, ICaseDynamic, ITestCase } from '@/pages/CaseHub/types';
import { request } from '@@/plugin-request';
import { int } from 'utrie/dist/types/Trie';

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
 * addDefault
 * @param caseInfo
 * @param options
 */
export const addDefaultTestCase = async (
  caseInfo: {
    requirement_id: int;
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
 * uploadTestCase
 * @param data
 * @param options
 */
export const uploadTestCase = async (data: any, options?: IObjGet) => {
  return request<IResponse<ITestCase>>('/api/hub/cases/upload', {
    method: 'POST',
    data: data,
    ...(options || {}),
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
  options?: IObjGet,
) => {
  return request<IResponse<ICaseDynamic[]>>(
    `/api/hub/cases/queryDynamic/${caseId}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
};

/**
 * reorderTestCase
 * @param info
 * @param options
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
    stepIds: number[];
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
    stepId: any;
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

export const downloadCaseExcel = async (options: { responseType: 'blob' }) => {
  return request<any>('/api/hub/cases/downloadCaseDemo', {
    method: 'GET',
    ...(options || {}),
  });
};

/**
 * setAllTestCaseStatus
 * @param info
 * @param options
 */
export const setAllTestCaseStatus = async (
  info: {
    status: number;
    case_ids: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/updateStatus`, {
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
    is_review: boolean;
    case_ids: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/hub/cases/updateReview`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};

/**
 * pageTestCase
 * @param searchParams
 * @param options
 */
export const pageTestCase = async (searchParams: any, options?: IObjGet) => {
  return request<IResponse<IPage<ITestCase>>>('/api/hub/cases/dataPage', {
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
    module_id: int;
    project_id: int;
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

export const updateTestCaseMind = async (
  info: {
    id: int;
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
