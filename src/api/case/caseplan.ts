import { IObjGet, IPage, IResponse } from '@/api';
import { ICasePlan } from '@/pages/CaseHub/types';
import { request } from '@@/plugin-request';

/**
 * 分页查询测试用例
 * @param searchParams - 查询参数
 * @param options - 可选的请求配置
 */
export const pageCasePlan = async (searchParams: any, options?: IObjGet) => {
  return request<IResponse<IPage<ICasePlan>>>('/api/hub/plan/page', {
    method: 'POST',
    data: searchParams,
    ...(options || {}),
  });
};

/**
 * 创建测试计划
 * @param data
 */
export const createCasePlan = async (data: ICasePlan) => {
  return request<IResponse<ICasePlan>>('/api/hub/plan/insert', {
    method: 'POST',
    data,
  });
};

/**
 * 更新测试计划
 * @param data
 */
export const updateCasePlan = async (data: ICasePlan) => {
  return request<IResponse<ICasePlan>>('/api/hub/plan/update', {
    method: 'POST',
    data,
  });
};

/**
 * 删除测试计划
 * @param data - 包含 plan_id 的对象
 */
export const deleteCasePlan = async (data: { plan_id: number }) => {
  return request<IResponse<null>>('/api/hub/plan/remove', {
    method: 'POST',
    data,
  });
};
