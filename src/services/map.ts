import { axiosPost } from "@/utils/request";

/** 地图服务 */
export const mapApi = `${$config.api}/map`;

/** 图层-处置力量/兴趣热点 */
export const queryPoint = <T>(data: T) => {
  const url = `${mapApi}/point/pointListOnMapAll`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};

/** 获取点完分类列表 */
export const getTypeList = <T>(data: T) => {
  const url = `${mapApi}/icon/list`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取兴趣热点各分类数量 */
export const queryHotsPotsInterestNum = <T>(data: T, options = {}) => {
  const url = `${mapApi}/point/thread/pointSmallCount`;
  return axiosPost(url, data, options).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询点位树列表 */
export const getPointList = <T>(data: T) => {
  const url = `${mapApi}/point/pointBigTree`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询组织机构列表 */
export const getOrgList = <T>(data: T) => {
  const url = `${mapApi}/orgaize/list`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取防控圈 */
export const setShangKa = <T>(data: T) => {
  const url = `${mapApi}/defenseCircle/load`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 防控圈 */
export const getDefenseCircle = <T>(data: T) => {
  const url = `${mapApi}/defenseCircle/list`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取大类数量 */
export const getPointBigCount = <T>(data: T) => {
  const url = `${mapApi}/point/pointBigCount`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取区域数量 */
export const getAreaCount = <T>(data: T) => {
  const url = `${mapApi}/area/areaCount`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 图层-社区、辖区 */
export const queryArea = <T>(data: T) => {
  const url = `${mapApi}/area/areaListOnMapAll`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};
