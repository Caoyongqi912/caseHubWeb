export interface IObjGet {
  [key: string | number]: any;
}

interface IPageInfo {
  limit: number;
  page: number;
  pages: number;
  total: number;
}

interface IBaseField {
  id: number;
  uid: string;
  creator: number;
  creatorName: string;
  updater: number;
  updaterName: string;
  create_time: string;
  update_time: string;
}

export interface IResponse<T> {
  code: number;
  data: T;
  msg: string;
}

interface IPage<T> {
  items: T[] | [];
  pageInfo: IPageInfo;
}

export interface ISearch {
  params?: any;
  sort?: any;
}

export interface IUser {
  id: number;
  uid: string;
  username: string;
  isAdmin: boolean;
  email: string;
  phone: string;
  avatar?: string;
  gender?: string;
  tagName?: string;
  depart_id?: number;
  depart_name?: string;
}

export interface IEnv extends IBaseField {
  name: string;
  host: string;
  port: string | null;
  project_id: number;
}

export interface IProject {
  chargeId: number;
  chargeName: string;
  creatorId: number;
  creatorName: string;
  create_time: string;
  update_time: string;
  id: number;
  uid: string;
  title: string;
  description?: string | null;
}

export interface IUserVar {
  id: number;
  uid: string;
  key: string;
  value: string;
  description?: string;
  user_id: number;
  user_name: string;
}

export interface ILoginParams {
  username: string;
  password: string;
}

export interface IExtract {
  id?: number;
  key?: string;
  target?: string;
  val?: string;
}

export interface ICaseStepInfo {
  step: number | undefined;
  todo: string;
  exp: string;
}

export interface ICaseInfo {
  id: number;
  uid: string;
  projectID: number;
  casePartID: number;
  case_title: string;
  case_desc: string;
  case_info: ICaseStepInfo[];
  case_mark?: string;
  case_type: number;
  case_level: 'P1' | 'P2' | 'P3' | 'P4';
  creator: number;
  creatorName: string;
  updaterID?: number;
  updaterName?: string;
}

export interface IModule {
  key: number;
  title: string;
  parent_id: number;
  project_id: number;
  module_type: number;
  children_length?: number;
  children?: IModule[];
}

export interface IModuleEnum {
  title: string;
  value: number;
  children?: IModuleEnum[];
}
