import { IBaseField, IObjGet } from '@/api';
import { IParams } from '@/pages/Httpx/types';

export interface IUICase {
  id: number;
  uid: string;
  title: string;
  description?: string;
  level: string;
  status: string;
  step_num: number;
  steps: IUICaseSteps[];
  project_id: number;
  module_id: number;
  create_time: string;
  update_time: string;
  creatorName: string;
  creator: number;
  updaterName?: string;
  updaterId?: number;
  env_id: string;
}

export interface IUITask {
  id: number;
  uid: string;
  title: string;
  description: string;
  retry: number;
  status: string;
  switch: boolean;
  level: string;
  is_auto: boolean;
  corn?: string;
  is_send: boolean;
  send_type?: number;
  send_key?: string;
  ui_cases: IUICase[];
  play_case_num: number;
  project_id: number;
  module_id: number;
  create_time: string;
  update_time: string;
  creatorName: string;
  creator: number;
  updaterName?: string;
  updaterId?: number;
  mode: string;
}

export interface IUIVars {
  id: number;
  uid: string;
  key: string;
  value: string;
  play_case_id: number;
}

export interface IUIStepGroup {
  id: number;
  uid: string;
  create_time: string;
  update_time: string | null;
  creator: number;
  creatorName: string;
  name: string;
  steps: IUICaseSteps[] | [];
}

export interface IUIGroupStep {
  uid: string;
  id: number;
  name: string;
  description: string;
  module_id: number;
  project_id: number;
  creator: number;
  creatorName: string;
}

export interface IPlayStepDetail {
  case_id?: number;
  id: number;
  uid: string;
  name: string;
  description?: string;
  selector?: string;
  locator?: string;
  iframe_name?: string;
  method?: string;
  key?: string;
  value?: string;
  new_page?: boolean;
  is_common: boolean;
  is_ignore: boolean;
  module_id: number;
  project_id: number;
  creator: number;
  creatorName: string;
  updater: number;
  updaterName: string;
  create_time: string;
  update_time: string;
}

export interface IUICaseSteps {
  id: number;
  uid: string;
  name: string;
  description: string;
  method: string;

  interface_id?: number;
  interface_a_or_b: number;
  interface_fail_stop: number;

  db_id?: number;
  sql_script?: string;
  db_a_or_b?: 1 | 0;

  condition: {
    key: string;
    value: string;
    operator: number;
  };
  locator: string;
  value?: string;
  api_url?: string | null;
  iframe_name?: string | null;
  is_common_step: boolean;
  new_page: boolean;
  is_ignore: boolean;
  creator: number | undefined;
  creatorName: string | undefined;
  updaterName?: string | null;
  updaterId?: number | null;
  create_time: string;
  update_time: string | null;

  is_group: boolean;
  group_id: number;
  step_order: number;

  caseId: number | string;
  module_id: number;
  project_id: number;
}

export interface IUIMethod {
  id: number;
  uid: string;
  creator: number;
  creatorName: string;
  label: string;
  value: string;
  description?: string;
  need_locator: number;
  need_value: number;
  need_key: number;
}

export interface ILocator {
  getter_name: string;
  getter_desc: string;
  getter_demo: string;
}

export interface IUIEnv {
  id: number;
  uid: string;
  name: string;
  domain: string;
  env: string;
}

export interface IUIResult {
  id: number;
  uid: string;
  create_time: string;
  update_time: string | null;
  ui_case_Id: number;
  ui_case_name: string;
  ui_case_description: string;
  ui_case_step_num: number;
  ui_case_err_step?: number | null;
  ui_case_err_step_title?: string | null;
  ui_case_err_step_msg?: string | null;
  ui_case_err_step_pic_path?: string | null;
  start_time: string;
  use_time: string;
  end_time: string;
  starter_id: number;
  starter_name: string;
  status: string;
  result: string;
  running_logs: string;
  asserts_info: any[];
  vars_info: any[];
}

export interface IUICaseStepAPI {
  id: number;
  uid: string;
  create_time: string;
  update_time: string | null;
  stepId: number;
  name: string;
  description?: string;
  url: string;
  creator: number;
  creatorName: string;
  method: string;
  params: IParams[] | [];
  bodyType: number;
  body: IObjGet | null;
  extracts: any[] | [];
  asserts: any[] | [];
}

export interface IUICaseStepSQL {
  id: number;
  uid: string;
  sql_str: string;
  db_id: number;
  b_or_a: number;
  description: string;
  create_time: string;
  update_time: string | null;
  stepId: number;
  creator: number;
  creatorName: string;
}

export interface IUICaseStepCondition {
  key: string;
  value: string;
  operator: number;
}

export interface IUICaseSubStep {
  id: number;
  uid: string;
  name: string;
  description: string;
  method: string;
  locator: string;
  value?: string;
  iframe_name?: string | null;
  new_page: boolean;
  is_ignore: boolean;
  creator: number | undefined;
  creatorName: string | undefined;
  stepId: number | string;
}

export interface IPlayTaskResult {
  id: number;
  uid: string;
  project_id: number;
  module_id: number;
  task_name: string;
  task_id: number;
  starter_name: string;
  run_day: any;
  status: string;
  result: string;
  total_usetime: string;
  start_time: string;
  end_time: string;
}

export interface IPlayStepContent {
  id: number;
  uid: string;
  target_id: number;
  content_name: string;
  content_desc: string;
  content_type: number;
  enable: boolean;
  is_common: boolean;
  script_text?: string;
  assert_list?: any;
}

export interface IPlayCaseContentResultResponse {
  children: IPlayCaseContentResult[];
  result: IPlayCaseContentResult;
}

export interface IPlayCaseContentResult extends IBaseField {
  content_message?: string;
  content_type: number;
  interface_case_result_id: number;
  interface_task_result_id: number | null;
  content_id: number;
  content_name: string;
  content_desc?: string;
  content_step: number | null;
  content_target_result_id: null | number;
  script_extracts: null;
  extracts: {
    key: string;
    value: any;
    target: number;
  }[];
  wait_time: number | null;
  content_condition: {
    key: any;
    operator: number;
    value: any;
    condition_result?: boolean;
  } | null;
  start_time: string;
  use_time: string | number | null;
  starter_id: number;
  starter_name: string;
  content_result: boolean;
  content_screenshot_path: string | null;
  content_ignore_error: boolean;
  target_result: any;
}
