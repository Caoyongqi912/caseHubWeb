import { IObjGet, IPage, IResponse } from '@/api';
import { IJob } from '@/pages/Project/types';
import { request } from '@@/plugin-request';

/**
 * 添加任务
 * @param data
 * @param opt
 */
export const add_aps_job = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IJob>>('/api/aps/job/add', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 添加任务
 * @param data
 * @param opt
 */
export const update_aps_job = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IJob>>('/api/aps/job/update', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 添加任务
 * @param data
 * @param opt
 */
export const remove_aps_job = async (
  data: { job_id: string },
  opt?: IObjGet,
) => {
  return request<IResponse<IJob>>('/api/aps/job/delete', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 添加任务
 * @param data
 * @param opt
 */
export const page_aps_job = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IPage<IJob>>>('/api/aps/job/pageJobs', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * query_tasks_by_job
 * @param data
 * @param opt
 */
export const query_tasks_by_job = async (data: string, opt?: IObjGet) => {
  return request<IResponse<any[]>>('/api/aps/job/queryJobTasks', {
    method: 'GET',
    params: { jobId: data },
    ...opt,
  });
};
