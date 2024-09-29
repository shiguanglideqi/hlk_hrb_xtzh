import { axiosPost, axiosGet } from "@/utils/request";
import { MenuType } from "./types/common";

/** sso登录 */
export const login = (): Promise<any> => {
  const url = `${$config.api}/system/sso/login`;
  return axiosPost(url, {}).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};

/** 获取用户资源树 */
export const getResourceTree = (id: string): Promise<MenuType[]> => {
  const url = `${$config.api}/system/userResourceTree/${id}`;
  return axiosGet(url, {}).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};

/** 通过code 获取字典项 */
export const getDictByCode = async (code: string): Promise<Record<string, string>> => {
  const url = `${$config.api}/dictionary/getDictionaryListByCode/${code}`;
  return axiosGet(url, {}).then((res) => {
    return (res as unknown as Record<string, string>) ?? {};
  });
};

/** 获取指挥部类型 */
export const getZhbType = async (data: any): Promise<Record<string, string>> => {
  const url = `${$config.api}/ydhSecurity/pointDraw/selectZhbStatistics`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? (res.data ?? {}) : {};
  });
};

/** 获取指挥部列表 */
export const getZhbList = async (data: any): Promise<any[]> => {
  const url = `${$config.api}/ydhSecurity/pointDraw/selectZhbList`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? (res.data ?? []) : [];
  });
};

/** 通过code 获取字典项 */
export const getDict = async (type: string): Promise<any[]> => {
  const url = `${$config.api}/dictionary/list/page`;
  return axiosPost(url, {
    "pageIndex": 1,
    "pageSize": 1000,
    "parentCode": type,
    "appId": 0,
  }).then((res) => {
    return (res.data as any[]) ?? [];
  });
};
