import { IObjGet, IPage, IResponse } from '@/api';
import { IRequirement } from '@/pages/CaseHub/type';
import { request } from '@@/plugin-request';

/**
 * insertReq
 * @param requirement
 * @param options
 */
export const insertRequirement = async (
  requirement: IRequirement,
  options?: IObjGet,
) => {
  return request<IResponse<IRequirement>>('/api/hub/insertRequirement', {
    method: 'POST',
    data: requirement,
    ...(options || {}),
  });
};

/**
 * updateRequirement
 * @param requirement
 * @param options
 */
export const updateRequirement = async (
  requirement: IRequirement,
  options?: IObjGet,
) => {
  return request<IResponse<IRequirement>>('/api/hub/updateRequirement', {
    method: 'POST',
    data: requirement,
    ...(options || {}),
  });
};

/**
 * pageequirement
 * @param searchParams
 * @param options
 */
export const pageRequirement = async (searchParams: any, options?: IObjGet) => {
  return request<IResponse<IPage<IRequirement>>>('/api/hub/pageRequirement', {
    method: 'POST',
    data: searchParams,
    ...(options || {}),
  });
};

/**
 * getRequirement
 * @param requirementId
 * @param options
 */
export const getRequirement = async (
  requirementId: number,
  options?: IObjGet,
) => {
  return request<IResponse<IRequirement>>('/api/hub/getRequirement', {
    method: 'GET',
    params: { requirementId: requirementId },
    ...(options || {}),
  });
};
/**
 * removeRequirement
 * @param requirementId
 * @param options
 */
export const removeRequirement = async (
  requirementId: number,
  options?: IObjGet,
) => {
  return request<IResponse<number>>('/api/hub/removeRequirement', {
    method: 'POST',
    data: { requirementId: requirementId },
    ...(options || {}),
  });
};
