import { IObjGet, IPage, IResponse } from '@/api';
import { IJob } from '@/pages/Project/types';
import { request } from '@@/plugin-request';

/**
 * 创建 APS 任务
 * @param data - 任务信息
 * @param opt - 可选的请求配置
 */
export const createApsJob = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IJob>>('/api/aps/job/add', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 更新 APS 任务
 * @param data - 任务信息
 * @param opt - 可选的请求配置
 */
export const updateApsJob = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IJob>>('/api/aps/job/update', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 删除 APS 任务
 * @param data - 任务信息，包含 job_id
 * @param opt - 可选的请求配置
 */
export const deleteApsJob = async (data: { job_id: string }, opt?: IObjGet) => {
  return request<IResponse<IJob>>('/api/aps/job/delete', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 分页查询 APS 任务列表
 * @param data - 查询参数
 * @param opt - 可选的请求配置
 */
export const pageApsJobs = async (data: IJob, opt?: IObjGet) => {
  return request<IResponse<IPage<IJob>>>('/api/aps/job/pageJobs', {
    method: 'POST',
    data,
    ...opt,
  });
};

/**
 * 查询任务关联的 Job 列表
 * @param data - Job ID
 * @param opt - 可选的请求配置
 */
export const queryJobTasks = async (data: string, opt?: IObjGet) => {
  return request<IResponse<any[]>>('/api/aps/job/queryJobTasks', {
    method: 'GET',
    params: { jobId: data },
    ...opt,
  });
};

/**
 * 切换 APS 任务状态（启用/禁用）
 * @param data - 包含 job_id 和 enable 状态
 * @param opt - 可选的请求配置
 */
export const toggleApsJob = async (
  data: { job_id: string; enable: boolean },
  opt?: IObjGet,
) => {
  return request<IResponse<any[]>>('/api/aps/job/switch', {
    method: 'GET',
    params: data,
    ...opt,
  });
};
