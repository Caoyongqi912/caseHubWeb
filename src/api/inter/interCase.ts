import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import {
  ICaseContentResult,
  IInterfaceAPI,
  IInterfaceAPICase,
  IInterfaceCaseCondition,
  IInterfaceCaseContent,
  IInterfaceCaseContentAssert,
  IInterfaceCaseResult,
  ITryResponseInfo,
  IVariable,
  LoopContent,
} from '@/pages/Httpx/types';
import { IUIVars } from '@/pages/Play/componets/uiTypes';
import { request } from '@@/plugin-request/request';

/**
 * insertApiCase
 * @param data IInterfaceAPICase
 * @param options
 */
export const insertApiCase = async (
  data: IInterfaceAPICase,
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPICase>>('/api/interfaceCase/insert', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * updateApiCase
 * @param data IInterfaceAPICase
 * @param options
 */
export const updateApiCase = async (
  data: IInterfaceAPICase,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interfaceCase/update', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 查询用例信息
 * @param caseId
 * @param opt
 */
export const baseInfoApiCase = async (
  caseId: string | number,
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPICase>>('/api/interfaceCase/basic', {
    method: 'GET',
    params: { case_id: caseId },
    ...(opt || {}),
  });
};

/**
 * page 用例信息分页
 * @param data
 * @param options
 */
export const pageInterApiCase = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IInterfaceAPICase>>>(
    '/api/interfaceCase/page',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 选择公共apis 给 case
 * @param data
 * @param opt
 */
export const associationApis = async (
  data: {
    case_id: number | string;
    interface_id_list?: number[];
    copy?: boolean;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/associate/associate_interfaces',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 选择公共apis 给 case
 * @param data
 * @param opt
 */
export const selectCommonApisCopy2Case = async (
  data: { caseId: number | string; commonApis: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/selectCopyApis', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};

/**
 * 选择公共Group 给 case
 * @param data
 * @param opt
 */
export const selectCommonGroups2Case = async (
  data: { case_id: number; group_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/associate/associate_group',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 选择公共Group 给 API
 * @param data
 * @param opt
 */
export const selectCommonGroups2ConditionAPI = async (
  data: { condition_api_id: number | string; group_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/condition/addGroups', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};
/**
 * 选择公共api 给 API
 * @param data
 * @param opt
 */
export const selectCommonAPI2ConditionAPI = async (
  data: {
    condition_id: number | string;
    copy: boolean;
    interface_id_list: number[];
  },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/condition/associate_condition_api',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};
/**
 * 选择公共api 给 API
 * @param data
 * @param opt
 */
export const selectCommonAPI2LoopAPI = async (
  data: {
    loop_id: number | string;
    copy: boolean;
    interface_id_list: number[];
  },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/associate/associate_loop_interface',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 重新排序
 * @param data
 * @param opt
 */
export const reorderAssociationAPI = async (
  data: { condition_id: number | string; interface_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/condition/reorder_condition_apis',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 重新排序
 * @param data
 * @param opt
 */
export const reorderLoopAssociationAPI = async (
  data: { loop_id: number | string; interface_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/loop/reorder_loop_interface',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};
/**
 * 解除关联
 * @param data
 * @param opt
 */
export const removerAssociationAPI = async (
  data: { condition_id: number; interface_id: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/condition/remove_condition_api',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};
/**
 * 解除关联
 * @param data
 * @param opt
 */
export const removerLoopAssociationAPI = async (
  data: { loop_id: number; interface_id: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/associate/remove_loop_interface',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 获取Case Contents
 * @param data
 * @param opt
 */
export const queryContentsByCaseId = async (
  data: string | number,
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseContent[]>>(
    '/api/interfaceCase/content/query_contents',
    {
      method: 'GET',
      params: { case_id: data },
      ...(opt || {}),
    },
  );
};

/**
 * 获取条件 APIs
 * @param data
 * @param opt
 */
export const queryConditionAPI = async (
  data: string | number,
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI[]>>(
    '/api/interfaceCase/condition/query_condition_apis',
    {
      method: 'GET',
      params: { content_condition_id: data },
      ...(opt || {}),
    },
  );
};

/**
 * 获取条件 APIs
 * @param data
 * @param opt
 */
export const queryLoopAPI = async (data: string | number, opt?: IObjGet) => {
  return request<IResponse<IInterfaceAPI[]>>(
    '/api/interfaceCase/associate/query_loop_interface',
    {
      method: 'GET',
      params: { loop_id: data },
      ...(opt || {}),
    },
  );
};

/**
 * 更新条件
 * @param data
 * @param opt
 */
export const updateConditionContentInfo = async (data: any, opt?: IObjGet) => {
  return request<IResponse<IInterfaceCaseCondition>>(
    '/api/interfaceCase/condition/update_condition_content',
    {
      method: 'POST',
      data,
      ...(opt || {}),
    },
  );
};

/**
 * 创建私有API 给条件
 * @param data
 * @param opt
 */
export const createInterfaceAssoiationCondition = async (
  data: {
    condition_id: number;
    case_id: number;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI>>(
    '/api/interfaceCase/condition/create_condition_api',
    {
      method: 'POST',
      data,
      ...(opt || {}),
    },
  );
};

/**
 * 更新条件
 * @param data
 * @param opt
 */
export const associationConditionAPIs = async (
  data: { condition_id: number; interface_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<number>>(
    '/api/interface/case/conditionContent/associationAPI',
    {
      method: 'POST',
      data,
      ...(opt || {}),
    },
  );
};

/**
 * 获取条件
 * @param data
 * @param opt
 */
export const getConditionContentInfo = async (data: number, opt?: IObjGet) => {
  return request<IResponse<IInterfaceCaseCondition>>(
    '/api/interfaceCase/condition/get_condition_content',
    {
      method: 'GET',
      params: { condition_id: data },
      ...(opt || {}),
    },
  );
};

/**
 * 获取db
 * @param data
 * @param opt
 */
export const getDBContentInfo = async (data: number, opt?: IObjGet) => {
  return request<IResponse<any>>('/api/interface/case/getDBContent', {
    method: 'GET',
    params: { db_content_id: data },
    ...(opt || {}),
  });
};

/**
 * 重新排序
 */
export const reorderCaseContents = async (
  data: { case_id: number | string; content_step_order: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/content/reorder_contents',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 删除用例api
 */
export const removeCaseContentStep = async (
  data: { case_id: number; content_id?: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interfaceCase/content/remove_step', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};
/**
 * 执行用例
 */
export const runApiCaseIo = async (
  data: {
    case_id: string | number;
    env_id: number;
    error_stop: boolean;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/execute/io', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};
/**
 * 执行用例
 */
export const runApiCaseBack = async (
  data: {
    case_id: string | number;
    env_id: number;
    error_stop: boolean;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interfaceCase/execute/back', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};
/**
 * 删除用例
 */
export const removeApiCase = async (data: string | number, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/interfaceCase/remove', {
    method: 'POST',
    data: { case_id: data },
    ...(opt || {}),
  });
};

/**
 * 复制用例
 */
export const copyApiCase = async (data: string | number, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/interfaceCase/copy', {
    method: 'POST',
    data: { case_id: data },
    ...(opt || {}),
  });
};

/**
 * 复制用例中api
 */
export const copyCaseContentStep = async (
  data: { case_id: number | string; content_id: number | string },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interfaceCase/content/copy_step', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};

/**
 * 查询case result
 */
export const caseAPIResultDetail = async (data: string, opt?: IObjGet) => {
  return request<IResponse<IInterfaceCaseResult>>(
    `/api/interfaceResult/detail/${data}`,
    {
      method: 'GET',
      ...(opt || {}),
    },
  );
};

/**
 * case步骤开关
 */
export const updateCaseContent = async (
  data: {
    content_id: number;
    enable?: boolean;
    content_name?: string;
    wait_time?: number;
    script_text?: string;
    assert_list?: IInterfaceCaseContentAssert[];
  },
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseContent>>(
    '/api/interfaceCase/content/update',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 修改 case db步骤
 */
export const updateCaseContentDBScript = async (
  data: { id: number; sql_text?: string; db_id?: number; sql_extracts?: any },
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseContent>>(
    '/api/project/config/updateDBContent',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * add case步骤
 */
export const addCaseContent = async (
  data: { case_id: number; content_type: number },
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseContent>>(
    '/api/interfaceCase/content/insert',
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};
/**
 * 删除case result
 */
export const removeCaseAPIResult = async (data: string, opt?: IObjGet) => {
  return request<IResponse<IInterfaceCaseResult>>(
    `/api/interface/result/case/remove`,
    {
      method: 'POST',
      data: { uid: data },
      ...(opt || {}),
    },
  );
};
/**
 * 删除case result
 */
export const removeCaseAPIResults = async (
  data: number | string,
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseResult>>(
    `/api/interfaceResult/removeCaseResults`,
    {
      method: 'GET',
      params: { case_id: data },
      ...(opt || {}),
    },
  );
};

/**
 * 删除task result
 */
export const removeAllTaskResults = async (
  data: number | string,
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(`/api/interfaceResult/task/removeResults`, {
    method: 'GET',
    params: { task_id: data },
    ...(opt || {}),
  });
};

/**
 * 查询case result 关联的api result
 */
export const caseAPIResults = async (
  data: {
    interface_case_result_Id: string | number;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<ITryResponseInfo[]>>(
    `/api/interface/result/queryBy`,
    {
      method: 'POST',
      data: data,
      ...(opt || {}),
    },
  );
};

/**
 * 查询case result 关联的api result
 */
export const caseAPIResultsByCase = async (
  data: {
    case_result_id: string | number;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<ICaseContentResult[]>>(
    `/api/interfaceResult/queryStepResult`,
    {
      method: 'GET',
      params: data,
      ...(opt || {}),
    },
  );
};
/**
 * 查询用例结果分页
 * @param data
 * @param options
 */
export const pageInterCaseResult = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IInterfaceAPI>>>(
    '/api/interfaceResult/pageCaseResult',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 查询用例结果分页
 * @param data
 * @param options
 */
export const pageInterApiResult = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IInterfaceAPI>>>(
    '/api/interfaceResult/task/interface/pageResult',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 修改Vars
 * @param data
 * @param options
 */
export const updateVars = async (data: IVariable, options?: IObjGet) => {
  return request<IResponse<null>>('/api/interfaceCase/vars/update', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 添加 Vars
 * @param data
 * @param options
 */
export const addVars = async (data: IVariable, options?: IObjGet) => {
  return request<IResponse<null>>('/api/interfaceCase/vars/add', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 添加 Vars
 * @param data
 * @param options
 */
export const removeVars = async (data: { uid: string }, options?: IObjGet) => {
  return request<IResponse<null>>('/api/interfaceCase/vars/remove', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * query Vars
 * @param data
 * @param options
 */
export const queryVarsByCaseId = async (data: number, options?: IObjGet) => {
  return request<IResponse<IUIVars[]>>('/api/interfaceCase/vars/query', {
    method: 'POST',
    data: { case_id: data },
    ...(options || {}),
  });
};

export const initAPICondition = async (
  data: { case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interfaceCase/condition/insert_condition',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};
export const addAPILoop = async (data: LoopContent, options?: IObjGet) => {
  return request<IResponse<LoopContent>>(
    '/api/interfaceCase/associate/associate_loop',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

export const updateAPILoop = async (data: LoopContent, options?: IObjGet) => {
  return request<IResponse<LoopContent>>(
    '/api/interfaceCase/associate/update_loop',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

export const getAPILoop = async (data: number, options?: IObjGet) => {
  return request<IResponse<LoopContent>>(
    '/api/interfaceCase/associate/get_loop_content',
    {
      method: 'GET',
      params: { loop_id: data },
      ...(options || {}),
    },
  );
};

export const add_empty_api = async (
  data: { case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI>>(
    '/api/interfaceCase/associate/associate_interface',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

export const add_empty_db = async (
  data: { case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI>>(
    '/api/interfaceCase/associate/associate_db',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};

export const update_empty_db = async (
  data: {
    content_id: number;
    db_id?: number;
    sql_text?: string;
    sql_extracts?: any;
  },
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI>>(
    '/api/interfaceCase/associate/update_db',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};
