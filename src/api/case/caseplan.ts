import { IObjGet, IPage, IResponse } from '@/api';
import { ICasePlan, ITestCase } from '@/pages/CaseHub/types';
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

/**
 * 获取测试计划详情
 * @param plan_id - 测试计划 ID
 */
export const getPlanInfo = async (plan_id: number) => {
  return request<IResponse<ICasePlan>>(`/api/hub/plan/info`, {
    method: 'GET',
    params: { plan_id },
  });
};

/**
 * 获取测试计划模块列表
 * @param plan_id - 测试计划 ID
 * @returns
 */
export const getPlanModules = async (plan_id: number) => {
  return request<IResponse<[]>>(`/api/hub/plan/modules`, {
    method: 'GET',
    params: { plan_id },
  });
};

/**
 * 创建测试计划模块
 * @param data - 包含 plan_id、parent_id、title、order 的对象
 */
export const insertPlanModule = async (data: {
  plan_id: number;
  parent_id?: number;
  title: string;
  order: number;
}) => {
  return request<IResponse<any>>('/api/hub/plan/module/insert', {
    method: 'POST',
    data,
  });
};

/**
 * 更新测试计划模块
 * @param data - 包含 id、title、order、parent_id 的对象
 */
export const updatePlanModule = async (data: {
  id: number;
  title?: string;
  order?: number;
  parent_id?: number;
}) => {
  return request<IResponse<any>>('/api/hub/plan/module/update', {
    method: 'POST',
    data,
  });
};

/**
 * 删除测试计划模块
 * @param data - 包含 module_id 的对象
 */
export const deletePlanModule = async (data: { module_id: number }) => {
  return request<IResponse<any>>('/api/hub/plan/module/remove', {
    method: 'POST',
    data,
  });
};

/**
 * 移动测试计划模块
 * @param data - 包含 module_id、new_parent_id、order 的对象
 * @param data
 * @returns
 */
export const movePlanModule = async (data: {
  module_id: number;
  new_parent_id?: number;
  order: number;
}) => {
  return request<IResponse<any>>('/api/hub/plan/module/move', {
    method: 'POST',
    data,
  });
};

/**
 * 查询测试计划下的用例列表
 * @param plan_id - 测试计划 ID
 * @param plan_module_id - 模块 ID，null 表示查询所有用例
 * @param case_level - 用例等级
 * @param is_review - 是否审核
 * @param current - 当前页码
 * @param pageSize - 每页数量
 * @returns
 */
export const queryPlanCases = async (data: {
  plan_id: number;
  plan_module_id?: number;
  case_level?: number;
  is_review?: boolean;
  current: number;
  pageSize: number;
}) => {
  return request<IResponse<IPage<ITestCase>>>(`/api/hub/plan/cases`, {
    method: 'GET',
    params: data,
  });
};

/**
 * 关联测试计划下的用例
 * @param data - 包含 plan_id、case_ids、plan_module_id 的对象
 */
export const associatePlanCases = async (data: {
  plan_id: number;
  case_ids: number[];
  plan_module_id?: number;
}) => {
  return request<IResponse<any>>('/api/hub/plan/case/associate', {
    method: 'POST',
    data,
  });
};
