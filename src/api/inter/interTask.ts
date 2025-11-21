import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import {
  IInterfaceAPI,
  IInterfaceAPICase,
  IInterfaceAPITask,
  IInterfaceTaskResult,
} from '@/pages/Httpx/types';
import { request } from '@@/plugin-request/request';

/**
 * 创建任务
 * @param data
 * @param options
 */
export const insertApiTask = async (
  data: IInterfaceAPITask,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPITask>>(
    '/api/interface/task/insertTask',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 修改任务基本信息
 * @param data
 * @param options
 */
export const updateApiTaskBaseInfo = async (
  data: IInterfaceAPITask,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/updateTask', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 删除任务基本信息
 * @param data
 * @param options
 */
export const removeApiTaskBaseInfo = async (
  data: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/removeTask', {
    method: 'POST',
    data: { id: data },
    ...(options || {}),
  });
};
/**
 * switch task auto
 * @param data
 * @param options
 */
export const setApiTaskAuto = async (
  data: { is_auto: boolean; taskId: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/setAuto', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * switch task auto
 * @param data
 * @param options
 */
export const getNextTaskRunTime = async (data: string, options?: IObjGet) => {
  return request<IResponse<string>>('/api/interface/task/nextRunTime', {
    method: 'GET',
    params: { taskUid: data },
    ...(options || {}),
  });
};

/**
 * 分页任务
 * @param data
 * @param options
 */
export const pageApiTask = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IInterfaceAPITask>>>(
    '/api/interface/task/page',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 关联用例
 * @param data
 * @param options
 */
export const associationCasesByTaskId = async (
  data: { taskId: string; caseIds: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<boolean>>('/api/interface/task/association/cases', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 关联API
 * @param data
 * @param options
 */
export const associationApisByTaskId = async (
  data: { taskId: string | number; apiIds: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/association/apis', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 移除关联用例
 * @param data
 * @param options
 */
export const removeAssociationCasesByTaskId = async (
  data: { taskId: string; caseId: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interface/task/remove/association/cases',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 移除关联API
 * @param data
 * @param options
 */
export const removeAssociationApisByTaskId = async (
  data: { taskId: string; apiId: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interface/task/remove/association/apis',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};
/**
 * 查询关联用例
 * @param data
 * @param options
 */
export const queryAssociationCasesByTaskId = async (
  data: { taskId: string | number },
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPICase[]>>(
    '/api/interface/task/query/cases',
    {
      method: 'GET',
      params: data,
      ...(options || {}),
    },
  );
};
/**
 * 查询关联API
 * @param data
 * @param options
 */
export const queryAssociationApisByTaskId = async (
  data: string,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI[]>>('/api/interface/task/query/apis', {
    method: 'GET',
    params: { taskId: data },
    ...(options || {}),
  });
};
/**
 * 重新排序关联用例
 * @param data
 * @param options
 */
export const reorderAssociationCasesByTaskId = async (
  data: { taskId: string | number; caseIds: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/reorder/cases', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 重新排序关联api
 * @param data
 * @param options
 */
export const reorderAssociationApisByTaskId = async (
  data: { taskId: string | number; apiIds: number[] },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/reorder/apis', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 任务基本信息
 * @param data
 * @param options
 */
export const getApiTaskBaseDetail = async (
  data: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPITask>>('/api/interface/task/detail', {
    method: 'GET',
    params: { id: data },
    ...(options || {}),
  });
};

/**
 * 手动运行
 * @param data
 * @param options
 */
export const executeTask = async (
  data: {
    task_id: number | string;
    env_id: number;
    options: string[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/execute', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 查询用例结果分页
 * @param data
 * @param options
 */
export const pageInterTaskResult = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IInterfaceTaskResult>>>(
    '/api/interface/task/queryResults',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 查询任务结果详情
 * @param data
 * @param options
 */
export const getInterTaskResultDetail = async (
  data: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceTaskResult>>(
    '/api/interface/result/task/resultDetail',
    {
      method: 'GET',
      params: { resultId: data },
      ...(options || {}),
    },
  );
};

/**
 * 移除任务结果详情
 * @param data
 * @param options
 */
export const removeInterTaskResultDetail = async (
  data: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceTaskResult>>(
    '/api/interface/task/removeResult',
    {
      method: 'POST',
      data: { resultId: data },
      ...(options || {}),
    },
  );
};
