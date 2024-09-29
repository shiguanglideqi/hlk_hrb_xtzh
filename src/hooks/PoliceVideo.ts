/* eslint-disable @typescript-eslint/no-explicit-any */
import * as turf from "@turf/turf";
import { MapConfig } from "@/components/map/MapConfig";
import { openVideo } from "@/utils/monitorVideo";
import { useOrg, useUser } from "@/store";
import { getFollowTypeList, getNearEquip, getRule } from "@/services/patrol";
import { isVideoOnline } from "@/common/const";
import * as Tips from "./HoverTip";
import { EventData, MapEventType } from "@/components/map/minemap";

export const _traceConfig: MapSetting.RootObject = {
  /** 轨迹  */
  "source-trace": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "layer-track-line",
        type: "line",
        sort: 3,
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-width": 8,
          "line-color": "#03c670",
        },
      },
      {
        id: "layer-track-border",
        type: "line",
        sort: 2,
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 12,
          "line-translate-anchor": "viewport",
        },
      },
      {
        id: "layer-track-symbol",
        type: "symbol",
        sort: 1,
        layout: {
          visibility: "visible",
          "symbol-placement": "line",
          "symbol-spacing": 50,
          "icon-image": "arrow",
          "icon-size": 0.3,
        },
        paint: {
          "icon-opacity": 1,
        },
      },
    ],
  },
};

type CarType = { code: string; coord: any[] };

/** 调起周边监控 */
export const getSurroundVideo = async (lat: string, lng: string) => {
  try {
    const userStore = useUser();
    const orgStore = useOrg();
    const { user } = storeToRefs(userStore);
    const { orgCode } = storeToRefs(orgStore);
    const data = await getRule();

    const equips = await getNearEquip({
      lat: Number(lat),
      lng: Number(lng),
      distance: `${data?.circumstances?.range || 0}`,
      deptCode: orgCode.value,
      idCard: user.value?.idCard,
    });
    const cameraList = equips
      .filter((equip: { status: isVideoOnline }) => equip.status === isVideoOnline.Yes)
      .splice(0, 9)
      .map((equip: { deviceID: string; name: string }) => {
        return { cameraGBCode: equip.deviceID, cameraGBName: equip.name };
      });
    if (cameraList.length > 0) {
      openVideo(0, cameraList, 9);
    } else if (equips.length > 0 && cameraList.length === 0) {
      ElMessage({
        message: "没有可播放的在线监控!",
        type: "warning",
        offset: 92,
      });
    } else {
      ElMessage({
        message: "周边范围内没有监控!",
        type: "warning",
        offset: 92,
      });
    }
  } catch (error) {
    console.log("handleCircumStances", error);
  }
};

/** 警车警视 */
export function useJingShi() {
  const _config = new MapConfig();
  const { setTrace, clearTrace } = useTrace();

  const isAlert = ref(false);

  const policeCar = reactive<CarType>({
    code: "",
    coord: [],
  });

  const code = computed(() => policeCar.code);

  /**
   * 获取警车所在点的周边监控
   */
  const getJingShiVideo = () => {
    getSurroundVideo(`${policeCar.coord[1]}`, `${policeCar.coord[0]}`);
  };

  /**
   * 设置警视
   * @param code - 设备code
   * @param callBack 调用回调
   */
  const setJS = (device_code: string, callBack: (point: GeoJSON.Feature) => void) => {
    isAlert.value = !isAlert.value;
    if (isAlert.value) {
      policeCar.code = device_code;
      _config
        .getFeatureItem<GeoJSON.Point>("source-jyzbl_zj_jc", device_code)
        .then((point) => {
          policeCar.coord = [point.geometry?.coordinates[0], point.geometry?.coordinates[1]];
          getJingShiVideo();
          callBack && callBack(point);
          clearTrace();
          setTrace(device_code, "source-jyzbl_zj_jc", (to: GeoJSON.Feature<GeoJSON.Point>) => {
            const from = turf.point(policeCar.coord);
            const distance = turf.distance(from, to, { units: "meters" });
            // 当警车移动两个点距离小于50米 不调用周边监控
            if (distance > 50) {
              policeCar.coord = [to.geometry?.coordinates[0], to.geometry?.coordinates[1]];
              getJingShiVideo();
            }
          });
        })
        .catch(() => {
          ElMessage({
            message: "该设备暂无坐标，暂无法警视!",
            type: "warning",
            offset: 92,
          });
        });
    } else {
      policeCar.code = "";
      policeCar.coord = [];
      _config.setSource("source-trace", [], false);
      clearTrace();
    }
  };

  const close = () => {
    policeCar.code = "";
    policeCar.coord = [];
    isAlert.value = false;
    _config.setSource("source-trace", [], false);
    clearTrace();
  };

  return {
    /** 设备code */
    code,
    /** 是否正在调用警视 */
    isAlert,
    /** 设置警视 */
    setJS,
    /** 关闭警视 */
    close,
  };
}

export function useTrace() {
  const _config = new MapConfig();
  /** 轮询时间 */
  const interval = ref(5 * 1000);
  /** 是否跟踪 */
  const isTracking = ref(false);
  /** 跟踪的features */
  let features: GeoJSON.Position[] = [];
  /** 设备code */
  const code = computed(() => trace.id);
  /** 回调方法 */
  let callBackFn: any = null;
  const trace = reactive<{ id: string; sourceId: string }>({
    /** 设备code */
    id: "",
    /** 设备数据源id */
    sourceId: "",
  });
  /** 设置跟踪路线数据 */
  const setPathFeature = () => {
    if (isTracking.value) {
      _config
        .getFeatureItem<GeoJSON.Point>(trace.sourceId, trace.id)
        .then((point) => {
          if (features.length === 0) {
            features.push(point.geometry.coordinates);
            _config.position(point);
            callBackFn?.(point);
          } else {
            const feature = features?.[features?.length - 1];
            if (feature?.toString() !== point?.geometry.coordinates.toString()) {
              features.push(point.geometry.coordinates);
              _config._map?.panTo([point.geometry.coordinates[0], point.geometry.coordinates[1]]);
              callBackFn?.(point);
            }
          }
          return features;
        })
        .then((_features) => {
          if (_features.length > 1) {
            const linestring = turf.lineString(_features, {
              lineColour: "#FFAB32",
              lineType: 15,
            });
            _config.setSource("source-trace", [linestring], false);
          }
        });
    }
  };

  const { pause, resume } = useIntervalFn(
    () => {
      setPathFeature();
    },
    interval,
    {
      immediateCallback: true,
    },
  );

  onMounted(() => {
    pause();
    _config.loadFromJSON(_traceConfig);
  });

  tryOnBeforeUnmount(() => {
    _config.clearFromJSON(_traceConfig);
    clearTrace();
  });

  /**
   * 跟踪设备
   * @param code - 设备code
   * @param callBack 调用回调
   */
  const setTrace = (
    id: string,
    sourceId: string,
    callBack?: (point: GeoJSON.Feature<GeoJSON.Point>) => void,
  ) => {
    isTracking.value = !isTracking.value;
    callBackFn = callBack;
    if (isTracking.value) {
      trace.id = id;
      trace.sourceId = sourceId;
      resume();
    } else {
      _config.setSource("source-trace", [], false);
      clearTrace();
    }
  };

  const clearTrace = () => {
    pause();
    trace.id = "";
    trace.sourceId = "";
    features = [];
    callBackFn = null;
    isTracking.value = false;
  };

  return {
    code,
    isTracking,
    setTrace,
    clearTrace,
  };
}

export interface IFollowType {
  id?: string;
  typeName?: string;
}

/**
 * 获取关注分类列表
 * @params {string} type 分类名称
 */
export const useFollowType = (name?: string, type?: string) => {
  const userStore = useUser();
  const { user } = storeToRefs(userStore);

  const typeData = ref<IFollowType[]>([]);

  onMounted(() => {
    getFollowTypeList({ userId: user.value.idCard }).then((data) => {
      typeData.value = data || [];
      name && typeData.value.unshift({ id: type || "", typeName: name });
    });
  });

  return {
    typeData,
  };
};

/**
 * 纠偏点位位置
 *
 * @param {minemap.Map} map - 地图实例.
 * @param {pointCallback} callBack - 回调函数
 * @param {number[]} point - 回调返回的参数 坐标
 */
export function mapPointEdit(map: minemap.Map, callBack?: (point: number[]) => void): void {
  const canvas = map.getCanvasContainer();
  canvas.style.cursor = "crosshair";
  Tips.show("tie");
  /** 地图右键点击 */
  const onMapContextmenu = () => {
    canvas.style.cursor = "";
    Tips.hide();
    map.off("click", onMapClick);
  };

  const onMapClick = <T extends keyof MapEventType>(e: MapEventType[T] & EventData) => {
    const coords = e.lngLat;
    canvas.style.cursor = "";
    Tips.hide();
    callBack && callBack([coords.lng, coords.lat]);
  };

  map.once("click", onMapClick);

  map.once("contextmenu", onMapContextmenu);
}

export function fillBorder() {
  const SOURCEID = "RegionalDivisions-line-border";

  const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
  ];

  let step = 0;
  let _map: minemap.Map;
  let cacheRequest: number;

  const animateDashArray = (map: minemap.Map, timestamp: number) => {
    const newStep = parseInt(`${(timestamp / 50) % dashArraySequence.length}`, 10);
    if (newStep !== step) {
      map.getLayer(`${SOURCEID}-dashed`) &&
        map.setPaintProperty(`${SOURCEID}-dashed`, "line-dasharray", dashArraySequence[step]);
      step = newStep;
    }
    cacheRequest = requestAnimationFrame((_timestamp) => animateDashArray(map, _timestamp));
  };

  const setFillBorder = (map: minemap.Map, polygon: GeoJSON.Feature, color?: string) => {
    if (!map) return;
    _map = map;
    if (polygon.geometry.type === "MultiPolygon" || polygon.geometry.type === "Polygon") {
      const lineGeojson = turf.polygonToLine(polygon.geometry);

      const source = map.getSource(SOURCEID) as any;
      animateDashArray(map, 0);
      if (source) {
        source.setData(lineGeojson);
      } else {
        map.addSource(SOURCEID, {
          type: "geojson",
          data: lineGeojson,
        });
        map.addLayer({
          type: "line",
          source: SOURCEID,
          id: `${SOURCEID}-background`,
          paint: {
            "line-color": color || "yellow",
            "line-width": 4,
            "line-opacity": 0.4,
          },
        });

        map.addLayer({
          type: "line",
          source: SOURCEID,
          id: `${SOURCEID}-dashed`,
          paint: {
            "line-color": color || "yellow",
            "line-width": 4,
            "line-dasharray": [0, 4, 3],
          },
        });
      }
    }
  };

  const clearFillBorder = (map?: any) => {
    if (map) {
      _map = map;
    }
    if (_map?.getSource(SOURCEID)) _map?.removeSource(SOURCEID);
    if (_map?.getLayer(`${SOURCEID}-background`)) _map?.removeLayer(`${SOURCEID}-background`);
    if (_map?.getLayer(`${SOURCEID}-dashed`)) _map?.removeLayer(`${SOURCEID}-dashed`);
    cancelAnimationFrame(cacheRequest);
  };

  return {
    setFillBorder,
    clearFillBorder,
  };
}
