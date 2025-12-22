import { IObjGet, IPage, IResponse, ISearch } from '@/api';
import { IUICase, IUICaseSteps } from '@/pages/Play/componets/uiTypes';
import { request } from '@@/plugin-request/request';

/**
 * ui 用例分页查询
 * @param params
 * @param options
 */
export const pageUICase = async (params: ISearch, options?: IObjGet) => {
  return request<IResponse<IPage<IUICase>>>('/api/ui/case/page', {
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
export const addUICaseBaseInfo = async (data: IUICase, opt?: IObjGet) => {
  return request<IResponse<IUICase>>('/api/ui/case/add', {
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
export const putUICaseBaseInfo = async (data: IUICase, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/ui/case/edit', {
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
export const removeUICaseBaseInfo = async (data: IUICase, opt?: IObjGet) => {
  return request<IResponse<null>>('/api/ui/case/remove', {
    method: 'POST',
    data,
    ...(opt || {}),
  });
};

/**
 * ui 用例详情
 * @param params
 * @param options
 */
export const uiCaseDetailById = async (
  params: string | number,
  options?: IObjGet,
) => {
  return request<IResponse<IUICase>>('/api/ui/case/detail', {
    method: 'GET',
    params: { caseId: params },
    ...(options || {}),
  });
};
/**
 * 用例步骤详情
 * @param ident
 * @param options
 */
export const queryStepByCaseId = async (
  ident: string,
  options?: IObjGet,
): Promise<IResponse<IUICaseSteps[]>> => {
  return request<IResponse<IUICaseSteps[]>>('/api/ui/case/step/query', {
    method: 'GET',
    params: { id: ident },
    ...(options || {}),
  });
};

/**
 * 用例步骤详情
 * @param params
 * @param options
 */
export const getUICaseStepInfo = async (
  params: { id: string },
  options?: IObjGet,
) => {
  return request<IResponse<IUICaseSteps[]>>('/api/ui/case/step/detail', {
    method: 'GET',
    params,
    ...(options || {}),
  });
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const choiceAddUIStep = async (
  data: {
    caseId: string;
    choices: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/ui/case/choice/common/steps', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const choiceAddUIStepWithCopy = async (
  data: {
    caseId: string;
    choices: number[];
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/ui/case/copy/common/steps', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const executeCaseByIO = async (
  data: {
    caseId: string;
    error_stop: boolean;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/play/case/execute_io', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * Case choice UI STEP
 * @param data
 * @param options
 */
export const executeCaseByBack = async (
  data: {
    caseId: string;
  },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/ui/case/execute/back', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
};

/**
 * 复制
 * @param body
 * @param options
 */
export const copyUICase = async (
  body: { caseId: string },
  options?: IObjGet,
) => {
  return request<IResponse<IUICase>>('/api/ui/case/copy', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};

/**
 * 删除
 * @param body
 * @param options
 */
export const removeUICase = async (
  body: { caseId: number },
  options?: IObjGet,
) => {
  return request<IResponse<null>>('/api/ui/case/remove', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
};
