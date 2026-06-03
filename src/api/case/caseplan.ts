import { IObjGet, IPage, IResponse } from '@/api';
import { ICasePlan, IPlanModule, ITestCase } from '@/pages/CaseHub/types';
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
 * 查询测试用例
 * @param searchParams - 查询参数
 * @param options - 可选的请求配置
 */
export const queryCasePlan = async (plan_name: string, options?: IObjGet) => {
  return request<IResponse<ICasePlan[]>>('/api/hub/plan/query', {
    method: 'GET',
    params: { plan_name },
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
  return request<IResponse<IPlanModule[]>>(`/api/hub/plan/modules`, {
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

const pendingPlanCasesRequests = new Map<
  string,
  Promise<IResponse<ITestCase[]>>
>();

/**
 * 生成稳定的去重 key
 * - 未定义字段不参与序列化，避免 {is_review: undefined} 与 {} 被识别为不同 key
 * - 字段按字典序排序，调用方传入顺序不影响命中
 * 命中后：stats 路径（不传 is_review）与列表"未筛选"路径会复用同一份 in-flight 请求
 */
const buildPlanCasesKey = (data: {
  plan_id: number;
  plan_module_id?: number;
  case_level?: number;
  is_review?: string;
}): string => {
  const normalized: Record<string, unknown> = {};
  for (const k of Object.keys(data).sort()) {
    const v = (data as Record<string, unknown>)[k];
    if (v !== undefined) normalized[k] = v;
  }
  return JSON.stringify(normalized);
};

/**
 * 查询测试计划下的用例列表
 * 自动去重：相同参数的并发请求共享同一个 Promise，避免重复网络请求
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
  is_review?: string;
}) => {
  const key = buildPlanCasesKey(data);
  const pending = pendingPlanCasesRequests.get(key);
  if (pending) return pending;

  const promise = request<IResponse<ITestCase[]>>(`/api/hub/plan/cases`, {
    method: 'GET',
    params: data,
  }).finally(() => {
    pendingPlanCasesRequests.delete(key);
  });

  pendingPlanCasesRequests.set(key, promise);
  return promise;
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

/**
 * 删除关联测试计划下的用例
 * @param data - 包含 plan_id、case_ids 的对象
 */
export const removeAssociatePlanCases = async (data: {
  plan_id: number;
  case_ids: number[];
}) => {
  return request<IResponse<number>>('/api/hub/plan/case/remove', {
    method: 'POST',
    data,
  });
};

/**
 * 更新关联测试计划下的用例
 * @param data - 包含 plan_id、case_ids 的对象
 */
export const updateAssociatePlanCases = async (data: {
  plan_id: number;
  case_id_list: number[];
  is_review?: string;
  /** 一轮测试状态（与 case_status 复用同一枚举：0=未开始/1=通过/2=失败/3=阻塞/4=跳过） */
  first_status?: string;
  /** 二轮测试状态（枚举值同 first_status） */
  second_status?: string;
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/update', {
    method: 'POST',
    data,
  });
};

/**
 * 移动测试计划下的用例
 * @param data - 包含 plan_case_id、case_id_list、plan_case_module_id 的对象
 */
export const movePlanCases = async (data: {
  plan_id: number;
  case_id_list: number[];
  plan_case_module_id?: number;
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/move', {
    method: 'POST',
    data,
  });
};

/**
 * 复制测试计划下的用例
 * @param data - 包含 plan_id、case_id_list、plan_case_module_id、case_status 的对象
 */
export const copyPlanCases = async (data: {
  plan_id: number;
  case_id_list: number[];
  plan_case_module_id?: number;
  is_review?: string;
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/copy', {
    method: 'POST',
    data,
  });
};

/**
 * 插入测试计划下的用例
 * @param data - 包含 plan_id、case_id_list、plan_case_module_id、case_status 的对象
 */
export const insertPlanCases = async (data: ITestCase) => {
  return request<IResponse<ITestCase>>('/api/hub/plan/cases/insert', {
    method: 'POST',
    data,
  });
};

/**
 * 重排序计划下的用例
 * @param data - 包含 plan_id、plan_module_id、按目标顺序排列的 case_ids 数组
 */
export const reorderPlanCases = async (data: {
  plan_id: number;
  plan_module_id?: number;
  case_ids: number[];
}) => {
  return request<IResponse<null>>('/api/hub/plan/cases/reorder', {
    method: 'POST',
    data,
  });
};

/**
 * 复制测试计划下的单个用例
 * @param data - 包含 plan_id、case_id、plan_case_module_id、case_status 的对象
 */
export const copyOnePlanCase = async (data: {
  plan_id: number;
  case_id: number;
  plan_module_id: number;
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/copy_one', {
    method: 'POST',
    data,
  });
};

/**
 * 更新测试计划下的单个用例步骤结果
 * @param data - 包含 plan_id、step_id、plan_case_module_id、case_status 的对象
 */
export const updateCaseStepResult = async (data: {
  plan_id: number;
  step_id: number;
  /** 一轮测试状态 */
  first_status?: string;
  /** 二轮测试状态 */
  second_status?: string;
  actual_result?: string;
  bug_url?: string;
}) => {
  return request<IResponse<null>>('/api/hub/plan/case/updateStepResult', {
    method: 'POST',
    data,
  });
};

/**
 * 确认导入用例（Step 2）
 * POST /hub/cases/upload/commit
 * @param data - { file_md5, project_id, module_id, is_common?, requirement_id?, plan_id?, case_status?, is_review? }
 */
export const commitPlanImportCase = async (data: {
  file_md5: string;
  plan_id?: string;
  plan_module_id?: number;
  case_status?: number;
  is_review?: number;
}) => {
  return request<{ imported_count: number }>('/api/hub/plan/upload/commit', {
    method: 'POST',
    data: data,
  });
};
/**
 * 单轮测试统计（一轮 / 二轮），用于模块目录节点的 per-round Progress 展示
 * 对应后端 GET /api/hub/plan/modules/stats 响应中的 first / second 字段
 */
export interface RoundStats {
  passed: number;
  failed: number;
  pending: number;
  pass_rate: number;
  execution_rate: number;
}

/**
 * 模块用例状态分布统计
 *
 * 对应后端 GET /api/hub/plan/modules/stats
 *
 * 字段说明：
 * - 旧字段（total / passed / failed / ...）保留以兼容历史数据，对应旧版主状态维度
 * - first / second 为一轮 / 二轮测试的 per-round 统计，可选，后端支持后回填
 *   旧版本接口不返回时，前端按 0 降级展示
 */
export interface ModuleStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  skipped: number;
  pass_rate: number;
  execution_rate: number;
  /** 一轮测试统计（可选） */
  first?: RoundStats;
  /** 二轮测试统计（可选） */
  second?: RoundStats;
}

/**
 * 批量获取计划下各模块的用例状态分布
 * 用于替换对每个模块单独调用 queryPlanCases 的 N+1 模式
 * @param plan_id - 测试计划 ID
 */
export const getPlanModulesStats = async (plan_id: number) => {
  return request<IResponse<Record<string, ModuleStats>>>(
    `/api/hub/plan/modules/stats`,
    {
      method: 'GET',
      params: { plan_id },
    },
  );
};
