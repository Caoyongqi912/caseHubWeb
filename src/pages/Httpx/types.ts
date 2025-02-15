import { IBaseField, IExtract, IObjGet } from '@/api';
import React from 'react';

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

export interface IInterfaceAPI extends IBaseField {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: string;
  level: string;
  url: string;
  body_type: number;
  headers: IHeaders[] | [];
  params: IParams[] | [];
  body: any;
  data: any;
  asserts: IAsserts[];
  extracts: IExtracts[];
  project_id: number;
  part_id: number;
  env_id: number;
  connect_timeout: number;
  response_timeout: number;
  before_script: string;
  after_script: string;
  before_params: IBeforeParams[] | [];
  follow_redirects: boolean;
  is_common: number;
  enable: boolean;
  is_group: number;
  group_id: number;
}

export interface IInterfaceGroup extends IBaseField {
  name: string;
  description: string;
  api_num: number;
  project_id: number;
  part_id: number;
}

export interface IInterfaceAPICase extends IBaseField {
  title: string;
  desc: string;
  level: string;
  status: string;
  part_id: number;
  apiNum: number;
  project_id: number;
}

export interface IInterfaceAPITask extends IBaseField {
  title: string;
  desc: string;
  level: string;
  cron: string;
  switch: number | boolean;
  status: string;
  total_cases_num: number;
  part_id: number;
  total_apis_num: number;
  project_id: number;
  is_send: boolean | number;
  is_auto: boolean;
  send_type: number;
  send_key: string;
}

export interface ITryResponseInfo extends IBaseField {
  interfaceID: number;
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

export interface IInterfaceCaseResult extends IBaseField {
  interfaceCaseID: number;
  interfaceCaseName: string;
  interfaceCaseUid: string;
  interfaceCaseDesc: string;
  interfaceCaseProjectId: number;
  interfaceCasePartId: number;
  starterId: number;
  starterName: string;
  total_num: number;
  useTime: string;
  startTime: string;
  interfaceLog?: string;
  progress: number;
  interface_task_result_Id?: number;
  result?: 'SUCCESS' | 'ERROR';
  status: 'RUNNING' | 'OVER' | 'ERROR';
}

export interface IInterfaceTaskResult extends IBaseField {
  interfaceProjectId: number;
  interfacePartId: number;
  startBy: number;
  starterId: number;
  starterName: string;
  totalNumber: number;
  successNumber: number;
  failNumber: number;
  totalUseTime: string;
  start_time: string;
  end_time: string;
  taskId: number;
  taskUid: string;
  taskName: string;
  runDay: string;
  result?: 'SUCCESS' | 'FAIL';
  progress: number;
  status: 'RUNNING' | 'OVER';
}

interface IBase {
  id: React.Key;
  key?: string;
  value?: string;
  desc?: string;
}

export interface IInterface {
  id: number;
  uid: string;
  title: string;
  projectID: number;
  casePartID: number;
  create_time: string;
  update_time: string;
  creator: number;
  creatorName: string;
  updater: number;
  updaterName: string;
  responseTimeout: number;
  status: string;
  desc: string | undefined;
  level: 'P0' | 'P1' | 'P2';
  steps: ISteps[];
}

export interface ISteps {
  name: string;
  host: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  step: number;
  url: string;
  desc: string | undefined;
  headers: IHeaders[] | [];
  params: IParams[] | [];
  asserts: IAsserts[] | [];
  extracts: IExtracts[] | [];
  beforeParams: IBeforeParams[] | [];
  beforeVariable: IBeforeVariable[] | [];
  beforeFunc: any;
  afterFunc: any;
  bodyType: number;
  body: any;
}

export interface IParams extends IBase {}

export interface IFromData extends IBase {
  content_type?: string;
}

export interface IHeaders extends IBase {}

export interface IExtracts extends IBase {
  target?: string;
}

export interface IBeforeParams extends IBase {
  target?: string;
}

export interface IBeforeVariable extends IBase {}

export interface IAsserts {
  asserOpt?: string;
  expect?: any;
  extraOpt?: string;
  extraValue?: string;
  extraValueType?: string;
  result?: string;
  actual?: any;
  desc?: string;
  id: React.Key;
}

export interface ITryResponse {
  name: string;
  desc: string;
  request?: any;
  status: string;
  response: any;
  asserts: IAsserts[] | [];
  extracts: IExtracts[] | [];
  status_code: number;
  useTime: number;
}

export interface InterfaceResponse {
  id: number;
  uid: string;
  interfaceID: number;
  interfaceUid: string;
  interfaceName: string;
  interfaceDesc?: string;
  interfaceLog: string;
  interfaceSteps: number;
  interfaceErrorStep: number;
  starterID: number;
  starterName: string;
  status: string;
  create_time: string;
  update_time: string;
  startTime: string;
  useTime: string;
  resultInfo: ITryResponse[];
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

export interface IInterfaceTask {
  id: number;
  uid: string;
  title: string;
  switch: boolean;
  desc?: string;
  level: string;
  status: string;
  cron: string;
  interfaceNum: number;
  projectId: number;
  casePartId: number;
  interfaces: number[] | [];
  create_time: string;
  update_time: string;
  creatorName: string;
  creatorId: number;
  updaterName?: string;
  updaterId?: number;
  isSend: boolean;
  sendType?: number;
  sendKey?: string;
}
