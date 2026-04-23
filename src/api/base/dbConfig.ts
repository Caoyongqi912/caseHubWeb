import { IObjGet, IPage, IResponse } from '@/api';
import { IDBConfig } from '@/pages/Project/types';
import { request } from '@@/plugin-request/request';

/**
 * 创建数据库配置
 * @param config - 数据库配置信息，包含数据库类型、连接信息等
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<IDBConfig>> - 返回创建的数据库配置信息
 */
export async function createDBConfig(config: IDBConfig, options?: IObjGet) {
  return request<IResponse<IDBConfig>>('/api/project/config/insertDB', {
    method: 'POST',
    data: config,
    ...(options || {}),
  });
}

/**
 * 测试执行数据库SQL脚本
 * @param config - 包含数据库ID和待执行的SQL脚本
 * @param config.db_id - 数据库配置ID
 * @param config.script - 待执行的SQL脚本内容
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<any>> - 返回SQL执行结果
 */
export async function tryDBScript(
  config: { db_id: number; script: string },
  options?: IObjGet,
) {
  return request<IResponse<any>>('/api/project/config/try', {
    method: 'POST',
    data: config,
    ...(options || {}),
  });
}

/**
 * 分页查询数据库配置列表
 * @param data - 分页查询参数，包含分页信息和筛选条件
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<IPage<IDBConfig>>> - 返回分页的数据库配置列表
 */
export async function pageDBConfigs(data: any, options?: IObjGet) {
  return request<IResponse<IPage<IDBConfig>>>('/api/project/config/pageDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 根据配置ID获取数据库配置详情
 * @param configId - 数据库配置的uid
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<IDBConfig>> - 返回数据库配置详情
 */
export async function getDBConfigById(configId: string, options?: IObjGet) {
  return request<IResponse<IDBConfig>>('/api/project/config/infoDB', {
    method: 'GET',
    params: { uid: configId },
    ...(options || {}),
  });
}

/**
 * 查询所有可用的数据库配置列表
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<IDBConfig[]>> - 返回所有数据库配置列表
 */
export async function queryAllDBConfigs(options?: IObjGet) {
  return request<IResponse<IDBConfig[]>>('/api/project/config/queryDB', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 根据配置ID删除数据库配置
 * @param data - 包含待删除配置的uid
 * @param data.uid - 数据库配置的uid
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<null>> - 返回删除操作结果
 */
export async function removeDBConfigById(
  data: { uid: string },
  options?: IObjGet,
) {
  return request<IResponse<null>>('/api/project/config/removeDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 根据配置ID更新数据库配置
 * @param data - 包含uid和更新后的数据库配置信息
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<null>> - 返回更新操作结果
 */
export async function updateDBConfigById(data: IDBConfig, options?: IObjGet) {
  return request<IResponse<null>>('/api/project/config/updateDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 测试数据库连接是否成功
 * @param data - 包含待测试的数据库配置信息
 * @param options - 可选的请求配置
 * @returns Promise<IResponse<null>> - 返回连接测试结果
 */
export async function testDBConnection(data: IDBConfig, options?: IObjGet) {
  return request<IResponse<null>>('/api/project/config/testConnect', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 获取数据库脚本内容的详细信息
 * @param dbContentId - 数据库内容ID
 * @param opt - 可选的请求配置
 * @returns Promise<IResponse<any>> - 返回数据库脚本内容详情
 */
export const getDBContentDetail = async (
  dbContentId: number,
  opt?: IObjGet,
) => {
  return request<IResponse<any>>('/api/project/config/getDBContent', {
    method: 'GET',
    params: { db_content_id: dbContentId },
    ...(opt || {}),
  });
};
