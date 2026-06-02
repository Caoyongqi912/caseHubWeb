/**
 * @file src/api/case/caseConfig.ts
 * @description 用例配置相关接口（用例状态、评审状态等枚举）
 * 同一张表通过 config_key 字段区分不同枚举类型，便于后续扩展其他枚举
 *
 * 注意：以下接口地址为占位符，需与后端联调后替换为真实路径
 */

import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import { ICaseEnumConfig } from '@/pages/CaseHub/CaseConfig/types';
import { request } from '@@/plugin-request/request';

/**
 * 配置项分页查询
 * @param params 查询参数，包含 config_key 区分枚举类型
 * @param options
 */
export const pageCaseEnumConfig = async (
  params: ISearch & { config_key: string; keyword?: string },
  options?: IObjGet,
) => {
  return request<IResponse<IPage<ICaseEnumConfig>>>(
    '/api/hub/caseConfig/page',
    {
      method: 'POST',
      data: params,
      ...(options || {}),
    },
  );
};

/**
 * 新增配置项
 * @param data 配置项数据
 * @param options
 */
export const addCaseEnumConfig = async (
  data: Partial<ICaseEnumConfig>,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/hub/caseConfig/add', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 更新配置项
 * @param data 配置项数据（必须包含 uid）
 * @param options
 */
export const updateCaseEnumConfig = async (
  data: Partial<ICaseEnumConfig>,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/hub/caseConfig/update', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 删除配置项
 * @param data { uid }
 * @param options
 */
export const removeCaseEnumConfig = async (
  data: { uid: string },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/hub/caseConfig/remove', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 查询指定 config_key 下的全部配置项（用于运行时枚举下拉）
 * @param configKey
 * @param options
 */
export const queryCaseEnumConfig = async (
  configKey: string,
  options?: IObjGet,
) => {
  return request<IResponse<ICaseEnumConfig[]>>('/api/hub/caseConfig/query', {
    method: 'GET',
    params: { config_key: configKey },
    ...(options || {}),
  });
};
