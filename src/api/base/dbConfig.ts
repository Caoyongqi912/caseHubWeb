import { IObjGet, IPage, IResponse } from '@/api';
import { IDBConfig } from '@/pages/Project/types';
import { request } from '@@/plugin-request';

/**
 * add
 * @param config
 * @param options
 */
export async function insertDBConfig(config: IDBConfig, options?: IObjGet) {
  return request<IResponse<IDBConfig>>('/api/project/config/insertDB', {
    method: 'POST',
    data: config,
    ...(options || {}),
  });
}

/**
 * tru
 * @param config
 * @param options
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
 * page
 * @param data
 * @param options
 */
export async function pageDBConfig(data: any, options?: IObjGet) {
  return request<IResponse<IPage<IDBConfig>>>('/api/project/config/pageDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * page
 * @param data
 * @param options
 */
export async function getDBConfig(data: string, options?: IObjGet) {
  return request<IResponse<IDBConfig>>('/api/project/config/infoDB', {
    method: 'GET',
    params: { uid: data },
    ...(options || {}),
  });
}

/**
 * queryDBConfig
 * @param options
 */
export async function queryDBConfig(options?: IObjGet) {
  return request<IResponse<IDBConfig[]>>('/api/project/config/queryDB', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * page
 * @param data
 * @param options
 */
export async function removeDBConfig(data: { uid: string }, options?: IObjGet) {
  return request<IResponse<null>>('/api/project/config/removeDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * page
 * @param data
 * @param options
 */
export async function updateDBConfig(data: IDBConfig, options?: IObjGet) {
  return request<IResponse<null>>('/api/project/config/updateDB', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * page
 * @param data
 * @param options
 */
export async function testDBConfig(data: IDBConfig, options?: IObjGet) {
  return request<IResponse<null>>('/api/project/config/testConnect', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 获取db
 * @param data
 * @param opt
 */
export const getDBContentInfo = async (data: number, opt?: IObjGet) => {
  return request<IResponse<any>>('/api/project/config/getDBContent', {
    method: 'GET',
    params: { db_content_id: data },
    ...(opt || {}),
  });
};
