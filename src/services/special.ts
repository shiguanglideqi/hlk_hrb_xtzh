import { axiosPost, axiosGet } from "@/utils/request";
import { isObject } from "@vueuse/core";
/** 专题库 */
export const specialApi = `${$config?.api}/special`;

/** 获取自定义标签 */
export const getCustomTag = (idCard: string) => {
  const url = `${specialApi}/customTag/queryByIdCard/${idCard}`;
  return axiosGet(url).then((res) => {
    return res.data && res.data.length > 0
      ? { json: res.data?.[0]?.customTagJsonb, id: res.data?.[0]?.id }
      : undefined;
  });
};

/** 保存自定义标签 */
export const saveCustomTag = <T>(data: T) => {
  const url = `${specialApi}/customTag/saveOne`;
  return axiosPost(url, data).then((res) => {
    return res.data;
  });
};

/** 修改自定义标签 */
export const updateCustomTag = <T>(data: T) => {
  const url = `${specialApi}/customTag/updateById`;
  return axiosPost(url, data).then((res) => {
    return res.data;
  });
};

/** 根据key和类型查询二维码 */
export const creatQrcode = <T>(data: T) => {
  const url = `${specialApi}/qr/queryQrCodeByKey`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取警员详情 */
export const getPoliceInfo = <T>(data: T) => {
  const url = `${specialApi}/user/policeDutyDetails`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 根据警种和状态查询警员数量 */
export const queryPoliceNum = <T>(data: T) => {
  const url = `${specialApi}/user/policeClassificaCount`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/**
 * 删除对象空值
 * @param obj
 */
export const removeEmpty = (obj: any) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj[k] === "" || obj[k].length === 0) {
      // eslint-disable-next-line no-param-reassign
      delete obj[k];
    }
    if (isObject(obj[k])) {
      removeEmpty(obj[k]);
    }
  });
};

/** 删除参数空值 */
const handleParams = <T>(data: T) => {
  const newData = JSON.parse(JSON.stringify(data));
  removeEmpty(newData);
  return newData;
};
