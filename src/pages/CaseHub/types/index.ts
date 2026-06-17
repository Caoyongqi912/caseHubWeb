export interface IRequirement {
  id: number;
  uid: string;
  project_id: number;
  module_id: number;
  case_type: number;
  requirement_url: string;
  requirement_level: 'P1' | 'P2' | 'P0';
  requirement_name: string;
  process: number;
  case_ids?: number[];
  cases?: ITestCase[];
  case_number: number;
  develops?: number[];
  maintainer: number;
  creator: number;
  creatorName: string;
  updater: number;
  updaterName: string;
  create_time: string;
  update_time: string;
}

export interface ITestCase {
  id?: number;
  uid?: string;
  case_name: string;
  case_level: string;
  case_type: number;
  case_tag?: string;
  case_setup?: string;
  case_status?: string;
  case_bugs?: string[] | [] | undefined;
  case_mark?: string | undefined;
  /** 适用端：与用例配置中心 PLATFORM 枚举对齐，value 用字符串以兼容扩展 */
  case_platform?: string;
  is_common?: boolean;
  is_review?: string;
  requirement_id?: number | string;
  case_sub_steps?: CaseSubStep[];
  creatorName: string;
  creatorId: number;
  project_id?: number;
  module_id?: number;
  first_status?: string;
  second_status?: string;
}

export interface CaseSubStep {
  id: number;
  uid: string;
  action: string | null;
  order?: number;
  expected_result: string | null;
  actual_result?: string | null;
  status?: string;
  first_status?: string;
  second_status?: string;
  bug_url?: string | null;
}

export interface ICaseDynamic {
  id: number;
  test_case_id: string;
  description: string;
  create_time: string;
  creatorName: string;
}

export interface CaseSearchForm {
  case_name?: string;
  case_level?: 'P0' | 'P1' | 'P2' | 'P3';
  case_type?: 1 | 2;
  case_tag?: string;
  case_status?: 0 | 1 | 2;
  is_review?: number;
  is_common?: boolean;
}

export interface ICasePlan {
  id: number;
  uid: string;
  project_id: number;
  plan_name: string;
  plan_description?: string;
  plan_status?: string;
  plan_phase?: string;
  completion_rate?: number;
  plan_mark?: string;

  charge_id?: number;
  charge_name?: string;
  charge_avatar?: string;
  plan_start_time?: string;
  plan_end_time?: string;
}

export interface IPlanModule {
  id: number;
  uid: string;
  plan_id: number;
  parent_id?: number;
  title: string;
  order: number;
  children?: IPlanModule[];
  case_nums: number;
}
