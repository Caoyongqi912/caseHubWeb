import { IBaseField, IObjGet } from '@/api';
import { IInterfaceAPITask } from '@/pages/Httpx/types';

export interface IDBConfig extends IBaseField {
  db_name: string;
  db_type: number;
  db_host: string;
  db_port: string;
  db_username: string;
  db_password: string;
  db_database: string;
  project_id: number;
}

export interface IPushConfig extends IBaseField {
  push_name: string;
  push_type: number;
  push_desc: string;
  push_value: string;
}

export interface IJob extends IBaseField {
  job_name: string;
  job_type: number;
  job_env_id: number;
  job_env_name: string;
  job_task_id_list: string[];
  job_task_list?: IInterfaceAPITask[];
  job_trigger_type: number;
  job_execute_strategy: number;
  job_execute_time?: string;
  job_execute_interval?: number;
  job_execute_interval_unit: string;
  job_execute_cron?: string;
  job_max_retry_count: number;
  job_retry_interval: number;
  job_notify_id?: number;
  job_notify_name?: string;
  next_run_time?: string;
  job_kwargs?: IObjGet[];
  job_notify_on?: number[];
  job_notify_type: number;
  module_id: number;
  project_id: number;
  job_enabled: boolean;
}
