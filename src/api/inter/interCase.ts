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
  return request<IResponse<IInterfaceAPICase>>(
    '/api/interface/case/insertBaseInfo',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * insertApiCase
 * @param data IInterfaceAPICase
 * @param options
 */
export const setApiCase = async (
  data: IInterfaceAPICase,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/update', {
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
  return request<IResponse<IInterfaceAPICase>>('/api/interface/case/baseInfo', {
    method: 'GET',
    params: { id: caseId },
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
    '/api/interface/case/page',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * 添加单个api 给 case
 * @param data
 * @param opt
 */
export const addApi2Case = async (
  data: { caseId: string; apiId: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/addOrderApi', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};

/**
 * 选择公共apis 给 case
 * @param data
 * @param opt
 */
export const associationApis = async (
  data: { interface_case_id: number | string; interface_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/associationApis', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
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
  data: { interface_case_id: number | string; api_group_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/associationApiGroups', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
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
  data: { condition_id: number | string; interface_id_list: number[] },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/interface/case/conditionContent/associationAPI',
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
    '/api/interface/case/conditionContent/reorderAssociationAPI',
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
    '/api/interface/case/conditionContent/removeAssociationAPI',
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
    '/api/interface/case/queryContents',
    {
      method: 'GET',
      params: { caseId: data },
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
    '/api/interface/case/conditionContent/queryConditionAPI',
    {
      method: 'GET',
      params: { content_condition_id: data },
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
    '/api/interface/case/updateConditionContent',
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
    '/api/interface/case/getConditionContent',
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
  return request<IResponse<null>>('/api/interface/case/reorderContents', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};

/**
 * 删除用例api
 */
export const removeCaseContentStep = async (
  data: { case_id: number; content_step_id?: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/removeContentStep', {
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
  return request<IResponse<null>>('/api/interface/case/execute/back', {
    method: 'POST',
    data: data,
    ...(opt || {}),
  });
};
/**
 * 删除用例
 */
export const removeApiCase = async (data: string | number, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/interface/case/remove', {
    method: 'POST',
    data: { id: data },
    ...(opt || {}),
  });
};

/**
 * 复制用例
 */
export const copyApiCase = async (data: string | number, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/interface/case/copy', {
    method: 'POST',
    data: { id: data },
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
  return request<IResponse<null>>('/api/interface/case/copyContentStep', {
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
    `/api/interface/result/case/detail/${data}`,
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
    id: number;
    enable?: boolean;
    content_name?: string;
    api_wait_time?: number;
    api_script_text?: string;
    api_assert_list?: IInterfaceCaseContentAssert[];
  },
  opt?: IObjGet,
) => {
  return request<IResponse<IInterfaceCaseContent>>(
    '/api/interface/case/updateCaseContent',
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
    '/api/interface/case/updateDBExecuteContent',
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
    '/api/interface/case/addCaseContent',
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
    `/api/interface/result/case/removeAll`,
    {
      method: 'POST',
      data: { interfaceCaseID: data },
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
  return request<IResponse<null>>(`/api/interface/result/task/removeAll`, {
    method: 'POST',
    data: { taskId: data },
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
    caseResultId: string | number;
  },
  opt?: IObjGet,
) => {
  return request<IResponse<ICaseContentResult[]>>(
    `/api/interface/result/queryByCaseResultId`,
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
    '/api/interface/result/case/page',
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
    '/api/interface/result/inter/page',
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
  return request<IResponse<null>>('/api/interface/case/vars/update', {
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
  return request<IResponse<null>>('/api/interface/case/vars/add', {
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
  return request<IResponse<null>>('/api/interface/case/vars/remove', {
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
  return request<IResponse<IUIVars[]>>('/api/interface/case/vars/query', {
    method: 'POST',
    data: { case_id: data },
    ...(options || {}),
  });
};

export const initAPICondition = async (
  data: { interface_case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/interface/case/associationCondition', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

export const add_empty_api = async (
  data: { case_id: number; module_id: number; project_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<IInterfaceAPI>>(
    '/api/interface/case/associationApi',
    {
      method: 'POST',
      data,
      ...(options || {}),
    },
  );
};
