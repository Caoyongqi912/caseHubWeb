import { IObjGet, IPage, IResponse } from '@/api';
import { IInterfaceAPI, IInterfaceGroup } from '@/pages/Httpx/types';
import { request } from '@@/plugin-request';

/**
 * 分页获取接口组列表
 * @param data - 查询参数，包含分页、筛选等条件
 * @param options - 可选的请求配置
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
 * 调试接口组（批量执行组内接口）
 * @param data - 包含 groupId 和 envId
 * @param options - 可选的请求配置
 */
export const tryInterfaceGroup = async (
  data: { group_id: number | string; env_id: number | string },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<any>>('/api/interface/group/try', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};

/**
 * 复制接口组
 * @param data - 接口组ID
 * @param options - 可选的请求配置
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
 * 创建接口组
 * @param data - 接口组数据
 * @param options - 可选的请求配置
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
 * 更新接口组信息
 * @param data - 接口组数据（包含id）
 * @param options - 可选的请求配置
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
 * 获取接口组详情
 * @param data - 接口组ID
 * @param options - 可选的请求配置
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
 * 删除接口组
 * @param data - 接口组ID
 * @param options - 可选的请求配置
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
 * 获取接口组关联的API列表
 * @param data - 接口组ID
 * @param options - 可选的请求配置
 */
export const queryInterfaceGroupApis = async (
  data: string | number,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IInterfaceAPI[]>>(
    '/api/interface/group/associate/query_interfaces',
    {
      method: 'GET',
      params: { group_id: data },
      ...(options || {}),
    },
  );
};

/**
 * 排序接口组关联的API顺序
 * @param data - 包含 groupId 和 apiIds 排序后的ID列表
 * @param options - 可选的请求配置
 */
export const reorderInterfaceGroupApis = async (
  data: { groupId: number; apiIds: string[] },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/associate/reorder_interfaces',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 单个API关联到接口组
 * @param data - 包含 groupId 和 apiId
 * @param options - 可选的请求配置
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
 * 批量API关联到接口组
 * @param data - 包含 group_id、interface_ids 和 copy 标志
 * @param options - 可选的请求配置
 */
export const addInterfaceGroupApis = async (
  data: { group_id: number; interface_ids: number[]; copy: boolean },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/associate/add_interfaces',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 添加私有API关联到接口组
 * @param data - 包含 group_id
 * @param options - 可选的请求配置
 */
export const addSelfInterfaceGroupApi = async (
  data: { group_id: number },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/associate/add_self_interface',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 从接口组移除关联的单个API
 * @param data - 包含 groupId 和 apiId
 * @param options - 可选的请求配置
 */
export const removeInterfaceGroupApis = async (
  data: { group_id: number; interface_id: number },
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<null>>(
    '/api/interface/group/associate/remove_interface',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

/**
 * 复制接口组内单个API关联
 * @param data - 包含 groupId 和 apiId
 * @param options - 可选的请求配置
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
