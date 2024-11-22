import { IResponse } from '@/api';
import { request } from '@@/plugin-request/request';

const PageCaseURl: string = '/api/case/page';
const CaseOPTURl: string = '/api/case/opt';

/**
 * case 分页
 * @param params
 * @param options
 */
export async function pageCases(params: any, options?: { [key: string]: any }) {
  return request<IResponse<any>>(PageCaseURl, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function getCase(
  params: { uid: string },
  options?: { [key: string]: any },
) {
  return request<IResponse<any>>(CaseOPTURl, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function addCases(body: any, options?: { [key: string]: any }) {
  return request<IResponse<any>>(CaseOPTURl, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function putCase(body: any, options?: { [key: string]: any }) {
  return request<IResponse<any>>(CaseOPTURl, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}

export async function delCase(
  body: { uid: string },
  options?: { [key: string]: any },
) {
  return request<IResponse<any>>(CaseOPTURl, {
    method: 'DELETE',
    data: body,
    ...(options || {}),
  });
}
