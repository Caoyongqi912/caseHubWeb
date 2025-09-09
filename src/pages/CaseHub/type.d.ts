import React from 'react';

export interface IRequirement {
  id: number;
  uid: string;
  project_id: number;
  module_id: number;

  requirement_url: string;
  requirement_level: 'P1' | 'P2' | 'P0';
  requirement_name: string;
  process: number;

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
  case_level: 'P1' | 'P0' | 'P2' | 'P3';
  case_type: 1 | 2;
  case_tag?: string;
  case_setup?: string;
  case_status?: 0 | 1 | 2; // 0:未开始 1:通过 2:失败
  case_bugs?: string[] | [] | undefined;
  case_mark?: string | undefined;
  // case_sub_steps?: CaseSubStep[];
  requirementId?: number | string;

  project_id?: number;
  module_id?: number;
}

export interface CaseSubStep {
  id?: React.Key;
  uid: string;
  action: string;
  order?: number;
  expected_result: string;
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
  case_level?: 'P1' | 'P0' | 'P2' | 'P3';
  case_type?: 1 | 2;
  case_tag?: string;
  case_status?: 0 | 1 | 2; // 0:未开始 1:通过 2:失败
}
