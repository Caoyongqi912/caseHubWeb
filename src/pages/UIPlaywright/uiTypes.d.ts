import { IObjGet } from '@/api';
import { IParams } from '@/pages/Httpx/types';

export interface IUICase {
  id: number;
  uid: string;
  title: string;
  desc?: string;
  level: string;
  status: string;
  steps: IUICaseSteps[];
  projectId: number;
  casePartId: number;
  create_time: string;
  update_time: string;
  creatorName: string;
  creator: number;
  updaterName?: string;
  updaterId?: number;
  envId: string;
}

export interface CasePartEnum {
  title: string;
  value: number;
  children?: CasePartEnum[];
}

export interface ProjectEnum {
  label: string;
  value: number;
}

export interface IUITask {
  id: number;
  uid: string;
  title: string;
  desc?: string;
  retry: number;
  status: string;
  switch: boolean;
  level: string;
  isAuto: boolean;
  corn?: string;
  isSend: boolean;
  sendType?: number;
  sendKey?: string;
  ui_cases: IUICase[];
  ui_case_num: number;
  projectId: number;
  casePartId: number;
  create_time: string;
  update_time: string;
  creatorName: string;
  creator: number;
  updaterName?: string;
  updaterId?: number;
  mode: string;
}

export interface IUIExtract {
  id: number;
  uid: string;
  key: string;
  value: string;
  caseId: number;
  creator: number;
  creatorName: string;
  updaterName?: string | null;
  updater?: number | null;
  create_time: string;
  update_time: string | null;
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

export interface IUICaseSteps {
  id: number;
  uid: string;
  name: string;
  desc: string;
  method: string;
  has_api: number | null;
  has_sql: number | null;
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
  group_Id: number;
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
  ui_case_desc: string;
  ui_case_step_num: number;
  ui_case_err_step?: number | null;
  ui_case_err_step_title?: string | null;
  ui_case_err_step_msg?: string | null;
  ui_case_err_step_pic_path?: string | null;
  startTime: string;
  useTime: string;
  endTime: string;
  startId: number;
  starterName: string;
  status: string;
  result: string;
  runningLogs: string;
  assertsInfo: any[];
}

export interface IUICaseStepAPI {
  id: number;
  uid: string;
  create_time: string;
  update_time: string | null;
  stepId: number;
  name: string;
  desc?: string;
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
