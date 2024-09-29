import { axiosGet, axiosPost } from "@/utils/request";
import { isObject } from "@vueuse/core";

/** 巡控 */
export const patrolApi = `${$config.patrolApi}`;

/** 资源管理-多方关注 */
export const batchFollowAdd = <T>(data: T) => {
  const url = `${patrolApi}/resource/batchFollowAdd`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 实时数据 图层-警用装备（警车，警务通，对讲机，记录仪） */
export const queryEquip = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/deviceGpsRealtimeMap`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};

/** 实时数据 图层-警员 */
export const queryPolice = <T>(data: T) => {
  const url = `${patrolApi}/resource/personGpsOnMap`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};

/** 图层-监控 */
export const queryVideo = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/onlineDeviceOnMap`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data || [] : [];
  });
};

/** 资源管理-多方关注修改 */
export const batchFollowUpdate = <T>(data: T) => {
  const url = `${patrolApi}/resource/batchFollowUpdate`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取兴趣热点列表 */
export const queryHotsPotsInterest = <T>(data: T, options = {}) => {
  const url = `${patrolApi}/resource/pointSmallList`;
  return axiosPost(url, data, options).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 处置力量点位 */
export const queryDisposalPowerPonint = <T>(data: T) => {
  const url = `${patrolApi}/resource/pointBigList`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询设备（警用）数量 */
export const queryEquipmentNum = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/deviceGpsRealtimeCount`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询设备（视频））数量 */
export const queryVideoEquipmentNum = <T>(data: T) => {
  const url = `${patrolApi}/resource/onlineDeviceCount`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 资源管理-获取警车绑定的摄像头 */
export const queryCarPlay = <T>(data: T) => {
  const url = `${patrolApi}/resource/carMappingDevice`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 警用装备详情 */
export const queryDeviceDetail = (id: string) => {
  const url = `${patrolApi}/personalPopWindows/queryGuardEquipmentDetail/${id}`;
  return axiosGet(url, {}).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};

/** 警车详情 */
export const queryPoliceCarDetail = (code: string) => {
  const url = `${patrolApi}/personalPopWindows/queryGuardEquipmentDetail/car`;
  return axiosGet(url, { deviceCode: code }).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};

/** 区域划分 */
export const getRegionList = <T>(data: T, options = {}) => {
  const url = `${patrolApi}/resource/areaSearchList`;
  return axiosPost(url, handleParams(data), options).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询设备（视频） */
export const searchVideoDetailList = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/onlineDeviceList`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 获取两点规划路线 */
export const getRoute = <T>(data: T) => {
  const url = `${patrolApi}/resource/policeNavigationRoute`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : {};
  });
};

/** 视频装备详情 */
export const queryVideoDetail = (id: string) => {
  const url = `${patrolApi}/personalPopWindows/queryVideoDetail/${id}`;
  return axiosGet(url, {}).then((res) => {
    return res?.code === 200 ? res.data || {} : {};
  });
};

/** 获取关注标签分类列表 */
export const getFollowTypeList = <T>(data: T) => {
  const url = `${patrolApi}/resourceManagement/followTag/list`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 资源管理-视频列表-纠编 */
export const postVideoCorrection = <T>(data: T) => {
  const url = `${patrolApi}/resource/onlineDeviceUpdate`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询设备（警用） */
export const queryEquipment = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/deviceGpsRealtimeTree`;
  return axiosPost(url, handleParams(data)).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 资源管理-警用装备列表-搜索 */
export const searchEquipment = <T>(data: T) => {
  const url = `${patrolApi}/resource/thread/deviceGpsRealtimeSearch`;
  return axiosPost(url, data).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 查询设备（视频） */
export const queryVideoEquipment = <T>(data: T, options = {}) => {
  const url = `${patrolApi}/resource/thread/onlineDeviceTree`;
  return axiosPost(url, handleParams(data), options).then((res) => {
    return res?.code === 200 ? res.data : [];
  });
};

/** 资源管理-查询是否被关注 */
export const queryFollow = <T>(data: T) => {
  const url = `${patrolApi}/resource/queryFollowByCode`;
  return axiosPost(url, data).then((res) => {
    return res.data;
  });
};

/** 获取功能配置 */
export const getRule = () => {
  const url = `${patrolApi}/configurationManage/findFunctionRule`;
  return axiosGet(url).then((res) => {
    return res?.code === 200 ? res?.data || {} : {};
  });
};

/** 获取兴趣热点周边监控 */
export const getNearEquip = <T>(data: T) => {
  const url = `${patrolApi}/resource/pointAroundEquip`;
  return axiosPost(url, data).then((res) => {
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
