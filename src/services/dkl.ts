import { axiosPost } from "@/utils/request";

/** 大客流接口 */
export const dklApi = `${$config?.api}/dkl`;

/** 获取警车打卡警员 */
export const getPoliceByCar = <T>(data: T) => {
  const url = `${dklApi}/qrcodeFactory/policeByCarNo`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res?.data || {} : {};
  });
};
