/* eslint-disable no-param-reassign */
import * as turf from "@turf/turf";
import { queryPoint } from "@/services/map";
import { useOrg, useUser } from "@/store";
import { Dictionary, isVideoOnline } from "@/common/const";
import { PointType } from "@/common/map";
import { MapConfig } from "@/components/map/MapConfig";
import { getAlarm } from "@/services/alarm";
import { useTime } from "./useJq";
import { useCommonState } from "@/store/common";
import { queryCar } from "@/services/api15";
import { queryEquip, queryPolice, queryVideo } from "@/services/patrol";
import { Popup } from "@/modules/Popup";

/** 警员在线离线字典项 */
export const enum POLICE_DIC {
  /** 在线 */
  ON = "zgl_jystzt_kx",
  /** 离线 */
  OFF = "zgl_jystzt_lx",
}

/** 设置警员数据源 */
export function setPoliceData() {
  const configurator = new MapConfig();
  const store = useOrg();
  const mapState = useCommonState();
  const { orgCode } = storeToRefs(store);
  const { idCards } = storeToRefs(mapState);

  queryPolice({ deptCodeList: [orgCode.value] }).then((result) => {
    const list: GeoJSON.Feature[] = [];
    result.forEach((item: any) => {
      if (item.longitude && item.latitude) {
        const location = turf.point([item.longitude, item.latitude], {
          name: `${item?.userName}${item?.userNo ? `(${item.userNo})` : ""}`,
          imageName: `${item.isOnline === 1 ? POLICE_DIC.ON : POLICE_DIC.OFF}`,
          isOnline: item.isOnline === 1,
          subClass: item.policeClassification,
          category: item.policeCategory,
          deptCode: item.deptCode,
          userNo: item.userNo,
          type: Dictionary.POLICEKIND,
          popup: Popup.Police,
          id: item?.idCard,
          /** 设置135 显示的时间 */
          time: idCards.value[item?.idCard]?.text || "",
          tag: idCards.value[item?.idCard]?.img || "",
          /** end */
          key: 1000,
          userId: item?.userId,
          userName: item?.userName,
        });
        const options = { precision: 6, coordinates: 2 };
        const point = turf.truncate(location, options);
        list.push(point);
      }
    });
    configurator.setSource("source-police", list);
  });
}

/** 储存所有处警单位 */
const _orgCodes = new Set<string>([]);

/** 设置设备数据源 */
export function useDevice() {
  const store = useOrg();
  const { orgCode, orgCodes } = storeToRefs(store);
  const { getTime } = useTime();
  const userStore = useUser();
  const { user } = storeToRefs(userStore);
  /** 1.5 警车数据 */
  const carList = ref<any>([]);
  const setDeviceData = (prarmslist: string[]) => {
    const configurator = new MapConfig();
    queryEquip({
      deptCode: orgCode.value,
      deviceTypeList: [...prarmslist],
    }).then((result) => {
      const list: { [k: string]: GeoJSON.Feature[] } = {};
      result.forEach((item: any) => {
        const isHasCoord = [item.longitude, user.value.longitude].some((coord) => coord);
        if (!isHasCoord) return;
        const location = turf.point(
          [
            Number(item.longitude) || Number(user.value.longitude),
            Number(item.latitude) || Number(user.value.latitude),
          ],
          {
            name: item?.deviceName,
            imageName: getDeviceIconName(item.deviceType, item),
            type: item.deviceType,
            isOnline: Number(item.isOnline) === 1,
            id: item?.deviceCode,
            popup: item.deviceSonType === Dictionary.POLICECAR ? Popup.PoliceCar : Popup.Device,
            layer: `layer-${item.deviceType}-uncluster`,
            deviceSonType: item?.deviceSonType,
            key: 1000,
          },
        );
        const point = turf.truncate(location, { precision: 6, coordinates: 2 });
        const deviceType =
          item.deviceSonType === Dictionary.POLICECAR ? item.deviceSonType : item.deviceType;
        if (deviceType === Dictionary.POLICECAR) {
          setCarPolice(point, item.deptCode);
        }
        if (!list[deviceType]) {
          list[deviceType] = [];
        }
        list[deviceType].push(point);
      });
      Object.keys(list).forEach((key) => {
        configurator.setSource(`source-${key}`, list[key]);
      });
    });
  };

  /** 设置警车内警员 */
  const setCarPolice = (point: GeoJSON.Feature<GeoJSON.Point>, code: string) => {
    const polices = carList.value?.features?.find(
      (v: any) => v?.properties?.device_code === point.properties?.id,
    );

    if (polices && polices?.properties?.policeList.length > 0) {
      if (point.properties) {
        point.properties.status = `p${_orgCodes.has(code) ? 2 : 1}`;
        point.properties.on = "1";
      }
    }
  };

  /** 获取1.5警车内警员 */
  const getCarWithPolice = () => {
    queryCar({
      orgCodes: orgCodes.value,
    }).then((res) => {
      carList.value = res;
    });
  };

  /** 获取警情的组织机构 */
  const getAlarmOrg = () => {
    const { startTime, endTime } = getTime();
    getAlarm({
      es: startTime,
      // es: "2023-01-01 00:00:00",
      ef: endTime,
      // ef: "2024-07-01 00:00:00",
      status: ["10", "20", "30", "40", "50"],
      level: [],
      orgCode: orgCode.value,
      size: 100000,
    }).then((res) => {
      _orgCodes.clear();
      res.data.forEach((data) => {
        data.cdCodes.map((v) => _orgCodes.add(v));
      });
    });
  };

  /** 获取警车状态 是否处警 */
  const getStatus = (code: string) => {
    return _orgCodes.has(code)
      ? { text: "处警中", color: "green" }
      : { text: "巡逻中", color: "blue" };
  };

  return {
    setDeviceData,
    getCarWithPolice,
    getAlarmOrg,
    getStatus,
  };
}

/** 获取图标 */
const getDeviceIconName = (device_type: string, item: Record<string, any>) => {
  if (device_type === Dictionary.VEHICLE) {
    const info = JSON.parse(item.deviceInfo);
    return `${item?.deviceSonType}-${info?.category}-${info?.category}_${
      item.isOnline === 1 ? "zbstzt_kx" : "zbstzt_lx"
    }`;
  } else if (device_type === Dictionary.INTERCOM || device_type === Dictionary.RECORDER) {
    return `${item.deviceType}-${item?.deviceSonType}-${item.deviceType}_${
      item.isOnline === 1 ? "zbstzt_zx" : "zbstzt_lx"
    }`;
  } else {
    return `${item.deviceType}-${item?.deviceSonType}-${item.deviceType}_${
      item.isOnline === 1 ? "zbstzt_kx" : "zbstzt_lx"
    }`;
  }
};

/** 视频在线离线字典项 */
export const enum VIDEO_DIC {
  /** 在线 */
  ON = "jyzbl_jk_zbstzt_zx",
  /** 离线 */
  OFF = "jyzbl_jk_zbstzt_lx",
}

/** 设置监控数据源 */
export const setVideoData = () => {
  const configurator = new MapConfig();
  const store = useOrg();
  const { orgCode } = storeToRefs(store);

  queryVideo({
    deptCode: orgCode.value,
    sonTypeParent: Dictionary.MONITOR_TYPE,
    deviceType: "jyzbl_jk",
  }).then((result) => {
    const list: GeoJSON.Feature[] = [];
    result.forEach((item: any) => {
      if (Number(item.lat) && Number(item.lng)) {
        const location = turf.point([Number(item.lng), Number(item.lat)], {
          name: item?.name,
          imageName: `jyzbl_jk-${item?.deviceSonType}-${
            item.status === isVideoOnline.Yes ? VIDEO_DIC.ON : VIDEO_DIC.OFF
          }`,
          type: Dictionary.MONITOR_TYPE,
          isOnline: item.status === isVideoOnline.Yes,
          id: item?.deviceId,
          popup: Popup.Device,
          subClass: item?.deviceSonType,
          layer: "layer-jyzbl_jk_jklx-uncluster",
          key: 1000,
        });
        const option = { precision: 6, coordinates: 2 };
        const point = turf.truncate(location, option);
        list.push(point);
      }
    });
    configurator.setSource("source-jyzbl_jk_jklx", list);
  });
};

/** 设置兴趣点位数据源 */
export const setInterestPointData = () => {
  const configurator = new MapConfig();
  const store = useOrg();
  const { orgCode } = storeToRefs(store);
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.ZDCS],
  }).then((result) => {
    const list: GeoJSON.Feature[] = [];
    result.forEach((item: any) => {
      if (item.point) {
        const feature: GeoJSON.Feature = turf.feature(JSON.parse((item.point as string) || ""), {
          name: item.pointName,
          id: item.id,
          imageName: `${item.pointBigType}-${item.pointSmallType}`,
          layer: "layer-interest-point",
          bigType: item.pointBigType,
          subClass: item.pointSmallType,
          popup: Popup.Point,
          key: 1000,
        });
        list.push(feature);
      }
      if (item.pointRange) {
        const feature: GeoJSON.Feature = turf.feature(
          JSON.parse((item.pointRange as string) || ""),
          {
            lineColour: item.lineColour || "#409EFF",
            lineType: item.lineType || 1,
            areaColour: item.areaColour || "#409EFF",
            popup: Popup.Point,
            id: item.id,
            bigType: item.pointBigType,
            subClass: item.pointSmallType,
          },
        );
        list.push(feature);
      }
    });
    configurator.setSource("source-interest-point", list);
  });
};
