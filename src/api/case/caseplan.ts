import { IObjGet, IPage, IResponse } from '@/api';
import {
  ICasePlan,
  IPlanModule,
  IRequirement,
  ITestCase,
} from '@/pages/CaseHub/types';
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
 * 分页查询计划下已关联的需求
 * @param searchParams - { plan_id, current, pageSize, ... } plan_id 必填
 */
export const pagePlanRequirements = async (searchParams: any) => {
  return request<IResponse<IPage<IRequirement>>>(
    '/api/hub/plan/requirements/page',
    {
      method: 'POST',
      data: searchParams,
    },
  );
};

/**
 * 批量关联需求到计划
 * 后端对应: POST /api/hub/plan/associateRequirements
 * @param data - { plan_id, requirement_ids }
 * @returns { count } 实际新增的关联记录数
 */
export const linkPlanRequirements = async (data: {
  plan_id: number;
  requirement_ids: number[];
}) => {
  return request<IResponse<{ count: number }>>(
    '/api/hub/plan/associateRequirements',
    {
      method: 'POST',
      data,
    },
  );
};

/**
 * 批量解除计划与需求的关联
 * 后端对应: POST /api/hub/plan/disassociateRequirements
 * @param data - { plan_id, requirement_ids }
 * @returns { count } 实际删除的关联记录数
 */
export const unlinkPlanRequirements = async (data: {
  plan_id: number;
  requirement_ids: number[];
}) => {
  return request<IResponse<{ count: number }>>(
    '/api/hub/plan/disassociateRequirements',
    {
      method: 'POST',
      data,
    },
  );
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
  /** 源项目模块 ID 列表：传了就走后端"按源目录复制/匹配计划分组"逻辑 */
  module_ids?: number[];
  /** 是否合并相同用例分组（与同名计划目录合并） */
  merge_same_group?: boolean;
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
 * 重排序计划下的单个用例
 *
 * 相比旧版（传全量 case_ids 列表），本接口只传"被移动 case + 锚点"，
 * 传输量与列表规模无关，适合 100+ 用例的大列表。
 *
 * @example
 * // 拖拽 A 到 B 之前
 * reorderPlanCases({ plan_id, case_id: A, before_id: B });
 *
 * @example
 * // 拖拽 A 到 module 末尾
 * reorderPlanCases({ plan_id, case_id: A });
 *
 * @example
 * // 跨 module 移动
 * reorderPlanCases({ plan_id, case_id: A, target_module_id: M, after_id: X });
 */
export const reorderPlanCases = async (data: {
  plan_id: number;
  case_id: number;
  before_id?: number;
  after_id?: number;
  target_module_id?: number;
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/reorder', {
    method: 'POST',
    data,
  });
};

/** 批量重排序单条意图（无 plan_id，由父级指定） */
export interface IReorderPlanCaseItem {
  case_id: number;
  before_id?: number;
  after_id?: number;
  target_module_id?: number;
}

/**
 * 批量重排序计划下的用例
 *
 * 适合多选拖拽：一次提交 N 条意图，服务端在同一事务内顺序应用。
 * 全部成功才提交，任一失败整体回滚。
 *
 * @example
 * // 多选拖拽：把 [A, B, C] 整体放到 X 之后（按目标顺序链式锚点）
 * reorderPlanCasesBulk({
 *   plan_id,
 *   items: [
 *     { case_id: A, after_id: X },
 *     { case_id: B, after_id: A },
 *     { case_id: C, after_id: B },
 *   ],
 * });
 *
 * @example
 * // 把多个 case 从 A 组一次性迁到 B 组
 * reorderPlanCasesBulk({
 *   plan_id,
 *   items: [
 *     { case_id: X, target_module_id: M_B },
 *     { case_id: Y, target_module_id: M_B },
 *   ],
 * });
 */
export const reorderPlanCasesBulk = async (data: {
  plan_id: number;
  items: IReorderPlanCaseItem[];
}) => {
  return request<IResponse<number[]>>('/api/hub/plan/cases/reorder/bulk', {
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
 * 彻底删除计划下的用例（解除关联 + 数据库物理删除用例本体及子步骤）
 *
 * 注意：物理删除后该用例将从 test_case / case_sub_step / plan_case_association
 * 全部相关表中抹除，不可恢复。仅用于计划内"清理无用用例"场景。
 */
export const deletePlanCasePermanently = async (data: {
  plan_id: number;
  case_ids: number[];
}) => {
  return request<IResponse<number>>('/api/hub/plan/cases/delete_permanent', {
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
 * 确认导入计划用例（Step 2）
 * POST /hub/plan/upload/commit
 *
 * @param data
 *   - file_md5: 上传预览返回的文件指纹
 *   - plan_id: 目标计划 ID
 *   - plan_module_id: 默认计划分组 (Excel 「所属分组」 缺失时兜底)
 *   - first_status / second_status: 一/二轮测试状态,
 *     取值 "0" 未开始 / "1" 通过 / "2" 失败 / "3" 阻塞 / "4" 跳过
 *   - is_review: 评审状态
 *   - skip_duplicate: True 时跳过 plan 内已关联的同名用例
 *
 * @returns imported_count 与 skipped_count (后端语义)
 */
export const commitPlanImportCase = async (data: {
  file_md5: string;
  plan_id?: string;
  plan_module_id?: number;
  first_status?: '0' | '1' | '2' | '3' | '4';
  second_status?: '0' | '1' | '2' | '3' | '4';
  is_review?: string;
  skip_duplicate?: boolean;
}) => {
  return request<{ imported_count: number; skipped_count: number }>(
    '/api/hub/plan/upload/commit',
    {
      method: 'POST',
      data: data,
    },
  );
};

/**
 * 单轮用例执行统计
 *
 * 对应后端 PlanCaseMapper.get_overview 中 first_round / second_round 字段。
 * 字段与状态枚举：
 *   - passed     一轮/二轮执行通过数（status = 1）
 *   - failed     执行失败数（status = 2）
 *   - not_executed  未执行数（status ≠ 1/2, 含 0/3/4）
 *   - completion_rate  完成率 = (passed + failed) / case_total, 单位 %
 */
export interface IPlanOverviewRound {
  passed: number;
  failed: number;
  not_executed: number;
  completion_rate: number;
}

/**
 * 计划概览统计
 *
 * 对应后端 GET /api/hub/plan/overview
 *
 * 字段：
 *   - case_total         用例总数
 *   - first_round        一轮执行统计
 *   - second_round       二轮执行统计
 *   - bug_total          缺陷总数（按有 bug_url 的关联记录数去重）
 *   - bug_urls           缺陷链接列表（用于「最近缺陷」面板）
 *   - requirement_total         关联需求总数
 *   - requirement_completed     已完成需求数（process == 4）
 *   - requirement_completion_rate   需求完成率 (%)
 */
/**
 * 单条缺陷关联：哪个用例的第几个步骤挂的 bug
 * 对应后端 PlanCaseMapper.get_overview 中 bug_list 数组元素
 */
export interface IPlanOverviewBug {
  /** 关联的用例名（来自 TestCase.case_name） */
  case_name: string;
  /** 步骤 id（case_sub_step.id） */
  step_id: number;
  /** 步骤顺序（1-based，由 case_sub_step.order 推导） */
  step_order: number;
  /** 缺陷链接（http/https URL） */
  bug_url: string;
}

export interface IPlanOverview {
  plan_id: number;
  case_total: number;
  first_round: IPlanOverviewRound;
  second_round: IPlanOverviewRound;
  bug_total: number;
  /**
   * 缺陷关联列表（后端已按 step_result.id desc 去重）
   * 用途：「最近缺陷」面板展示 「用例名 · 步骤n · 链接」
   */
  bug_list: IPlanOverviewBug[];
  /**
   * 兼容旧字段：纯 url 列表（去重后），新代码请优先读 bug_list
   * 保留以免历史引用爆掉
   */
  bug_urls: string[];
  requirement_total: number;
  requirement_completed: number;
  requirement_completion_rate: number;
}

/**
 * 计划概览统计
 * 对应后端 GET /api/hub/plan/overview
 * @param plan_id - 测试计划 ID
 */
export const getPlanOverview = async (plan_id: number) => {
  return request<IResponse<IPlanOverview>>(`/api/hub/plan/overview`, {
    method: 'GET',
    params: { plan_id },
  });
};

/**
 * 计划详细统计
 *
 * 对应后端 GET /api/hub/plan/statistics
 *
 * 字段：
 *   - case_by_level        按用例等级（P0/P1/P2/P3）分组的用例数
 *   - case_by_first_status 一轮按状态标签分组的用例数
 *   - case_by_second_status 二轮按状态标签分组的用例数
 *   - daily_trend          每日执行趋势（当前后端返回空，预留给后续接入）
 */
export interface IPlanStatistics {
  plan_id: number;
  case_by_level: Record<string, number>;
  case_by_first_status: Record<string, number>;
  case_by_second_status: Record<string, number>;
  daily_trend: Array<{
    date: string;
    executed: number;
    passed: number;
    failed: number;
  }>;
}

/**
 * 计划详细统计
 * 对应后端 GET /api/hub/plan/statistics
 * @param plan_id - 测试计划 ID
 */
export const getPlanStatistics = async (plan_id: number) => {
  return request<IResponse<IPlanStatistics>>(`/api/hub/plan/statistics`, {
    method: 'GET',
    params: { plan_id },
  });
};
