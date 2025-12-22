import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import { IUIResult } from '@/pages/Play/componets/uiTypes';
import { request } from '@@/plugin-request';

/**
 * 清空调试历史
 * @param data
 * @param options
 */
export const clearUICaseResult = async (
  data: { caseId: number },
  options?: IObjGet,
) => {
  return request('/api/ui/case/result/clear', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};

/**
 * 调试历史分页
 * @param data
 * @param options
 */
export const pageDebugResult = async (
  data: ISearch,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IPage<IUIResult>>>('/api/ui/case/result/page', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const executePlayCaseByBack = async (
  data: {
    caseId: string;
    error_stop: boolean;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/execute_back', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 调试详情
 * @param data
 * @param options
 */
export const getDebugResultDetail = async (
  data: string,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IUIResult>>('/api/ui/case/result/detail', {
    method: 'GET',
    params: { uid: data },
    ...(options || {}),
  });
};

/**
 * 通过任务ID 获取关联case执行结果
 * @param data
 * @param options
 */
export const queryUIReportByTaskId = async (
  data: { baseId: string },
  options?: IObjGet,
) => {
  return request<IResponse<any[]>>('/api/ui/task/report/case/query', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 任务结果Base分页
 * @param params
 * @param options
 */
export const pageUITaskResult = async (params: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<any>>>('/api/ui/task/report/base/page', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
};

/**
 * 任务结果Base详情
 * @param params
 * @param options
 */
export const getUITaskResult = async (
  params: { detailId: string },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/ui/task/report/base/detail', {
    method: 'GET',
    params,
    ...(options || {}),
  });
};
