import { IObjGet, IResponse } from '@/api';
import { CaseSubStep, ICaseDynamic, ITestCase } from '@/pages/CaseHub/type';
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
  return request<IResponse<ITestCase[]>>('/api/hub/cases/queryByReqId', {
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
  searchInfo: { requirementId: number },
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
    requirementId: int;
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
    requirementId: number;
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
    requirementId: number | null;
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
    requirementId: number | null;
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
  return request<IResponse<null>>(`/api/hub/cases/updateSubStep`, {
    method: 'POST',
    data: info,
    ...(options || {}),
  });
};
