import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import { IInterfaceTaskResult } from '@/pages/Httpx/types';
import { IPlayTaskResult, IUITask } from '@/pages/Play/componets/uiTypes';
import { request } from '@@/plugin-request';

export const getPlayTaskByTaskId = async (
  taskId: string,
  options?: IObjGet,
) => {
  return request<IResponse<IUITask>>('/api/play/task/basicDetail', {
    method: 'GET',
    params: { taskId },
    ...(options || {}),
  });
};

export const pagePlayTask = async (values: IObjGet, options?: IObjGet) => {
  return request<IResponse<IPage<IUITask>>>('/api/play/task/page', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

export const insertPlayTask = async (taskInfo: IUITask, options?: IObjGet) => {
  return request<IResponse<IUITask>>('/api/play/task/insertTask', {
    method: 'POST',
    data: taskInfo,
    ...(options || {}),
  });
};

/**
 * 删除任务
 * @param data
 * @param options
 */
export const removePlayTaskById = async (
  data: { taskId: number },
  options?: IObjGet,
) => {
  return request<IResponse<IUITask>>('/api/play/task/removeTask', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

export const updatePlayTask = async (taskInfo: IUITask, options?: IObjGet) => {
  return request<IResponse<IUITask>>('/api/play/task/updateTask', {
    method: 'POST',
    data: taskInfo,
    ...(options || {}),
  });
};

/**
 * 查询关联用例
 * @param data
 * @param options
 */
export const queryAssociationPlayCasesByTaskId = async (
  data: { taskId: string },
  options?: IObjGet,
) => {
  return request<IResponse<IUITask[]>>('/api/play/task/queryAssociationCase', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};

/**
 * 关联Cases
 * @param data
 * @param options
 */
export const insertAssociationPlayCasesByTaskId = async (
  data: { taskId: number; caseIdList: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/task/insertAssociationCase', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 关联Cases
 * @param data
 * @param options
 */
export const reorderAssociationPlayCasesByTaskId = async (
  data: { taskId: number; caseIdList: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/task/reorderAssociationCase', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 查询关联用例
 * @param data
 * @param options
 */
export const removeAssociationPlayCasesByTaskId = async (
  data: { taskId: string | number; caseId: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/task/removeAssociationCase', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 手动执行 Play 任务
 * @param data - 任务执行参数，包含 taskId
 * @param options - 可选的请求配置
 */
export const executePlayTask = async (
  data: { taskId: number | string },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/task/handleExecute', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 任务结果Base分页
 * @param params
 * @param options
 */
export const pagePlayTaskResult = async (
  params: ISearch,
  options?: IObjGet,
) => {
  return request<IResponse<IPage<IPlayTaskResult>>>(
    '/api/play/task/baseReport/page',
    {
      method: 'POST',
      data: params,
      ...(options || {}),
    },
  );
};

/**
 * 任务结果Base详情
 * @param params
 * @param options
 */
export const getPlayTaskResultById = async (
  params: { resultId: string },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/task/resultDetail', {
    method: 'GET',
    params,
    ...(options || {}),
  });
};

/**
 * 任务结果Base详情
 * @param params
 * @param options
 */
export const removePlayTaskResultById = async (
  params: { resultId: string },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/task/removeTaskResult', {
    method: 'GET',
    params,
    ...(options || {}),
  });
};

/**
 * 移除任务结果详情
 * @param taskId
 * @param options
 */
export const clearResultByTaskId = async (
  taskId: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceTaskResult>>(
    '/api/play/task/clearTaskResult',
    {
      method: 'GET',
      params: { taskId },
      ...(options || {}),
    },
  );
};

/**
 * 通过任务ID 获取关联case执行结果
 * @param data
 * @param options
 */
export const queryPlayCaseReportByTaskId = async (
  data: { resultId: string },
  options?: IObjGet,
) => {
  return request<IResponse<any[]>>('/api/play/task/queryCaseResultByTaskId', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};

/**
 * 下次运行时间
 * @param body
 * @param options
 */
export const getPlayTaskJobNextRunTime = async (
  body: { jobId: string },
  options?: IObjGet,
) => {
  return request<IResponse<string>>('/api/play/task/getTaskJobNextRunTime', {
    method: 'GET',
    params: body,
    ...(options || {}),
  });
};

/**
 * 启动关闭任务
 * @param data
 * @param opt
 */
export const setPlayTaskSwitch = async (
  data: { jobId: string; switch: boolean },
  opt?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/task/setJobSwitch', {
    method: 'POST',
    data,
    ...opt,
  });
};
