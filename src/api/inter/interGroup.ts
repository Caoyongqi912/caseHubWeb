import { IObjGet, IPage, IResponse } from '@/api';
import { IInterfaceAPI, IInterfaceGroup } from '@/pages/Httpx/types';
import { request } from '@@/plugin-request';

/**
 * 查询group
 * @param data
 * @param options
 */
export const pageInterfaceGroup = async (
  data: any,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IPage<IInterfaceGroup>>>(
    '/api/interface/group/page',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * try group
 * @param data
 * @param options
 */
export const tryInterfaceGroup = async (
  data: { groupId: number | string; envId: number | string },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<any>>('/api/interface/group/try', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};
/**
 * 复制group
 * @param data
 * @param options
 */
export const copyInterfaceGroup = async (
  data: number,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IInterfaceGroup>>('/api/interface/group/copy', {
    method: 'POST',
    data: { groupId: data },
    ...(options || {}),
  });
};
/**
 * 添加
 * @param data
 * @param options
 */
export const insertInterfaceGroup = async (
  data: IInterfaceGroup,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IInterfaceGroup>>('/api/interface/group/insert', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 更新
 * @param data
 * @param options
 */
export const updateInterfaceGroup = async (
  data: IInterfaceGroup,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>('/api/interface/group/update', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};
/**
 * 详情
 * @param data
 * @param options
 */
export const getInterfaceGroup = async (
  data: string | number,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IInterfaceGroup>>('/api/interface/group/detail', {
    method: 'GET',
    params: { groupId: data },
    ...(options || {}),
  });
};
/**
 * 删除
 * @param data
 * @param options
 */
export const removeInterfaceGroup = async (
  data: number,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>('/api/interface/group/remove', {
    method: 'POST',
    data: { id: data },
    ...(options || {}),
  });
};

/**
 * 查询关联 api
 * @param data
 * @param options
 */
export const queryInterfaceGroupApis = async (
  data: string | number,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IInterfaceAPI[]>>(
    '/api/interface/group/query_association/apis',
    {
      method: 'GET',
      params: { groupId: data },
      ...(options || {}),
    },
  );
};
/**
 * 排序关联
 * @param data
 * @param options
 */
export const reorderInterfaceGroupApis = async (
  data: { groupId: number; apiIds: string[] },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/reorder_association/apis',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 添加关联
 * @param data
 * @param options
 */
export const addInterfaceGroupApi = async (
  data: { groupId: string; apiId: string | number },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>('/api/interface/group/add_association/api', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 添加关联
 * @param data
 * @param options
 */
export const addInterfaceGroupApis = async (
  data: { groupId: number; apiIds: number[] },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>('/api/interface/group/add_association/apis', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 删除关联
 * @param data
 * @param options
 */
export const removeInterfaceGroupApis = async (
  data: { groupId: number; apiId: number },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/remove_association/api',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 删除关联
 * @param data
 * @param options
 */
export const copyInterfaceGroupApi = async (
  data: { groupId: string; apiId: number },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>('/api/interface/group/copy_association/api', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};
