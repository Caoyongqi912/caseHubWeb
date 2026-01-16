import { IObjGet } from '@/api';
import { Send } from '@icon-park/react';
import { Tag } from 'antd';

let socketUrl = '';
if (process.env.NODE_ENV === 'development') {
  socketUrl = 'http://10.1.6.39:5050/';
} else {
  socketUrl = 'wss://aijia-test.5i5j.com/';
}
export { socketUrl };

export const ModuleEnum = {
  API: 1,
  API_CASE: 2,
  API_TASK: 3,

  UI_CASE: 4,
  UI_TASK: 5,
  UI_STEP: 6,
  UI_STEP_GROUP: 7,

  CASE: 8,
  JOB: 9,
};

export const CONFIG: IObjGet = {
  InterfaceCaseContentType: {
    1: { text: 'API', color: 'volcano' },
    2: { text: 'GROUP', color: 'cyan' },
    3: { text: 'IF', color: 'purple' },
    4: { text: 'SCRIPT' },
  },
  EXTRACT_TARGET_ENUM: {
    6: { text: 'Response.json' },
    8: { text: 'Response.text' },
    7: { text: 'Response.header' },
    9: { text: 'Request.cookie' },
  },
  API_CASE_ERROR_STOP_OPT: [
    { label: '是', value: 1 },
    { label: '否', value: 0 },
  ],
  API_STATUS: {
    200: { color: '#67C23A', text: 'OK' },
    401: { color: '#F56C6C', text: 'unauthorized' },
    400: { color: '#F56C6C', text: 'Bad Request' },
  },
  EXTRACT_RESPONSE_TARGET_ENUM: {
    1: { text: 'ResponseJson' },
    2: { text: 'ResponseHeader' },
    3: { text: 'BeforeScript' },
    4: { text: 'BeforeParams' },
    10: { text: 'BeforeSQL' },
    11: { text: 'CaseStep' },
    5: { text: 'AfterScript' },
    6: { text: 'ResponseJsonExtract' },
    7: { text: 'ResponseHeadExtract' },
    8: { text: 'ResponseTextExtract' },
    9: { text: 'RequestCookieExtract' },
  },
  API_LEVEL_SELECT: [
    {
      label: 'P1',
      value: 'P1',
    },
    {
      label: 'P2',
      value: 'P2',
    },
    {
      label: 'P3',
      value: 'P3',
    },
  ],
  API_STATUS_SELECT: [
    { label: '待调试', value: 'DEBUG' },
    { label: '正常', value: 'NORMAL' },
    { label: '关闭', value: 'CLOSE' },
  ],
  API_METHOD_ENUM: {
    GET: { text: 'GET', color: '#67C23A' },
    POST: { text: 'POST', color: '#e77316' },
    PUT: { text: 'PUT', color: '#e77316' },
    DELETE: { text: 'DELETE', color: '#fd3131' },
    // PATCH: 'PATCH',
    // HEAD: 'HEAD',
    // OPTIONS: 'OPTIONS',
    // TRACE: 'TRACE',
    // CONNECT: 'CONNECT',
  },
  API_LEVEL_ENUM: {
    P1: {
      text: 'P1',
      status: 'P1',
    },
    P2: {
      text: 'P2',
      status: 'P2',
    },
    P3: {
      text: 'P3',
      status: 'P3',
    },
    P0: {
      text: 'P0',
      status: 'P0',
    },
  },

  API_STATUS_ENUM: {
    DEBUG: { text: '待调试', tag: <Tag color={'processing'}>待调试</Tag> },
    NORMAL: { text: '正常', tag: <Tag color={'success'}>正常</Tag> },
    CLOSE: { text: '关闭', tag: <Tag color={'error'}>关闭</Tag> },
  },
  API_REQUEST_METHOD: [
    { label: <span style={{ color: 'green' }}>{'GET'}</span>, value: 'GET' },
    { label: <span style={{ color: 'orange' }}>{'POST'}</span>, value: 'POST' },
    { label: <span style={{ color: 'blue' }}>{'PUT'}</span>, value: 'PUT' },
    {
      label: <span style={{ color: 'red' }}>{'DELETE'}</span>,
      value: 'DELETE',
    },
  ],
  UI_LEVEL_ENUM: {
    P1: {
      text: 'P1',
    },
    P2: {
      text: 'P2',
    },
    P3: {
      text: 'P3',
    },
    P4: {
      text: 'P0',
    },
  },
  CASE_LEVEL_ENUM: {
    P1: {
      text: 'P1',
      value: 'P1',
    },
    P2: {
      text: 'P2',
      value: 'P2',
    },
    P3: {
      text: 'P3',
      value: 'P3',
    },
    P0: {
      text: 'P0',
      value: 'P0',
    },
  },
  UI_STATUS_ENUM: {
    RUNNING: { text: '运行中', tag: <Tag color={'orange'}>RUNNING</Tag> },
    DONE: { text: '测试完成', tag: <Tag color={'blue'}>DONE</Tag> },
  },
  UI_RESULT_ENUM: {
    SUCCESS: { text: 'SUCCESS', tag: <Tag color={'green'}>SUCCESS</Tag> },
    FAIL: { text: 'FAIL', tag: <Tag color={'red'}>FAIL</Tag> },
  },
  CASE_STATUS_ENUM: {
    DEBUG: {
      text: '待调试',
      status: 'DEBUG',
    },
    CLOSE: {
      text: '已停用',
      status: 'CLOSE',
    },
    NORMAL: {
      text: '正常',
      status: 'NORMAL',
    },
  },
  RENDER_CASE_STATUS: {
    DEBUG: {
      color: 'blue',
      text: '待调试',
    },
    CLOSE: {
      color: 'red',
      text: '已关闭',
    },
    NORMAL: {
      color: 'green',
      text: '正常',
    },
  },
  RENDER_CASE_LEVEL: {
    P0: {
      color: 'magenta',
      text: 'P0',
    },
    P1: {
      color: 'red',
      text: 'P1',
    },
    P2: {
      color: 'blue',
      text: 'P2',
    },
    P3: {
      color: 'green',
      text: 'P3',
    },
  },
  RENDER_CASE_TYPE: {
    1: {
      color: 'green',
      text: '普通用例',
    },
    0: {
      color: 'blue',
      text: '冒烟用例',
    },
  },
  // 用例状态
  CASE_STATUS: ['DEBUG', 'CLOSE', 'NORMAL'],
  CASESTATUS: {
    DEBUG: '待调试',
    CLOSE: '停用',
    NORMAL: '正常',
  },
  CASE_BADGE: {
    DEBUG: {
      status: 'processing',
      text: '调试中',
    },
    CLOSE: {
      status: 'error',
      text: '已停用',
    },
    NORMAL: {
      status: 'success',
      text: '正常',
    },
  },

  ASSERT_TYPE: {
    equal: '等于',
    not_equal: '不等于',
    in: '包含于',
    text_in: '文本包含于',
    not_in: '不包含于',
    text_not_in: '文本不包含于',
    contain: '包含',
    not_contain: '不包含',
    length_eq: '长度等于',
    length_lt: '长度小于',
    length_gt: '长度大于',
    length_le: '长度小于等于',
    length_ge: '长度大于等于',
    json_equal: 'JSON等于',
  },
  ASSERT_TYPE_TAG: {
    equal: <Tag color="success">等于</Tag>,
    not_equal: <Tag color="error">不等于</Tag>,
    in: <Tag color="pink">包含于</Tag>,
    not_in: <Tag color="blue">不包含于</Tag>,
    contain: <Tag color="purple">包含</Tag>,
    not_contain: <Tag color="orange">不包含</Tag>,
    length_eq: <Tag color="orange">长度等于</Tag>,
    length_lt: <Tag color="skyblue">长度小于</Tag>,
    length_gt: <Tag color="green">长度大于</Tag>,
    length_le: <Tag color="deeppink">长度小于等于</Tag>,
    length_ge: <Tag>长度大于等于</Tag>,
    json_equal: <Tag color="pink">JSON等于</Tag>,
    text_not_in: <Tag color="skyblue">文本不包含于</Tag>,
    text_in: <Tag color="orange">文本包含于</Tag>,
  },

  REQUEST_TYPE: {
    // 1: <TextIcon font={18} icon="icon-http3" text="HTTP"/>,
    HTTP: (
      <span>
        <Send theme="outline" size="14" fill="#7ed321" /> HTTP
      </span>
    ),
    HTTPS: (
      <span>
        <Send theme="outline" size="14" fill="#7ed321" /> HTTPS
      </span>
    ),
  },
  REQUEST_TYPE_TAG: {
    1: <Tag color="success">HTTP</Tag>,
    2: <Tag color="orange">GRPC</Tag>,
    3: <Tag color="blue">DUBBO</Tag>,
  },

  REQUEST_METHOD: {
    GET: <Tag color="success">GET</Tag>,
    POST: <Tag color="blue">POST</Tag>,
    PUT: <Tag color="cyan">PUT</Tag>,
    DELETE: <Tag color="error">DELETE</Tag>,
  },
  CASE_TAG: {
    P0: 'magenta',
    P1: 'red',
    P2: 'volcano',
    P3: 'orange',
    P4: 'green',
  },
  REPORT_MODE: {
    0: <Tag>普通</Tag>,
    1: <Tag color="blue">测试计划</Tag>,
    2: <Tag color="success">CI</Tag>,
    3: <Tag>其他</Tag>,
  },
  CASE_TYPE: {
    0: (
      <Tag color="success" style={{ marginLeft: 8 }}>
        普通
      </Tag>
    ),
    1: (
      <Tag color="blue" style={{ marginLeft: 8 }}>
        前置
      </Tag>
    ),
    2: (
      <Tag color="warning" style={{ marginLeft: 8 }}>
        数据工厂
      </Tag>
    ),
  },
  CASE_CONSTRUCTOR: {
    0: '测试用例',
    1: 'SQL语句',
    2: 'Redis命令',
    4: 'HTTP请求',
    3: 'Python方法',
  },
  CASE_CONSTRUCTOR_COLOR: {
    0: 'success',
    1: 'blue',
    2: 'error',
    3: 'warning',
    4: 'orange',
  },

  SQL_TYPE: {
    0: 'MySQL',
    1: 'Postgresql',
  },
  LAYOUT: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  SUB_LAYOUT: {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  },
  SWITCH_LAYOUT: {
    labelCol: { span: 16 },
    wrapperCol: { span: 8 },
  },
  SQL_LAYOUT: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  CONSTRUCTOR_TYPE: {
    0: '测试用例',
    1: 'SQL语句',
    2: 'Redis语句',
    4: 'HTTP请求',
    3: 'Python方法',
  },
  MSG_TYPE: {
    0: '邮件',
    1: '钉钉',
    2: '企业微信',
    3: '飞书',
  },
};
export const CaseContentType = {
  API: 1,
  GROUP: 2,
  CONDITION: 3,
  WAIT: 6,
  SCRIPT: 4,
  ASSERT: 8,
  DB: 5,
};
