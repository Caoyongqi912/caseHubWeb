import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import { IInterfaceAPITask } from '@/pages/Interface/types';
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
  return request<IResponse<null>>('/api/interface/task/association/cases', {
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
  return request<IResponse<null>>('/api/interface/task/remove/association', {
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
export const queryAssociationCasesByTaskId = async (
  data: { taskId: string | number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/query/cases', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};
/**
 * 重新排序关联用例
 * @param data
 * @param options
 */
export const reorderAssociationCasesByTaskId = async (
  data: { taskId: string | number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/task/reorder/cases', {
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
