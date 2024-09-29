import { axiosPost } from "@/utils/request";
import { ZdrData } from "./types/zdrtype";

/** 重点人 */
export const kpApi = `${$config?.api}/keyPerson`;

/** ZDR类型统计 */
export const getZdrTag = (): Promise<{ typeName: string; typeCount: number }[]> => {
  const url = `${kpApi}/aggregationTag`;
  return axiosPost(url, {}).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};

/** ZDR列表 */
export const getZdrList = <T>(data: T): Promise<ZdrData> => {
  const url = `${kpApi}/search`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};
