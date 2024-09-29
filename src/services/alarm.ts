import { axiosPost } from "@/utils/request";
import { AlarmList, Datum } from "./types/alarmType.d";

/** 警情接口 */
export const alarmApi = `${$config?.api}/alarm`;

/** 警情查询 */
export const getAlarm = <T>(data: T, options: any = {}): Promise<AlarmList> => {
  const url = `${alarmApi}/search`;
  return axiosPost(url, data, { ...options }).then((res) => {
    return res?.code === 200 ? res?.data || {} : {};
  });
};

/** 警情分析标签 */
export const getTags = (): Promise<Datum[]> => {
  const url = `${alarmApi}/analysisTags`;
  return axiosPost(url, {}).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};
