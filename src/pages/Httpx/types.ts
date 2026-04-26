import { IBaseField, IExtract, IObjGet } from '@/api';
import React from 'react';

export interface IInterfaceGlobalVariable extends IBaseField {
  key: string;
  value: string;
  description: string;
  project_id: number;
}

export interface IInterfaceGlobalHeader extends IBaseField {
  key: string;
  value: string;
  description: string;
  project_id: number;
}

export interface IInterfaceGlobalFunc extends IBaseField {
  label: string;
  value: string;
  description: string;
  demo: string;
}

export interface IInterfaceAPIRecord extends IBaseField {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: IHeaders[] | [];
  params: IParams[] | [];
  body: any;
  data: any;
  bodyType: number;
  response: any;
}

export interface IInterfaceCaseContent {
  id: number;
  content_type: number;
  target_id: number;

  content_name?: string | undefined;
  content_desc?: string | undefined;

  group_interface_num?: number;
  is_common_api: number;
  enable?: boolean;
  wait_time?: number;
  script_text?: string;
  assert_list?: IInterfaceCaseContentAssert[];
}

export interface IInterfaceCaseContentAssert {
  assert_key: string;
  assert_option: number;
  assert_value: string;
}

export interface IInterfaceCaseCondition {
  id: number;
  uid: string;
  condition_key: string;
  condition_value: string;
  condition_operator: number;
}

export interface IInterfaceAPI extends IBaseField {
  interface_name: string;
  interface_desc: string;
  interface_status: string;
  interface_level: string;
  interface_url: string;
  interface_method: string;
  interface_params: any;
  interface_headers: any;
  interface_body_type: number;
  interface_raw_type: string;
  interface_auth_type: number;
  interface_auth: any;
  interface_body: any;
  interface_data: any;
  interface_asserts: any;
  interface_extracts: any;
  interface_follow_redirects: number;
  interface_connect_timeout: number;
  interface_response_timeout: number;
  interface_before_script: string;
  interface_before_db_id: number;
  interface_before_sql: string;
  interface_before_sql_extracts: any;
  interface_after_script: string;
  interface_before_params: any;
  is_common: number;
  env_id: number;
  module_id: number;
  project_id: number;
}

export interface IInterfaceGroup extends IBaseField {
  interface_group_name: string;
  interface_group_desc: string;
  interface_group_api_num: number;
  project_id: number;
  module_id: number;
}

export interface IInterfaceAPICase extends IBaseField {
  case_title: string;
  case_desc: string;
  case_level: string;
  case_status: string;
  module_id: number;
  case_api_num: number;
  project_id: number;
}

export interface IInterfaceAPITask extends IBaseField {
  interface_task_title: string;
  interface_task_desc: string;
  interface_task_level: string;
  interface_task_status: string;
  interface_task_total_cases_num: number;
  interface_task_total_apis_num: number;
  module_id: number;
  project_id: number;
}

export interface ITryResponseInfo extends IBaseField {
  request_time: string;
  interfaceID: number;
  interfaceGroupId: number;
  interfaceName: string;
  interfaceDesc: string;
  interfaceEnvId: number;
  response_txt: string;
  response_status: number;
  response_head: IObjGet;
  request_head: IObjGet;
  request_method: string;
  startId: number;
  starterName: string;
  useTime: string;
  result?: 'SUCCESS' | 'ERROR';
  extracts: IExtract[];
  asserts: any;
  request_info: IObjGet;
  startTime: string;
}

export interface IInterfaceCaseResult extends IBaseField {
  interface_case_id: number;
  interface_case_name: string;
  interface_case_uid: string;
  interface_case_desc: string;
  project_id: number;
  module_id: number;
  starter_id: number;
  starter_name: string;
  total_num: number;
  use_time: string;
  start_time: string;
  interface_log?: string;
  progress: number;
  interface_task_result_id?: number;
  result?: 'SUCCESS' | 'ERROR';
  status: 'RUNNING' | 'OVER' | 'ERROR';

  running_env_id: number;
  running_env_name: string;
}

export interface IInterfaceTaskResult extends IBaseField {
  project_id: number;
  module_id: number;

  start_by: number;
  starter_id: number;
  starter_name: string;

  total_num: number;
  success_num: number;
  fail_num: number;

  total_use_time: string;
  start_time: string;
  end_time: string;

  task_id: number;
  task_uid: string;
  task_name: string;
  run_day: string;
  result?: boolean;
  progress: number;
  status: 'RUNNING' | 'OVER';
  running_env_id?: number;
  running_env_name?: string;
}

interface IBase {
  id: React.Key;
  key?: string;
  value?: string;
  desc?: string;
}

export interface IParams extends IBase {}

export interface IFromData {
  id: React.Key;
  key?: string;
  value_type?: string;
  value?: any;
  desc?: string;
}

export interface IHeaders extends IBase {}

export interface IExtracts extends IBase {
  target?: string;
  extraOpt?: string;
}

export interface IBeforeSQLExtract {
  id: React.Key;
  key?: string;
  value?: string;
}

export interface IBeforeParams extends IBase {
  target?: string;
}

export interface IAsserts {
  assert_switch: boolean;
  assert_name: string;
  assert_target?: string;
  assert_extract?: string;
  assert_opt?: string;
  assert_value?: any;
  assert_text?: any;
  result?: string;
  actual?: any;
  desc?: string;
  id: React.Key;
}

/**
 * 全局变量
 */

export interface IVariable {
  id: number;
  uid: string;
  key: string;
  value: any;
  desc: string;
  creatorName: string;
  creatorId: number;
  updaterName?: string;
  updaterId?: number;
  projectId: number;
  projectName: string;
  create_time: string;
  update_time: string;
}

export interface IInterfaceResultByCase {
  startTime: string;
  groupId: number | null;
  groupName: string;
  groupDesc: string;
  data: ITryResponseInfo[];
  interfaceID: number;
  id: number;
  interfaceGroupId: number;
  interfaceName: string;
  interfaceDesc: string;
  interfaceEnvId: number;
  response_txt: string;
  response_status: number;
  response_head: IObjGet;
  request_head: IObjGet;
  request_method: string;
  startId: number;
  starterName: string;
  useTime: string;
  result?: 'SUCCESS' | 'ERROR';
  extracts: IExtract[];
  asserts: any;
}

export interface CaseContentAssertResult {
  assert_key: string;
  assert_expect: string;
  assert_actual: string;
  assert_type: number;
  assert_result: boolean;
}

export interface ICaseContentResult extends IBaseField {
  content_type: number;
  interface_case_result_id: number;
  interface_task_result_id: number | null;
  content_id: number;
  content_name: string;
  content_desc?: string;
  content_step: number | null;
  content_target_result_id: null | number;
  start_time: string;
  use_time: string | number | null;
  starter_id: number;
  starter_name: string;
  result: boolean;
  data?: IResponseInfo[];
  // 断言数据
  assert_data: CaseContentAssertResult[] | null;
  // 等待时间
  wait_seconds: number | null;
  // db 私有
  db_query_result?: any;

  // group 私有
  success_api_num?: number;
  total_api_num?: number;
  fail_api_num?: number;

  // condition 私有
  content_condition: {
    key: any;
    operator: number;
    value: any;
    result?: boolean;
  } | null;

  // script 私有
  script_error?: string;
  script_vars: any;

  //loop
  loop_count?: number;
  loop_type?: number; // 1根据次数 2根据Items 3根据条件
  loop_items?: string;
  success_count?: number;
  fail_count?: number;
}

export interface LoopContent {
  id: number;
  case_id: number;
  loop_type: number;
  loop_times?: number;
  loop_items?: string;
  loop_item_key?: string;
  loop_condition?: IObjGet;
  max_loop?: number;
}

export interface IResponseInfo {
  interface_id: number;
  interface_name: string;
  interface_uid: string;
  interface_desc: string;
  starter_id: number;
  starter_name: string;
  request_url: string;
  request_method: string;
  request_params: any;

  request_body_type: number; // 0无 1raw 2data
  request_json: any;
  request_data: any;
  request_headers: any;
  extracts: IExtract[];
  asserts: any;
  running_env_id: number;
  running_env_name: string;
  response_status: number;
  response_text: string;
  response_headers: IObjGet;
  use_time: string;
  result: boolean;
  start_time: string;
}

export interface IInterfaceRemark extends IBaseField {
  interface_id: number;
  description: string;
  id: number;
  uid: string;
  create_time: string;
  update_time: string;
  creator: number;
  creatorName: string;
}

export interface IInterfaceCaseDynemic extends IBaseField {
  case_id: number;
  description: string;
  id: number;
  uid: string;
  create_time: string;
  update_time: string;
  creator: number;
  creatorName: string;
}
