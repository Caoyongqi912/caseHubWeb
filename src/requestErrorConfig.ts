import { IResponse } from '@/api';
import { clearToken, getToken } from '@/utils/token';
import { history } from '@@/core/history';
import { RequestConfig } from '@@/plugin-request/request';
import { message } from 'antd';

const requestInterceptors = async (url: string, options: RequestConfig) => {
  const token = getToken();
  if (token !== null) {
    const authHeader = { Authorization: token };
    const BaseHeader = {
      'Content-Type': 'application/json',
    };
    return {
      url: `${url}`,
      options: {
        ...options,
        interceptors: true,
        headers: { ...authHeader, ...BaseHeader },
      },
    };
  }
  return {
    url: `${url}`,
    options: { ...options, interceptors: true },
  };
};
const loginPath = '/userLogin';

const isBlob = async (response: any) => {
  if (response.data instanceof Blob) {
    // RFC 5987 / RFC 6266: 优先认 `filename*=UTF-8''<urlencoded>`, 退化认 `filename="..."` 或 `filename=...`
    // 不认 RFC 5987 会导致 a.download = undefined, 浏览器兜底成 "undefined.xlsx"
    const contentDisposition = response.headers['content-disposition'];
    let finalFileName: string | undefined;
    if (contentDisposition) {
      const starMatch = contentDisposition.match(/filename\*=([^;]+)/i);
      if (starMatch) {
        const raw = starMatch[1].trim().replace(/^['"]|['"]$/g, '');
        // 形如 UTF-8''%E7%94%A8%E4%BE%8B...
        const m = raw.match(/^([^']*)'(.+)$/);
        if (m) {
          try {
            finalFileName = decodeURIComponent(m[2]);
          } catch {
            finalFileName = m[2];
          }
        } else {
          try {
            finalFileName = decodeURIComponent(raw);
          } catch {
            finalFileName = raw;
          }
        }
      } else {
        const normalMatch = contentDisposition.match(
          /filename=["']?([^";]+)["']?/i,
        );
        if (normalMatch) {
          finalFileName = decodeURIComponent(normalMatch[1].trim());
        }
      }
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
};

const responseInterceptors = async (response: any) => {
  const data = response.data;

  // blob 响应 (文件下载): isBlob 已经在内部触发浏览器下载, 这里**必须**提前 return.
  // 原因: blob 没有 .code 字段, 下面 if (data.code !== 0) 会因为 undefined !== 0 误判为业务错误,
  // 走 message.error(data.msg) 弹一个空 message. (用例导出 / 用例模板下载都撞过这个 bug.)
  if (data instanceof Blob) {
    await isBlob(response);
    return response;
  }

  if (data?.code !== 0) {
    console.log('responseInterceptors', data);
    message.error(data.msg);
    if (data.code === 4000) {
      clearToken();
      history.push(loginPath);
    }
  }
  return response;
};

export const errorConfig: RequestConfig = {
  // 统一的请求设定
  // timeout: 1000,
  // headers: {'X-Requested-With': 'XMLHttpRequest'},

  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res: IResponse<any>) => {
      const { code, data, msg } = res;
      console.log('errorThrower', res);
      if (code !== 0) {
        const error: any = new Error(msg);
        error.name = 'HubError';
        error.info = { code, msg, errorType: 2, data };
        console.log('throw', error);
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: async (error: any, opts: any) => {
      console.log('errorHandler', error);
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'HubError') {
        const errorInfo: IResponse<any> | undefined = error.info;
        console.log('==', errorInfo);

        if (errorInfo) {
          const { msg, code } = errorInfo;
          if (msg) {
            message.error(msg);
          }
        }
      } else if (error.response) {
        console.log('error.response', error.response);
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const data = error.response.data;
        if (data.msg) {
          message.error(`${data.msg}`);
        } else {
          message.error('Service Error');
        }
      } else if (error.request) {
        console.log('error.request', error.request);

        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        console.log('else');
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [requestInterceptors],

  // 响应拦截器
  responseInterceptors: [responseInterceptors],
};
