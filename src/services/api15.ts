import { axiosPost, axiosGet } from "@/utils/request";

/** 1.5接口 */
export const api15 = `${$config?.api15}`;

/** 获取1.5警车 */
export const queryCar = <T>(data: T) => {
  const url = `${api15}/v2/gps/getCodeByGpsCar`;
  return axiosPost(url, data).then((res: any) => {
    return res?.status?.code === 200 ? res.data || [] : [];
  });
};

/** 获取警车警员 */
export const getCarDetail = (id: string) => {
  const url = `${api15}/XunTe/policeCarDetailsById`;
  return axiosGet(url, { id }).then((res: any) => {
    return res?.status?.code === 200 ? res.data || [] : [];
  });
};

/** 巡逻办任务巡区 */
export const getDutyArea = (data: any) => {
  const url = `${api15}/qz2tj/getDutyCarArea`;
  return axiosGet(url, data).then((res: any) => {
    return res?.msgCode === 200 ? res.data || [] : [];
  });
};

/** 巡逻办任务巡线 */
export const getDutyLine = (data: any) => {
  const url = `${api15}/qz2tj/getDutyCarLine`;
  return axiosGet(url, data).then((res: any) => {
    return res?.msgCode === 200 ? res.data || [] : [];
  });
};

/** 巡逻办任务点位 */
export const getDutyPoint = (data: any) => {
  const url = `${api15}/qz2tj/getDutyCarPoint`;
  return axiosGet(url, data).then((res: any) => {
    return res?.msgCode === 200 ? res.data || [] : [];
  });
};
