import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import {
  ILocator,
  IPlayStepContent,
  IPlayStepDetail,
  IUICase,
  IUICaseSteps,
  IUICaseSubStep,
  IUIGroupStep,
  IUIMethod,
  IUIResult,
  IUIVars,
} from '@/pages/Play/componets/uiTypes';
import { request } from '@@/plugin-request/request';

/**
 * ui 用例分页查询
 * @param params
 * @param options
 */
export const pagePlayCase = async (params: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IUICase>>>('/api/play/case/page', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
};
/**
 * 添加用例
 * @param data
 * @param opt
 */
export const addPlayCaseBasicInfo = async (data: IUICase, opt?: IObjGet) => {
  return request<IResponse<IUICase>>('/api/play/case/insert/basic', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};
/**
 * 修改
 * @param data
 * @param opt
 */
export const editPlayCaseBaseInfo = async (data: IUICase, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/play/case/edit/basic', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};

/**
 * 删除
 * @param data
 * @param opt
 */
export const removePlayCase = async (
  data: { caseId: number },
  opt?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/delete', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};

/**
 * 複製
 * @param data
 * @param opt
 */
export const copyPlayCase = async (data: { caseId: number }, opt?: IObjGet) => {
  return request<IResponse<IUICase>>('/api/play/case/copy', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};

/**
 * 用例 步骤复制
 * @param values
 * @param options
 */
export const copyCaseStep = async (
  values: {
    case_id: number;
    content_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/copy_content', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

/**
 * 删除 Case Content
 * @param data
 * @param options
 */
export const updateCaseContent = async (
  data: {
    id: number;
    enable?: boolean;
    content_name?: string;
    api_script_text?: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/case/edit_content', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 删除 Case Content
 * @param body
 * @param options
 */
export const removePlayStepContent = async (
  body: { content_id: number; case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/case/remove_content', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};

/**
 * 用例 步骤排序
 * @param values
 * @param options
 */
export const reorderCaseStep = async (
  values: {
    case_id: number;
    content_id_list: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<IUICase>>('/api/play/case/reorder_content_step', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

/**
 * 关联Step 到Case
 * @param data
 * @param options
 */
export const associationPlayStep = async (
  data: {
    case_id: string | number;
    play_step_id_list: number[];
    quote: boolean;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/associationPlayStep', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 关联Step 到group
 * @param data
 * @param options
 */
export const associationPlayGroupStep = async (
  data: {
    group_id: string | number;
    play_step_id_list: number[];
    quote: boolean;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>(
    '/api/play/stepGroup/associationPlayGroupStep',
    {
      method: 'POST',
      data: data,
      ...(options || {}),
    },
  );
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const choicePlayStep2Case = async (
  data: {
    caseId: string;
    choice_steps: number[];
    quote: boolean;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/insert_common_step', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

export const choicePlayGroupStep2Case = async (
  data: {
    case_id: string;
    group_id_list: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/associationPlayGroup', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 调试历史分页
 * @param data
 * @param options
 */
export const pagePlayCaseResult = async (
  data: ISearch,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IPage<IUIResult>>>('/api/play/case/page_result', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 调试详情
 * @param data
 * @param options
 */
export const getPlayCaseResultDetail = async (
  data: string,
  options?: IObjGet,
): Promise<IResponse<any>> => {
  return request<IResponse<IUIResult>>('/api/play/case/result_detail', {
    method: 'GET',
    params: { uid: data },
    ...(options || {}),
  });
};

/**
 * 清空调试历史
 * @param data
 * @param options
 */
export const clearPlayCaseResult = async (
  data: { caseId: number },
  options?: IObjGet,
) => {
  return request('/api/play/case/result_clear', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
};

/**
 * query Vars
 * @param data
 * @param options
 */
export const pagePlayCaseVars = async (
  data: { play_case_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<IPage<IUIVars>>>('/api/play/case/page_variable', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};
/**
 * query Vars
 * @param caseId
 * @param options
 */
export const queryPlayCaseVars = async (caseId: string, options?: IObjGet) => {
  return request<IResponse<IUIVars[]>>('/api/play/case/query_variable', {
    method: 'GET',
    params: { caseId },
    ...(options || {}),
  });
};

/**
 * 修改Vars
 * @param data
 * @param options
 */
export const updatePlayCaeVars = async (data: IUIVars, options?: IObjGet) => {
  return request<IResponse<null>>('/api/play/case/edit_variable', {
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
export const addPlayCaeVars = async (data: IUIVars, options?: IObjGet) => {
  return request<IResponse<null>>('/api/play/case/add_variable', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 删除 Vars
 * @param data
 * @param options
 */
export const removePlayCaseVars = async (
  data: { uid: string },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/remove_variable', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};
// =============================================Step=======================================================

/**
 * ui 用例详情
 * @param params
 * @param options
 */
export const playStepDetailById = async (
  params: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IPlayStepDetail>>('/api/play/step/detail', {
    method: 'GET',
    params: { step_id: params },
    ...(options || {}),
  });
};
/**
 * 关联api接口
 * @param data
 * @param options
 */
export const associationStepInterApi = async (
  data: {
    stepId: number;
    apiId: number;
    interface_a_or_b: number;
    interface_fail_stop: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/associationAPI', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 移除关联api接口
 * @param data
 * @param options
 */
export const removeAssociationStepInterApi = async (
  data: {
    stepId: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/removeAssociationAPI', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 用例步骤详情
 * @param ident
 * @param options
 */
export const queryPlayStepContentByCaseId = async (
  ident: string,
  options?: IObjGet,
): Promise<IResponse<IPlayStepContent[]>> => {
  return request<IResponse<IPlayStepContent[]>>('/api/play/case/queryContent', {
    method: 'GET',
    params: { case_id: ident },
    ...(options || {}),
  });
};

/**
 * 添加步骤
 * @param data
 * @param options
 */
export const insertPlayStep = async (
  data: IUICaseSubStep,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/step/insertCasePlayStep', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * Case添加私有步骤
 * @param data
 * @param options
 */
export const insertPlayCaseStep = async (
  data: IPlayStepDetail,
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/case/insertCasePlayStep', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * Case添加私有步骤
 * @param data
 * @param options
 */
export const insertPlayGroupStep = async (
  data: IPlayStepDetail,
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/stepGroup/insertStep', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 添加步骤
 * @param data
 * @param options
 */
export const savePlayStep = async (
  data: IPlayStepDetail,
  options?: IObjGet,
) => {
  return request<IResponse<IPlayStepDetail>>('/api/play/step/insert', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 步骤分页
 * @param params
 * @param options
 */
export const pagePlaySteps = async (params: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IPlayStepDetail>>>('/api/play/step/page', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
};

/**
 * 改step
 * @param data
 * @param options
 */
export const updatePlayStep = async (
  data: IPlayStepDetail,
  options?: IObjGet,
) => {
  return request<IResponse<IPlayStepDetail>>('/api/play/step/edit', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};
/**
 * 删除step
 * @param body
 * @param options
 */
export const removePlayStep = async (
  body: { step_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/remove', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};
/**
 * 删除step
 * @param body
 * @param options
 */
export const removePlayStepDBInfo = async (
  body: { stepId: number },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/removeAssociationDB', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};

/**
 * 删除条件
 * @param body
 * @param options
 */
export const removePlayStepCondition = async (
  body: { stepId: number },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/removeCondition', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};

export const getCasesByStepId = async (stepId: number, opt?: IObjGet) => {
  return request<IResponse<IUICase[]>>('/api/play/step/getAssociationCases', {
    method: 'GET',
    params: { stepId },
    ...(opt || {}),
  });
};

/**
 * 复制step
 * @param body
 * @param options
 */
export const copyCommonPlayStep = async (
  body: {
    step_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<any>>('/api/play/step/copy', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};

// =============================================GROUP STEP=======================================================

/**
 * 步骤组分页
 * @param params
 * @param options
 */
export const pagePlayGroupSteps = async (
  params: ISearch,
  options?: IObjGet,
) => {
  return request<IResponse<IPage<IUICaseSteps>>>('/api/play/stepGroup/page', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
};

/**
 * 复制
 * @param data
 * @param options
 */
export const copyPlayGroup = async (
  data: { group_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/copy', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 删除
 * @param data
 * @param options
 */
export const removePlayGroup = async (
  data: { group_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/remove', {
    method: 'POST',
    data,
    ...(options || {}),
  });
};

/**
 * 步骤组分页
 * @param params
 * @param options
 */
export const queryPlayGroupSteps = async (
  params: { group_id: number },
  options?: IObjGet,
) => {
  return request<IResponse<IPlayStepDetail[]>>(
    '/api/play/stepGroup/query_steps',
    {
      method: 'GET',
      params,
      ...(options || {}),
    },
  );
};

/**
 * 查询
 * @param values
 * @param options
 */
export const queryPlayGroupSubSteps = async (
  values: number,
  options?: IObjGet,
) => {
  return request<IResponse<IPlayStepDetail[]>>(
    '/api/play/stepGroup/querySteps',
    {
      method: 'GET',
      params: { group_id: values },
      ...(options || {}),
    },
  );
};
export const insertPlayGroupSteps = async (
  values: IUIGroupStep,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/insert', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

export const getPlayGroup = async (
  values: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IUIGroupStep>>('/api/play/stepGroup/detail', {
    method: 'GET',
    params: { group_id: values },
    ...(options || {}),
  });
};
export const updatePlayGroupSteps = async (
  values: IUIGroupStep,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/update', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

export const insertPlayGroupSubSteps = async (
  values: IUIGroupStep,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/insertStep', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};
export const reOrderSubSteps = async (
  values: {
    group_id: number;
    step_list: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/reorderSteps', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

export const copySubSteps = async (
  values: {
    group_id: number;
    step_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/copyStep', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};

export const removeSubSteps = async (
  values: {
    group_id: number;
    step_id: number;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/stepGroup/removeStep', {
    method: 'POST',
    data: values,
    ...(options || {}),
  });
};
// =============================================method=======================================================
/**
 * 查询方法
 * @param options
 */
export const queryPlayMethods = async (options?: IObjGet) => {
  return request<IResponse<IUIMethod[]>>('/api/play/config/method/list', {
    method: 'GET',
    ...(options || {}),
  });
};

/**
 * 查询方法
 * @param options
 */
export const queryPlayLocators = async (options?: IObjGet) => {
  return request<IResponse<ILocator[]>>('/api/play/config/locator/list', {
    method: 'GET',
    ...(options || {}),
  });
};
/**
 * 分页方法
 * @param data
 * @param options
 */
export const pagePlayMethods = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IUIMethod>>>('/api/play/config/method/page', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 分页Locator
 * @param data
 * @param options
 */
export const pagePlayLocators = async (data: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<ILocator>>>('/api/play/config/locator/page', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 添加方法
 * @param me
 * @param options
 */
export const addPlayMethod = async (me: IUIMethod, options?: IObjGet) => {
  return request<IResponse<null>>('/api/play/config/method/add', {
    method: 'POST',
    data: me,
    ...(options || {}),
  });
};

/**
 * 删除方法
 * @param uid
 * @param options
 */
export const removePlayMethod = async (uid: string, options?: IObjGet) => {
  return request<IResponse<null>>('/api/play/config/method/remove', {
    method: 'POST',
    data: { uid: uid },
    ...(options || {}),
  });
};

/**
 * 修改方法
 * @param method
 * @param options
 */
export const updatePlayMethod = async (
  method: IUIMethod,
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/config/method/update', {
    method: 'POST',
    data: method,
    ...(options || {}),
  });
};
