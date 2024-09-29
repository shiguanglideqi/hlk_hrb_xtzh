/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const { isCancel } = axios;
const instance: AxiosInstance = axios.create({
  timeout: 60000,
});

instance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("token");
    if (token && !request.headers.Authorization) {
      request.headers.Authorization = token;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response): any => {
    const { status, data, headers } = response;
    if (data.code === 408) {
      return;
    }
    if (status !== 200) {
      const errorText = codeMessage[status] || response.statusText;
      return Promise.reject(new Error(errorText));
    }
    if (response.data.error) {
      return Promise.reject(new Error(response.data.error));
    }

    return { data: response.data, headers };
  },
  (error) => {
    if (error.message?.includes("timeout")) {
      return Promise.reject(new Error("接口请求超时"));
    }

    if (error.message?.includes("Network Error")) {
      return Promise.reject(new Error("网络连接错误"));
    }

    if (isCancel(error)) {
      // 获取 取消请求 的相关信息
      return Promise.reject(new Error("取消请求"));
    } else {
      const { status } = error?.response;

      const errorText = error.response?.data?.error?.text
        ? error.response?.data?.error?.text
        : `${codeMessage[status]}[${status}]`;

      return Promise.reject(errorText);
    }
  },
);

interface IFCadeMessage {
  [key: number]: string;
}

interface Page {
  pageIndex: number;
  pageSize: number;
  totalRecord: number;
  totalPage: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IFAxiosResponse<T = any> {
  data: T;
  status?: number;
  statusText?: string;
  errorMessage?: string;
  message?: string;
  code?: number | string;
  page?: Page;
}

const codeMessage: IFCadeMessage = {
  200: "操作成功",
  401: "认证未通过",
  403: "资源未授权",
  404: "资源不存在",
  428: "参数缺失",
  500: "程序异常",
  503: "服务不可用，服务器暂时过载或维护",
};

/**
 * asios 实例
 */
export const request = (url: string, options = {}) => {
  return new Promise((resolve, reject) => {
    instance
      .request({
        url,
        ...options,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};

/**
 * get 请求
 * @param {string} url - 请求的接口
 * @param {Object} params - 请求的参数
 */
export const axiosGet = <T = any>(url: string, params = {}): Promise<IFAxiosResponse<T>> => {
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};

/**
 * post 请求
 * @param {string} url - 请求的接口
 * @param {Object} params - 请求的参数
 */
export const axiosPost = <T = any>(
  url: string,
  params?: any,
  options = {},
): Promise<IFAxiosResponse<T>> => {
  return new Promise((resolve, reject) => {
    instance
      .post(url, params, options)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};
/**
 * delete 请求
 * @param {string} url - 请求的接口
 * @param {Object} params - 请求的参数
 */
export const axiosDelete = <T = any>(url: string, params = {}): Promise<IFAxiosResponse<T>> => {
  return new Promise((resolve, reject) => {
    instance
      .delete(url, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};
/**
 * FormData上传
 * @param {string} url - 请求的接口
 * @param {Object} params - 参数为FormData
 */
export const axiosFormData = (url: string, params: FormData) => {
  return new Promise((resolve, reject) => {
    instance
      .post(url, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};

/**
 * post 请求
 * @param {string} url - 请求的接口
 * @param {Object} params - 请求的参数
 */
export const axiosPostH = <T = any>(
  url: string,
  params?: any,
  options = {},
): Promise<IFAxiosResponse<T>> => {
  return new Promise((resolve, reject) => {
    instance
      .post(url, params, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        // throw new Error(err)
      });
  });
};
